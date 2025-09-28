import React, { useEffect, useState } from "react";
import {
  auth,
  addProduct,
  updateProduct,
  deleteProduct,
  getVendorProducts,
  getOrders,
  updateOrder,
} from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";

const CLOUD_NAME = "dh3nh9mck";
const UPLOAD_PRESET = "fresh-basket";
const API_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

function VendorDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "",
    subcategory: "",
    stock: "",
    unit: "",
    imageFile: null,
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const navigate = useNavigate();

  // Categories dropdown
  const categories = [
    "Vegetables",
    "Dairy",
    "Meat",
    "Pantry",
    "Drinks",
    "Fruits",
  ];

  // Get vendor name from email
  const getVendorName = () => {
    if (auth.currentUser?.email) {
      const emailName = auth.currentUser.email.split("@")[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return "Vendor";
  };

  // Fetch vendor data
  const fetchData = async () => {
    if (!auth.currentUser) return;

    try {
      setLoading(true);
      const [productsData, ordersData] = await Promise.all([
        getVendorProducts(auth.currentUser.uid),
        getOrders(),
      ]);

      setProducts(productsData || []);

      
      console.log("Current vendor UID:", auth.currentUser.uid);
      console.log("Total orders fetched:", ordersData?.length);
      console.log("Sample order structure:", ordersData?.[0]);

      
      ordersData?.forEach((order, index) => {
        console.log(`Order ${index}:`, {
          id: order.id,
          items: order.items,
          itemsType: typeof order.items,
          isArray: Array.isArray(order.items),
          itemsLength: order.items?.length,
        });
      });

      
      const allVendorIds =
        ordersData?.reduce((acc, order) => {
          if (Array.isArray(order.items)) {
            const vendorIds = order.items
              .map((item) => item.vendorId)
              .filter(Boolean);
            return [...acc, ...vendorIds];
          }
          return acc;
        }, []) || [];

      console.log("All vendor IDs in orders:", [...new Set(allVendorIds)]);

      
      const vendorOrders =
        ordersData?.filter((order) => {
          
          if (!Array.isArray(order.items)) {
            console.log(`Order ${order.id} has invalid items:`, order.items);
            return false;
          }

          return order.items.some((item) => {
            console.log(
              `Checking item: ${item.name}, vendorId: ${
                item.vendorId
              }, matches: ${item.vendorId === auth.currentUser.uid}`
            );
            return item.vendorId === auth.currentUser.uid;
          });
        }) || [];

      console.log("Filtered vendor orders:", vendorOrders.length);
      console.log("Vendor orders:", vendorOrders);

      const sortedVendorOrders = vendorOrders.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setOrders(sortedVendorOrders);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add product
  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!newProduct.name || !newProduct.price || !newProduct.imageFile) {
      alert("Name, Price, and Image are required!");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", newProduct.imageFile);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      // Upload image to Cloudinary
      const uploadResponse = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(
          `Cloudinary upload failed: ${JSON.stringify(errorData)}`
        );
      }
      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.secure_url;

      // Create a new object without the imageFile
      const productDataToSave = {
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        vendorId: auth.currentUser.uid,
        vendorEmail: auth.currentUser.email,
        imageUrl, // URL from Cloudinary
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      // Delete the imageFile property from the object
      delete productDataToSave.imageFile;

      // 2. Save the new object to Firestore
      await addProduct(productDataToSave);

      setNewProduct({
        name: "",
        price: "",
        category: "",
        subcategory: "",
        stock: "",
        unit: "",
        imageFile: null,
      });
      alert("Product added successfully!");
      fetchData();
    } catch (err) {
      console.error("Error adding product:", err);
      alert("Failed to add product: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrder(orderId, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      alert("Order status updated successfully!");
      fetchData();
    } catch (error) {
      alert("Error updating order status: " + error.message);
    }
  };

  // Filter orders based on search and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      !searchTerm ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = orderFilter === "all" || order.status === orderFilter;

    return matchesSearch && matchesFilter;
  });

  // Get stats
  const getStats = () => {
    const totalRevenue = orders
      .filter((order) => order.status === "delivered")
      .reduce((sum, order) => sum + order.total, 0);

    const pendingOrders = orders.filter(
      (order) => order.status === "pending"
    ).length;
    const completedOrders = orders.filter(
      (order) => order.status === "delivered"
    ).length;

    return { totalRevenue, pendingOrders, completedOrders };
  };

  const stats = getStats();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      alert("Logout failed: " + error.message);
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-orange-100 text-orange-800";
      case "ready":
        return "bg-purple-100 text-purple-800";
      case "picked_up":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
        return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  // Add delete product function
  const handleDeleteProduct = async (productId, productName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${productName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setLoading(true);
     
      await deleteProduct(productId);
      alert("Product deleted successfully!");
      fetchData();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Add edit product function
  const handleEditProduct = async (productData) => {
    try {
      setLoading(true);
      
      await updateProduct(editingProduct.id, {
        ...productData,
        price: Number(productData.price),
        stock: Number(productData.stock),
        updatedAt: new Date(),
      });
      alert("Product updated successfully!");
      setShowEditModal(false);
      setEditingProduct(null);
      fetchData();
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
  
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6 border-b">
            <div className="flex items-center">
              <div className="w-15 h-15 text-lg bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                {getVendorName().charAt(0)}
              </div>
              <div className="ml-3">
                <p className="text-lg text-gray-600">Welcome back,</p>
                <p className="font-semibold text-gray-800">{getVendorName()}</p>
              </div>
            </div>
          </div>

          <nav className="mt-6">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full text-left px-6 py-3 flex items-center transition-colors ${
                activeTab === "dashboard"
                  ? "bg-green-50 text-green-600 border-r-2 border-green-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`w-full text-left px-6 py-3 flex items-center transition-colors ${
                activeTab === "products"
                  ? "bg-green-50 text-green-600 border-r-2 border-green-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              My Products
              <span className="ml-auto bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                {products.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full text-left px-6 py-3 flex items-center transition-colors ${
                activeTab === "orders"
                  ? "bg-green-50 text-green-600 border-r-2 border-green-600"
                  : "text-gray-600 hover:bg-gray-50"
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
              onClick={() => setActiveTab("analytics")}
              className={`w-full text-left px-6 py-3 flex items-center transition-colors ${
                activeTab === "analytics"
                  ? "bg-green-50 text-green-600 border-r-2 border-green-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Analytics
            </button>
          </nav>

          <div className="absolute bottom-0 w-64 p-6 border-t">
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
            >
              {" "}
              Logout
            </button>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 overflow-auto">
          <div className="bg-white shadow-sm border-b px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">
                {activeTab === "dashboard" && "Dashboard Overview"}
                {activeTab === "products" && "My Products"}
                {activeTab === "orders" && "Order Management"}
                {activeTab === "analytics" && "Analytics & Reports"}
              </h1>
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                    <div className="flex items-center">
                      <div className="flex-shrink-0"></div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-lg font-medium text-gray-500 truncate">
                            Total Products
                          </dt>
                          <dd className="text-lg font-semibold text-gray-900">
                            {products.length}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
                    <div className="flex items-center">
                      <div className="flex-shrink-0"></div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-lg font-medium text-gray-500 truncate">
                            Pending Orders
                          </dt>
                          <dd className="text-lg font-semibold text-gray-900">
                            {stats.pendingOrders}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                    <div className="flex items-center">
                      <div className="flex-shrink-0"></div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-lg font-medium text-gray-500 truncate">
                            Completed Orders
                          </dt>
                          <dd className="text-lg font-semibold text-gray-900">
                            {stats.completedOrders}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                    <div className="flex items-center">
                      <div className="flex-shrink-0"></div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-lg font-medium text-gray-500 truncate">
                            Total Revenue
                          </dt>
                          <dd className="text-lg font-semibold text-gray-900">
                            Ksh {stats.totalRevenue}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Orders*/}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Recent Orders
                    </h3>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      View All Orders
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No orders yet</p>
                      <p className="text-sm">
                        Orders will appear here when customers place them
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 5).map((order) => (
                        <div
                          key={order.id}
                          className="border rounded-lg p-4 hover:bg-gray-50"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">
                                Order #{order.id?.slice(-8)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {order.customerEmail}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">Ksh {order.total}</p>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${getOrderStatusColor(
                                  order.status
                                )}`}
                              >
                                {order.status?.charAt(0).toUpperCase() +
                                  order.status?.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === "products" && (
              <div>
                {/* Add Product Form */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Add New Product
                  </h3>
                  <form onSubmit={handleAddProduct}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="Product Name"
                        value={newProduct.name}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, name: e.target.value })
                        }
                        className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Price (Ksh)"
                        value={newProduct.price}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            price: e.target.value,
                          })
                        }
                        className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                      <select
                        value={newProduct.category}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            category: e.target.value,
                          })
                        }
                        className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Subcategory"
                        value={newProduct.subcategory}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            subcategory: e.target.value,
                          })
                        }
                        className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        placeholder="Stock Quantity"
                        value={newProduct.stock}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            stock: e.target.value,
                          })
                        }
                        className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Unit (e.g. 1kg, 500ml)"
                        value={newProduct.unit}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, unit: e.target.value })
                        }
                        className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div className="mt-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            imageFile: e.target.files[0],
                          })
                        }
                        className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                      />
                    </div>

                    {newProduct.imageFile && (
                      <div className="mt-4">
                        <img
                          src={URL.createObjectURL(newProduct.imageFile)}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      className="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Add Product
                    </button>
                  </form>
                </div>

                {/* Products Grid */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    My Products ({products.length})
                  </h3>

                  {products.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-lg mb-2">No products yet</p>
                      <p>Add your first product using the form above</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative"
                        >
                          
                          <div className="absolute top-2 right-2 flex gap-2">
  <button
    onClick={() => {
      setEditingProduct(product);
      setShowEditModal(true);
    }}
    className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors shadow-sm text-sm"
  >
    Edit
  </button>

  <button
    onClick={() => handleDeleteProduct(product.id, product.name)}
    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors shadow-sm text-sm"
  >
    Delete
  </button>
</div>


                          
                          {product.imageUrl && (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-40 object-cover rounded-lg mb-4"
                            />
                          )}

                          
                          <div className="space-y-2">
                            <h4 className="font-semibold text-lg pr-16">
                              {product.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {product.category}
                            </p>
                            {product.subcategory && (
                              <p className="text-xs text-gray-400">
                                {product.subcategory}
                              </p>
                            )}
                            <p className="text-lg font-bold text-green-600">
                              Ksh {product.price}
                            </p>
                            {product.unit && (
                              <p className="text-sm text-gray-500">
                                Per {product.unit}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-sm px-2 py-1 rounded-full ${
                                  product.stock > 20
                                    ? "bg-green-100 text-green-800"
                                    : product.stock > 0
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {product.stock} in stock
                              </span>
                            </div>

                            
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

        
     {/* Edit Product Modal */}
{showEditModal && editingProduct && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Edit Product</h3>
          <button
            onClick={() => {
              setShowEditModal(false);
              setEditingProduct(null);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const productData = Object.fromEntries(formData.entries());
          handleEditProduct(productData);
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="name"
              type="text"
              defaultValue={editingProduct.name}
              placeholder="Product Name"
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
            <input
              name="price"
              type="number"
              defaultValue={editingProduct.price}
              placeholder="Price (Ksh)"
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
            <select
              name="category"
              defaultValue={editingProduct.category}
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <input
              name="subcategory"
              type="text"
              defaultValue={editingProduct.subcategory}
              placeholder="Subcategory"
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <input
              name="stock"
              type="number"
              defaultValue={editingProduct.stock}
              placeholder="Stock Quantity"
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <input
              name="unit"
              type="text"
              defaultValue={editingProduct.unit}
              placeholder="Unit (e.g. 1kg, 500ml)"
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setShowEditModal(false);
                setEditingProduct(null);
              }}
              className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-medium"
            >
              Update Product
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}     

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div>
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Search orders by ID or customer email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <select
                        value={orderFilter}
                        onChange={(e) => setOrderFilter(e.target.value)}
                        className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="all">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="picked_up">Picked Up</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Orders List */}
                <div className="bg-white rounded-lg shadow-md">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold">
                      Order Management ({filteredOrders.length} orders)
                    </h3>
                  </div>

                  {filteredOrders.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                      <p className="text-lg mb-2">No orders found</p>
                      <p>Orders matching your criteria will appear here</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {filteredOrders.map((order) => (
                        <div key={order.id} className="p-6 hover:bg-gray-50">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-lg">
                                  Order #{order.id?.slice(-8)}
                                </h4>
                                <span
                                  className={`px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(
                                    order.status
                                  )}`}
                                >
                                  {order.status?.charAt(0).toUpperCase() +
                                    order.status?.slice(1)}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                <div>
                                  <p>
                                    <span className="font-medium">
                                      Customer:
                                    </span>{" "}
                                    {order.customerEmail}
                                  </p>
                                  <p>
                                    <span className="font-medium">
                                      Order Date:
                                    </span>{" "}
                                    {new Date(
                                      order.createdAt
                                    ).toLocaleDateString()}
                                  </p>
                                  <p>
                                    <span className="font-medium">
                                      Order Time:
                                    </span>{" "}
                                    {new Date(
                                      order.createdAt
                                    ).toLocaleTimeString()}
                                  </p>
                                </div>

                                <div>
                                  <p>
                                    <span className="font-medium">Items:</span>{" "}
                                    {order.items?.length || 0}
                                  </p>
                                  <p>
                                    <span className="font-medium">
                                      Total Amount:
                                    </span>{" "}
                                    <span className="font-bold text-green-600">
                                      Ksh {order.total}
                                    </span>
                                  </p>
                                  <p>
                                    <span className="font-medium">
                                      Payment Status:
                                    </span>
                                    <span className="ml-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                      Pending
                                    </span>
                                  </p>
                                </div>

                                <div>
                                  <p>
                                    <span className="font-medium">
                                      Last Updated:
                                    </span>{" "}
                                    {new Date(
                                      order.updatedAt || order.createdAt
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="mb-4">
                            <h5 className="font-medium mb-2">Order Items:</h5>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="space-y-2">
                                {order.items?.map((item, index) => (
                                  <div
                                    key={index}
                                    className="flex justify-between items-center text-sm"
                                  >
                                    <div className="flex-1">
                                      <span className="font-medium">
                                        {item.name}
                                      </span>
                                      <span className="text-gray-500 ml-2">
                                        x{item.quantity || 1}
                                      </span>
                                    </div>
                                    <span className="font-medium">
                                      Ksh {item.price}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {order.status === "pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleOrderStatusUpdate(
                                      order.id,
                                      "confirmed"
                                    )
                                  }
                                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                >
                                  Accept Order
                                </button>
                                <button
                                  onClick={() =>
                                    handleOrderStatusUpdate(
                                      order.id,
                                      "cancelled"
                                    )
                                  }
                                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                >
                                  Decline Order
                                </button>
                              </>
                            )}

                            {order.status === "confirmed" && (
                              <button
                                onClick={() =>
                                  handleOrderStatusUpdate(order.id, "preparing")
                                }
                                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                              >
                                Start Preparing
                              </button>
                            )}

                            {order.status === "preparing" && (
                              <button
                                onClick={() =>
                                  handleOrderStatusUpdate(order.id, "ready")
                                }
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                              >
                                Mark Ready for Pickup
                              </button>
                            )}

                            {order.status === "ready" && (
                              <button
                                onClick={() =>
                                  handleOrderStatusUpdate(order.id, "picked_up")
                                }
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                              >
                                Mark as Picked Up
                              </button>
                            )}

                            {order.status !== "delivered" &&
                              order.status !== "cancelled" && (
                                <button
                                  onClick={() =>
                                    handleOrderStatusUpdate(
                                      order.id,
                                      "delivered"
                                    )
                                  }
                                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                  Mark as Delivered
                                </button>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Revenue Overview
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                        <span className="font-medium">Total Revenue</span>
                        <span className="text-xl font-bold text-green-600">
                          Ksh {stats.totalRevenue}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                        <span className="font-medium">Average Order Value</span>
                        <span className="text-xl font-bold text-blue-600">
                          Ksh{" "}
                          {stats.completedOrders > 0
                            ? Math.round(
                                stats.totalRevenue / stats.completedOrders
                              )
                            : 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Analytics */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Order Statistics
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                        <span className="font-medium">Total Orders</span>
                        <span className="text-xl font-bold text-yellow-600">
                          {orders.length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                        <span className="font-medium">Completed Orders</span>
                        <span className="text-xl font-bold text-green-600">
                          {stats.completedOrders}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                        <span className="font-medium">Pending Orders</span>
                        <span className="text-xl font-bold text-orange-600">
                          {stats.pendingOrders}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Product Performance */}
                  <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">
                      Product Performance
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Product Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Current Stock
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {product.imageUrl && (
                                    <img
                                      src={product.imageUrl}
                                      alt={product.name}
                                      className="h-8 w-8 rounded-full object-cover mr-3"
                                    />
                                  )}
                                  <div className="text-sm font-medium text-gray-900">
                                    {product.name}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {product.category}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {product.stock}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    product.stock > 20
                                      ? "bg-green-100 text-green-800"
                                      : product.stock > 0
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {product.stock > 20
                                    ? "In Stock"
                                    : product.stock > 0
                                    ? "Low Stock"
                                    : "Out of Stock"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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

export default VendorDashboard;
