import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import toast from 'react-hot-toast'

const Orders = () => {
    const {currency, axios} = useAppContext()
    const [orders, setOrders] = useState([])
    const [statusFilter, setStatusFilter] = useState('All')

    const fetchOrders = async (silent = false) => {
        try {
            const { data } = await axios.get('/api/order/seller');
            if (data.success) {
                setOrders(data.orders);
            } else if (!silent) {
                toast.error(data.message);
            }
        } catch (error) {
            if (!silent) {
                toast.error(error.message);
            }
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
                window.dispatchEvent(new CustomEvent('order-updated'));
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchOrders();

        // Auto-refresh orders every 3 seconds for real-time updates
        const interval = setInterval(() => {
            fetchOrders(true);
        }, 3000);

        const handleRefetch = () => {
            fetchOrders(true);
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
    }, []);

    // Stat calculations
    const totalOrdersCount = orders.length;
    const deliveredOrdersCount = orders.filter(order => order.status === 'Delivered').length;
    const cancelledOrdersCount = orders.filter(order => 
        order.status === 'Cancelled' || (order.items.length > 0 && order.items.every(i => (i.status || order.status) === 'Cancelled'))
    ).length;

    // Total earnings from Delivered or Paid orders
    const totalEarnings = orders
        .filter(order => order.status === 'Delivered' || order.isPaid)
        .reduce((acc, order) => acc + (order.amount || 0), 0);

    const filteredOrders = orders.filter(order => {
        if (statusFilter === 'All') return true;
        if (statusFilter === 'Delivered') return order.status === 'Delivered';
        if (statusFilter === 'Cancelled') {
            return order.status === 'Cancelled' || (order.items.length > 0 && order.items.every(i => (i.status || order.status) === 'Cancelled'));
        }
        return order.status === statusFilter;
    });

    return (
        <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll'>
            <div className="md:p-10 p-4 space-y-4">
                
                {/* Summary Dashboard Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
                    <div 
                        onClick={() => setStatusFilter('All')} 
                        className={`bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3 cursor-pointer transition ${statusFilter === 'All' ? 'ring-2 ring-blue-500 border-blue-400' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg font-bold text-xl">
                            📦
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Total Orders</p>
                            <p className="text-xl font-bold text-gray-800">{totalOrdersCount}</p>
                        </div>
                    </div>

                    <div 
                        onClick={() => setStatusFilter('Delivered')} 
                        className={`bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3 cursor-pointer transition ${statusFilter === 'Delivered' ? 'ring-2 ring-green-500 border-green-400' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                        <div className="p-3 bg-green-50 text-green-600 rounded-lg font-bold text-xl">
                            ✅
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Delivered</p>
                            <p className="text-xl font-bold text-green-700">{deliveredOrdersCount}</p>
                        </div>
                    </div>

                    <div 
                        onClick={() => setStatusFilter('Cancelled')} 
                        className={`bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3 cursor-pointer transition ${statusFilter === 'Cancelled' ? 'ring-2 ring-red-500 border-red-400' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg font-bold text-xl">
                            ❌
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Cancelled</p>
                            <p className="text-xl font-bold text-red-600">{cancelledOrdersCount}</p>
                        </div>
                    </div>

                    <div 
                        className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3"
                    >
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg font-bold text-xl">
                            💰
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Total Earnings</p>
                            <p className="text-xl font-bold text-emerald-700">{currency}{totalEarnings}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between max-w-4xl pt-2">
                    <h2 className="text-lg font-medium">
                        Orders List {statusFilter !== 'All' && <span className="text-sm font-normal text-gray-500">({statusFilter})</span>}
                    </h2>
                    {statusFilter !== 'All' && (
                        <button 
                            onClick={() => setStatusFilter('All')}
                            className="text-xs text-primary font-medium hover:underline cursor-pointer"
                        >
                            Show All Orders
                        </button>
                    )}
                </div>

                {filteredOrders.length === 0 ? (
                    <p className="text-gray-500">No orders found.</p>
                ) : (
                    filteredOrders.map((order, index) => (
                        <div key={index} className="flex flex-col md:items-center md:flex-row gap-5 justify-between p-5 max-w-4xl rounded-md border border-gray-300 bg-white shadow-sm hover:shadow-md transition">

                            <div className="flex gap-4 max-w-80">
                                <img className="w-12 h-12 object-cover rounded bg-gray-100 p-2" src={assets.box_icon} alt="boxIcon" />
                                <div>
                                    {order.items.map((item, idx) => {
                                        const itemStatus = item.status || order.status;
                                        const isCancelled = itemStatus === 'Cancelled';

                                        return (
                                            <div key={idx} className="flex items-center gap-2 mb-1">
                                                <p className={`font-medium ${isCancelled ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                                    {item.product?.name || "Product"}{" "} 
                                                    <span className={isCancelled ? 'text-gray-400 font-normal' : 'text-primary font-semibold'}>x {item.quantity}</span>
                                                </p>
                                                {isCancelled && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-red-100 text-red-700 border border-red-200">
                                                        Cancelled
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
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
