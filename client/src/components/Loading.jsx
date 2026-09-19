import React, { useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'

const Loading = () => {

    const { navigate, axios, setCartItems } = useAppContext()
    let { search } = useLocation()
    const query = new URLSearchParams(search)
    const nextUrl = query.get('next');
    const success = query.get('success');
    const orderId = query.get('orderId');

    const verifyPayment = async () => {
        try {
            const { data } = await axios.post('/api/order/verifyStripe', { success, orderId })
            if (data.success) {
                toast.success(data.message)
                setCartItems({})
                navigate('/my-orders')
            } else {
                toast.error(data.message)
                navigate('/cart')
            }
        } catch (error) {
            toast.error(error.message)
            navigate('/cart')
        }
    }

    useEffect(() => {
        if (orderId && success !== null) {
            verifyPayment()
        } else if (nextUrl) {
            setTimeout(() => {
                navigate(`/${nextUrl}`)
            }, 5000)
        }
    }, [nextUrl, success, orderId])

  return (
    <div className='flex justify-center items-center h-screen'>
      <div className='animate-spin rounded-full h-24 w-24 border-4 border-gray-300 border-t-primary'></div>
    </div>
  )
}

export default Loading
