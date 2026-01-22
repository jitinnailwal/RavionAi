import Chat from "../models/Chat.js";
import User from "../models/user.js"; 
import mongoose from "mongoose";


 // Costs
 
const CHAT_COST = 1;
const IMAGE_COST = 2;


 // Create a new chat — atomically consumes 1 credit.
 
export const createChat = async (req, res) => {
  try {
    const userId = req.user._id;

    // Try to atomically decrement credits by CHAT_COST only if user has enough credits.
    
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, credits: { $gte: CHAT_COST } },
      { $inc: { credits: -CHAT_COST } },
      { new: true }
    ).select("credits");

    if (!updatedUser) {
      return res.status(402).json({ success: false, message: "Insufficient credits. Please purchase more credits." });
    }

    const chatData = {
      userId,
      messages: [],
      name: "New Chat",
      userName: req.user.name,
    };

    await Chat.create(chatData);

    return res.json({
      success: true,
      message: "Chat created",
      credits: updatedUser.credits, // return new balance so client can update UI
    });
  } catch (error) {
    console.error("createChat error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


 // Get all chats for the user. Also returns the user's credits.
 
export const getChat = async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({ userId }).sort({ updatedAt: -1 });

    // fetch user's credits 
    const user = await User.findById(userId).select("credits");
    const credits = user ? user.credits : 0;

    return res.json({ success: true, chats, credits });
  } catch (error) {
    console.error("getChat error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


 // Delete chat .
 
export const deleteChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId } = req.body;

    await Chat.deleteOne({ _id: chatId, userId });

    return res.json({ success: true, message: "Chat Deleted" });
  } catch (error) {
    console.error("deleteChat error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


  //Example: Generate Image consumes IMAGE_COST credits automically.

 
export const generateImage = async (req, res) => {
  try {
    const userId = req.user._id;

    // Atomically decrement credits by IMAGE_COST only if enough credits present
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, credits: { $gte: IMAGE_COST } },
      { $inc: { credits: -IMAGE_COST } },
      { new: true }
    ).select("credits");

    if (!updatedUser) {
      return res.status(402).json({ success: false, message: "Insufficient credits for image generation." });
    }

    // image-generation logic here 
 
    return res.json({
      success: true,
      message: "Image generation started/succeeded ()",
      credits: updatedUser.credits,
      
    });
  } catch (error) {
    console.error("generateImage error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
