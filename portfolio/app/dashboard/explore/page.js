'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  SearchIcon, 
  FilterIcon, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ChevronUpIcon, 
  ChevronDownIcon 
} from '@heroicons/react/outline';
import { Disclosure } from '@headlessui/react';

export default function ExplorePage() {
  const router = useRouter();
  const [stocks, setStocks] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'marketCap',
    direction: 'desc'
  });

  // Fetch stocks data
  useEffect(() => {
    async function fetchStocks() {
      try {
        setLoading(true);
        setError(null);
        
        let url = '/api/stocks';
        const params = new URLSearchParams();
        
        if (selectedSector) {
          params.append('sector', selectedSector);
        }
        
        if (searchTerm) {
          params.append('search', searchTerm);
        }
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch stocks');
        }
        
        const data = await response.json();
        setStocks(data.stocks || []);
        setSectors(data.sectors || []);
      } catch (err) {
        console.error('Error fetching stocks:', err);
        setError('Failed to load stocks. Please try again later.');
        
        // Fallback to static data
        import('@/app/data/nifty50').then(module => {
          setStocks(module.nifty50Stocks);
          setSectors(module.sectors);
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchStocks();
  }, [selectedSector, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStocksBySearch();
  };

  const fetchStocksBySearch = () => {
    // This function is intentionally left empty as the useEffect will handle the search
    // when searchTerm changes
  };

  const handleSectorChange = (sector) => {
    setSelectedSector(sector);
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (name) => {
    if (sortConfig.key !== name) {
      return <ChevronUpIcon className="w-4 h-4 opacity-20" />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ChevronUpIcon className="w-4 h-4" /> 
      : <ChevronDownIcon className="w-4 h-4" />;
  };

  // Apply sorting to the stock list
  const sortedStocks = [...stocks].sort((a, b) => {
    const key = sortConfig.key;
    
    if (a[key] < b[key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[key] > b[key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="mb-6 text-3xl font-bold">Explore Stocks</h1>
      
      <div className="mb-8">
        <div className="flex flex-col gap-4 md:flex-row">
          {/* Search input */}
          <div className="relative flex-grow">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                placeholder="Search by symbol or company name"
                className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <SearchIcon className="w-5 h-5" />
              </button>
            </form>
          </div>
          
          {/* Sector filter */}
          <div className="relative w-full md:w-64">
            <Disclosure>
              {({ open }) => (
                <>
                  <Disclosure.Button className="flex items-center justify-between w-full px-4 py-2 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <span className="flex items-center">
                      <FilterIcon className="w-5 h-5 mr-2" />
                      <span>{selectedSector || 'All Sectors'}</span>
                    </span>
                    <ChevronUpIcon
                      className={`${
                        open ? 'transform rotate-180' : ''
                      } w-5 h-5 text-gray-500`}
                    />
                  </Disclosure.Button>
                  <Disclosure.Panel className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    <div className="max-h-60 overflow-y-auto">
                      <button
                        className="w-full px-4 py-2 text-left hover:bg-gray-100"
                        onClick={() => handleSectorChange('')}
                      >
                        All Sectors
                      </button>
                      {sectors.map((sector) => (
                        <button
                          key={sector}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100"
                          onClick={() => handleSectorChange(sector)}
                        >
                          {sector}
                        </button>
                      ))}
                    </div>
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="p-4 mb-6 text-white bg-red-500 rounded-md">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-blue-400 border-solid rounded-full border-t-transparent animate-spin"></div>
        </div>
      ) : sortedStocks.length === 0 ? (
        <div className="p-6 text-center bg-gray-100 rounded-md">
          <p className="text-xl text-gray-600">No stocks found matching your criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 divide-y divide-gray-300 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase cursor-pointer"
                  onClick={() => requestSort('symbol')}
                >
                  <div className="flex items-center">
                    Symbol {getSortIcon('symbol')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase cursor-pointer"
                  onClick={() => requestSort('name')}
                >
                  <div className="flex items-center">
                    Company {getSortIcon('name')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase cursor-pointer"
                  onClick={() => requestSort('sector')}
                >
                  <div className="flex items-center">
                    Sector {getSortIcon('sector')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase cursor-pointer"
                  onClick={() => requestSort('currentPrice')}
                >
                  <div className="flex items-center justify-end">
                    Price {getSortIcon('currentPrice')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase cursor-pointer"
                  onClick={() => requestSort('dayChange')}
                >
                  <div className="flex items-center justify-end">
                    Change {getSortIcon('dayChange')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase cursor-pointer"
                  onClick={() => requestSort('marketCap')}
                >
                  <div className="flex items-center justify-end">
                    Market Cap {getSortIcon('marketCap')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-300">
              {sortedStocks.map((stock) => (
                <tr 
                  key={stock.symbol} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/dashboard/stock/${stock.symbol}`)}
                >
                  <td className="px-6 py-4 text-sm font-medium text-blue-600 whitespace-nowrap">
                    <Link href={`/dashboard/stock/${stock.symbol}`}>
                      {stock.symbol}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{stock.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{stock.sector}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900 whitespace-nowrap">
                    ₹{stock.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className={`px-6 py-4 text-sm text-right whitespace-nowrap ${stock.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <div className="flex items-center justify-end">
                      {stock.dayChange >= 0 ? 
                        <ArrowUpIcon className="w-4 h-4 mr-1" /> : 
                        <ArrowDownIcon className="w-4 h-4 mr-1" />
                      }
                      {stock.dayChange >= 0 ? '+' : ''}{stock.dayChange}%
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900 whitespace-nowrap">
                    ₹{(stock.marketCap / 10000000).toFixed(2)} Cr
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="p-6 mt-8 bg-blue-50 rounded-lg">
        <h2 className="mb-4 text-xl font-semibold text-blue-700">Discover Nifty 50</h2>
        <p className="mb-4 text-blue-700">
          Explore the top 50 stocks that comprise the Nifty 50 index, representing various sectors of the Indian economy.
          Use the search and filter options to find stocks that match your investment criteria.
        </p>
        <div className="flex flex-wrap gap-2">
          {sectors.length > 0 && sectors.slice(0, 8).map((sector) => (
            <button
              key={sector}
              onClick={() => handleSectorChange(sector)}
              className="px-3 py-1.5 text-sm text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
            >
              {sector}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 