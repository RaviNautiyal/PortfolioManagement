'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowUp, FaArrowDown, FaFilter, FaRedoAlt, FaSort, FaSortUp, FaSortDown, FaSpinner } from 'react-icons/fa';
import { format } from 'date-fns';

export default function TransactionHistory({ transactions: initialTransactions = [] }) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    type: 'all',
    dateRange: 'all',
    symbol: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  
  const router = useRouter();

  useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);

  const handleFilterChange = (field, value) => {
    setFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetFilters = () => {
    setFilter({
      type: 'all',
      dateRange: 'all',
      symbol: '',
    });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    // Filter by type
    if (filter.type !== 'all' && transaction.type !== filter.type) {
      return false;
    }
    
    // Filter by symbol (case insensitive)
    if (filter.symbol && !transaction.symbol?.toLowerCase().includes(filter.symbol.toLowerCase())) {
      return false;
    }
    
    // Filter by date range
    if (filter.dateRange !== 'all') {
      const today = new Date();
      const transactionDate = new Date(transaction.date);
      const diffTime = Math.abs(today - transactionDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch (filter.dateRange) {
        case '7days':
          if (diffDays > 7) return false;
          break;
        case '30days':
          if (diffDays > 30) return false;
          break;
        case '90days':
          if (diffDays > 90) return false;
          break;
        case '1year':
          if (diffDays > 365) return false;
          break;
        default:
          break;
      }
    }
    
    return true;
  });

  const sortedTransactions = [...filteredTransactions]
    .sort((a, b) => {
      let valueA, valueB;
      
      switch (sortField) {
        case 'date':
          valueA = new Date(a.date);
          valueB = new Date(b.date);
          break;
        case 'price':
        case 'quantity':
        case 'total':
          valueA = parseFloat(a[sortField]);
          valueB = parseFloat(b[sortField]);
          break;
        default:
          valueA = a[sortField];
          valueB = b[sortField];
      }
      
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="ml-1 text-gray-400" />;
    return sortDirection === 'asc' ? <FaSortUp className="ml-1 text-blue-500" /> : <FaSortDown className="ml-1 text-blue-500" />;
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="flex justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-6 bg-gray-200 rounded w-20"></div>
        </div>
        {[...Array(5)].map((_, index) => (
          <div key={index} className="border-b border-gray-200 py-3">
            <div className="flex justify-between mb-2">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mt-2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p>No transaction history available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Transaction History</h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          <FaFilter className="mr-2" />
          Filters
        </button>
      </div>
      
      {showFilters && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
              <select
                value={filter.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Types</option>
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={filter.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Time</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="1year">Last 1 Year</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Symbol</label>
              <input
                type="text"
                value={filter.symbol}
                onChange={(e) => handleFilterChange('symbol', e.target.value)}
                placeholder="Enter symbol"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-3">
            <button
              onClick={resetFilters}
              className="flex items-center px-3 py-1.5 text-sm bg-gray-200 rounded-md hover:bg-gray-300 mr-2"
            >
              <FaRedoAlt className="mr-1" />
              Reset
            </button>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('date')}>
                <div className="flex items-center">
                  Date {getSortIcon('date')}
                </div>
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('symbol')}>
                <div className="flex items-center">
                  Stock {getSortIcon('symbol')}
                </div>
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('type')}>
                <div className="flex items-center">
                  Type {getSortIcon('type')}
                </div>
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('quantity')}>
                <div className="flex items-center">
                  Quantity {getSortIcon('quantity')}
                </div>
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('price')}>
                <div className="flex items-center">
                  Price {getSortIcon('price')}
                </div>
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('total')}>
                <div className="flex items-center">
                  Total {getSortIcon('total')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map((transaction) => (
              <tr key={transaction._id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 whitespace-nowrap">
                  {format(new Date(transaction.date), 'MMM dd, yyyy')}
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium">{transaction.symbol}</div>
                  <div className="text-sm text-gray-500">{transaction.stockName}</div>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    transaction.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.type === 'buy' ? (
                      <><FaArrowDown className="mr-1" /> Buy</>
                    ) : (
                      <><FaArrowUp className="mr-1" /> Sell</>
                    )}
                  </span>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  {transaction.quantity}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  {formatCurrency(transaction.price)}
                </td>
                <td className="py-3 px-4 whitespace-nowrap font-medium">
                  {formatCurrency(transaction.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {sortedTransactions.length < transactions.length && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => router.push('/dashboard/transactions')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All Transactions
          </button>
        </div>
      )}
    </div>
  );
} 