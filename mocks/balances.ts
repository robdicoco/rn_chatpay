export interface Balance {
  id: string;
  currency: string;
  symbol: string;
  name: string;
  amount: number;
  icon: string;
  change?: {
    percentage: number;
    timeframe: '24h' | '7d' | '30d';
  };
}

export const balances: Balance[] = [
  {
    id: 'usd',
    currency: 'USD',
    symbol: '$',
    name: 'US Dollar',
    amount: 1250.75,
    icon: 'https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: 'xion',
    currency: 'XION',
    symbol: 'XION',
    name: 'Xion Global Token',
    amount: 5000,
    icon: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=1000&auto=format&fit=crop',
    change: {
      percentage: 2.5,
      timeframe: '24h',
    },
  },
  {
    id: 'eth',
    currency: 'ETH',
    symbol: 'Ξ',
    name: 'Ethereum',
    amount: 0.75,
    icon: 'https://images.unsplash.com/photo-1622790698141-94e30457a316?q=80&w=1000&auto=format&fit=crop',
    change: {
      percentage: -1.2,
      timeframe: '24h',
    },
  },
  {
    id: 'btc',
    currency: 'BTC',
    symbol: '₿',
    name: 'Bitcoin',
    amount: 0.025,
    icon: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=1000&auto=format&fit=crop',
    change: {
      percentage: 3.7,
      timeframe: '24h',
    },
  },
];