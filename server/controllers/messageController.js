import axios from "axios"
import Chat from "../models/Chat.js"
import User from "../models/user.js"
import imagekit from "../configs/imageKit.js"
import ai from "../configs/openai.js"

const callGemini = async (prompt) => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    return response.text;
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

// Image Generation message controller
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

        const encodedPrompt = encodeURIComponent(prompt)
        const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/ravionai/${Date.now()}.png?tr=w-800,h-800`;

        const aiImageResponse = await axios.get(generatedImageUrl, { responseType: "arraybuffer" })

        const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data, "binary").toString('base64')}`;

        const uploadResponse = await imagekit.upload({
            file: base64Image,
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

        res.json({ success: false, message: error.message || "Something went wrong" })
    }
}
