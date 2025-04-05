'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FiSearch, FiFilter, FiDownload, FiRefreshCw } from 'react-icons/fi';
import TransactionHistory from '@/app/components/Portfolio/TransactionHistory';

export default function TransactionsPage() {
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userFilter, setUserFilter] = useState('all');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Check if user is admin
    if (session?.user?.role === 'admin') {
      setIsAdmin(true);
      fetchAllTransactions();
      fetchUsers();
    }
  }, [session]);

  const fetchAllTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/transactions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch all transactions');
      }
      
      const data = await response.json();
      setAllTransactions(data);
    } catch (err) {
      console.error('Error fetching all transactions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleUserFilterChange = (e) => {
    setUserFilter(e.target.value);
  };

  const filteredTransactions = allTransactions.filter(transaction => {
    if (userFilter === 'all') return true;
    return transaction.userId === userFilter;
  });

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ['Date', 'User', 'Stock', 'Type', 'Quantity', 'Price', 'Total'];
    const csvRows = [headers];

    filteredTransactions.forEach(transaction => {
      const row = [
        new Date(transaction.date).toLocaleDateString(),
        transaction.userName || transaction.userId,
        transaction.symbol,
        transaction.type,
        transaction.quantity,
        transaction.price,
        (transaction.price * transaction.quantity).toFixed(2)
      ];
      csvRows.push(row);
    });

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'transactions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* <h1 className="text-2xl font-semibold mb-6">Transactions</h1> */}
      
      {isAdmin ? (
        <div>
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-blue-700">
              You're viewing as an administrator. You can see all user transactions.
            </p>
          </div>
          
          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center">
              <select
                value={userFilter}
                onChange={handleUserFilterChange}
                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Users</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              
              <button
                onClick={fetchAllTransactions}
                className="ml-2 p-2 text-gray-600 hover:text-blue-600 focus:outline-none"
                title="Refresh transactions"
              >
                <FiRefreshCw />
              </button>
            </div>
            
            <button
              onClick={handleExportCSV}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <FiDownload className="mr-2" />
              Export CSV
            </button>
          </div>
          
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <div className="text-red-500 mb-4">{error}</div>
              <button 
                onClick={fetchAllTransactions}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.userName || 'Unknown User'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {transaction.userEmail || transaction.userId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{transaction.symbol}</div>
                        <div className="text-xs text-gray-500">{transaction.stockName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type === 'buy' ? 'Buy' : 'Sell'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{transaction.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        ₹{(transaction.price * transaction.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredTransactions.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No transactions found</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <TransactionHistory />
      )}
    </div>
  );
} 