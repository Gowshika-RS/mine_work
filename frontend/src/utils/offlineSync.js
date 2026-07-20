import localforage from 'localforage';
import axios from 'axios';

// Initialize a localforage store for our offline queue
const offlineQueue = localforage.createInstance({
  name: 'MineGuardOfflineSync',
  storeName: 'offlineQueue'
});

/**
 * Add a request to the offline queue
 * @param {Object} request - Must contain { method, url, data, headers }
 */
export const addToSyncQueue = async (request) => {
  try {
    const queue = await offlineQueue.getItem('requests') || [];
    queue.push(request);
    await offlineQueue.setItem('requests', queue);
    console.log('Request queued for offline sync:', request);
  } catch (error) {
    console.error('Error adding to sync queue:', error);
  }
};

/**
 * Process the queue when back online
 */
export const processSyncQueue = async () => {
  try {
    const queue = await offlineQueue.getItem('requests');
    if (!queue || queue.length === 0) return;

    console.log(`Processing ${queue.length} queued requests...`);

    const failedRequests = [];

    for (let req of queue) {
      try {
        await axios({
          method: req.method,
          url: req.url,
          data: req.data,
          headers: req.headers
        });
        console.log('Successfully synced queued request:', req.url);
      } catch (error) {
        console.error('Failed to sync queued request:', error);
        // If it's a 4xx error (except 401/403 which might just need a token refresh), we might want to drop it.
        // For now, retry all non-synced items.
        failedRequests.push(req);
      }
    }

    // Save whatever failed back to the queue
    await offlineQueue.setItem('requests', failedRequests);

  } catch (error) {
    console.error('Error processing sync queue:', error);
  }
};

// Set up online event listener
window.addEventListener('online', () => {
  console.log('App is back online. Attempting to sync offline data...');
  processSyncQueue();
});
