import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

const APPLIANCES = [
  { name: 'Washing machine', emoji: '🫧', watt: 2000 },
  { name: 'Dishwasher', emoji: '🍽️', watt: 1800 },
  { name: 'EV charger', emoji: '⚡', watt: 7400 },
  { name: 'Dryer', emoji: '🌀', watt: 2500 },
];

export default function BestHoursCard({ cheapestHours }) {
  if (!cheapestHours || cheapestHours.length === 0) return null;

  const startLabel = cheapestHours[0].hourLabel;
  const endHour = cheapestHours[cheapestHours.length - 1].hour + 1;
  const endLabel = `${String(endHour).padStart(2, '0')}:00`;
  const avgPrice =
    cheapestHours.reduce((a, b) => a + b.priceDKK, 0) / cheapestHours.length;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Best time to run appliances</Text>
      <Text style={styles.window}>
        {startLabel} → {endLabel}
      </Text>
      <Text style={styles.avg}>avg. {avgPrice.toFixed(2)} kr/kWh</Text>

      <View style={styles.divider} />

      <Text style={styles.subtitle}>Estimated cost per cycle</Text>
      {APPLIANCES.map((a) => {
        const hours = 1.5;
        const kwh = (a.watt / 1000) * hours;
        const cost = kwh * avgPrice;
        return (
          <View key={a.name} style={styles.row}>
            <Text style={styles.emoji}>{a.emoji}</Text>
            <Text style={styles.applianceName}>{a.name}</Text>
            <Text style={styles.cost}>{cost.toFixed(2)} kr</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  title: {
    fontSize: 13,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  window: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
  },
  avg: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
    marginVertical: 16,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emoji: { fontSize: 18, width: 30 },
  applianceName: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  cost: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});
