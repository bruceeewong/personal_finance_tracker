/**
 * Utility functions for date handling and formatting
 */

/**
 * Format a month string (YYYY-MM) to display format
 * @param {string} monthString - Format: "YYYY-MM" (e.g., "2025-06")
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted month display (e.g., "June 2025")
 */
export const formatMonthDisplay = (monthString, options = { year: 'numeric', month: 'long' }) => {
  const [year, month] = monthString.split('-');
  return new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('en-US', options);
};

/**
 * Navigate months safely without date overflow issues
 * @param {string} currentMonth - Current month in YYYY-MM format
 * @param {number} direction - Number of months to add/subtract
 * @returns {string} New month in YYYY-MM format
 */
export const navigateMonth = (currentMonth, direction) => {
  const [year, month] = currentMonth.split('-').map(Number);
  const newDate = new Date(year, month - 1 + direction, 1);
  const newYear = newDate.getFullYear();
  const newMonth = newDate.getMonth() + 1;
  return `${newYear}-${newMonth.toString().padStart(2, '0')}`;
};

/**
 * Get current month in YYYY-MM format
 * @returns {string} Current month
 */
export const getCurrentMonth = () => {
  return new Date().toISOString().slice(0, 7);
};

/**
 * Check if a month is at or beyond the current month
 * @param {string} monthString - Month to check in YYYY-MM format
 * @returns {boolean} True if month is current or future
 */
export const isAtOrBeyondCurrentMonth = (monthString) => {
  return monthString >= getCurrentMonth();
};