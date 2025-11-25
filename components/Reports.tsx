import React, { useState, useMemo } from 'react';
import { Sale, Expense, Product } from '../types';
import { generateBusinessInsights } from '../services/geminiService';
import { Sparkles, FileText, Loader2, Calendar, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

interface ReportsProps {
  sales: Sale[];
  expenses: Expense[];
  products: Product[];
}

const Reports: React.FC<ReportsProps> = ({ sales, expenses, products }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<'monthly' | 'annual' | 'ai'>('monthly');

  const currentYear = new Date().getFullYear();

  // --- Monthly Data Processing ---
  const monthlyData = useMemo(() => {
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    // Initialize array with 0s
    const data = months.map(name => ({ name, sales: 0, expenses: 0, profit: 0 }));

    // Aggregate Sales
    sales.forEach(sale => {
      const date = new Date(sale.timestamp);
      if (date.getFullYear() === currentYear) {
        data[date.getMonth()].sales += sale.total;
      }
    });

    // Aggregate Expenses
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      if (date.getFullYear() === currentYear) {
        data[date.getMonth()].expenses += expense.amount;
      }
    });

    // Calculate Profit
    data.forEach(item => {
      item.profit = item.sales - item.expenses;
    });

    return data;
  }, [sales, expenses, currentYear]);

  // --- Annual Summary ---
  const annualSummary = useMemo(() => {
    const totalSales = monthlyData.reduce((acc, curr) => acc + curr.sales, 0);
    const totalExpenses = monthlyData.reduce((acc, curr) => acc + curr.expenses, 0);
    return {
      sales: totalSales,
      expenses: totalExpenses,
      profit: totalSales - totalExpenses,
      transactionCount: sales.filter(s => new Date(s.timestamp).getFullYear() === currentYear).length
    };
  }, [monthlyData, sales, currentYear]);


  const handleGenerateReport = async () => {
    setLoading(true);
    const result = await generateBusinessInsights(sales, expenses, products);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">التقارير والإحصائيات</h2>
        
        {/* Report Type Selector */}
        <div className="bg-white p-1 rounded-lg border border-gray-200 flex">
          <button 
            onClick={() => setReportType('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${reportType === 'monthly' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            تقرير شهري
          </button>
          <button 
            onClick={() => setReportType('annual')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${reportType === 'annual' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            ملخص سنوي
          </button>
          <button 
            onClick={() => setReportType('ai')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${reportType === 'ai' ? 'bg-purple-100 text-purple-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            تحليل ذكي (AI)
          </button>
        </div>
      </div>

      {/* --- Monthly Report View --- */}
      {reportType === 'monthly' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                المبيعات الشهرية لعام {currentYear}
              </h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip 
                      contentStyle={{ textAlign: 'right', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: '#f3f4f6' }}
                    />
                    <Bar dataKey="sales" fill="#3b82f6" name="المبيعات" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                 صافي الربح الشهري
              </h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip contentStyle={{ textAlign: 'right', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" name="الربح" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-800">تفاصيل الأداء الشهري</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="p-4 text-sm font-semibold text-gray-600">الشهر</th>
                    <th className="p-4 text-sm font-semibold text-gray-600">المبيعات</th>
                    <th className="p-4 text-sm font-semibold text-gray-600">المصاريف</th>
                    <th className="p-4 text-sm font-semibold text-gray-600">صافي الربح</th>
                    <th className="p-4 text-sm font-semibold text-gray-600">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {monthlyData.filter(m => m.sales > 0 || m.expenses > 0).map((month, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium">{month.name}</td>
                      <td className="p-4 text-blue-600">{month.sales.toLocaleString()} د.م</td>
                      <td className="p-4 text-red-500">{month.expenses.toLocaleString()} د.م</td>
                      <td className={`p-4 font-bold ${month.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {month.profit.toLocaleString()} د.م
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${month.profit >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {month.profit >= 0 ? 'ربح' : 'خسارة'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {monthlyData.every(m => m.sales === 0 && m.expenses === 0) && (
                     <tr><td colSpan={5} className="p-8 text-center text-gray-400">لا توجد بيانات لهذا العام</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- Annual Report View --- */}
      {reportType === 'annual' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg shadow-blue-200">
              <p className="text-blue-100 mb-1 font-medium">إجمالي المبيعات السنوية</p>
              <h3 className="text-3xl font-bold">{annualSummary.sales.toLocaleString()} د.م</h3>
              <p className="text-sm text-blue-100 mt-4 bg-white/10 w-fit px-2 py-1 rounded">
                العام الحالي: {currentYear}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-500 mb-1 font-medium">إجمالي المصاريف</p>
              <h3 className="text-3xl font-bold text-red-500">{annualSummary.expenses.toLocaleString()} د.م</h3>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-500 mb-1 font-medium">صافي الأرباح السنوي</p>
              <h3 className={`text-3xl font-bold ${annualSummary.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {annualSummary.profit.toLocaleString()} د.م
              </h3>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
            <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800">تقرير نهاية العام</h3>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              إجمالي عدد المعاملات التجارية لهذا العام بلغ <span className="font-bold text-gray-800">{annualSummary.transactionCount}</span> عملية.
              نسبة الأرباح للمبيعات هي <span className="font-bold text-green-600">{annualSummary.sales > 0 ? Math.round((annualSummary.profit / annualSummary.sales) * 100) : 0}%</span>.
            </p>
          </div>
        </div>
      )}

      {/* --- AI Analysis View --- */}
      {reportType === 'ai' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="bg-gradient-to-r from-purple-50 to-white p-6 border-b border-gray-100 flex justify-between items-center">
               <h3 className="font-bold text-lg text-purple-800 flex items-center gap-2">
                 <Sparkles className="w-5 h-5" />
                 المستشار الذكي (Gemini AI)
               </h3>
               <button
                  onClick={handleGenerateReport}
                  disabled={loading}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 text-sm disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'تحديث التحليل'}
                </button>
             </div>
             <div className="p-8 min-h-[300px]">
               {analysis ? (
                 <div className="prose prose-purple max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {analysis}
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4 py-12">
                   <Sparkles className="w-16 h-16 opacity-20" />
                   <p className="text-lg">اضغط على زر التحديث للحصول على رؤى ذكية حول أداء متجرك</p>
                 </div>
               )}
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Reports;