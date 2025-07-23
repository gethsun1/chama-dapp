// src/hooks/useMessageVirtualization.jsx
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

const VIRTUAL_ITEM_HEIGHT = 80; // Approximate height of a message item
const BUFFER_SIZE = 5; // Number of items to render outside visible area
const MAX_MESSAGES_IN_MEMORY = 1000; // Maximum messages to keep in memory

export const useMessageVirtualization = (messages = [], containerHeight = 400) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);
  const containerRef = useRef(null);

  // Optimize messages by keeping only recent ones in memory
  const optimizedMessages = useMemo(() => {
    if (messages.length <= MAX_MESSAGES_IN_MEMORY) {
      return messages;
    }
    // Keep the most recent messages
    return messages.slice(-MAX_MESSAGES_IN_MEMORY);
  }, [messages]);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const itemCount = optimizedMessages.length;
    const visibleStart = Math.floor(scrollTop / VIRTUAL_ITEM_HEIGHT);
    const visibleEnd = Math.min(
      itemCount - 1,
      Math.ceil((scrollTop + containerHeight) / VIRTUAL_ITEM_HEIGHT)
    );

    const startIndex = Math.max(0, visibleStart - BUFFER_SIZE);
    const endIndex = Math.min(itemCount - 1, visibleEnd + BUFFER_SIZE);

    return {
      startIndex,
      endIndex,
      visibleStart,
      visibleEnd,
    };
  }, [scrollTop, containerHeight, optimizedMessages.length]);

  // Get visible messages
  const visibleMessages = useMemo(() => {
    return optimizedMessages.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [optimizedMessages, visibleRange.startIndex, visibleRange.endIndex]);

  // Calculate total height and offset
  const totalHeight = optimizedMessages.length * VIRTUAL_ITEM_HEIGHT;
  const offsetY = visibleRange.startIndex * VIRTUAL_ITEM_HEIGHT;

  // Handle scroll events with throttling
  const handleScroll = useCallback((event) => {
    const newScrollTop = event.target.scrollTop;
    setScrollTop(newScrollTop);
    setIsScrolling(true);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set scrolling to false after scroll ends
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  // Check if user is near bottom
  const isNearBottom = useMemo(() => {
    const threshold = VIRTUAL_ITEM_HEIGHT * 3; // 3 message heights
    return (scrollTop + containerHeight) >= (totalHeight - threshold);
  }, [scrollTop, containerHeight, totalHeight]);

  // Auto-scroll to bottom for new messages only if user is near bottom
  useEffect(() => {
    if (isNearBottom && !isScrolling) {
      scrollToBottom();
    }
  }, [optimizedMessages.length, isNearBottom, isScrolling, scrollToBottom]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    containerRef,
    visibleMessages,
    totalHeight,
    offsetY,
    handleScroll,
    scrollToBottom,
    isScrolling,
    isNearBottom,
    visibleRange,
    messageCount: optimizedMessages.length,
  };
};

// Hook for optimizing real-time updates
export const useOptimizedUpdates = (updateFunction, delay = 100) => {
  const timeoutRef = useRef(null);
  const pendingUpdatesRef = useRef([]);

  const optimizedUpdate = useCallback((...args) => {
    pendingUpdatesRef.current.push(args);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const updates = pendingUpdatesRef.current;
      pendingUpdatesRef.current = [];
      
      // Batch process all pending updates
      if (updates.length > 0) {
        updateFunction(updates);
      }
    }, delay);
  }, [updateFunction, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return optimizedUpdate;
};

// Hook for connection pooling and management
export const useConnectionPool = () => {
  const connectionsRef = useRef(new Map());
  const [activeConnections, setActiveConnections] = useState(0);

  const addConnection = useCallback((id, connection) => {
    connectionsRef.current.set(id, connection);
    setActiveConnections(connectionsRef.current.size);
  }, []);

  const removeConnection = useCallback((id) => {
    const connection = connectionsRef.current.get(id);
    if (connection && typeof connection.disconnect === 'function') {
      connection.disconnect();
    }
    connectionsRef.current.delete(id);
    setActiveConnections(connectionsRef.current.size);
  }, []);

  const getConnection = useCallback((id) => {
    return connectionsRef.current.get(id);
  }, []);

  const cleanupAllConnections = useCallback(() => {
    connectionsRef.current.forEach((connection, id) => {
      if (connection && typeof connection.disconnect === 'function') {
        connection.disconnect();
      }
    });
    connectionsRef.current.clear();
    setActiveConnections(0);
  }, []);

  useEffect(() => {
    return () => {
      cleanupAllConnections();
    };
  }, [cleanupAllConnections]);

  return {
    addConnection,
    removeConnection,
    getConnection,
    cleanupAllConnections,
    activeConnections,
  };
};

export default useMessageVirtualization;
