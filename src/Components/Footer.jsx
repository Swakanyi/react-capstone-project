import React from 'react'
import { Link } from 'react-router-dom'
import freshlogo from "../assets/FreshBasket Logo with Fresh Greens and Sunny Yellows.png"

function Footer() {
  return (
    <>
    <footer className="bg-gray-100 text-gray-800 py-10 px-6">
  <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
    
    <div>
      <Link to="/homepage">
  <img
    src={ freshlogo}
    width="100"
    height="120"
    alt="logo"
  />
</Link>
      <p className="font-semibold">Hand-selected Vegetables & Fruits For You.</p>
      
    </div>

    
    <div>
      <h6 className="text-lg font-semibold mb-4">OUR STORE</h6>
      <ul className="space-y-2 text-gray-600">
        <li><a href="#" className="hover:text-indigo-600">Who we Are</a></li>
        <li><a href="#" className="hover:text-indigo-600">Gift Cards</a></li>
        <li><a href="#" className="hover:text-indigo-600">Get in Touch</a></li>
        <li><a href="#" className="hover:text-indigo-600">Advertisement</a></li>
      </ul>
    </div>

    
    <div>
      <h6 className="text-lg font-semibold mb-4">CUSTOMER SERVICES</h6>
      <ul className="space-y-2 text-gray-600">
        <li><a href="#" className="hover:text-indigo-600">FAQs</a></li>
        <li><a href="#" className="hover:text-indigo-600">T & Cs</a></li>
        <li><a href="#" className="hover:text-indigo-600">Privacy Policy</a></li>
        
      </ul>
    </div>

    
    <div>
      <h6 className="text-lg font-semibold mb-4">CONTACT INFORMATION</h6>
      <ul className="space-y-2 text-gray-600">
        <li><a href="#" className="hover:text-indigo-600">+254 718 250182</a></li>
        <li><a href="#" className="hover:text-indigo-600">order@freshbasket.com</a></li>
        <li><a href="#" className="hover:text-indigo-600">Cookie policy</a></li>
      </ul>
    </div>
  </div>

  
  <div className="mt-10 border-t border-gray-300 pt-6 text-center text-sm text-gray-500">
    © {new Date().getFullYear()} FreshBasket. All rights reserved.
  </div>
</footer>

    </>
  )
}

export default Footer
