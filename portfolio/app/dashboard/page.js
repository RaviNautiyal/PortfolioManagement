'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiArrowRight, 
  FiPieChart, 
  FiDollarSign,
  FiActivity
} from 'react-icons/fi';
import PortfolioChart from '@/app/components/Portfolio/PortfolioChart';
import HoldingsTable from '@/app/components/Portfolio/HoldingsTable';

export default function DashboardPage() {
  const [summary, setSummary] = useState({
    totalValue: 0,
    totalInvestment: 0,
    todayChange: 0,
    overallReturn: 0,
    cashBalance: 0,
    totalHoldings: 0,
  });
  const [topStocks, setTopStocks] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch portfolio summary
        const summaryResponse = await fetch('/api/portfolio/summary');
        if (!summaryResponse.ok) {
          throw new Error('Failed to fetch portfolio summary');
        }
        const summaryData = await summaryResponse.json();
        setSummary(summaryData);
        
        // Fetch top performing stocks
        const stocksResponse = await fetch('/api/holdings/top');
        if (stocksResponse.ok) {
          const stocksData = await stocksResponse.json();
          setTopStocks(stocksData.slice(0, 5));
        }
        
        // Fetch recent transactions
        const transactionsResponse = await fetch('/api/transactions?limit=5');
        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json();
          setRecentTransactions(transactionsData);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, percentChange, icon, color, isPrice = true }) => {
    const isPositive = percentChange >= 0;
    
    return (
      <div className="bg-white rounded-lg shadow p-5">
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-xl font-semibold mt-1">
              {isPrice ? `₹${parseFloat(value).toFixed(2)}` : value}
            </p>
            {percentChange !== undefined && (
              <div className={`flex items-center mt-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <FiTrendingUp className="mr-1" /> : <FiTrendingDown className="mr-1" />}
                <span>{isPositive ? '+' : ''}{percentChange.toFixed(2)}%</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${color} flex items-center justify-center`}>
            {icon}
          </div>
        </div>
      </div>
    );
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 rounded"></div>
            <div className="h-80 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Portfolio Value" 
          value={summary.totalValue} 
          percentChange={summary.overallReturn / summary.totalInvestment * 100}
          icon={<FiPieChart className="text-white" size={20} />}
          color="bg-blue-600"
        />
        <StatCard 
          title="Cash Balance" 
          value={summary.cashBalance} 
          icon={<FiDollarSign className="text-white" size={20} />}
          color="bg-green-600"
        />
        <StatCard 
          title="Today's Change" 
          value={Math.abs(summary.todayChange)} 
          percentChange={summary.todayChange / (summary.totalValue - summary.todayChange) * 100}
          icon={<FiActivity className="text-white" size={20} />}
          color={summary.todayChange >= 0 ? "bg-green-600" : "bg-red-600"}
        />
        <StatCard 
          title="Total Holdings" 
          value={summary.totalHoldings} 
          isPrice={false}
          icon={<FiTrendingUp className="text-white" size={20} />}
          color="bg-purple-600"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Portfolio Performance</h2>
            <Link href="/dashboard/portfolio" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
              View Details <FiArrowRight className="ml-1" />
            </Link>
          </div>
          <PortfolioChart />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Top Holdings</h2>
            <Link href="/dashboard/portfolio" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
              View All <FiArrowRight className="ml-1" />
            </Link>
          </div>
          
          {topStocks.length > 0 ? (
            <div className="space-y-4">
              {topStocks.map((stock) => (
                <div key={stock._id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                      {stock.symbol.substring(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium">{stock.symbol}</p>
                      <p className="text-sm text-gray-500">{stock.quantity} shares</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{(stock.quantity * stock.stock.currentPrice).toFixed(2)}</p>
                    <p className={`text-sm ${stock.performance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stock.performance >= 0 ? '+' : ''}{stock.performance.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">You don't have any holdings yet</p>
              <Link href="/dashboard/stocks" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Explore Stocks
              </Link>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Transactions</h2>
            <Link href="/dashboard/transactions" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
              View All <FiArrowRight className="ml-1" />
            </Link>
          </div>
          
          {recentTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{transaction.symbol}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type === 'buy' ? 'Buy' : 'Sell'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        ₹{(transaction.price * transaction.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">No transactions yet</p>
              <Link href="/dashboard/stocks" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Make Your First Trade
              </Link>
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/dashboard/stocks">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <FiTrendingUp className="text-blue-600 mb-2" size={24} />
                <h3 className="font-medium">Explore Stocks</h3>
                <p className="text-sm text-gray-500 mt-1">Discover new investment opportunities</p>
              </div>
            </Link>
            
            <Link href="/dashboard/transactions/new">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <FiDollarSign className="text-green-600 mb-2" size={24} />
                <h3 className="font-medium">New Transaction</h3>
                <p className="text-sm text-gray-500 mt-1">Buy or sell stocks in your portfolio</p>
              </div>
            </Link>
            
            <Link href="/dashboard/portfolio">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <FiPieChart className="text-purple-600 mb-2" size={24} />
                <h3 className="font-medium">View Portfolio</h3>
                <p className="text-sm text-gray-500 mt-1">Analyze your portfolio performance</p>
              </div>
            </Link>
            
            <Link href="/dashboard/settings">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <FiActivity className="text-orange-600 mb-2" size={24} />
                <h3 className="font-medium">Account Settings</h3>
                <p className="text-sm text-gray-500 mt-1">Manage your account preferences</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 