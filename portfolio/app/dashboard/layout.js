'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  FiHome, 
  FiTrendingUp, 
  FiPieChart, 
  FiDollarSign, 
  FiUser,
  FiLogOut
} from 'react-icons/fi';

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const NavItem = ({ href, icon, text }) => {
    const isActive = pathname === href || pathname.startsWith(href + '/');
    
    return (
      <Link 
        href={href}
        className={`flex items-center px-4 py-2 ${
          isActive 
            ? 'text-blue-600 font-medium' 
            : 'text-gray-700 hover:text-blue-600'
        } rounded-md transition-colors`}
      >
        <span className="mr-2">{icon}</span>
        <span>{text}</span>
      </Link>
    );
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top navbar */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-blue-700">TradeTrackr</Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              <NavItem href="/dashboard" icon={<FiHome size={18} />} text="Dashboard" />
              <NavItem href="/dashboard/portfolio" icon={<FiPieChart size={18} />} text="Portfolio" />
              <NavItem href="/dashboard/stocks" icon={<FiTrendingUp size={18} />} text="Stocks" />
              <NavItem href="/dashboard/transactions" icon={<FiDollarSign size={18} />} text="Transactions" />
            </nav>
            
            {/* User Menu */}
            <div className="flex items-center">
              {session?.user && (
                <div className="relative">
                  <button 
                    className="flex items-center text-gray-700 hover:text-blue-600 focus:outline-none"
                    onClick={toggleMobileMenu}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold mr-2">
                      {session.user.name ? session.user.name[0].toUpperCase() : 'U'}
                    </div>
                    <span className="hidden md:block">{session.user.name || 'User'}</span>
                  </button>
                  
                  {isMobileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        <p className="font-medium">{session.user.name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                      </div>
                      
                      {/* Mobile Navigation */}
                      <div className="md:hidden py-1">
                        <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Dashboard</Link>
                        <Link href="/dashboard/portfolio" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Portfolio</Link>
                        <Link href="/dashboard/stocks" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Stocks</Link>
                        <Link href="/dashboard/transactions" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Transactions</Link>
                      </div>
                      
                      <button
                        onClick={() => router.push('/api/auth/signout')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content area */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">
            {pathname === '/dashboard' && 'Dashboard'}
            {pathname === '/dashboard/portfolio' && 'Portfolio'}
            {pathname === '/dashboard/stocks' && 'Stocks'}
            {pathname === '/dashboard/transactions' && 'Transactions'}
            {pathname.startsWith('/dashboard/stocks/') && 'Stock Details'}
          </h1>
        </div>
        {children}
      </main>
    </div>
  );
} 