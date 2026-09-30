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

        const newAddress = await Address.create({...address, userId})
        return res.json({success: true, message: "Address added successfully", address: newAddress})
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

// Remove Address : /api/address/remove
export const removeAddress = async(req, res)=>{
    try {
        let userId = req.userId || req.body?.userId;
        const { addressId } = req.body;

        if (!userId && req.body?.email) {
            const foundUser = await User.findOne({ email: req.body.email });
            if (foundUser) {
                userId = foundUser._id.toString();
            }
        }

        if (!addressId) {
            return res.json({ success: false, message: "Address ID is required" });
        }

        await Address.findByIdAndDelete(addressId);
        return res.json({ success: true, message: "Address removed successfully" });
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message });
    }
}

// Update Address : /api/address/update
export const updateAddress = async(req, res)=>{
    try {
        let userId = req.userId || req.body?.userId;
        const { addressId, address } = req.body;

        if (!userId && (address?.email || req.body?.email)) {
            const foundUser = await User.findOne({ email: address?.email || req.body?.email });
            if (foundUser) {
                userId = foundUser._id.toString();
            }
        }

        const idToUpdate = addressId || address?._id;
        if (!idToUpdate) {
            return res.json({ success: false, message: "Address ID is required for update" });
        }

        const updated = await Address.findByIdAndUpdate(idToUpdate, { ...address }, { new: true });
        return res.json({ success: true, message: "Address updated successfully", address: updated });
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message });
    }
}

