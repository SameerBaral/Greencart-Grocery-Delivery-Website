import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets, dummyAddress } from "../assets/assets";
import toast from "react-hot-toast";

const Cart = () => {
    const {products, currency, cartItems, removeFromCart, getCartCount, updateCartItem, navigate, getCartAmount, axios, user, setCartItems, setShowUserLogin} = useAppContext()
    const [cartArray, setCartArray] = useState([])
    const [addresses, setAddresses] = useState([])
    const [showAddress, setShowAddress] = useState(false)
    const [selectedAddress, setSelectedAddress] = useState(null)
    const [paymentOption, setPaymentOption] = useState("COD")

    const getCart = ()=>{
        let tempArray = []
        for(const key in cartItems){
            const product = products.find((item)=>item._id === key)
            if (product) {
                product.quantity = cartItems[key]
                tempArray.push(product)
            }
        }
        setCartArray(tempArray)
    }

    const getUserAddress = async ()=>{
        try {
            const storedToken = localStorage.getItem('token');
            const {data} = await axios.get('/api/address/get', {
                params: { email: user?.email },
                headers: { token: storedToken, Authorization: `Bearer ${storedToken}` }
            });
            if (data.success){
                setAddresses(data.addresses)
                if(data.addresses.length > 0){
                    setSelectedAddress(prev => {
                        if (!prev) return data.addresses[0];
                        const stillExists = data.addresses.find(a => a._id === prev._id);
                        return stillExists || data.addresses[0];
                    });
                } else {
                    setSelectedAddress(null);
                }
            }
        } catch (error) {
            console.log(error.message)
        }
    }

    const handleRemoveAddress = async (addressId) => {
        try {
            const storedToken = localStorage.getItem('token');
            const { data } = await axios.post('/api/address/remove', {
                addressId,
                token: storedToken,
                email: user?.email
            }, {
                headers: {
                    token: storedToken,
                    Authorization: `Bearer ${storedToken}`
                }
            });

            if (data.success) {
                toast.success(data.message || "Address removed successfully");
                const updated = addresses.filter(item => item._id !== addressId);
                setAddresses(updated);

                if (selectedAddress?._id === addressId) {
                    setSelectedAddress(updated.length > 0 ? updated[0] : null);
                }
            } else {
                toast.error(data.message || "Failed to remove address");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const placeOrder = async ()=>{
        try {
            if(!user){
                setShowUserLogin(true)
                return toast.error("Please login to place order")
            }
            if(!selectedAddress){
                return toast.error("Please select an address")
            }

            const storedToken = localStorage.getItem('token');
            const authHeader = { headers: { token: storedToken, Authorization: `Bearer ${storedToken}` } };

            // Place Order with COD
            if(paymentOption === "COD"){
                const {data} = await axios.post('/api/order/cod', {
                    userId: user._id,
                    items: cartArray.map(item=> ({product: item._id, quantity: item.quantity})),
                    address: selectedAddress._id,
                    token: storedToken
                }, authHeader)

                if(data.success){
                    toast.success(data.message)
                    setCartItems({})
                    window.dispatchEvent(new CustomEvent('order-updated'))
                    navigate('/my-orders')
                }else{
                    toast.error(data.message)
                }
            }else{
                // Place Order with Stripe
                const {data} = await axios.post('/api/order/stripe', {
                    userId: user._id,
                    items: cartArray.map(item=> ({product: item._id, quantity: item.quantity})),
                    address: selectedAddress._id,
                    token: storedToken
                }, authHeader)

                if(data.success){
                    window.location.replace(data.url)
                }else{
                    toast.error(data.message)
                }
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(()=>{
        if(products.length > 0 && cartItems){
            getCart()
        }
    },[products, cartItems])


    useEffect(()=>{
        if(user){
            getUserAddress()
        }
    },[user])
    
    return products.length > 0 && cartItems ? (
        <div className="flex flex-col md:flex-row mt-16">
            <div className='flex-1 max-w-4xl'>
                <h1 className="text-3xl font-medium mb-6">
                    Shopping Cart <span className="text-sm text-primary">{getCartCount()} Items</span>
                </h1>

                <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3">
                    <p className="text-left">Product Details</p>
                    <p className="text-center">Subtotal</p>
                    <p className="text-center">Action</p>
                </div>

                {cartArray.map((product, index) => (
                    <div key={index} className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 items-center text-sm md:text-base font-medium pt-3">
                        <div className="flex items-center md:gap-6 gap-3">
                            <div onClick={()=>{
                                navigate(`/products/${product.category.toLowerCase()}/${product._id}`); scrollTo(0,0)
                            }} className="cursor-pointer w-24 h-24 flex items-center justify-center border border-gray-300 rounded">
                                <img className="max-w-full h-full object-cover" src={product.image[0]} alt={product.name} />
                            </div>
                            <div>
                                <p className="hidden md:block font-semibold">{product.name}</p>
                                <div className="font-normal text-gray-500/70">
                                    <p>Weight: <span>{product.weight || "N/A"}</span></p>
                                    <div className='flex items-center'>
                                        <p>Qty:</p>
                                        <select onChange={e => updateCartItem(product._id, Number(e.target.value))}  value={cartItems[product._id]} className='outline-none'>
                                            {Array(cartItems[product._id] > 9 ? cartItems[product._id] : 9).fill('').map((_, index) => (
                                                <option key={index} value={index + 1}>{index + 1}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-center">{currency}{product.offerPrice * product.quantity}</p>
                        <button onClick={()=> removeFromCart(product._id)} className="cursor-pointer mx-auto">
                            <img src={assets.remove_icon} alt="remove" className="inline-block w-6 h-6" />
                        </button>
                    </div>)
                )}

                <button onClick={()=> {navigate("/products"); scrollTo(0,0)}} className="group cursor-pointer flex items-center mt-8 gap-2 text-primary font-medium">
                    <img className="group-hover:-translate-x-1 transition" src={assets.arrow_right_icon_colored} alt="arrow" />
                    Continue Shopping
                </button>

            </div>

            <div className="max-w-[360px] w-full bg-gray-100/40 p-5 max-md:mt-16 border border-gray-300/70">
                <h2 className="text-xl md:text-xl font-medium">Order Summary</h2>
                <hr className="border-gray-300 my-5" />

                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium uppercase text-gray-700">Delivery Address</p>
                        <button 
                            onClick={() => setShowAddress(!showAddress)} 
                            className="text-primary text-sm font-semibold hover:underline cursor-pointer"
                        >
                            {showAddress ? "Close" : "Change"}
                        </button>
                    </div>

                    {selectedAddress ? (
                        <div className="p-3 border border-gray-200 rounded bg-white text-sm relative">
                            <p className="font-semibold text-gray-800">{selectedAddress.firstName} {selectedAddress.lastName}</p>
                            <p className="text-gray-600 mt-0.5 leading-snug">
                                {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state}, {selectedAddress.country} - {selectedAddress.zipcode}
                            </p>
                            {selectedAddress.phone && (
                                <p className="text-gray-500 text-xs mt-1">📞 {selectedAddress.phone}</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm italic bg-white p-3 border border-gray-200 rounded">No address selected</p>
                    )}

                    {showAddress && (
                        <div className="mt-3 p-3 bg-white border border-gray-300 rounded-lg shadow-xl text-sm space-y-3 z-30 relative">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Select Delivery Address</p>
                            
                            {addresses.length === 0 ? (
                                <p className="text-gray-500 text-xs py-1">No saved addresses found.</p>
                            ) : (
                                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                    {addresses.map((address) => {
                                        const isSelected = selectedAddress?._id === address._id;
                                        return (
                                            <div 
                                                key={address._id} 
                                                className={`flex items-start justify-between p-2.5 rounded-md border transition cursor-pointer ${
                                                    isSelected ? 'border-primary bg-primary/5 shadow-xs' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                                onClick={() => {
                                                    setSelectedAddress(address);
                                                    setShowAddress(false);
                                                }}
                                            >
                                                <div className="flex-1 pr-2">
                                                    <div className="flex items-center gap-2">
                                                        <input 
                                                            type="radio" 
                                                            name="delivery_address" 
                                                            checked={isSelected} 
                                                            onChange={() => {
                                                                setSelectedAddress(address);
                                                                setShowAddress(false);
                                                            }}
                                                            className="accent-primary cursor-pointer"
                                                        />
                                                        <p className="font-medium text-gray-800 text-xs md:text-sm">
                                                            {address.firstName} {address.lastName}
                                                        </p>
                                                        {isSelected && (
                                                            <span className="text-[10px] bg-primary/20 text-primary font-semibold px-1.5 py-0.5 rounded">Selected</span>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-600 text-xs mt-1 pl-5 leading-snug">
                                                        {address.street}, {address.city}, {address.state}, {address.country} - {address.zipcode}
                                                    </p>
                                                    {address.phone && (
                                                        <p className="text-gray-500 text-[11px] mt-0.5 pl-5">
                                                            Phone: {address.phone}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Action Buttons: Edit and Delete (Cross Icon) */}
                                                <div className="flex items-center gap-1 mt-0.5" onClick={(e) => e.stopPropagation()}>
                                                    <button 
                                                        onClick={() => {
                                                            setShowAddress(false);
                                                            navigate('/add-address', { state: { addressToEdit: address } });
                                                        }}
                                                        className="text-xs font-semibold text-primary hover:underline px-1 py-0.5 cursor-pointer"
                                                        title="Update / Edit Address"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleRemoveAddress(address._id)}
                                                        className="p-1 hover:bg-red-50 rounded transition cursor-pointer"
                                                        title="Remove Address"
                                                    >
                                                        <img src={assets.remove_icon} alt="Remove" className="w-5 h-5 hover:scale-110 transition" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <button 
                                onClick={() => {
                                    setShowAddress(false);
                                    if (!user) {
                                        setShowUserLogin(true);
                                        toast.error("Please login to add address");
                                    } else {
                                        navigate("/add-address");
                                    }
                                }} 
                                className="w-full text-center text-primary font-semibold text-sm py-2 px-3 border border-dashed border-primary rounded-md hover:bg-primary/5 transition cursor-pointer flex items-center justify-center gap-1 mt-2"
                            >
                                + Add New Address
                            </button>
                        </div>
                    )}

                    <p className="text-sm font-medium uppercase mt-6">Payment Method</p>

                    <select onChange={e => setPaymentOption(e.target.value)} className="w-full border border-gray-300 bg-white px-3 py-2 mt-2 outline-none">
                        <option value="COD">Cash On Delivery</option>
                        <option value="Online">Online Payment</option>
                    </select>
                </div>

                <hr className="border-gray-300" />

                <div className="text-gray-500 mt-4 space-y-2">
                    <p className="flex justify-between">
                        <span>Price</span><span>{currency}{getCartAmount()}</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Shipping Fee</span><span className="text-green-600">Free</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Tax (2%)</span><span>{currency}{getCartAmount() * 2 / 100}</span>
                    </p>
                    <p className="flex justify-between text-lg font-medium mt-3">
                        <span>Total Amount:</span><span>
                            {currency}{getCartAmount() + getCartAmount() * 2 / 100}</span>
                    </p>
                </div>

                <button onClick={placeOrder} className="w-full py-3 mt-6 cursor-pointer bg-primary text-white font-medium hover:bg-primary-dull transition">
                    {paymentOption === "COD" ? "Place Order" : "Proceed to Checkout"}
                </button>
            </div>
        </div>
    ) : null
}

export default Cart;