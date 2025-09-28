import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { getOrders, updateOrder } from "../firebase";
import Footer from "./Footer";

function RiderDashboard() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("available");
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [earnings, setEarnings] = useState({
    today: 0,
    week: 0,
    total: 0
  });
  const navigate = useNavigate();

  // Get rider name from email
  const getRiderName = () => {
    if (auth.currentUser?.email) {
      const emailName = auth.currentUser.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return "Rider";
  };

  useEffect(() => {
    fetchOrders();
    getCurrentLocation();
    // Fetch orders every minute to keep the list updated
    const interval = setInterval(fetchOrders, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();

      // Filter orders relevant to riders (ready for pickup or in delivery process)
      const riderOrders = data.filter(order =>
        ['ready', 'picked_up', 'in_transit', 'delivered'].includes(order.status)
      );

      setOrders(riderOrders);
      calculateEarnings(riderOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateEarnings = (orders) => {
    const deliveredOrders = orders.filter(order =>
      order.status === 'delivered' && order.riderId === auth.currentUser?.uid
    );

    const today = new Date().toDateString();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const todayEarnings = deliveredOrders
      .filter(order => new Date(order.updatedAt).toDateString() === today)
      .reduce((sum, order) => sum + (order.deliveryFee || 200), 0); 

    const weekEarnings = deliveredOrders
      .filter(order => new Date(order.updatedAt) >= weekAgo)
      .reduce((sum, order) => sum + (order.deliveryFee || 200), 0);

    const totalEarnings = deliveredOrders
      .reduce((sum, order) => sum + (order.deliveryFee || 200), 0);

    setEarnings({
      today: todayEarnings,
      week: weekEarnings,
      total: totalEarnings
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date().toISOString()
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      const updateData = {
        status: newStatus,
        updatedAt: new Date().toISOString()
      };

      // Add rider ID when picking up order
      if (newStatus === 'picked_up') {
        updateData.riderId = auth.currentUser.uid;
        updateData.riderEmail = auth.currentUser.email;
      }

      await updateOrder(orderId, updateData);
      alert("Order status updated successfully!");
      fetchOrders();
    } catch (error) {
      alert("Error updating order status: " + error.message);
    }
  };

  const toggleOnlineStatus = () => {
    if (!currentLocation && !isOnline) {
      alert("Please enable location services first");
      getCurrentLocation();
      return;
    }
    setIsOnline(!isOnline);
  };

  const handleLogout = async () => {
    try {
      setIsOnline(false);
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      alert("Logout failed: " + error.message);
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case "ready": return "bg-blue-100 text-blue-800";
      case "picked_up": return "bg-orange-100 text-orange-800";
      case "in_transit": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getFilteredOrders = () => {
    let filtered = orders;

    // Filter by tab
    switch (activeTab) {
      case "available":
        filtered = filtered.filter(order => order.status === 'ready');
        break;
      case "active":
        filtered = filtered.filter(order =>
          ['picked_up', 'in_transit'].includes(order.status) && order.riderId === auth.currentUser?.uid
        );
        break;
      case "completed":
        filtered = filtered.filter(order =>
          order.status === 'delivered' && order.riderId === auth.currentUser?.uid
        );
        break;
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredOrders = getFilteredOrders();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
        <span className="ml-4 text-gray-600 text-lg">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <>
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {getRiderName().charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Welcome back,</p>
              <p className="font-semibold text-gray-800">{getRiderName()}</p>
              <div className="flex items-center mt-1">
                <div className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-xs text-gray-500">{isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </div>
        </div>

        <nav className="mt-6">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full text-left px-6 py-3 flex items-center transition-colors ${
              activeTab === "dashboard" ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
        
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab("available")}
            className={`w-full text-left px-6 py-3 flex items-center transition-colors ${
              activeTab === "available" ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            
            Available Orders
            <span className="ml-auto bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
              {orders.filter(order => order.status === 'ready').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("active")}
            className={`w-full text-left px-6 py-3 flex items-center transition-colors ${
              activeTab === "active" ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            
            Active Deliveries
            <span className="ml-auto bg-orange-500 text-white px-2 py-1 rounded-full text-xs">
              {orders.filter(order => ['picked_up', 'in_transit'].includes(order.status) && order.riderId === auth.currentUser?.uid).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("completed")}
            className={`w-full text-left px-6 py-3 flex items-center transition-colors ${
              activeTab === "completed" ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            
            Completed
          </button>

          <button
            onClick={() => setActiveTab("earnings")}
            className={`w-full text-left px-6 py-3 flex items-center transition-colors ${
              activeTab === "earnings" ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            
            Earnings
          </button>
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t space-y-3">
          <button
            onClick={toggleOnlineStatus}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              isOnline
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isOnline ? 'Go Offline' : 'Go Online'}
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center"
          >
            
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {activeTab === "dashboard" && "Dashboard Overview"}
                {activeTab === "available" && "Available Orders"}
                {activeTab === "active" && "Active Deliveries"}
                {activeTab === "completed" && "Completed Deliveries"}
                {activeTab === "earnings" && "Earnings Report"}
              </h1>
              {currentLocation && (
                <p className="text-sm text-gray-500 mt-1">
                  Location: {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                </p>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString("en-US", {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Available Orders</dt>
                        <dd className="text-lg font-semibold text-gray-900">
                          {orders.filter(order => order.status === 'ready').length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Deliveries</dt>
                        <dd className="text-lg font-semibold text-gray-900">
                          {orders.filter(order => ['picked_up', 'in_transit'].includes(order.status) && order.riderId === auth.currentUser?.uid).length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Today's Earnings</dt>
                        <dd className="text-lg font-semibold text-gray-900">Ksh {earnings.today}</dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Completed Deliveries</dt>
                        <dd className="text-lg font-semibold text-gray-900">
                          {orders.filter(order => order.status === 'delivered' && order.riderId === auth.currentUser?.uid).length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={() => setActiveTab("available")}
                    className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
                  >
                    
                    <p className="text-blue-600 font-medium">View Available Orders</p>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab("active")}
                    className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-center"
                  >
                    
                    <p className="text-orange-600 font-medium">Active Deliveries</p>
                  </button>
                  
                  <button
                    onClick={getCurrentLocation}
                    className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center"
                  >
                    
                    <p className="text-green-600 font-medium">Update Location</p>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab("earnings")}
                    className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center"
                  >
                   
                    <p className="text-purple-600 font-medium">View Earnings</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tabs Content */}
          {(activeTab === "available" || activeTab === "active" || activeTab === "completed") && (
            <div>
              
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <input
                  type="text"
                  placeholder="Search orders by ID or customer email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Orders List */}
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold">
                    {activeTab === "available" && `Available Orders (${filteredOrders.length})`}
                    {activeTab === "active" && `Active Deliveries (${filteredOrders.length})`}
                    {activeTab === "completed" && `Completed Deliveries (${filteredOrders.length})`}
                  </h3>
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    
                    <p className="text-lg mb-2">No orders found</p>
                    <p>
                      {activeTab === "available" && "Available orders will appear here"}
                      {activeTab === "active" && "Your active deliveries will appear here"}
                      {activeTab === "completed" && "Your completed deliveries will appear here"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <div key={order.id} className="p-6 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-lg">Order #{order.id?.slice(-8)}</h4>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(order.status)}`}>
                                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1).replace('_', ' ')}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div>
                                <p><span className="font-medium">Customer:</span> {order.customerEmail}</p>
                                <p><span className="font-medium">Order Date:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
                                <p><span className="font-medium">Order Time:</span> {new Date(order.createdAt).toLocaleTimeString()}</p>
                              </div>
                              
                              <div>
                                <p><span className="font-medium">Items:</span> {order.items?.length || 0}</p>
                                <p><span className="font-medium">Order Value:</span> <span className="font-bold text-green-600">Ksh {order.total}</span></p>
                                <p><span className="font-medium">Delivery Fee:</span> <span className="font-bold text-blue-600">Ksh {order.deliveryFee || 50}</span></p>
                              </div>
                              
                              <div>
                                <p className="font-medium mb-1">Delivery Address:</p>
                                <p>{order.deliveryAddress?.addressLine1}</p>
                                <p>{order.deliveryAddress?.addressLine2}</p>
                                <p>{order.deliveryAddress?.city}, {order.deliveryAddress?.postalCode}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-2">
                            {order.status === 'ready' && (
                              <button
                                onClick={() => handleOrderStatusUpdate(order.id, 'picked_up')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                              >
                                Take Order
                              </button>
                            )}
                            
                            {order.status === 'picked_up' && (
                              <button
                                onClick={() => handleOrderStatusUpdate(order.id, 'in_transit')}
                                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm"
                              >
                                Mark as In Transit
                              </button>
                            )}
                            
                            {order.status === 'in_transit' && (
                              <button
                                onClick={() => handleOrderStatusUpdate(order.id, 'delivered')}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                              >
                                Mark as Delivered
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Earnings Tab Content */}
          {activeTab === "earnings" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-6">Your Earnings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-100 p-6 rounded-lg">
                  <p className="text-sm text-gray-500 font-medium">Today's Earnings</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">Ksh {earnings.today}</p>
                </div>
                <div className="bg-gray-100 p-6 rounded-lg">
                  <p className="text-sm text-gray-500 font-medium">This Week's Earnings</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">Ksh {earnings.week}</p>
                </div>
                <div className="bg-gray-100 p-6 rounded-lg">
                  <p className="text-sm text-gray-500 font-medium">Total Earnings</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">Ksh {earnings.total}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    <Footer />
   </>
  );
}

export default RiderDashboard;