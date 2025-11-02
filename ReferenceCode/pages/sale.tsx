import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { MdArrowBack, MdShoppingCart, MdCheckCircle, MdFileDownload, MdPrint, MdKeyboardArrowDown, MdLocalPrintshop } from 'react-icons/md';
import { FaCheck, FaPlus } from 'react-icons/fa';
import Link from 'next/link';
import React from 'react';
import axios from 'axios';
import Head from 'next/head';

interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
}

interface Settings {
  restaurantName: string;
  address: string;
  phone: string;
  currency: string;
  receiptFooter: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface SaleItem {
  name: string;
  price: number;
  quantity: number;
}

interface Printer {
  deviceId: string;
  name: string;
  paperSizes: string[];
}

const TransactionReceipt = React.forwardRef<HTMLDivElement, { 
  products: { name: string; price: number; quantity: number; unit: string }[];
  totalAmount: number;
  date: string;
  time: string;
  settings: Settings;
  receiptNumber: string;
}>(({ products, totalAmount, date, time, settings, receiptNumber }, ref) => {
  return (
    <div 
      ref={ref} 
      className="receipt-container"
      style={{ 
        width: '80mm',
        padding: '10mm',
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily: 'Arial, sans-serif',
        fontSize: '10pt',
        lineHeight: '1.2',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div className="receipt-header" style={{ textAlign: 'center', marginBottom: '5mm' }}>
        <div style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '2mm' }}>
          {settings.restaurantName}
        </div>
        {settings.address && (
          <div style={{ marginBottom: '2mm' }}>{settings.address}</div>
        )}
        {settings.phone && (
          <div style={{ marginBottom: '2mm' }}>Tel: {settings.phone}</div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9pt' }}>
          <span>Date: {date}</span>
          <span>Time: {time}</span>
        </div>
        <div style={{ marginTop: '2mm', fontSize: '9pt' }}>
          Receipt #: {receiptNumber}
        </div>
      </div>

      {/* Separator */}
      <div style={{ borderTop: '1px dashed #000', margin: '3mm 0' }} />

      {/* Items */}
      <div className="receipt-items" style={{ marginBottom: '5mm' }}>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 30px 40px',
          gap: '2mm',
          marginBottom: '2mm',
          fontSize: '9pt',
          fontWeight: 'bold'
        }}>
          <div>Item</div>
          <div style={{ textAlign: 'center' }}>Qty</div>
          <div style={{ textAlign: 'right' }}>Total</div>
        </div>

        {products.map((product, index) => (
          <div key={index} style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 30px 40px',
            gap: '2mm',
            fontSize: '9pt',
            marginBottom: '1mm'
          }}>
            <div>{product.name}</div>
            <div style={{ textAlign: 'center' }}>
              {product.quantity}
            </div>
            <div style={{ textAlign: 'right' }}>
              {settings.currency} {(product.price * product.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Separator */}
      <div style={{ borderTop: '1px dashed #000', margin: '3mm 0' }} />

      {/* Total */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        fontWeight: 'bold',
        fontSize: '11pt',
        marginBottom: '5mm'
      }}>
        <span>Total</span>
        <span>{settings.currency} {totalAmount.toFixed(2)}</span>
      </div>

      {/* Footer */}
      <div style={{ 
        textAlign: 'center',
        fontSize: '9pt',
        marginTop: '5mm',
        borderTop: '1px dashed #000',
        paddingTop: '3mm'
      }}>
        {settings.receiptFooter}
      </div>
    </div>
  );
});

TransactionReceipt.displayName = 'TransactionReceipt';

export default function NewSale() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings>({
    restaurantName: 'Restaurant Management System',
    address: '',
    phone: '',
    currency: 'PKR',
    receiptFooter: 'Thank you for your business!'
  });
  const receiptRef = useRef<HTMLDivElement>(null);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const generateReceiptNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}-${Math.random().toString(36).substring(2, 15)}`;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, settingsRes] = await Promise.all([
          axios.get('/api/products'),
          axios.get('/api/settings')
        ]);
        
        setProducts(productsRes.data);
        if (settingsRes.data) {
          setSettings({
            restaurantName: settingsRes.data.restaurantName || 'Restaurant Management System',
            address: settingsRes.data.address || '',
            phone: settingsRes.data.phone || '',
            currency: settingsRes.data.currency || 'PKR',
            receiptFooter: settingsRes.data.receiptFooter || 'Thank you for your business!'
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const loadPrinters = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (typeof window !== 'undefined' && window?.electron) {
        try {
          console.log('Window electron object:', window.electron);
          console.log('Attempting to get printers');
          const availablePrinters = await window.electron.getPrinters();
          console.log('Received printers:', availablePrinters);
          setPrinters(availablePrinters || []);
          if (availablePrinters && availablePrinters.length > 0) {
            setSelectedPrinter(availablePrinters[0].deviceId);
          }
        } catch (error) {
          console.error('Error loading printers:', error);
          setPrinters([]);
        }
      } else {
        console.log('Electron not available:', { 
          windowExists: typeof window !== 'undefined',
          electronExists: typeof window !== 'undefined' && !!window.electron
        });
      }
    };

    loadPrinters();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isDropdownOpen && !target.closest('.printer-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

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
      await axios.post('/api/sales', {
        products: cart.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          unit: item.unit,
          receiptNumber: generateReceiptNumber()
        })),
        totalAmount,
        currency: settings.currency
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

  const handlePrint = async () => {
    if (!window?.electron) {
      console.error('Electron not available');
      return;
    }

    try {
      const receiptNumber = generateReceiptNumber();
      const receiptData = {
        products: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price
        })),
        totalAmount,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        settings,
        receiptNumber
      };

      await window.electron.printReceipt(receiptData, selectedPrinter);
    } catch (error) {
      console.error('Printing error:', error);
      alert('Error printing receipt');
    }
  };

  const handleDownloadPDF = async () => {
    if (!window?.electron) {
      console.error('Electron not available');
      return;
    }

    try {
      const receiptNumber = generateReceiptNumber(); // Implement this function
      const receiptData = {
        products: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price
        })),
        totalAmount,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        settings,
        receiptNumber
      };

      // Send to main process for PDF generation
      await window.electron.generatePDF(receiptData);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF');
    }
  };

  return (
    <>
      <Head>
        <title>New Sale</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-0 sm:justify-between mb-6 sm:mb-8">
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center text-white gap-2 bg-purple-600/30 px-4 py-2 rounded-lg"
              >
                <MdArrowBack className="w-5 h-5" />
                <span>Back</span>
              </motion.button>
            </Link>
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

          {/* Add a Cart Summary section above the Complete Sale button */}
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
                : 'bg-gradient-to-r from-teal-500 to-teal-600 hover:shadow-lg hover:shadow-teal-500/50'}`}
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
              className="bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl"
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

                {/* Receipt */}
                <TransactionReceipt
                  ref={receiptRef}
                  products={cart.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    unit: item.unit,
                    price: item.price * item.quantity
                  }))}
                  totalAmount={totalAmount}
                  date={new Date().toISOString().split('T')[0]}
                  time={new Date().toLocaleTimeString()}
                  settings={settings}
                  receiptNumber={Math.random().toString(36).substr(2, 9).toUpperCase()}
                />

                {/* Replace the existing printer selection with this custom dropdown */}
                <div className="mb-4 relative printer-dropdown">
                  <label className="block text-white text-sm font-medium mb-2">
                    Select Printer
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`w-full p-3 rounded-lg text-left flex items-center justify-between
                        transition-colors duration-200 ${
                          printers.length === 0
                            ? 'bg-gray-700/50 cursor-not-allowed'
                            : 'bg-white/10 hover:bg-white/20'
                        } border border-white/20`}
                      disabled={printers.length === 0}
                    >
                      <div className="flex items-center gap-2">
                        <MdLocalPrintshop className="text-xl text-white/70" />
                        <span className="text-white">
                          {selectedPrinter
                            ? printers.find(p => p.deviceId === selectedPrinter)?.name
                            : printers.length === 0
                              ? 'No printers available'
                              : 'Select a printer'}
                        </span>
                      </div>
                      <MdKeyboardArrowDown 
                        className={`text-xl text-white/70 transition-transform duration-200
                          ${isDropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && printers.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-2 bg-slate-700 rounded-lg shadow-xl 
                          border border-white/10 py-1 max-h-48 overflow-y-auto printer-dropdown"
                      >
                        {printers.map((printer) => (
                          <button
                            key={printer.deviceId}
                            onClick={() => {
                              setSelectedPrinter(printer.deviceId);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-2 text-left hover:bg-white/10 transition-colors
                              flex items-center gap-2 ${
                                selectedPrinter === printer.deviceId ? 'bg-white/20' : ''
                              }`}
                          >
                            <MdLocalPrintshop className={`text-lg ${
                              selectedPrinter === printer.deviceId ? 'text-teal-400' : 'text-white/70'
                            }`} />
                            <div className="flex flex-col">
                              <span className="text-white text-sm">{printer.name}</span>
                              <span className="text-white/50 text-xs">
                                {printer.paperSizes.join(', ')}
                              </span>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownloadPDF}
                    className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-xl font-semibold 
                      shadow-lg hover:bg-blue-600 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <MdFileDownload className="text-xl" />
                    Download PDF
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: printers.length > 0 ? 1.02 : 1 }}
                    whileTap={{ scale: printers.length > 0 ? 0.98 : 1 }}
                    onClick={handlePrint}
                    disabled={!selectedPrinter || printers.length === 0}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold shadow-lg 
                      transition-all duration-300 flex items-center justify-center gap-2
                      ${printers.length === 0 
                        ? 'bg-gray-600 text-white/30 cursor-not-allowed'
                        : selectedPrinter 
                          ? 'bg-teal-500 text-white hover:bg-teal-600' 
                          : 'bg-gray-500 text-white/50 cursor-not-allowed'}`}
                  >
                    <MdPrint className="text-xl" />
                    {printers.length === 0 ? 'No Printers Available' : 'Print Receipt'}
                  </motion.button>
                </div>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNewSale}
                  className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-teal-500 to-teal-600 
                    text-white rounded-xl font-semibold shadow-lg hover:shadow-teal-500/50 
                    transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <MdShoppingCart className="text-xl" />
                  Start New Sale
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Error Dialog - for when no products are selected */}
        {cart.length === 0 && showSuccessDialog && (
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
              className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl"
            >
              <div className="text-center">
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xl font-bold text-white mb-2"
                >
                  Please Select Products
                </motion.h3>
                <p className="text-gray-400">
                  Select at least one product to complete the sale.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </>
  );
}
