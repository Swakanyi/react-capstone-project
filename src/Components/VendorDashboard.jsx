import React, { useEffect, useState } from "react";
import { auth, addProduct, updateProduct, deleteProduct, getVendorProducts, uploadProductImage } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function VendorDashboard() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
    unit: "",
    vendorId: auth.currentUser?.uid || null,
    imageFile: null,
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const navigate = useNavigate();

  // Fetch vendor products
  const fetchProducts = async () => {
  if (!auth.currentUser) return;
  const data = await getVendorProducts(auth.currentUser.uid);
  
  setProducts(data);
};


  useEffect(() => {
    fetchProducts();
  }, []);

  // Add product
  const handleAddProduct = async (e) => {
  e.preventDefault();

  if (!newProduct.name || !newProduct.price) {
    alert("Name and Price are required!");
    return;
  }

  try {
    let imageUrl = null;
    if (newProduct.imageFile) {
      imageUrl = await uploadProductImage(newProduct.imageFile);
    }

    await addProduct({
      name: newProduct.name,
      price: Number(newProduct.price),
      category: newProduct.category,
      stock: Number(newProduct.stock),
      unit: newProduct.unit,
      vendorId: auth.currentUser?.uid || null,
      imageUrl, 
    });

    setNewProduct({
      name: "",
      price: "",
      category: "",
      stock: "",
      unit: "",
      vendorId: auth.currentUser?.uid || null,
      imageFile: null,
    });

    fetchProducts();
  } catch (err) {
    console.error("Error adding product:", err);
    alert("Failed to add product. Check console for details.");
  }
};


  // Update product
  const handleUpdateProduct = async (id) => {
    await updateProduct(id, editingProduct);
    setEditingProduct(null);
    fetchProducts();
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(id);
      fetchProducts();
    }
  };

  // Logout
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="p-6">
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      
      <form
        onSubmit={handleAddProduct}
        className="bg-white shadow p-4 rounded mb-6"
      >
        <h2 className="text-lg font-semibold mb-4">Add New Product</h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Product Name"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Price"
            value={newProduct.price}
            onChange={(e) =>
              setNewProduct({ ...newProduct, price: e.target.value })
            }
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Category"
            value={newProduct.category}
            onChange={(e) =>
              setNewProduct({ ...newProduct, category: e.target.value })
            }
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Stock"
            value={newProduct.stock}
            onChange={(e) =>
              setNewProduct({ ...newProduct, stock: e.target.value })
            }
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Unit (e.g. 1kg, 500ml)"
            value={newProduct.unit}
            onChange={(e) =>
              setNewProduct({ ...newProduct, unit: e.target.value })
            }
            className="border p-2 rounded"
          />

          
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setNewProduct({ ...newProduct, imageFile: e.target.files[0] })
            }
            className="border p-2 rounded"
          />
        </div>

        
        {newProduct.imageFile && (
          <img
            src={URL.createObjectURL(newProduct.imageFile)}
            alt="Preview"
            className="w-24 h-24 object-cover mt-2 rounded"
          />
        )}

        <button
          type="submit"
          className="mt-4 bg-green-600 text-white px-6 py-2 rounded"
        >
          Add Product
        </button>
      </form>

     
      <h2 className="text-lg font-semibold mb-4">My Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white shadow p-4 rounded flex flex-col"
          >
            {editingProduct?.id === product.id ? (
              <>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      name: e.target.value,
                    })
                  }
                  className="border p-2 rounded mb-2"
                />
                <input
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      price: e.target.value,
                    })
                  }
                  className="border p-2 rounded mb-2"
                />
                <input
                  type="number"
                  value={editingProduct.stock}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      stock: e.target.value,
                    })
                  }
                  className="border p-2 rounded mb-2"
                />
                <button
                  onClick={() => handleUpdateProduct(product.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
                >
                  Save
                </button>
              </>
            ) : (
              <>
                
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded mb-2"
                  />
                )}
                <h3 className="font-semibold">{product.name}</h3>
                <p>Ksh {product.price}</p>
                <p>Stock: {product.stock}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VendorDashboard;
