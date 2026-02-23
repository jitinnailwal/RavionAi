import express from 'express';
import { getPublishedImages, getUser, loginUser, registerUser, updateProfile, changePassword, uploadProfilePicture } from '../controllers/userController.js';
import { protect } from '../middlewares/auth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.get('/data',protect, getUser)
userRouter.get('/published-images', getPublishedImages)
userRouter.put('/update-profile', protect, updateProfile)
userRouter.put('/change-password', protect, changePassword)
userRouter.put('/upload-picture', protect, uploadProfilePicture)


export default userRouter;