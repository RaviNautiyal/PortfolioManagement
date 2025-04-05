import { useState, useEffect } from 'react';
import { FaSort, FaSortUp, FaSortDown, FaRedoAlt } from 'react-icons/fa';
import { format } from 'date-fns';

export default function TransactionsTable() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  
  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/transactions');
      
      if (!res.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const data = await res.json();
      setTransactions(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.message);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTransactions();
  }, []);
  
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
  };
  
  const sortedTransactions = [...transactions].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    // Handle date sorting
    if (sortBy === 'date') {
      aValue = new Date(a.date);
      bValue = new Date(b.date);
    }
    
    // Handle numeric sorting
    if (['price', 'quantity', 'total'].includes(sortBy)) {
      aValue = Number(aValue);
      bValue = Number(bValue);
    }
    
    if (aValue < bValue) return sortDir === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  const getSortIcon = (field) => {
    if (sortBy !== field) return <FaSort className="ml-1 text-gray-400" />;
    return sortDir === 'asc' ? <FaSortUp className="ml-1 text-blue-500" /> : <FaSortDown className="ml-1 text-blue-500" />;
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Date', 'Stock', 'Type', 'Quantity', 'Price', 'Total'].map((header) => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse border-b">
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <button 
            onClick={fetchTransactions}
            className="flex items-center text-blue-500 hover:text-blue-700"
          >
            <FaRedoAlt className="mr-1" /> Retry
          </button>
        </div>
        <div className="text-center py-8 text-red-500">
          <p className="mb-4">{error}</p>
          <button 
            onClick={fetchTransactions}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <button 
            onClick={fetchTransactions}
            className="flex items-center text-blue-500 hover:text-blue-700"
          >
            <FaRedoAlt className="mr-1" /> Refresh
          </button>
        </div>
        <div className="text-center py-8 text-gray-500">
          <p>No transactions found</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        <button 
          onClick={fetchTransactions}
          className="flex items-center text-blue-500 hover:text-blue-700"
        >
          <FaRedoAlt className="mr-1" /> Refresh
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th 
                onClick={() => handleSort('date')} 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                <span className="flex items-center">
                  Date {getSortIcon('date')}
                </span>
              </th>
              <th 
                onClick={() => handleSort('symbol')} 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                <span className="flex items-center">
                  Stock {getSortIcon('symbol')}
                </span>
              </th>
              <th 
                onClick={() => handleSort('type')} 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                <span className="flex items-center">
                  Type {getSortIcon('type')}
                </span>
              </th>
              <th 
                onClick={() => handleSort('quantity')} 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                <span className="flex items-center">
                  Quantity {getSortIcon('quantity')}
                </span>
              </th>
              <th 
                onClick={() => handleSort('price')} 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                <span className="flex items-center">
                  Price {getSortIcon('price')}
                </span>
              </th>
              <th 
                onClick={() => handleSort('total')} 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                <span className="flex items-center">
                  Total {getSortIcon('total')}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map((transaction) => (
              <tr key={transaction._id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {format(new Date(transaction.date), 'dd MMM yyyy, HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="font-medium">{transaction.symbol}</span>
                    <span className="ml-2 text-gray-500 text-sm">{transaction.stockName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    transaction.type === 'buy' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.type === 'buy' ? 'Buy' : 'Sell'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {transaction.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatCurrency(transaction.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatCurrency(transaction.price * transaction.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 