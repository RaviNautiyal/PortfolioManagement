import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaInfoCircle, FaSpinner } from 'react-icons/fa';

export default function TradeForm({ stock, action = 'buy', onClose }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(stock?.currentPrice || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userHolding, setUserHolding] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [success, setSuccess] = useState(false);
  
  // Calculate total transaction value
  const totalValue = quantity * price;
  
  useEffect(() => {
    // Set price from stock data when available
    if (stock && stock.currentPrice) {
      setPrice(stock.currentPrice);
    }
    
    // Fetch user balance and holdings for this stock if selling
    const fetchUserData = async () => {
      try {
        // Fetch user balance
        const balanceRes = await fetch('/api/user/balance');
        if (balanceRes.ok) {
          const balanceData = await balanceRes.json();
          setUserBalance(balanceData.balance || 0);
        }
        
        // Fetch user holdings for this stock if action is sell
        if (action === 'sell' && stock?._id) {
          const holdingsRes = await fetch('/api/portfolio/holdings');
          if (holdingsRes.ok) {
            const holdings = await holdingsRes.json();
            const holding = holdings.find(h => h.stockId === stock._id);
            setUserHolding(holding || { quantity: 0 });
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Could not fetch user data');
      }
    };
    
    fetchUserData();
  }, [stock, action]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validate input
      if (!quantity || quantity <= 0) {
        throw new Error('Please enter a valid quantity');
      }
      
      if (action === 'sell' && userHolding && quantity > userHolding.quantity) {
        throw new Error(`You only have ${userHolding.quantity} shares available to sell`);
      }
      
      if (action === 'buy' && totalValue > userBalance) {
        throw new Error('Insufficient funds for this transaction');
      }
      
      // Create transaction
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stockId: stock._id,
          type: action,
          quantity: Number(quantity),
          price: Number(price),
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Transaction failed');
      }
      
      setSuccess(true);
      
      // Reset form
      setQuantity(1);
      
      // Reload portfolio data after a successful transaction
      setTimeout(() => {
        router.refresh();
        if (onClose) {
          onClose();
        }
      }, 2000);
      
    } catch (err) {
      console.error('Transaction error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setQuantity(value);
    } else if (e.target.value === '') {
      setQuantity('');
    }
  };
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  if (!stock) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">No stock data available</p>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">
        {action === 'buy' ? 'Buy' : 'Sell'} {stock.symbol} - {stock.name}
      </h2>
      
      {/* Stock information */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-gray-500">Current Price:</span>
          <span className="font-medium">{formatCurrency(stock.currentPrice)}</span>
        </div>
        
        {action === 'buy' && (
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">Available Balance:</span>
            <span className="font-medium">{formatCurrency(userBalance)}</span>
          </div>
        )}
        
        {action === 'sell' && userHolding && (
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">Shares Owned:</span>
            <span className="font-medium">{userHolding.quantity || 0}</span>
          </div>
        )}
      </div>
      
      {success ? (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 text-center">
          <p className="font-medium">Transaction completed successfully!</p>
          <p className="text-sm mt-2">Redirecting to your portfolio...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Quantity Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="quantity">
              Quantity
            </label>
            <input
              id="quantity"
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={handleQuantityChange}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          {/* Total Value */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between font-medium">
              <span>Total Value:</span>
              <span>{formatCurrency(totalValue)}</span>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 flex items-start">
              <FaInfoCircle className="mr-2 mt-1" />
              <p>{error}</p>
            </div>
          )}
          
          {/* Warning messages */}
          {action === 'buy' && totalValue > userBalance && (
            <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg mb-4 flex items-start">
              <FaInfoCircle className="mr-2 mt-1" />
              <p>Warning: Transaction amount exceeds your available balance.</p>
            </div>
          )}
          
          {action === 'sell' && userHolding && quantity > userHolding.quantity && (
            <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg mb-4 flex items-start">
              <FaInfoCircle className="mr-2 mt-1" />
              <p>Warning: You're trying to sell more shares than you own.</p>
            </div>
          )}
          
          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
                action === 'buy'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-red-600 hover:bg-red-700'
              } ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="flex items-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Processing...
                </span>
              ) : (
                `${action === 'buy' ? 'Buy' : 'Sell'} Shares`
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 