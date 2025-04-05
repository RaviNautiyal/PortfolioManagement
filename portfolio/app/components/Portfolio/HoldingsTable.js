'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

export default function HoldingsTable({ limit }) {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('value');
  const [sortDirection, setSortDirection] = useState('desc');
  
  const router = useRouter();

  useEffect(() => {
    const fetchHoldings = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/portfolio/holdings');
        
        if (!response.ok) {
          throw new Error('Failed to fetch holdings');
        }
        
        const data = await response.json();
        setHoldings(data);
      } catch (err) {
        console.error('Error fetching holdings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHoldings();
  }, []);

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const sortedHoldings = [...holdings].sort((a, b) => {
    let valueA, valueB;
    
    switch(sortBy) {
      case 'symbol':
        valueA = a.symbol;
        valueB = b.symbol;
        break;
      case 'name':
        valueA = a.name;
        valueB = b.name;
        break;
      case 'quantity':
        valueA = a.quantity;
        valueB = b.quantity;
        break;
      case 'price':
        valueA = a.currentPrice;
        valueB = b.currentPrice;
        break;
      case 'change':
        valueA = a.changePercent;
        valueB = b.changePercent;
        break;
      case 'gain':
        valueA = a.unrealizedGainPercent;
        valueB = b.unrealizedGainPercent;
        break;
      case 'value':
      default:
        valueA = a.currentValue;
        valueB = b.currentValue;
    }
    
    if (sortDirection === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });

  // Apply limit if specified
  const displayedHoldings = limit ? sortedHoldings.slice(0, limit) : sortedHoldings;

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-14 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // Render empty state
  if (holdings.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 mb-4">You don't have any holdings yet.</p>
        <button
          onClick={() => router.push('/dashboard/stocks')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Browse Stocks
        </button>
      </div>
    );
  }

  // Function to render sort indicator
  const getSortIndicator = (field) => {
    if (sortBy !== field) return null;
    return sortDirection === 'asc' ? <FaArrowUp className="ml-1" /> : <FaArrowDown className="ml-1" />;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSortChange('symbol')}
            >
              <div className="flex items-center">
                Symbol {getSortIndicator('symbol')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSortChange('name')}
            >
              <div className="flex items-center">
                Company {getSortIndicator('name')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSortChange('quantity')}
            >
              <div className="flex items-center">
                Shares {getSortIndicator('quantity')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSortChange('price')}
            >
              <div className="flex items-center">
                Avg. Price {getSortIndicator('price')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSortChange('change')}
            >
              <div className="flex items-center">
                Today {getSortIndicator('change')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSortChange('gain')}
            >
              <div className="flex items-center">
                Gain/Loss {getSortIndicator('gain')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSortChange('value')}
            >
              <div className="flex items-center">
                Value {getSortIndicator('value')}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {displayedHoldings.map((holding) => (
            <tr key={holding._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap font-medium">
                {holding.symbol}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{holding.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {holding.quantity}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatCurrency(holding.avgPrice)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className={`text-sm flex items-center ${
                  holding.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {holding.changePercent >= 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                  {Math.abs(holding.changePercent).toFixed(2)}%
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className={`text-sm ${
                  holding.unrealizedGainPercent >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {holding.unrealizedGainPercent >= 0 ? '+' : ''}
                  {formatCurrency(holding.unrealizedGain)} ({holding.unrealizedGainPercent.toFixed(2)}%)
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {formatCurrency(holding.currentValue)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <Link 
                    href={`/dashboard/stocks/${holding.stockId}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Details
                  </Link>
                  <button
                    onClick={() => router.push(`/dashboard/stocks/${holding.stockId}?action=sell`)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Sell
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {limit && holdings.length > limit && (
        <div className="text-center py-4">
          <Link
            href="/dashboard/portfolio?tab=holdings"
            className="text-blue-600 hover:text-blue-800"
          >
            View All ({holdings.length}) Holdings
          </Link>
        </div>
      )}
    </div>
  );
} 