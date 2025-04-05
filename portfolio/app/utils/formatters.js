/**
 * Utility functions for formatting data in the application
 */

/**
 * Format a number as currency (USD by default)
 * @param {number} value - The number to format
 * @param {string} currency - The currency code (default: 'USD')
 * @param {string} locale - The locale for formatting (default: 'en-US')
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, currency = 'USD', locale = 'en-US') {
  if (value === null || value === undefined) return '-';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a number with commas and specified decimal places
 * @param {number} value - The number to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted number string
 */
export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined) return '-';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a percentage value
 * @param {number} value - The value to format (e.g., 0.25 for 25%)
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value, decimals = 2) {
  if (value === null || value === undefined) return '-';
  
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a date to a readable string
 * @param {Date|string} date - The date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
}) {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'Invalid date';
  
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}

/**
 * Format a date with time
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date and time string
 */
export function formatDateTime(date) {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a large number with abbreviations (K, M, B)
 * @param {number} value - The number to format
 * @returns {string} Formatted abbreviated number
 */
export function formatLargeNumber(value) {
  if (value === null || value === undefined) return '-';
  
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(2)}B`;
  }
  
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  }
  
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}K`;
  }
  
  return formatNumber(value);
}

/**
 * Convert a number of seconds to a human-readable duration
 * @param {number} seconds - The number of seconds
 * @returns {string} Formatted duration string
 */
export function formatDuration(seconds) {
  if (seconds === null || seconds === undefined) return '-';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  
  return `${remainingSeconds}s`;
}

/**
 * Get a color based on the value (positive, negative, or neutral)
 * @param {number} value - The value to determine color for
 * @returns {string} CSS color class
 */
export function getValueColor(value) {
  if (value === null || value === undefined) return 'text-gray-400';
  
  if (value > 0) return 'text-green-500';
  if (value < 0) return 'text-red-500';
  return 'text-gray-500';
}

/**
 * Get a trend icon and color based on the value
 * @param {number} value - The value to determine trend for
 * @returns {object} Object with icon and color properties
 */
export function getTrendIndicator(value) {
  if (value === null || value === undefined) {
    return { icon: '—', color: 'text-gray-400' };
  }
  
  if (value > 0) {
    return { icon: '↑', color: 'text-green-500' };
  }
  
  if (value < 0) {
    return { icon: '↓', color: 'text-red-500' };
  }
  
  return { icon: '•', color: 'text-gray-500' };
} 