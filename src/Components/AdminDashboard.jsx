import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { addProduct, deleteProduct, getProducts, updateProduct } from '../firebase';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

function AdminDashboard() {
    const [products, setProducts] = useState([]);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [category, setCategory] = useState("");
    const [editingId, setEditingId] = useState(null);

    const navigate =useNavigate();
    
    useEffect(() =>{
        fetchProducts();
    }, []);

    const fetchProducts = async () =>{
        const data = await getProducts();
        setProducts(data);
    };

    //add/update a product
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !price || !stock || !category) {
            alert('Please fill all fields');
            return;
        }

        const product = {
            name,
            price: Number(price),
            stock: Number(stock),
            category,
        };

        if (editingId) {
            await updateProduct(editingId, product);
            setEditingId(null);
        } else{
            await addProduct(product);
        }
        setName('');
        setPrice('');
        setStock('');
        setCategory('');
        fetchProducts();
    };
    //Editing product
    const handleEdit = (product) => {
        setEditingId(product.id);
        setName(product.name);
        setPrice(product.price);
        setStock(product.stock);
        setCategory(product.category);
    };
    //Delete product
    const handleDelete = async (id) => {
        await deleteProduct(id);
        fetchProducts();
    };
    //logout
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
    <h1>Admin DashBoard</h1>
    

    <h2>Manage Products</h2>
    <form onSubmit={handleSubmit}>
        <input type='' placeholder='Product Name' value={name} onChange={(e) => setName(e.target.value)} />
        <input type='number' placeholder='Price' value={price} onChange={(e) => setPrice(e.target.value)} />
        <input type='number' placeholder='Stock' value={stock} onChange={(e) => setStock(e.target.value)} />
        <input type='' placeholder='Category' value={category} onChange={(e) => setCategory(e.target.value)} />
        <button type='submit'>{editingId ? 'Update Product' : 'Add Product'}</button>

    </form>

    <h2>Products</h2>
    <ul>
        {products.map(product =>(
            <li key = {product.id}>
               {product.name} - Ksh {product.price} | Stock: {product.stock} | {product.category}
               <button onClick={() => handleEdit(product)}>Edit</button>
               <button onClick={() => handleDelete(product.id)}>Delete</button> 
            </li>
        ))}
    </ul>

    <button onClick={handleLogout}>LogOut</button>
    </>
  );
}

export default AdminDashboard