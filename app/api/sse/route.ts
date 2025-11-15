import { NextResponse } from 'next/server';
import { EventEmitter } from 'events';

// Create a simple event emitter for SSE
const eventEmitter = new EventEmitter();

// Track active connections
const activeConnections = new Set<() => void>();

// Clean up old connections
setInterval(() => {
  activeConnections.forEach(cleanup => cleanup());
  activeConnections.clear();
}, 3600000); // Clean up every hour

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      let isClosed = false;
      let heartbeat: NodeJS.Timeout;
      let abortController: AbortController;
      
      // Function to safely close the stream
      const cleanup = () => {
        if (isClosed) return;
        isClosed = true;
        
        // Clear any active intervals
        if (heartbeat) clearInterval(heartbeat);
        
        // Remove from active connections
        activeConnections.delete(cleanup);
        
        // Clean up event listeners
        eventEmitter.off('pollUpdate', onPollUpdate);
        if (abortController) {
          abortController.signal.removeEventListener('abort', handleAbort);
        }
        
        // Close the controller if not already closed
        try {
          if (!controller.desiredSize) {
            controller.close();
          }
        } catch (error) {
          // Ignore errors when closing an already closed controller
        }
      };

      // Send initial connection message
      const sendEvent = (data: any) => {
        if (isClosed) return;
        try {
          controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
        } catch (error) {
          console.error('Error in SSE send:', error);
          cleanup();
        }
      };

      // Listen for poll updates
      const onPollUpdate = (data: any) => {
        if (isClosed) return;
        try {
          sendEvent({
            type: 'pollUpdate',
            code: data.code || data.pollId,
            timestamp: Date.now()
          });
        } catch (error) {
          console.error('Error in poll update:', error);
          cleanup();
        }
      };

      // Handle client disconnection
      const handleAbort = () => {
        cleanup();
      };

      // Set up abort controller for cleanup
      abortController = new AbortController();
      abortController.signal.addEventListener('abort', handleAbort);

      // Set up event listeners
      eventEmitter.on('pollUpdate', onPollUpdate);

      // Heartbeat to keep connection alive
      heartbeat = setInterval(() => {
        try {
          if (isClosed) return;
          sendEvent({ type: 'heartbeat', timestamp: Date.now() });
        } catch (error) {
          console.error('Error in heartbeat:', error);
          cleanup();
        }
      }, 30000); // 30 seconds

      // Send initial connection message
      sendEvent({ type: 'connected', timestamp: Date.now() });

      // Add to active connections
      activeConnections.add(cleanup);

      // Clean up on client disconnect
      return () => {
        cleanup();
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform, no-store',
      'Connection': 'keep-alive',
      'Content-Encoding': 'none',
    },
  });
}

// Utility function to notify all connected clients
export function notifyPollUpdate(code: string) {
  eventEmitter.emit('pollUpdate', { code, timestamp: Date.now() });
}
