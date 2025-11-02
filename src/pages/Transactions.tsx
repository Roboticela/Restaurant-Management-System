import { motion } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import { MdArrowBack, MdDelete, MdFilterList } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { invoke } from '@tauri-apps/api/core';
import { Transaction } from '../types';
import DatePicker from '../components/DatePicker';

export default function Transactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await invoke<Transaction[]>('get_transactions');
      setTransactions(response);
    } catch (error) {
      console.error('Error loading transactions:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 
    flex items-center justify-center">
        <div className="text-white">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-0 sm:justify-between mb-6">
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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 overflow-visible"
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
                  className="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 
                    rounded-lg transition-colors"
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
      </div>
    </div>
  );
}

