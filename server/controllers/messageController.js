import axios from "axios"
import Chat from "../models/Chat.js"
import User from "../models/user.js"
import imagekit from "../configs/imageKit.js"
import ai from "../configs/openai.js"

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const callGemini = async (prompt, retries = 3) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            });
            return response.text;
        } catch (error) {
            const is429 = error?.status === 429 || error?.httpStatusCode === 429 ||
                error?.code === 'RESOURCE_EXHAUSTED'
            if (is429 && attempt < retries) {
                // Wait longer each retry: 3s, 6s, 12s
                await sleep(3000 * Math.pow(2, attempt))
                continue
            }
            throw error
        }
    }
}

export const textMessageController = async (req, res) => {
    try {
        const userId = req.user._id

        // Check credits
        if (req.user.credits < 1) {
            return res.json({ success: false, message: "You don't have enough credit to use this feature" })
        }

        const { chatId, prompt } = req.body

        if (!chatId || !prompt) {
            return res.json({ success: false, message: "Chat ID and prompt are required" })
        }

        // Atomically deduct credit BEFORE calling the API to prevent race conditions
        const creditResult = await User.findOneAndUpdate(
            { _id: userId, credits: { $gte: 1 } },
            { $inc: { credits: -1 } },
            { new: true }
        )

        if (!creditResult) {
            return res.json({ success: false, message: "You don't have enough credit to use this feature" })
        }

        const chat = await Chat.findOne({ userId, _id: chatId })
        if (!chat) {
            // Refund credit if chat not found
            await User.updateOne({ _id: userId }, { $inc: { credits: 1 } })
            return res.json({ success: false, message: "Chat not found" })
        }

        chat.messages.push({ role: "user", content: prompt, timestamp: Date.now(), isImage: false })

        const text = await callGemini(prompt);

        const reply = { role: "assistant", content: text, timestamp: Date.now(), isImage: false }

        chat.messages.push(reply)
        await chat.save()

        res.json({ success: true, reply })

    } catch (error) {
        console.error("Gemini API Error:", error.message);
        console.error("Error details:", error?.status, error?.httpStatusCode, error?.code);

        // Refund credit on API failure
        try {
            await User.updateOne({ _id: req.user._id }, { $inc: { credits: 1 } })
        } catch (refundError) {
            console.error("Credit refund failed:", refundError.message)
        }

        const errMsg = error?.errorDetails?.[0]?.message || error?.message || "Something went wrong"
        console.error("Full error object:", JSON.stringify(error, null, 2));

        res.json({ success: false, message: errMsg })
    }
}

// Image Generation message controller (Cloudflare Workers AI - FLUX.1 Schnell)
export const imageMessageController = async (req, res) => {
    try {
        const userId = req.user._id;

        // Check credits
        if (req.user.credits < 2) {
            return res.json({ success: false, message: "You don't have enough credits to use this feature" })
        }

        const { prompt, chatId, isPublished } = req.body

        if (!chatId || !prompt) {
            return res.json({ success: false, message: "Chat ID and prompt are required" })
        }

        // Atomically deduct credits BEFORE calling the API
        const creditResult = await User.findOneAndUpdate(
            { _id: userId, credits: { $gte: 2 } },
            { $inc: { credits: -2 } },
            { new: true }
        )

        if (!creditResult) {
            return res.json({ success: false, message: "You don't have enough credits to use this feature" })
        }

        const chat = await Chat.findOne({ userId, _id: chatId })
        if (!chat) {
            await User.updateOne({ _id: userId }, { $inc: { credits: 2 } })
            return res.json({ success: false, message: "Chat not found" })
        }

        chat.messages.push({
            role: "user",
            content: prompt,
            timestamp: Date.now(),
            isImage: false
        });

        // Generate image via Cloudflare Workers AI (FLUX.1 Schnell)
        const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID
        const cfApiToken = process.env.CLOUDFLARE_API_TOKEN

        if (!cfAccountId || !cfApiToken) {
            console.error("Missing Cloudflare credentials. CLOUDFLARE_ACCOUNT_ID:", !!cfAccountId, "CLOUDFLARE_API_TOKEN:", !!cfApiToken)
            throw new Error("Image generation is not configured. Missing Cloudflare credentials.")
        }

        const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`
        console.log("Calling Cloudflare AI with prompt:", prompt.substring(0, 100))

        let cfRes
        const cfBody = { prompt, steps: 4 }
        const cfConfig = {
            headers: {
                Authorization: `Bearer ${cfApiToken}`,
                "Content-Type": "application/json",
            },
            timeout: 50000,
            maxContentLength: 10 * 1024 * 1024,
            maxBodyLength: 10 * 1024 * 1024,
        }

        // Retry up to 2 times on 500 errors (Cloudflare can be flaky from serverless IPs)
        for (let attempt = 0; attempt <= 2; attempt++) {
            try {
                cfRes = await axios.post(cfUrl, cfBody, cfConfig)
                break
            } catch (cfError) {
                const status = cfError?.response?.status
                console.error(`Cloudflare attempt ${attempt + 1} failed:`, cfError.message, "| status:", status)
                console.error("Cloudflare response data:", JSON.stringify(cfError?.response?.data))
                if (status === 500 && attempt < 2) {
                    console.log("Retrying Cloudflare in 2s...")
                    await sleep(2000)
                    continue
                }
                throw new Error("Image generation failed. Please try again.")
            }
        }

        console.log("Cloudflare response status:", cfRes.status)
        console.log("Cloudflare response keys:", JSON.stringify(Object.keys(cfRes.data || {})))

        const b64 = cfRes.data?.result?.image
        if (!b64) {
            console.error("No image in Cloudflare response. Full response:", JSON.stringify(cfRes.data).substring(0, 500))
            throw new Error("No image was generated. Try a different prompt.")
        }

        console.log("Cloudflare image received, size:", b64.length, "chars")

        // Upload to ImageKit for persistent hosting (keeps MongoDB docs small)
        const uploadResponse = await imagekit.upload({
            file: `data:image/png;base64,${b64}`,
            fileName: `${Date.now()}.png`,
            folder: "ravionai"
        })

        const reply = {
            role: 'assistant',
            content: uploadResponse.url,
            timestamp: Date.now(),
            isImage: true,
            isPublished
        }

        chat.messages.push(reply)
        await chat.save()

        res.json({ success: true, reply })

    } catch (error) {
        console.error("Image Generation Error:", error.message);

        // Refund credits on failure
        try {
            await User.updateOne({ _id: req.user._id }, { $inc: { credits: 2 } })
        } catch (refundError) {
            console.error("Credit refund failed:", refundError.message)
        }

        res.json({ success: false, message: error?.message || "Something went wrong" })
    }
}
