import React, { useState, useEffect } from 'react';
import { ViewState, Product, Sale, Expense } from './types';
import { StorageService } from './services/storage';

// Components
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import Expenses from './components/Expenses';
import Reports from './components/Reports';

// Icons
import { LayoutDashboard, ShoppingCart, Package, DollarSign, FileBarChart, Users, Menu, X, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar
  
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Load Initial Data
  const refreshData = () => {
    setProducts(StorageService.getProducts());
    setSales(StorageService.getSales());
    setExpenses(StorageService.getExpenses());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Navigation Items
  const navItems = [
    { id: ViewState.DASHBOARD, label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: ViewState.POS, label: 'نقطة البيع', icon: ShoppingCart },
    { id: ViewState.INVENTORY, label: 'المخزون', icon: Package },
    { id: ViewState.EXPENSES, label: 'المصاريف', icon: DollarSign },
    { id: ViewState.REPORTS, label: 'التقارير', icon: FileBarChart },
    { id: ViewState.USERS, label: 'المستخدمين', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-right" dir="rtl">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 right-0 z-30
        w-64 bg-slate-900 text-white transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white tracking-wider">التاجر الذكي</h1>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setView(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${view === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
           <button 
             onClick={() => {
               if(confirm("هل تريد إعادة ضبط جميع البيانات؟")) StorageService.clearAll();
             }}
             className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm w-full px-4 py-2"
           >
             <LogOut className="w-4 h-4" />
             إعادة تعيين النظام
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header (Mobile Only) */}
        <header className="bg-white p-4 shadow-sm border-b lg:hidden flex justify-between items-center">
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-gray-800">{navItems.find(i => i.id === view)?.label}</span>
        </header>

        {/* View Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {view === ViewState.DASHBOARD && (
              <Dashboard sales={sales} expenses={expenses} products={products} />
            )}
            
            {view === ViewState.POS && (
              <POS products={products} onSaleComplete={refreshData} />
            )}

            {view === ViewState.INVENTORY && (
              <Inventory products={products} onUpdate={refreshData} />
            )}

            {view === ViewState.EXPENSES && (
              <Expenses expenses={expenses} onUpdate={refreshData} />
            )}

            {view === ViewState.REPORTS && (
              <Reports sales={sales} expenses={expenses} products={products} />
            )}

            {view === ViewState.USERS && (
              <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-100 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800">إدارة المستخدمين</h3>
                <p className="text-gray-500 mt-2">هذه الميزة متاحة في النسخة القادمة.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;