import { saveAs } from 'file-saver';
import { format } from 'date-fns';

interface PaymentExportData {
  date: string;
  memberName: string;
  memberEmail: string;
  amount: number;
  method: string;
  status: string;
  orderId: string;
}

export const exportService = {
  exportToCSV: async (payments: PaymentExportData[]): Promise<void> => {
    try {
      // Create CSV headers
      const headers = ['Date', 'Member Name', 'Email', 'Amount', 'Method', 'Status', 'Order ID'];
      
      // Convert payments to CSV rows
      const rows = payments.map(payment => [
        payment.date,
        payment.memberName,
        payment.memberEmail,
        payment.amount,
        payment.method,
        payment.status,
        payment.orderId
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, `payment_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      throw error;
    }
  },

  exportToExcel: async (payments: PaymentExportData[]): Promise<void> => {
    try {
      // Create workbook data
      const workbookData = [
        ['Payment Export', format(new Date(), 'MMMM d, yyyy')],
        [],
        ['Date', 'Member Name', 'Email', 'Amount', 'Method', 'Status', 'Order ID'],
        ...payments.map(payment => [
          payment.date,
          payment.memberName,
          payment.memberEmail,
          payment.amount,
          payment.method,
          payment.status,
          payment.orderId
        ])
      ];

      // Convert to Excel format using SheetJS (xlsx)
      const XLSX = await import('xlsx');
      const ws = XLSX.utils.aoa_to_sheet(workbookData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Payments');

      // Generate Excel file
      XLSX.writeFile(wb, `payment_export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    } catch (error) {
      console.error('Failed to export Excel:', error);
      throw error;
    }
  }
};