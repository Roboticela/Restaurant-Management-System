import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaStar, FaCode, FaHeart } from 'react-icons/fa';
import { MdArrowBack } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { openUrl } from '@tauri-apps/plugin-opener';
import CompanyLogo from '../assets/CompanyLogo.png';
import packageJson from '../../package.json';

export default function About() {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isOpeningGitHub, setIsOpeningGitHub] = useState(false);
  const [isStarringGitHub, setIsStarringGitHub] = useState(false);

  const handleBackNavigation = () => {
    setIsNavigating(true);
    setTimeout(() => {
      navigate('/');
    }, 300);
  };

  const openGitHub = async () => {
    setIsOpeningGitHub(true);
    try {
      await openUrl('https://github.com/Roboticela/restaurant-management-system');
    } catch (error) {
      console.error('Failed to open GitHub:', error);
    } finally {
      setTimeout(() => {
        setIsOpeningGitHub(false);
      }, 500);
    }
  };

  const starOnGitHub = async () => {
    setIsStarringGitHub(true);
    try {
      await openUrl('https://github.com/Roboticela/restaurant-management-system');
    } catch (error) {
      console.error('Failed to open GitHub:', error);
    } finally {
      setTimeout(() => {
        setIsStarringGitHub(false);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-24">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="bg-white/10 backdrop-blur-sm rounded-full p-6 w-fit mx-auto mb-6"
          >
            <FaHeart className="w-16 h-16 md:w-20 md:h-20 text-teal-400" />
          </motion.div>
          <motion.h1
            className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-teal-400 to-purple-400 py-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            About Restaurant Management System
          </motion.h1>
          <p className="text-gray-300 mt-4 text-lg">
            An open-source solution for managing your restaurant operations
          </p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          className="max-w-4xl mx-auto space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Project Info */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <FaCode className="text-teal-400" />
              About the Project
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Restaurant Management System is a modern, open-source desktop application built with Tauri, React, and TypeScript. 
              It provides a comprehensive solution for managing restaurant operations including sales, inventory, analytics, and more.
            </p>
            <p className="text-gray-300 leading-relaxed">
              This application is designed to be fast, secure, and easy to use. Built with performance in mind, 
              it leverages the power of Rust for backend operations and React for a beautiful, responsive user interface.
            </p>
          </div>

          {/* GitHub & Contribution */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              <FaGithub className="text-teal-400" />
              Open Source
            </h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              This project is open-source and welcomes contributions from the community. 
              Whether you want to report a bug, suggest a feature, or contribute code, we'd love to hear from you!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.button
                onClick={openGitHub}
                disabled={isOpeningGitHub}
                className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl 
                  font-semibold transition-colors duration-200 flex items-center justify-center gap-2
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isOpeningGitHub ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Opening...</span>
                  </>
                ) : (
                  <>
                    <FaGithub className="text-xl" />
                    View on GitHub
                  </>
                )}
              </motion.button>

              <motion.button
                onClick={starOnGitHub}
                disabled={isStarringGitHub}
                className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl 
                  font-semibold transition-colors duration-200 flex items-center justify-center gap-2
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStarringGitHub ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Opening...</span>
                  </>
                ) : (
                  <>
                    <FaStar className="text-xl" />
                    Star on GitHub
                  </>
                )}
              </motion.button>
            </div>

            <div className="mt-6 p-4 bg-white/5 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">How to Contribute</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Fork the repository on GitHub</li>
                <li>• Create a new branch for your feature or bugfix</li>
                <li>• Make your changes and commit with clear messages</li>
                <li>• Push to your fork and submit a pull request</li>
                <li>• Follow the code style and testing guidelines</li>
              </ul>
            </div>
          </div>

          {/* Links Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Important Links</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong className="text-white">Landing Page:</strong> Visit our app landing page at{' '}
                <a 
                  href="https://github.com/Roboticela/restaurant-management-system" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400! hover:text-purple-400! underline! transition-colors duration-200 font-semibold"
                >
                  Restaurant Management System
                </a>
              </p>
              <p>
                <strong className="text-white">Privacy Policy:</strong> Read our{' '}
                <a 
                  href="https://github.com/Roboticela/restaurant-management-system/blob/main/PRIVACY.md" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400! hover:text-purple-400! underline! transition-colors duration-200 font-semibold"
                >
                  Privacy Policy
                </a>
              </p>
              <p>
                <strong className="text-white">Terms of Use:</strong> Read our{' '}
                <a 
                  href="https://github.com/Roboticela/restaurant-management-system/blob/main/TERMS.md" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400! hover:text-purple-400! underline! transition-colors duration-200 font-semibold"
                >
                  Terms of Use
                </a>
              </p>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Technology Stack</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white/5 p-4 rounded-lg text-center">
                <p className="text-teal-400 font-semibold">Tauri</p>
                <p className="text-gray-400 text-sm">Desktop Framework</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg text-center">
                <p className="text-teal-400 font-semibold">React</p>
                <p className="text-gray-400 text-sm">UI Library</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg text-center">
                <p className="text-teal-400 font-semibold">TypeScript</p>
                <p className="text-gray-400 text-sm">Type Safety</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg text-center">
                <p className="text-teal-400 font-semibold">Rust</p>
                <p className="text-gray-400 text-sm">Backend</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg text-center">
                <p className="text-teal-400 font-semibold">SQLite</p>
                <p className="text-gray-400 text-sm">Database</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg text-center">
                <p className="text-teal-400 font-semibold">Tailwind CSS</p>
                <p className="text-gray-400 text-sm">Styling</p>
              </div>
            </div>
          </div>

          {/* Version Info */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 text-center">
            <p className="text-gray-300">
              <strong className="text-white">Version:</strong> {packageJson.version}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              © {new Date().getFullYear()} Roboticela. All rights reserved.
            </p>
          </div>

          {/* Developed by Roboticela */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-center gap-3 text-gray-300">
              <span className="text-sm">Developed by</span>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <img 
                  src={CompanyLogo} 
                  alt="Roboticela Logo" 
                  className="h-8 w-8 object-contain"
                />
                <span className="text-white font-semibold text-lg">Roboticela</span>
              </div>
            </div>
          </motion.div>

          {/* Back Button */}
          <div className="flex justify-center">
            <motion.button
              onClick={handleBackNavigation}
              className="px-8 py-3 rounded-xl bg-gray-600 hover:bg-gray-700 text-white font-semibold
                transition-colors duration-200 flex items-center justify-center gap-2 min-w-[180px]"
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
                  <MdArrowBack className="text-xl" />
                  Back to Home
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

