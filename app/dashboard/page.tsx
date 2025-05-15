'use client';

import { useState, useEffect } from 'react';
import Upload from '../components/Upload';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css'; 

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function ProductTable() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
 

  // Fetch products and categories on load
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    const response = await fetch('/api/products');
    if (response.ok) {
      const data = await response.json();
      setProducts(data);
    } else {
      console.error('Failed to fetch products');
    }
  };

  const fetchCategories = async () => {
    const response = await fetch('/api/category');
    if (response.ok) {
      const data = await response.json();
      setCategories(data);
    } else {
      console.error('Failed to fetch categories');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Product deleted successfully');
          fetchProducts();
        } else {
          console.error('Failed to delete product');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleUpdate = async (updatedProduct) => {
    try {
      const response = await fetch(`/api/products/${updatedProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });

      if (response.ok) {
        alert('Product updated successfully');
        setEditingProduct(null);
        fetchProducts();
      } else {
        console.error('Failed to update product');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Filter products by search query
  const filterBySearch = (product) => {
    return product.title.toLowerCase().includes(searchQuery.toLowerCase());
  };

  // Filter products by selected category
  const filterByCategory = (product) => {
    const isFilteredByCategory = selectedCategory ? product.category === selectedCategory : true;
    
    // Log the filtering process for debugging
    console.log(`Filtering product: ${product.title} | Category: ${product.category} | Selected Category: ${selectedCategory} | Show: ${isFilteredByCategory}`);
    
    return isFilteredByCategory;
  };

  // Apply both search and category filters
  const filteredProducts = products.filter((product) => {
    return filterBySearch(product) && filterByCategory(product);
  });

  // Log the filtered products to check what's being displayed
  useEffect(() => {
    console.log("Filtered products:", filteredProducts);
  }, [filteredProducts]);



  console.log("data: ", products);
  


  return (
    <div className="max-w-6xl mx-auto p-4">
      {editingProduct && (
        <EditProductForm
          product={editingProduct}
          onCancel={() => setEditingProduct(null)}
          onSave={handleUpdate}
        />
      )}
      <h1 className="text-2xl font-bold mb-4">Product List</h1>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border p-2"
          placeholder="Search by title..."
        />
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full border p-2"
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <table className="table-auto w-full border-collapse border border-gray-200 mb-4">
  <thead>
    <tr className="bg-gray-100">
      <th className="border p-2">Title</th>
      <th className="border p-2">Pic</th>
      <th className="border p-2">Price (USD)</th>
      <th className="border p-2">Discount Price (USD)</th>
      <th className="border p-2">Stock</th>
      <th className="border p-2">Category</th> 
      <th className="border p-2">New Arrival</th>
      <th className="border p-2">Actions</th>
    </tr>
  </thead>
  <tbody>
    {filteredProducts.map((product) => {
      const fileUrl = product.img[0];
      const isVideo = /\.(mp4|webm|ogg)$/i.test(fileUrl);
      return (
<tr
  key={product.id}
  className={` ${product.stock === "0" ? 'bg-red-500' : ''}`}
>
  <td className="border p-2">{product.title}</td>
  <td className="border p-2">
    {isVideo ? (
      <video controls className="w-24 h-auto">
        <source src={fileUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    ) : (
      <img src={fileUrl} alt="Product Image" className="w-24 h-auto" />
    )}
  </td>
  <td className="border p-2">{product.price}</td>
  <td className="border p-2">{product.discount || "N/A"}</td>
  <td className="border p-2">{product.stock}</td>
  <td className="border p-2">{product.category}</td> 
  <td className="border p-2">{product.arrival}</td>
  <td className="border p-2">
    <button
      onClick={() => handleEdit(product)}
      className="bg-yellow-500 text-white px-2 py-1 mr-2"
    >
      Edit
    </button>
    <button
      onClick={() => handleDelete(product.id)}
      className="bg-red-500 text-white px-2 py-1"
    >
      Delete
    </button>
  </td>
</tr>

      );
    })}
  </tbody>
</table>


    </div>
  );
}

function EditProductForm({ product, onCancel, onSave }) {
  const [title, setTitle] = useState(product.title);
  const [price, setPrice] = useState(product.price);
  const [stock, setStock] = useState(product.stock || 0); 
  const [discount, setDiscount] = useState(product.discount || 0); 
  const [img, setImg] = useState(product.img || []);
  const [description, setDescription] = useState(product.description); 
  const [categories, setCategories] = useState([]);  
  const [selectedCategory, setSelectedCategory] = useState(product.category || "");  
  const [arrival, setArrival] = useState(product.arrival === 'yes');

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [categoriesRes ] = await Promise.all([
          fetch("/api/category"),  
        ]);

        setCategories(await categoriesRes.json());  
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    fetchOptions();
  }, []);

  const handleSubmit = (e) => { 
    e.preventDefault();

    onSave({
      ...product,
      title,
      description,
      img,
      price,
      stock,
      discount,
      category: selectedCategory,  
      arrival: arrival ? 'yes' : 'no',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="border p-4 bg-gray-100 rounded">
      <h2 className="text-xl font-bold mb-4">Edit Product</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border p-2" required />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full border p-2">
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>

    

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Price</label>
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border p-2" required />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Discounted price</label>
        <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} className="w-full border p-2" />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Stock</label>
        <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full border p-2" required />
      </div>



      <label className="block text-lg font-bold mb-2">Description</label>
      <ReactQuill value={description} onChange={setDescription} className="mb-4" theme="snow" placeholder="Write your product description here..." />

      <div className="mb-4">
        <input type="checkbox" checked={arrival} onChange={(e) => setArrival(e.target.checked)} />
        <label className="ml-2 text-sm font-medium">New Arrival</label>
      </div>

      <Upload onFilesUpload={(url) => setImg(url)} /> 

      <div className="flex gap-2">
        <button type="submit" className="bg-green-500 text-white px-4 py-2">Save</button>
        <button type="button" onClick={onCancel} className="bg-gray-500 text-white px-4 py-2">Cancel</button>
      </div>
    </form>
  );
}
