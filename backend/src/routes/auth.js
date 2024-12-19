import express from 'express'
import { login,signup,logout,update,checkAuth} from '../controllers/authcontrol.js';
import { protectRoute } from '../middleware/protect.js';
const router=express.Router();
router.post('/signup',signup);

router.post('/login',login);
router.post('/logout',logout);
router.put('/update-profile',protectRoute,update);
router.get('/check',protectRoute,checkAuth);

export default router;
