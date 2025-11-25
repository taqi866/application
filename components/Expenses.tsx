import React, { useState } from 'react';
import { Expense } from '../types';
import { StorageService } from '../services/storage';
import { Plus, Trash2 } from 'lucide-react';

interface ExpensesProps {
  expenses: Expense[];
  onUpdate: () => void;
}

const Expenses: React.FC<ExpensesProps> = ({ expenses, onUpdate }) => {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('تشغيلية');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;

    StorageService.saveExpense({
      id: Date.now().toString(),
      description: desc,
      amount: Number(amount),
      category,
      date: new Date().toISOString()
    });

    setDesc('');
    setAmount('');
    onUpdate();
  };

  const handleDelete = (id: string) => {
    StorageService.deleteExpense(id);
    onUpdate();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">إدارة المصاريف</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h3 className="font-bold text-lg mb-4">تسجيل مصروف جديد</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
              <input
                type="text"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="مثال: فاتورة كهرباء"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)}
                className="w-full p-2 border rounded-lg bg-white"
              >
                <option value="تشغيلية">تشغيلية</option>
                <option value="رواتب">رواتب</option>
                <option value="بضاعة">شراء بضاعة</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex justify-center items-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              إضافة مصروف
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-600">التاريخ</th>
                <th className="p-4 text-sm font-semibold text-gray-600">الوصف</th>
                <th className="p-4 text-sm font-semibold text-gray-600">التصنيف</th>
                <th className="p-4 text-sm font-semibold text-gray-600">المبلغ</th>
                <th className="p-4 text-sm font-semibold text-gray-600">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">لا توجد مصاريف مسجلة</td>
                </tr>
              ) : (
                expenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="p-4 text-gray-500 text-sm">
                      {new Date(expense.date).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="p-4 font-medium text-gray-800">{expense.description}</td>
                    <td className="p-4">
                      <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
                        {expense.category}
                      </span>
                    </td>
                    <td className="p-4 text-red-600 font-bold">-{expense.amount} د.م</td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleDelete(expense.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Expenses;