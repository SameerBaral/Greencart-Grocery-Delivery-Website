import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const MyOrders = () => {

    const [myOrders, setMyOrders] = useState([])
    const [selectedItems, setSelectedItems] = useState({}) // { orderId: [itemId1, itemId2] }
    const {currency, axios, user} = useAppContext()

    const fetchMyOrders = async () => {
        try {
            const storedToken = localStorage.getItem('token');
            const { data } = await axios.get('/api/order/user', {
                params: { email: user?.email },
                headers: { token: storedToken, Authorization: `Bearer ${storedToken}` }
            })
            if (data.success) {
                setMyOrders(data.orders)
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to cancel the entire order?")) return;
        try {
            const storedToken = localStorage.getItem('token');
            const { data } = await axios.post('/api/order/cancel', 
                { orderId, userId: user?._id },
                { headers: storedToken ? { token: storedToken, Authorization: `Bearer ${storedToken}` } : {} }
            );
            if (data.success) {
                toast.success(data.message);
                fetchMyOrders();
                window.dispatchEvent(new CustomEvent('order-updated'));
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleCancelItem = async (orderId, itemId, itemName) => {
        if (!window.confirm(`Are you sure you want to cancel "${itemName || 'this item'}"?`)) return;
        try {
            const storedToken = localStorage.getItem('token');
            const { data } = await axios.post('/api/order/cancel-item', 
                { orderId, itemId, userId: user?._id },
                { headers: storedToken ? { token: storedToken, Authorization: `Bearer ${storedToken}` } : {} }
            );
            if (data.success) {
                toast.success(data.message);
                fetchMyOrders();
                window.dispatchEvent(new CustomEvent('order-updated'));
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleCancelSelectedItems = async (orderId) => {
        const itemIds = selectedItems[orderId] || [];
        if (itemIds.length === 0) return;
        if (!window.confirm(`Are you sure you want to cancel ${itemIds.length} selected item(s)?`)) return;
        try {
            const storedToken = localStorage.getItem('token');
            const { data } = await axios.post('/api/order/cancel-item', 
                { orderId, itemIds, userId: user?._id },
                { headers: storedToken ? { token: storedToken, Authorization: `Bearer ${storedToken}` } : {} }
            );
            if (data.success) {
                toast.success(data.message);
                setSelectedItems(prev => ({ ...prev, [orderId]: [] }));
                fetchMyOrders();
                window.dispatchEvent(new CustomEvent('order-updated'));
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const toggleSelectItem = (orderId, itemId) => {
        setSelectedItems(prev => {
            const list = prev[orderId] || [];
            if (list.includes(itemId)) {
                return { ...prev, [orderId]: list.filter(id => id !== itemId) };
            } else {
                return { ...prev, [orderId]: [...list, itemId] };
            }
        });
    };

    useEffect(() => {
        if (user) {
            fetchMyOrders();

            const interval = setInterval(() => {
                fetchMyOrders();
            }, 3000);

            const handleRefetch = () => {
                fetchMyOrders();
            };

            window.addEventListener('focus', handleRefetch);
            window.addEventListener('visibilitychange', handleRefetch);
            window.addEventListener('order-updated', handleRefetch);

            return () => {
                clearInterval(interval);
                window.removeEventListener('focus', handleRefetch);
                window.removeEventListener('visibilitychange', handleRefetch);
                window.removeEventListener('order-updated', handleRefetch);
            };
        }
    }, [user]);

    return (
    <div className='mt-16 pb-16 min-h-[50vh]'>
        <div className='flex flex-col items-start w-max mb-8'>
            <p className='text-2xl font-medium uppercase'>My orders</p>
            <div className='w-16 h-0.5 bg-primary rounded-full mt-1'></div>
        </div>
        {myOrders.length === 0 ? (
            <p className='text-gray-500 text-lg mt-6'>No orders found.</p>
        ) : (
            myOrders.map((order, orderIndex)=>{
                const orderItemSelection = selectedItems[order._id] || [];
                const isEntireOrderCancelled = order.status === 'Cancelled' || order.items.every(i => (i.status || order.status) === 'Cancelled');

                return (
                <div key={orderIndex} className='border border-gray-300 rounded-lg mb-8 p-5 max-w-4xl bg-white shadow-sm hover:shadow transition'>
                    <div className='flex justify-between items-start md:items-center text-gray-500 text-sm md:text-base font-medium max-md:flex-col gap-2 pb-3 border-b border-gray-200'>
                        <div>
                            <span className="text-gray-400">OrderId : </span>
                            <span className="text-gray-800 font-mono">{order._id}</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Payment : </span>
                            <span className="font-semibold text-gray-800">{order.paymentType}</span>
                            <span className={`ml-2 text-xs px-2 py-0.5 rounded font-bold ${
                                order.isRefunded || (order.paymentType === 'Online' && isEntireOrderCancelled)
                                    ? 'bg-red-100 text-red-700'
                                    : order.isPaid
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-amber-100 text-amber-700'
                            }`}>
                                {order.isRefunded || (order.paymentType === 'Online' && isEntireOrderCancelled)
                                    ? "Refunded"
                                    : order.isPaid
                                    ? "Paid ✓"
                                    : "Pending"}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-400">Total Amount : </span>
                            <span className="text-primary font-bold text-lg">{currency}{order.amount}</span>
                        </div>
                    </div>

                    {/* Order Status Header & Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 py-3 bg-gray-50/70 px-3 rounded-md my-3 border border-gray-100">
                        <div className="flex items-center gap-2 text-sm flex-wrap">
                            <span className="font-medium text-gray-600">Order Status:</span>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                isEntireOrderCancelled ? 'bg-red-100 text-red-700 border-red-300' :
                                order.status === 'Delivered' ? 'bg-green-100 text-green-700 border-green-300' :
                                order.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                                order.status === 'Packing' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                                'bg-gray-100 text-gray-800 border-gray-300'
                            }`}>
                                {isEntireOrderCancelled ? "Cancelled" : (order.status || "Order Placed")}
                            </span>
                        </div>

                        {/* Actions: Select Cancel vs Cancel Entire Order */}
                        {order.status !== 'Delivered' && !isEntireOrderCancelled && (
                            <div className="flex items-center gap-2 flex-wrap">
                                {orderItemSelection.length > 0 && (
                                    <button 
                                        onClick={() => handleCancelSelectedItems(order._id)}
                                        className="text-xs px-3 py-1.5 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition cursor-pointer shadow-sm"
                                    >
                                        Cancel Selected ({orderItemSelection.length})
                                    </button>
                                )}
                                <button 
                                    onClick={() => handleCancelOrder(order._id)}
                                    className="text-xs px-3 py-1.5 border border-red-500 text-red-600 font-medium rounded hover:bg-red-600 hover:text-white transition cursor-pointer"
                                >
                                    Cancel Entire Order
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Product Items */}
                    {order.items.map((item, itemIdx)=>{
                        const itemId = item._id || item.product?._id;
                        const itemStatus = item.status || order.status || "Order Placed";
                        const isCancelled = itemStatus === 'Cancelled';
                        const isDelivered = itemStatus === 'Delivered';
                        const isEligibleForCancel = !isCancelled && !isDelivered && order.status !== 'Delivered' && order.status !== 'Cancelled';
                        const isChecked = orderItemSelection.includes(itemId);

                        return (
                        <div key={itemIdx}
                        className={`relative bg-white ${
                            order.items.length !== itemIdx + 1 && "border-b"
                        } border-gray-200 flex flex-col md:flex-row md:items-center justify-between p-3 py-4 md:gap-6 w-full ${isCancelled ? 'opacity-75 bg-red-50/30' : ''}`}>

                            <div className='flex items-center mb-3 md:mb-0'>
                                {/* Checkbox for item selection */}
                                {isEligibleForCancel && (
                                    <input 
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => toggleSelectItem(order._id, itemId)}
                                        className="w-4 h-4 mr-3 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
                                        title="Select to cancel this item"
                                    />
                                )}

                                <div className='bg-primary/10 p-3 rounded-lg flex-shrink-0'>
                                    <img src={item.product?.image?.[0]} alt="" className={`w-14 h-14 object-cover rounded ${isCancelled ? 'grayscale' : ''}`} />
                                </div>
                                <div className='ml-4'>
                                    <h2 className={`text-base font-semibold ${isCancelled ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                        {item.product?.name || "Product"}
                                    </h2>
                                    <p className="text-xs text-gray-500">Category: {item.product?.category || "N/A"}</p>
                                    
                                    {/* Item Status Badge */}
                                    <div className="mt-1">
                                        <span className={`inline-block text-[11px] px-2 py-0.5 rounded font-medium ${
                                            isCancelled ? 'bg-red-100 text-red-700 border border-red-200' :
                                            isDelivered ? 'bg-green-100 text-green-700 border border-green-200' :
                                            'bg-blue-50 text-blue-700 border border-blue-100'
                                        }`}>
                                            Item Status: {itemStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className='flex flex-col justify-center text-xs md:text-sm text-gray-500 mb-3 md:mb-0'>
                                <p><span className="font-medium text-gray-700">Quantity:</span> {item.quantity || "1"}</p>
                                <p><span className="font-medium text-gray-700">Date:</span> {new Date(order.createdAt || order.date).toLocaleDateString('en-GB')}</p>
                                <p><span className="font-medium text-gray-700">Time:</span> {new Date(order.createdAt || order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                            </div>
                            
                            <div className="flex flex-row md:flex-col items-start md:items-end justify-between md:justify-center gap-2">
                                <p className={`text-base font-semibold ${isCancelled ? 'line-through text-gray-400' : 'text-primary'}`}>
                                    Amount: {currency}{(item.product?.offerPrice || 0) * item.quantity}
                                </p>
                            </div>

                        </div>
                        );
                    })}
                </div>
                );
            })
        )}
      
    </div>
  )
}

export default MyOrders
