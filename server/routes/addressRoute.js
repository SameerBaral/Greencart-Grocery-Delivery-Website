import express from 'express';
import { addAddress, getAddress } from '../controllers/addressController.js';

const addressRouter = express.Router();

addressRouter.post('/add', addAddress);
addressRouter.get('/get', getAddress);

export default addressRouter;