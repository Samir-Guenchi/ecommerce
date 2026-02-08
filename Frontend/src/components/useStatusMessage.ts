import { useState, useCallback, useRef } from 'react';

export type MessageType = 'success' | 'error' | 'info';

interface StatusMessage {
  text: string;
  type: MessageType;
}

/**
 * Hook for managing inline status messages (replaces Alert.alert on web).
 * Returns current message state + helper functions.
 *
 * Usage:
 *   const { message, showSuccess, showError, showInfo, clear } = useStatusMessage();
 *   <StatusBanner message={message?.text} type={message?.type ?? 'info'} onDismiss={clear} />
 */
export function useStatusMessage(autoClearMs = 4000) {
  const [message, setMessage] = useState<StatusMessage | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (text: string, type: MessageType) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setMessage({ text, type });
      if (autoClearMs > 0) {
        timerRef.current = setTimeout(() => setMessage(null), autoClearMs);
      }
    },
    [autoClearMs],
  );

  const showSuccess = useCallback((text: string) => show(text, 'success'), [show]);
  const showError = useCallback((text: string) => show(text, 'error'), [show]);
  const showInfo = useCallback((text: string) => show(text, 'info'), [show]);
  const clear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(null);
  }, []);

  return { message, showSuccess, showError, showInfo, clear };
}
