// Per-user rate limiter — allows 1 request at a time per user for message endpoints.
// If a user already has a request in-flight, subsequent requests are rejected instantly.

const activeRequests = new Map() // userId -> true

export const oneAtATime = (req, res, next) => {
    const userId = req.user?._id?.toString()
    if (!userId) return next()

    if (activeRequests.has(userId)) {
        return res.json({
            success: false,
            message: "Please wait for the current response before sending another message"
        })
    }

    activeRequests.set(userId, true)

    // Clean up when the response finishes (success or error)
    const cleanup = () => activeRequests.delete(userId)
    res.on('finish', cleanup)
    res.on('close', cleanup)

    next()
}
