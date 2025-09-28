import React from "react";
import { useState } from "react";
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
import ProductModal from "./ProductModal";
import { auth } from "../firebase";

function Homepage() {
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const essentialOffers = [
    { id: 1, name: "Laughing Cow Cheese", price: 450, imageUrl: caro0, stock: 20, category: "Dairy", unit: "200g" },
    { id: 2, name: "Tomatoes", price: 120, imageUrl: caro1, stock: 100, category: "Vegetables", unit: "1kg" },
    { id: 3, name: "Green Capsicum", price: 200, imageUrl: caro2, stock: 50, category: "Vegetables", unit: "500g" },
    { id: 4, name: "Red Cabbage", price: 300, imageUrl: caro3, stock: 200, category: "Vegetables", unit: "1 head" },
    { id: 5, name: "Mrenda (Traditional Veg)", price: 80, imageUrl: caro4, stock: 50, category: "Vegetables", unit: "bunch" },
    { id: 6, name: "Fresh Button Mushrooms", price: 250, imageUrl: caro5, stock: 30, category: "Vegetables", unit: "250g" },
  ];

  const faqs = [
    {
      question: "What is FreshBasket?",
      answer: "FreshBasket is your online grocery store that brings you everything you need, from fresh produce to pantry essentials, all at affordable prices. We provide fast, reliable delivery with same-day service. Pay easily via Mpesa or card, and enjoy a hassle-free shopping experience.",
    },
    {
      question: "How do I order?",
      answer: "Simply browse our website, add your favorite items to the cart, and checkout. It's quick and easy!",
    },
    {
      question: "How do I open an account?",
      answer: "Click on the Sign Up button, enter your details, and start shopping instantly.",
    },
    {
      question: "I need a product now!",
      answer: "Don't worry — our express delivery option ensures your order reaches you within hours.",
    },
    {
      question: "What is our promise?",
      answer: "Fresh, high-quality groceries, fair prices, and fast delivery — every time. That's our promise to you.",
    },
    {
      question: "What are the delivery options?",
      answer: "Choose from same-day delivery, scheduled delivery, or express delivery depending on your needs.",
    },
    {
      question: "I want to try FreshBasket now!",
      answer: "Fantastic! Sign up today and enjoy your first hassle-free order delivered straight to your doorstep.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleProductClick = (product) => {
    console.log('Product clicked:', product);
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  return (
    <>
      {/* Header */}
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

      {/* Hero Section */}
      <div className="relative w-full flex justify-center items-center py-8 px-4 bg-gray-50">
        <div className="relative w-full max-w-8xl h-[500px] md:h-[600px] lg:h-[650px] rounded-2xl shadow-2xl overflow-hidden flex">
          <img
            src={home0}
            alt="Groceries"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/30 to-transparent"></div>
          <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-12 lg:px-16 max-w-xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900 mb-6">
              Welcome to FreshBasket – Your Doorstep Grocery Shop!
            </h1>
            <p className="text-lg md:text-xl font-medium text-gray-700 leading-relaxed mb-6">
              We bring you fresh, high-quality groceries at unbeatable prices,
              delivered straight to your home. From farm-fresh fruits and
              vegetables to pantry essentials, we make shopping simple, fast,
              and convenient.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold text-center"
              >
                Start Shopping Now
              </Link>
              <Link
                to="/login"
                className="bg-white text-green-700 border-2 border-green-600 px-8 py-3 rounded-lg hover:bg-green-50 transition-colors font-semibold text-center"
              >
                Already a Member? Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
            THIS WEEK'S ESSENTIAL OFFERS
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of fresh, quality products at unbeatable prices. 
            Click on any item to learn more and start your FreshBasket journey!
          </p>
        </div>

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
          className="rounded-2xl shadow-lg mb-12"
        >
          {essentialOffers.map((item) => (
            <SwiperSlide key={item.id}>
              <div 
                className="flex flex-col items-center bg-white rounded-xl shadow-md overflow-hidden p-6 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                onClick={() => handleProductClick(item)}
              >
                <div className="relative mb-4">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-64 w-full object-cover rounded-lg"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.stock > 20
                        ? "bg-green-100 text-green-800"
                        : item.stock > 0
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {item.stock} left
                    </span>
                  </div>
                </div>
                
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    {item.name}
                  </h2>
                  <p className="text-lg text-gray-500 mb-2">{item.category}</p>
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-green-600">Ksh {item.price}</span>
                    {item.unit && (
                      <span className="text-sm text-gray-500 ml-2">per {item.unit}</span>
                    )}
                  </div>
                  <div className="bg-green-50 text-green-700 py-2 px-4 rounded-lg hover:bg-green-100 transition-colors">
                    <span className="text-lg font-medium">Click to view details</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-center text-white mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust FreshBasket for their grocery needs. 
            Fresh products, great prices, and fast delivery - all at your fingertips!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-green-700 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Create Your Account
            </Link>
            <Link
              to="/login"
              className="bg-green-800 text-white border-2 border-white px-8 py-3 rounded-lg hover:bg-green-900 transition-colors font-semibold"
            >
              Login to Shop
            </Link>
          </div>
        </div>

        {/* Why Choose Us */}
        <section className="text-gray-600 body-font mb-12">
          <div className="container px-5 py-16 mx-auto">
            <div className="flex flex-col">
              <div className="h-1 bg-gray-200 rounded overflow-hidden">
                <div className="w-24 h-full bg-green-500"></div>
              </div>
              <div className="flex-wrap sm:flex-row flex-col py-6 mb-12">
                <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800 text-center">
                  WHY CHOOSE US
                </h1>
                <br />
                <p className="text-center text-lg max-w-2xl mx-auto text-gray-600">
                  Choosing FreshBasket means choosing convenience, quality, and
                  trust. We're committed to making your shopping experience
                  simple, affordable, and reliable — delivering everything you
                  need, when you need it, right to your doorstep.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap sm:-m-4 -mx-4 -mb-10 -mt-4">
              <div className="p-2 md:w-1/3 sm:mb-0 mb-6">
                <div className="rounded-lg h-64 overflow-hidden">
                  <img
                    alt="Everything You Need"
                    className="object-cover object-center h-full w-full"
                    src={home1}
                  />
                </div>
                <h2 className="text-xl font-medium title-font text-gray-900 mt-5 text-center">
                  Everything You Need
                </h2>
                <p className="text-base leading-relaxed mt-2">
                  From fresh fruits and vegetables to pantry staples and
                  household essentials, we've got it all in one place so you
                  never have to shop around.
                </p>
              </div>
              <div className="p-2 md:w-1/3 sm:mb-0 mb-6">
                <div className="rounded-lg h-64 overflow-hidden">
                  <img
                    alt="Affordable Prices"
                    className="object-cover object-center h-full w-full"
                    src={home2}
                  />
                </div>
                <h2 className="text-xl font-medium title-font text-gray-900 mt-5 text-center">
                  Affordable Prices
                </h2>
                <p className="text-base leading-relaxed mt-2">
                  Enjoy high-quality groceries at pocket-friendly prices, giving
                  you the best value for your money without compromising on
                  freshness.
                </p>
              </div>
              <div className="p-2 md:w-1/3 sm:mb-0 mb-6">
                <div className="rounded-lg h-64 overflow-hidden">
                  <img
                    alt="Fast Delivery"
                    className="object-cover object-center h-full w-full"
                    src={home3}
                  />
                </div>
                <h2 className="text-xl font-medium title-font text-gray-900 mt-5 text-center">
                  Fast Delivery
                </h2>
                <p className="text-base leading-relaxed mt-2">
                  Get your groceries delivered the same day, straight to your
                  doorstep, so you can spend more time enjoying and less time
                  worrying.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 bg-green-50 rounded-2xl">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-800">
              FREQUENTLY ASKED QUESTIONS
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg shadow-sm bg-white"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex justify-between items-center px-4 py-3 text-left text-gray-800 font-medium focus:outline-none hover:bg-gray-50 transition-colors"
                  >
                    {faq.question}
                    <span className="ml-2 text-green-600 text-lg">
                      {openIndex === index ? "−" : "+"}
                    </span>
                  </button>
                  {openIndex === index && (
                    <div className="px-4 pb-4 text-gray-700">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={showProductModal}
        onClose={() => {
          console.log('Closing modal');
          setShowProductModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        user={auth.currentUser}
      />

      <Footer />
    </>
  );
}

export default Homepage;