import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getOrders } from '../firebase';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';

function MyAccount() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const allOrders = await getOrders();
      // Filter orders for current user
      const userOrders = allOrders.filter(order => 
        order.customerEmail === user.email || order.customerId === user.uid
      );
      setOrders(userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'picked_up': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'in_transit': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Order Received';
      case 'confirmed': return 'Order Confirmed';
      case 'ready': return 'Ready for Pickup';
      case 'picked_up': return 'Out for Delivery';
      case 'in_transit': return 'On the Way';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getStatusProgress = (status) => {
    const statuses = ['confirmed', 'ready', 'picked_up', 'in_transit', 'delivered'];
    const currentIndex = statuses.indexOf(status);
    return ((currentIndex + 1) / statuses.length) * 100;
  };

  const goBackToDashboard = () => {
    navigate('/customer');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Please log in to view your account</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header  */}
      <div className="bg-green-800 text-white p-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
               onClick={() => navigate('/customer')}
              className="flex items-center gap-2 text-white hover:text-green-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Shop
            </button>
            <div className="h-6 w-px bg-green-600"></div>
            <h1 className="text-xl font-bold">My Account</h1>
          </div>
          <div className="text-sm">
            Welcome, {user?.displayName || user?.email?.split('@')[0]}!
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Account Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center">
                
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                  <p className="text-sm text-gray-500">Total Orders</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center">
                
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {orders.filter(order => order.status === 'delivered').length}
                  </p>
                  <p className="text-sm text-gray-500">Delivered</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center">
                
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {orders.filter(order => ['confirmed', 'ready', 'picked_up', 'in_transit'].includes(order.status)).length}
                  </p>
                  <p className="text-sm text-gray-500">In Progress</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center">
                
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    Ksh {orders.reduce((sum, order) => sum + (order.grandTotal || order.total || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">Total Spent</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-md">
            
            <div className="border-b border-gray-200">
              <nav className="flex px-6">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'orders'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    My Orders
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'profile'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </div>
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'orders' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">Order History</h3>
                    <button
                      onClick={fetchUserOrders}
                      className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                    >
                      Refresh
                    </button>
                  </div>

                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      <span className="ml-3 text-gray-600">Loading orders...</span>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      
                      <p className="text-xl text-gray-500 mb-2">No orders yet</p>
                      <p className="text-gray-400 mb-4">Your order history will appear here</p>
                      <button
                        onClick={goBackToDashboard}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4">
                            <div className="mb-4 lg:mb-0">
                              <h4 className="font-semibold text-gray-900 mb-1">
                                Order #{order.id?.slice(-8) || 'N/A'}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <div className="text-left lg:text-right">
                              <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                {getStatusText(order.status)}
                              </div>
                              <p className="text-lg font-bold text-gray-900 mt-1">
                                Ksh {(order.grandTotal || order.total || 0).toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-500">
                                {order.items?.length || 0} items
                              </p>
                            </div>
                          </div>

                          {/* Order Bar */}
                          {order.status !== 'cancelled' && order.status !== 'delivered' && (
                            <div className="mb-6">
                              <div className="flex justify-between text-xs text-gray-500 mb-2">
                                <span>Confirmed</span>
                                <span>Ready</span>
                                <span>Picked Up</span>
                                <span>In Transit</span>
                                <span>Delivered</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${getStatusProgress(order.status)}%` }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {/* Order Items */}
                          <div className="border-t pt-4 mb-4">
                            <p className="font-medium text-gray-900 mb-3">Order Items:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {order.items?.map((item, index) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                  <div>
                                    <span className="font-medium text-gray-900">{item.name}</span>
                                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                  </div>
                                  <span className="font-medium text-green-600">Ksh {(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Delivery Address */}
                          {order.deliveryAddress && (
                            <div className="border-t pt-4">
                              <p className="font-medium text-gray-900 mb-2">Delivery Address:</p>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-700">
                                  {order.deliveryAddress.addressLine1}
                                  {order.deliveryAddress.addressLine2 && `, ${order.deliveryAddress.addressLine2}`}
                                </p>
                                <p className="text-sm text-gray-700">
                                  {order.deliveryAddress.city} {order.deliveryAddress.postalCode}
                                </p>
                                <p className="text-sm text-gray-700 mt-1">
                                  Phone: {order.customerPhone || order.deliveryAddress.phoneNumber}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'profile' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">Profile Information</h3>
                  
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center mb-6">
                      <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {(user?.displayName || user?.email)?.[0]?.toUpperCase()}
                      </div>
                      <div className="ml-6">
                        <h4 className="text-xl font-semibold text-gray-900">
                          {user?.displayName || user?.email?.split('@')[0]}
                        </h4>
                        <p className="text-gray-600">{user?.email}</p>
                        <p className="text-sm text-green-600 mt-1">Customer Account</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                        <input
                          type="text"
                          value={user?.displayName || ''}
                          disabled
                          placeholder="Not set"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start">
                        
                        <div className="ml-3">
                          <p className="text-lg text-blue-800">
                            <strong>Account Settings:</strong> Profile editing features will be available soon. 
                            For now, you can contact support at +254718250182 to update your account information.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default MyAccount;