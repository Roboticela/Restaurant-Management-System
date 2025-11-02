import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { MdArrowBack, MdShoppingCart, MdCheckCircle } from 'react-icons/md';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { invoke } from '@tauri-apps/api/core';
import { Product, Settings, CartItem, Sale as SaleType } from '../types';

export default function Sale() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings>({
    restaurant_name: 'Restaurant Management System',
    address: '',
    phone: '',
    currency: 'PKR',
    receipt_footer: 'Thank you for your business!'
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, settingsRes] = await Promise.all([
          invoke<Product[]>('get_products'),
          invoke<Settings>('get_settings')
        ]);
        
        setProducts(productsRes);
        if (settingsRes) {
          setSettings({
            restaurant_name: settingsRes.restaurant_name || 'Restaurant Management System',
            address: settingsRes.address || '',
            phone: settingsRes.phone || '',
            currency: settingsRes.currency || 'PKR',
            receipt_footer: settingsRes.receipt_footer || 'Thank you for your business!'
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { 
                ...item, 
                quantity: item.unit === 'item' || item.unit === 'items' 
                  ? item.quantity + 1 
                  : item.quantity + 0.5 
              }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, quantity: number, unit: string) => {
    if (quantity < (unit === 'item' || unit === 'items' ? 1 : 0.5)) {
      setCart(prev => prev.filter(item => item.id !== productId));
      return;
    }
    setCart(prev => 
      prev.map(item => 
        item.id === productId 
          ? { ...item, quantity }
          : item
      )
    );
  };

  const handleSell = async () => {
    if (cart.length === 0) {
      alert('Please select at least one product');
      return;
    }

    try {
      await invoke('add_sale', {
        sale: {
          products: cart.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            unit: item.unit,
          })),
          total_amount: totalAmount,
          currency: settings.currency
        } as SaleType
      });
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Error saving sale:', error);
      alert('Error completing sale');
    }
  };

  const handleNewSale = () => {
    setCart([]);
    setShowSuccessDialog(false);
  };

  const totalAmount = cart.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0
  );

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
            New Sale
          </motion.h1>
          <div className="hidden sm:block w-24" />
        </div>

        {/* Total Amount Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 mb-6 sm:mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg sm:text-xl text-white mb-1">Total Amount</h2>
              <p className="text-3xl sm:text-4xl font-bold text-teal-400">
                {settings.currency} {totalAmount.toFixed(2)}
              </p>
            </div>
            <div className="text-white/60">
              {cart.length} items selected
            </div>
          </div>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 sm:mb-8">
          {products.map((product) => {
            const cartItem = cart.find(item => item.id === product.id);
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className={`relative p-4 rounded-xl transition-all duration-200 ${
                  cartItem 
                    ? 'bg-teal-500/20 border-2 border-teal-500' 
                    : 'bg-white/10 border-2 border-transparent'
                }`}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-medium">{product.name}</h3>
                      <p className="text-teal-400 font-semibold">
                        {settings.currency} {product.price.toFixed(2)} per {product.unit}
                      </p>
                    </div>
                    {!cartItem && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => addToCart(product)}
                        className="bg-teal-500 text-white p-2 rounded-lg hover:bg-teal-400 transition-colors"
                      >
                        <FaPlus />
                      </motion.button>
                    )}
                  </div>

                  {cartItem && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between bg-white/10 rounded-lg p-2"
                    >
                      <button
                        onClick={() => updateQuantity(
                          product.id, 
                          (cartItem.quantity || 0) - (product.unit === 'item' || product.unit === 'items' ? 1 : 0.5),
                          product.unit
                        )}
                        className="w-8 h-8 flex items-center justify-center text-white bg-red-500/20 
                          hover:bg-red-500 rounded-lg transition-colors"
                      >
                        -
                      </button>
                      <div className="flex flex-col items-center">
                        <span className="text-white font-medium text-lg">
                          {cartItem.quantity} {product.unit === 'item' ? 'item(s)' : product.unit}
                        </span>
                        <span className="text-white/60 text-sm">
                          {settings.currency} {(cartItem.quantity * product.price).toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() => updateQuantity(
                          product.id, 
                          (cartItem.quantity || 0) + (product.unit === 'item' || product.unit === 'items' ? 1 : 0.5),
                          product.unit
                        )}
                        className="w-8 h-8 flex items-center justify-center text-white bg-teal-500/20 
                          hover:bg-teal-500 rounded-lg transition-colors"
                      >
                        +
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6"
          >
            <h3 className="text-white font-semibold mb-3">Cart Summary</h3>
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center text-white/80">
                  <span>
                    {item.name} × {item.quantity} {item.unit === 'item' ? 'item(s)' : item.unit}
                  </span>
                  <span>{settings.currency} {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-white/10 pt-2 mt-2 flex justify-between items-center">
                <span className="text-white font-semibold">Total</span>
                <span className="text-teal-400 font-bold">
                  {settings.currency} {totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Sell Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSell}
          disabled={cart.length === 0}
          className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 text-white font-semibold
            transition-all duration-300 ${cart.length === 0 
              ? 'bg-gray-500/50 cursor-not-allowed' 
              : 'bg-gradient-to-r from-teal-500 to-teal-600'}`}
        >
          <MdShoppingCart className="text-xl" />
          Complete Sale
        </motion.button>
      </div>

      {/* Success Dialog */}
      {showSuccessDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-slate-800 rounded-2xl p-6 max-w-md w-full"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}
                className="mx-auto mb-4"
              >
                <MdCheckCircle className="w-16 h-16 text-teal-500 mx-auto" />
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-white mb-6"
              >
                Sale Complete!
              </motion.h3>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNewSale}
                className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-teal-500 to-teal-600 
                  text-white rounded-xl font-semibold 
                  transition-all duration-300 flex items-center justify-center gap-2"
              >
                <MdShoppingCart className="text-xl" />
                Start New Sale
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

