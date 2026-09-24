import React, { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const Navbar = () => {
    const [open, setOpen] = useState(false)
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const profileMenuRef = useRef(null)
    const {user, setUser, setShowUserLogin, navigate, setSearchQuery, searchQuery, getCartCount, axios} = useAppContext();

    const logout = async ()=>{
      try {
        const { data } = await axios.get('/api/user/logout')
        if(data.success){
          toast.success(data.message)
          setUser(null);
          navigate('/')
        }else{
          toast.error(data.message)
        }
      } catch (error) {
        toast.error(error.message)
      }
    }

    useEffect(()=>{
      if(searchQuery.length > 0){
        navigate("/products")
      }
    },[searchQuery])

    // Close profile menu when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
          setShowProfileMenu(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative z-50 transition-all">

      <NavLink to='/' onClick={()=> setOpen(false)}>
        <img className="h-9" src={assets.logo} alt="logo" />
      </NavLink>

      <div className="hidden md:flex items-center gap-8">
        <NavLink to='/'>Home</NavLink>
        <NavLink to='/products'>All Product</NavLink>
        <NavLink to='/'>Contact</NavLink>

        <div className="hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-3 rounded-full">
          <input onChange={(e)=> setSearchQuery(e.target.value)} className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500" type="text" placeholder="Search products" />
         <img src={assets.search_icon} alt='search' className='w-4 h-4'/>
        </div>

        <div onClick={()=> navigate("/cart")} className="relative cursor-pointer">
          <img src={assets.nav_cart_icon} alt='cart' className='w-6 opacity-80'/>
          <button className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full">{getCartCount()}</button>
        </div>

      {!user ? ( <button onClick={()=> setShowUserLogin(true)} className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition text-white rounded-full">
          Login
        </button>)
        :
        (
          <div ref={profileMenuRef} className='relative group cursor-pointer' onClick={() => setShowProfileMenu(prev => !prev)}>
            <img src={assets.profile_icon} className='w-10' alt="" />
            <ul className={`${showProfileMenu ? 'block' : 'hidden'} group-hover:block absolute top-10 right-0 bg-white shadow border border-gray-200 py-2.5 w-30 rounded-md text-sm z-50`}>
              <li onClick={(e)=>{ e.stopPropagation(); setShowProfileMenu(false); navigate("/my-orders"); }} className='p-1.5 pl-3 hover:bg-primary/10 cursor-pointer'>My Orders</li>
              <li onClick={(e)=>{ e.stopPropagation(); setShowProfileMenu(false); logout(); }} className='p-1.5 pl-3 hover:bg-primary/10 cursor-pointer'>Logout</li>
            </ul>
          </div>
        )}
      </div>

      <div className='flex items-center gap-6 md:hidden'>
        <div onClick={()=> navigate("/cart")} className="relative cursor-pointer">
          <img src={assets.nav_cart_icon} alt='cart' className='w-6 opacity-80'/>
          <button className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full">{getCartCount()}</button>
        </div>
        <button onClick={() => setOpen(prev => !prev)} aria-label="Menu" className="cursor-pointer">
          <img src={assets.menu_icon} alt='menu'/>
        </button>
      </div>
      

      { open && (
        <div className={`${open ? 'flex' : 'hidden'} absolute top-full left-0 w-full bg-white shadow-md py-4 flex-col items-start gap-2 px-5 text-sm md:hidden z-50`}>
          <NavLink to="/" onClick={()=> setOpen(false)}>Home</NavLink>
          <NavLink to="/products" onClick={()=> setOpen(false)}>All Product</NavLink>
          {user && 
            <NavLink to="/my-orders" onClick={()=> setOpen(false)}>My Orders</NavLink>
          }
          <NavLink to="/" onClick={()=> setOpen(false)}>Contact</NavLink>

          {!user ? (
            <button onClick={()=>{
              setOpen(false);
              setShowUserLogin(true);
            }} className="cursor-pointer px-6 py-2 mt-2 bg-primary hover:bg-primary-dull transition text-white rounded-full text-sm">
            Login
          </button>
          ) : (
            <button onClick={() => { setOpen(false); logout(); }} className="cursor-pointer px-6 py-2 mt-2 bg-primary hover:bg-primary-dull transition text-white rounded-full text-sm">
            Logout
          </button>
          )}
        </div>
      )}

    </nav>
  )
}

export default Navbar

