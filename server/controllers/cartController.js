import User from "../models/User.js"

// Update User CartData : /api/cart/update

export const updateCart = async (req, res)=>{
    try {
        let userId = req.userId || req.body?.userId;
        const { cartItems, email } = req.body     

        if (!userId && email) {
            const user = await User.findOne({ email });
            if (user) userId = user._id;
        }

        if (!userId) {
            return res.json({ success: false, message: "Not Authorized" });
        }

        await User.findByIdAndUpdate(userId, { cartItems })
        res.json({ success: true, message: "Cart Updated" })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}