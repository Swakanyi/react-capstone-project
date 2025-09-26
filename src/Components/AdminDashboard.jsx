import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { 
  getProducts, 
  getOrders, 
  updateProduct, 
  updateOrder, 
  deleteProduct, 
  deleteOrder,
  addProduct
} from "../firebase";
import Footer from "./Footer";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");
  
  // Modal states
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(null);
  
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    activeRiders: 0,
    completedOrders: 0
  });
  const navigate = useNavigate();

  // Get admin name from email
  const getAdminName = () => {
    if (auth.currentUser?.email) {
      const emailName = auth.currentUser.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return "Admin";
  };

  useEffect(() => {
    fetchData();
    // Refresh data every 30 seconds for real-time updates
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, ordersData] = await Promise.all([
        getProducts(),
        getOrders()
      ]);
      
      setProducts(productsData || []);
      setOrders(ordersData || []);
      
      // Calculate stats
      const totalRevenue = ordersData?.reduce((sum, order) => sum + (order.grandTotal || order.total || 0), 0) || 0;
      const pendingOrders = ordersData?.filter(order => order.status === "confirmed").length || 0;
      const completedOrders = ordersData?.filter(order => order.status === "delivered").length || 0;
      const activeRiders = new Set(ordersData?.filter(order => 
        ['picked_up', 'in_transit'].includes(order.status)
      ).map(order => order.riderId)).size || 0;
      
      setStats({
        totalProducts: productsData?.length || 0,
        totalOrders: ordersData?.length || 0,
        totalRevenue,
        pendingOrders,
        activeRiders,
        completedOrders
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      alert("Logout failed: " + error.message);
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrder(orderId, { 
        status: newStatus, 
        updatedAt: new Date().toISOString() 
      });
      alert("Order status updated successfully!");
      fetchData();
    } catch (error) {
      alert("Error updating order status: " + error.message);
    }
  };

  const handleMakeOrderAvailable = async (orderId) => {
    try {
      await updateOrder(orderId, { 
        status: "ready", 
        updatedAt: new Date().toISOString(),
        madeAvailableAt: new Date().toISOString()
      });
      alert("Order is now available for riders!");
      fetchData();
    } catch (error) {
      alert("Error making order available: " + error.message);
    }
  };

  const handleProductStockUpdate = async (productId, newStock) => {
    try {
      await updateProduct(productId, { 
        stock: parseInt(newStock), 
        updatedAt: new Date().toISOString() 
      });
      alert("Stock updated successfully!");
      fetchData();
    } catch (error) {
      alert("Error updating stock: " + error.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(productId);
        alert("Product deleted successfully!");
        fetchData();
      } catch (error) {
        alert("Error deleting product: " + error.message);
      }
    }
  };

  const handleAddProduct = async (productData) => {
    try {
      await addProduct(productData);
      alert("Product added successfully!");
      setShowAddProductModal(false);
      fetchData();
    } catch (error) {
      alert("Error adding product: " + error.message);
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-gray-100 text-gray-800";
      case "confirmed": return "bg-yellow-100 text-yellow-800";
      case "ready": return "bg-blue-100 text-blue-800";
      case "picked_up": return "bg-orange-100 text-orange-800";
      case "in_transit": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getFilteredOrders = () => {
    let filtered = orders;
    
    // Filter by status
    if (orderFilter !== "all") {
      filtered = filtered.filter(order => order.status === orderFilter);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerPhone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const filteredOrders = getFilteredOrders();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
        <span className="ml-4 text-gray-600 text-lg">Loading admin dashboard...</span>
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
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {getAdminName().charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Welcome back,</p>
              <p className="font-semibold text-gray-800">{getAdminName()}</p>
              <p className="text-xs text-red-600 font-medium">Administrator</p>
            </div>
          </div>
        </div>

        <nav className="mt-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full text-left px-6 py-3 flex items-center transition-colors ${
              activeTab === "overview" ? "bg-red-50 text-red-600 border-r-2 border-red-600" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            
            Overview
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full text-left px-6 py-3 flex items-center transition-colors ${
              activeTab === "orders" ? "bg-red-50 text-red-600 border-r-2 border-red-600" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            
            Order Management
            {stats.pendingOrders > 0 && (
              <span className="ml-auto bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                {stats.pendingOrders}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`w-full text-left px-6 py-3 flex items-center transition-colors ${
              activeTab === "products" ? "bg-red-50 text-red-600 border-r-2 border-red-600" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            
            Products
            <span className="ml-auto bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`w-full text-left px-6 py-3 flex items-center transition-colors ${
              activeTab === "analytics" ? "bg-red-50 text-red-600 border-r-2 border-red-600" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            
            Analytics
          </button>
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "orders" && "Order Management"}
              {activeTab === "products" && "Product Management"}
              {activeTab === "analytics" && "Analytics & Reports"}
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchData}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Refresh Data
              </button>
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
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                    
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                        <dd className="text-lg font-semibold text-gray-900">{stats.totalProducts}</dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Pending Orders</dt>
                        <dd className="text-lg font-semibold text-gray-900">{stats.pendingOrders}</dd>
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
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Riders</dt>
                        <dd className="text-lg font-semibold text-gray-900">{stats.activeRiders}</dd>
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
                        <dt className="text-sm font-medium text-gray-500 truncate">Completed Orders</dt>
                        <dd className="text-lg font-semibold text-gray-900">{stats.completedOrders}</dd>
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
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                        <dd className="text-lg font-semibold text-gray-900">Ksh {stats.totalRevenue.toLocaleString()}</dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-gray-500">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                        <dd className="text-lg font-semibold text-gray-900">{stats.totalOrders}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOrders.slice(0, 10).length > 0 ? (
                        filteredOrders.slice(0, 10).map(order => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id?.slice(0, 8)}...</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customerEmail}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Ksh {order.total}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getOrderStatusColor(order.status)}`}>
                                {order.status?.replace(/_/g, " ")}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex gap-2 items-center">
                                <button
                                  onClick={() => { setCurrentOrder(order); setShowOrderDetailsModal(true); }}
                                  className="text-blue-600 hover:text-blue-900 transition-colors"
                                >
                                  View
                                </button>
                                {order.status === "pending" && (
                                  <button
                                    onClick={() => handleOrderStatusUpdate(order.id, "confirmed")}
                                    className="text-green-600 hover:text-green-900 transition-colors"
                                  >
                                    Confirm
                                  </button>
                                )}
                                {order.status === "confirmed" && (
                                  <button
                                    onClick={() => handleMakeOrderAvailable(order.id)}
                                    className="text-orange-600 hover:text-orange-900 transition-colors"
                                  >
                                    Make Ready
                                  </button>
                                )}
                                {['ready', 'picked_up', 'in_transit'].includes(order.status) && (
                                  <button
                                    onClick={() => handleOrderStatusUpdate(order.id, "delivered")}
                                    className="text-purple-600 hover:text-purple-900 transition-colors"
                                  >
                                    Mark Delivered
                                  </button>
                                )}
                                {['pending', 'confirmed', 'ready'].includes(order.status) && (
                                  <button
                                    onClick={() => handleOrderStatusUpdate(order.id, "cancelled")}
                                    className="text-red-600 hover:text-red-900 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-6 text-gray-500">No orders found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

    {/* Orders Tab - Added missing implementation */}
          {activeTab === "orders" && (
            <div>
              {/* Search and Filter Controls */}
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <input
                      type="text"
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-2 w-64"
                    />
                    <select
                      value={orderFilter}
                      onChange={(e) => setOrderFilter(e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-2"
                    >
                      <option value="all">All Orders</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="ready">Ready</option>
                      <option value="picked_up">Picked Up</option>
                      <option value="in_transit">In Transit</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="text-sm text-gray-600">
                    Showing {filteredOrders.length} of {orders.length} orders
                  </div>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map(order => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id?.slice(0, 8)}...</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customerEmail}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customerPhone}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Ksh {order.total}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getOrderStatusColor(order.status)}`}>
                              {order.status?.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex gap-2 items-center">
                              <button
                                onClick={() => { setCurrentOrder(order); setShowOrderDetailsModal(true); }}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                              >
                                View
                              </button>
                              {order.status === "pending" && (
                                <button
                                  onClick={() => handleOrderStatusUpdate(order.id, "confirmed")}
                                  className="text-green-600 hover:text-green-900 transition-colors"
                                >
                                  Confirm
                                </button>
                              )}
                              {order.status === "confirmed" && (
                                <button
                                  onClick={() => handleMakeOrderAvailable(order.id)}
                                  className="text-orange-600 hover:text-orange-900 transition-colors"
                                >
                                  Make Ready
                                </button>
                              )}
                              {['ready', 'picked_up', 'in_transit'].includes(order.status) && (
                                <button
                                  onClick={() => handleOrderStatusUpdate(order.id, "delivered")}
                                  className="text-purple-600 hover:text-purple-900 transition-colors"
                                >
                                  Mark Delivered
                                </button>
                              )}
                              {['pending', 'confirmed', 'ready'].includes(order.status) && (
                                <button
                                  onClick={() => handleOrderStatusUpdate(order.id, "cancelled")}
                                  className="text-red-600 hover:text-red-900 transition-colors"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-6 text-gray-500">No orders found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Product Management Tab */}
          {activeTab === "products" && (
            <div>
              <div className="bg-white p-6 rounded-lg shadow-md mb-6 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">All Products</h3>
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Add New Product
                </button>
              </div>
              
              <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.length > 0 ? (
                      products.map(product => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-10 h-10">
                                {product.imageUrl ? (
                                  <img className="w-10 h-10 rounded-full object-cover" src={product.imageUrl} alt={product.name} />
                                ) : (
                                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                <div className="text-sm text-gray-500">{product.category}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Ksh {product.price}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <span>{product.stock}</span>
                              <input
                                type="number"
                                defaultValue={product.stock}
                                onBlur={(e) => {
                                  if (e.target.value !== product.stock.toString()) {
                                    handleProductStockUpdate(product.id, e.target.value);
                                  }
                                }}
                                className="w-20 border border-gray-300 rounded-lg p-1 text-center"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setCurrentProduct(product); setShowEditProductModal(true); }}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-6 text-gray-500">No products found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Analytics & Reports</h3>
              <div className="text-center py-12 text-gray-500">
                
                <p className="text-xl mb-2">Detailed Analytics Coming Soon!</p>
                <p>This section will feature charts and reports for sales, products, and customer behavior.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-xl font-semibold">Add New Product</h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const newProduct = Object.fromEntries(formData.entries());
              handleAddProduct({
                ...newProduct,
                price: parseFloat(newProduct.price),
                stock: parseInt(newProduct.stock),
                createdAt: new Date().toISOString()
              });
            }}>
              <div className="space-y-4">
                <input name="name" type="text" placeholder="Product Name" required className="w-full border rounded-lg p-2" />
                <input name="category" type="text" placeholder="Category" required className="w-full border rounded-lg p-2" />
                <input name="imageUrl" type="url" placeholder="Image URL" className="w-full border rounded-lg p-2" />
                <input name="price" type="number" placeholder="Price" step="0.01" required className="w-full border rounded-lg p-2" />
                <input name="stock" type="number" placeholder="Stock" required className="w-full border rounded-lg p-2" />
                <input name="unit" type="text" placeholder="Unit (e.g., 1kg, 500ml)" className="w-full border rounded-lg p-2" />
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddProductModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">Add Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditProductModal && currentProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-xl font-semibold">Edit Product</h3>
              <button onClick={() => setShowEditProductModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const updatedData = Object.fromEntries(formData.entries());
              try {
                await updateProduct(currentProduct.id, {
                  ...updatedData,
                  price: parseFloat(updatedData.price),
                  stock: parseInt(updatedData.stock),
                  updatedAt: new Date().toISOString()
                });
                setShowEditProductModal(false);
                alert("Product updated successfully!");
                fetchData();
              } catch (error) {
                alert("Error updating product: " + error.message);
              }
            }}>
              <div className="space-y-4">
                <input name="name" type="text" defaultValue={currentProduct.name} placeholder="Product Name" required className="w-full border rounded-lg p-2" />
                <input name="category" type="text" defaultValue={currentProduct.category} placeholder="Category" required className="w-full border rounded-lg p-2" />
                <input name="imageUrl" type="url" defaultValue={currentProduct.imageUrl} placeholder="Image URL" className="w-full border rounded-lg p-2" />
                <input name="price" type="number" defaultValue={currentProduct.price} step="0.01" placeholder="Price" required className="w-full border rounded-lg p-2" />
                <input name="stock" type="number" defaultValue={currentProduct.stock} placeholder="Stock" required className="w-full border rounded-lg p-2" />
                <input name="unit" type="text" defaultValue={currentProduct.unit} placeholder="Unit (e.g., 1kg, 500ml)" className="w-full border rounded-lg p-2" />
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={() => setShowEditProductModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetailsModal && currentOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-xl font-semibold">Order Details: {currentOrder.id?.slice(0, 8)}...</h3>
              <button onClick={() => setShowOrderDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4 text-sm">
              <p><strong>Customer:</strong> {currentOrder.customerEmail}</p>
              <p><strong>Phone:</strong> {currentOrder.customerPhone}</p>
              <p><strong>Address:</strong> {currentOrder.deliveryAddress?.addressLine1}, {currentOrder.deliveryAddress?.city}</p>
              <p><strong>Total:</strong> Ksh {currentOrder.total}</p>
              <p><strong>Status:</strong> <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getOrderStatusColor(currentOrder.status)}`}>{currentOrder.status?.replace(/_/g, " ")}</span></p>
              <h4 className="font-semibold mt-4">Items:</h4>
              <ul className="list-disc list-inside space-y-2">
                {currentOrder.items?.map((item, index) => (
                  <li key={index}>{item.quantity || 1} x {item.name} (Ksh {item.price})</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

       
      )}

    </div>
    <Footer />
    </>
  );
}

export default AdminDashboard;