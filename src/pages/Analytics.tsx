import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { MdArrowBack, MdTrendingUp, MdAttachMoney, MdShoppingCart } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { invoke } from '@tauri-apps/api/core';
import { AnalyticsData, Settings } from '../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Analytics() {
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsData>({
    daily_revenue: [],
    top_products: [],
    product_distribution: [],
    summary: { total_orders: 0, total_revenue: 0, average_order_value: 0 }
  });
  const [currency, setCurrency] = useState('PKR');
  const [loading, setLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleBackNavigation = () => {
    setIsNavigating(true);
    setTimeout(() => {
      navigate('/');
    }, 300);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [analyticsRes, settingsRes] = await Promise.all([
          invoke<AnalyticsData>('get_analytics'),
          invoke<Settings>('get_settings')
        ]);
        
        // Ensure we have valid data structure
        setData({
          daily_revenue: analyticsRes?.daily_revenue || [],
          top_products: analyticsRes?.top_products || [],
          product_distribution: analyticsRes?.product_distribution || [],
          summary: analyticsRes?.summary || { 
            total_orders: 0, 
            total_revenue: 0, 
            average_order_value: 0 
          }
        });
        setCurrency(settingsRes?.currency || 'PKR');
      } catch (error) {
        console.error('Error loading analytics data:', error);
        // Set empty data structure on error
        setData({
          daily_revenue: [],
          top_products: [],
          product_distribution: [],
          summary: { total_orders: 0, total_revenue: 0, average_order_value: 0 }
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate growth rate
  const growthRate = useMemo(() => {
    if (data.daily_revenue.length < 2) return 0;
    const first = data.daily_revenue[0].revenue;
    const last = data.daily_revenue[data.daily_revenue.length - 1].revenue;
    return ((last - first) / first * 100).toFixed(1);
  }, [data.daily_revenue]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-slate-900 dark:text-white">Loading analytics...</div>
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:justify-between mb-8">
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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white transition-colors duration-300">
            Analytics Dashboard
          </h1>
          <div className="hidden sm:block w-32"></div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 dark:bg-white/10 backdrop-blur-sm rounded-xl p-6 transition-colors duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-500/20 rounded-lg">
                <MdAttachMoney className="w-6 h-6 text-teal-600 dark:text-teal-500" />
              </div>
              <div>
                <p className="text-slate-600 dark:text-white/60">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {currency} {data.summary.total_revenue.toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/70 dark:bg-white/10 backdrop-blur-sm rounded-xl p-6 transition-colors duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <MdTrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-500" />
              </div>
              <div>
                <p className="text-slate-600 dark:text-white/60">Growth Rate</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{growthRate}%</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/70 dark:bg-white/10 backdrop-blur-sm rounded-xl p-6 transition-colors duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <MdShoppingCart className="w-6 h-6 text-purple-600 dark:text-purple-500" />
              </div>
              <div>
                <p className="text-slate-600 dark:text-white/60">Total Orders</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{data.summary.total_orders}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/70 dark:bg-white/10 backdrop-blur-sm rounded-xl p-6 transition-colors duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <MdAttachMoney className="w-6 h-6 text-orange-600 dark:text-orange-500" />
              </div>
              <div>
                <p className="text-slate-600 dark:text-white/60">Avg. Order Value</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {currency} {data.summary.average_order_value.toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Empty State Message */}
        {data.summary.total_orders === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 dark:bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-8 text-center transition-colors duration-300"
          >
            <div className="text-slate-600 dark:text-white/60 text-lg mb-2">No data available yet</div>
            <div className="text-slate-500 dark:text-white/40">
              Complete some sales to see analytics and insights
            </div>
          </motion.div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Revenue Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 dark:bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 transition-colors duration-300"
          >
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-4">Revenue Trend</h2>
            <div className="h-[250px] sm:h-[300px]">
              {data.daily_revenue.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.daily_revenue}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#0088FE" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="date" stroke="#ffffff60" />
                    <YAxis stroke="#ffffff60" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                      labelStyle={{ color: '#ffffff' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#0088FE"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-500 dark:text-white/40">No revenue data available</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 dark:bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 transition-colors duration-300"
          >
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-4">Top Products</h2>
            <div className="h-[250px] sm:h-[300px]">
              {data.top_products.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.top_products}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="name" stroke="#ffffff60" />
                    <YAxis stroke="#ffffff60" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                      labelStyle={{ color: '#ffffff' }}
                    />
                    <Bar dataKey="sales" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-500 dark:text-white/40">No product sales data available</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Product Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 dark:bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 transition-colors duration-300"
          >
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-4">Product Distribution</h2>
            <div className="h-[250px] sm:h-[300px]">
              {data.product_distribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.product_distribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) =>
                        `${name} (${value}) ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.product_distribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        color: '#ffffff'
                      }}
                      itemStyle={{ color: '#ffffff' }}
                      labelStyle={{ color: '#ffffff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-500 dark:text-white/40">No product distribution data available</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Daily Orders Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 dark:bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 transition-colors duration-300"
          >
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-4">Daily Orders Trend</h2>
            <div className="h-[250px] sm:h-[300px]">
              {data.daily_revenue.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.daily_revenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="date" stroke="#ffffff60" />
                    <YAxis stroke="#ffffff60" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                      labelStyle={{ color: '#ffffff' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#FFBB28"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-500 dark:text-white/40">No orders data available</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

