import { motion } from 'framer-motion';
import { useState, useMemo, useEffect, useRef } from 'react';
import { MdArrowBack, MdDelete, MdFilterList, MdLocalPrintshop, MdFileDownload, MdClose } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { invoke } from '@tauri-apps/api/core';
import { Transaction, Settings } from '../types';
import DatePicker from '../components/DatePicker';
import Receipt from '../components/Receipt';
import jsPDF from 'jspdf';
import ThemeToggle from '../components/ThemeToggle';

export default function Transactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState<Transaction | null>(null);
  const [settings, setSettings] = useState<Settings>({
    restaurant_name: 'Restaurant Management System',
    address: '',
    phone: '',
    currency: 'PKR',
    receipt_footer: 'Thank you for your business!'
  });
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleBackNavigation = () => {
    setIsNavigating(true);
    setTimeout(() => {
      navigate('/');
    }, 300);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [transactionsRes, settingsRes] = await Promise.all([
        invoke<Transaction[]>('get_transactions'),
        invoke<Settings>('get_settings')
      ]);
      
      setTransactions(transactionsRes);
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
      setLoading(false);
    }
  };

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
      await invoke('delete_transaction', { id });
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!showReceiptDialog) {
      alert('Receipt not ready. Please try again.');
      return;
    }

    try {
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
      pdf.text(`Date: ${showReceiptDialog.date}  Time: ${showReceiptDialog.time}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 4;
      pdf.text(`Receipt #: ${showReceiptDialog.id}`, pageWidth / 2, yPos, { align: 'center' });
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
      showReceiptDialog.items.forEach(item => {
        const itemName = item.name.length > 18 ? item.name.substring(0, 18) + '...' : item.name;
        const itemPrice = item.subtotal || (item.price * item.quantity);
        pdf.text(itemName, margin, yPos);
        pdf.text(`${item.quantity} ${item.unit}`, pageWidth / 2, yPos, { align: 'center' });
        pdf.text(`${showReceiptDialog.currency} ${itemPrice.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
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
      pdf.text(`${showReceiptDialog.currency} ${showReceiptDialog.total_amount.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
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

      const filename = `receipt-${showReceiptDialog.id}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Error generating PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 
        flex items-center justify-center transition-colors duration-300">
        <div className="text-slate-900 dark:text-white">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-purple-100 to-slate-100 
      dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 transition-colors duration-300">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-0 sm:justify-between mb-6">
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
                  className="w-5 h-5 border-2 border-slate-900 dark:border-white border-t-transparent rounded-full"
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
            className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white transition-colors duration-300"
          >
            Transaction History
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-slate-900 dark:text-white gap-2 
              bg-purple-200 dark:bg-purple-600/30 px-4 py-2 rounded-lg
              transition-colors duration-300"
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
            className="bg-white/70 dark:bg-white/10 backdrop-blur-sm rounded-xl p-4 transition-colors duration-300"
          >
            <h2 className="text-lg text-slate-900 dark:text-white mb-2">All Time Total</h2>
            <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              {transactions[0]?.currency || ''} {totalAllTime.toFixed(2)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 dark:bg-white/10 backdrop-blur-sm rounded-xl p-4 transition-colors duration-300"
          >
            <h2 className="text-lg text-slate-900 dark:text-white mb-2">Filtered Period Total</h2>
            <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              {transactions[0]?.currency || ''} {totalFiltered.toFixed(2)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 dark:bg-white/10 backdrop-blur-sm rounded-xl p-4 transition-colors duration-300"
          >
            <h2 className="text-lg text-slate-900 dark:text-white mb-2">Filtered Transactions</h2>
            <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              {filteredTransactions.length}
            </p>
          </motion.div>
        </div>

        {/* Product Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 dark:bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 transition-colors duration-300"
        >
          <h2 className="text-xl text-slate-900 dark:text-white mb-4">Product Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {productStats.map((stat) => (
              <div 
                key={stat.name}
                className="bg-white/50 dark:bg-white/5 rounded-lg p-3"
              >
                <h3 className="text-slate-900 dark:text-white font-medium mb-2">{stat.name}</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-white/60">Total Sold:</span>
                  <span className="text-slate-900 dark:text-white">{stat.count} units</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-white/60">Revenue:</span>
                  <span className="text-teal-600 dark:text-teal-400">{transactions[0]?.currency || ''} {stat.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-white/60">Avg. Price:</span>
                  <span className="text-slate-900 dark:text-white">{transactions[0]?.currency || ''} {(stat.totalAmount / stat.count).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-white/70 dark:bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 overflow-visible transition-colors duration-300"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
              />
            </div>
            {(startDate || endDate) && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 
                    hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
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
              className="bg-white/70 dark:bg-white/10 backdrop-blur-sm rounded-xl p-4 transition-colors duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-slate-600 dark:text-white/60 text-sm">
                    {new Date(transaction.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="text-slate-600 dark:text-white/60 text-sm">{transaction.time}</div>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowReceiptDialog(transaction)}
                    className="text-white p-2 bg-teal-600 dark:bg-teal-500/30 hover:bg-teal-700 dark:hover:bg-teal-500/50 rounded-lg transition-colors"
                  >
                    <MdLocalPrintshop className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteTransaction(transaction.id)}
                    className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 p-2"
                  >
                    <MdDelete className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {transaction.items.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:justify-between text-slate-900 dark:text-white py-1">
                    <div className="flex-1">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-slate-600 dark:text-white/60 ml-2">
                        ({item.quantity} {item.unit} × {transaction.currency} {(item.price || 0).toFixed(2)})
                      </span>
                    </div>
                    <div className="text-teal-600 dark:text-teal-400 sm:ml-4">
                      {transaction.currency} {(item.subtotal || 0).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-300 dark:border-white/10 pt-3 flex justify-between items-center">
                <span className="text-slate-900 dark:text-white font-semibold">Total:</span>
                <span className="text-xl font-bold text-teal-600 dark:text-teal-400">
                  {transaction.currency} {transaction.total_amount.toFixed(2)}
                </span>
              </div>
            </motion.div>
          ))}

          {filteredTransactions.length === 0 && (
            <div className="text-center text-slate-600 dark:text-white/60 py-8">
              No transactions found for the selected period
            </div>
          )}
        </div>
      </div>

      {/* Receipt Dialog */}
      {showReceiptDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
          onClick={() => setShowReceiptDialog(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full my-8 transition-colors duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Receipt</h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowReceiptDialog(null)}
                className="text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white p-2"
              >
                <MdClose className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Receipt Preview */}
            <div className="mb-6">
              <Receipt
                ref={receiptRef}
                products={showReceiptDialog.items.map(item => ({
                  name: item.name,
                  quantity: item.quantity,
                  unit: item.unit,
                  price: item.subtotal || (item.price * item.quantity)
                }))}
                totalAmount={showReceiptDialog.total_amount}
                date={showReceiptDialog.date}
                time={showReceiptDialog.time}
                settings={settings}
                receiptNumber={showReceiptDialog.id.toString()}
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownloadPDF}
                className="py-3 px-4 bg-blue-500 text-white rounded-xl font-semibold 
                  transition-all duration-300 flex items-center justify-center gap-2"
              >
                <MdFileDownload className="text-xl" />
                PDF
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePrint}
                className="py-3 px-4 bg-purple-500 text-white rounded-xl font-semibold 
                  transition-all duration-300 flex items-center justify-center gap-2"
              >
                <MdLocalPrintshop className="text-xl" />
                Print
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

