import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';

const THRESHOLD_OPTIONS = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0];

export default function SettingsScreen({ navigation }) {
  const [priceArea, setPriceArea] = useState('DK1');
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [threshold, setThreshold] = useState(1.5);
  const [currency, setCurrency] = useState('DKK');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('user_settings');
      if (saved) {
        const s = JSON.parse(saved);
        setPriceArea(s.priceArea || 'DK1');
        setAlertsEnabled(s.alertsEnabled || false);
        setThreshold(s.threshold || 1.5);
        setCurrency(s.currency || 'DKK');
      }
    } catch (_) {}
  };

  const saveSettings = async (updates) => {
    try {
      const current = { priceArea, alertsEnabled, threshold, currency };
      await AsyncStorage.setItem('user_settings', JSON.stringify({ ...current, ...updates }));
    } catch (_) {}
  };

  const handleAreaChange = (area) => {
    setPriceArea(area);
    saveSettings({ priceArea: area });
  };

  const handleAlertsToggle = (val) => {
    setAlertsEnabled(val);
    saveSettings({ alertsEnabled: val });
    if (val) {
      Alert.alert('Alerts enabled', 'You\'ll be notified when prices drop below your threshold.');
    }
  };

  const handleThreshold = (val) => {
    setThreshold(val);
    saveSettings({ threshold: val });
  };

  const handleCurrency = (val) => {
    setCurrency(val);
    saveSettings({ currency: val });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Settings</Text>

        {/* Price area */}
        <Text style={styles.sectionLabel}>Price area</Text>
        <View style={styles.card}>
          <Text style={styles.hint}>
            DK1 = Jutland & Funen · DK2 = Zealand & Copenhagen
          </Text>
          <View style={styles.row}>
            {['DK1', 'DK2'].map((area) => (
              <TouchableOpacity
                key={area}
                style={[styles.optionBtn, priceArea === area && styles.optionBtnActive]}
                onPress={() => handleAreaChange(area)}
              >
                <Text style={[styles.optionText, priceArea === area && styles.optionTextActive]}>
                  {area}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Currency */}
        <Text style={styles.sectionLabel}>Display currency</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            {['DKK', 'EUR'].map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.optionBtn, currency === c && styles.optionBtnActive]}
                onPress={() => handleCurrency(c)}
              >
                <Text style={[styles.optionText, currency === c && styles.optionTextActive]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Price alerts */}
        <Text style={styles.sectionLabel}>Price alerts · Pro</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>Enable alerts</Text>
              <Text style={styles.switchDesc}>Notify when price drops below threshold</Text>
            </View>
            <Switch
              value={alertsEnabled}
              onValueChange={handleAlertsToggle}
              trackColor={{ false: COLORS.cardBorder, true: COLORS.primary + '88' }}
              thumbColor={alertsEnabled ? COLORS.primary : COLORS.textMuted}
            />
          </View>

          {alertsEnabled && (
            <>
              <View style={styles.divider} />
              <Text style={styles.switchLabel}>Alert threshold</Text>
              <Text style={styles.switchDesc}>Notify when price is below this value (kr/kWh)</Text>
              <View style={styles.thresholdRow}>
                {THRESHOLD_OPTIONS.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.threshBtn, threshold === t && styles.threshBtnActive]}
                    onPress={() => handleThreshold(t)}
                  >
                    <Text style={[styles.threshText, threshold === t && styles.threshTextActive]}>
                      {t.toFixed(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Pro upsell */}
        <TouchableOpacity style={styles.proCard} onPress={() => navigation.navigate('Pro')}>
          <Text style={styles.proCardTitle}>⚡ Upgrade to Pro</Text>
          <Text style={styles.proCardDesc}>
            Unlock alerts, 7-day history, widgets and more
          </Text>
          <Text style={styles.proCardArrow}>→</Text>
        </TouchableOpacity>

        {/* About */}
        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.card}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>App</Text>
            <Text style={styles.aboutValue}>Strøm</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Data source</Text>
            <Text style={styles.aboutValue}>Energi Data Service</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Prices update</Text>
            <Text style={styles.aboutValue}>Every 30 minutes</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: 24 },

  sectionLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 20,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
  },
  hint: { color: COLORS.textMuted, fontSize: 12, marginBottom: 12 },
  row: { flexDirection: 'row', gap: 10 },
  optionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
  },
  optionBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '22' },
  optionText: { color: COLORS.textMuted, fontWeight: '600' },
  optionTextActive: { color: COLORS.primary },

  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchLabel: { color: COLORS.text, fontWeight: '600', fontSize: 14, marginBottom: 2 },
  switchDesc: { color: COLORS.textMuted, fontSize: 12 },
  divider: { height: 1, backgroundColor: COLORS.cardBorder, marginVertical: 14 },

  thresholdRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  threshBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.background,
  },
  threshBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '22' },
  threshText: { color: COLORS.textMuted, fontWeight: '600', fontSize: 13 },
  threshTextActive: { color: COLORS.primary },

  proCard: {
    backgroundColor: COLORS.proGold + '11',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.proGold + '44',
    padding: 16,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  proCardTitle: { color: COLORS.proGold, fontWeight: '700', fontSize: 15, flex: 0 },
  proCardDesc: { color: COLORS.textMuted, fontSize: 12, flex: 1, marginLeft: 10 },
  proCardArrow: { color: COLORS.proGold, fontSize: 18, fontWeight: '700' },

  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  aboutLabel: { color: COLORS.textMuted, fontSize: 13 },
  aboutValue: { color: COLORS.text, fontSize: 13, fontWeight: '500' },
});
