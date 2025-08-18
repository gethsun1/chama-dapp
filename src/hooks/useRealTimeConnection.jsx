// src/hooks/useRealTimeConnection.jsx
import { useState, useEffect, useCallback } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { useCommunication } from '../contexts/CommunicationContext';

export const useRealTimeConnection = () => {
  const { isConnected, address } = useAppKitAccount();
  const { socket, connectionStatus } = useCommunication();
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastConnected, setLastConnected] = useState(null);

  // Track connection state changes
  useEffect(() => {
    if (connectionStatus === 'connected') {
      setReconnectAttempts(0);
      setLastConnected(new Date());
    }
  }, [connectionStatus]);

  // Auto-reconnect logic
  useEffect(() => {
    if (isConnected && address && connectionStatus === 'disconnected' && reconnectAttempts < 5) {
      const timeout = setTimeout(() => {
        setReconnectAttempts(prev => prev + 1);
        if (socket) {
          socket.connect();
        }
      }, Math.pow(2, reconnectAttempts) * 1000); // Exponential backoff

      return () => clearTimeout(timeout);
    }
  }, [isConnected, address, connectionStatus, reconnectAttempts, socket]);

  const forceReconnect = useCallback(() => {
    if (socket) {
      setReconnectAttempts(0);
      socket.disconnect();
      socket.connect();
    }
  }, [socket]);

  const getConnectionStatusInfo = useCallback(() => {
    switch (connectionStatus) {
      case 'connected':
        return {
          status: 'connected',
          message: 'Connected to real-time services',
          color: 'success',
          icon: 'check_circle'
        };
      case 'connecting':
        return {
          status: 'connecting',
          message: 'Connecting to real-time services...',
          color: 'warning',
          icon: 'sync'
        };
      case 'disconnected':
        return {
          status: 'disconnected',
          message: reconnectAttempts > 0 ? `Reconnecting... (${reconnectAttempts}/5)` : 'Disconnected from real-time services',
          color: 'error',
          icon: 'error'
        };
      default:
        return {
          status: 'unknown',
          message: 'Unknown connection status',
          color: 'default',
          icon: 'help'
        };
    }
  }, [connectionStatus, reconnectAttempts]);

  // Performance monitoring
  const [performanceMetrics, setPerformanceMetrics] = useState({
    messageLatency: 0,
    connectionUptime: 0,
    messagesPerSecond: 0,
    memoryUsage: 0,
  });

  // Track performance metrics
  useEffect(() => {
    if (connectionStatus === 'connected' && lastConnected) {
      const interval = setInterval(() => {
        setPerformanceMetrics(prev => ({
          ...prev,
          connectionUptime: Date.now() - lastConnected.getTime(),
          memoryUsage: performance.memory ? performance.memory.usedJSHeapSize / 1024 / 1024 : 0,
        }));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [connectionStatus, lastConnected]);

  return {
    connectionStatus,
    reconnectAttempts,
    lastConnected,
    forceReconnect,
    getConnectionStatusInfo,
    isRealTimeEnabled: connectionStatus === 'connected',
    performanceMetrics,
  };
};

export default useRealTimeConnection;
