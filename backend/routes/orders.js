import express from 'express';
import {protect} from '../middleware/auth.js';
import {createOrder,getMyOrders,getMyOrderById} from '../controllers/orderController.js';
const router=express.Router();
router.use(protect);
router.post('/',createOrder);
router.get('/',getMyOrders);
router.get('/:id',getMyOrderById);
export default router;
