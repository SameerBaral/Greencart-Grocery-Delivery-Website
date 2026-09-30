
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";


const ProductCard = ({product}) => {
    const {currency, addToCart, removeFromCart, cartItems, navigate} = useAppContext()

    // <div onClick={()=> {navigate(`/products/${product.category.toLowerCase()}/${product._id}`); scrollTo(0,0)}} 
            // className="border border-gray-500/20 rounded-md md:px-4 px-3 py-2 bg-white min-w-50 max-w-50 w-full">

   
    const isInStock = product.inStock !== false;

    return product && (
        <div onClick={()=> {navigate(`/products/${product.category.toLowerCase()}/${product._id}`); scrollTo(0,0)}} 
            className="relative border border-gray-500/20 rounded-md md:px-4 px-3 py-2 bg-white w-full hover:shadow-md transition">
            
            {!isInStock && (
                <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow z-10 uppercase tracking-wide">
                    Out of Stock
                </span>
            )}

            <div className="group cursor-pointer flex items-center justify-center px-2">
                <img className={`group-hover:scale-105 transition max-w-26 md:max-w-36 ${!isInStock ? 'opacity-60 grayscale-[20%]' : ''}`} src={product.image[0]} alt={product.name} />
            </div>
            <div className="text-gray-500/60 text-sm">
                <p>{product.category}</p>
                <p className="text-gray-700 font-medium text-lg truncate w-full">{product.name}</p>
                <div className="flex items-center gap-0.5">
                    {Array(5).fill('').map((_, i) => (
                           <img key={i} className="md:w-3.5 w3" src={i < 4 ? assets.star_icon : assets.star_dull_icon} alt=""/>
                    ))}
                    <p>(4)</p>
                </div>
                <div className="flex items-end justify-between mt-3">
                    <p className="md:text-xl text-base font-medium text-primary">
                        {currency}{product.offerPrice}{" "} <span className="text-gray-500/60 md:text-sm text-xs line-through">{currency}{product.price}</span>
                    </p>
                    <div onClick={(e) => { e.stopPropagation(); }} className="text-primary">
                        {!isInStock ? (
                            <button disabled className="bg-red-50 text-red-600 border border-red-200 text-xs px-2 py-1.5 rounded font-semibold cursor-not-allowed select-none">
                                Out of Stock
                            </button>
                        ) : !cartItems[product._id] ? (
                            <button className="flex items-center justify-center gap-1 bg-primary/10 border border-primary/40 md:w-[80px] w-[64px] h-[34px] rounded cursor-pointer" onClick={() => addToCart(product._id)} >
                                <img src={assets.cart_icon} alt="cart_icon"/>
                                Add
                            </button>
                        ) : (
                            <div className="flex items-center justify-center gap-2 md:w-20 w-16 h-[34px] bg-primary/25 rounded select-none">
                                <button onClick={() => {removeFromCart(product._id)}} className="cursor-pointer text-md px-2 h-full" >
                                    -
                                </button>
                                <span className="w-5 text-center">{cartItems[product._id]}</span>
                                <button onClick={() => {addToCart(product._id)}} className="cursor-pointer text-md px-2 h-full" >
                                    +
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;