import mongoose, {Schema, Document} from "mongoose";

export interface Message extends Document{
    content: string;
    createdAt: Date;
}

// This is msg Schema and hare we its types as Message which is an interfaace

const MessageSchema: Schema<Message> = new Schema({
    content: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
})

export interface User extends Document{
    username: string;
    email: string;
    password: string;
    verifyCode: string;
    verifyCodeExpiry: Date;
    isVerified: boolean;
    isAcceptingMessage: boolean;
    messages: Message[]
}

// This is user Schema and hare we its types as Message which is an interfaace

const UserSchema: Schema<User> = new Schema({
    username: {
        type: String,
        required: [true, "Username is requied"],
        trim: true,
        // unique: [true, "please give a unique username"]
        unique: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        match: [/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, 'Please give a valid email address' ] //It's called regex
    },
    password: {
        type: String,
        required: [true, "Password is requied"],
        // match: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Please give a string password']    //It's calles regex
    },
    verifyCode: {
        type: String,
        required: [true, "verify code id required"]
    },
    verifyCodeExpiry:{
        type: Date,
        required: [true, "Verify code expiry is required"]
    },
    isVerified:{
        type : Boolean,
        default: false
    },
    isAcceptingMessage:{
        type: Boolean,
        default: true
    },
    messages: [MessageSchema]
})

// Thre are two ways to export the model. The logic is 
// 1. If the model is already created then export it.
// 2. If the model is not created then create it and export it.

const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", UserSchema);

export default UserModel;