import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface JeevanDB extends DBSchema {
  sync_queue: {
    key: string;
    value: {
      id: string;
      url: string;
      method: string;
      payload: unknown;
      timestamp: number;
      retryCount: number;
    };
    indexes: { 'by-time': number };
  };
}

let dbPromise: Promise<IDBPDatabase<JeevanDB>> | null = null;

export const initDB = () => {
  if (!dbPromise && typeof window !== 'undefined') {
    dbPromise = openDB<JeevanDB>('jeevan-offline-db', 1, {
      upgrade(db) {
        const store = db.createObjectStore('sync_queue', { keyPath: 'id' });
        store.createIndex('by-time', 'timestamp');
      },
    });
  }
  return dbPromise;
};

export const enqueueRequest = async (url: string, method: string, payload: unknown) => {
  const db = await initDB();
  if (!db) return;

  const id = crypto.randomUUID();
  await db.add('sync_queue', {
    id,
    url,
    method,
    payload,
    timestamp: Date.now(),
    retryCount: 0,
  });

  console.log(`[Offline Sync] Request ${id} queued for ${url}`);
  
  // Register for background sync if supported by Service Worker
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      // @ts-expect-error - TS doesn't have SyncManager types by default
      await registration.sync.register('jeevan-sync');
    } catch (err) {
      console.warn('Background sync could not be registered', err);
    }
  }
};

export const processQueue = async () => {
  const db = await initDB();
  if (!db || !navigator.onLine) return;

  const tx = db.transaction('sync_queue', 'readwrite');
  const store = tx.objectStore('sync_queue');
  const index = store.index('by-time');
  let cursor = await index.openCursor();

  while (cursor) {
    const req = cursor.value;
    try {
      console.log(`[Offline Sync] Attempting to sync request ${req.id}...`);
      
      const response = await fetch(req.url, {
        method: req.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.payload),
      });

      if (response.ok) {
        console.log(`[Offline Sync] Request ${req.id} synced successfully!`);
        await cursor.delete();
      } else {
        // Increment retry count
        req.retryCount++;
        await cursor.update(req);
      }
    } catch (error) {
      console.error(`[Offline Sync] Failed to sync request ${req.id}`, error);
      req.retryCount++;
      await cursor.update(req);
    }
    
    cursor = await cursor.continue();
  }
};

// Auto-process queue when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[Offline Sync] Connection restored. Processing queue...');
    processQueue();
  });
}
