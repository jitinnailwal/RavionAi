import User from "../models/user.js";
import jwt from 'jsonwebtoken'
import bcrypt from "bcryptjs";
import Chat from "../models/Chat.js";
import imagekit from "../configs/imageKit.js";

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
}

// API to register user
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExits = await User.findOne({ email })

        if (userExits) {
            return res.json({ success: false, message: "User already exits" })
        }

        const user = await User.create({ name, email, password })

        const token = generateToken(user._id)
        res.json({ success: true, token })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}


//Api to login user
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email })
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password)

            if (isMatch) {
                const token = generateToken(user._id);
                return res.json({ success: true, token })
            }
        }
        return res.json({ success: false, message: "Invalid email or password" })
    } catch (error) {
        return res.json({success: false, message: error.message})
    }

}

// API to get user data
export const getUser = async(req, res) =>{
    try {
        const user= req.user
        return res.json({success: true, user})
    } catch (error) { 
        return res.json({success: false, message: error.message })
    }
}

//api to get published images

// API to update user profile
export const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName } = req.body;
        const user = req.user;

        const updateData = {};
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;

        // Update the display name as well
        if (firstName !== undefined || lastName !== undefined) {
            const newFirst = firstName !== undefined ? firstName : user.firstName || '';
            const newLast = lastName !== undefined ? lastName : user.lastName || '';
            updateData.name = `${newFirst} ${newLast}`.trim() || user.name;
        }

        await User.findByIdAndUpdate(user._id, updateData);
        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// API to change password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: 'Current password is incorrect' });
        }

        if (newPassword.length < 6) {
            return res.json({ success: false, message: 'New password must be at least 6 characters' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// API to upload profile picture
export const uploadProfilePicture = async (req, res) => {
    try {
        const { imageBase64 } = req.body;
        if (!imageBase64) {
            return res.json({ success: false, message: 'No image provided' });
        }

        const result = await imagekit.upload({
            file: imageBase64,
            fileName: `profile_${req.user._id}_${Date.now()}`,
            folder: '/profile_pictures',
        });

        await User.findByIdAndUpdate(req.user._id, { profilePicture: result.url });
        res.json({ success: true, url: result.url, message: 'Profile picture updated' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

//api to get published images

export const getPublishedImages = async(req,res) => {
    try {
        const publishedImageMessages = await Chat.aggregate([
            {$unwind: "$messages"},
            {
                $match: {
                    "messages.isImage": true,
                    "messages.isPublished": true,
                }
            },
            {
                $project: {
                    _id: 0,
                    imageUrl: "$messages.content",
                    userName: "$userName" 
                }
            }
        ])

        res.json({success: true, images: publishedImageMessages.reverse()})
    } catch (error) {
        res.json({success: false, message: error.message})
    }   
}
