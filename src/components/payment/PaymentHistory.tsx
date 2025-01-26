import React, { useState } from 'react';
import { format } from 'date-fns';
import { Download, Search, Filter, ChevronDown, FileDown, Printer } from 'lucide-react';
import { Card } from '../ui/card';

interface PaymentHistoryProps {
  onGenerateReceipt: (paymentId: string) => void;
  onBatchReceipts?: (paymentIds: string[]) => void;
  onExport?: (format: 'csv' | 'excel') => void;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ onGenerateReceipt }) => {
  const [dateRange, setDateRange] = useState<'all' | '7days' | '30days' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);

  const statusOptions = ['completed', 'pending', 'failed'];

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Payment History</h2>
        <div className="flex space-x-4">
          {/* Export Options */}
          <div className="relative group">
            <button className="px-4 py-2 border rounded-md hover:bg-gray-50 flex items-center">
              <FileDown className="w-4 h-4 mr-2" />
              Export
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block">
              <button
                onClick={() => onExport?.('csv')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-50"
              >
                Export as CSV
              </button>
              <button
                onClick={() => onExport?.('excel')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-50"
              >
                Export as Excel
              </button>
            </div>
          </div>

          {/* Batch Receipt Generation */}
          {selectedPayments.length > 0 && (
            <button
              onClick={() => onBatchReceipts?.(selectedPayments)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <Printer className="w-4 h-4 mr-2" />
              Generate {selectedPayments.length} Receipts
            </button>
          )}

          {/* Date Range Selector */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="appearance-none bg-white border rounded-md px-4 py-2 pr-8"
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
            <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-500" />
          </div>

          {/* Custom Date Range */}
          {dateRange === 'custom' && (
            <div className="flex space-x-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded-md px-2 py-1"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded-md px-2 py-1"
              />
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border rounded-md"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <select
              multiple
              value={statusFilter}
              onChange={(e) => setStatusFilter(Array.from(e.target.selectedOptions, option => option.value))}
              className="pl-9 pr-4 py-2 border rounded-md"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPayments(['payment-id']); // Replace with actual payment IDs
                    } else {
                      setSelectedPayments([]);
                    }
                  }}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Receipt
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Example row - replace with actual data */}
            <tr>
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedPayments.includes('payment-id')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPayments([...selectedPayments, 'payment-id']);
                    } else {
                      setSelectedPayments(selectedPayments.filter(id => id !== 'payment-id'));
                    }
                  }}
                  className="rounded border-gray-300"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {format(new Date(), 'MMM d, yyyy')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">John Doe</div>
                <div className="text-sm text-gray-500">john@example.com</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                TZS 50,000
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                M-Pesa
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Completed
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <button
                  onClick={() => onGenerateReceipt('payment-id')}
                  className="text-blue-600 hover:text-blue-700 flex items-center"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Receipt
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
};