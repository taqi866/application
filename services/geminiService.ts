import { GoogleGenAI } from "@google/genai";
import { Sale, Expense, Product } from "../types";

const apiKey = process.env.API_KEY || '';

export const generateBusinessInsights = async (
  sales: Sale[],
  expenses: Expense[],
  products: Product[]
): Promise<string> => {
  if (!apiKey) return "الرجاء تكوين مفتاح API للحصول على التحليل.";

  const ai = new GoogleGenAI({ apiKey });

  // Summarize data to avoid token limits
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const lowStockProducts = products.filter(p => p.quantity < 5).map(p => p.name);
  
  // Calculate top selling categories
  const categoryCount: Record<string, number> = {};
  sales.forEach(s => {
    s.items.forEach(i => {
      categoryCount[i.category] = (categoryCount[i.category] || 0) + i.cartQuantity;
    });
  });

  const prompt = `
    أنت مستشار أعمال خبير. قم بتحليل بيانات المتجر التالية وقدم تقريراً موجزاً باللغة العربية.
    
    البيانات:
    - إجمالي المبيعات: ${totalRevenue}
    - إجمالي المصاريف: ${totalExpenses}
    - صافي الربح التقريبي: ${totalRevenue - totalExpenses}
    - المنتجات التي قاربت على النفاذ: ${lowStockProducts.join(', ')}
    - أداء الفئات (عدد القطع المباعة): ${JSON.stringify(categoryCount)}

    المطلوب:
    1. نظرة عامة على الأداء المالي.
    2. تحذيرات بشأن المخزون.
    3. 3 نصائح استراتيجية لزيادة الأرباح بناءً على هذه البيانات.
    
    اجعل الرد منسقاً وسهل القراءة.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "لم يتم استلام رد من النموذج.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "حدث خطأ أثناء تحليل البيانات. تأكد من مفتاح API.";
  }
};