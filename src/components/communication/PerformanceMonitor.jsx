// src/components/communication/PerformanceMonitor.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  LinearProgress,
  Tooltip,
  IconButton,
  Collapse,
  Grid,
  Alert,
} from '@mui/material';
import {
  Speed,
  Memory,
  NetworkCheck,
  Timeline,
  ExpandMore,
  ExpandLess,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { useRealTimeConnection } from '../../hooks/useRealTimeConnection';
import { useCommunication } from '../../contexts/CommunicationContext';

const PerformanceMonitor = ({ compact = false }) => {
  const { performanceMetrics, connectionStatus } = useRealTimeConnection();
  const { socket } = useCommunication();
  const [expanded, setExpanded] = useState(!compact);
  const [realtimeMetrics, setRealtimeMetrics] = useState({
    messagesSent: 0,
    messagesReceived: 0,
    averageLatency: 0,
    connectionUptime: 0,
  });

  // Track real-time metrics
  useEffect(() => {
    if (!socket) return;

    let messagesSent = 0;
    let messagesReceived = 0;
    let latencySum = 0;
    let latencyCount = 0;

    const startTime = Date.now();

    // Track outgoing messages
    const originalEmit = socket.emit;
    socket.emit = function(...args) {
      messagesSent++;
      const sendTime = Date.now();
      
      // Track latency for acknowledgments
      if (typeof args[args.length - 1] === 'function') {
        const originalCallback = args[args.length - 1];
        args[args.length - 1] = function(...callbackArgs) {
          const latency = Date.now() - sendTime;
          latencySum += latency;
          latencyCount++;
          originalCallback(...callbackArgs);
        };
      }
      
      return originalEmit.apply(this, args);
    };

    // Track incoming messages
    const originalOn = socket.on;
    socket.on = function(event, handler) {
      return originalOn.call(this, event, function(...args) {
        if (event !== 'connect' && event !== 'disconnect') {
          messagesReceived++;
        }
        return handler(...args);
      });
    };

    // Update metrics periodically
    const interval = setInterval(() => {
      setRealtimeMetrics({
        messagesSent,
        messagesReceived,
        averageLatency: latencyCount > 0 ? Math.round(latencySum / latencyCount) : 0,
        connectionUptime: Date.now() - startTime,
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      // Restore original methods
      socket.emit = originalEmit;
      socket.on = originalOn;
    };
  }, [socket]);

  const formatUptime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'success';
      case 'connecting': return 'warning';
      case 'disconnected': return 'error';
      default: return 'default';
    }
  };

  const getPerformanceStatus = () => {
    const { averageLatency } = realtimeMetrics;
    const memoryUsage = performanceMetrics.memoryUsage;
    
    if (averageLatency > 1000 || memoryUsage > 100) {
      return { status: 'warning', message: 'Performance issues detected' };
    }
    if (averageLatency > 500 || memoryUsage > 50) {
      return { status: 'info', message: 'Performance could be improved' };
    }
    return { status: 'success', message: 'Performance is good' };
  };

  const performanceStatus = getPerformanceStatus();

  if (compact) {
    return (
      <Card sx={{ mb: 1 }}>
        <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Speed fontSize="small" />
              <Typography variant="caption">
                Performance
              </Typography>
              <Chip
                size="small"
                label={connectionStatus}
                color={getConnectionStatusColor()}
                variant="outlined"
              />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {realtimeMetrics.averageLatency}ms
              </Typography>
              <IconButton
                size="small"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
          </Box>
          
          <Collapse in={expanded}>
            <Box sx={{ mt: 1 }}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Messages: {realtimeMetrics.messagesSent}↑ {realtimeMetrics.messagesReceived}↓
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Uptime: {formatUptime(realtimeMetrics.connectionUptime)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Speed color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Performance Monitor
          </Typography>
          <Chip
            size="small"
            label={connectionStatus}
            color={getConnectionStatusColor()}
            variant="outlined"
          />
        </Box>

        <Alert 
          severity={performanceStatus.status} 
          sx={{ mb: 2 }}
          icon={performanceStatus.status === 'success' ? <CheckCircle /> : <Warning />}
        >
          {performanceStatus.message}
        </Alert>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <NetworkCheck fontSize="small" />
                <Typography variant="subtitle2">Connection</Typography>
              </Box>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption">Latency</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {realtimeMetrics.averageLatency}ms
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, (realtimeMetrics.averageLatency / 1000) * 100)}
                  color={realtimeMetrics.averageLatency > 500 ? 'warning' : 'success'}
                  sx={{ height: 4, borderRadius: 2 }}
                />
              </Stack>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Memory fontSize="small" />
                <Typography variant="subtitle2">Memory</Typography>
              </Box>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption">Usage</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {formatBytes(performanceMetrics.memoryUsage * 1024 * 1024)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, performanceMetrics.memoryUsage)}
                  color={performanceMetrics.memoryUsage > 50 ? 'warning' : 'success'}
                  sx={{ height: 4, borderRadius: 2 }}
                />
              </Stack>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Timeline fontSize="small" />
                <Typography variant="subtitle2">Messages</Typography>
              </Box>
              <Stack spacing={0.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption">Sent</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {realtimeMetrics.messagesSent}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption">Received</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {realtimeMetrics.messagesReceived}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CheckCircle fontSize="small" />
                <Typography variant="subtitle2">Uptime</Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formatUptime(realtimeMetrics.connectionUptime)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitor;
