import mongoose from "mongoose";
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    firstName: {type: String, default: ''},
    lastName: {type: String, default: ''},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    credits: {type: Number, default: 2},
    profilePicture: {type: String, default: ''},
})

// encrypt pass before save in database

userSchema.pre('save', async function (next) {
    if(!this.isModified('password')){
        return next()
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next();
})

const User = mongoose.model('user', userSchema);

export default User;