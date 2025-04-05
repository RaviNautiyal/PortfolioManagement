'use client';

import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { FaSpinner, FaSync } from 'react-icons/fa';
import HoldingsTable from '@/app/components/Portfolio/HoldingsTable';
import PortfolioChart from '@/app/components/Portfolio/PortfolioChart';
import AssetAllocation from '@/app/components/Portfolio/AssetAllocation';
import TransactionHistory from '@/app/components/Portfolio/TransactionHistory';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [portfolioData, setPortfolioData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPortfolioData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get user data with balance
      try {
        const userResponse = await fetch('/api/user/profile');
        if (!userResponse.ok) throw new Error('Failed to load user data');
        const userData = await userResponse.json();
        setUserData(userData);
      } catch (userError) {
        console.error('Error loading user data:', userError);
        // Set default user data with $100,000 balance
        setUserData({ balance: 100000 });
      }
      
      // Get portfolio summary with history
      try {
        const portfolioResponse = await fetch('/api/portfolio/summary');
        if (!portfolioResponse.ok) throw new Error('Failed to load portfolio data');
        const portfolioData = await portfolioResponse.json();
        setPortfolioData(portfolioData);
      } catch (portfolioError) {
        console.error('Error loading portfolio data:', portfolioError);
        // Try to fetch from mock API
        try {
          const mockPortfolioResponse = await fetch('/api/mock/portfolio/summary');
          const mockPortfolioData = await mockPortfolioResponse.json();
          // Ensure the data format is consistent
          if (mockPortfolioData.history) {
            // Rename history to match the expected format
            mockPortfolioData.portfolioHistory = mockPortfolioData.history;
            delete mockPortfolioData.history;
          }
          setPortfolioData(mockPortfolioData);
        } catch (mockError) {
          console.error('Error loading mock portfolio data:', mockError);
          // Set empty portfolio data
          setPortfolioData({
            totalValue: 0,
            totalInvestment: 0,
            totalReturn: 0,
            totalReturnPercentage: 0,
            portfolioHistory: []
          });
        }
      }
      
      // Get holdings data
      try {
        const holdingsResponse = await fetch('/api/portfolio/holdings');
        if (!holdingsResponse.ok) throw new Error('Failed to load holdings data');
        const holdingsData = await holdingsResponse.json();
        setHoldings(holdingsData);
      } catch (holdingsError) {
        console.error('Error loading holdings data:', holdingsError);
        // Try to fetch from mock API
        try {
          const mockHoldingsResponse = await fetch('/api/mock/holdings');
          const mockHoldingsData = await mockHoldingsResponse.json();
          setHoldings(mockHoldingsData);
        } catch (mockError) {
          console.error('Error loading mock holdings data:', mockError);
          setHoldings([]);
        }
      }
      
      // Get watchlist data
      try {
        const watchlistResponse = await fetch('/api/watchlist');
        if (!watchlistResponse.ok) throw new Error('Failed to load watchlist');
        const watchlistData = await watchlistResponse.json();
        setWatchlist(watchlistData);
      } catch (watchlistError) {
        console.error('Error loading watchlist:', watchlistError);
        // Try to fetch from mock API
        try {
          const mockWatchlistResponse = await fetch('/api/mock/watchlist');
          const mockWatchlistData = await mockWatchlistResponse.json();
          setWatchlist(mockWatchlistData);
        } catch (mockError) {
          console.error('Error loading mock watchlist data:', mockError);
          // If watchlist fails, continue with empty watchlist
          setWatchlist([]);
        }
      }
      
      // Get recent transactions
      try {
        const transactionsResponse = await fetch('/api/transactions?limit=10');
        if (!transactionsResponse.ok) throw new Error('Failed to load transactions');
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData);
      } catch (transactionsError) {
        console.error('Error loading transactions:', transactionsError);
        // Try to fetch from mock API
        try {
          const mockTransactionsResponse = await fetch('/api/mock/transactions');
          const mockTransactionsData = await mockTransactionsResponse.json();
          setTransactions(mockTransactionsData);
        } catch (mockError) {
          console.error('Error loading mock transactions data:', mockError);
          setTransactions([]);
        }
      }
      
    } catch (err) {
      console.error('Error loading portfolio data:', err);
      setError(err.message || 'Failed to load portfolio data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPortfolioData();
  };

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const categories = [
    'Overview',
    'Holdings',
    'Transactions',
  ];

  if (loading && !refreshing) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6">
        <FaSpinner className="animate-spin text-3xl text-blue-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Loading Your Portfolio</h3>
        <p className="text-gray-500">Please wait while we retrieve your data</p>
      </div>
    );
  }

  if (error && !refreshing) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6">
        <div className="rounded-full bg-red-100 p-3 mb-4">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">Error Loading Portfolio</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <FaSync className="mr-2" /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Portfolio</h1>
        <button
          onClick={handleRefresh}
          className="flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          disabled={refreshing}
        >
          <FaSync className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Account Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Cash Balance</h3>
          <p className="text-2xl font-bold text-gray-800">
            ${userData?.balance ? userData.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Portfolio Value</h3>
          <p className="text-2xl font-bold text-gray-800">
            ${portfolioData?.totalValue ? portfolioData.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Total Return</h3>
          <div className="flex items-center">
            <p className={`text-2xl font-bold ${portfolioData?.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${portfolioData?.totalReturn ? Math.abs(portfolioData.totalReturn).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
            </p>
            {portfolioData?.totalReturnPercentage && (
              <span className={`ml-2 px-2 py-0.5 text-xs rounded ${portfolioData.totalReturn >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {portfolioData.totalReturn >= 0 ? '+' : '-'}{Math.abs(portfolioData.totalReturnPercentage).toFixed(2)}%
              </span>
            )}
          </div>
        </div>
      </div>

      <Tab.Group
        selectedIndex={activeTab}
        onChange={(index) => setActiveTab(index)}
      >
        <Tab.List className="flex space-x-2 rounded-xl bg-white p-1 shadow-md mb-6">
          {categories.map((category) => (
            <Tab
              key={category}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none',
                  selected
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                )
              }
            >
              {category}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2">
          <Tab.Panel className="rounded-xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PortfolioChart portfolioData={portfolioData} />
              </div>
              <div>
                <AssetAllocation holdings={holdings} />
              </div>
              <div className="lg:col-span-3">
                <HoldingsTable holdings={holdings} />
              </div>
            </div>
          </Tab.Panel>
          <Tab.Panel className="rounded-xl">
            <HoldingsTable holdings={holdings} />
          </Tab.Panel>
          <Tab.Panel className="rounded-xl">
            <TransactionHistory transactions={transactions} />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
} 