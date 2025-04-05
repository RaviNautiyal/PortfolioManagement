'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiSearch, FiTrendingUp, FiTrendingDown, FiInfo } from 'react-icons/fi';

export default function StocksPage() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterSector, setFilterSector] = useState('all');
  const [sectors, setSectors] = useState([]);
  
  const router = useRouter();

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/stocks');
        
        if (!response.ok) {
          throw new Error('Failed to fetch stocks');
        }
        
        const data = await response.json();
        // Ensure we're setting an array from the API response
        setStocks(data.stocks || []);
        
        // Extract unique sectors for filter
        const uniqueSectors = [...new Set((data.stocks || []).map(stock => stock.sector).filter(Boolean))];
        setSectors(uniqueSectors);
      } catch (err) {
        console.error('Error fetching stocks:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const handleSectorFilterChange = (e) => {
    setFilterSector(e.target.value);
  };

  const filteredStocks = stocks
    .filter(stock => {
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          stock.symbol.toLowerCase().includes(searchLower) || 
          stock.name.toLowerCase().includes(searchLower);
          
        if (!matchesSearch) return false;
      }
      
      // Apply sector filter
      if (filterSector !== 'all' && stock.sector !== filterSector) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      let valueA, valueB;
      
      // Determine sort values based on field
      switch(sortBy) {
        case 'price':
          valueA = a.currentPrice;
          valueB = b.currentPrice;
          break;
        case 'change':
          valueA = ((a.currentPrice - a.previousClose) / a.previousClose) * 100;
          valueB = ((b.currentPrice - b.previousClose) / b.previousClose) * 100;
          break;
        case 'symbol':
          valueA = a.symbol;
          valueB = b.symbol;
          break;
        case 'marketCap':
          valueA = a.marketCap || 0;
          valueB = b.marketCap || 0;
          break;
        case 'name':
        default:
          valueA = a.name;
          valueB = b.name;
      }
      
      // Sort direction
      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

  // Function to render sort direction indicator
  const getSortIndicator = (field) => {
    if (sortBy !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

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

  return (
    <div>
      {/* Search and filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search stocks by name or symbol"
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <select
            value={filterSector}
            onChange={handleSectorFilterChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Sectors</option>
            {sectors.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
        </div>
        
        <div className="text-right">
          <span className="text-sm text-gray-500">
            {filteredStocks.length} {filteredStocks.length === 1 ? 'stock' : 'stocks'} found
          </span>
        </div>
      </div>
      
      {/* Stocks list */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSortChange('symbol')}
              >
                Symbol {getSortIndicator('symbol')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSortChange('name')}
              >
                Name {getSortIndicator('name')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSortChange('price')}
              >
                Price {getSortIndicator('price')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSortChange('change')}
              >
                Change {getSortIndicator('change')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSortChange('marketCap')}
              >
                Market Cap {getSortIndicator('marketCap')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sector
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStocks.map((stock) => {
              const priceChange = stock.previousClose 
                ? ((stock.currentPrice - stock.previousClose) / stock.previousClose) * 100
                : 0;
              const isPositive = priceChange >= 0;
              
              return (
                <tr key={stock._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{stock.symbol}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{stock.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">₹{stock.currentPrice.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? <FiTrendingUp className="mr-1" /> : <FiTrendingDown className="mr-1" />}
                      {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {stock.marketCap 
                        ? `₹${(stock.marketCap / 1000000000).toFixed(2)}B`
                        : 'N/A'
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{stock.sector || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/dashboard/stocks/${stock._id}`}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Details
                    </Link>
                    <button 
                      onClick={() => router.push(`/dashboard/stocks/${stock._id}`)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Trade
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {filteredStocks.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-2">No stocks found matching your search</p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Clear Search
            </button>
          )}
        </div>
      )}
    </div>
  );
} 