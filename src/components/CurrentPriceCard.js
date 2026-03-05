import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import { getPriceColor } from '../services/electricityApi';

export default function CurrentPriceCard({ prices }) {
  const currentHour = new Date().getHours();
  const current = prices.find((p) => p.hour === currentHour);
  const next = prices.find((p) => p.hour === currentHour + 1);

  if (!current) return null;

  const min = Math.min(...prices.map((p) => p.priceDKK));
  const max = Math.max(...prices.map((p) => p.priceDKK));
  const color = getPriceColor(current.priceDKK, min, max);

  const levelText =
    color === COLORS.primary ? 'Cheap' : color === COLORS.warning ? 'Medium' : 'Expensive';

  return (
    <LinearGradient
      colors={[COLORS.card, COLORS.cardBorder]}
      style={styles.card}
    >
      <View style={styles.row}>
        <View>
          <Text style={styles.label}>Right now</Text>
          <Text style={[styles.price, { color }]}>
            {current.priceDKK.toFixed(2)}{' '}
            <Text style={styles.unit}>kr/kWh</Text>
          </Text>
          <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color }]}>
            <Text style={[styles.badgeText, { color }]}>{levelText}</Text>
          </View>
        </View>

        {next && (
          <View style={styles.nextCol}>
            <Text style={styles.label}>Next hour</Text>
            <Text style={[styles.nextPrice, { color: getPriceColor(next.priceDKK, min, max) }]}>
              {next.priceDKK.toFixed(2)} kr
            </Text>
            <Text style={styles.trend}>
              {next.priceDKK > current.priceDKK ? '↑ Going up' : '↓ Going down'}
            </Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  price: {
    fontSize: 36,
    fontWeight: '800',
  },
  unit: {
    fontSize: 16,
    fontWeight: '400',
  },
  badge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  nextCol: {
    alignItems: 'flex-end',
  },
  nextPrice: {
    fontSize: 22,
    fontWeight: '700',
  },
  trend: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});
