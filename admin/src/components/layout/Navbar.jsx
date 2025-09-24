import React from 'react'
import { assets } from '../../assets/assets'

const Navbar = ({ setToken }) => {
  return (
    <div className='sticky top-0 z-40 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-200'>
      <div className='mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8'>
        <div className='flex h-14 items-center justify-between'>
          <img className='h-8 w-auto' src={assets.logo} alt="logo" />
          <button
            className='inline-flex items-center rounded-full bg-gray-800 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800'
            onClick={() => {
              setToken("");
              localStorage.removeItem("token");
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navbar