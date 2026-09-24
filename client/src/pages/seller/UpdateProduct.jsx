import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assets, categories } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const UpdateProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { products, axios, fetchProducts } = useAppContext();

    const [existingImages, setExistingImages] = useState([]);
    const [newFiles, setNewFiles] = useState([null, null, null, null]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [offerPrice, setOfferPrice] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProductData = async () => {
            // First check if product is available in global state
            const targetProduct = products.find(p => p._id === id);
            if (targetProduct) {
                setName(targetProduct.name || '');
                setDescription(Array.isArray(targetProduct.description) ? targetProduct.description.join('\n') : (targetProduct.description || ''));
                setCategory(targetProduct.category || '');
                setPrice(targetProduct.price || '');
                setOfferPrice(targetProduct.offerPrice || '');
                setExistingImages(Array.isArray(targetProduct.image) ? targetProduct.image : []);
                setLoading(false);
            } else {
                // Fetch from backend if not found in context
                try {
                    const { data } = await axios.get(`/api/product/id?id=${id}`);
                    if (data.success && data.product) {
                        const p = data.product;
                        setName(p.name || '');
                        setDescription(Array.isArray(p.description) ? p.description.join('\n') : (p.description || ''));
                        setCategory(p.category || '');
                        setPrice(p.price || '');
                        setOfferPrice(p.offerPrice || '');
                        setExistingImages(Array.isArray(p.image) ? p.image : []);
                    } else {
                        toast.error(data.message || 'Product not found');
                        navigate('/seller/product-list');
                    }
                } catch (error) {
                    toast.error(error.message);
                    navigate('/seller/product-list');
                } finally {
                    setLoading(false);
                }
            }
        };

        if (id) {
            loadProductData();
        }
    }, [id, products]);

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        try {
            const imageIndexes = [];
            const filesToUpload = [];

            newFiles.forEach((file, index) => {
                if (file) {
                    filesToUpload.push(file);
                    imageIndexes.push(index);
                }
            });

            const productData = {
                id,
                name,
                description: description.split('\n'),
                category,
                price,
                offerPrice,
                existingImages,
                imageIndexes
            };

            const formData = new FormData();
            formData.append('productData', JSON.stringify(productData));
            filesToUpload.forEach((file) => {
                formData.append('images', file);
            });

            const { data } = await axios.post('/api/product/update', formData);

            if (data.success) {
                toast.success(data.message || 'Product Updated Successfully!');
                await fetchProducts();
                navigate('/seller/product-list');
            } else {
                toast.error(data.message);
            }

        } catch (error) {
            toast.error(error.message);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 h-[95vh] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
            <form onSubmit={onSubmitHandler} className="md:p-10 p-4 space-y-5 max-w-lg">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">Update Product</h2>
                    <button type="button" onClick={() => navigate('/seller/product-list')} className="text-sm text-gray-500 hover:text-gray-700 underline">
                        Cancel
                    </button>
                </div>

                <div>
                    <p className="text-base font-medium">Product Image</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                        {Array(4).fill('').map((_, index) => {
                            const newFile = newFiles[index];
                            const existingImg = existingImages[index];
                            let imgSrc = assets.upload_area;
                            if (newFile) {
                                imgSrc = URL.createObjectURL(newFile);
                            } else if (existingImg) {
                                imgSrc = existingImg;
                            }

                            return (
                                <label key={index} htmlFor={`update-image-${index}`}>
                                    <input 
                                        onChange={(e) => {
                                            const updated = [...newFiles];
                                            updated[index] = e.target.files[0];
                                            setNewFiles(updated);
                                        }}
                                        type="file" 
                                        id={`update-image-${index}`} 
                                        hidden 
                                    />
                                    <img 
                                        className="max-w-24 h-24 object-cover rounded border border-gray-300 cursor-pointer" 
                                        src={imgSrc} 
                                        alt="product slot" 
                                    />
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div className="flex flex-col gap-1 max-w-md">
                    <label className="text-base font-medium" htmlFor="update-product-name">Product Name</label>
                    <input 
                        onChange={(e) => setName(e.target.value)} 
                        value={name}
                        id="update-product-name" 
                        type="text" 
                        placeholder="Type here" 
                        className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" 
                        required 
                    />
                </div>

                <div className="flex flex-col gap-1 max-w-md">
                    <label className="text-base font-medium" htmlFor="update-product-description">Product Description</label>
                    <textarea 
                        onChange={(e) => setDescription(e.target.value)} 
                        value={description}
                        id="update-product-description" 
                        rows={4} 
                        className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none" 
                        placeholder="Type here"
                    ></textarea>
                </div>

                <div className="w-full flex flex-col gap-1">
                    <label className="text-base font-medium" htmlFor="update-category">Category</label>
                    <select 
                        onChange={(e) => setCategory(e.target.value)} 
                        value={category} 
                        id="update-category" 
                        className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                    >
                        <option value="">Select Category</option>
                        {categories.map((item, index) => (
                            <option key={index} value={item.path}>{item.path}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-5 flex-wrap">
                    <div className="flex-1 flex flex-col gap-1 w-32">
                        <label className="text-base font-medium" htmlFor="update-product-price">Product Price</label>
                        <input 
                            onChange={(e) => setPrice(e.target.value)} 
                            value={price}
                            id="update-product-price" 
                            type="number" 
                            placeholder="0" 
                            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" 
                            required 
                        />
                    </div>
                    <div className="flex-1 flex flex-col gap-1 w-32">
                        <label className="text-base font-medium" htmlFor="update-offer-price">Offer Price</label>
                        <input 
                            onChange={(e) => setOfferPrice(e.target.value)} 
                            value={offerPrice} 
                            id="update-offer-price" 
                            type="number" 
                            placeholder="0" 
                            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" 
                            required 
                        />
                    </div>
                </div>

                <button type="submit" className="px-8 py-2.5 bg-primary text-white font-medium rounded cursor-pointer hover:bg-primary/90 transition">
                    UPDATE
                </button>
            </form>
        </div>
    );
};

export default UpdateProduct;
