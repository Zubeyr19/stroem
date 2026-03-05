import React, { createContext, useContext, useState, useEffect } from 'react';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';

// Replace with your actual RevenueCat API keys from app.revenuecat.com
const RC_API_KEY_ANDROID = 'YOUR_REVENUECAT_ANDROID_KEY';
const RC_API_KEY_IOS = 'YOUR_REVENUECAT_IOS_KEY';

const SubscriptionContext = createContext({
  isPro: false,
  offerings: null,
  purchasePlan: async () => {},
  restorePurchases: async () => {},
  loading: true,
});

export function SubscriptionProvider({ children }) {
  const [isPro, setIsPro] = useState(false);
  const [offerings, setOfferings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initRevenueCat();
  }, []);

  async function initRevenueCat() {
    try {
      if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);

      const apiKey = Platform.OS === 'ios' ? RC_API_KEY_IOS : RC_API_KEY_ANDROID;
      await Purchases.configure({ apiKey });

      const info = await Purchases.getCustomerInfo();
      setIsPro(checkProStatus(info));

      const available = await Purchases.getOfferings();
      setOfferings(available);
    } catch (e) {
      console.warn('RevenueCat init failed:', e.message);
    } finally {
      setLoading(false);
    }
  }

  function checkProStatus(info) {
    return (
      info.entitlements.active['pro'] !== undefined ||
      info.entitlements.active['stroem_pro'] !== undefined
    );
  }

  async function purchasePlan(packageToPurchase) {
    try {
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      const isNowPro = checkProStatus(customerInfo);
      setIsPro(isNowPro);
      return { success: isNowPro, error: null };
    } catch (e) {
      if (!e.userCancelled) {
        return { success: false, error: e.message };
      }
      return { success: false, error: null };
    }
  }

  async function restorePurchases() {
    try {
      const info = await Purchases.restorePurchases();
      const isNowPro = checkProStatus(info);
      setIsPro(isNowPro);
      return isNowPro;
    } catch {
      return false;
    }
  }

  return (
    <SubscriptionContext.Provider
      value={{ isPro, offerings, purchasePlan, restorePurchases, loading }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
