import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePrices } from '../hooks/usePrices';
import CurrentPriceCard from '../components/CurrentPriceCard';
import BestHoursCard from '../components/BestHoursCard';
import PriceChart from '../components/PriceChart';
import { COLORS } from '../constants/colors';
import { GRID_OPERATORS } from '../constants/gridOperators';
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }) {
  const [priceArea, setPriceArea] = useState('DK1');
  const [showTomorrow, setShowTomorrow] = useState(false);
  const [operatorGln, setOperatorGln] = useState(null);
  const [operatorName, setOperatorName] = useState(null);

  // Load saved operator on mount
  React.useEffect(() => {
    AsyncStorage.getItem('user_settings').then((raw) => {
      if (!raw) return;
      const s = JSON.parse(raw);
      if (s.priceArea) setPriceArea(s.priceArea);
      if (s.gridOperatorId) {
        const op = GRID_OPERATORS.find((o) => o.id === s.gridOperatorId);
        if (op) { setOperatorGln(op.gln); setOperatorName(op.name); }
      }
    }).catch(() => {});
  }, []);

  const { todayPrices, tomorrowPrices, cheapestHours, loading, error, refresh, lastUpdated, showTruePrice } =
    usePrices(priceArea, operatorGln);

  const displayPrices = showTomorrow ? tomorrowPrices : todayPrices;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>Elpilot</Text>
            <Text style={styles.date}>{format(new Date(), 'EEEE, d MMMM')}</Text>
          </View>
          <TouchableOpacity
            style={styles.proButton}
            onPress={() => navigation.navigate('Pro')}
          >
            <Text style={styles.proText}>⚡ Pro</Text>
          </TouchableOpacity>
        </View>

        {/* Area selector */}
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

        {/* Price mode indicator */}
        {showTruePrice ? (
          <View style={styles.priceModeBadge}>
            <Text style={styles.priceModeText}>
              Real price incl. VAT · {operatorName}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.priceModeBadgeAlt}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.priceModeTextAlt}>
              Spot price only — set your netselskab in Settings for real price
            </Text>
          </TouchableOpacity>
        )}

        {loading && !displayPrices.length ? (
          <View style={styles.loader}>
            <ActivityIndicator color={COLORS.primary} size="large" />
            <Text style={styles.loadingText}>Fetching live prices...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={refresh}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <CurrentPriceCard prices={displayPrices} />
            <BestHoursCard cheapestHours={cheapestHours} />

            {/* Day toggle */}
            <View style={styles.dayToggle}>
              {['Today', 'Tomorrow'].map((day, i) => (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayBtn, showTomorrow === !!i && styles.dayBtnActive]}
                  onPress={() => setShowTomorrow(!!i)}
                >
                  <Text style={[styles.dayBtnText, showTomorrow === !!i && styles.dayBtnTextActive]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>
                Hourly prices · {showTomorrow ? 'Tomorrow' : 'Today'}
              </Text>
              <Text style={styles.chartSubtitle}>kr/kWh · ★ = cheapest window</Text>
              <PriceChart prices={displayPrices} cheapestHours={cheapestHours} />
            </View>

            {lastUpdated && (
              <Text style={styles.updated}>
                Updated {format(lastUpdated, 'HH:mm')}
              </Text>
            )}

            {/* Tomorrow locked if no data yet */}
            {showTomorrow && tomorrowPrices.length === 0 && (
              <View style={styles.noTomorrow}>
                <Text style={styles.noTomorrowText}>
                  Tomorrow's prices are published around 13:00 each day.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  proButton: {
    backgroundColor: COLORS.proGold + '22',
    borderColor: COLORS.proGold,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  proText: {
    color: COLORS.proGold,
    fontWeight: '700',
    fontSize: 13,
  },

  areaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  areaBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
  },
  areaBtnActive: {
    backgroundColor: COLORS.primary + '22',
    borderColor: COLORS.primary,
  },
  areaBtnText: { color: COLORS.textMuted, fontWeight: '600', fontSize: 13 },
  areaBtnTextActive: { color: COLORS.primary },

  priceModeBadge: {
    backgroundColor: COLORS.primary + '18',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  priceModeText: { color: COLORS.primary, fontSize: 12, fontWeight: '600' },
  priceModeBadgeAlt: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  priceModeTextAlt: { color: COLORS.textMuted, fontSize: 11 },

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

  dayToggle: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  dayBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
  },
  dayBtnActive: { backgroundColor: COLORS.accent + '22', borderColor: COLORS.accent },
  dayBtnText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  dayBtnTextActive: { color: COLORS.accent },

  chartCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 12,
    overflow: 'hidden',
  },
  chartTitle: { color: COLORS.text, fontWeight: '700', fontSize: 15, marginBottom: 2 },
  chartSubtitle: { color: COLORS.textMuted, fontSize: 11, marginBottom: 12 },

  updated: { textAlign: 'center', color: COLORS.textMuted, fontSize: 11, marginTop: 8 },

  noTomorrow: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  noTomorrowText: { color: COLORS.textMuted, textAlign: 'center', fontSize: 13 },
});
