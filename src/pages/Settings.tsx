import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaCog, FaSave, FaCheck, FaFileImport, FaFileExport, FaChevronDown } from 'react-icons/fa';
import { MdArrowBack } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';
import { readFile, writeFile } from '@tauri-apps/plugin-fs';
import { Settings as SettingsType } from '../types';

const currencyOptions = [
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
].sort((a, b) => a.name.localeCompare(b.name));

interface CurrencyDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const CurrencyDropdown = ({ value, onChange }: CurrencyDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = currencyOptions.filter(currency =>
    currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCurrency = currencyOptions.find(c => c.code === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-gray-600 text-white 
          cursor-pointer hover:border-teal-400 transition-all duration-200 flex items-center justify-between"
      >
        <span>
          {selectedCurrency ? (
            `${selectedCurrency.name} (${selectedCurrency.code} ${selectedCurrency.symbol})`
          ) : 'Select Currency'}
        </span>
        <FaChevronDown className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-gray-600 rounded-lg">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search currency..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-gray-600 rounded-md text-white 
                focus:outline-none focus:border-teal-400 transition-colors"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {filteredOptions.map((currency) => (
              <div
                key={currency.code}
                onClick={() => {
                  onChange(currency.code);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className={`px-4 py-2 cursor-pointer flex items-center justify-between
                  ${value === currency.code ? 'bg-teal-500/20 text-teal-400' : 'text-white hover:bg-white/5'}
                  transition-colors duration-200`}
              >
                <span>{currency.name}</span>
                <span className="text-gray-400">
                  {currency.code} {currency.symbol}
                </span>
              </div>
            ))}
            {filteredOptions.length === 0 && (
              <div className="px-4 py-2 text-gray-400 text-center">
                No currencies found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SettingsType>({
    restaurant_name: 'Restaurant Management System',
    address: '',
    phone: '',
    email: '',
    tax_rate: '',
    currency: 'PKR',
    opening_time: '09:00',
    closing_time: '22:00',
    receipt_footer: '',
    logo: undefined
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | undefined>(undefined);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = async () => {
    try {
      const file = await open({
        multiple: false,
        filters: [{
          name: 'Image',
          extensions: ['png', 'jpg', 'jpeg', 'gif']
        }]
      });

      if (file) {
        const contents = await readFile(file as string);
        const base64 = btoa(String.fromCharCode(...contents));
        const dataUrl = `data:image/jpeg;base64,${base64}`;
        setLogoPreview(dataUrl);
        setSettings(prev => ({
          ...prev,
          logo: dataUrl
        }));
      }
    } catch (error) {
      console.error('Error selecting logo:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await invoke('save_settings', { settings });
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    }
  };

  const handleImportDatabase = async () => {
    try {
      const file = await open({
        multiple: false,
        filters: [{
          name: 'Database',
          extensions: ['db']
        }]
      });

      if (file) {
        const contents = await readFile(file as string);
        const base64 = btoa(String.fromCharCode(...contents));
        await invoke('import_database_cmd', { data: base64 });
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 3000);
        loadSettings();
      }
    } catch (error) {
      console.error('Error importing database:', error);
      alert('Error importing database');
    }
  };

  const handleExportDatabase = async () => {
    try {
      const base64Data = await invoke<string>('export_database_cmd');
      const binary = atob(base64Data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const date = new Date().toISOString().split('T')[0];
      const filePath = await save({
        defaultPath: `restaurant-database-${date}.db`,
        filters: [{
          name: 'Database',
          extensions: ['db']
        }]
      });

      if (filePath) {
        await writeFile(filePath, bytes);
        alert('Database exported successfully');
      }
    } catch (error) {
      console.error('Error exporting database:', error);
      alert('Error exporting database');
    }
  };

  const loadSettings = useCallback(async () => {
    try {
      const loadedSettings = await invoke<SettingsType>('get_settings');
      if (loadedSettings) {
        setSettings(prev => ({
          ...prev,
          ...loadedSettings,
        }));
        if (loadedSettings.logo) {
          setLogoPreview(loadedSettings.logo);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
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
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="bg-white/10 backdrop-blur-sm rounded-full p-6 w-fit mx-auto mb-6"
          >
            <FaCog className="w-16 h-16 md:w-20 md:h-20 text-teal-400" />
          </motion.div>
          <motion.h1
            className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-purple-400 py-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Settings
          </motion.h1>
        </motion.div>

        {/* Settings Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-6">Basic Information</h2>

                <div>
                  <label className="block text-gray-300 mb-2">Restaurant Logo</label>
                  <div className="space-y-4">
                    {logoPreview && (
                      <div className="relative w-32 h-32 mx-auto">
                        <img
                          src={logoPreview}
                          alt="Logo Preview"
                          className="rounded-lg object-contain w-full h-full"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setLogoPreview(undefined);
                            setSettings(prev => ({ ...prev, logo: undefined }));
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1
                            hover:bg-red-600 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    )}
                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        onClick={handleLogoChange}
                        className="w-full flex flex-col items-center px-4 py-6 bg-white/5 text-gray-300
                        rounded-lg border-2 border-gray-600 border-dashed cursor-pointer
                        hover:border-teal-400 transition-colors"
                      >
                        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="mt-2 text-sm">
                          {logoPreview ? 'Change logo' : 'Upload logo'}
                        </span>
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 text-center">
                      Supported formats: PNG, JPG, GIF (max. 2MB)
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Restaurant Name</label>
                  <input
                    type="text"
                    name="restaurant_name"
                    value={settings.restaurant_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-gray-600 text-white 
                      focus:outline-none focus:border-teal-400 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Address</label>
                  <textarea
                    name="address"
                    value={settings.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-gray-600 text-white 
                      focus:outline-none focus:border-teal-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={settings.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-gray-600 text-white 
                      focus:outline-none focus:border-teal-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={settings.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-gray-600 text-white 
                      focus:outline-none focus:border-teal-400 transition-colors"
                  />
                </div>
              </div>

              {/* Business Settings */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-6">Business Settings</h2>

                <div>
                  <label className="block text-gray-300 mb-2">Tax Rate (%)</label>
                  <input
                    type="number"
                    name="tax_rate"
                    value={settings.tax_rate}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-gray-600 text-white 
                      focus:outline-none focus:border-teal-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Currency</label>
                  <CurrencyDropdown
                    value={settings.currency || 'PKR'}
                    onChange={(value) => setSettings(prev => ({ ...prev, currency: value }))}
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Opening Time</label>
                  <input
                    type="time"
                    name="opening_time"
                    value={settings.opening_time}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-gray-600 text-white 
                      focus:outline-none focus:border-teal-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Closing Time</label>
                  <input
                    type="time"
                    name="closing_time"
                    value={settings.closing_time}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-gray-600 text-white 
                      focus:outline-none focus:border-teal-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Receipt Footer Message</label>
                  <textarea
                    name="receipt_footer"
                    value={settings.receipt_footer}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-gray-600 text-white 
                      focus:outline-none focus:border-teal-400 transition-colors"
                    placeholder="Thank you for dining with us!"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Import/Export Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleImportDatabase}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl 
                font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              <FaFileImport className="text-xl" />
              Import Database
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportDatabase}
              className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl 
                font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              <FaFileExport className="text-xl" />
              Export Database
            </motion.button>
          </div>

          {/* Save and Back Buttons */}
          <div className="flex gap-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/')}
              className="flex-1 py-3 rounded-xl bg-gray-600 hover:bg-gray-700 text-white font-semibold
                transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <MdArrowBack className="text-xl" />
              Back
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-[2] py-3 bg-gradient-to-r from-teal-400 to-purple-400 text-white rounded-xl 
                font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              <FaSave className="text-xl" />
              Save Settings
            </motion.button>
          </div>
        </motion.form>

        {/* Success Message */}
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-teal-500 text-white px-6 py-3 
              rounded-xl flex items-center gap-2"
          >
            <FaCheck className="text-xl" />
            Settings saved successfully!
          </motion.div>
        )}
      </div>
    </div>
  );
}

