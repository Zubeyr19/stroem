import axios from 'axios';
import { format, addDays } from 'date-fns';

const BASE_URL = 'https://api.energidataservice.dk/dataset/Elspotprices';

/**
 * Fetches hourly spot prices for a given date range and price area.
 * @param {string} priceArea - 'DK1' or 'DK2'
 * @param {Date} startDate
 * @param {Date} endDate
 */
export async function fetchSpotPrices(priceArea = 'DK1', startDate, endDate) {
  const start = format(startDate, 'yyyy-MM-dd');
  const end = format(endDate || addDays(startDate, 1), 'yyyy-MM-dd');

  const response = await axios.get(BASE_URL, {
    params: {
      start,
      end,
      filter: JSON.stringify({ PriceArea: priceArea }),
      sort: 'HourDK asc',
      timezone: 'dk',
    },
  });

  return response.data.records.map((r) => ({
    hour: new Date(r.HourDK).getHours(),
    hourLabel: `${String(new Date(r.HourDK).getHours()).padStart(2, '0')}:00`,
    priceDKK: r.SpotPriceDKK / 1000, // convert øre/kWh → kr/kWh
    priceEUR: r.SpotPriceEUR / 1000,
    date: r.HourDK,
  }));
}

/**
 * Returns today's and tomorrow's prices combined.
 */
export async function fetchTodayAndTomorrow(priceArea = 'DK1') {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayAfterTomorrow = addDays(today, 2);

  const records = await fetchSpotPrices(priceArea, today, dayAfterTomorrow);

  const todayStr = format(today, 'yyyy-MM-dd');
  const tomorrowStr = format(addDays(today, 1), 'yyyy-MM-dd');

  const todayPrices = records.filter((r) => r.date.startsWith(todayStr));
  const tomorrowPrices = records.filter((r) => r.date.startsWith(tomorrowStr));

  return { todayPrices, tomorrowPrices };
}

/**
 * Given a list of hourly prices, returns the N cheapest consecutive hours.
 */
export function getCheapestWindow(prices, windowSize = 3) {
  if (!prices || prices.length < windowSize) return [];

  let minSum = Infinity;
  let bestStart = 0;

  for (let i = 0; i <= prices.length - windowSize; i++) {
    const sum = prices.slice(i, i + windowSize).reduce((a, b) => a + b.priceDKK, 0);
    if (sum < minSum) {
      minSum = sum;
      bestStart = i;
    }
  }

  return prices.slice(bestStart, bestStart + windowSize);
}

/**
 * Color-codes a price based on the day's min/max range.
 */
export function getPriceColor(price, min, max) {
  const range = max - min || 1;
  const normalized = (price - min) / range;
  if (normalized < 0.33) return '#4ade80'; // green
  if (normalized < 0.66) return '#facc15'; // yellow
  return '#f87171';                         // red
}
