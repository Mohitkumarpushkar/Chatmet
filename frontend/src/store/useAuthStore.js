import {create} from 'zustand'
import { axiosInstance } from '../lib/axios.js'
import toast from 'react-hot-toast';

import {io} from 'socket.io-client'


const url=import.meta.env.MODE==="development"?"http://localhost:3000":"/";
export const useAuthStore= create((set,get)=>({
    authUser:null,
    isSigningUp:false,
    isLoggingIn:false,
    isUpdatingProfile:false,
    socket:null,

    isCheckingAuth:true,
    onlineUsers: [],
    checkAuth: async()=>{
try {
    const res=await axiosInstance.get("/auth/check");
    set({authUser:res.data})
    get().connectSocket();
} catch (error) {
    console.log("error in checkAuth",error);
    set({authUser:null});
    
}
finally{
    set({isCheckingAuth:false})
}
    },
    signup:async(data)=>{

set({isSigningUp:true});
try {
    const res=await axiosInstance.post('/auth/signup',data);
    set({authUser:res.data});
    toast.success("Account created successfully");
    get().connectSocket();

} catch (error) {
    toast.error("error in signup",error.response.data.message);
}finally{
    set({isSigningUp:false});
}
    },
    login:async(data)=>{
        set({isLoggingIn:true});
        try {
   
            const res=await axiosInstance.post('/auth/login',data);
            set({authUser:res.data});
            toast.success("Logged in successfully");
            get().connectSocket();
    }
    catch (error) {
        const errorMessage = error.response?.data?.message || "incorrect email or password";
        toast.error(errorMessage);
        }finally{
            set({isLoggingIn:false});
        }
},
    logout:async()=>{
        try {
            await axiosInstance.post('/auth/logout');
            set({authUser:null});
            toast.success("Account logged out successfully");
            get().disconnectSocket(); // disconnect the socket when user logs out to avoid any connection issues when user tries to reconnect later.
    
        } catch (error) {
            toast.error("error in logout",error.response.data.message);
        }
       
    },
    updateProfile:async(data)=>{
        set({isUpdatingProfile:true});
        try {
            const res=await axiosInstance.put('/auth/update-profile',data);
            set({authUser:res.data});
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error("error in updating profile",error.response.data.message);
        }finally{
            set({isUpdatingProfile:false});
        }
    },
    connectSocket:()=>{
        const {authUser}=get();
        if(!authUser || get().socket?.connected) return;
        const socket =io(url,{
            query:{
                userId:authUser._id,
            },
        });
        socket.connect();
     set({socket:socket});

     socket.on("getOnlineUsers",(userIds)=>{
        set({onlineUsers:userIds})
     })
    },
    disconnectSocket:()=>{
        if(get().socket?.connected) get().socket.disconnect();
    }
}));