import { Alert, Platform } from 'react-native';

/**
 * Cross-platform confirmation dialog.
 * On web: uses window.confirm (synchronous, returns boolean).
 * On native: uses Alert.alert with Cancel / Confirm buttons.
 *
 * Returns a promise that resolves `true` when the user confirms,
 * and `false` when they cancel.
 */
export function confirmAction(
  title: string,
  message: string,
): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Confirm', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}
