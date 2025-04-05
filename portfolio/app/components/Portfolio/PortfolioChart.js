'use client';

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { format, subDays, subMonths, subYears } from 'date-fns';
import { FaSpinner } from 'react-icons/fa';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function PortfolioChart({ portfolioData }) {
  const [chartData, setChartData] = useState(null);
  const [timeRange, setTimeRange] = useState('1M'); // 1W, 1M, 3M, 1Y, ALL
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const prepareChartData = () => {
      setLoading(true);
      
      try {
        // Return early if no portfolio data
        if (!portfolioData || !portfolioData.history || portfolioData.history.length === 0) {
          console.log('No portfolio history data available');
          setChartData(null);
          setLoading(false);
          return;
        }
        
        // Get dates based on selected time range
        const cutoffDate = getCutoffDate(timeRange);
        
        // Filter history data based on selected date range
        let filteredHistory = portfolioData.history.filter(item => 
          new Date(item.date) >= cutoffDate
        );
        
        // Sort chronologically
        filteredHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Need at least two points to make a line
        if (filteredHistory.length < 2) {
          console.log('Not enough data points for selected time range');
          setChartData(null);
          setLoading(false);
          return;
        }
        
        // Format dates and prepare chart data
        const labels = filteredHistory.map(item => 
          format(new Date(item.date), timeRange === '1W' ? 'EEE' : 'MMM dd')
        );
        
        const values = filteredHistory.map(item => item.value);
        
        // Find min and max for better visualization
        const min = Math.min(...values);
        const max = Math.max(...values);
        const buffer = (max - min) * 0.1; // 10% buffer
        
        setChartData({
          labels,
          datasets: [
            {
              label: 'Portfolio Value',
              data: values,
              borderColor: 'rgba(37, 99, 235, 1)',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              tension: 0.2,
              fill: true,
              pointRadius: timeRange === '1W' ? 3 : 0, // Only show points for weekly view
              pointHoverRadius: 4,
              pointBackgroundColor: 'rgba(37, 99, 235, 1)',
              pointBorderColor: '#fff',
              pointBorderWidth: 1,
            },
          ],
          min: Math.max(0, min - buffer), // Never go below 0
          max: max + buffer,
        });
      } catch (error) {
        console.error('Error preparing chart data:', error);
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };
    
    prepareChartData();
  }, [portfolioData, timeRange]);
  
  const getCutoffDate = (range) => {
    const now = new Date();
    switch (range) {
      case '1W': return subDays(now, 7);
      case '1M': return subMonths(now, 1);
      case '3M': return subMonths(now, 3);
      case '1Y': return subYears(now, 1);
      case 'ALL': return new Date(0); // Beginning of time
      default: return subMonths(now, 1); // Default to 1M
    }
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 7,
        }
      },
      y: {
        min: chartData?.min,
        max: chartData?.max,
        ticks: {
          callback: (value) => {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              notation: 'compact',
              compactDisplay: 'short'
            }).format(value);
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    elements: {
      line: {
        borderWidth: 2
      }
    }
  };
  
  const timeRangeOptions = [
    { label: '1W', value: '1W' },
    { label: '1M', value: '1M' },
    { label: '3M', value: '3M' },
    { label: '1Y', value: '1Y' },
    { label: 'ALL', value: 'ALL' },
  ];
  
  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md h-80 flex flex-col justify-center items-center">
        <FaSpinner className="animate-spin text-3xl text-blue-500 mb-4" />
        <p className="text-gray-500">Loading chart data...</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Portfolio Performance</h3>
        <div className="flex rounded-md shadow-sm">
          {timeRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value)}
              className={`py-1 px-3 text-sm font-medium ${
                timeRange === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              } ${
                option.value === timeRangeOptions[0].value
                  ? 'rounded-l-md'
                  : option.value === timeRangeOptions[timeRangeOptions.length - 1].value
                  ? 'rounded-r-md'
                  : ''
              } border border-gray-300`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-64">
        {chartData ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">No performance data available</p>
          </div>
        )}
      </div>
    </div>
  );
} 