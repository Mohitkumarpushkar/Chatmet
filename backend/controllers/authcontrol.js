import User from '../models/UserModel.js';
import UserModel from '../models/UserModel.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../lib/util.js';
import cloudinary from '../lib/cloudnary.js';

// signup route
export const signup=async(req,res)=>{
 const {email,password,fullName}=req.body;
 try{
    if(!fullName || !email || !password) return res.status(400).json({message:'all details required'});
    if(password.length<6){
        return res.status(400).json({error:"Password should be at least 6 characters long."});
    }
    const existingUser=await UserModel.findOne({email});
    if(existingUser){
        return res.status(400).json({error:"Email already exists."});
    }
    const salt=(await bcrypt.genSalt(10));
    const hashedPassword=(await bcrypt.hash(password,salt));

   const newUser = new User({
    email,
    password:hashedPassword,
    fullName
   })

   if(newUser){
    // generate token
    generateToken(newUser._id,res);
    await newUser.save();
    res.status(201).json({
        _id:newUser._id,
        fullName:newUser.fullName,
        email:newUser.email,
        profilePic:newUser.profilePic
    });


   }
   else{
    return res.status(400).json({error:"Failed to create user."});
   }
   

 }
 catch{
    console.error("error in signup controller",error.message);
    return res.status(500).json({error:"Server Error."});
 }

};

// login 
export const login=async(req,res)=>{
  const {email,password}=req.body;
try{
const user=await User.findOne({email:email});
 
if(!user){
    return res.status(404).json({error:"User not found."});
}
const isPasswordCorrect=await bcrypt.compare(password,user.password);
if(!isPasswordCorrect){
    return res.status(400).json({error:"password incorrect"});
}
generateToken(user._id,res);
res.status(200).json({
    _id:user._id,
    fullName:user.fullName,
    email:user.email,
    profilePic:user.profilePic
})
}
catch(error){
    console.error("error in login controller",error.message);
    return res.status(500).json({error:"Server Error."});

}

};

//logout route
export const logout=(req,res)=>{
 try {
    res.cookie("jwt","",{maxAge:0});
    res.status(200).json({message:"Logged out successfully"});
 } catch (error) {
    console.error("error in logout controller",error.message);
    return res.status(500).json({error:"Server Error."});
    
 }

};

//update profile 
export const update=async (req,res)=>{
   try {
    const {profilePic} = req.body;
    const userId=req.user._id;

    if(!profilePic){
        return res.status(400).json({error:"Please provide a profile picture."});
    }
    const uploadResponse = await cloudinary.uploader.upload(profilePic, {
        resource_type: "image", // Ensure it's treated as an image
      });
    const updatedUser=await User.findByIdAndUpdate(userId,{
        profilePic:uploadResponse.secure_url},
        {new:true}
    );
    return res.status(200).json({updatedUser:updatedUser});
}
    catch (error) {
    console.log("error in update profile",error);
    res.status(500).json({message:"internal server error"})
   }
};

export const checkAuth=async (req,res)=>{
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("error in check auth",error);
        res.status(500).json({message:"internal server error"})
    }
};
