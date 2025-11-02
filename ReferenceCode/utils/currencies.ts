export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
}

export const currencyOptions: CurrencyOption[] = [
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  // ... rest of your currency options
].sort((a, b) => a.name.localeCompare(b.name)); 