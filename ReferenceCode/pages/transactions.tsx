import { motion } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import { MdArrowBack, MdDelete, MdCalendarToday, MdFilterList, MdLocalPrintshop, MdKeyboardArrowDown, MdFileDownload, MdPrint } from 'react-icons/md';
import Link from 'next/link';
import axios from 'axios';
import React from 'react';

interface Product {
  name: string;
  price: number;
  quantity: number;
  unit: string;
  subtotal: number;
}

interface Transaction {
  id: number;
  items: Product[];
  total_amount: number;
  currency: string;
  date: string;
  time: string;
}

interface Printer {
  deviceId: string;
  name: string;
  paperSizes: string[];
}

interface Settings {
  restaurantName: string;
  address: string;
  phone: string;
  currency: string;
  receiptFooter: string;
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    restaurantName: 'Restaurant Management System',
    address: '',
    phone: '',
    currency: 'PKR',
    receiptFooter: 'Thank you for your business!'
  });
  const [showReceiptDialog, setShowReceiptDialog] = useState<Transaction | null>(null);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const response = await axios.get('/api/transactions');
        console.log(response.data);
        setTransactions(response.data);
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  useEffect(() => {
    const loadPrinters = async () => {
      if (typeof window !== 'undefined' && window?.electron) {
        try {
          const availablePrinters = await window.electron.getPrinters();
          setPrinters(availablePrinters || []);
          if (availablePrinters && availablePrinters.length > 0) {
            setSelectedPrinter(availablePrinters[0].deviceId);
          }
        } catch (error) {
          console.error('Error loading printers:', error);
          setPrinters([]);
        }
      }
    };

    const loadSettings = async () => {
      try {
        const response = await axios.get('/api/settings');
        if (response.data) {
          setSettings(response.data);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadPrinters();
    loadSettings();
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (!startDate && !endDate) return true;
      const transactionDate = new Date(t.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      if (start && end) {
        return transactionDate >= start && transactionDate <= end;
      } else if (start) {
        return transactionDate >= start;
      } else if (end) {
        return transactionDate <= end;
      }
      return true;
    });
  }, [transactions, startDate, endDate]);

  const productStats = useMemo(() => {
    const stats = new Map<string, { count: number; totalAmount: number }>();
    
    transactions.forEach(transaction => {
      transaction.items.forEach(item => {
        const existing = stats.get(item.name) || { count: 0, totalAmount: 0 };
        stats.set(item.name, {
          count: existing.count + item.quantity,
          totalAmount: existing.totalAmount + (item.price * item.quantity)
        });
      });
    });
    
    return Array.from(stats.entries()).map(([name, data]) => ({
      name,
      ...data
    }));
  }, [transactions]);

  const totalAllTime = transactions.reduce((sum, t) => sum + t.total_amount, 0);
  const totalFiltered = filteredTransactions.reduce((sum, t) => sum + t.total_amount, 0);

  const handleDeleteTransaction = async (id: number) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      await axios.delete(`/api/transactions?id=${id}`);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Error deleting transaction');
    }
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  const handlePrint = async (transaction: Transaction) => {
    if (!window?.electron || !selectedPrinter) {
      console.error('Electron not available or no printer selected');
      return;
    }

    try {
      const receiptData = {
        products: transaction.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price
        })),
        totalAmount: transaction.total_amount,
        date: transaction.date,
        time: transaction.time,
        settings,
        receiptNumber: transaction.id.toString()
      };

      await window.electron.printReceipt(receiptData, selectedPrinter);
    } catch (error) {
      console.error('Printing error:', error);
      alert('Error printing receipt');
    }
  };

  const TransactionReceipt = React.forwardRef<HTMLDivElement, { 
    transaction: Transaction;
    settings: Settings;
  }>(({ transaction, settings }, ref) => {
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
            <span>Date: {transaction.date}</span>
            <span>Time: {transaction.time}</span>
          </div>
          <div style={{ marginTop: '2mm', fontSize: '9pt' }}>
            Receipt #: {transaction.id}
          </div>
        </div>

        {/* Separator */}
        <div style={{ borderTop: '1px dashed #000', margin: '3mm 0' }} />

        {/* Items */}
        <div className="receipt-items" style={{ marginBottom: '5mm' }}>
          {transaction.items.map((item, index) => (
            <div key={index} style={{ 
              display: 'grid',
              gridTemplateColumns: '1fr 30px 40px',
              gap: '2mm',
              fontSize: '9pt',
              marginBottom: '1mm'
            }}>
              <div>{item.name}</div>
              <div style={{ textAlign: 'center' }}>
                {item.quantity}
              </div>
              <div style={{ textAlign: 'right' }}>
                {transaction.currency} {(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          fontWeight: 'bold',
          fontSize: '11pt',
          marginBottom: '5mm',
          borderTop: '1px dashed #000',
          paddingTop: '3mm'
        }}>
          <span>Total</span>
          <span>{transaction.currency} {transaction.total_amount.toFixed(2)}</span>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-0 sm:justify-between mb-6">
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
            className="text-2xl sm:text-3xl font-bold text-white"
          >
            Transaction History
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-white gap-2 bg-purple-600/30 px-4 py-2 rounded-lg"
          >
            <MdFilterList className="w-5 h-5" />
            <span>Filters</span>
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
          >
            <h2 className="text-lg text-white mb-2">All Time Total</h2>
            <p className="text-2xl font-bold text-teal-400">
              {transactions[0]?.currency || ''} {totalAllTime.toFixed(2)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
          >
            <h2 className="text-lg text-white mb-2">Filtered Period Total</h2>
            <p className="text-2xl font-bold text-teal-400">
              {transactions[0]?.currency || ''} {totalFiltered.toFixed(2)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
          >
            <h2 className="text-lg text-white mb-2">Filtered Transactions</h2>
            <p className="text-2xl font-bold text-teal-400">
              {filteredTransactions.length}
            </p>
          </motion.div>
        </div>

        {/* Product Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6"
        >
          <h2 className="text-xl text-white mb-4">Product Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {productStats.map((stat) => (
              <div 
                key={stat.name}
                className="bg-white/5 rounded-lg p-3"
              >
                <h3 className="text-white font-medium mb-2">{stat.name}</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Total Sold:</span>
                  <span className="text-white">{stat.count} units</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Revenue:</span>
                  <span className="text-teal-400">{transactions[0]?.currency || ''} {stat.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Avg. Price:</span>
                  <span className="text-white">{transactions[0]?.currency || ''} {(stat.totalAmount / stat.count).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6"
          >
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-white mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-white mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white"
                />
              </div>
              {(startDate || endDate) && (
                <button
                  onClick={clearFilters}
                  className="text-red-400 hover:text-red-300 self-end"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Transactions List */}
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-white/60 text-sm">
                    {new Date(transaction.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="text-white/60 text-sm">{transaction.time}</div>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowReceiptDialog(transaction)}
                    className="text-white p-2 rounded-lg transition-colors bg-teal-500/30 hover:bg-teal-500/50"
                  >
                    <MdLocalPrintshop className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteTransaction(transaction.id)}
                    className="text-red-400 hover:text-red-300 p-2"
                  >
                    <MdDelete className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {transaction.items.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:justify-between text-white py-1">
                    <div className="flex-1">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-white/60 ml-2">
                        ({item.quantity} {item.unit} × {transaction.currency} {(item.price || 0).toFixed(2)})
                      </span>
                    </div>
                    <div className="text-teal-400 sm:ml-4">
                      {transaction.currency} {(item.subtotal || 0).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                <span className="text-white font-semibold">Total:</span>
                <span className="text-xl font-bold text-teal-400">
                  {transaction.currency} {transaction.total_amount.toFixed(2)}
                </span>
              </div>
            </motion.div>
          ))}

          {filteredTransactions.length === 0 && (
            <div className="text-center text-white/60 py-8">
              No transactions found for the selected period
            </div>
          )}
        </div>

        {showReceiptDialog && (
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
                <h3 className="text-2xl font-bold text-white mb-6">
                  Receipt Preview
                </h3>

                {/* Receipt Preview */}
                <div className="bg-white rounded-lg mb-6 overflow-hidden">
                  <TransactionReceipt
                    transaction={showReceiptDialog}
                    settings={settings}
                  />
                </div>

                {/* Printer Selection */}
                <div className="mb-6">
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

                    {isDropdownOpen && printers.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-2 bg-slate-700 rounded-lg shadow-xl 
                          border border-white/10 py-1 max-h-48 overflow-y-auto"
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

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.electron?.generatePDF({
                      products: showReceiptDialog.items,
                      totalAmount: showReceiptDialog.total_amount,
                      date: showReceiptDialog.date,
                      time: showReceiptDialog.time,
                      settings,
                      receiptNumber: showReceiptDialog.id.toString()
                    })}
                    className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-xl font-semibold 
                      shadow-lg hover:bg-blue-600 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <MdFileDownload className="text-xl" />
                    Download PDF
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: printers.length > 0 ? 1.02 : 1 }}
                    whileTap={{ scale: printers.length > 0 ? 0.98 : 1 }}
                    onClick={() => {
                      handlePrint(showReceiptDialog);
                      setShowReceiptDialog(null);
                    }}
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
                    Print Receipt
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowReceiptDialog(null)}
                  className="w-full mt-4 py-3 px-4 bg-white/10 hover:bg-white/20
                    text-white rounded-xl font-semibold transition-all duration-300"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
