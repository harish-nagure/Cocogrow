import express from 'express';
import { protect } from '../middleware/auth.js';
import { me, updateMe } from '../controllers/authController.js';
const router = express.Router();
router.use(protect);
router.get('/me', me);
router.put('/me', updateMe);
export default router;
