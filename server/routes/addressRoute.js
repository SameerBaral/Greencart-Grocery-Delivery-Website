import express from 'express';
import { addAddress, getAddress, removeAddress, updateAddress } from '../controllers/addressController.js';
import authUser from '../middlewares/authUser.js';

const addressRouter = express.Router();

addressRouter.post('/add', authUser, addAddress);
addressRouter.get('/get', authUser, getAddress);
addressRouter.post('/remove', authUser, removeAddress);
addressRouter.post('/update', authUser, updateAddress);

export default addressRouter;