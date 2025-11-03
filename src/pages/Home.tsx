import { FaUtensils, FaClipboardList, FaChartBar, FaHistory, FaCog, FaHeart, FaEnvelope } from 'react-icons/fa';
import { MdPointOfSale } from 'react-icons/md';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Settings } from '../types';

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
        type: "spring" as const,
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
        type: "spring" as const,
        stiffness: 260,
        damping: 20
      }
    }
  };

  const navigate = useNavigate();
  const [restaurantName, setRestaurantName] = useState('Restaurant Management System');
  const [logo, setLogo] = useState<string | null>(null);
  const [loadingRoute, setLoadingRoute] = useState<string | null>(null);

  const handleNavigation = (route: string) => {
    setLoadingRoute(route);
    setTimeout(() => {
      navigate(route);
    }, 300);
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await invoke<Settings>('get_settings');
        if (response) {
          if (response.restaurant_name) {
            setRestaurantName(response.restaurant_name);
          }
          if (response.logo) {
            setLogo(response.logo);
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
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
              <img
                src={logo}
                alt="Restaurant Logo"
                className="w-16 h-16 md:w-20 md:h-20 object-contain"
              />
            ) : (
              <FaUtensils className="w-16 h-16 md:w-20 md:h-20 text-teal-400" />
            )}
          </motion.div>
          <motion.h1
            className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-teal-400 to-purple-400 py-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {restaurantName}
          </motion.h1>
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.button
            variants={item}
            onClick={() => handleNavigation('/manager')}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col items-center p-8 bg-linear-to-br from-blue-500 to-blue-600 
            text-white rounded-2xl transition-all duration-300
            backdrop-blur-sm bg-opacity-90 h-full relative"
            disabled={loadingRoute !== null}
          >
            {loadingRoute === '/manager' ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 mb-4 border-4 border-white border-t-transparent rounded-full"
                />
                <span className="text-xl font-semibold text-center">Loading...</span>
              </>
            ) : (
              <>
                <FaClipboardList className="w-12 h-12 mb-4" />
                <span className="text-xl font-semibold text-center">Product Manager</span>
              </>
            )}
          </motion.button>

          <motion.button
            variants={item}
            onClick={() => handleNavigation('/sale')}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col items-center p-8 bg-linear-to-br from-green-500 to-green-600 
            text-white rounded-2xl transition-all duration-300
            backdrop-blur-sm bg-opacity-90 h-full relative"
            disabled={loadingRoute !== null}
          >
            {loadingRoute === '/sale' ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 mb-4 border-4 border-white border-t-transparent rounded-full"
                />
                <span className="text-xl font-semibold text-center">Loading...</span>
              </>
            ) : (
              <>
                <MdPointOfSale className="w-12 h-12 mb-4" />
                <span className="text-xl font-semibold text-center">New Sale</span>
              </>
            )}
          </motion.button>

          <motion.button
            variants={item}
            onClick={() => handleNavigation('/analytics')}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col items-center p-8 bg-linear-to-br from-purple-500 to-purple-600 
            text-white rounded-2xl transition-all duration-300
            backdrop-blur-sm bg-opacity-90 h-full relative"
            disabled={loadingRoute !== null}
          >
            {loadingRoute === '/analytics' ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 mb-4 border-4 border-white border-t-transparent rounded-full"
                />
                <span className="text-xl font-semibold text-center">Loading...</span>
              </>
            ) : (
              <>
                <FaChartBar className="w-12 h-12 mb-4" />
                <span className="text-xl font-semibold text-center">Analytics Dashboard</span>
              </>
            )}
          </motion.button>

          <motion.button
            variants={item}
            onClick={() => handleNavigation('/transactions')}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col items-center p-8 bg-linear-to-br from-orange-500 to-orange-600 
            text-white rounded-2xl transition-all duration-300
            backdrop-blur-sm bg-opacity-90 h-full relative"
            disabled={loadingRoute !== null}
          >
            {loadingRoute === '/transactions' ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 mb-4 border-4 border-white border-t-transparent rounded-full"
                />
                <span className="text-xl font-semibold text-center">Loading...</span>
              </>
            ) : (
              <>
                <FaHistory className="w-12 h-12 mb-4" />
                <span className="text-xl font-semibold text-center">Transaction History</span>
              </>
            )}
          </motion.button>

          <motion.button
            variants={item}
            onClick={() => handleNavigation('/settings')}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col items-center p-8 bg-linear-to-br from-gray-500 to-gray-600 
            text-white rounded-2xl transition-all duration-300
            backdrop-blur-sm bg-opacity-90 h-full relative"
            disabled={loadingRoute !== null}
          >
            {loadingRoute === '/settings' ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 mb-4 border-4 border-white border-t-transparent rounded-full"
                />
                <span className="text-xl font-semibold text-center">Loading...</span>
              </>
            ) : (
              <>
                <FaCog className="w-12 h-12 mb-4" />
                <span className="text-xl font-semibold text-center">Settings</span>
              </>
            )}
          </motion.button>

          <motion.button
            variants={item}
            onClick={() => handleNavigation('/about')}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col items-center p-8 bg-linear-to-br from-pink-500 to-pink-600 
            text-white rounded-2xl transition-all duration-300
            backdrop-blur-sm bg-opacity-90 h-full relative"
            disabled={loadingRoute !== null}
          >
            {loadingRoute === '/about' ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 mb-4 border-4 border-white border-t-transparent rounded-full"
                />
                <span className="text-xl font-semibold text-center">Loading...</span>
              </>
            ) : (
              <>
                <FaHeart className="w-12 h-12 mb-4" />
                <span className="text-xl font-semibold text-center">About</span>
              </>
            )}
          </motion.button>

          <motion.button
            variants={item}
            onClick={() => handleNavigation('/support')}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col items-center p-8 bg-linear-to-br from-teal-500 to-teal-600 
            text-white rounded-2xl transition-all duration-300
            backdrop-blur-sm bg-opacity-90 h-full relative"
            disabled={loadingRoute !== null}
          >
            {loadingRoute === '/support' ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 mb-4 border-4 border-white border-t-transparent rounded-full"
                />
                <span className="text-xl font-semibold text-center">Loading...</span>
              </>
            ) : (
              <>
                <FaEnvelope className="w-12 h-12 mb-4" />
                <span className="text-xl font-semibold text-center">Support</span>
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

