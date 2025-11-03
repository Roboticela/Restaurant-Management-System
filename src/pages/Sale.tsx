import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { MdArrowBack, MdShoppingCart, MdCheckCircle, MdLocalPrintshop, MdFileDownload } from 'react-icons/md';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { invoke } from '@tauri-apps/api/core';
import { Product, Settings, CartItem, Sale as SaleType } from '../types';
import Receipt from '../components/Receipt';
import jsPDF from 'jspdf';
import ThemeToggle from '../components/ThemeToggle';

export default function Sale() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [receiptData, setReceiptData] = useState<{
    products: { name: string; quantity: number; unit: string; price: number }[];
    totalAmount: number;
    date: string;
    time: string;
    receiptNumber: string;
  } | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<Settings>({
    restaurant_name: 'Restaurant Management System',
    address: '',
    phone: '',
    currency: 'PKR',
    receipt_footer: 'Thank you for your business!'
  });
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSelling, setIsSelling] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const handleBackNavigation = () => {
    setIsNavigating(true);
    setTimeout(() => {
      navigate('/');
    }, 300);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
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
      } finally {
        setIsLoading(false);
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
      setIsSelling(true);
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

      // Generate receipt data
      const now = new Date();
      setReceiptData({
        products: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price * item.quantity
        })),
        totalAmount,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        receiptNumber: Math.random().toString(36).substr(2, 9).toUpperCase()
      });

      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Error saving sale:', error);
      alert('Error completing sale');
    } finally {
      setIsSelling(false);
    }
  };

  const handleNewSale = () => {
    setCart([]);
    setShowSuccessDialog(false);
    setReceiptData(null);
  };

  const handlePrint = () => {
    setIsPrinting(true);
    // Small delay to show the loading state
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  const handleDownloadPDF = async () => {
    if (!receiptData) {
      alert('Receipt not ready. Please try again.');
      return;
    }

    try {
      setIsDownloadingPDF(true);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 297] // 80mm width, A4 height
      });

      let yPos = 10;
      const pageWidth = 80;
      const margin = 5;
      const contentWidth = pageWidth - (margin * 2);

      // Header
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      const restaurantName = settings.restaurant_name || 'Restaurant Management System';
      pdf.text(restaurantName, pageWidth / 2, yPos, { align: 'center' });
      yPos += 7;

      // Address and Phone
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      if (settings.address) {
        pdf.text(settings.address, pageWidth / 2, yPos, { align: 'center' });
        yPos += 5;
      }
      if (settings.phone) {
        pdf.text(`Tel: ${settings.phone}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 5;
      }

      // Date and Time
      pdf.text(`Date: ${receiptData.date}  Time: ${receiptData.time}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 4;
      pdf.text(`Receipt #: ${receiptData.receiptNumber}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 6;

      // Separator
      pdf.setDrawColor(0);
      pdf.setLineWidth(0.3);
      for (let i = 0; i < contentWidth; i += 2) {
        pdf.line(margin + i, yPos, margin + i + 1, yPos);
      }
      yPos += 5;

      // Items Header
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Item', margin, yPos);
      pdf.text('Qty', pageWidth / 2, yPos, { align: 'center' });
      pdf.text('Price', pageWidth - margin, yPos, { align: 'right' });
      yPos += 5;

      // Items
      pdf.setFont('helvetica', 'normal');
      receiptData.products.forEach(product => {
        const itemName = product.name.length > 18 ? product.name.substring(0, 18) + '...' : product.name;
        pdf.text(itemName, margin, yPos);
        pdf.text(`${product.quantity} ${product.unit}`, pageWidth / 2, yPos, { align: 'center' });
        pdf.text(`${settings.currency} ${product.price.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
        yPos += 5;
      });

      // Separator
      yPos += 1;
      for (let i = 0; i < contentWidth; i += 2) {
        pdf.line(margin + i, yPos, margin + i + 1, yPos);
      }
      yPos += 5;

      // Total
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Total', margin, yPos);
      pdf.text(`${settings.currency} ${receiptData.totalAmount.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
      yPos += 8;

      // Footer
      if (settings.receipt_footer) {
        for (let i = 0; i < contentWidth; i += 2) {
          pdf.line(margin + i, yPos, margin + i + 1, yPos);
        }
        yPos += 5;
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        const footerLines = pdf.splitTextToSize(settings.receipt_footer, contentWidth);
        pdf.text(footerLines, pageWidth / 2, yPos, { align: 'center' });
      }

      const filename = `receipt-${receiptData.receiptNumber}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Error generating PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const totalAmount = cart.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full"
          />
        </div>
      )}
      
      {!isLoading && (
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
            className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white order-first sm:order-0 
              transition-colors duration-300"
          >
            New Sale
          </motion.h1>
          <div className="hidden sm:block w-24" />
        </div>

        {/* Total Amount Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 dark:bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 
            transition-colors duration-300"
        >
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg sm:text-xl text-slate-900 dark:text-white mb-1">Total Amount</h2>
              <p className="text-3xl sm:text-4xl font-bold text-teal-600 dark:text-teal-400">
                {settings.currency} {totalAmount.toFixed(2)}
              </p>
            </div>
            <div className="text-slate-600 dark:text-white/60">
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
                    ? 'bg-teal-100 dark:bg-teal-500/20 border-2 border-teal-500 dark:border-teal-500' 
                    : 'bg-white/70 dark:bg-white/10 border-2 border-transparent'
                }`}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-slate-900 dark:text-white font-medium">{product.name}</h3>
                      <p className="text-teal-600 dark:text-teal-400 font-semibold">
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
                      className="flex items-center justify-between bg-white/30 dark:bg-white/10 rounded-lg p-2"
                    >
                      <button
                        onClick={() => updateQuantity(
                          product.id, 
                          (cartItem.quantity || 0) - (product.unit === 'item' || product.unit === 'items' ? 1 : 0.5),
                          product.unit
                        )}
                        className="w-8 h-8 flex items-center justify-center text-white bg-red-400 dark:bg-red-500/20 
                          hover:bg-red-500 rounded-lg transition-colors"
                      >
                        -
                      </button>
                      <div className="flex flex-col items-center">
                        <span className="text-slate-900 dark:text-white font-medium text-lg">
                          {cartItem.quantity} {product.unit === 'item' ? 'item(s)' : product.unit}
                        </span>
                        <span className="text-slate-600 dark:text-white/60 text-sm">
                          {settings.currency} {(cartItem.quantity * product.price).toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() => updateQuantity(
                          product.id, 
                          (cartItem.quantity || 0) + (product.unit === 'item' || product.unit === 'items' ? 1 : 0.5),
                          product.unit
                        )}
                        className="w-8 h-8 flex items-center justify-center text-white bg-teal-400 dark:bg-teal-500/20 
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
            className="bg-white/70 dark:bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 transition-colors duration-300"
          >
            <h3 className="text-slate-900 dark:text-white font-semibold mb-3">Cart Summary</h3>
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center text-slate-700 dark:text-white/80">
                  <span>
                    {item.name} × {item.quantity} {item.unit === 'item' ? 'item(s)' : item.unit}
                  </span>
                  <span>{settings.currency} {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-slate-300 dark:border-white/10 pt-2 mt-2 flex justify-between items-center">
                <span className="text-slate-900 dark:text-white font-semibold">Total</span>
                <span className="text-teal-600 dark:text-teal-400 font-bold">
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
          disabled={cart.length === 0 || isSelling}
          className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 text-white font-semibold
            transition-all duration-300 shadow-lg hover:shadow-xl ${cart.length === 0 || isSelling
              ? 'bg-gray-500/50 cursor-not-allowed' 
              : 'bg-teal-500'}`}
        >
          {isSelling ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <MdShoppingCart className="text-xl" />
              Complete Sale
            </>
          )}
        </motion.button>
      </div>
      )}

      {/* Success Dialog */}
      {showSuccessDialog && receiptData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full my-8 transition-colors duration-300"
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
                className="text-2xl font-bold text-slate-900 dark:text-white mb-6"
              >
                Sale Complete!
              </motion.h3>

              {/* Receipt Preview */}
              <div className="mb-6">
                <Receipt
                  ref={receiptRef}
                  products={receiptData.products}
                  totalAmount={receiptData.totalAmount}
                  date={receiptData.date}
                  time={receiptData.time}
                  settings={settings}
                  receiptNumber={receiptData.receiptNumber}
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownloadPDF}
                  disabled={isDownloadingPDF}
                  className={`py-3 px-4 text-white rounded-xl font-semibold 
                    transition-all duration-300 flex items-center justify-center gap-2 ${
                      isDownloadingPDF ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500'
                    }`}
                >
                  {isDownloadingPDF ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <MdFileDownload className="text-xl" />
                      PDF
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePrint}
                  disabled={isPrinting}
                  className={`py-3 px-4 text-white rounded-xl font-semibold 
                    transition-all duration-300 flex items-center justify-center gap-2 ${
                      isPrinting ? 'bg-purple-300 cursor-not-allowed' : 'bg-purple-500'
                    }`}
                >
                  {isPrinting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Printing...</span>
                    </>
                  ) : (
                    <>
                      <MdLocalPrintshop className="text-xl" />
                      Print
                    </>
                  )}
                </motion.button>
              </div>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNewSale}
                className="w-full py-3 px-4 bg-teal-500 
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

