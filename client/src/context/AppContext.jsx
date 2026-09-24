import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
const defaultBackendUrl = typeof window !== 'undefined' && window.location.hostname.includes("vercel.app") ? "" : "https://greencart-backend-rd1m.onrender.com";
axios.defaults.baseURL = (import.meta.env.VITE_BACKEND_URL !== undefined && import.meta.env.VITE_BACKEND_URL !== "") ? import.meta.env.VITE_BACKEND_URL : defaultBackendUrl;

// Request interceptor to attach token on every outgoing request
axios.interceptors.request.use((config) => {
    const currentToken = localStorage.getItem('token');
    if (currentToken) {
        if (config.headers && typeof config.headers.set === 'function') {
            config.headers.set('token', currentToken);
            config.headers.set('Authorization', `Bearer ${currentToken}`);
        } else if (config.headers) {
            config.headers['token'] = currentToken;
            config.headers['Authorization'] = `Bearer ${currentToken}`;
        } else {
            config.headers = {
                token: currentToken,
                Authorization: `Bearer ${currentToken}`
            };
        }
    }
    return config;
}, (error) => Promise.reject(error));

const initialToken = localStorage.getItem('token');

export const AppContext = createContext();

export const AppContextProvider = ({children})=>{

    const currency = import.meta.env.VITE_CURRENCY;

    const navigate = useNavigate();
    const [token, setToken] = useState(initialToken || '')
    const [user, setUser] = useState(() => {
        try {
            const localUser = localStorage.getItem('user');
            return localUser ? JSON.parse(localUser) : null;
        } catch (e) {
            return null;
        }
    })
    const [isSeller, setIsSeller] = useState(false)
    const [showUserLogin, setShowUserLogin] = useState(false)
    const [products, setProducts] = useState([])

    const [cartItems, setCartItems] = useState(() => {
        try {
            const localCart = localStorage.getItem('cartItems');
            return localCart ? JSON.parse(localCart) : {};
        } catch (e) {
            return {};
        }
    })
    const [searchQuery, setSearchQuery] = useState({})

    // Persist user in localStorage
    useEffect(() => {
        if (user) {
            try {
                localStorage.setItem('user', JSON.stringify(user));
            } catch (e) {}
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    // Persist cartItems in localStorage
    useEffect(() => {
        try {
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
        } catch (e) {}
    }, [cartItems]);

    // Sync token state with localStorage
    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

  // Fetch Seller Status
  const fetchSeller = async ()=>{
    try {
        const {data} = await axios.get('/api/seller/is-auth');
        if(data.success){
            setIsSeller(true)
        }else{
            setIsSeller(false)
        }
    } catch (error) {
        setIsSeller(false)
    }
  }

    // Fetch User Auth Status , User Data and Cart Items
const fetchUser = async ()=>{
    try {
        const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
        const storedToken = localStorage.getItem('token');
        if (!storedUser && !storedToken) return;

        const {data} = await axios.get('/api/user/is-auth', {
            params: { email: storedUser?.email },
            headers: storedToken ? { token: storedToken, Authorization: `Bearer ${storedToken}` } : {}
        });
        if (data && data.success && data.user){
            setUser(data.user)
            if (data.user.cartItems) {
                setCartItems(data.user.cartItems)
            }
        }
    } catch (error) {
        console.log(error.message)
    }
}



    // Fetch All Products
    const fetchProducts = async ()=>{
        try {
            const { data } = await axios.get('/api/product/list')
            if(data.success){
                setProducts(data.products)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

// Add Product to Cart
const addToCart = (itemId)=>{
    let cartData = structuredClone(cartItems);

    if(cartData[itemId]){
        cartData[itemId] += 1;
    }else{
        cartData[itemId] = 1;
    }
    setCartItems(cartData);
    toast.success("Added to Cart")
}

  // Update Cart Item Quantity
  const updateCartItem = (itemId, quantity)=>{
    let cartData = structuredClone(cartItems);
    cartData[itemId] = quantity;
    setCartItems(cartData)
    toast.success("Cart Updated")
  }

// Remove Product from Cart
const removeFromCart = (itemId)=>{
    let cartData = structuredClone(cartItems);
    if(cartData[itemId]){
        cartData[itemId] -= 1;
        if(cartData[itemId] === 0){
            delete cartData[itemId];
        }
    }
    toast.success("Removed from Cart")
    setCartItems(cartData)
}

  // Get Cart Item Count
  const getCartCount = ()=>{
    let totalCount = 0;
    for(const item in cartItems){
        totalCount += cartItems[item];
    }
    return totalCount;
  }

// Get Cart Total Amount
const getCartAmount = () =>{
    let totalAmount = 0;
    for (const items in cartItems){
        let itemInfo = products.find((product)=> product._id === items);
        if(cartItems[items] > 0){
            totalAmount += itemInfo.offerPrice * cartItems[items]
        }
    }
    return Math.floor(totalAmount * 100) / 100;
}


    useEffect(()=>{
        fetchUser()
        fetchSeller()
        fetchProducts()
    },[])

    // Update Database Cart Items
    useEffect(()=>{
        const updateCart = async ()=>{
            try {
                const { data } = await axios.post('/api/cart/update', {cartItems})
                if (!data.success && data.message !== "Not Authorized"){
                    toast.error(data.message)
                }
            } catch (error) {
                console.log(error.message)
            }
        }

        if(user){
            updateCart()
        }
    },[cartItems])

    const value = {navigate, user, setUser, token, setToken, setIsSeller, isSeller,
        showUserLogin, setShowUserLogin, products, currency, addToCart, updateCartItem, removeFromCart, cartItems, searchQuery, setSearchQuery, getCartAmount, getCartCount, axios, fetchProducts, setCartItems
    }

    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}

export const useAppContext = ()=>{
    return useContext(AppContext)
}
