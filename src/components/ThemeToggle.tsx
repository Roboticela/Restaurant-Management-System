import { motion } from 'framer-motion';
import { MdLightMode, MdDarkMode } from 'react-icons/md';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="relative w-14 h-7 bg-slate-300 dark:bg-slate-600 rounded-full p-1 
        transition-colors duration-300 flex items-center"
      aria-label="Toggle theme"
    >
      <motion.div
        className="w-5 h-5 bg-white dark:bg-slate-800 rounded-full shadow-md 
          flex items-center justify-center"
        animate={{
          x: theme === 'dark' ? 24 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        {theme === 'dark' ? (
          <MdDarkMode className="w-3 h-3 text-yellow-400" />
        ) : (
          <MdLightMode className="w-3 h-3 text-yellow-500" />
        )}
      </motion.div>
    </motion.button>
  );
}

