import jwt from 'jsonwebtoken'
import User from '../models/user.js';

export const protect = async (req, res, next) => {
    let token = req.headers.authorization;

    // Handle "Bearer <token>" format
    if (token && token.startsWith('Bearer ')) {
        token = token.slice(7);
    }

    if (!token) {
        return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const userId = decoded.id;

        const user = await User.findById(userId)

        if (!user) {
            return res.status(401).json({ success: false, message: "Not authorized, user not found" });
        }

        req.user = user;
        next()
    } catch (error) {
        console.error("Auth error:", error.message)
        res.status(401).json({ success: false, message: "Not authorized, invalid token" })
    }
} 