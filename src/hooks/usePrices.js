import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchTodayAndTomorrow, getCheapestWindow } from '../services/electricityApi';
import { fetchGridTariffs, applyTariffs } from '../services/tariffApi';

const CACHE_KEY = 'price_cache';
const TARIFF_CACHE_KEY = 'tariff_cache';
const CACHE_TTL = 30 * 60 * 1000;   // 30 min for spot prices
const TARIFF_TTL = 24 * 60 * 60 * 1000; // 24 hours for tariffs (they rarely change)

export function usePrices(priceArea = 'DK1', operatorGln = null) {
  const [todayPrices, setTodayPrices] = useState([]);
  const [tomorrowPrices, setTomorrowPrices] = useState([]);
  const [cheapestHours, setCheapestHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showTruePrice, setShowTruePrice] = useState(!!operatorGln);

  const loadTariffs = async (gln) => {
    if (!gln) return null;
    const cacheKey = `${TARIFF_CACHE_KEY}_${gln}`;
    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < TARIFF_TTL) return data;
      }
      const tariffs = await fetchGridTariffs(gln);
      await AsyncStorage.setItem(cacheKey, JSON.stringify({ data: tariffs, timestamp: Date.now() }));
      return tariffs;
    } catch {
      return null;
    }
  };

  const load = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const cacheKey = `${CACHE_KEY}_${priceArea}`;
      let spotData = null;

      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            spotData = data;
            setLastUpdated(new Date(timestamp));
          }
        }
      }

      if (!spotData) {
        spotData = await fetchTodayAndTomorrow(priceArea);
        setLastUpdated(new Date());
        await AsyncStorage.setItem(cacheKey, JSON.stringify({ data: spotData, timestamp: Date.now() }));
      }

      // Apply grid tariffs if operator is selected
      const tariffs = await loadTariffs(operatorGln);
      const todayFinal = tariffs
        ? applyTariffs(spotData.todayPrices, tariffs)
        : spotData.todayPrices;
      const tomorrowFinal = tariffs
        ? applyTariffs(spotData.tomorrowPrices, tariffs)
        : spotData.tomorrowPrices;

      setTodayPrices(todayFinal);
      setTomorrowPrices(tomorrowFinal);
      setShowTruePrice(!!tariffs);

      // Cheapest window based on true price if available, else spot
      const priceKey = tariffs ? 'truePriceDKK' : 'priceDKK';
      const cheapest = getCheapestWindowByKey(todayFinal, 3, priceKey);
      setCheapestHours(cheapest);
    } catch (e) {
      setError('Could not load prices. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, [priceArea, operatorGln]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    todayPrices,
    tomorrowPrices,
    cheapestHours,
    loading,
    error,
    refresh: () => load(true),
    lastUpdated,
    showTruePrice,
  };
}

function getCheapestWindowByKey(prices, windowSize, key) {
  if (!prices || prices.length < windowSize) return [];
  let minSum = Infinity;
  let bestStart = 0;
  for (let i = 0; i <= prices.length - windowSize; i++) {
    const sum = prices.slice(i, i + windowSize).reduce((a, b) => a + (b[key] || 0), 0);
    if (sum < minSum) { minSum = sum; bestStart = i; }
  }
  return prices.slice(bestStart, bestStart + windowSize);
}
