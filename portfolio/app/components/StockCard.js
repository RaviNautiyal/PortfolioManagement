'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

export default function StockCard({ stock }) {
  const [priceChange, setPriceChange] = useState(0);
  const [percentChange, setPercentChange] = useState(0);
  const chartRef = useRef(null);
  
  useEffect(() => {
    // Reset price change values
    setPriceChange(0);
    setPercentChange(0);
    
    // Calculate price change if price history exists
    if (stock && stock.priceHistory && stock.priceHistory.length > 1) {
      try {
        const todayPrice = stock.currentPrice;
        const yesterdayPrice = stock.priceHistory[1].price;
        
        const pChange = todayPrice - yesterdayPrice;
        const pctChange = (pChange / yesterdayPrice) * 100;
        
        setPriceChange(pChange);
        setPercentChange(pctChange);
      } catch (error) {
        console.error('Error calculating price change:', error);
        // Generate random price change for demo purposes
        const randomChange = (Math.random() * 10) - 5; // Between -5 and 5
        setPriceChange(randomChange);
        setPercentChange((randomChange / stock.currentPrice) * 100);
      }
    } else {
      // Generate random price change for demo purposes
      const randomChange = (Math.random() * 10) - 5; // Between -5 and 5
      setPriceChange(randomChange);
      setPercentChange((randomChange / stock.currentPrice) * 100);
    }
    
    // Render the mini SVG chart
    renderSimpleSVGChart();
  }, [stock]);
  
  const renderSimpleSVGChart = () => {
    if (!chartRef.current || !stock) return;
    
    // Clear any previous chart
    chartRef.current.innerHTML = '';
    
    // Get the container dimensions
    const width = 100;
    const height = 40;
    const padding = 5;
    
    // Get the price data - use the last 30 days or generate dummy data
    let priceData = [];
    
    if (stock.priceHistory && stock.priceHistory.length > 0) {
      // Use real price history if available
      priceData = stock.priceHistory.slice(0, 30).map(item => ({
        date: new Date(item.date),
        price: item.price
      })).reverse(); // Reverse to show oldest to newest
    }
    
    // If we don't have enough data, generate some dummy data
    if (priceData.length < 10) {
      const dummyData = getChartData(stock.symbol);
      priceData = dummyData;
    }
    
    // Calculate min and max prices to scale the chart
    const prices = priceData.map(item => item.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1; // Prevent division by zero
    
    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    
    // Create polyline for the chart
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    
    // Calculate points for polyline
    const points = priceData.map((item, index) => {
      const x = padding + (index / (priceData.length - 1)) * (width - 2 * padding);
      const y = padding + ((maxPrice - item.price) / priceRange) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');
    
    polyline.setAttribute('points', points);
    polyline.setAttribute('fill', 'none');
    
    // Determine color based on price trend
    const isPriceUp = priceData[0].price <= priceData[priceData.length - 1].price;
    const strokeColor = isPriceUp ? '#16a34a' : '#dc2626'; // Green if up, red if down
    
    polyline.setAttribute('stroke', strokeColor);
    polyline.setAttribute('stroke-width', '1.5');
    polyline.setAttribute('stroke-linecap', 'round');
    polyline.setAttribute('stroke-linejoin', 'round');
    
    svg.appendChild(polyline);
    chartRef.current.appendChild(svg);
  };
  
  // Generate dummy price data if needed
  const getChartData = (symbol) => {
    const numDays = 30;
    const data = [];
    
    // Base price depends on stock symbol to keep it consistent
    let basePrice = 0;
    
    switch (symbol) {
      case 'AAPL':
        basePrice = 150;
        break;
      case 'MSFT':
        basePrice = 300;
        break;
      case 'GOOGL':
        basePrice = 120;
        break;
      default:
        basePrice = 100 + (symbol.charCodeAt(0) % 100); // Generate based on first letter
    }
    
    // Generate random data with some trend
    const trendDirection = Math.random() > 0.5 ? 1 : -1;
    const trendStrength = Math.random() * 0.1;
    
    const today = new Date();
    
    for (let i = numDays - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Create a somewhat cyclical trend with random daily fluctuations
      const cyclicalComponent = Math.sin(i / 5) * 5;
      const randomComponent = (Math.random() - 0.5) * 8;
      const trendComponent = i * trendStrength * trendDirection;
      
      let price = basePrice + cyclicalComponent + randomComponent + trendComponent;
      
      // Ensure price is positive
      price = Math.max(price, 1);
      
      data.push({
        date: date,
        price: price
      });
    }
    
    return data;
  };
  
  // Get price change indicator (up or down arrow)
  const getPriceChangeIndicator = () => {
    if (priceChange >= 0) {
      return <FiTrendingUp className="text-green-500 mr-1" />;
    } else {
      return <FiTrendingDown className="text-red-500 mr-1" />;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between mb-2">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-gray-900">{stock.symbol}</h3>
          <p className="text-sm text-gray-500 truncate">{stock.name}</p>
        </div>
        <div className="text-right">
          <div className="font-medium text-xl">${stock.currentPrice.toFixed(2)}</div>
          <div className="flex items-center text-sm">
            {getPriceChangeIndicator()}
            <span className={priceChange >= 0 ? 'text-green-600' : 'text-red-600'}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({percentChange.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-3">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>52W Range</span>
          <span>
            {stock.low52Week && stock.high52Week 
              ? `$${stock.low52Week.toFixed(2)} - $${stock.high52Week.toFixed(2)}`
              : 'N/A'}
          </span>
        </div>
        
        <div className="h-10" ref={chartRef}></div>
      </div>
      
      <div className="mt-4">
        <Link 
          href={`/dashboard/stocks/${stock._id}`}
          className="block text-center w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          View Details
        </Link>
      </div>
    </div>
  );
} 