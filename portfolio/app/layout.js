import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/app/providers/AuthProvider';
import Navigation from './components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Portfolio Management',
  description: 'Manage your stock portfolio with ease',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            {/* <Navigation /> */}
            <main className="container mx-auto px-4 py-8 max-w-7xl">
              {children}
            </main>
            {/* <footer className="bg-white py-6 border-t">
              <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                © {new Date().getFullYear()} Portfolio Management App. All rights reserved.
              </div>
            </footer> */}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
} 