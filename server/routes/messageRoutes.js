import express from "express";
import { protect } from "../middlewares/auth.js";
import { oneAtATime } from "../middlewares/rateLimit.js";
import { imageMessageController, textMessageController } from "../controllers/messageController.js";

const messageRouter = express.Router()

messageRouter.post('/text', protect, oneAtATime, textMessageController)
messageRouter.post('/image', protect, oneAtATime, imageMessageController)

export default messageRouter
