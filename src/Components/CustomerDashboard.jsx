import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addOrder, getProducts } from "../firebase";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import video2 from "../assets/herovideo.mp4";
import Footer from "./Footer"

function CustomerDashboard() {
  const [allProducts, setAllProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState({});
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

        // Debug: Log unique subcategories for each category
        const categorySubcategories = {};
        data.forEach((product) => {
          if (!categorySubcategories[product.category]) {
            categorySubcategories[product.category] = new Set();
          }
          if (product.subcategory) {
            categorySubcategories[product.category].add(product.subcategory);
          }
        });

        console.log(
          "Actual subcategories in your data:",
          Object.fromEntries(
            Object.entries(categorySubcategories).map(([key, value]) => [
              key,
              Array.from(value),
            ])
          )
        );

        setAllProducts(data);
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

  // Add product to cart
  const addToCart = (product) => {
    setCart([...cart, product]);
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
    const order = {
      items: cart.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
      })),
      total: cart.reduce((sum, item) => sum + item.price, 0),
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await addOrder(order);
    alert("Order placed successfully!");
    setCart([]);
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
      <div className="bg-green-800 text-white p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2 md:mb-0">
            
            <span className="px-24 font-bold text-sm md:text-base">
              SAME DAY DELIVERY - Orders before 12:00PM <span className="text-sm md:text-base">| +254718250182</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="px-6 text-white hover:text-red-200 transition-colors font-medium text-lg md:text-base"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      
      <div className="sticky top-0 z-40 mb-8 px-4 py-6 bg-gray-50 shadow-md border-b border-gray-200">
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
                {getSubcategoriesForCategory(category).length > 0 && (
                  <span className="ml-1"></span>
                )}
              </button>

              {/* Subcategory Dropdown */}
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
      <div className="relative w-full h-[300px] md:h-[600px] rounded-lg overflow-hidden mb-6">
        
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover opacity-90"
        >
          <source src={video2} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

       
        <div className="absolute inset-0 bg-opacity-40"></div>

        
        <div className="relative z-10 flex flex-col items-center justify-center text-center text-white h-full px-4">
          <h1 className="mt-6 text-3xl md:text-5xl font-bold">
            YOUR DOORSTEP GROCERY SHOP
          </h1>

          <div className="relative w-full max-w-lg mt-3">
            <input
              type="text"
              placeholder="Search for any product"
              className="w-full max-w-lg mt-3 p-3 rounded-lg border border-green-500 bg-white/70 text-black"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <p className="mt-2 text-lg md:text-xl">
            Forget the mall. You order. We deliver.
          </p>
        </div>
      </div>

      {/* Products Display */}
      <div className="px-20 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            {selectedCategory === "All"
              ? "All Products"
              : selectedSubcategory === "All"
              ? selectedCategory
              : `${selectedCategory} - ${selectedSubcategory}`}
            <span className="text-sm text-gray-500 ml-2">
              ({filteredProducts.length} items)
            </span>
          </h3>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <span className="ml-3 text-gray-600">Loading products...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id || index}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition-transform transform hover:scale-105"
              >
                
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded mb-3"
                  />
                )}

                <div className="mb-3">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  {product.subcategory && (
                    <p className="text-sm text-gray-500">
                      {product.subcategory}
                    </p>
                  )}
                </div>
                <div className="mb-3">
                  <p className="text-lg font-bold text-green-600">
                    Ksh {product.price}
                  </p>
                  {product.unit && (
                    <p className="text-sm text-gray-500">Per {product.unit}</p>
                  )}
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span
                    className={`text-sm px-2 py-1 rounded ${
                      product.stock > 20
                        ? "bg-green-100 text-green-800"
                        : product.stock > 0
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.stock > 0
                      ? `${product.stock} in stock`
                      : "Out of stock"}
                  </span>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                  className={`w-full py-2 px-4 rounded font-medium transition-colors ${
                    product.stock === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No products found
              {search && ` for "${search}"`}
              {selectedCategory !== "All" && ` in ${selectedCategory}`}
              {selectedSubcategory !== "All" && ` - ${selectedSubcategory}`}
            </p>
          </div>
        )}
      </div>

      {/* Cart Section */}
      {cart.length > 0 && (
        <div className="bg-gray-50 p-4 mx-4 rounded-lg mb-8">
          <h2 className="text-xl font-bold mb-4">
            My Cart ({cart.length} items)
          </h2>
          <div className="space-y-2 mb-4">
            {cart.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-2 border-b"
              >
                <span>{item.name}</span>
                <span className="font-semibold">Ksh {item.price}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-bold">
              Total: Ksh {cart.reduce((sum, item) => sum + item.price, 0)}
            </span>
            <button
              onClick={handleCheckout}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Checkout
            </button>
          </div>
        </div>
      )}

        <Footer />
     
    </>
  );
}
export default CustomerDashboard;
