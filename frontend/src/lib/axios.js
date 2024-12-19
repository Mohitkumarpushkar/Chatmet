import axios from 'axios';
export const axiosInstance=axios.create({
    baseURL:import.meta.env.MODE==="development"? 'http://localhost:3000/api':"/api",  // Replace with your API endpoint URL.
   withCredentials:true
})