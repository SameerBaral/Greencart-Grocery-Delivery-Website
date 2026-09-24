import { v2 as cloudinary } from "cloudinary"
import Product from "../models/Product.js"

// Add Product : /api/product/add
export const addProduct = async (req, res)=>{
    try {
        let productData = JSON.parse(req.body.productData)

        const images = req.files

        let imagesUrl = await Promise.all(
            images.map(async (item)=>{
                let result = await cloudinary.uploader.upload(item.path, {resource_type: 'image'});
                return result.secure_url
            })
        )

        await Product.create({...productData, image: imagesUrl})

        res.json({success: true, message: "Product Added"})

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Get Product : /api/product/list
export const productList = async (req, res)=>{
    try {
        const products = await Product.find({})
        res.json({success: true, products})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Get single Product : /api/product/id
export const productById = async (req, res)=>{
    try {
        const id = req.body?.id || req.query?.id
        const product = await Product.findById(id)
        if (!product) {
            return res.json({ success: false, message: "Product not found" })
        }
        res.json({success: true, product})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Change Product inStock : /api/product/stock
export const changeStock = async (req, res)=>{
    try {
        const { id, inStock } = req.body
        await Product.findByIdAndUpdate(id, {inStock})
        res.json({success: true, message: "Stock Updated"})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Update Product : /api/product/update
export const updateProduct = async (req, res)=>{
    try {
        let productData = JSON.parse(req.body.productData)
        const { id, name, description, category, price, offerPrice, existingImages, imageIndexes } = productData

        const files = req.files || []
        
        let finalImages = Array.isArray(existingImages) ? [...existingImages] : []
        
        if (files.length > 0) {
            const fileUploadPromises = files.map(async (file) => {
                let result = await cloudinary.uploader.upload(file.path, { resource_type: 'image' });
                return result.secure_url;
            });
            const uploadedUrls = await Promise.all(fileUploadPromises);
            
            if (imageIndexes && Array.isArray(imageIndexes)) {
                imageIndexes.forEach((slotIdx, i) => {
                    if (uploadedUrls[i]) {
                        finalImages[slotIdx] = uploadedUrls[i];
                    }
                });
            } else {
                finalImages = [...finalImages.filter(Boolean), ...uploadedUrls];
            }
        }

        finalImages = finalImages.filter(img => typeof img === 'string' && img.trim() !== '')

        const updatedDesc = Array.isArray(description) 
            ? description 
            : (typeof description === 'string' ? description.split('\n') : [])

        await Product.findByIdAndUpdate(id, {
            name,
            description: updatedDesc,
            category,
            price: Number(price),
            offerPrice: Number(offerPrice),
            ...(finalImages.length > 0 && { image: finalImages })
        })

        res.json({ success: true, message: "Product Updated" })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

