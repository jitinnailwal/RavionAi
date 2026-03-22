import express from "express";
import { protect } from "../middlewares/auth.js";
import { oneAtATime } from "../middlewares/rateLimit.js";
import { imageMessageController, textMessageController, togglePublishController } from "../controllers/messageController.js";

const messageRouter = express.Router()

messageRouter.post('/text', protect, oneAtATime, textMessageController)
messageRouter.post('/image', protect, oneAtATime, imageMessageController)
messageRouter.post('/toggle-publish', protect, togglePublishController)

export default messageRouter
