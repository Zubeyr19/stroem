import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import { useSubscription } from '../context/SubscriptionContext';

const FEATURES = [
  { emoji: '🔔', title: 'Price alerts', desc: 'Get notified when prices drop below your threshold' },
  { emoji: '📅', title: 'Tomorrow\'s prices', desc: 'See next day prices as soon as they go live at 13:00' },
  { emoji: '📊', title: '7-day history', desc: 'Track price trends over the past week' },
  { emoji: '🏠', title: 'Custom appliances', desc: 'Add your own devices with exact wattage' },
  { emoji: '📱', title: 'Home screen widget', desc: 'Live price on your home screen at a glance' },
  { emoji: '💰', title: 'Monthly savings report', desc: 'See how much you saved by timing your usage' },
];

const PLANS = [
  { id: 'monthly', label: 'Monthly', price: '19 kr', period: '/mo', popular: false },
  { id: 'yearly', label: 'Yearly', price: '129 kr', period: '/yr', popular: true, saving: 'Save 70%' },
];

export default function ProScreen({ navigation }) {
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [purchasing, setPurchasing] = useState(false);
  const { isPro, offerings, purchasePlan, restorePurchases } = useSubscription();

  // If already pro, close automatically
  React.useEffect(() => {
    if (isPro) {
      Alert.alert('You\'re already Pro!', 'All features are unlocked.', [
        { text: 'Great!', onPress: () => navigation.goBack() },
      ]);
    }
  }, [isPro]);

  const getPackage = () => {
    if (!offerings?.current) return null;
    if (selectedPlan === 'yearly') return offerings.current.annual;
    return offerings.current.monthly;
  };

  const handleSubscribe = async () => {
    const pkg = getPackage();
    if (!pkg) {
      Alert.alert('Not available', 'Please try again later.');
      return;
    }
    setPurchasing(true);
    const { success, error } = await purchasePlan(pkg);
    setPurchasing(false);
    if (success) {
      Alert.alert('Welcome to Pro!', 'All features are now unlocked.', [
        { text: 'Let\'s go!', onPress: () => navigation.goBack() },
      ]);
    } else if (error) {
      Alert.alert('Purchase failed', error);
    }
  };

  const handleRestore = async () => {
    const restored = await restorePurchases();
    Alert.alert(
      restored ? 'Restored!' : 'Nothing to restore',
      restored ? 'Your Pro subscription is active.' : 'No previous purchases found.'
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Close button */}
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        {/* Header */}
        <LinearGradient
          colors={[COLORS.proGold + '33', 'transparent']}
          style={styles.headerGrad}
        >
          <Text style={styles.crown}>⚡</Text>
          <Text style={styles.title}>Strøm Pro</Text>
          <Text style={styles.subtitle}>
            Know exactly when to use your appliances.{'\n'}Save money every single day.
          </Text>
        </LinearGradient>

        {/* Features */}
        <View style={styles.featuresBox}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureRow}>
              <Text style={styles.featureEmoji}>{f.emoji}</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
              <Text style={styles.check}>✓</Text>
            </View>
          ))}
        </View>

        {/* Plan selector */}
        <View style={styles.planRow}>
          {PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[styles.planCard, selectedPlan === plan.id && styles.planCardActive]}
              onPress={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>Best value</Text>
                </View>
              )}
              <Text style={styles.planLabel}>{plan.label}</Text>
              <Text style={styles.planPrice}>
                {plan.price}
                <Text style={styles.planPeriod}>{plan.period}</Text>
              </Text>
              {plan.saving && (
                <Text style={styles.planSaving}>{plan.saving}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.ctaBtn} onPress={handleSubscribe} disabled={purchasing}>
          <LinearGradient
            colors={[COLORS.proGold, '#d97706']}
            style={styles.ctaGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {purchasing ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.ctaText}>Start free 7-day trial</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.fine}>
          Cancel anytime. No charge until trial ends.
        </Text>

        <View style={styles.linksRow}>
          <TouchableOpacity>
            <Text style={styles.link}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.linkDot}>·</Text>
          <TouchableOpacity>
            <Text style={styles.link}>Terms of Use</Text>
          </TouchableOpacity>
          <Text style={styles.linkDot}>·</Text>
          <TouchableOpacity onPress={handleRestore}>
            <Text style={styles.link}>Restore purchase</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },

  closeBtn: { alignSelf: 'flex-end', padding: 8, marginBottom: 8 },
  closeText: { color: COLORS.textMuted, fontSize: 18 },

  headerGrad: { borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 24 },
  crown: { fontSize: 40, marginBottom: 8 },
  title: { fontSize: 30, fontWeight: '800', color: COLORS.proGold, marginBottom: 8 },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },

  featuresBox: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 24,
    overflow: 'hidden',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  featureEmoji: { fontSize: 22, width: 36 },
  featureText: { flex: 1 },
  featureTitle: { color: COLORS.text, fontWeight: '600', fontSize: 14 },
  featureDesc: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  check: { color: COLORS.primary, fontSize: 16, fontWeight: '700' },

  planRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  planCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  planCardActive: {
    borderColor: COLORS.proGold,
    backgroundColor: COLORS.proGold + '11',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: COLORS.proGold,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  popularText: { color: '#000', fontSize: 10, fontWeight: '800' },
  planLabel: { color: COLORS.textMuted, fontSize: 12, marginBottom: 6, marginTop: 8 },
  planPrice: { color: COLORS.text, fontSize: 22, fontWeight: '800' },
  planPeriod: { fontSize: 13, fontWeight: '400', color: COLORS.textMuted },
  planSaving: { color: COLORS.primary, fontSize: 11, fontWeight: '700', marginTop: 4 },

  ctaBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  ctaGrad: { padding: 18, alignItems: 'center' },
  ctaText: { color: '#000', fontSize: 17, fontWeight: '800' },

  fine: { textAlign: 'center', color: COLORS.textMuted, fontSize: 12, marginBottom: 20 },
  linksRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  link: { color: COLORS.textMuted, fontSize: 11 },
  linkDot: { color: COLORS.textMuted, fontSize: 11 },
});
