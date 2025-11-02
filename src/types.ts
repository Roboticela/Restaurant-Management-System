export interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
}

export interface NewProduct {
  name: string;
  price: number;
  unit: string;
}

export interface Settings {
  restaurant_name?: string;
  address?: string;
  phone?: string;
  email?: string;
  tax_rate?: string;
  currency?: string;
  opening_time?: string;
  closing_time?: string;
  receipt_footer?: string;
  logo?: string;
}

export interface SaleItem {
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

export interface Sale {
  products: SaleItem[];
  total_amount: number;
  currency: string;
}

export interface TransactionItem {
  name: string;
  price: number;
  quantity: number;
  unit: string;
  subtotal: number;
}

export interface Transaction {
  id: number;
  items: TransactionItem[];
  total_amount: number;
  currency: string;
  date: string;
  time: string;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
}

export interface ProductDistribution {
  name: string;
  value: number;
}

export interface AnalyticsSummary {
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
}

export interface AnalyticsData {
  daily_revenue: DailyRevenue[];
  top_products: TopProduct[];
  product_distribution: ProductDistribution[];
  summary: AnalyticsSummary;
}

export interface CartItem extends Product {
  quantity: number;
}

