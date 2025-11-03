import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { MdArrowBack } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { invoke } from '@tauri-apps/api/core';
import { Product, NewProduct, Settings } from '../types';
import ThemeToggle from '../components/ThemeToggle';

interface FormErrors {
  name?: string;
  price?: string;
  unit?: string;
}

export default function ProductManager() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', unit: 'item' });
  const [currencySymbol, setCurrencySymbol] = useState('PKR');
  const [isNavigating, setIsNavigating] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const handleBackNavigation = () => {
    setIsNavigating(true);
    setTimeout(() => {
      navigate('/');
    }, 300);
  };

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

  const handleInputChange = (field: string, value: string) => {
    setNewProduct({ ...newProduct, [field]: value });
    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate name
    if (!newProduct.name.trim()) {
      newErrors.name = 'Please enter product name';
    } else {
      // Check for duplicate product names (case-insensitive)
      const isDuplicate = products.some(
        product => product.name.toLowerCase() === newProduct.name.trim().toLowerCase()
      );
      if (isDuplicate) {
        newErrors.name = 'A product with this name already exists';
      }
    }

    // Validate price
    if (!newProduct.price) {
      newErrors.price = 'Please enter price';
    } else {
      const priceNum = Number(newProduct.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        newErrors.price = 'Price must be a positive number';
      }
    }

    // Validate unit
    if (!newProduct.unit.trim()) {
      newErrors.unit = 'Please enter unit';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddProduct = async () => {
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setStatusMessage('');

    try {
      await invoke('add_product', {
        product: {
          name: newProduct.name.trim(),
          price: Number(newProduct.price),
          unit: newProduct.unit.trim() || 'item'
        } as NewProduct
      });
      
      setNewProduct({ name: '', price: '', unit: 'item' });
      setErrors({});
      setShowAddModal(false);
      await loadProducts();
      
      setSubmitStatus('success');
      setStatusMessage('Product added successfully!');
      
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Error adding product:', error);
      setSubmitStatus('error');
      setStatusMessage(error as string || 'Failed to add product. Please try again.');
      
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteConfirmation = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    
    setDeletingId(productToDelete.id);
    setShowDeleteModal(false);
    
    try {
      await invoke('delete_product', { id: productToDelete.id });
      await loadProducts();
      
      setSubmitStatus('success');
      setStatusMessage('Product deleted successfully!');
      
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Error deleting product:', error);
      setSubmitStatus('error');
      setStatusMessage(error as string || 'Failed to delete product. Please try again.');
      
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 3000);
    } finally {
      setDeletingId(null);
      setProductToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-purple-100 to-slate-100 
      dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 transition-colors duration-300">
      {/* Theme Toggle */}
      <div className="absolute safe-top safe-right z-50">
        <ThemeToggle />
      </div>
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-0 sm:justify-between mb-6 sm:mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBackNavigation}
            className="flex items-center text-slate-900 dark:text-white gap-2 
              bg-purple-200 dark:bg-purple-600/30 px-4 py-2 rounded-lg min-w-[120px] justify-center
              transition-colors duration-300"
            disabled={isNavigating}
          >
            {isNavigating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <MdArrowBack className="w-5 h-5" />
                <span>Back</span>
              </>
            )}
          </motion.button>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white order-first sm:order-0 transition-colors duration-300"
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
            className="bg-white/70 dark:bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 md:w-full transition-colors duration-300"
          >
            <h2 className="text-lg sm:text-xl text-slate-900 dark:text-white mb-2">Total Products</h2>
            <p className="text-3xl sm:text-4xl font-bold text-teal-600 dark:text-teal-400">{products.length}</p>
          </motion.div>
        </div>

        {/* Add Product Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          className="w-full mb-6 sm:mb-8 bg-linear-to-r from-teal-400 to-teal-500 
            dark:from-teal-500 dark:to-teal-600 text-white rounded-xl py-3 sm:py-4 px-4 sm:px-6 
            flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <FaPlus />
          <span>Add New Product</span>
        </motion.button>

        {/* Products List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/70 dark:bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden transition-colors duration-300"
        >
          {/* Table Header - Hidden on mobile */}
          <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-slate-300 dark:border-white/10 
            text-slate-900 dark:text-white font-semibold">
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
              className="sm:grid sm:grid-cols-12 gap-4 p-4 border-b border-slate-300 dark:border-white/10 
                text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              {/* Mobile Layout */}
              <div className="sm:hidden flex justify-between items-center mb-2">
                <span className="font-semibold">#{product.id}</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => openDeleteConfirmation(product)}
                  className="text-red-400 hover:text-red-300 disabled:opacity-50"
                  disabled={deletingId === product.id}
                >
                  {deletingId === product.id ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full"
                    />
                  ) : (
                    <FaTrash />
                  )}
                </motion.button>
              </div>
              <div className="sm:hidden mb-1">
                <span className="text-lg font-medium">{product.name}</span>
              </div>
              <div className="sm:hidden text-teal-600 dark:text-teal-400 font-medium">
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
                  onClick={() => openDeleteConfirmation(product)}
                  className="text-red-400 hover:text-red-300 disabled:opacity-50"
                  disabled={deletingId === product.id}
                >
                  {deletingId === product.id ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full"
                    />
                  ) : (
                    <FaTrash />
                  )}
                </motion.button>
              </div>
            </motion.div>
          ))}

          {products.length === 0 && (
            <div className="p-6 sm:p-8 text-center text-slate-600 dark:text-white/60">
              No products available. Add your first product!
            </div>
          )}
        </motion.div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 w-full max-w-md transition-colors duration-300"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6">Add New Product</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-slate-900 dark:text-white mb-2">Product Name</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 
                    text-slate-900 dark:text-white border focus:outline-none transition-colors ${
                      errors.name 
                        ? 'border-red-500 focus:border-red-400' 
                        : 'border-slate-300 dark:border-transparent focus:border-teal-400'
                    }`}
                  placeholder="Enter product name"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-900 dark:text-white mb-2">
                    Price ({currencySymbol} per {newProduct.unit})
                  </label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 
                      text-slate-900 dark:text-white border focus:outline-none transition-colors ${
                        errors.price 
                          ? 'border-red-500 focus:border-red-400' 
                          : 'border-slate-300 dark:border-transparent focus:border-teal-400'
                      }`}
                    placeholder={`Enter price per ${newProduct.unit}`}
                    step="0.01"
                    min="0"
                    disabled={isSubmitting}
                  />
                  {errors.price && (
                    <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-900 dark:text-white mb-2">Unit</label>
                  <input
                    type="text"
                    value={newProduct.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 
                      text-slate-900 dark:text-white border focus:outline-none transition-colors ${
                        errors.unit 
                          ? 'border-red-500 focus:border-red-400' 
                          : 'border-slate-300 dark:border-transparent focus:border-teal-400'
                      }`}
                    placeholder="e.g., piece, kg, plate"
                    disabled={isSubmitting}
                  />
                  {errors.unit && (
                    <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.unit}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setErrors({});
                    setNewProduct({ name: '', price: '', unit: 'item' });
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 
                    text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600 
                    transition-colors disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProduct}
                  className="flex-1 px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-400 
                    transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Adding...
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      Add Product
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md border-2 
              border-red-300 dark:border-red-500/30 transition-colors duration-300"
          >
            {/* Warning Icon */}
            <div className="flex justify-center mb-4">
              <div className="bg-red-500/20 rounded-full p-4">
                <FaExclamationTriangle className="text-red-500 dark:text-red-400 text-4xl" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white text-center mb-3">
              Delete Product?
            </h2>

            {/* Message */}
            <p className="text-slate-600 dark:text-gray-300 text-center mb-2">
              Are you sure you want to delete
            </p>
            <p className="text-slate-900 dark:text-white font-semibold text-center text-lg mb-1">
              {productToDelete.name}
            </p>
            <p className="text-slate-500 dark:text-gray-400 text-center text-sm mb-6">
              This action cannot be undone.
            </p>

            {/* Buttons */}
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowDeleteModal(false);
                  setProductToDelete(null);
                }}
                className="flex-1 px-6 py-3 rounded-lg bg-slate-200 dark:bg-slate-700 
                  text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600 
                  transition-colors font-semibold"
              >
                No, Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDeleteProduct}
                className="flex-1 px-6 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 
                  transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <FaTrash />
                Yes, Delete
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Success Message */}
      {submitStatus === 'success' && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-teal-500 text-white px-6 py-3 
            rounded-xl flex items-center gap-2 z-50"
        >
          <FaCheck className="text-xl" />
          {statusMessage}
        </motion.div>
      )}

      {/* Error Message */}
      {submitStatus === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 
            rounded-xl flex items-center gap-2 max-w-md z-50"
        >
          <FaExclamationTriangle className="text-xl" />
          <span>{statusMessage}</span>
        </motion.div>
      )}
    </div>
  );
}

