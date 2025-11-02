import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { MdArrowBack, MdTrendingUp, MdAttachMoney, MdShoppingCart, MdPeople } from 'react-icons/md';
import Link from 'next/link';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import axios from 'axios';
import Head from 'next/head';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface AnalyticsData {
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  productDistribution: Array<{
    name: string;
    value: number;
  }>;
  summary: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
  };
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData>({
    dailyRevenue: [],
    topProducts: [],
    productDistribution: [],
    summary: { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 }
  });
  const [currency, setCurrency] = useState('PKR');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [analyticsRes, settingsRes] = await Promise.all([
          axios.get('/api/analytics'),
          axios.get('/api/settings')
        ]);
        setData(analyticsRes.data);
        setCurrency(settingsRes.data?.currency || 'PKR');
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate growth rate
  const growthRate = useMemo(() => {
    if (data.dailyRevenue.length < 2) return 0;
    const first = data.dailyRevenue[0].revenue;
    const last = data.dailyRevenue[data.dailyRevenue.length - 1].revenue;
    return ((last - first) / first * 100).toFixed(1);
  }, [data.dailyRevenue]);

  if (loading) {
    return (
      <>
        <Head>
          <title>Analytics</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 
      flex items-center justify-center">
          <div className="text-white">Loading analytics...</div>

        </div>;
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Analytics</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:justify-between mb-8">
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
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Analytics Dashboard</h1>
            <div className="hidden sm:block w-32"></div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-teal-500/20 rounded-lg">
                  <MdAttachMoney className="w-6 h-6 text-teal-500" />
                </div>
                <div>
                  <p className="text-white/60">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">
                    {currency} {data.summary.totalRevenue.toFixed(2)}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <MdTrendingUp className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-white/60">Growth Rate</p>
                  <p className="text-2xl font-bold text-white">{growthRate}%</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <MdShoppingCart className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-white/60">Total Orders</p>
                  <p className="text-2xl font-bold text-white">{data.summary.totalOrders}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <MdAttachMoney className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-white/60">Avg. Order Value</p>
                  <p className="text-2xl font-bold text-white">
                    {currency} {data.summary.averageOrderValue.toFixed(2)}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Revenue Trend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6"
            >
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Revenue Trend</h2>
              <div className="h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.dailyRevenue}>
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
              </div>
            </motion.div>

            {/* Top Products */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6"
            >
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Top Products</h2>
              <div className="h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topProducts}>
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
              </div>
            </motion.div>

            {/* Product Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6"
            >
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Product Distribution</h2>
              <div className="h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.productDistribution}
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
                      {data.productDistribution.map((entry, index) => (
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
              </div>
            </motion.div>

            {/* Daily Orders Trend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6"
            >
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Daily Orders Trend</h2>
              <div className="h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.dailyRevenue}>
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
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
