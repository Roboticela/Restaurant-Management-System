import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { MdArrowBack } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { invoke } from '@tauri-apps/api/core';
import { Product, NewProduct, Settings } from '../types';

export default function ProductManager() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', unit: 'item' });
  const [currencySymbol, setCurrencySymbol] = useState('PKR');

  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const response = await invoke<Settings>('get_settings');
        if (response?.currency) {
          setCurrencySymbol(response.currency || 'USD');
        }
      } catch (error) {
        console.error('Error loading currency:', error);
      }
    };

    loadCurrency();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await invoke<Product[]>('get_products');
      setProducts(response);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAddProduct = async () => {
    if (newProduct.name && newProduct.price) {
      try {
        await invoke('add_product', {
          product: {
            name: newProduct.name,
            price: Number(newProduct.price),
            unit: newProduct.unit || 'item'
          } as NewProduct
        });
        setNewProduct({ name: '', price: '', unit: 'item' });
        setShowAddModal(false);
        loadProducts();
      } catch (error) {
        console.error('Error adding product:', error);
        alert('Error adding product');
      }
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await invoke('delete_product', { id });
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-0 sm:justify-between mb-6 sm:mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="flex items-center text-white gap-2 bg-purple-600/30 px-4 py-2 rounded-lg"
          >
            <MdArrowBack className="w-5 h-5" />
            <span>Back</span>
          </motion.button>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl font-bold text-white order-first sm:order-none"
          >
            Product Manager
          </motion.h1>
          <div className="hidden sm:block w-24" />
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8 md:flex md:w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 md:w-full"
          >
            <h2 className="text-lg sm:text-xl text-white mb-2">Total Products</h2>
            <p className="text-3xl sm:text-4xl font-bold text-teal-400">{products.length}</p>
          </motion.div>
        </div>

        {/* Add Product Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          className="w-full mb-6 sm:mb-8 bg-gradient-to-r from-teal-500 to-teal-600 text-white 
            rounded-xl py-3 sm:py-4 px-4 sm:px-6 flex items-center justify-center gap-2 
            transition-all duration-300"
        >
          <FaPlus />
          <span>Add New Product</span>
        </motion.button>

        {/* Products List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden"
        >
          {/* Table Header - Hidden on mobile */}
          <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-white font-semibold">
            <div className="col-span-2">ID</div>
            <div className="col-span-5">Name</div>
            <div className="col-span-3">Price</div>
            <div className="col-span-2">Action</div>
          </div>
          
          {/* Products */}
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="sm:grid sm:grid-cols-12 gap-4 p-4 border-b border-white/10 text-white 
                hover:bg-white/5 transition-colors"
            >
              {/* Mobile Layout */}
              <div className="sm:hidden flex justify-between items-center mb-2">
                <span className="font-semibold">#{product.id}</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDeleteProduct(product.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <FaTrash />
                </motion.button>
              </div>
              <div className="sm:hidden mb-1">
                <span className="text-lg font-medium">{product.name}</span>
              </div>
              <div className="sm:hidden text-teal-400 font-medium">
                {currencySymbol} {product.price.toFixed(2)} per {product.unit}
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:block col-span-2">#{product.id}</div>
              <div className="hidden sm:block col-span-5">{product.name}</div>
              <div className="hidden sm:block col-span-3">
                {currencySymbol} {product.price.toFixed(2)} per {product.unit}
              </div>
              <div className="hidden sm:block col-span-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDeleteProduct(product.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <FaTrash />
                </motion.button>
              </div>
            </motion.div>
          ))}

          {products.length === 0 && (
            <div className="p-6 sm:p-8 text-center text-white/60">
              No products available. Add your first product!
            </div>
          )}
        </motion.div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-xl p-4 sm:p-6 w-full max-w-md"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Add New Product</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Product Name</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white"
                  placeholder="Enter product name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2">
                    Price ({currencySymbol} per {newProduct.unit})
                  </label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white"
                    placeholder={`Enter price per ${newProduct.unit}`}
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Unit</label>
                  <input
                    type="text"
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white"
                    placeholder="e.g., piece, kg, plate"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProduct}
                  className="flex-1 px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-400 transition-colors"
                >
                  Add Product
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

