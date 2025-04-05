'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX } from 'react-icons/fi';

export default function Navigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Only show navigation on non-dashboard pages
  const isDashboard = pathname.startsWith('/dashboard');
  
  useEffect(() => {
    // Add scroll listener for navbar appearance
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);
  
  // Don't show navigation on dashboard pages
  if (isDashboard) return null;
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || isMenuOpen ? 'bg-white shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">
            Portfolio Manager
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/features" 
              className={`${
                pathname === '/features' 
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Features
            </Link>
            <Link 
              href="/pricing" 
              className={`${
                pathname === '/pricing' 
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Pricing
            </Link>
            <Link 
              href="/about" 
              className={`${
                pathname === '/about' 
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className={`${
                pathname === '/contact' 
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Contact
            </Link>
            
            {status === 'authenticated' ? (
              <Link
                href="/dashboard"
                className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <div className="flex items-center space-x-4 ml-4">
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <FiX size={24} className="text-gray-700" />
            ) : (
              <FiMenu size={24} className="text-gray-700" />
            )}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 space-y-3">
            <Link 
              href="/features" 
              className={`block py-2 ${
                pathname === '/features' 
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Features
            </Link>
            <Link 
              href="/pricing" 
              className={`block py-2 ${
                pathname === '/pricing' 
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Pricing
            </Link>
            <Link 
              href="/about" 
              className={`block py-2 ${
                pathname === '/about' 
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className={`block py-2 ${
                pathname === '/contact' 
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Contact
            </Link>
            
            {status === 'authenticated' ? (
              <Link
                href="/dashboard"
                className="block py-2 text-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <div className="flex flex-col space-y-2 mt-4">
                <Link
                  href="/login"
                  className="py-2 text-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="py-2 text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
} 