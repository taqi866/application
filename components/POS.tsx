import React, { useState, useEffect } from 'react';
import { Product, CartItem, Sale } from '../types';
import { Search, Plus, Minus, Trash2, CreditCard, ShoppingCart, Printer, CheckCircle, X } from 'lucide-react';
import { StorageService } from '../services/storage';
import { InvoiceService } from '../services/invoiceService';

interface POSProps {
  products: Product[];
  onSaleComplete: () => void;
}

const POS: React.FC<POSProps> = ({ products, onSaleComplete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    setFilteredProducts(
      products.filter(p => 
        p.name.includes(searchTerm) || 
        p.barcode.includes(searchTerm)
      )
    );
  }, [searchTerm, products]);

  const addToCart = (product: Product) => {
    if (product.quantity <= 0) return;

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.cartQuantity >= product.quantity) return prev; // Stock limit
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.cartQuantity + delta;
        const product = products.find(p => p.id === id);
        if (product && newQty > product.quantity) return item;
        return newQty > 0 ? { ...item, cartQuantity: newQty } : item;
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const sale: Sale = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      items: cart,
      total: calculateTotal(),
      paymentMethod: 'cash'
    };

    StorageService.saveSale(sale);
    StorageService.updateStock(cart.map(i => ({ id: i.id, quantity: i.cartQuantity })));
    
    setLastSale(sale);
    setShowSuccessModal(true);
    setCart([]);
    onSaleComplete();
  };

  const handlePrint = () => {
    if (lastSale) {
      InvoiceService.printInvoice(lastSale);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-2rem)] gap-6 relative">
      
      {/* Success Modal */}
      {showSuccessModal && lastSale && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-xl">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">تمت العملية بنجاح!</h2>
            <p className="text-gray-500 mb-6">
              فاتورة رقم #{lastSale.id.slice(-6)} بقيمة <span className="font-bold text-gray-800">{lastSale.total} د.م</span>
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={handlePrint}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" />
                طباعة الفاتورة
              </button>
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-bold hover:bg-gray-200"
              >
                بيع جديد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="بحث عن منتج بالاسم أو الباركود..."
              className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pb-4">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              disabled={product.quantity <= 0}
              className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 transition-all hover:shadow-md ${product.quantity <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-300'}`}
            >
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xl">
                {product.name.charAt(0)}
              </div>
              <h3 className="font-semibold text-gray-800 text-center">{product.name}</h3>
              <p className="text-gray-500 text-sm">{product.price} د.م</p>
              <span className={`text-xs px-2 py-1 rounded-full ${product.quantity > 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                متبقي: {product.quantity}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-full lg:w-96 bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col h-full">
        <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            سلة المشتريات
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
              <p>السلة فارغة</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-800">{item.name}</h4>
                  <p className="text-sm text-gray-500">{item.price * item.cartQuantity} د.م</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white rounded-md shadow-sm">
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="font-bold w-4 text-center">{item.cartQuantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white rounded-md shadow-sm">
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 mr-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600">المجموع الكلي</span>
            <span className="text-2xl font-bold text-gray-900">{calculateTotal()} د.م</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            <CreditCard className="w-5 h-5" />
            إتمام عملية الدفع
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;