import Link from 'next/link';
import { FiBarChart2, FiPieChart, FiTrendingUp, FiLock, FiSmartphone } from 'react-icons/fi';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-800 to-blue-900 text-white">
        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            TradeTrackr
          </h1>
          <p className="text-xl mb-10 max-w-3xl mx-auto">
            Advanced portfolio management for serious traders
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/login">
              <button className="px-8 py-4 rounded-md bg-white text-blue-700 font-semibold hover:bg-gray-100 transition-colors">
                Log In
              </button>
            </Link>
            <Link href="/register">
              <button className="px-8 py-4 rounded-md bg-transparent border-2 border-white text-white font-semibold hover:bg-white hover:text-blue-700 transition-colors">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Portfolio Management</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-blue-600 mx-auto mb-4 bg-blue-100 w-16 h-16 flex items-center justify-center rounded-full">
                <FiBarChart2 size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Tracking</h3>
              <p className="text-gray-600">
                Monitor your investments in real-time with up-to-date market data and performance metrics.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-blue-600 mx-auto mb-4 bg-blue-100 w-16 h-16 flex items-center justify-center rounded-full">
                <FiPieChart size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Diversification Analysis</h3>
              <p className="text-gray-600">
                Visualize your asset allocation across sectors to ensure proper diversification of your portfolio.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-blue-600 mx-auto mb-4 bg-blue-100 w-16 h-16 flex items-center justify-center rounded-full">
                <FiTrendingUp size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Performance Insights</h3>
              <p className="text-gray-600">
                Gain valuable insights into your portfolio's performance with detailed analytics and metrics.
              </p>
            </div>
          </div>
        </div>
      </section>

     
      {/* Trust Section */}
      <section className="py-16 bg-gray-50">
     
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-700 to-blue-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Take Control of Your Investments?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of investors who are making smarter decisions with our portfolio management tools.
          </p>
          <Link href="/register">
            <button className="px-8 py-4 bg-white text-blue-700 rounded-md font-semibold hover:bg-gray-100 transition-colors">
              Get Started — It's Free
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6">          
          <div className="mt-4 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} TradeTrackr. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}