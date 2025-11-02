import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaCog, FaSave, FaCheck, FaFileImport, FaFileExport, FaChevronDown } from 'react-icons/fa';
import { MdArrowBack } from 'react-icons/md';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';

interface SettingsForm {
    restaurantName: string;
    address: string;
    phone: string;
    email: string;
    taxRate: string;
    currency: string;
    openingTime: string;
    closingTime: string;
    receiptFooter: string;
    logo?: File | string | null;
}

interface CurrencyOption {
    code: string;
    name: string;
    symbol: string;
}

const currencyOptions: CurrencyOption[] = [
    // Asia
    { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
    { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'රු' },
    { code: 'NPR', name: 'Nepalese Rupee', symbol: 'रू' },
    { code: 'MVR', name: 'Maldivian Rufiyaa', symbol: 'ރ.' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
    { code: 'TWD', name: 'New Taiwan Dollar', symbol: 'NT$' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'THB', name: 'Thai Baht', symbol: '฿' },
    { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
    { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
    { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K' },
    { code: 'KHR', name: 'Cambodian Riel', symbol: '៛' },
    { code: 'LAK', name: 'Lao Kip', symbol: '₭' },
    { code: 'MNT', name: 'Mongolian Tugrik', symbol: '₮' },
    { code: 'BND', name: 'Brunei Dollar', symbol: 'B$' },
    { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸' },
    { code: 'UZS', name: 'Uzbekistani Som', symbol: 'so\'m' },

    // Middle East
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
    { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق' },
    { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.' },
    { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب' },
    { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك' },
    { code: 'IQD', name: 'Iraqi Dinar', symbol: 'ع.د' },
    { code: 'IRR', name: 'Iranian Rial', symbol: '﷼' },
    { code: 'YER', name: 'Yemeni Rial', symbol: '﷼' },
    { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا' },
    { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل' },
    { code: 'SYP', name: 'Syrian Pound', symbol: '£S' },
    { code: 'ILS', name: 'Israeli New Shekel', symbol: '₪' },

    // Europe
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
    { code: 'ISK', name: 'Icelandic Króna', symbol: 'kr' },
    { code: 'PLN', name: 'Polish Złoty', symbol: 'zł' },
    { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
    { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
    { code: 'RON', name: 'Romanian Leu', symbol: 'lei' },
    { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв' },
    { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn' },
    { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин.' },
    { code: 'ALL', name: 'Albanian Lek', symbol: 'L' },
    { code: 'MKD', name: 'Macedonian Denar', symbol: 'ден' },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
    { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴' },
    { code: 'BYN', name: 'Belarusian Ruble', symbol: 'Br' },
    { code: 'MDL', name: 'Moldovan Leu', symbol: 'L' },

    // Americas
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
    { code: 'CLP', name: 'Chilean Peso', symbol: '$' },
    { code: 'COP', name: 'Colombian Peso', symbol: '$' },
    { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/' },
    { code: 'UYU', name: 'Uruguayan Peso', symbol: '$' },
    { code: 'PYG', name: 'Paraguayan Guaraní', symbol: '₲' },
    { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs.' },
    { code: 'VES', name: 'Venezuelan Bolívar', symbol: 'Bs.' },
    { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q' },
    { code: 'HNL', name: 'Honduran Lempira', symbol: 'L' },
    { code: 'NIO', name: 'Nicaraguan Córdoba', symbol: 'C$' },
    { code: 'CRC', name: 'Costa Rican Colón', symbol: '₡' },
    { code: 'PAB', name: 'Panamanian Balboa', symbol: 'B/.' },
    { code: 'DOP', name: 'Dominican Peso', symbol: 'RD$' },
    { code: 'JMD', name: 'Jamaican Dollar', symbol: 'J$' },
    { code: 'TTD', name: 'Trinidad and Tobago Dollar', symbol: 'TT$' },

    // Oceania
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
    { code: 'FJD', name: 'Fijian Dollar', symbol: 'FJ$' },
    { code: 'SBD', name: 'Solomon Islands Dollar', symbol: 'SI$' },
    { code: 'VUV', name: 'Vanuatu Vatu', symbol: 'VT' },
    { code: 'TOP', name: 'Tongan Paʻanga', symbol: 'T$' },
    { code: 'WST', name: 'Samoan Tālā', symbol: 'WS$' },
    { code: 'XPF', name: 'CFP Franc', symbol: '₣' },
    { code: 'PGK', name: 'Papua New Guinean Kina', symbol: 'K' },

    // Africa
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£' },
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
    { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
    { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.' },
    { code: 'DZD', name: 'Algerian Dinar', symbol: 'د.ج' },
    { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت' },
    { code: 'LYD', name: 'Libyan Dinar', symbol: 'ل.د' },
    { code: 'SDG', name: 'Sudanese Pound', symbol: 'ج.س.' },
    { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
    { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
    { code: 'RWF', name: 'Rwandan Franc', symbol: 'FRw' },
    { code: 'BIF', name: 'Burundian Franc', symbol: 'FBu' },
    { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br' },
    { code: 'KMF', name: 'Comorian Franc', symbol: 'CF' },
    { code: 'MGA', name: 'Malagasy Ariary', symbol: 'Ar' },
    { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨' },
    { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK' },
    { code: 'BWP', name: 'Botswana Pula', symbol: 'P' },
    { code: 'NAD', name: 'Namibian Dollar', symbol: 'N$' },
    { code: 'SZL', name: 'Swazi Lilangeni', symbol: 'L' },
    { code: 'LSL', name: 'Lesotho Loti', symbol: 'L' },
    { code: 'XOF', name: 'West African CFA Franc', symbol: 'CFA' },
    { code: 'XAF', name: 'Central African CFA Franc', symbol: 'FCFA' },

    // Additional Asian Currencies
    { code: 'AFN', name: 'Afghan Afghani', symbol: '؋' },
    { code: 'AMD', name: 'Armenian Dram', symbol: '֏' },
    { code: 'AZN', name: 'Azerbaijani Manat', symbol: '₼' },
    { code: 'BTC', name: 'Bhutanese Ngultrum', symbol: 'Nu.' },
    { code: 'KGS', name: 'Kyrgystani Som', symbol: 'с' },
    { code: 'MOP', name: 'Macanese Pataca', symbol: 'MOP$' },
    { code: 'MVR', name: 'Maldivian Rufiyaa', symbol: 'Rf' },
    { code: 'TMT', name: 'Turkmenistani Manat', symbol: 'T' },
    { code: 'TJS', name: 'Tajikistani Somoni', symbol: 'ЅМ' },

    // Additional Middle Eastern Currencies
    { code: 'IQD', name: 'Iraqi Dinar', symbol: 'د.ع' },
    { code: 'YER', name: 'Yemeni Rial', symbol: '﷼' },

    // Additional European Currencies
    { code: 'GIP', name: 'Gibraltar Pound', symbol: '£' },
    { code: 'IMP', name: 'Isle of Man Pound', symbol: '£' },
    { code: 'JEP', name: 'Jersey Pound', symbol: '£' },
    { code: 'GGP', name: 'Guernsey Pound', symbol: '£' },
    { code: 'BAM', name: 'Bosnia-Herzegovina Convertible Mark', symbol: 'KM' },
    { code: 'MDL', name: 'Moldovan Leu', symbol: 'L' },
    { code: 'ALL', name: 'Albanian Lek', symbol: 'L' },
    { code: 'MKD', name: 'Macedonian Denar', symbol: 'ден' },

    // Additional American Currencies
    { code: 'BBD', name: 'Barbadian Dollar', symbol: 'Bds$' },
    { code: 'BMD', name: 'Bermudian Dollar', symbol: 'BD$' },
    { code: 'BSD', name: 'Bahamian Dollar', symbol: 'B$' },
    { code: 'BZD', name: 'Belize Dollar', symbol: 'BZ$' },
    { code: 'KYD', name: 'Cayman Islands Dollar', symbol: 'CI$' },
    { code: 'XCD', name: 'East Caribbean Dollar', symbol: 'EC$' },
    { code: 'GYD', name: 'Guyanese Dollar', symbol: 'GY$' },
    { code: 'HTG', name: 'Haitian Gourde', symbol: 'G' },
    { code: 'SRD', name: 'Surinamese Dollar', symbol: 'Sr$' },
    { code: 'AWG', name: 'Aruban Florin', symbol: 'Afl.' },
    { code: 'ANG', name: 'Netherlands Antillean Guilder', symbol: 'ƒ' },

    // Additional Pacific/Oceanian Currencies
    { code: 'KID', name: 'Kiribati Dollar', symbol: '$' },
    { code: 'TVD', name: 'Tuvaluan Dollar', symbol: '$' },
    { code: 'NRU', name: 'Nauruan Dollar', symbol: '$' },

    // Additional African Currencies
    { code: 'AOA', name: 'Angolan Kwanza', symbol: 'Kz' },
    { code: 'BIF', name: 'Burundian Franc', symbol: 'FBu' },
    { code: 'CDF', name: 'Congolese Franc', symbol: 'FC' },
    { code: 'CVE', name: 'Cape Verdean Escudo', symbol: '$' },
    { code: 'DJF', name: 'Djiboutian Franc', symbol: 'Fdj' },
    { code: 'ERN', name: 'Eritrean Nakfa', symbol: 'Nfk' },
    { code: 'GMD', name: 'Gambian Dalasi', symbol: 'D' },
    { code: 'GNF', name: 'Guinean Franc', symbol: 'FG' },
    { code: 'MRU', name: 'Mauritanian Ouguiya', symbol: 'UM' },
    { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MK' },
    { code: 'SHP', name: 'Saint Helena Pound', symbol: '£' },
    { code: 'SLL', name: 'Sierra Leonean Leone', symbol: 'Le' },
    { code: 'SOS', name: 'Somali Shilling', symbol: 'Sh.So.' },
    { code: 'SSP', name: 'South Sudanese Pound', symbol: '£' },
    { code: 'STN', name: 'São Tomé and Príncipe Dobra', symbol: 'Db' },
    { code: 'SCR', name: 'Seychellois Rupee', symbol: 'SR' },

    // Additional Regional Currencies
    { code: 'XDR', name: 'Special Drawing Rights', symbol: 'SDR' },
    { code: 'XAG', name: 'Silver Ounce', symbol: 'oz t' },
    { code: 'XAU', name: 'Gold Ounce', symbol: 'oz t' },
    { code: 'XPT', name: 'Platinum Ounce', symbol: 'oz t' },
    { code: 'XPD', name: 'Palladium Ounce', symbol: 'oz t' },

    // Supranational Currencies
    { code: 'XBA', name: 'European Composite Unit', symbol: 'ECU' },
    { code: 'XBB', name: 'European Monetary Unit', symbol: 'EMU' },
    { code: 'XBC', name: 'European Unit of Account 9', symbol: 'EUA' },
    { code: 'XBD', name: 'European Unit of Account 17', symbol: 'EUA' },
    { code: 'XTS', name: 'Testing Currency Code', symbol: 'TEST' },
    { code: 'XXX', name: 'No Currency', symbol: '' }
].sort((a, b) => a.name.localeCompare(b.name));

const CurrencyDropdown = ({ value, onChange }: {
    value: string;
    onChange: (value: string) => void;
}) => {
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
                <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-gray-600 rounded-lg shadow-xl">
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
    const [settings, setSettings] = useState<SettingsForm>({
        restaurantName: 'Restaurant Management System',
        address: '',
        phone: '',
        email: '',
        taxRate: '',
        currency: 'PKR',
        openingTime: '09:00',
        closingTime: '22:00',
        receiptFooter: '',
        logo: null
    });

    const [isSuccess, setIsSuccess] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSettings(prev => ({
                ...prev,
                logo: file
            }));

            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result;
                setLogoPreview(typeof result === 'string' ? result : null);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        return () => {
            if (logoPreview) {
                URL.revokeObjectURL(logoPreview);
            }
        };
    }, [logoPreview]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let logoData = settings.logo;
            if (settings.logo instanceof File) {
                const result = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(settings.logo as File);
                });
                logoData = result;
            }

            await window.electronAPI.saveSettings({
                ...settings,
                logo: logoData
            });
            
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Error saving settings');
        }
    };

    const handleImportDatabase = async (file: File) => {
        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const database = event.target?.result as string;
                    await window.electronAPI.importDatabase({
                        database: database.split('base64,')[1]
                    });
                    setIsSuccess(true);
                    setTimeout(() => setIsSuccess(false), 3000);
                    loadSettings();
                } catch (error) {
                    console.error('Error importing database:', error);
                    alert('Error importing database');
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error reading file:', error);
            alert('Error reading file');
        }
    };

    const handleExportDatabase = async () => {
        try {
            const response = await window.electronAPI.exportDatabase();
            const { database } = response;

            const blob = new Blob([Buffer.from(database, 'base64')], {
                type: 'application/x-sqlite3'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `restaurant-database-${new Date().toISOString().split('T')[0]}.db`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting database:', error);
            alert('Error exporting database');
        }
    };

    const loadSettings = useCallback(async () => {
        try {
            const settings = await window.electronAPI.getSettings();
            if (settings) {
                setSettings(prev => ({
                    ...prev,
                    ...settings,
                }));
                if (settings.logo) {
                    setLogoPreview(settings.logo);
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
        <>
            <Head>
                <title>Settings</title>
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
                                                    <Image
                                                        src={logoPreview}
                                                        alt="Logo Preview"
                                                        fill
                                                        className="rounded-lg object-contain"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setLogoPreview(null);
                                                            setSettings(prev => ({ ...prev, logo: null }));
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
                                                <label className="w-full flex flex-col items-center px-4 py-6 bg-white/5 text-gray-300
                        rounded-lg border-2 border-gray-600 border-dashed cursor-pointer
                        hover:border-teal-400 transition-colors">
                                                    <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="mt-2 text-sm">
                                                        {logoPreview ? 'Change logo' : 'Upload logo'}
                                                    </span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleLogoChange}
                                                        className="hidden"
                                                    />
                                                </label>
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
                                            name="restaurantName"
                                            value={settings.restaurantName}
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
                                            required
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
                                            required
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
                                            required
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
                                            name="taxRate"
                                            value={settings.taxRate}
                                            onChange={handleChange}
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-gray-600 text-white 
                      focus:outline-none focus:border-teal-400 transition-colors"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 mb-2">Currency</label>
                                        <CurrencyDropdown
                                            value={settings.currency}
                                            onChange={(value) => handleChange({
                                                target: { name: 'currency', value }
                                            } as React.ChangeEvent<HTMLSelectElement>)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 mb-2">Opening Time</label>
                                        <input
                                            type="time"
                                            name="openingTime"
                                            value={settings.openingTime}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-gray-600 text-white 
                      focus:outline-none focus:border-teal-400 transition-colors"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 mb-2">Closing Time</label>
                                        <input
                                            type="time"
                                            name="closingTime"
                                            value={settings.closingTime}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-gray-600 text-white 
                      focus:outline-none focus:border-teal-400 transition-colors"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 mb-2">Receipt Footer Message</label>
                                        <textarea
                                            name="receiptFooter"
                                            value={settings.receiptFooter}
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
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="relative"
                            >
                                <input
                                    type="file"
                                    accept=".db"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            handleImportDatabase(e.target.files[0]);
                                        }
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl 
                font-semibold transition-all duration-200 flex items-center justify-center gap-2
                hover:shadow-lg hover:shadow-blue-500/30">
                                    <FaFileImport className="text-xl" />
                                    Import Database
                                </div>
                            </motion.div>

                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleExportDatabase}
                                className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl 
                font-semibold transition-all duration-200 flex items-center justify-center gap-2
                hover:shadow-lg hover:shadow-purple-500/30"
                            >
                                <FaFileExport className="text-xl" />
                                Export Database
                            </motion.button>
                        </div>

                        {/* Save and Back Buttons */}
                        <div className="flex gap-4">
                            <Link href="/" className="flex-1">
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-3 rounded-xl bg-gray-600 hover:bg-gray-700 text-white font-semibold
                  transition-colors duration-200 flex items-center justify-center gap-2"
                                >
                                    <MdArrowBack className="text-xl" />
                                    Back
                                </motion.button>
                            </Link>
                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex-[2] py-3 bg-gradient-to-r from-teal-400 to-purple-400 text-white rounded-xl 
                font-semibold transition-all duration-200 flex items-center justify-center gap-2
                hover:shadow-lg hover:shadow-teal-500/30"
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
              rounded-xl shadow-lg flex items-center gap-2"
                        >
                            <FaCheck className="text-xl" />
                            Settings saved successfully!
                        </motion.div>
                    )}
                </div>
            </div>
        </>
    );
}
