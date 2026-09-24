import express from 'express';
import { getAllOrders, getUserOrders, placeOrderCOD, placeOrderStripe, verifyStripe } from '../controllers/orderController.js';
import authSeller from '../middlewares/authSeller.js';

const orderRouter = express.Router();

orderRouter.post('/cod', placeOrderCOD)
orderRouter.get('/user', getUserOrders)
orderRouter.get('/seller', authSeller, getAllOrders)
orderRouter.post('/stripe', placeOrderStripe)
orderRouter.post('/verifyStripe', verifyStripe)

export default orderRouter;