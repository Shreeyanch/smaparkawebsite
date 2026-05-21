import api from "../api/config";

const VAPID_PUBLIC_KEY =
  "BNOFxo-K_WdOwjUVeBqxg4T-9OMCLsdC4PkV49pDPufEC9v-gAcKdXs_6FN7zQoea6hTQH5Ny7zpkoAkJ4cy0gU";

/**
 * Silently ensures the backend has the current push subscription endpoint
 * for the given userId. Runs idempotently on every app mount:
 *   - If nothing changed, does nothing (endpoint cached in localStorage).
 *   - If the endpoint changed (browser rotated the subscription or SW updated),
 *     re-registers with the backend transparently — no user interaction needed.
 *
 * Call this whenever the user is logged in and Notification.permission === "granted".
 */
export async function ensurePushSubscription(userId) {
  try {
    if (!userId) return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    if (!("serviceWorker" in navigator)) return;

    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return;

    // `subscribe` is idempotent — returns the existing subscription if unchanged
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: VAPID_PUBLIC_KEY,
    });

    const currentEndpoint = subscription.endpoint;
    const storedEndpoint = localStorage.getItem(`pushEndpoint_${userId}`);

    // Only hit the backend if the endpoint actually changed
    if (currentEndpoint !== storedEndpoint) {
      await api.post(
        "/subscribe",
        { userId, subscription },
        { headers: { "Content-Type": "application/json" } }
      );
      localStorage.setItem(`pushEndpoint_${userId}`, currentEndpoint);
    }
  } catch (err) {
    // Silent — never interrupt the user experience for a background refresh
    console.warn("[ensurePushSubscription] silent refresh failed:", err);
  }
}

/**
 * Call this after a successful manual subscribe to keep localStorage in sync.
 */
export function cachePushEndpoint(userId, subscription) {
  if (userId && subscription?.endpoint) {
    localStorage.setItem(`pushEndpoint_${userId}`, subscription.endpoint);
  }
}

/**
 * Call this after a successful manual unsubscribe to clear the cache.
 */
export function clearPushEndpoint(userId) {
  if (userId) {
    localStorage.removeItem(`pushEndpoint_${userId}`);
  }
}
