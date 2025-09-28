import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addOrder, getProducts } from "../firebase";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import video2 from "../assets/herovideo.mp4";
import Footer from "./Footer";
import Logo1 from "../assets/FreshBasket Logo with Fresh Greens and Sunny Yellows.png"


function CustomerDashboard() {
  const [allProducts, setAllProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isAddToCartModalOpen, setIsAddToCartModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
const [deliveryAddress, setDeliveryAddress] = useState({
  addressLine1: "",
  addressLine2: "",
  city: "",
  postalCode: "",
  phoneNumber: ""
});
  const navigate = useNavigate();

  // Get categories from products
  const getCategories = () => {
    if (allProducts.length === 0) return ["All"];
    const categories = [
      "All",
      ...new Set(
        allProducts.map((product) => product.category).filter(Boolean)
      ),
    ];
    return categories;
  };

  // Get subcategories for a specific category
  const getSubcategoriesForCategory = (category) => {
    if (category === "All" || allProducts.length === 0) return [];
    return allProducts
      .filter((product) => product.category === category && product.subcategory)
      .map((product) => product.subcategory)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
  };

  const categories = getCategories();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        // Filter to show only products with stock > 0
        const availableProducts = data.filter(product => product.stock > 0);
        setAllProducts(availableProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        alert("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter products based on selected category, subcategory and search
  const filteredProducts = allProducts.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    const matchesSubcategory =
      selectedSubcategory === "All" ||
      product.subcategory === selectedSubcategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesCategory && matchesSubcategory && matchesSearch;
  });

  // Open add to cart modal
  const openAddToCartModal = (product) => {
    setSelectedProduct(product);
    setSelectedQuantity(1);
    setIsAddToCartModalOpen(true);
  };

  // Add product to cart with quantity
  const addToCart = () => {
    if (!selectedProduct) return;
    
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === selectedProduct.id);
    
    if (existingItemIndex !== -1) {
      // Update quantity if product exists
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += selectedQuantity;
      setCart(updatedCart);
    } else {
      // Add new item to cart
      const cartItem = {
        ...selectedProduct,
        quantity: selectedQuantity,
        cartId: Date.now() 
      };
      setCart([...cart, cartItem]);
    }
    
    setIsAddToCartModalOpen(false);
    setSelectedProduct(null);
    setSelectedQuantity(1);
  };

  // Update cart item quantity
  const updateCartQuantity = (cartId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartId);
      return;
    }
    
    const updatedCart = cart.map(item => 
      item.cartId === cartId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
  };

  // Remove item from cart
  const removeFromCart = (cartId) => {
    const updatedCart = cart.filter(item => item.cartId !== cartId);
    setCart(updatedCart);
  };

  // cart totals
  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory("All");
  };

  // Handle subcategory selection
  const handleSubcategorySelect = (subcategory) => {
    setSelectedSubcategory(subcategory);
  };

  // To place order
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    
     // address modal 
  setShowAddressModal(true);
};


const completeOrder = async () => {
  if (!deliveryAddress.addressLine1 || !deliveryAddress.city || !deliveryAddress.phoneNumber) {
    alert("Please fill in all required delivery details");
    return;
  }

  try {
    const order = {
      items: cart.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        vendorId: item.vendorId,
        vendorEmail: item.vendorEmail,
        vendorBusinessName: item.vendorBusinessName || `Store ${item.vendorEmail?.split('@')[0]}`,
      })),
      total: getCartTotal(),
      deliveryFee: 50, 
      grandTotal: getCartTotal() + 50,
      status: "confirmed", 
      customerId: auth.currentUser?.uid,
      customerEmail: auth.currentUser?.email,
      customerPhone: deliveryAddress.phoneNumber,
      deliveryAddress: deliveryAddress,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await addOrder(order);
    alert("Order placed successfully! A rider will be assigned shortly.");
    setCart([]);
    setIsCartModalOpen(false);
    setShowAddressModal(false);
    setDeliveryAddress({
      addressLine1: "",
      addressLine2: "",
      city: "",
      postalCode: "",
      phoneNumber: ""
    });
  } catch (error) {
    console.error("Error placing order:", error);
    alert("Failed to place order. Please try again.");
  }
};

  // Logging out
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      alert("Logout failed: " + error.message);
    }
  };

  return (
    <>
      
      <div className="bg-green-800 text-white p-2 sticky top-0 z-50 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2 md:mb-0">
            
            <span className="px-10 font-bold text-sm md:text-base">
              SAME DAY DELIVERY - Orders before 12:00PM
            </span>
            <span className="text-sm md:text-base">
              | +254718250182
            </span>
          </div>

          <div className="flex items-center gap-4">
  
  <button
    onClick={() => navigate('/myaccount')}
    className="text-white hover:text-green-200 transition-colors font-medium flex items-center gap-2"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
    My Account
  </button>

  
  <button
              onClick={() => setIsCartModalOpen(true)}
              className="relative bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m-2.5-5h10m-10 0L5.4 5" />
              </svg>
              Cart
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </button>

  
  <button
    onClick={handleLogout}
    className="text-white hover:text-red-200 transition-colors font-medium"
  >
    Logout
  </button>
</div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="sticky top-16 z-40 mb-8 px-4 py-4 bg-gray-50 shadow-md border-b border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Shop by Category
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <div key={category} className="relative group">
              <button
                onClick={() => handleCategorySelect(category)}
                className={`px-6 py-3 rounded-lg transition-colors font-medium ${
                  selectedCategory === category
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-green-100 text-green-800 hover:bg-green-200"
                }`}
              >
                {category}
              </button>

              {/* Subcategory*/}
              {getSubcategoriesForCategory(category).length > 0 && (
                <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-lg border min-w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        handleCategorySelect(category);
                        handleSubcategorySelect("All");
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-green-50 transition-colors ${
                        selectedCategory === category &&
                        selectedSubcategory === "All"
                          ? "bg-green-100 text-green-800 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      All {category}
                    </button>
                    {getSubcategoriesForCategory(category).map(
                      (subcategory) => (
                        <button
                          key={subcategory}
                          onClick={() => {
                            handleCategorySelect(category);
                            handleSubcategorySelect(subcategory);
                          }}
                          className={`w-full text-left px-4 py-2 hover:bg-green-50 transition-colors ${
                            selectedCategory === category &&
                            selectedSubcategory === subcategory
                              ? "bg-green-100 text-green-800 font-medium"
                              : "text-gray-700"
                          }`}
                        >
                          {subcategory}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative w-full h-[300px] md:h-[500px] rounded-lg overflow-hidden mb-6 mx-4">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source src={video2} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div className="absolute inset-0 bg-opacity-40"></div>

        <div className="relative z-10 flex flex-col items-center justify-center text-center text-white h-full px-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-6">
            YOUR DOORSTEP GROCERY SHOP
          </h1>

          <div className="relative w-full max-w-lg mb-4">
            <input
              type="text"
              placeholder="Search for any product"
              className="w-full p-4 rounded-lg border-2 border-green-500 bg-white text-black text-lg focus:outline-none focus:border-green-600"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <svg className="absolute right-4 top-4 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-lg md:text-xl">
            Forget the mall. You order. We deliver.
          </p>
        </div>
      </div>

      {/* Products Display */}
      <div className="px-4 md:px-8 lg:px-20 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            {selectedCategory === "All"
              ? "All Products"
              : selectedSubcategory === "All"
              ? selectedCategory
              : `${selectedCategory} - ${selectedSubcategory}`}
            <span className="text-sm text-gray-500 ml-2 font-normal">
              ({filteredProducts.length} items)
            </span>
          </h3>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
            <span className="ml-4 text-gray-600 text-lg">Loading products...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id || index}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
              >
                <div className="relative">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Stock*/}
                  <div className="absolute top-2 right-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      product.stock > 20
                        ? "bg-green-100 text-green-800"
                        : product.stock > 0
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {product.stock} left
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{product.name}</h3>
                    {product.subcategory && (
                      <p className="text-sm text-gray-500">{product.subcategory}</p>
                    )}
                    
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-xl font-bold text-green-600">
                      Ksh {product.price}
                    </p>
                    {product.unit && (
                      <p className="text-sm text-gray-500">Per {product.unit}</p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => openAddToCartModal(product)}
                    disabled={product.stock === 0}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      product.stock === 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700 hover:shadow-lg transform hover:scale-105"
                    }`}
                  >
                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xl text-gray-500 mb-2">No products found</p>
            <p className="text-gray-400">
              {search && `No results for "${search}"`}
              {selectedCategory !== "All" && ` in ${selectedCategory}`}
              {selectedSubcategory !== "All" && ` - ${selectedSubcategory}`}
            </p>
          </div>
        )}
      </div>

{/* Add to Cart Modal */}
{isAddToCartModalOpen && selectedProduct && (
  <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/20 backdrop-blur-sm">
    
    <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 w-full max-w-2xl mx-4 shadow-2xl relative">
      
      
      <button
        onClick={() => setIsAddToCartModalOpen(false)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      
      <div className="flex gap-6 mb-6">
       
        {selectedProduct.imageUrl && (
          <img
            src={selectedProduct.imageUrl}
            alt={selectedProduct.name}
            className="w-40 h-40 object-cover rounded-lg flex-shrink-0"
          />
        )}

        
        <div className="flex-1">
          <h4 className="font-semibold text-xl mb-1">{selectedProduct.name}</h4>
          <p className="text-green-600 font-bold text-2xl mb-1">
            Ksh {selectedProduct.price}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {selectedProduct.stock} available
          </p>

  
          <input
            type="text"
            placeholder="Special requirements on this item"
            className="w-full border border-gray-300 rounded-lg px-3 py-4 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none mb-4 bg-white/70 backdrop-blur-sm"
          />

          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  setSelectedQuantity(Math.max(1, selectedQuantity - 1))
                }
                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
                </svg>
              </button>
              <span className="text-xl font-semibold w-12 text-center">
                {selectedQuantity}
              </span>
              <button
                onClick={() =>
                  setSelectedQuantity(
                    Math.min(selectedProduct.stock, selectedQuantity + 1)
                  )
                }
                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Total:{" "}
              <span className="font-semibold">
                Ksh {selectedProduct.price * selectedQuantity}
              </span>
            </p>
          </div>
        </div>
      </div>

      
      <div className="flex gap-3">
        <button
          onClick={() => setIsAddToCartModalOpen(false)}
          className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={addToCart}
          className="flex-1 py-3 px-4 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-medium"
        >
          Add to Cart
        </button>
      </div>
    </div>
  </div>
)}

{/* Cart Modal */}
{isCartModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/40 backdrop-blur-sm">
    <div className="bg-white/80 backdrop-blur-md rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
      
      
      <div className="p-6 border-b bg-white/70 backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Shopping Cart</h2>
          <button
            onClick={() => setIsCartModalOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-6">
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m-2.5-5h10m-10 0L5.4 5" />
            </svg>
            <p className="text-xl text-gray-500">Your cart is empty</p>
            <p className="text-gray-400">Add some products to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.cartId}
                className="flex items-center gap-4 p-4 border rounded-lg bg-white/70 backdrop-blur-sm hover:bg-white/90 transition"
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{item.name}</h4>
                  
                  <p className="font-bold text-green-600">Ksh {item.price} each</p>
                </div>
                
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateCartQuantity(item.cartId, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="font-semibold w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateCartQuantity(item.cartId, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
                
                
                <div className="text-right">
                  <p className="font-bold text-lg">Ksh {item.price * item.quantity}</p>
                  <button
                    onClick={() => removeFromCart(item.cartId)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      {cart.length > 0 && (
        <div className="p-6 border-t bg-white/70 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-lg font-semibold">Total Items: {getTotalItems()}</p>
              <p className="text-2xl font-bold text-green-600">Total: Ksh {getCartTotal()}</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setIsCartModalOpen(false)}
              className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Continue Shopping
            </button>
            <button
              onClick={handleCheckout}
              className="flex-1 py-3 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
            >
              Checkout
            </button>
          </div>
        </div>
      )}

{/* Delivery Address & Order Summary Modal */}
{showAddressModal && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl w-full max-w-md max-h-[60vh] overflow-hidden flex flex-col">
      
     
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Delivery & Payment</h2>
          <button
            onClick={() => setShowAddressModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
            <input
              type="text"
              required
              placeholder=" 123 Kimathi Street"
              value={deliveryAddress.addressLine1}
              onChange={(e) => setDeliveryAddress({...deliveryAddress, addressLine1: e.target.value})}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apartment/Building (Optional)</label>
            <input
              type="text"
              placeholder=" Apartment 4B, Floor 2"
              value={deliveryAddress.addressLine2}
              onChange={(e) => setDeliveryAddress({...deliveryAddress, addressLine2: e.target.value})}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input
                type="text"
                required
                placeholder=" Nairobi"
                value={deliveryAddress.city}
                onChange={(e) => setDeliveryAddress({...deliveryAddress, city: e.target.value})}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
              <input
                type="text"
                placeholder=" 00100"
                value={deliveryAddress.postalCode}
                onChange={(e) => setDeliveryAddress({...deliveryAddress, postalCode: e.target.value})}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <input
              type="tel"
              required
              placeholder=" +254712345678"
              value={deliveryAddress.phoneNumber}
              onChange={(e) => setDeliveryAddress({...deliveryAddress, phoneNumber: e.target.value})}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            >
              <option value="cash">Cash on Delivery</option>
              <option value="mpesa">M-Pesa</option>
            </select>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Order Summary</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal ({getTotalItems()} items):</span>
              <span>Ksh {getCartTotal()}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span>Ksh 200</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>Ksh {getCartTotal() + 50}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer modal */}
      <div className="p-6 border-t">
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddressModal(false)}
            className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={completeOrder}
            className="flex-1 py-3 px-4 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-medium"
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  </div>
)}


  <Footer />
    </>
  );
}

export default CustomerDashboard;