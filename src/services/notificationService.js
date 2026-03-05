import * as Notifications from 'expo-notifications';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchTodayAndTomorrow } from './electricityApi';

const BACKGROUND_TASK = 'background-price-check';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Background task definition — must be at module level
TaskManager.defineTask(BACKGROUND_TASK, async () => {
  try {
    const settingsRaw = await AsyncStorage.getItem('user_settings');
    const settings = settingsRaw ? JSON.parse(settingsRaw) : {};
    if (!settings.alertsEnabled) return BackgroundFetch.BackgroundFetchResult.NoData;

    const threshold = settings.threshold || 1.5;
    const priceArea = settings.priceArea || 'DK1';

    const { todayPrices } = await fetchTodayAndTomorrow(priceArea);
    const currentHour = new Date().getHours();
    const current = todayPrices.find((p) => p.hour === currentHour);

    if (current && current.priceDKK < threshold) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚡ Low electricity price now!',
          body: `${current.priceDKK.toFixed(2)} kr/kWh — good time to run heavy appliances.`,
          data: { hour: currentHour },
        },
        trigger: null, // fire immediately
      });
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }

    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function requestNotificationPermissions() {
  if (!Device.isDevice) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function registerBackgroundTask() {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK);
  if (isRegistered) return;
  await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK, {
    minimumInterval: 60 * 60, // every hour
    stopOnTerminate: false,
    startOnBoot: true,
  });
}

export async function unregisterBackgroundTask() {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK);
  if (isRegistered) await BackgroundFetch.unregisterTaskAsync(BACKGROUND_TASK);
}

export async function sendPriceSummaryNotification(prices) {
  if (!prices || prices.length === 0) return;
  const min = Math.min(...prices.map((p) => p.priceDKK));
  const max = Math.max(...prices.map((p) => p.priceDKK));
  const cheapHour = prices.find((p) => p.priceDKK === min);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Today's electricity summary",
      body: `Cheapest at ${cheapHour?.hourLabel} (${min.toFixed(2)} kr) · Peak ${max.toFixed(2)} kr/kWh`,
    },
    trigger: null,
  });
}
