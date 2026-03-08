import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { COLORS } from '../constants/colors';
import { getPriceColor } from '../services/electricityApi';

const BAR_WIDTH = 28;
const BAR_GAP = 4;
const CHART_HEIGHT = 160;

export default function PriceChart({ prices, cheapestHours = [] }) {
  const cheapestSet = useMemo(
    () => new Set(cheapestHours.map((h) => h.hourLabel)),
    [cheapestHours]
  );

  const priceKey = prices[0]?.truePriceDKK != null ? 'truePriceDKK' : 'priceDKK';
  const min = useMemo(() => Math.min(...prices.map((p) => p[priceKey])), [prices, priceKey]);
  const max = useMemo(() => Math.max(...prices.map((p) => p[priceKey])), [prices, priceKey]);
  const currentHour = new Date().getHours();

  if (!prices || prices.length === 0) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      <View style={styles.container}>
        {prices.map((item) => {
          const displayVal = item[priceKey];
          const range = max - min || 1;
          const barHeight = Math.max(8, ((displayVal - min) / range) * CHART_HEIGHT);
          const color = getPriceColor(displayVal, min, max);
          const isCheap = cheapestSet.has(item.hourLabel);
          const isCurrent = item.hour === currentHour;

          return (
            <View key={item.hourLabel} style={styles.barWrapper}>
              {isCheap && <Text style={styles.star}>★</Text>}
              <View style={styles.barContainer}>
                <Text style={[styles.price, { color }]}>
                  {displayVal.toFixed(2)}
                </Text>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: color,
                      opacity: isCurrent ? 1 : 0.75,
                      borderWidth: isCurrent ? 2 : 0,
                      borderColor: COLORS.text,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.label, isCurrent && styles.labelCurrent]}>
                {item.hourLabel}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { marginHorizontal: -16 },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  barWrapper: {
    width: BAR_WIDTH + BAR_GAP,
    alignItems: 'center',
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: CHART_HEIGHT + 30,
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: 4,
  },
  price: {
    fontSize: 8,
    marginBottom: 2,
    fontWeight: '600',
  },
  label: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  labelCurrent: {
    color: COLORS.text,
    fontWeight: '700',
  },
  star: {
    fontSize: 10,
    color: COLORS.proGold,
    marginBottom: 2,
  },
});
