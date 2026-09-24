import Address from "../models/Address.js"
import User from "../models/User.js"


// Add Address : /api/address/add
export const addAddress = async(req, res)=>{
    try {
        let userId = req.userId || req.body?.userId;
        const { address } = req.body;

        if (!userId && address && address.email) {
            const foundUser = await User.findOne({ email: address.email });
            if (foundUser) {
                userId = foundUser._id.toString();
            }
        }

        if (!userId) {
            return res.json({ success: false, message: "User not found. Please log in." });
        }

        await Address.create({...address, userId})
        return res.json({success: true, message: "Address added successfully"})
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message });
    }
}

// Get Address : /api/address/get
export const getAddress = async(req, res)=>{
    try {
        let userId = req.userId || req.body?.userId;
        
        if (!userId && req.query?.email) {
            const foundUser = await User.findOne({ email: req.query.email });
            if (foundUser) {
                userId = foundUser._id.toString();
            }
        }

        const addresses = await Address.find({userId})
        return res.json({success: true, addresses})
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message });
    }
}
