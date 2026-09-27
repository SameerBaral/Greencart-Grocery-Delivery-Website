import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import toast from 'react-hot-toast'

const Orders = () => {
    const {currency, axios} = useAppContext()
    const [orders, setOrders] = useState([])

    const fetchOrders = async () =>{
        try {
            const { data } = await axios.get('/api/order/seller');
            if(data.success){
                setOrders(data.orders)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const { data } = await axios.post('/api/order/status', { orderId, status: newStatus });
            if (data.success) {
                toast.success(data.message);
                setOrders(prev => prev.map(order => {
                    if (order._id === orderId) {
                        return {
                            ...order,
                            status: newStatus,
                            isPaid: newStatus === "Delivered" ? true : order.isPaid
                        };
                    }
                    return order;
                }));
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(()=>{
        fetchOrders();
    },[])

    return (
        <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll'>
            <div className="md:p-10 p-4 space-y-4">
                <h2 className="text-lg font-medium">Orders List</h2>
                {orders.length === 0 ? (
                    <p className="text-gray-500">No orders found.</p>
                ) : (
                    orders.map((order, index) => (
                        <div key={index} className="flex flex-col md:items-center md:flex-row gap-5 justify-between p-5 max-w-4xl rounded-md border border-gray-300 bg-white shadow-sm hover:shadow-md transition">

                            <div className="flex gap-4 max-w-80">
                                <img className="w-12 h-12 object-cover rounded bg-gray-100 p-2" src={assets.box_icon} alt="boxIcon" />
                                <div>
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex flex-col">
                                            <p className="font-medium text-gray-800">
                                                {item.product?.name || "Product"}{" "} 
                                                <span className="text-primary font-semibold">x {item.quantity}</span>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="text-sm text-gray-600">
                                <p className='font-semibold text-gray-900'>
                                    {order.address?.firstName} {order.address?.lastName}
                                </p>
                                <p>{order.address?.street}, {order.address?.city}</p>
                                <p>{order.address?.state}, {order.address?.zipcode}, {order.address?.country}</p>
                                <p className="font-medium text-gray-700 mt-1">📞 {order.address?.phone}</p>
                            </div>

                            <p className="font-bold text-lg my-auto text-primary">
                                {currency}{order.amount}
                            </p>

                            <div className="flex flex-col text-sm text-gray-600 space-y-1">
                                <p><span className="font-medium text-gray-800">Method:</span> {order.paymentType}</p>
                                <p><span className="font-medium text-gray-800">Date:</span> {new Date(order.createdAt || order.date).toLocaleDateString('en-GB')}</p>
                                <p><span className="font-medium text-gray-800">Time:</span> {new Date(order.createdAt || order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                                <p>
                                    <span className="font-medium text-gray-800">Payment:</span>{" "}
                                    <span className={order.isPaid ? "text-green-600 font-bold" : "text-amber-600 font-bold"}>
                                        {order.isPaid ? "Paid ✓" : "Pending"}
                                    </span>
                                </p>
                            </div>

                            {/* Status Change Dropdown */}
                            <div className="flex flex-col gap-1 my-auto min-w-[140px]">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</label>
                                <select 
                                    value={order.status || "Order Placed"}
                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                    className={`p-2 text-sm font-medium border rounded-md outline-none cursor-pointer ${
                                        order.status === 'Delivered' ? 'bg-green-50 border-green-400 text-green-700 font-bold' :
                                        order.status === 'Cancelled' ? 'bg-red-50 border-red-400 text-red-700 font-bold' :
                                        order.status === 'Out for Delivery' ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold' :
                                        order.status === 'Packing' ? 'bg-amber-50 border-amber-400 text-amber-700 font-bold' :
                                        'bg-gray-50 border-gray-300 text-gray-800'
                                    }`}
                                >
                                    <option value="Order Placed">Order Placed</option>
                                    <option value="Packing">Packing</option>
                                    <option value="Out for Delivery">Out for Delivery</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>

                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default Orders
