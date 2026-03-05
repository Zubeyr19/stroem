import 'react-native-gesture-handler';
import { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { SubscriptionProvider } from './src/context/SubscriptionContext';
import {
  requestNotificationPermissions,
  registerBackgroundTask,
} from './src/services/notificationService';

export default function App() {
  useEffect(() => {
    (async () => {
      const granted = await requestNotificationPermissions();
      if (granted) await registerBackgroundTask();
    })();
  }, []);

  return (
    <SubscriptionProvider>
      <AppNavigator />
    </SubscriptionProvider>
  );
}
