import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { addOrder, getProducts } from '../firebase';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

function CustomerDashboard() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState ([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            const data = await getProducts();
            setProducts(data);
        };
        fetchProducts();
    }, []);

    //add product to cart
    const addToCart = (product) => {
        setCart([...cart, product]);
    };

    //to place order
    const handleCheckout = async () =>{
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }
        const order = {
            items: cart.map(item => ({
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: 1
            })), 
            total: cart.reduce((sum, item) => sum + item.price, 0),
            status: "pending",
            createdAt: new Date().toISOString()
        };

        await addOrder(order);
        alert("Order place successfully!");
        setCart([]);
    };

    //logging out
    const handleLogout = async () => {
            try {
              await signOut(auth);   
              navigate("/login");    
            } catch (error) {
              alert("Logout failed: " + error.message);
            }
          }
    
  return (
    <>
    <h1>Customer Dashboard</h1>
      

      <h2>Available Products</h2>
      <ul>
        {products.map(product => (
          <li key={product.id}>
            {product.name} - Ksh {product.price} | Stock: {product.stock} | {product.category}
            <button onClick={() => addToCart(product)}>Add to Cart</button>
          </li>
        ))}
      </ul>

      <h2>My Cart</h2>
      <ul>
        {cart.map((item, index) => (
          <li key={index}>{item.name} - Ksh {item.price}</li>
        ))}
      </ul>
      {cart.length > 0 && <button onClick={handleCheckout}>Checkout</button>}  

      <button onClick={handleLogout}>Logout</button>
    
    </>
  )
}

export default CustomerDashboard