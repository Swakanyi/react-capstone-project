import React from 'react'


  const products = [
  //VEGETABLES
  {
    name: "Baby Spinach",
    price: 120,
    category: "Vegetables",
    subcategory: "Salads",
    stock: 50,
    unit: "250g pack",
    imageUrl: "/images/spinach.jpg",
    vendorId: "vendor123"
  },
  {
    name: "Sweet corn",
    price: 60,
    category: "Vegetables",
    subcategory: "Salads",
    stock: 50,
    unit: "per piece",
    imageUrl: "/images/corn.jpg",
    vendorId: "vendor123"
  },
  {
    name: "Carrots (Whole)",
    price: 80,
    category: "Vegetables",
    subcategory: "Precut & Whole",
    stock: 100,
    unit: "1kg",
    imageUrl: "/images/carrots.jpg",
    vendorId: "vendor456"
  },
  {
    name: "Dhania (Coriander)",
    price: 30,
    category: "Vegetables",
    subcategory: "Fresh Herbs",
    stock: 200,
    unit: "Bunch",
    imageUrl: "/images/dhania.jpg",
    vendorId: "vendor789"
  },

  //FRUITS
  {
    name: "Bananas",
    price: 70,
    category: "Fruits",
    subcategory: "Whole",
    stock: 100,
    unit: "1kg",
    imageUrl: "/images/bananas.jpg",
    vendorId: "vendor123"
  },
  {
    name: "Watermelon (Precut)",
    price: 200,
    category: "Fruits",
    subcategory: "Precut",
    stock: 30,
    unit: "1kg pack",
    imageUrl: "/images/melon.jpg",
    vendorId: "vendor456"
  },

  //DAIRY
  {
    name: "Fresh Milk",
    price: 60,
    category: "Dairy",
    subcategory: "Milk, Cream & Butter",
    stock: 80,
    unit: "500ml",
    imageUrl: "/images/milk.jpg",
    vendorId: "vendor789"
  },
  {
    name: "Greek Yogurt",
    price: 150,
    category: "Dairy",
    subcategory: "Yogurt",
    stock: 60,
    unit: "500g cup",
    imageUrl: "/images/greek yo.jpg",
    vendorId: "vendor123"
  },
  {
    name: "Cheddar Cheese",
    price: 300,
    category: "Dairy",
    subcategory: "Cheese",
    stock: 25,
    unit: "250g",
    imageUrl: "/images/cheddar.jpg",
    vendorId: "vendor456"
  },

  //MEAT
  {
    name: "Beef Steak",
    price: 500,
    category: "Meat",
    subcategory: "Beef",
    stock: 20,
    unit: "1kg",
    imageUrl: "/images/beef.jpg",
    vendorId: "vendor789"
  },
  {
    name: "Chicken Breast",
    price: 400,
    category: "Meat",
    subcategory: "Poultry",
    stock: 30,
    unit: "1kg",
    imageUrl: "/images/chicken.jpg",
    vendorId: "vendor123"
  },
  {
    name: "Tilapia",
    price: 350,
    category: "Meat",
    subcategory: "Seafood",
    stock: 15,
    unit: "1kg",
    imageUrl: "/images/tilap.jpg",
    vendorId: "vendor456"
  },

  //PANTRY
  {
    name: "Rice",
    price: 200,
    category: "Pantry",
    subcategory: "Cereals",
    stock: 50,
    unit: "2kg",
    imageUrl: "/images/rice.jpg",
   vendorId: "vendor001" 
  },
  {
    name: "Peanut Butter",
    price: 250,
    category: "Pantry",
    subcategory: "Spreads",
    stock: 40,
    unit: "500g jar",
    imageUrl: "/images/peanut.jpg",
    vendorId: "vendor456"
  },

  //DRINKS
  {
    name: "Mango Juice",
    price: 120,
    category: "Drinks",
    subcategory: "Fresh Juice",
    stock: 40,
    unit: "500ml bottle",
    imageUrl: "/images/mango.jpg",
    vendorId: "vendor001"
  },
  {
    name: "Mineral Water",
    price: 50,
    category: "Drinks",
    subcategory: "Water",
    stock: 100,
    unit: "500ml bottle",
    imageUrl: "/images/water.jpg",
    vendorId: "vendor789"
  }
];


export default products;