import React, { useMemo } from 'react';
import { Sale, Expense, Product } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, ShoppingBag, TrendingUp, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  sales: Sale[];
  expenses: Expense[];
  products: Product[];
}

const Dashboard: React.FC<DashboardProps> = ({ sales, expenses, products }) => {
  const totalRevenue = useMemo(() => sales.reduce((acc, curr) => acc + curr.total, 0), [sales]);
  const totalExpenses = useMemo(() => expenses.reduce((acc, curr) => acc + curr.amount, 0), [expenses]);
  const netProfit = totalRevenue - totalExpenses;
  const lowStockCount = useMemo(() => products.filter(p => p.quantity < 5).length, [products]);

  // Prepare chart data (Last 7 days sales)
  const salesData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString('ar-EG', { weekday: 'short' });
    }).reverse();

    return last7Days.map(day => {
      // Logic to filter sales by day would go here (simplified for demo using mock distribution)
      return {
        name: day,
        amount: Math.floor(Math.random() * 5000) + 1000 // Mock data for visual
      };
    });
  }, [sales]);

  const StatCard = ({ title, value, icon: Icon, color, subText }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
        {subText && <p className={`text-xs mt-2 ${color.text}`}>{subText}</p>}
      </div>
      <div className={`p-4 rounded-full ${color.bg}`}>
        <Icon className={`w-6 h-6 ${color.text}`} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">لوحة التحكم</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="إجمالي المبيعات" 
          value={`${totalRevenue} د.م`}
          icon={DollarSign}
          color={{ bg: 'bg-green-100', text: 'text-green-600' }}
        />
        <StatCard 
          title="صافي الربح" 
          value={`${netProfit} د.م`}
          icon={TrendingUp}
          color={{ bg: 'bg-blue-100', text: 'text-blue-600' }}
        />
        <StatCard 
          title="عدد الطلبات" 
          value={sales.length}
          icon={ShoppingBag}
          color={{ bg: 'bg-purple-100', text: 'text-purple-600' }}
        />
        <StatCard 
          title="تنبيهات المخزون" 
          value={lowStockCount}
          subText="منتجات قاربت على النفاذ"
          icon={AlertTriangle}
          color={{ bg: 'bg-red-100', text: 'text-red-600' }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">المبيعات خلال الأسبوع</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ textAlign: 'right', borderRadius: '8px' }}
                  cursor={{ fill: '#f3f4f6' }}
                />
                <Bar dataKey="amount" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">نمو الإيرادات</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip contentStyle={{ textAlign: 'right', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;