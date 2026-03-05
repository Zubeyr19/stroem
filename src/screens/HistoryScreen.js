import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchSpotPrices } from '../services/electricityApi';
import { COLORS } from '../constants/colors';
import { format, subDays, startOfDay, addDays } from 'date-fns';

function DayRow({ day, data }) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.dayRow}>
        <Text style={styles.dayLabel}>{day}</Text>
        <Text style={styles.noData}>No data</Text>
      </View>
    );
  }

  const prices = data.map((d) => d.priceDKK);
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  return (
    <View style={styles.dayCard}>
      <View style={styles.dayHeader}>
        <Text style={styles.dayLabel}>{day}</Text>
        <Text style={styles.dayAvg}>avg {avg.toFixed(2)} kr</Text>
      </View>

      {/* Mini bar chart */}
      <View style={styles.miniChart}>
        {data.map((item) => {
          const h = Math.max(4, ((item.priceDKK - min) / range) * 40);
          const normalized = (item.priceDKK - min) / range;
          const color =
            normalized < 0.33 ? COLORS.primary : normalized < 0.66 ? COLORS.warning : COLORS.danger;
          return (
            <View
              key={item.hourLabel}
              style={[styles.miniBar, { height: h, backgroundColor: color }]}
            />
          );
        })}
      </View>

      <View style={styles.dayStats}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Min</Text>
          <Text style={[styles.statValue, { color: COLORS.primary }]}>{min.toFixed(2)} kr</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Avg</Text>
          <Text style={styles.statValue}>{avg.toFixed(2)} kr</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Max</Text>
          <Text style={[styles.statValue, { color: COLORS.danger }]}>{max.toFixed(2)} kr</Text>
        </View>
      </View>
    </View>
  );
}

export default function HistoryScreen() {
  const [priceArea, setPriceArea] = useState('DK1');
  const [historyData, setHistoryData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(startOfDay(new Date()), i);
    return { label: i === 0 ? 'Today' : format(d, 'EEE d MMM'), date: d };
  });

  useEffect(() => {
    loadHistory();
  }, [priceArea]);

  async function loadHistory() {
    setLoading(true);
    setError(null);
    try {
      const start = subDays(startOfDay(new Date()), 6);
      const end = addDays(startOfDay(new Date()), 1);
      const records = await fetchSpotPrices(priceArea, start, end);

      const grouped = {};
      records.forEach((r) => {
        const key = r.date.slice(0, 10);
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(r);
      });

      setHistoryData(grouped);
    } catch {
      setError('Could not load history. Check your connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>7-day history</Text>

        <View style={styles.areaRow}>
          {['DK1', 'DK2'].map((area) => (
            <TouchableOpacity
              key={area}
              style={[styles.areaBtn, priceArea === area && styles.areaBtnActive]}
              onPress={() => setPriceArea(area)}
            >
              <Text style={[styles.areaBtnText, priceArea === area && styles.areaBtnTextActive]}>
                {area === 'DK1' ? 'DK1 · West' : 'DK2 · East'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator color={COLORS.primary} size="large" />
            <Text style={styles.loadingText}>Loading history...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={loadHistory}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          days.map(({ label, date }) => {
            const key = format(date, 'yyyy-MM-dd');
            return <DayRow key={key} day={label} data={historyData[key]} />;
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: 20 },

  areaRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  areaBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
  },
  areaBtnActive: { backgroundColor: COLORS.primary + '22', borderColor: COLORS.primary },
  areaBtnText: { color: COLORS.textMuted, fontWeight: '600', fontSize: 13 },
  areaBtnTextActive: { color: COLORS.primary },

  loader: { alignItems: 'center', marginTop: 60, gap: 12 },
  loadingText: { color: COLORS.textMuted, fontSize: 14 },
  errorBox: { alignItems: 'center', marginTop: 40 },
  errorText: { color: COLORS.danger, fontSize: 14, textAlign: 'center', marginBottom: 16 },
  retryBtn: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  retryText: { color: COLORS.text, fontWeight: '600' },

  dayCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 14,
    marginBottom: 10,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dayLabel: { color: COLORS.text, fontWeight: '700', fontSize: 15 },
  dayAvg: { color: COLORS.textMuted, fontSize: 13 },
  noData: { color: COLORS.textMuted, fontSize: 13 },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 10,
  },

  miniChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 44,
    gap: 2,
    marginBottom: 12,
  },
  miniBar: {
    flex: 1,
    borderRadius: 2,
    opacity: 0.85,
  },

  dayStats: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statLabel: { color: COLORS.textMuted, fontSize: 11, marginBottom: 2 },
  statValue: { color: COLORS.text, fontWeight: '700', fontSize: 14 },
});
