// Currency formatting utilities following DRY principle

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const parseCurrencyInput = (value) => {
  // Remove currency symbols and parse as float
  const cleaned = value.toString().replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
};

export const formatCurrencyInput = (value) => {
  // Format for input fields (without currency symbol)
  const num = parseCurrencyInput(value);
  return num.toFixed(2);
};

export const getCurrencySymbol = (currency = 'USD') => {
  const symbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'CAD': 'C$',
    'AUD': 'A$',
    'JPY': '¥'
  };
  return symbols[currency] || '$';
};

export const supportedCurrencies = [
  { code: 'USD', name: 'USD - US Dollar', symbol: '$' },
  { code: 'EUR', name: 'EUR - Euro', symbol: '€' },
  { code: 'GBP', name: 'GBP - British Pound', symbol: '£' },
  { code: 'CAD', name: 'CAD - Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'AUD - Australian Dollar', symbol: 'A$' },
  { code: 'JPY', name: 'JPY - Japanese Yen', symbol: '¥' }
];