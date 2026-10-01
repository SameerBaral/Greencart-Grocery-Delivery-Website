import Order from "../models/Order.js";
import Product from "../models/Product.js";
import stripe from "stripe"
import User from "../models/User.js"

// Place Order COD : /api/order/cod
export const placeOrderCOD = async (req, res)=>{
    try {
        const { userId, items, address } = req.body;
        if(!address || items.length === 0){
            return res.json({success: false, message: "Invalid data"})
        }
        // Calculate Amount Using Items
        let amount = await items.reduce(async (acc, item)=>{
            const product = await Product.findById(item.product);
            return (await acc) + product.offerPrice * item.quantity;
        }, 0)

        // Add Tax Charge (2%)
        amount += Math.floor(amount * 0.02);

        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "COD",
            date: Date.now(),
            orderTime: `${new Date().toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" })}, ${new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}`
        });

        return res.json({success: true, message: "Order Placed Successfully" })
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// Place Order Stripe : /api/order/stripe
export const placeOrderStripe = async (req, res)=>{
    try {
        const { userId, items, address } = req.body;
        const {origin} = req.headers;

        if(!address || items.length === 0){
            return res.json({success: false, message: "Invalid data"})
        }

        let productData = [];

        // Calculate Amount Using Items
        let amount = await items.reduce(async (acc, item)=>{
            const product = await Product.findById(item.product);
            productData.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity,
            });
            return (await acc) + product.offerPrice * item.quantity;
        }, 0)

        // Add Tax Charge (2%)
        amount += Math.floor(amount * 0.02);

       const order =  await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "Online",
            date: Date.now(),
            orderTime: `${new Date().toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" })}, ${new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}`
        });

    // Stripe Gateway Initialize    
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    // create line items for stripe

     const line_items = productData.map((item)=>{
        return {
            price_data: {
                currency: "inr",
                product_data:{
                    name: item.name,
                },
                unit_amount: Math.floor(item.price + item.price * 0.02)  * 100
            },
            quantity: item.quantity,
        }
     })

     // create session
     const session = await stripeInstance.checkout.sessions.create({
        line_items,
        mode: "payment",
        success_url: `${origin}/loader?next=my-orders&success=true&orderId=${order._id}`,
        cancel_url: `${origin}/loader?next=cart&success=false&orderId=${order._id}`,
        metadata: {
            orderId: order._id.toString(),
            userId,
        }
     })

        return res.json({success: true, url: session.url });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// Verify Stripe Payment : /api/order/verifyStripe
export const verifyStripe = async (req, res) => {
    try {
        const { orderId, success, userId } = req.body;

        if (success === "true" || success === true) {
            await Order.findByIdAndUpdate(orderId, { isPaid: true });
            await User.findByIdAndUpdate(userId, { cartItems: {} });
            return res.json({ success: true, message: "Payment Successful" });
        } else {
            await Order.findByIdAndDelete(orderId);
            return res.json({ success: false, message: "Payment Failed" });
        }
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}
// Stripe Webhooks to Verify Payments Action : /stripe
export const stripeWebhooks = async (request, response)=>{
    // Stripe Gateway Initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const sig = request.headers["stripe-signature"];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        response.status(400).send(`Webhook Error: ${error.message}`)
    }

    // Handle the event
    switch (event.type) {
        case "payment_intent.succeeded":{
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            // Getting Session Metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            const { orderId, userId } = session.data[0].metadata;
            // Mark Payment as Paid
            await Order.findByIdAndUpdate(orderId, {isPaid: true})
            // Clear user cart
            await User.findByIdAndUpdate(userId, {cartItems: {}});
            break;
        }
        case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            // Getting Session Metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            const { orderId } = session.data[0].metadata;
            await Order.findByIdAndDelete(orderId);
            break;
        }
            
    
        default:
            console.error(`Unhandled event type ${event.type}`)
            break;
    }
    response.json({received: true});
}


// Update Order Status (for seller / admin) : /api/order/status
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        if (!orderId || !status) {
            return res.json({ success: false, message: "Invalid orderId or status" });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        // Prevent modifying an order that is already in a terminal state (Delivered or Cancelled)
        if (order.status === "Cancelled") {
            return res.json({ success: false, message: "Cannot modify status of a cancelled order" });
        }
        if (order.status === "Delivered") {
            return res.json({ success: false, message: "Cannot modify status of a delivered order" });
        }

        // Enforce sequential status progression
        const allowedTransitions = {
            "Order Placed": ["Packing", "Cancelled"],
            "Packing": ["Out for Delivery", "Cancelled"],
            "Out for Delivery": ["Delivered", "Cancelled"]
        };

        const allowed = allowedTransitions[order.status];
        if (allowed && !allowed.includes(status)) {
            return res.json({ success: false, message: `Invalid transition from "${order.status}" to "${status}"` });
        }

        order.status = status;
        if (status === "Delivered") {
            order.isPaid = true;
        }

        order.items.forEach(item => {
            if (item.status !== "Cancelled") {
                item.status = status;
            }
        });

        await order.save();
        return res.json({ success: true, message: `Order status updated to "${status}"` });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Cancel Order (for user) : /api/order/cancel
export const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        if (!orderId) {
            return res.json({ success: false, message: "Order ID is required" });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        if (order.status === "Delivered") {
            return res.json({ success: false, message: "Delivered order cannot be cancelled" });
        }

        if (order.status === "Cancelled") {
            return res.json({ success: false, message: "Order is already cancelled" });
        }

        order.status = "Cancelled";
        order.items.forEach(item => {
            item.status = "Cancelled";
        });

        if (order.paymentType === "Online" && order.isPaid) {
            order.isRefunded = true;
        }

        await order.save();
        return res.json({ success: true, message: "Entire order cancelled successfully" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Cancel Individual Order Item(s) : /api/order/cancel-item
export const cancelOrderItem = async (req, res) => {
    try {
        const { orderId, itemId, itemIds } = req.body;
        if (!orderId) {
            return res.json({ success: false, message: "Order ID is required" });
        }

        const idsToCancel = (itemIds && Array.isArray(itemIds)) ? itemIds : (itemId ? [itemId] : []);
        if (idsToCancel.length === 0) {
            return res.json({ success: false, message: "No items specified for cancellation" });
        }

        // Fetch order WITHOUT populate so items.product remains a pure String ID matching schema
        const order = await Order.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        if (order.status === "Delivered") {
            return res.json({ success: false, message: "Delivered order cannot be cancelled" });
        }

        if (order.status === "Cancelled") {
            return res.json({ success: false, message: "Order is already cancelled" });
        }

        let itemsUpdatedCount = 0;

        order.items.forEach(item => {
            const itemMatch = idsToCancel.some(id => 
                id.toString() === item._id?.toString() || 
                id.toString() === item.product?.toString()
            );

            if (itemMatch && item.status !== "Cancelled" && item.status !== "Delivered") {
                item.status = "Cancelled";
                itemsUpdatedCount++;
            }
        });

        if (itemsUpdatedCount === 0) {
            return res.json({ success: false, message: "Selected item(s) cannot be cancelled or are already cancelled" });
        }

        const activeItems = order.items.filter(item => item.status !== "Cancelled");

        if (activeItems.length === 0) {
            order.status = "Cancelled";
            order.amount = 0;
            if (order.paymentType === "Online" && order.isPaid) {
                order.isRefunded = true;
            }
        } else {
            // Query products separately to calculate subtotal for remaining active items
            const activeProductIds = activeItems.map(item => item.product);
            const productsList = await Product.find({ _id: { $in: activeProductIds } });

            const productPriceMap = {};
            productsList.forEach(p => {
                productPriceMap[p._id.toString()] = p.offerPrice;
            });

            let subtotal = 0;
            for (const item of activeItems) {
                const price = productPriceMap[item.product?.toString()] || 0;
                subtotal += price * item.quantity;
            }
            order.amount = subtotal + Math.floor(subtotal * 0.02);
        }

        await order.save();
        return res.json({ 
            success: true, 
            message: `${itemsUpdatedCount} item(s) cancelled successfully`
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Get Orders by User ID : /api/order/user
export const getUserOrders = async (req, res)=>{
    try {
        let userId = req.userId || req.body?.userId;
        if (!userId && req.query?.email) {
            const foundUser = await User.findOne({ email: req.query.email });
            if (foundUser) userId = foundUser._id;
        }
        const orders = await Order.find({
            userId,
            $or: [{paymentType: "COD"}, {isPaid: true}]
        }).populate("items.product address").sort({createdAt: -1});
        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}


// Get All Orders ( for seller / admin) : /api/order/seller
export const getAllOrders = async (req, res)=>{
    try {
        const orders = await Order.find({
            $or: [{paymentType: "COD"}, {isPaid: true}]
        }).populate("items.product address userId").sort({createdAt: -1});
        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}