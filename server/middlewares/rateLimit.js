import mongoose from "mongoose"

// MongoDB-based lock — works across Vercel serverless instances.
// Only 1 Gemini request per user at a time.
const lockSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now, expires: 120 } // auto-expire after 2min (safety net)
})

const Lock = mongoose.models.Lock || mongoose.model("Lock", lockSchema)

export const oneAtATime = async (req, res, next) => {
    const userId = req.user?._id?.toString()
    if (!userId) return next()

    try {
        // Try to insert a lock — fails if one already exists for this user
        await Lock.create({ userId })
    } catch (err) {
        if (err.code === 11000) {
            // Duplicate key = user already has an active request
            return res.json({
                success: false,
                message: "Please wait for the current response before sending another message"
            })
        }
        // Some other DB error — let the request through rather than blocking
        return next()
    }

    // Clean up lock when the response finishes
    const cleanup = () => Lock.deleteOne({ userId }).catch(() => {})
    res.on('finish', cleanup)
    res.on('close', cleanup)

    next()
}
