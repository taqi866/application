import { Product, Sale, Expense, User } from '../types';

const KEYS = {
  PRODUCTS: 'app_products',
  SALES: 'app_sales',
  EXPENSES: 'app_expenses',
  USERS: 'app_users',
};

// Seed Data
const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'قميص قطني أبيض', barcode: '1001', price: 120, cost: 80, quantity: 50, category: 'ملابس' },
  { id: '2', name: 'بنطال جينز', barcode: '1002', price: 200, cost: 130, quantity: 30, category: 'ملابس' },
  { id: '3', name: 'حذاء رياضي', barcode: '1003', price: 350, cost: 250, quantity: 15, category: 'أحذية' },
  { id: '4', name: 'عطر فاخر', barcode: '1004', price: 500, cost: 300, quantity: 10, category: 'عطور' },
  { id: '5', name: 'ساعة يد', barcode: '1005', price: 800, cost: 500, quantity: 5, category: 'اكسسوارات' },
];

export const StorageService = {
  // Products
  getProducts: (): Product[] => {
    const data = localStorage.getItem(KEYS.PRODUCTS);
    return data ? JSON.parse(data) : INITIAL_PRODUCTS;
  },
  saveProduct: (product: Product) => {
    const products = StorageService.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  },
  deleteProduct: (id: string) => {
    const products = StorageService.getProducts().filter(p => p.id !== id);
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  },
  updateStock: (items: { id: string, quantity: number }[]) => {
    const products = StorageService.getProducts();
    items.forEach(item => {
      const product = products.find(p => p.id === item.id);
      if (product) {
        product.quantity = Math.max(0, product.quantity - item.quantity);
      }
    });
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  },

  // Sales
  getSales: (): Sale[] => {
    const data = localStorage.getItem(KEYS.SALES);
    return data ? JSON.parse(data) : [];
  },
  saveSale: (sale: Sale) => {
    const sales = StorageService.getSales();
    sales.push(sale);
    localStorage.setItem(KEYS.SALES, JSON.stringify(sales));
  },

  // Expenses
  getExpenses: (): Expense[] => {
    const data = localStorage.getItem(KEYS.EXPENSES);
    return data ? JSON.parse(data) : [];
  },
  saveExpense: (expense: Expense) => {
    const expenses = StorageService.getExpenses();
    expenses.push(expense);
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
  },
  deleteExpense: (id: string) => {
    const expenses = StorageService.getExpenses().filter(e => e.id !== id);
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
  },

  // Reset
  clearAll: () => {
    localStorage.clear();
    window.location.reload();
  }
};