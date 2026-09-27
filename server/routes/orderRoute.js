import express from 'express';
import { getAllOrders, getUserOrders, placeOrderCOD, placeOrderStripe, verifyStripe, updateOrderStatus, cancelOrder } from '../controllers/orderController.js';
import authSeller from '../middlewares/authSeller.js';

const orderRouter = express.Router();

orderRouter.post('/cod', placeOrderCOD)
orderRouter.get('/user', getUserOrders)
orderRouter.get('/seller', authSeller, getAllOrders)
orderRouter.post('/stripe', placeOrderStripe)
orderRouter.post('/verifyStripe', verifyStripe)
orderRouter.post('/status', authSeller, updateOrderStatus)
orderRouter.post('/cancel', cancelOrder)

export default orderRouter;