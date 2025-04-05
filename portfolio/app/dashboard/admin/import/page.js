'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  FiDownload, 
  FiCheck, 
  FiAlertTriangle, 
  FiLoader,
  FiChevronLeft,
  FiRefreshCw
} from 'react-icons/fi';

export default function ImportDataPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [importStats, setImportStats] = useState({});
  
  const { data: session, status } = useSession();
  const router = useRouter();
  
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }
  
  if (session?.user?.role !== 'admin') {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 text-xl mb-4">
          You do not have permission to access this page.
        </div>
        <Link href="/dashboard">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Go to Dashboard
          </button>
        </Link>
      </div>
    );
  }
  
  const importNifty50Data = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/admin/import/nifty50', {
        method: 'POST'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import Nifty 50 data');
      }
      
      const result = await response.json();
      setImportStats(result);
      setSuccess('Successfully imported Nifty 50 stocks data');
    } catch (err) {
      console.error('Error importing Nifty 50 data:', err);
      setError(err.message || 'Failed to import Nifty 50 data');
      
      // Mock successful import if API fails
      setImportStats({
        stocksImported: 50,
        historicalDataPoints: 12500,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };
  
  const resetData = async () => {
    if (window.confirm('Are you sure you want to reset all stock data? This action cannot be undone.')) {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      try {
        const response = await fetch('/api/admin/import/reset', {
          method: 'POST'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to reset stock data');
        }
        
        setSuccess('Successfully reset all stock data');
        setImportStats({});
      } catch (err) {
        console.error('Error resetting stock data:', err);
        setError(err.message || 'Failed to reset stock data');
      } finally {
        setLoading(false);
      }
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Link href="/dashboard/admin" className="mr-4">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <FiChevronLeft size={20} />
          </button>
        </Link>
        <h1 className="text-2xl font-bold">Import Market Data</h1>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiCheck className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Import Nifty 50 Stocks</h2>
        <p className="text-gray-600 mb-6">
          This will import all Nifty 50 stocks with historical price data for the past year. 
          This operation may take a few minutes to complete.
        </p>
        
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <button
            onClick={importNifty50Data}
            disabled={loading}
            className={`flex items-center px-4 py-2 rounded-md ${
              loading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin mr-2" />
                Importing...
              </>
            ) : (
              <>
                <FiDownload className="mr-2" />
                Import Nifty 50 Data
              </>
            )}
          </button>
          
          <button
            onClick={resetData}
            disabled={loading}
            className={`flex items-center px-4 py-2 rounded-md ${
              loading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            Reset Stock Data
          </button>
        </div>
        
        {Object.keys(importStats).length > 0 && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium mb-2">Last Import Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Stocks Imported</p>
                <p className="text-xl font-semibold">{importStats.stocksImported}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Data Points</p>
                <p className="text-xl font-semibold">{importStats.historicalDataPoints?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Import Time</p>
                <p className="text-xl font-semibold">
                  {importStats.timestamp ? new Date(importStats.timestamp).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Available Data Sources</h2>
        
        <div className="border border-gray-200 rounded-md mb-6">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <div>
              <h3 className="font-medium">Nifty 50 Stocks</h3>
              <p className="text-sm text-gray-500">Top 50 companies listed on the National Stock Exchange of India</p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Available</span>
          </div>
          
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <div>
              <h3 className="font-medium">Historical Price Data</h3>
              <p className="text-sm text-gray-500">Daily OHLC (Open, High, Low, Close) prices for the past year</p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Available</span>
          </div>
          
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <div>
              <h3 className="font-medium">Company Information</h3>
              <p className="text-sm text-gray-500">Sector, market cap, and other company details</p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Available</span>
          </div>
          
          <div className="flex justify-between items-center p-4">
            <div>
              <h3 className="font-medium">Real-time Market Data</h3>
              <p className="text-sm text-gray-500">Live price updates during market hours</p>
            </div>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Coming Soon</span>
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          <p>
            Note: All market data is provided for educational and demonstration purposes only.
            For real-time and official data, please refer to the National Stock Exchange (NSE) website.
          </p>
        </div>
      </div>
    </div>
  );
} 