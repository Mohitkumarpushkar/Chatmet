import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config();
export const connectDB=async()=>{
    try{
        const con=await mongoose.connect(process.env.mongodb_url);
        console.log('connection established');
    }
    catch(error){
        console.log("error:",error)
    }

}