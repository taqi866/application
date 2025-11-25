import { Sale } from '../types';

export const InvoiceService = {
  printInvoice: (sale: Sale) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('الرجاء السماح للنوافذ المنبثقة لطباعة الفاتورة');
      return;
    }

    const totalQuantity = sale.items.reduce((acc, item) => acc + item.cartQuantity, 0);

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة رقم #${sale.id.slice(-6)}</title>
        <style>
          body {
            font-family: 'Tajawal', sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #eee;
            padding-bottom: 20px;
          }
          .store-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            color: #555;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background-color: #f8f9fa;
            padding: 10px;
            text-align: right;
            border-bottom: 2px solid #ddd;
          }
          td {
            padding: 10px;
            border-bottom: 1px solid #eee;
          }
          .total-section {
            display: flex;
            justify-content: flex-end;
            margin-top: 20px;
          }
          .total-box {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            width: 250px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-weight: bold;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #777;
            border-top: 1px solid #eee;
            padding-top: 20px;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; }
            .no-print { display: none; }
          }
        </style>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
      </head>
      <body>
        <div class="header">
          <div class="store-name">التاجر الذكي</div>
          <div>فاتورة ضريبية مبسطة</div>
        </div>

        <div class="invoice-details">
          <div>رقم الفاتورة: #${sale.id.slice(-6)}</div>
          <div>التاريخ: ${new Date(sale.timestamp).toLocaleDateString('ar-EG')} ${new Date(sale.timestamp).toLocaleTimeString('ar-EG')}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>المنتج</th>
              <th>الكمية</th>
              <th>السعر</th>
              <th>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${sale.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.cartQuantity}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>${(item.price * item.cartQuantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-box">
            <div class="total-row">
              <span>عدد العناصر:</span>
              <span>${totalQuantity}</span>
            </div>
            <div class="total-row" style="font-size: 18px; color: #2563eb;">
              <span>الإجمالي النهائي:</span>
              <span>${sale.total.toFixed(2)} د.م</span>
            </div>
            <div class="total-row" style="font-size: 12px; color: #777; margin-top: 10px;">
              <span>طريقة الدفع:</span>
              <span>${sale.paymentMethod === 'cash' ? 'نقدي' : 'بطاقة'}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>شكراً لتعاملكم معنا!</p>
          <p>تم إصدار هذه الفاتورة إلكترونياً</p>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
};