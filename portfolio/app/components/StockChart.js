'use client';

import { useState, useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

export default function StockChart({ stock }) {
  const chartContainerRef = useRef(null);
  const chartInstance = useRef(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');
  const [chartType, setChartType] = useState('Line');
  const [error, setError] = useState(null);

  // Function to fetch CSV data
  const fetchCSVData = async (csvPath) => {
    try {
      const response = await fetch(csvPath);
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV data: ${response.status}`);
      }
      const csvText = await response.text();
      return parseCSVData(csvText);
    } catch (error) {
      console.error('Error fetching CSV data:', error);
      throw error;
    }
  };

  // Function to parse CSV data
  const parseCSVData = (csvText) => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    
    // Find index of relevant columns (Date, Open, High, Low, Close)
    const dateIndex = headers.findIndex(h => h.toLowerCase().includes('date'));
    const openIndex = headers.findIndex(h => h.toLowerCase().includes('open'));
    const highIndex = headers.findIndex(h => h.toLowerCase().includes('high'));
    const lowIndex = headers.findIndex(h => h.toLowerCase().includes('low'));
    const closeIndex = headers.findIndex(h => h.toLowerCase().includes('close'));
    
    if (dateIndex === -1 || closeIndex === -1) {
      throw new Error('CSV file does not contain required columns');
    }

    return lines.slice(1).map(line => {
      const values = line.split(',');
      const entry = {
        time: new Date(values[dateIndex]).getTime() / 1000,
        close: parseFloat(values[closeIndex])
      };

      // Add OHLC data if available
      if (openIndex !== -1) entry.open = parseFloat(values[openIndex]);
      if (highIndex !== -1) entry.high = parseFloat(values[highIndex]);
      if (lowIndex !== -1) entry.low = parseFloat(values[lowIndex]);
      
      return entry;
    });
  };

  // Function to create a chart
  useEffect(() => {
    const initChart = async () => {
      if (!chartContainerRef.current || !stock) return;

      try {
        setError(null);
        
        // Extract information needed for the chart
        const { symbol, priceHistory, csvDataPath } = stock;
        
        // Clear any existing chart
        if (chartContainerRef.current) {
          chartContainerRef.current.innerHTML = '';
        }

        // Select data source based on what's available
        let chartData = [];
        let isOHLCData = false;

        // Try to load CSV data if path is provided (e.g., for Adani Ports)
        if (csvDataPath) {
          try {
            chartData = await fetchCSVData(csvDataPath);
            
            // Determine if we have OHLC data
            isOHLCData = chartData.length > 0 && 
                          'open' in chartData[0] && 
                          'high' in chartData[0] && 
                          'low' in chartData[0];
                          
            console.log(`Loaded ${chartData.length} data points from CSV, OHLC: ${isOHLCData}`);
          } catch (error) {
            console.error('Failed to load CSV data:', error);
            // Fall back to price history or dummy data
          }
        }

        // If no CSV data, try to use price history
        if (chartData.length === 0 && priceHistory && priceHistory.length > 0) {
          chartData = priceHistory.map(item => ({
            time: new Date(item.date).getTime() / 1000,
            value: item.price
          }));
        }

        // If still no data, generate dummy data
        if (chartData.length === 0) {
          chartData = generateDummyData(symbol);
        }

        // Filter data based on selected timeframe
        const filteredData = filterDataByTimeframe(chartData, selectedTimeframe);

        // Create chart
        const chart = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: 400,
          layout: {
            background: { color: '#ffffff' },
            textColor: '#333',
          },
          grid: {
            vertLines: { color: '#f0f0f0' },
            horzLines: { color: '#f0f0f0' },
          },
          crosshair: {
            mode: 0,
          },
          rightPriceScale: {
            borderColor: '#dfdfdf',
          },
          timeScale: {
            borderColor: '#dfdfdf',
          },
        });
        
        chartInstance.current = chart;

        // Add appropriate series based on data type and selected chart type
        let series;
        
        if (chartType === 'Candle' && isOHLCData) {
          series = chart.addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
          });
          
          series.setData(filteredData);
        } else {
          // Use line series for non-OHLC data or when line chart is selected
          series = chart.addLineSeries({
            color: '#2962FF',
            lineWidth: 2,
          });
          
          // Format data for line series if necessary
          const lineData = isOHLCData 
            ? filteredData.map(item => ({ time: item.time, value: item.close }))
            : filteredData;
            
          series.setData(lineData);
        }

        // Fit content to make sure all data is visible
        chart.timeScale().fitContent();
        
        // Render timeframe selector
        renderTimeframeSelector();

      } catch (err) {
        console.error('Error creating chart:', err);
        setError('Failed to render chart');
        
        // Fall back to simple SVG chart
        renderSimpleSVGChart();
      }
    };

    initChart();

    return () => {
      if (chartInstance.current) {
        chartInstance.current.remove();
        chartInstance.current = null;
      }
    };
  }, [stock, selectedTimeframe, chartType]);

  // Function to render timeframe selector
  const renderTimeframeSelector = () => {
    if (!chartContainerRef.current) return;
    
    // Create controls container if it doesn't exist
    let controlsContainer = document.getElementById('chart-controls');
    if (!controlsContainer) {
      controlsContainer = document.createElement('div');
      controlsContainer.id = 'chart-controls';
      controlsContainer.className = 'flex justify-between items-center mb-4';
      chartContainerRef.current.parentNode.insertBefore(controlsContainer, chartContainerRef.current);
    }
    
    // Clear existing controls
    controlsContainer.innerHTML = '';
    
    // Create timeframe buttons
    const timeframeButtons = document.createElement('div');
    timeframeButtons.className = 'flex space-x-2';
    
    const timeframes = ['1W', '1M', '3M', '6M', '1Y', 'All'];
    timeframes.forEach(timeframe => {
      const button = document.createElement('button');
      button.innerText = timeframe;
      button.className = `px-3 py-1 text-sm font-medium rounded-md ${
        selectedTimeframe === timeframe
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`;
      button.onclick = () => setSelectedTimeframe(timeframe);
      timeframeButtons.appendChild(button);
    });
    
    // Create chart type buttons
    const chartTypeButtons = document.createElement('div');
    chartTypeButtons.className = 'flex space-x-2';
    
    const chartTypes = ['Line', 'Candle'];
    chartTypes.forEach(type => {
      const button = document.createElement('button');
      button.innerText = type;
      button.className = `px-3 py-1 text-sm font-medium rounded-md ${
        chartType === type
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`;
      button.onclick = () => setChartType(type);
      chartTypeButtons.appendChild(button);
    });
    
    controlsContainer.appendChild(timeframeButtons);
    controlsContainer.appendChild(chartTypeButtons);
  };

  // Function to render a simple SVG chart as fallback
  const renderSimpleSVGChart = () => {
    if (!chartContainerRef.current || !stock) return;
    
    // Clear any existing content
    chartContainerRef.current.innerHTML = '';
    
    try {
      // Get dimensions
      const width = chartContainerRef.current.clientWidth;
      const height = 400;
      const padding = 40;
      
      // Get price data
      let priceData = [];
      
      if (stock.csvDataPath) {
        // For Adani Ports we would ideally load CSV data here,
        // but we'll use dummy data for the fallback case
        priceData = generateDummyData(stock.symbol);
      } else if (stock.priceHistory && stock.priceHistory.length > 0) {
        priceData = stock.priceHistory.map(item => ({
          time: new Date(item.date),
          value: item.price
        }));
      } else {
        priceData = generateDummyData(stock.symbol);
      }
      
      // Filter data by timeframe
      priceData = filterDataByTimeframe(priceData, selectedTimeframe);
      
      // Calculate min and max prices to scale the chart
      const values = priceData.map(item => item.value || item.close);
      const minPrice = Math.min(...values) * 0.95; // Add some margin
      const maxPrice = Math.max(...values) * 1.05;
      const priceRange = maxPrice - minPrice || 1; // Prevent division by zero
      
      // Create SVG element
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', width);
      svg.setAttribute('height', height);
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      svg.style.backgroundColor = '#ffffff';
      svg.style.borderRadius = '8px';
      svg.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)';
      
      // Create grid lines
      for (let i = 0; i <= 5; i++) {
        const y = padding + (i / 5) * (height - 2 * padding);
        
        // Grid line
        const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        gridLine.setAttribute('x1', padding);
        gridLine.setAttribute('y1', y);
        gridLine.setAttribute('x2', width - padding);
        gridLine.setAttribute('y2', y);
        gridLine.setAttribute('stroke', '#f0f0f0');
        gridLine.setAttribute('stroke-width', '1');
        svg.appendChild(gridLine);
        
        // Price label
        const price = maxPrice - (i / 5) * priceRange;
        const priceLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        priceLabel.setAttribute('x', width - padding + 5);
        priceLabel.setAttribute('y', y + 4);
        priceLabel.setAttribute('fill', '#666');
        priceLabel.setAttribute('font-size', '10');
        priceLabel.setAttribute('text-anchor', 'start');
        priceLabel.textContent = price.toFixed(2);
        svg.appendChild(priceLabel);
      }
      
      // Create polyline for the chart
      const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      
      // Calculate points for polyline
      const points = priceData.map((item, index) => {
        const x = padding + (index / (priceData.length - 1)) * (width - 2 * padding);
        const price = item.value || item.close;
        const y = padding + ((maxPrice - price) / priceRange) * (height - 2 * padding);
        return `${x},${y}`;
      }).join(' ');
      
      polyline.setAttribute('points', points);
      polyline.setAttribute('fill', 'none');
      polyline.setAttribute('stroke', '#2962FF');
      polyline.setAttribute('stroke-width', '2');
      polyline.setAttribute('stroke-linecap', 'round');
      polyline.setAttribute('stroke-linejoin', 'round');
      
      svg.appendChild(polyline);
      
      // Add date labels
      if (priceData.length > 0) {
        const numLabels = Math.min(5, priceData.length);
        for (let i = 0; i < numLabels; i++) {
          const index = Math.floor(i * (priceData.length - 1) / (numLabels - 1));
          const item = priceData[index];
          const x = padding + (index / (priceData.length - 1)) * (width - 2 * padding);
          
          const dateLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          dateLabel.setAttribute('x', x);
          dateLabel.setAttribute('y', height - padding + 15);
          dateLabel.setAttribute('fill', '#666');
          dateLabel.setAttribute('font-size', '10');
          dateLabel.setAttribute('text-anchor', 'middle');
          
          const date = item.time instanceof Date ? item.time : new Date(item.time * 1000);
          dateLabel.textContent = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          
          svg.appendChild(dateLabel);
          
          // Date tick
          const dateTick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          dateTick.setAttribute('x1', x);
          dateTick.setAttribute('y1', height - padding);
          dateTick.setAttribute('x2', x);
          dateTick.setAttribute('y2', height - padding + 5);
          dateTick.setAttribute('stroke', '#666');
          dateTick.setAttribute('stroke-width', '1');
          svg.appendChild(dateTick);
        }
      }
      
      // Add title
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      title.setAttribute('x', width / 2);
      title.setAttribute('y', 20);
      title.setAttribute('fill', '#333');
      title.setAttribute('font-size', '14');
      title.setAttribute('font-weight', 'bold');
      title.setAttribute('text-anchor', 'middle');
      title.textContent = `${stock.symbol} - ${selectedTimeframe} Price Chart`;
      svg.appendChild(title);
      
      chartContainerRef.current.appendChild(svg);
      
      // Add time controls below the chart
      const controlsContainer = document.createElement('div');
      controlsContainer.className = 'flex justify-between items-center mt-4';
      
      // Create timeframe buttons
      const timeframeButtons = document.createElement('div');
      timeframeButtons.className = 'flex space-x-2';
      
      const timeframes = ['1W', '1M', '3M', '6M', '1Y', 'All'];
      timeframes.forEach(timeframe => {
        const button = document.createElement('button');
        button.innerText = timeframe;
        button.className = `px-3 py-1 text-sm font-medium rounded-md ${
          selectedTimeframe === timeframe
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`;
        button.onclick = () => setSelectedTimeframe(timeframe);
        timeframeButtons.appendChild(button);
      });
      
      controlsContainer.appendChild(timeframeButtons);
      chartContainerRef.current.appendChild(controlsContainer);
      
    } catch (err) {
      console.error('Error rendering SVG chart:', err);
      
      // Add error message when even the SVG chart fails
      const errorMsg = document.createElement('div');
      errorMsg.className = 'flex flex-col items-center justify-center h-64 text-center';
      errorMsg.innerHTML = `
        <div class="text-red-500 text-xl mb-2">😕 Unable to load chart</div>
        <div class="text-gray-500 mb-4">We're having trouble displaying this chart</div>
        <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Refresh
        </button>
      `;
      errorMsg.querySelector('button').onclick = () => renderSimpleSVGChart();
      
      chartContainerRef.current.appendChild(errorMsg);
    }
  };

  // Function to filter data by timeframe
  const filterDataByTimeframe = (data, timeframe) => {
    if (!data || data.length === 0) return [];
    
    const now = new Date();
    let cutoffDate;
    
    switch (timeframe) {
      case '1W':
        cutoffDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case '1M':
        cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case '3M':
        cutoffDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case '6M':
        cutoffDate = new Date(now.setMonth(now.getMonth() - 6));
        break;
      case '1Y':
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        return data; // 'All' timeframe
    }
    
    return data.filter(item => {
      const itemDate = item.time instanceof Date 
        ? item.time 
        : new Date(item.time * 1000);
      return itemDate >= cutoffDate;
    });
  };

  // Function to generate dummy data
  const generateDummyData = (symbol) => {
    const numDays = 365; // Generate a year of data
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
      case 'ADANIPORTS':
        basePrice = 800;
        break;
      default:
        basePrice = 100 + (symbol?.charCodeAt(0) || 0) % 100; // Generate based on first letter
    }
    
    // Generate random data with some trend
    const trendDirection = Math.random() > 0.5 ? 1 : -1;
    const trendStrength = Math.random() * 0.1;
    const volatility = basePrice * 0.02; // 2% daily volatility
    
    const today = new Date();
    
    for (let i = numDays - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Create a somewhat cyclical trend with random daily fluctuations
      const cyclicalComponent = Math.sin(i / 30) * basePrice * 0.1;
      const randomComponent = (Math.random() - 0.5) * volatility;
      const trendComponent = i * trendStrength * trendDirection;
      
      const open = Math.max(0.1, basePrice + cyclicalComponent + trendComponent);
      
      // Generate OHLC data
      const highLowRange = open * 0.02; // 2% high-low range
      const high = open + (Math.random() * highLowRange);
      const low = open - (Math.random() * highLowRange);
      const close = (open + high + low) / 3 + randomComponent;
      
      // Ensure prices are positive
      const safeClose = Math.max(0.1, close);
      
      data.push({
        time: Math.floor(date.getTime() / 1000),
        open: open,
        high: Math.max(open, high, safeClose),
        low: Math.min(open, low, safeClose),
        close: safeClose,
        value: safeClose // For line charts
      });
    }
    
    return data;
  };

  return (
    <div className="relative">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button 
                className="mt-2 text-sm font-medium text-red-700 underline"
                onClick={() => {
                  setError(null);
                  renderSimpleSVGChart();
                }}
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div ref={chartContainerRef} className="w-full h-[400px] border border-gray-200 rounded-lg overflow-hidden"></div>
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        Data shown is for illustration purposes and may not reflect current market prices.
      </div>
    </div>
  );
} 