import React from "react";
import { useState, useEffect } from "react";
import { getProducts } from "../firebase";
import home0 from "../assets/home0.jpg";
import { Link } from "react-router-dom";
import caro1 from "../assets/caro1.jpg";
import caro2 from "../assets/caro2.jpg";
import caro3 from "../assets/caro3.jpg";
import caro0 from "../assets/laughing cow.jpg";
import caro4 from "../assets/mrenda.jpg";
import caro5 from "../assets/mushrr.jpg";
import home1 from "../assets/home1.jpg";
import home2 from "../assets/home2.jpg";
import home3 from "../assets/home3.jpg";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import Footer from "./Footer";

function Homepage() {
  const [allProducts, setAllProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [loading, setLoading] = useState(true);

  const essentialOffers = [
    { id: 1, name: "Laughing Cow Cheese", price: 450, imageUrl: caro0 },
    { id: 2, name: "Tomatoes", price: 120, imageUrl: caro1 },
    { id: 3, name: "Green Capsicum", price: 200, imageUrl: caro2 },
    { id: 4, name: "Red Cabbage", price: 300, imageUrl: caro3 },
    { id: 5, name: "Mrenda (Traditional Veg)", price: 80, imageUrl: caro4 },
    { id: 6, name: "Fresh Button Mushrooms", price: 250, imageUrl: caro5 },
  ];

  const faqs = [
    {
      question: "What is FreshBasket?",
      answer:
        "FreshBasket is your online grocery store that brings you everything you need, from fresh produce to pantry essentials, all at affordable prices. We provide fast, reliable delivery with same-day service. Pay easily via Mpesa or card, and enjoy a hassle-free shopping experience.",
    },
    {
      question: "How do I order?",
      answer:
        "Simply browse our website, add your favorite items to the cart, and checkout. It’s quick and easy!",
    },
    {
      question: "How do I open an account?",
      answer:
        "Click on the “Sign Up” button, enter your details, and start shopping instantly.",
    },
    {
      question: "I need a product now!",
      answer:
        "Don’t worry — our express delivery option ensures your order reaches you within hours.",
    },
    {
      question: "What is our promise?",
      answer:
        "Fresh, high-quality groceries, fair prices, and fast delivery — every time. That’s our promise to you.",
    },
    {
      question: "What are the delivery options?",
      answer:
        "Choose from same-day delivery, scheduled delivery, or express delivery depending on your needs.",
    },
    {
      question: "I want to try FreshBasket now!",
      answer:
        "Fantastic! Sign up today and enjoy your first hassle-free order delivered straight to your doorstep.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
        const availableProducts = data.filter((product) => product.stock > 0);
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

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory("All");
  };

  // Handle subcategory selection
  const handleSubcategorySelect = (subcategory) => {
    setSelectedSubcategory(subcategory);
  };

  return (
    <>
      <div className="bg-green-700 text-white py-2 px-4 sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mb-2 md:mb-0">
            <span className="font-semibold text-sm sm:text-base tracking-wider">
              SAME DAY DELIVERY - Order before 12:00PM
            </span>

            <span className="text-sm sm:text-base border-l border-green-600 pl-4">
              Call Us:{" "}
              <a href="tel:+254718250182" className="hover:text-green-200">
                +254 718 250 182
              </a>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/register"
              className="text-white hover:text-green-200 transition-colors font-medium text-sm md:text-base"
            >
              Sign Up
            </Link>

            <Link
              to="/login"
              className="px-3 py-1 bg-white text-green-700 rounded-md font-semibold hover:bg-green-100 transition-colors shadow-inner text-sm md:text-base"
            >
              Login
            </Link>
          </div>
        </div>
      </div>

      <div className="sticky top-16 z-40 mb-8 px-4 py-6 bg-gray-50 shadow-md border-b border-gray-200">
        {/* <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Shop by Category
        </h2> */}
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

    {/* hero section */}
<div className="relative w-full flex justify-center items-center py-8 px-4 bg-gray-50">
 
  <div className="relative w-full max-w-8xl h-[500px] md:h-[600px] lg:h-[650px] rounded-2xl shadow-2xl overflow-hidden flex">
    
    <img
      src={home0}
      alt="Groceries"
      className="absolute inset-0 w-full h-full object-cover"
    />

    
    <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/50 to-transparent"></div>

    
    <div className="relative z-10 flex flex-col justify-center h-full px-8  md:px-12 lg:px-16 max-w-xl">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900 mb-6">
        Welcome to FreshBasket – Your Doorstep Grocery Shop!
      </h1>
      <p className="text-lg md:text-xl font-medium text-gray-700 leading-relaxed">
        We bring you fresh, high-quality groceries at unbeatable prices,
        delivered straight to your home. From farm-fresh fruits and
        vegetables to pantry essentials, we make shopping simple, fast,
        and convenient.
      </p>
    </div>
  </div>
</div>



      {/* main section carousel*/}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 text-center">
          THIS WEEK'S ESSENTIAL OFFERS
        </h1>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000 }}
          loop
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="rounded-2xl shadow-lg"
        >
          {essentialOffers.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="flex flex-col items-center bg-white rounded-xl shadow-md overflow-hidden p-4">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-64 w-full object-cover rounded-lg"
                />
                <h2 className="mt-4 text-lg font-semibold text-gray-800">
                  {item.name}
                </h2>
                <p className="text-green-700 font-bold">Ksh {item.price}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* why us */}
        <section class="text-gray-600 body-font">
          <div class="container px-5 py-16 mx-auto">
            <div class="flex flex-col">
              <div class="h-1 bg-gray-200 rounded overflow-hidden">
                <div class="w-24 h-full bg-indigo-500"></div>
              </div>
              <div class="flex-wrap sm:flex-row flex-col py-6 mb-12">
                <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800 text-center">
                  WHY CHOOSE US
                </h1>{" "}
                <br />
                <p className="text-center text-lg max-w-2xl mx-auto text-gray-600">
                  Choosing FreshBasket means choosing convenience, quality, and
                  trust. We’re committed to making your shopping experience
                  simple, affordable, and reliable — delivering everything you
                  need, when you need it, right to your doorstep.
                </p>
              </div>
            </div>
            <div class="flex flex-wrap sm:-m-4 -mx-4 -mb-10 -mt-4">
              <div class="p-2 md:w-1/3 sm:mb-0 mb-6">
                <div class="rounded-lg h-64 overflow-hidden">
                  <img
                    alt="content"
                    class="object-cover object-center h-full w-full"
                    src={home1}
                  />
                </div>
                <h2 class="text-xl font-medium title-font text-gray-900 mt-5 text-center">
                  Everything You Need
                </h2>
                <p class="text-base leading-relaxed mt-2">
                  From fresh fruits and vegetables to pantry staples and
                  household essentials, we’ve got it all in one place so you
                  never have to shop around.
                </p>
              </div>
              <div class="p-2 md:w-1/3 sm:mb-0 mb-6">
                <div class="rounded-lg h-64 overflow-hidden">
                  <img
                    alt="content"
                    class="object-cover object-center h-full w-full"
                    src={home2}
                  />
                </div>
                <h2 class="text-xl font-medium title-font text-gray-900 mt-5 text-center">
                  Affordable Prices
                </h2>
                <p class="text-base leading-relaxed mt-2">
                  Enjoy high-quality groceries at pocket-friendly prices, giving
                  you the best value for your money without compromising on
                  freshness.
                </p>
              </div>
              <div class="p-2 md:w-1/3 sm:mb-0 mb-6">
                <div class="rounded-lg h-64 overflow-hidden">
                  <img
                    alt="content"
                    class="object-cover object-center h-full w-full"
                    src={home3}
                  />
                </div>
                <h2 class="text-xl font-medium title-font text-gray-900 mt-5 text-center">
                  Fast Delivery
                </h2>
                <p class="text-base leading-relaxed mt-2">
                  Get your groceries delivered the same day, straight to your
                  doorstep, so you can spend more time enjoying and less time
                  worrying.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ section */}
        <section
  className="py-12 bg-gray-50 bg-cover bg-center bg-no-repeat"
  style={{ backgroundImage: "url('public/images/FreshBasket Logo with Fresh Greens and Sunny Yellows.png')" }}
>
  <div className="max-w-4xl mx-auto px-6 bg-white/70 rounded-xl shadow-lg">
    <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-black">
              FREQUENTLY ASKED QUESTIONS
            </h2>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg shadow-sm"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex justify-between items-center px-4 py-3 text-left text-gray-800 font-medium focus:outline-none"
                  >
                    {faq.question}
                    <span className="ml-2 text-green-600 text-lg">
                      {openIndex === index ? "−" : "+"}
                    </span>
                  </button>
                  {openIndex === index && (
                    <div className="px-4 pb-4 text-">{faq.answer}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

export default Homepage;
