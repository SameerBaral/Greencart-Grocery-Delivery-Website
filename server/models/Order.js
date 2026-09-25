import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {type: String, required: true, ref: 'user'},
    items: [{
        product: {type: String, required: true, ref: 'product'},
        quantity: {type: Number, required: true}
    }],
    amount: {type: Number, required: true},
    address: {type: String, required: true, ref: 'address'},
    status: {type: String, default: 'Order Placed'},
    paymentType: {type: String, required: true},
    isPaid: {type: Boolean, required: true, default: false},
    date: {type: Number, default: Date.now},
    orderTime: {
        type: String,
        default: () => {
            const d = new Date();
            const dateStr = d.toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" });
            const timeStr = d.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
            return `${dateStr}, ${timeStr}`;
        }
    }
},{ timestamps: true })

const Order = mongoose.models.order || mongoose.model('order', orderSchema)

export default Order