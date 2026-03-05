import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { fetchTodayAndTomorrow, getPriceColor } from './electricityApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WIDGET_TASK = 'live-price-widget';
const WIDGET_NOTIFICATION_ID = 'live-price-widget-notification';

// Defines the background task that refreshes the sticky notification
TaskManager.defineTask(WIDGET_TASK, async () => {
  try {
    const settingsRaw = await AsyncStorage.getItem('user_settings');
    const settings = settingsRaw ? JSON.parse(settingsRaw) : {};
    const priceArea = settings.priceArea || 'DK1';

    const { todayPrices } = await fetchTodayAndTomorrow(priceArea);
    const currentHour = new Date().getHours();
    const current = todayPrices.find((p) => p.hour === currentHour);
    const next = todayPrices.find((p) => p.hour === currentHour + 1);

    if (!current) return BackgroundFetch.BackgroundFetchResult.NoData;

    const min = Math.min(...todayPrices.map((p) => p.priceDKK));
    const max = Math.max(...todayPrices.map((p) => p.priceDKK));
    const level =
      getPriceColor(current.priceDKK, min, max) === '#4ade80'
        ? '🟢 Cheap'
        : getPriceColor(current.priceDKK, min, max) === '#facc15'
        ? '🟡 Medium'
        : '🔴 Expensive';

    await Notifications.dismissNotificationAsync(WIDGET_NOTIFICATION_ID);
    await Notifications.scheduleNotificationAsync({
      identifier: WIDGET_NOTIFICATION_ID,
      content: {
        title: `⚡ ${current.priceDKK.toFixed(2)} kr/kWh · ${level}`,
        body: next
          ? `Next hour: ${next.priceDKK.toFixed(2)} kr/kWh · ${priceArea}`
          : `${priceArea} · Updated ${new Date().toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}`,
        sticky: true,
        autoDismiss: false,
        priority: Notifications.AndroidNotificationPriority.LOW,
      },
      trigger: null,
    });

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function enablePriceWidget() {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(WIDGET_TASK);
  if (!isRegistered) {
    await BackgroundFetch.registerTaskAsync(WIDGET_TASK, {
      minimumInterval: 60 * 15, // every 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });
  }
  // Fire immediately on enable
  await TaskManager.executeTaskAsync(WIDGET_TASK).catch(() => {});
}

export async function disablePriceWidget() {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(WIDGET_TASK);
  if (isRegistered) await BackgroundFetch.unregisterTaskAsync(WIDGET_TASK);
  await Notifications.dismissNotificationAsync(WIDGET_NOTIFICATION_ID);
}
