import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchTodayAndTomorrow, getCheapestWindow } from '../services/electricityApi';

const CACHE_KEY = 'price_cache';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export function usePrices(priceArea = 'DK1') {
  const [todayPrices, setTodayPrices] = useState([]);
  const [tomorrowPrices, setTomorrowPrices] = useState([]);
  const [cheapestHours, setCheapestHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const cacheKey = `${CACHE_KEY}_${priceArea}`;

      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            setTodayPrices(data.todayPrices);
            setTomorrowPrices(data.tomorrowPrices);
            setCheapestHours(getCheapestWindow(data.todayPrices, 3));
            setLastUpdated(new Date(timestamp));
            setLoading(false);
            return;
          }
        }
      }

      const data = await fetchTodayAndTomorrow(priceArea);
      setTodayPrices(data.todayPrices);
      setTomorrowPrices(data.tomorrowPrices);
      setCheapestHours(getCheapestWindow(data.todayPrices, 3));
      setLastUpdated(new Date());

      await AsyncStorage.setItem(
        cacheKey,
        JSON.stringify({ data, timestamp: Date.now() })
      );
    } catch (e) {
      setError('Could not load prices. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, [priceArea]);

  useEffect(() => {
    load();
  }, [load]);

  return { todayPrices, tomorrowPrices, cheapestHours, loading, error, refresh: () => load(true), lastUpdated };
}
