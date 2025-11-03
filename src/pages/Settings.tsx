import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaCog, FaSave, FaCheck, FaFileImport, FaFileExport, FaChevronDown, FaExclamationTriangle } from 'react-icons/fa';
import { MdArrowBack } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';
import { readFile, writeFile } from '@tauri-apps/plugin-fs';
import { Settings as SettingsType } from '../types';

interface FormErrors {
  restaurant_name?: string;
  email?: string;
  phone?: string;
  tax_rate?: string;
  opening_time?: string;
  closing_time?: string;
}

const currencyOptions = [
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'AFN', name: 'Afghan Afghani', symbol: '؋' },
  { code: 'ALL', name: 'Albanian Lek', symbol: 'L' },
  { code: 'AMD', name: 'Armenian Dram', symbol: '֏' },
  { code: 'ANG', name: 'Netherlands Antillean Guilder', symbol: 'ƒ' },
  { code: 'AOA', name: 'Angolan Kwanza', symbol: 'Kz' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'AWG', name: 'Aruban Florin', symbol: 'ƒ' },
  { code: 'AZN', name: 'Azerbaijani Manat', symbol: '₼' },
  { code: 'BAM', name: 'Bosnia-Herzegovina Convertible Mark', symbol: 'KM' },
  { code: 'BBD', name: 'Barbadian Dollar', symbol: '$' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب' },
  { code: 'BIF', name: 'Burundian Franc', symbol: 'Fr' },
  { code: 'BMD', name: 'Bermudan Dollar', symbol: '$' },
  { code: 'BND', name: 'Brunei Dollar', symbol: '$' },
  { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs.' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'BSD', name: 'Bahamian Dollar', symbol: '$' },
  { code: 'BTN', name: 'Bhutanese Ngultrum', symbol: 'Nu.' },
  { code: 'BWP', name: 'Botswanan Pula', symbol: 'P' },
  { code: 'BYN', name: 'Belarusian Ruble', symbol: 'Br' },
  { code: 'BZD', name: 'Belize Dollar', symbol: '$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CDF', name: 'Congolese Franc', symbol: 'Fr' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'COP', name: 'Colombian Peso', symbol: '$' },
  { code: 'CRC', name: 'Costa Rican Colón', symbol: '₡' },
  { code: 'CUP', name: 'Cuban Peso', symbol: '$' },
  { code: 'CVE', name: 'Cape Verdean Escudo', symbol: '$' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
  { code: 'DJF', name: 'Djiboutian Franc', symbol: 'Fr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'DOP', name: 'Dominican Peso', symbol: '$' },
  { code: 'DZD', name: 'Algerian Dinar', symbol: 'د.ج' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: '£' },
  { code: 'ERN', name: 'Eritrean Nakfa', symbol: 'Nfk' },
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'FJD', name: 'Fijian Dollar', symbol: '$' },
  { code: 'FKP', name: 'Falkland Islands Pound', symbol: '£' },
  { code: 'FOK', name: 'Faroese Króna', symbol: 'kr' },
  { code: 'GBP', name: 'British Pound Sterling', symbol: '£' },
  { code: 'GEL', name: 'Georgian Lari', symbol: '₾' },
  { code: 'GGP', name: 'Guernsey Pound', symbol: '£' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
  { code: 'GIP', name: 'Gibraltar Pound', symbol: '£' },
  { code: 'GMD', name: 'Gambian Dalasi', symbol: 'D' },
  { code: 'GNF', name: 'Guinean Franc', symbol: 'Fr' },
  { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q' },
  { code: 'GYD', name: 'Guyanaese Dollar', symbol: '$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'HNL', name: 'Honduran Lempira', symbol: 'L' },
  { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn' },
  { code: 'HTG', name: 'Haitian Gourde', symbol: 'G' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'ILS', name: 'Israeli New Shekel', symbol: '₪' },
  { code: 'IMP', name: 'Manx Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'IQD', name: 'Iraqi Dinar', symbol: 'ع.د' },
  { code: 'IRR', name: 'Iranian Rial', symbol: '﷼' },
  { code: 'ISK', name: 'Icelandic Króna', symbol: 'kr' },
  { code: 'JEP', name: 'Jersey Pound', symbol: '£' },
  { code: 'JMD', name: 'Jamaican Dollar', symbol: '$' },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'Sh' },
  { code: 'KGS', name: 'Kyrgystani Som', symbol: 'с' },
  { code: 'KHR', name: 'Cambodian Riel', symbol: '៛' },
  { code: 'KID', name: 'Kiribati Dollar', symbol: '$' },
  { code: 'KMF', name: 'Comorian Franc', symbol: 'Fr' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك' },
  { code: 'KYD', name: 'Cayman Islands Dollar', symbol: '$' },
  { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸' },
  { code: 'LAK', name: 'Laotian Kip', symbol: '₭' },
  { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل' },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs' },
  { code: 'LRD', name: 'Liberian Dollar', symbol: '$' },
  { code: 'LSL', name: 'Lesotho Loti', symbol: 'L' },
  { code: 'LYD', name: 'Libyan Dinar', symbol: 'ل.د' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.' },
  { code: 'MDL', name: 'Moldovan Leu', symbol: 'L' },
  { code: 'MGA', name: 'Malagasy Ariary', symbol: 'Ar' },
  { code: 'MKD', name: 'Macedonian Denar', symbol: 'ден' },
  { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K' },
  { code: 'MNT', name: 'Mongolian Tugrik', symbol: '₮' },
  { code: 'MOP', name: 'Macanese Pataca', symbol: 'P' },
  { code: 'MRU', name: 'Mauritanian Ouguiya', symbol: 'UM' },
  { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨' },
  { code: 'MVR', name: 'Maldivian Rufiyaa', symbol: '.ރ' },
  { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MK' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'MZN', name: 'Mozambican Metical', symbol: 'MT' },
  { code: 'NAD', name: 'Namibian Dollar', symbol: '$' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'NIO', name: 'Nicaraguan Córdoba', symbol: 'C$' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.' },
  { code: 'PAB', name: 'Panamanian Balboa', symbol: 'B/.' },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/.' },
  { code: 'PGK', name: 'Papua New Guinean Kina', symbol: 'K' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'PYG', name: 'Paraguayan Guarani', symbol: '₲' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei' },
  { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин.' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'Fr' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س' },
  { code: 'SBD', name: 'Solomon Islands Dollar', symbol: '$' },
  { code: 'SCR', name: 'Seychellois Rupee', symbol: '₨' },
  { code: 'SDG', name: 'Sudanese Pound', symbol: '£' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'SHP', name: 'Saint Helena Pound', symbol: '£' },
  { code: 'SLE', name: 'Sierra Leonean Leone', symbol: 'Le' },
  { code: 'SOS', name: 'Somali Shilling', symbol: 'Sh' },
  { code: 'SRD', name: 'Surinamese Dollar', symbol: '$' },
  { code: 'SSP', name: 'South Sudanese Pound', symbol: '£' },
  { code: 'STN', name: 'São Tomé and Príncipe Dobra', symbol: 'Db' },
  { code: 'SYP', name: 'Syrian Pound', symbol: '£S' },
  { code: 'SZL', name: 'Eswatini Lilangeni', symbol: 'L' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'TJS', name: 'Tajikistani Somoni', symbol: 'ЅМ' },
  { code: 'TMT', name: 'Turkmenistani Manat', symbol: 'm' },
  { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت' },
  { code: 'TOP', name: 'Tongan Paʻanga', symbol: 'T$' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'TTD', name: 'Trinidad and Tobago Dollar', symbol: '$' },
  { code: 'TVD', name: 'Tuvaluan Dollar', symbol: '$' },
  { code: 'TWD', name: 'New Taiwan Dollar', symbol: 'NT$' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'Sh' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'Sh' },
  { code: 'USD', name: 'United States Dollar', symbol: '$' },
  { code: 'UYU', name: 'Uruguayan Peso', symbol: '$' },
  { code: 'UZS', name: 'Uzbekistani Som', symbol: "so'm" },
  { code: 'VES', name: 'Venezuelan Bolívar', symbol: 'Bs.' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
  { code: 'VUV', name: 'Vanuatu Vatu', symbol: 'Vt' },
  { code: 'WST', name: 'Samoan Tala', symbol: 'T' },
  { code: 'XAF', name: 'Central African CFA Franc', symbol: 'Fr' },
  { code: 'XCD', name: 'East Caribbean Dollar', symbol: '$' },
  { code: 'XDR', name: 'Special Drawing Rights', symbol: 'SDR' },
  { code: 'XOF', name: 'West African CFA Franc', symbol: 'Fr' },
  { code: 'XPF', name: 'CFP Franc', symbol: 'Fr' },
  { code: 'YER', name: 'Yemeni Rial', symbol: '﷼' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK' },
  { code: 'ZWL', name: 'Zimbabwean Dollar', symbol: '$' },
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
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleBackNavigation = () => {
    setIsNavigating(true);
    setTimeout(() => {
      navigate('/');
    }, 300);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate restaurant name
    if (!settings.restaurant_name || !settings.restaurant_name.trim()) {
      newErrors.restaurant_name = 'Restaurant name is required';
    }

    // Validate email (optional but must be valid if provided)
    if (settings.email && settings.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate phone (optional but check format if provided)
    if (settings.phone && settings.phone.trim() && !/^[\d\s\-\+\(\)]+$/.test(settings.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Validate tax rate
    if (settings.tax_rate && settings.tax_rate.trim()) {
      const taxRate = parseFloat(settings.tax_rate);
      if (isNaN(taxRate)) {
        newErrors.tax_rate = 'Tax rate must be a number';
      } else if (taxRate < 0 || taxRate > 100) {
        newErrors.tax_rate = 'Tax rate must be between 0 and 100';
      }
    }

    // Validate times
    if (settings.opening_time && settings.closing_time) {
      if (settings.opening_time >= settings.closing_time) {
        newErrors.opening_time = 'Opening time must be before closing time';
        newErrors.closing_time = 'Closing time must be after opening time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogoChange = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsUploadingLogo(true);
    try {
      const file = await open({
        multiple: false,
        filters: [{
          name: 'Image',
          extensions: ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp']
        }],
        title: 'Select Restaurant Logo'
      });

      if (file && typeof file === 'string') {
        console.log('Selected file:', file);
        const contents = await readFile(file);
        
        // Convert Uint8Array to base64 using a more efficient method
        // Process in chunks to avoid stack overflow
        let binary = '';
        const chunkSize = 8192;
        for (let i = 0; i < contents.length; i += chunkSize) {
          const chunk = contents.slice(i, i + chunkSize);
          binary += String.fromCharCode.apply(null, Array.from(chunk));
        }
        const base64 = btoa(binary);
        
        // Detect file extension to set proper MIME type
        const extension = file.split('.').pop()?.toLowerCase();
        let mimeType = 'image/jpeg';
        if (extension === 'png') mimeType = 'image/png';
        else if (extension === 'gif') mimeType = 'image/gif';
        else if (extension === 'webp') mimeType = 'image/webp';
        else if (extension === 'bmp') mimeType = 'image/bmp';
        
        const dataUrl = `data:${mimeType};base64,${base64}`;
        setLogoPreview(dataUrl);
        setSettings(prev => ({
          ...prev,
          logo: dataUrl
        }));
      }
    } catch (error) {
      console.error('Error selecting logo:', error);
      alert(`Error selecting logo: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      setSubmitStatus('error');
      setErrorMessage('Please fix the errors before saving');
      setTimeout(() => {
        setSubmitStatus('idle');
        setErrorMessage('');
      }, 5000);
      return;
    }

    setIsSaving(true);
    setSubmitStatus('idle');
    setErrorMessage('');
    
    try {
      await invoke('save_settings', { settings });
      setSubmitStatus('success');
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setSubmitStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Error saving settings');
      setTimeout(() => {
        setSubmitStatus('idle');
        setErrorMessage('');
      }, 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImportDatabase = async () => {
    setIsImporting(true);
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
        
        // Convert Uint8Array to base64 using a more efficient method
        // Process in chunks to avoid stack overflow
        let binary = '';
        const chunkSize = 8192;
        for (let i = 0; i < contents.length; i += chunkSize) {
          const chunk = contents.slice(i, i + chunkSize);
          binary += String.fromCharCode.apply(null, Array.from(chunk));
        }
        const base64 = btoa(binary);
        
        await invoke('import_database_cmd', { data: base64 });
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 3000);
        loadSettings();
      }
    } catch (error) {
      console.error('Error importing database:', error);
      alert(`Error importing database: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportDatabase = async () => {
    setIsExporting(true);
    try {
      const base64Data = await invoke<string>('export_database_cmd');
      
      const date = new Date().toISOString().split('T')[0];
      const filePath = await save({
        defaultPath: `restaurant-database-${date}.db`,
        filters: [{
          name: 'Database',
          extensions: ['db']
        }]
      });

      if (filePath) {
        // Decode base64 to binary
        const binary = atob(base64Data);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        
        await writeFile(filePath, bytes);
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error exporting database:', error);
      alert(`Error exporting database: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsExporting(false);
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
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="bg-white/10 backdrop-blur-sm rounded-full p-6 w-fit mx-auto mb-6"
          >
            <FaCog className="w-16 h-16 md:w-20 md:h-20 text-teal-400" />
          </motion.div>
          <motion.h1
            className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-teal-400 to-purple-400 py-2"
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
                        disabled={isUploadingLogo}
                        className="w-full flex flex-col items-center px-4 py-6 bg-white/5 text-gray-300
                        rounded-lg border-2 border-gray-600 border-dashed cursor-pointer
                        hover:border-teal-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUploadingLogo ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-8 h-8 mb-2 border-2 border-teal-400 border-t-transparent rounded-full"
                            />
                            <span className="mt-2 text-sm">Loading...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="mt-2 text-sm">
                              {logoPreview ? 'Change logo' : 'Upload logo'}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 text-center">
                      Supported formats: PNG, JPG, GIF (max. 2MB)
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">
                    Restaurant Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="restaurant_name"
                    value={settings.restaurant_name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg bg-white/5 border text-white 
                      focus:outline-none transition-colors ${
                        errors.restaurant_name 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-600 focus:border-teal-400'
                      }`}
                  />
                  {errors.restaurant_name && (
                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                      <FaExclamationTriangle className="text-xs" />
                      {errors.restaurant_name}
                    </p>
                  )}
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
                    className={`w-full px-4 py-2 rounded-lg bg-white/5 border text-white 
                      focus:outline-none transition-colors ${
                        errors.phone 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-600 focus:border-teal-400'
                      }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                      <FaExclamationTriangle className="text-xs" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={settings.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg bg-white/5 border text-white 
                      focus:outline-none transition-colors ${
                        errors.email 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-600 focus:border-teal-400'
                      }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                      <FaExclamationTriangle className="text-xs" />
                      {errors.email}
                    </p>
                  )}
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
                    className={`w-full px-4 py-2 rounded-lg bg-white/5 border text-white 
                      focus:outline-none transition-colors ${
                        errors.tax_rate 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-600 focus:border-teal-400'
                      }`}
                  />
                  {errors.tax_rate && (
                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                      <FaExclamationTriangle className="text-xs" />
                      {errors.tax_rate}
                    </p>
                  )}
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
                    className={`w-full px-4 py-2 rounded-lg bg-white/5 border text-white 
                      focus:outline-none transition-colors ${
                        errors.opening_time 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-600 focus:border-teal-400'
                      }`}
                  />
                  {errors.opening_time && (
                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                      <FaExclamationTriangle className="text-xs" />
                      {errors.opening_time}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Closing Time</label>
                  <input
                    type="time"
                    name="closing_time"
                    value={settings.closing_time}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg bg-white/5 border text-white 
                      focus:outline-none transition-colors ${
                        errors.closing_time 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-600 focus:border-teal-400'
                      }`}
                  />
                  {errors.closing_time && (
                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                      <FaExclamationTriangle className="text-xs" />
                      {errors.closing_time}
                    </p>
                  )}
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

          {/* Save and Back Buttons */}
          <div className="flex gap-4 mb-8">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBackNavigation}
              className="flex-1 py-3 rounded-xl bg-gray-600 hover:bg-gray-700 text-white font-semibold
                transition-colors duration-200 flex items-center justify-center gap-2"
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
                  Back
                </>
              )}
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: isSaving ? 1 : 1.02 }}
              whileTap={{ scale: isSaving ? 1 : 0.98 }}
              disabled={isSaving}
              className="flex-2 py-3 bg-linear-to-r from-teal-400 to-purple-400 text-white rounded-xl 
                font-semibold transition-all duration-200 flex items-center justify-center gap-2
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FaSave className="text-xl" />
                  Save Settings
                </>
              )}
            </motion.button>
          </div>

          {/* Import/Export Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.button
              type="button"
              whileHover={{ scale: isImporting ? 1 : 1.02 }}
              whileTap={{ scale: isImporting ? 1 : 0.98 }}
              onClick={handleImportDatabase}
              disabled={isImporting}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl 
                font-semibold transition-all duration-200 flex items-center justify-center gap-2
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <FaFileImport className="text-xl" />
                  Import Database
                </>
              )}
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: isExporting ? 1 : 1.02 }}
              whileTap={{ scale: isExporting ? 1 : 0.98 }}
              onClick={handleExportDatabase}
              disabled={isExporting}
              className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl 
                font-semibold transition-all duration-200 flex items-center justify-center gap-2
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <FaFileExport className="text-xl" />
                  Export Database
                </>
              )}
            </motion.button>
          </div>
        </motion.form>

        {/* Success Message */}
        {submitStatus === 'success' && isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-teal-500 text-white px-6 py-3 
              rounded-xl flex items-center gap-2 shadow-lg z-50"
          >
            <FaCheck className="text-xl" />
            Settings saved successfully!
          </motion.div>
        )}

        {/* Error Message */}
        {submitStatus === 'error' && errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 
              rounded-xl flex items-center gap-2 shadow-lg z-50 max-w-md"
          >
            <FaExclamationTriangle className="text-xl" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

