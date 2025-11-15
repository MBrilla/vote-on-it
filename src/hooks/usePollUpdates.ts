import { useEffect, useRef, useCallback } from 'react';

export function usePollUpdates(pollCode: string, onUpdate: () => void) {
  const retryCount = useRef(0);
  const maxRetries = 10; // Increased max retries
  const retryDelay = 300; // Reduced initial delay for NILEDB
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!pollCode) {
      console.log('No poll code provided, skipping SSE connection');
      return;
    }

    if (retryCount.current >= maxRetries) {
      console.warn('Max SSE reconnection attempts reached');
      return;
    }

    cleanup();

    console.log(`Connecting to SSE for poll: ${pollCode}`);
    eventSourceRef.current = new EventSource(`/api/sse`);

    eventSourceRef.current.onopen = () => {
      console.log('SSE connection established');
      retryCount.current = 0; // Reset retry count on successful connection
    };

    eventSourceRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received SSE message:', data);
        
        // Check if the update is for this poll
        if (data.pollId === pollCode || data.code === pollCode || data.type === 'heartbeat') {
          console.log('Update is for current poll, triggering update');
          onUpdate();
        } else {
          console.log('Update is for a different poll, ignoring');
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    eventSourceRef.current.onerror = (error) => {
      console.error('SSE Error:', error);
      
      cleanup();

      // Reconnect with linear backoff for NILEDB (faster recovery)
      if (retryCount.current < maxRetries) {
        const baseDelay = retryDelay;
        const jitter = Math.random() * 200; // Add some jitter to prevent thundering herd
        const delay = Math.min(baseDelay + jitter, 1000); // Cap at 1s
        retryCount.current++;
        console.log(`Reconnecting in ${Math.round(delay)}ms (attempt ${retryCount.current}/${maxRetries})`);
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      }
    };
  }, [pollCode, onUpdate, cleanup]);

  useEffect(() => {
    console.log('Setting up SSE for poll:', pollCode);
    connect();

    // Clean up on unmount or when dependencies change
    return () => {
      console.log('Cleaning up SSE connection');
      cleanup();
    };
  }, [pollCode, connect, cleanup]);
}
