import React, { useEffect, useState } from 'react';
import apiClient from '../utils/apiClient';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    image: null,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/jos/products');
      // Map _id to id for frontend compatibility
      const mappedProducts = response.data.map(p => ({ ...p, id: p._id }));
      setProducts(mappedProducts);
    } catch (error) {
      toast.error('Failed to load products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageBase64 = null;
    if (formData.image) {
      imageBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let w = img.width, h = img.height;
            const max = 500;
            if (w > h && w > max) { h = (h * max) / w; w = max; }
            else if (h > max) { w = (w * max) / h; h = max; }
            canvas.width = w;
            canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.4));
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(formData.image);
      });
    }
    submitProduct(imageBase64);
  };

  const submitProduct = async (imageBase64) => {
    try {
      const submitData = {
        name: formData.name,
        category: formData.category,
        price: formData.price,
        description: formData.description,
        image: imageBase64,
      };

      if (editingId) {
        await apiClient.put(`/jos/products/${editingId}`, submitData);
        toast.success('Product updated successfully');
      } else {
        await apiClient.post('/jos/products', submitData);
        toast.success('Product created successfully');
      }
      setFormData({ name: '', category: '', price: '', description: '', image: null });
      setImagePreview(null);
      setEditingId(null);
      setShowForm(false);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to save product');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await apiClient.delete(`/jos/products/${id}`);
        toast.success('Product deleted');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      image: null,
    });
    setImagePreview(product.imageUrl || null);
    setEditingId(product.id);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary">Manage Products</h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ name: '', category: '', price: '', description: '', image: null });
              setImagePreview(null);
            }}
            className="bg-secondary text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600"
          >
            {showForm ? 'Cancel' : 'Add Product'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
              />

              {/* Category Dropdown */}
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary bg-white text-gray-700"
              >
                <option value="">Select Category</option>
                <option value="Custom Sportswear">Custom Sportswear</option>
                <option value="Custom Apparel">Custom Apparel</option>
                <option value="Excluded / Add-Ons">Excluded / Add-Ons</option>
              </select>

              <input
                type="number"
                placeholder="Price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
              />
              <div>
                <label className="block text-sm font-medium mb-2">Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData({ ...formData, image: file });
                      const reader = new FileReader();
                      reader.onloadend = () => setImagePreview(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
                />
                {imagePreview && (
                  <div className="mt-3">
                    <img src={imagePreview} alt="Preview" className="h-32 w-32 object-cover rounded-lg" />
                  </div>
                )}
              </div>
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
              />
              <button
                type="submit"
                className="w-full bg-secondary text-white py-2 rounded-lg font-semibold hover:bg-blue-600"
              >
                {editingId ? 'Update Product' : 'Create Product'}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold">Image</th>
                  <th className="text-left px-6 py-3 font-semibold">Name</th>
                  <th className="text-left px-6 py-3 font-semibold">Category</th>
                  <th className="text-left px-6 py-3 font-semibold">Price</th>
                  <th className="text-left px-6 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3">
                      {product.imageBase64 ? (
                        <img src={product.imageBase64} alt={product.name} className="h-12 w-12 object-cover rounded" />
                      ) : product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-12 w-12 object-cover rounded" />
                      ) : null}
                    </td>
                    <td className="px-6 py-3">{product.name}</td>
                    <td className="px-6 py-3">{product.category}</td>
                    <td className="px-6 py-3">₱{product.price}</td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-secondary hover:underline mr-4 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-accent hover:underline font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}