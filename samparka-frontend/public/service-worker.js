const CACHE_NAME = "pwa-cache-v4"; // BUMP VERSION TO FORCE UPDATE
// Do NOT cache index.html — always fetch it from the network
// to avoid version mismatches between the HTML and JS chunks.
const urlsToCache = [];

// ─── IndexedDB helpers ────────────────────────────────────────────────────────
// Used to persist a pending celebration across app kills so the page can read
// it on cold start (URL params are unreliable when the app boots from scratch).

const IDB_NAME = "samparka-sw";
const IDB_VERSION = 1;
const IDB_STORE = "pendingCelebration";

function openIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(IDB_STORE);
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

function writePendingCelebration(data) {
  return openIDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(data, "pending");
      tx.oncomplete = resolve;
      tx.onerror = (e) => reject(e.target.error);
    });
  });
}
// ─────────────────────────────────────────────────────────────────────────────

self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch((err) => {
        console.error("Cache addAll failed:", err);
      });
    })
  );
  // NOTE: We intentionally do NOT call self.skipWaiting() here.
  // skipWaiting() forces the new SW to activate immediately, which fires a
  // 'controllerchange' event that can cause unexpected page reloads.
  // The new SW will activate safely when all tabs using the old SW are closed.
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only intercept same-origin requests (static assets / navigation).
  // Cross-origin requests (API calls, CDN, etc.) must pass through directly
  // so CORS headers set by the server are respected.
  if (url.origin !== self.location.origin) {
    return;
  }

  // Navigation requests (HTML pages) — always use Network First.
  // This prevents stale HTML from causing JS chunk mismatch reloads.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Static assets — Cache First (fast loads, falls back to network).
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener("push", (event) => {
  console.log("Push received", event);

  const data = event.data ? event.data.json() : {};
  const title = data.title || "Notification";
  const options = {
    body: data.body,
    icon: "/icon.png",
    tag: "unique-notification", // ✅ Ensures only one notification per tag
    data: data.data // ← Pass notification data through for click handler
  };

  const isPointsEarned = data.data?.type === "points-earned";

  event.waitUntil(
    Promise.all([
      // 1. Show the OS notification
      self.registration.showNotification(title, options),

      // 2. If points-earned: persist to IndexedDB so a cold-start page can
      //    read it even if the user doesn't tap the notification banner.
      isPointsEarned
        ? writePendingCelebration({
            points: data.data.points,
            storeName: data.data.storeName,
            timestamp: data.data.timestamp,
          }).catch((err) =>
            console.error("[SW] Failed to write pending celebration:", err)
          )
        : Promise.resolve(),

      // 3. Message ALL open window clients (background tabs included) so the
      //    celebration fires immediately when the app is already open.
      isPointsEarned
        ? self.clients
            .matchAll({ type: "window", includeUncontrolled: true })
            .then((clients) => {
              clients.forEach((client) => {
                console.log("📨 Sending POINTS_EARNED to open client");
                client.postMessage({
                  type: "POINTS_EARNED",
                  points: data.data.points,
                  storeName: data.data.storeName,
                  timestamp: data.data.timestamp,
                });
              });
            })
        : Promise.resolve(),
    ])
  );
});

// Fires when the browser silently rotates the push subscription (e.g. after
// a SW update or browser update). Re-subscribe and notify the open page so
// it can update the backend without the user having to reinstall.
self.addEventListener("pushsubscriptionchange", (event) => {
  const VAPID_PUBLIC_KEY =
    "BNOFxo-K_WdOwjUVeBqxg4T-9OMCLsdC4PkV49pDPufEC9v-gAcKdXs_6FN7zQoea6hTQH5Ny7zpkoAkJ4cy0gU";

  event.waitUntil(
    self.registration.pushManager
      .subscribe({ userVisibleOnly: true, applicationServerKey: VAPID_PUBLIC_KEY })
      .then((newSubscription) => {
        // Notify all open clients so they can POST the new subscription to the backend
        return self.clients
          .matchAll({ includeUncontrolled: true, type: "window" })
          .then((clients) => {
            clients.forEach((client) =>
              client.postMessage({
                type: "SUBSCRIPTION_CHANGED",
                subscription: newSubscription.toJSON(),
              })
            );
          });
      })
      .catch((err) => console.error("[SW] pushsubscriptionchange re-subscribe failed:", err))
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Extract notification data
  const notificationData = event.notification.data || {};

  // Build URL with params if it's a points-earned notification
  let targetUrl = "/loyality";
  if (notificationData.type === "points-earned") {
    const params = new URLSearchParams({
      notification: "points-earned",
      points: notificationData.points || 0,
      storeName: notificationData.storeName || "",
      timestamp: notificationData.timestamp || Date.now()
    });
    targetUrl = `/loyality?${params.toString()}`;
  }

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true
      })
      .then((clientList) => {
        // Try to focus existing loyality window
        for (const client of clientList) {
          if (client.url.includes("/loyality") && "focus" in client) {
            // Navigate existing window to URL with params
            return client.focus().then(() => client.navigate(targetUrl));
          }
        }
        // Open new window with params
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
