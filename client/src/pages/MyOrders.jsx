import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const MyOrders = () => {

    const [myOrders, setMyOrders] = useState([])
    const {currency, axios, user} = useAppContext()

    const fetchMyOrders = async ()=>{
        try {
            const storedToken = localStorage.getItem('token');
            const { data } = await axios.get('/api/order/user', {
                params: { email: user?.email },
                headers: { token: storedToken, Authorization: `Bearer ${storedToken}` }
            })
            if(data.success){
                setMyOrders(data.orders)
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        try {
            const storedToken = localStorage.getItem('token');
            const { data } = await axios.post('/api/order/cancel', 
                { orderId, userId: user?._id },
                { headers: storedToken ? { token: storedToken, Authorization: `Bearer ${storedToken}` } : {} }
            );
            if (data.success) {
                toast.success(data.message);
                fetchMyOrders();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(()=>{
        if(user){
            fetchMyOrders()
        }
    },[user])

    return (
    <div className='mt-16 pb-16 min-h-[50vh]'>
        <div className='flex flex-col items-start w-max mb-8'>
            <p className='text-2xl font-medium uppercase'>My orders</p>
            <div className='w-16 h-0.5 bg-primary rounded-full mt-1'></div>
        </div>
        {myOrders.length === 0 ? (
            <p className='text-gray-500 text-lg mt-6'>No orders found.</p>
        ) : (
            myOrders.map((order, orderIndex)=>(
                <div key={orderIndex} className='border border-gray-300 rounded-lg mb-8 p-5 max-w-4xl bg-white shadow-sm hover:shadow transition'>
                    <div className='flex justify-between items-start md:items-center text-gray-500 text-sm md:text-base font-medium max-md:flex-col gap-2 pb-3 border-b border-gray-200'>
                        <div>
                            <span className="text-gray-400">OrderId : </span>
                            <span className="text-gray-800 font-mono">{order._id}</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Payment : </span>
                            <span className="font-semibold text-gray-800">{order.paymentType}</span>
                            <span className={`ml-2 text-xs px-2 py-0.5 rounded font-bold ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                {order.isPaid ? "Paid ✓" : "Pending"}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-400">Total Amount : </span>
                            <span className="text-primary font-bold text-lg">{currency}{order.amount}</span>
                        </div>
                    </div>

                    {/* Order Status Header & Cancel Button */}
                    <div className="flex justify-between items-center py-3 bg-gray-50/70 px-3 rounded-md my-3 border border-gray-100">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-gray-600">Order Status:</span>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                order.status === 'Delivered' ? 'bg-green-100 text-green-700 border-green-300' :
                                order.status === 'Cancelled' ? 'bg-red-100 text-red-700 border-red-300' :
                                order.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                                order.status === 'Packing' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                                'bg-gray-100 text-gray-800 border-gray-300'
                            }`}>
                                {order.status || "Order Placed"}
                            </span>
                        </div>

                        {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                            <button 
                                onClick={() => handleCancelOrder(order._id)}
                                className="text-xs px-3 py-1.5 border border-red-500 text-red-600 font-medium rounded hover:bg-red-600 hover:text-white transition cursor-pointer"
                            >
                                Cancel Order
                            </button>
                        )}
                    </div>

                    {/* Product Items */}
                    {order.items.map((item, itemIdx)=>(
                        <div key={itemIdx}
                        className={`relative bg-white text-gray-600 ${
                            order.items.length !== itemIdx + 1 && "border-b"
                        } border-gray-200 flex flex-col md:flex-row md:items-center justify-between p-3 py-4 md:gap-8 w-full`}>

                            <div className='flex items-center mb-3 md:mb-0'>
                                <div className='bg-primary/10 p-3 rounded-lg flex-shrink-0'>
                                    <img src={item.product?.image?.[0]} alt="" className='w-14 h-14 object-cover rounded' />
                                </div>
                                <div className='ml-4'>
                                    <h2 className='text-base font-semibold text-gray-800'>{item.product?.name || "Product"}</h2>
                                    <p className="text-xs text-gray-500">Category: {item.product?.category || "N/A"}</p>
                                </div>
                            </div>

                            <div className='flex flex-col justify-center text-xs md:text-sm text-gray-500 mb-3 md:mb-0'>
                                <p><span className="font-medium text-gray-700">Quantity:</span> {item.quantity || "1"}</p>
                                <p><span className="font-medium text-gray-700">Date:</span> {new Date(order.createdAt || order.date).toLocaleDateString('en-GB')}</p>
                                <p><span className="font-medium text-gray-700">Time:</span> {new Date(order.createdAt || order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                            </div>
                            <p className='text-primary text-base font-semibold'>
                                Amount: {currency}{(item.product?.offerPrice || 0) * item.quantity}
                            </p>
                            
                        </div>
                    ))}
                </div>
            ))
        )}
      
    </div>
  )
}

export default MyOrders
