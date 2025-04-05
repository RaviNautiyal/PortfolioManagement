'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Disclosure } from '@headlessui/react';
import { ChevronRightIcon, PlusIcon, TrashIcon, PencilSquareIcon, ChevronUpIcon, SearchIcon, FilterIcon } from '@heroicons/react/outline';
import { sectors } from '@/app/data/nifty50';

export default function StocksAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentStock, setCurrentStock] = useState(null);
  const [stockForm, setStockForm] = useState({
    symbol: '',
    name: '',
    sector: '',
    currentPrice: '',
    previousClose: '',
    marketCap: '',
    yearHigh: '',
    yearLow: '',
    pe: '',
    eps: ''
  });

  // Check if user is authenticated and is an admin
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'admin') {
      router.push(session ? '/dashboard' : '/login');
    } else {
      fetchStocks();
    }
  }, [session, status, router]);

  const fetchStocks = async (sector = selectedSector, search = searchTerm) => {
    try {
      setLoading(true);
      setError(null);

      let url = '/api/admin/stocks';
      const params = new URLSearchParams();
      
      if (sector) {
        params.append('sector', sector);
      }
      
      if (search) {
        params.append('search', search);
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
    } catch (err) {
      console.error('Error fetching stocks:', err);
      setError('Failed to load stocks. Please try again later.');
      
      // Fallback to static data if API fails
      import('@/app/data/nifty50').then(({ nifty50Stocks }) => {
        setStocks(nifty50Stocks);
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStocks(selectedSector, searchTerm);
  };

  const handleSectorChange = (sector) => {
    setSelectedSector(sector);
    fetchStocks(sector, searchTerm);
  };

  const handleAddStock = () => {
    setStockForm({
      symbol: '',
      name: '',
      sector: '',
      currentPrice: '',
      previousClose: '',
      marketCap: '',
      yearHigh: '',
      yearLow: '',
      pe: '',
      eps: ''
    });
    setShowAddModal(true);
  };

  const handleEditStock = (stock) => {
    setCurrentStock(stock);
    setStockForm({
      symbol: stock.symbol,
      name: stock.name,
      sector: stock.sector,
      currentPrice: stock.currentPrice.toString(),
      previousClose: stock.previousClose.toString(),
      marketCap: stock.marketCap.toString(),
      yearHigh: stock.yearHigh.toString(),
      yearLow: stock.yearLow.toString(),
      pe: stock.pe.toString(),
      eps: stock.eps.toString()
    });
    setShowEditModal(true);
  };

  const handleSubmitStock = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const stockData = {
        ...stockForm,
        currentPrice: parseFloat(stockForm.currentPrice),
        previousClose: parseFloat(stockForm.previousClose),
        marketCap: parseFloat(stockForm.marketCap),
        yearHigh: parseFloat(stockForm.yearHigh),
        yearLow: parseFloat(stockForm.yearLow),
        pe: parseFloat(stockForm.pe),
        eps: parseFloat(stockForm.eps),
      };
      
      let response;
      
      if (showAddModal) {
        response = await fetch('/api/admin/stocks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(stockData)
        });
      } else {
        response = await fetch(`/api/admin/stocks?symbol=${currentStock.symbol}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(stockData)
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Operation failed');
      }
      
      fetchStocks();
      setShowAddModal(false);
      setShowEditModal(false);
    } catch (err) {
      console.error('Error saving stock:', err);
      setError(err.message || 'Failed to save stock. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStock = async (symbol) => {
    if (!confirm(`Are you sure you want to delete ${symbol}?`)) {
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch(`/api/admin/stocks?symbol=${symbol}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete operation failed');
      }
      
      fetchStocks();
    } catch (err) {
      console.error('Error deleting stock:', err);
      setError(err.message || 'Failed to delete stock. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-400 border-solid rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!session || session.user.role !== 'admin') {
    return null; // Router will redirect
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Stocks Management</h1>
        <button
          onClick={handleAddStock}
          className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add New Stock
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 text-white bg-red-500 rounded-md">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-grow">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                placeholder="Search by symbol or name"
                className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Search
              </button>
            </form>
          </div>

          <div className="relative w-full md:w-64">
            <Disclosure>
              {({ open }) => (
                <>
                  <Disclosure.Button className="flex items-center justify-between w-full px-4 py-2 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <span>{selectedSector || 'Filter by Sector'}</span>
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

      {loading && stocks.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-blue-400 border-solid rounded-full border-t-transparent animate-spin"></div>
        </div>
      ) : stocks.length === 0 ? (
        <div className="p-6 text-center bg-gray-100 rounded-md">
          <p className="text-xl text-gray-600">No stocks found. Try changing your search criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 divide-y divide-gray-300 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Symbol</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Sector</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Current Price</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Change</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-300">
              {stocks.map((stock) => (
                <tr key={stock.symbol} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{stock.symbol}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{stock.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{stock.sector}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-500 whitespace-nowrap">
                    ₹{stock.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className={`px-6 py-4 text-sm text-right whitespace-nowrap ${stock.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stock.dayChange >= 0 ? '+' : ''}{stock.dayChange}%
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    <div className="flex items-center justify-center space-x-3">
                      <button
                        onClick={() => handleEditStock(stock)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit Stock"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteStock(stock.symbol)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Stock"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg">
            <h2 className="mb-4 text-xl font-bold">Add New Stock</h2>
            <form onSubmit={handleSubmitStock}>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Symbol:</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={stockForm.symbol}
                    onChange={(e) => setStockForm({ ...stockForm, symbol: e.target.value.toUpperCase() })}
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Name:</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={stockForm.name}
                    onChange={(e) => setStockForm({ ...stockForm, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Sector:</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={stockForm.sector}
                    onChange={(e) => setStockForm({ ...stockForm, sector: e.target.value })}
                    required
                  >
                    <option value="">Select a sector</option>
                    {sectors.map((sector) => (
                      <option key={sector} value={sector}>
                        {sector}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Current Price (₹):</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={stockForm.currentPrice}
                    onChange={(e) => setStockForm({ ...stockForm, currentPrice: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Previous Close:</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={stockForm.previousClose}
                      onChange={(e) => setStockForm({ ...stockForm, previousClose: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Market Cap (₹):</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={stockForm.marketCap}
                      onChange={(e) => setStockForm({ ...stockForm, marketCap: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">52W High:</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={stockForm.yearHigh}
                      onChange={(e) => setStockForm({ ...stockForm, yearHigh: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">52W Low:</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={stockForm.yearLow}
                      onChange={(e) => setStockForm({ ...stockForm, yearLow: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">P/E Ratio:</label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={stockForm.pe}
                      onChange={(e) => setStockForm({ ...stockForm, pe: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">EPS:</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={stockForm.eps}
                      onChange={(e) => setStockForm({ ...stockForm, eps: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Stock Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg">
            <h2 className="mb-4 text-xl font-bold">Edit Stock: {currentStock.symbol}</h2>
            <form onSubmit={handleSubmitStock}>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Symbol:</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-gray-500 bg-gray-100 border border-gray-300 rounded-md"
                    value={stockForm.symbol}
                    readOnly
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Name:</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={stockForm.name}
                    onChange={(e) => setStockForm({ ...stockForm, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Sector:</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={stockForm.sector}
                    onChange={(e) => setStockForm({ ...stockForm, sector: e.target.value })}
                    required
                  >
                    <option value="">Select a sector</option>
                    {sectors.map((sector) => (
                      <option key={sector} value={sector}>
                        {sector}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Current Price (₹):</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={stockForm.currentPrice}
                    onChange={(e) => setStockForm({ ...stockForm, currentPrice: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Previous Close:</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={stockForm.previousClose}
                      onChange={(e) => setStockForm({ ...stockForm, previousClose: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Market Cap (₹):</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={stockForm.marketCap}
                      onChange={(e) => setStockForm({ ...stockForm, marketCap: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">52W High:</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={stockForm.yearHigh}
                      onChange={(e) => setStockForm({ ...stockForm, yearHigh: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">52W Low:</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={stockForm.yearLow}
                      onChange={(e) => setStockForm({ ...stockForm, yearLow: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">P/E Ratio:</label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={stockForm.pe}
                      onChange={(e) => setStockForm({ ...stockForm, pe: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">EPS:</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={stockForm.eps}
                      onChange={(e) => setStockForm({ ...stockForm, eps: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Update Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 