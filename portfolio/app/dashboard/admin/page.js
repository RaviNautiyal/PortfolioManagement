'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  FiUsers, 
  FiDollarSign, 
  FiActivity, 
  FiBarChart2,
  FiSettings,
  FiList,
  FiPlusCircle,
  FiRefreshCw
} from 'react-icons/fi';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    userCount: 0,
    stockCount: 0,
    transactionCount: 0,
    tradingVolume: 0
  });
  
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    // Check if user is authenticated and is an admin
    if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
      }
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, router]);
  
  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        // Try to fetch real admin stats
        try {
          const response = await fetch('/api/admin/stats');
          if (response.ok) {
            const data = await response.json();
            setStats(data);
          } else {
            throw new Error('Failed to fetch admin stats');
          }
        } catch (err) {
          console.error('Error fetching admin stats:', err);
          // Use mock data if API fails
          setStats({
            userCount: 184,
            stockCount: 75,
            transactionCount: 1248,
            tradingVolume: 7865432
          });
        }
      } catch (err) {
        setError('Failed to load admin dashboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchAdminStats();
    }
  }, [status, session]);
  
  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  if (status === 'authenticated' && session?.user?.role !== 'admin') {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 text-xl mb-4">
          You do not have permission to access the admin dashboard.
        </div>
        <Link href="/dashboard">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Go to Dashboard
          </button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-2">
            <FiUsers className="text-blue-500 mr-2" size={24} />
            <h2 className="text-lg font-semibold">Users</h2>
          </div>
          <p className="text-3xl font-bold">{stats.userCount}</p>
          <p className="text-sm text-gray-500 mt-1">Total registered users</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-2">
            <FiBarChart2 className="text-green-500 mr-2" size={24} />
            <h2 className="text-lg font-semibold">Stocks</h2>
          </div>
          <p className="text-3xl font-bold">{stats.stockCount}</p>
          <p className="text-sm text-gray-500 mt-1">Available stocks</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-2">
            <FiActivity className="text-purple-500 mr-2" size={24} />
            <h2 className="text-lg font-semibold">Transactions</h2>
          </div>
          <p className="text-3xl font-bold">{stats.transactionCount}</p>
          <p className="text-sm text-gray-500 mt-1">Total transactions</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-2">
            <FiDollarSign className="text-yellow-500 mr-2" size={24} />
            <h2 className="text-lg font-semibold">Volume</h2>
          </div>
          <p className="text-3xl font-bold">${(stats.tradingVolume / 1000000).toFixed(2)}M</p>
          <p className="text-sm text-gray-500 mt-1">Trading volume</p>
        </div>
      </div>
      
      {/* Admin Sections */}
      <h2 className="text-xl font-semibold mb-4">Admin Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/dashboard/admin/users" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <FiUsers className="text-blue-500 mr-3" size={24} />
            <h3 className="text-lg font-medium">User Management</h3>
          </div>
          <p className="text-gray-600 mb-4">Manage users, view profiles, and adjust account settings</p>
          <div className="text-blue-500 text-sm font-medium">Manage Users →</div>
        </Link>
        
        <Link href="/dashboard/admin/stocks" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <FiBarChart2 className="text-green-500 mr-3" size={24} />
            <h3 className="text-lg font-medium">Stock Management</h3>
          </div>
          <p className="text-gray-600 mb-4">Add, update, or remove stocks from the platform</p>
          <div className="text-green-500 text-sm font-medium">Manage Stocks →</div>
        </Link>
        
        <Link href="/dashboard/admin/transactions" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <FiActivity className="text-purple-500 mr-3" size={24} />
            <h3 className="text-lg font-medium">Transaction History</h3>
          </div>
          <p className="text-gray-600 mb-4">View and manage all transaction records across the platform</p>
          <div className="text-purple-500 text-sm font-medium">View Transactions →</div>
        </Link>
        
        <Link href="/dashboard/admin/import" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <FiPlusCircle className="text-red-500 mr-3" size={24} />
            <h3 className="text-lg font-medium">Import Data</h3>
          </div>
          <p className="text-gray-600 mb-4">Import Nifty 50 stocks and other market data</p>
          <div className="text-red-500 text-sm font-medium">Import Data →</div>
        </Link>
        
        <Link href="/dashboard/admin/settings" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <FiSettings className="text-gray-500 mr-3" size={24} />
            <h3 className="text-lg font-medium">System Settings</h3>
          </div>
          <p className="text-gray-600 mb-4">Configure platform settings and system parameters</p>
          <div className="text-gray-500 text-sm font-medium">Manage Settings →</div>
        </Link>
        
        <Link href="/dashboard/admin/reports" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <FiList className="text-orange-500 mr-3" size={24} />
            <h3 className="text-lg font-medium">Reports</h3>
          </div>
          <p className="text-gray-600 mb-4">Generate and view system reports and analytics</p>
          <div className="text-orange-500 text-sm font-medium">View Reports →</div>
        </Link>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <button onClick={() => window.location.reload()} className="inline-flex items-center text-blue-500 hover:text-blue-600">
          <FiRefreshCw className="mr-1" /> Refresh Dashboard Data
        </button>
      </div>
    </div>
  );
} 