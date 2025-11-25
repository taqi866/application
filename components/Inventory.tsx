import React, { useState } from 'react';
import { Product } from '../types';
import { StorageService } from '../services/storage';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface InventoryProps {
  products: Product[];
  onUpdate: () => void;
}

const Inventory: React.FC<InventoryProps> = ({ products, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', barcode: '', price: 0, cost: 0, quantity: 0, category: ''
  });

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({ name: '', barcode: '', price: 0, cost: 0, quantity: 0, category: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.price) return;

    const product: Product = {
      id: editingProduct ? editingProduct.id : Date.now().toString(),
      name: formData.name!,
      barcode: formData.barcode || '',
      price: Number(formData.price),
      cost: Number(formData.cost),
      quantity: Number(formData.quantity),
      category: formData.category || 'عام',
    };

    StorageService.saveProduct(product);
    onUpdate();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      StorageService.deleteProduct(id);
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">إدارة المخزون</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          إضافة منتج
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-sm font-semibold text-gray-600">اسم المنتج</th>
              <th className="p-4 text-sm font-semibold text-gray-600">الباركود</th>
              <th className="p-4 text-sm font-semibold text-gray-600">الفئة</th>
              <th className="p-4 text-sm font-semibold text-gray-600">السعر</th>
              <th className="p-4 text-sm font-semibold text-gray-600">التكلفة</th>
              <th className="p-4 text-sm font-semibold text-gray-600">الكمية</th>
              <th className="p-4 text-sm font-semibold text-gray-600">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-800">{product.name}</td>
                <td className="p-4 text-gray-500 font-mono text-sm">{product.barcode}</td>
                <td className="p-4">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{product.category}</span>
                </td>
                <td className="p-4 text-green-600 font-bold">{product.price} د.م</td>
                <td className="p-4 text-gray-500">{product.cost} د.م</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-sm ${product.quantity < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {product.quantity}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => handleOpenModal(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded-lg"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الباركود</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded-lg"
                  value={formData.barcode}
                  onChange={e => setFormData({...formData, barcode: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded-lg"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">سعر البيع</label>
                <input 
                  type="number" 
                  className="w-full p-2 border rounded-lg"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">سعر التكلفة</label>
                <input 
                  type="number" 
                  className="w-full p-2 border rounded-lg"
                  value={formData.cost}
                  onChange={e => setFormData({...formData, cost: Number(e.target.value)})}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">الكمية</label>
                <input 
                  type="number" 
                  className="w-full p-2 border rounded-lg"
                  value={formData.quantity}
                  onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                إلغاء
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;