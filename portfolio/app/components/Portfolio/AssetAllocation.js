'use client';

import { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { FaSpinner } from 'react-icons/fa';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const SECTOR_COLORS = {
  'Technology': 'rgba(54, 162, 235, 0.8)',
  'Financial Services': 'rgba(255, 99, 132, 0.8)',
  'Healthcare': 'rgba(75, 192, 192, 0.8)',
  'Energy': 'rgba(255, 159, 64, 0.8)',
  'Consumer Goods': 'rgba(153, 102, 255, 0.8)',
  'Industrials': 'rgba(255, 206, 86, 0.8)',
  'Materials': 'rgba(231, 233, 237, 0.8)',
  'Utilities': 'rgba(36, 123, 160, 0.8)',
  'Real Estate': 'rgba(112, 193, 179, 0.8)',
  'Communication Services': 'rgba(214, 69, 65, 0.8)',
  'Other': 'rgba(170, 170, 170, 0.8)'
};

export default function AssetAllocation({ holdings }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const prepareChartData = () => {
      setLoading(true);
      
      try {
        // Check if holdings exist and are not empty
        if (!holdings || holdings.length === 0) {
          setChartData(null);
          setLoading(false);
          return;
        }
        
        // Calculate allocation by sector
        const sectorMap = new Map();
        
        // Calculate total portfolio value
        const totalValue = holdings.reduce((sum, holding) => {
          return sum + (holding.quantity * (holding.stock?.currentPrice || 0));
        }, 0);
        
        // Skip calculation if portfolio value is zero
        if (totalValue <= 0) {
          setChartData(null);
          setLoading(false);
          return;
        }
        
        // Calculate allocation by sector
        holdings.forEach(holding => {
          const sector = holding.stock?.sector || 'Other';
          const value = holding.quantity * (holding.stock?.currentPrice || 0);
          const percentage = (value / totalValue) * 100;
          
          if (sectorMap.has(sector)) {
            sectorMap.set(sector, sectorMap.get(sector) + percentage);
          } else {
            sectorMap.set(sector, percentage);
          }
        });
        
        // Convert to array format for chart
        const sectorData = Array.from(sectorMap.entries()).map(([sector, value]) => ({
          sector,
          value: parseFloat(value.toFixed(2))
        }));
        
        // Sort by value descending
        sectorData.sort((a, b) => b.value - a.value);
        
        // Prepare sector data for chart
        const sectors = sectorData.map(item => item.sector);
        const values = sectorData.map(item => item.value);
        const colors = sectors.map(sector => SECTOR_COLORS[sector] || 'rgba(170, 170, 170, 0.8)');
        
        setChartData({
          labels: sectors,
          datasets: [
            {
              data: values,
              backgroundColor: colors,
              borderColor: colors.map(color => color.replace('0.8', '1')),
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error('Error preparing chart data:', error);
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };
    
    prepareChartData();
  }, [holdings]);
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value}%`;
          }
        }
      }
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md h-64 flex flex-col justify-center items-center">
        <FaSpinner className="animate-spin text-3xl text-blue-500 mb-4" />
        <p className="text-gray-500">Loading allocation data...</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Asset Allocation</h3>
      <div className="h-64">
        {chartData ? (
          <Pie data={chartData} options={options} />
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">No allocation data available</p>
          </div>
        )}
      </div>
    </div>
  );
} 