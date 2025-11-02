import { FaUtensils, FaClipboardList, FaChartBar, FaHistory, FaCog } from 'react-icons/fa';
import { MdPointOfSale } from 'react-icons/md';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Head from 'next/head';

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -50 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const iconAnimation = {
    initial: { scale: 0 },
    animate: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  const router = useRouter();
  const [restaurantName, setRestaurantName] = useState('Restaurant Management System');
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await axios.get('/api/settings');
        if (response.data) {
          if (response.data.restaurantName) {
            setRestaurantName(response.data.restaurantName);
          }
          if (response.data.logo) {
            setLogo(response.data.logo);
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-24">
          {/* Header */}
          <motion.div
            className="text-center mb-16 md:mb-24"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={iconAnimation.initial}
              animate={iconAnimation.animate}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="bg-white/10 backdrop-blur-sm rounded-full p-6 w-fit mx-auto mb-6"
            >
              {logo ? (
                <Image
                  src={logo}
                  alt="Restaurant Logo"
                  width={80}
                  height={80}
                  className="w-16 h-16 md:w-20 md:h-20 object-contain"
                />
              ) : (
                <FaUtensils className="w-16 h-16 md:w-20 md:h-20 text-teal-400" />
              )}
            </motion.div>
            <motion.h1
              className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-purple-400 py-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {restaurantName}
            </motion.h1>
          </motion.div>

          {/* Navigation Buttons */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-6xl mx-auto"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.button
              variants={item}
              onClick={() => router.push('/manager')}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center p-8 bg-gradient-to-br from-blue-500 to-blue-600 
              text-white rounded-2xl shadow-lg hover:shadow-blue-500/50 transition-all duration-300
              backdrop-blur-sm bg-opacity-90 h-full"
            >
              <FaClipboardList className="w-12 h-12 mb-4" />
              <span className="text-xl font-semibold text-center">Product Manager</span>
            </motion.button>

            <motion.button
              variants={item}
              onClick={() => router.push('/sale')}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center p-8 bg-gradient-to-br from-green-500 to-green-600 
              text-white rounded-2xl shadow-lg hover:shadow-green-500/50 transition-all duration-300
              backdrop-blur-sm bg-opacity-90 h-full"
            >
              <MdPointOfSale className="w-12 h-12 mb-4" />
              <span className="text-xl font-semibold text-center">New Sale</span>
            </motion.button>

            <motion.button
              variants={item}
              onClick={() => router.push('/analytics')}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center p-8 bg-gradient-to-br from-purple-500 to-purple-600 
              text-white rounded-2xl shadow-lg hover:shadow-purple-500/50 transition-all duration-300
              backdrop-blur-sm bg-opacity-90 h-full"
            >
              <FaChartBar className="w-12 h-12 mb-4" />
              <span className="text-xl font-semibold text-center">Analytics Dashboard</span>
            </motion.button>

            <motion.button
              variants={item}
              onClick={() => router.push('/transactions')}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center p-8 bg-gradient-to-br from-orange-500 to-orange-600 
              text-white rounded-2xl shadow-lg hover:shadow-orange-500/50 transition-all duration-300
              backdrop-blur-sm bg-opacity-90 h-full"
            >
              <FaHistory className="w-12 h-12 mb-4" />
              <span className="text-xl font-semibold text-center">Transaction History</span>
            </motion.button>

            <motion.button
              variants={item}
              onClick={() => router.push('/settings')}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center p-8 bg-gradient-to-br from-gray-500 to-gray-600 
              text-white rounded-2xl shadow-lg hover:shadow-gray-500/50 transition-all duration-300
              backdrop-blur-sm bg-opacity-90 h-full"
            >
              <FaCog className="w-12 h-12 mb-4" />
              <span className="text-xl font-semibold text-center">Settings</span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </>
  );
}
