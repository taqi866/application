export interface Product {
  id: string;
  name: string;
  barcode: string;
  price: number;
  cost: number;
  quantity: number;
  category: string;
}

export interface CartItem extends Product {
  cartQuantity: number;
}

export interface Sale {
  id: string;
  timestamp: number;
  items: CartItem[];
  total: number;
  paymentMethod: 'cash' | 'card';
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'cashier';
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  POS = 'POS',
  INVENTORY = 'INVENTORY',
  EXPENSES = 'EXPENSES',
  REPORTS = 'REPORTS',
  USERS = 'USERS'
}