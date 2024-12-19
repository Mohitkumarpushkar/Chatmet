import User from "../models/UserModel.js";
import Message from "../models/MessageModel.js";
import cloudinary from '../lib/cloudnary.js'
import { getReceiverSocketId,io } from "../lib/socket.js";
export const getUsersForSidebar=async(req,res)=>{
try {
    const loggedInUserId=req.user._id;
    const filteredUsers=await User.find({_id:{$ne:loggedInUserId}}).select("-password");
    res.status(200).json(filteredUsers);
} catch (error) {
    console.log("error in getting users",error.message);
    res.status(500).json({message:"internal server error"});
}
};

export const getMessages = async(req, res)=>{
try {
    const {id:userToChatId}=req.params;
    const myId=req.user._id;
    const messages=await Message.find({
        $or:[
            {senderId:myId,receiverId:userToChatId},
            {senderId:userToChatId,receiverId:myId}
        ],
    });
    res.status(200).json(messages);
    
} catch (error) {
    console.log("error in getting messages",error.message);
    res.status(500).json({message:"internal server error"});
    
}
}

export const sendMessage = async(req, res)=>{
    try {
        const {text,image}=req.body;
        const{id:receiverId}=req.params;
        const senderId=req.user._id;

        let imageUrl;
        if(image){
            const uploadResponse=await cloudinary.uploader.upload(image);
            imageUrl=uploadResponse.secure_url;
        }
        const newMessage=new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl
        });
        await newMessage.save();
        // real time functionality using socket.io
const receiveSocketId=getReceiverSocketId(receiverId);
if(receiveSocketId){
    io.to(receiveSocketId).emit("newMessage",newMessage);
 
}
        
        res.status(201).json(newMessage);
        
    } catch (error) {
        console.log("error in sending message",error.message);
        res.status(500).json({message:"internal server error"});
        
    }
};
