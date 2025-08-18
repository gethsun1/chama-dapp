// src/contexts/CommunicationContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { io } from 'socket.io-client';
import { mockSocketServer } from '../services/mockSocketServer';
import { useConnectionPool } from '../hooks/useMessageVirtualization';

const CommunicationContext = createContext();

export const useCommunication = () => {
  const context = useContext(CommunicationContext);
  if (!context) {
    throw new Error('useCommunication must be used within a CommunicationProvider');
  }
  return context;
};

export const CommunicationProvider = ({ children }) => {
  const { isConnected, address } = useAppKitAccount();
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [onlineMembers, setOnlineMembers] = useState(new Set());
  const [messages, setMessages] = useState({});
  const [proposals, setProposals] = useState({});
  const [announcements, setAnnouncements] = useState({});
  const [notifications, setNotifications] = useState([]);

  // Performance optimization refs
  const messageQueueRef = useRef([]);
  const processingTimeoutRef = useRef(null);
  const connectionPoolRef = useRef(new Map());

  // Message batching for performance
  const MESSAGE_BATCH_SIZE = 10;
  const MESSAGE_BATCH_DELAY = 100;

  // Process message queue in batches for better performance
  const processMessageQueue = useCallback(() => {
    if (messageQueueRef.current.length === 0) return;

    const batch = messageQueueRef.current.splice(0, MESSAGE_BATCH_SIZE);

    batch.forEach(({ type, data }) => {
      switch (type) {
        case 'new_message':
          setMessages(prev => ({
            ...prev,
            [data.chamaId]: [...(prev[data.chamaId] || []), data]
          }));
          break;
        case 'new_proposal':
          setProposals(prev => ({
            ...prev,
            [data.chamaId]: [...(prev[data.chamaId] || []), data]
          }));
          break;
        case 'new_announcement':
          setAnnouncements(prev => ({
            ...prev,
            [data.chamaId]: [...(prev[data.chamaId] || []), data]
          }));
          break;
        case 'notification':
          setNotifications(prev => [...prev, {
            ...data,
            id: Date.now() + Math.random(),
            timestamp: new Date()
          }]);
          break;
      }
    });

    // Continue processing if there are more messages
    if (messageQueueRef.current.length > 0) {
      processingTimeoutRef.current = setTimeout(processMessageQueue, MESSAGE_BATCH_DELAY);
    }
  }, []);

  // Add message to queue for batch processing
  const queueMessage = useCallback((type, data) => {
    messageQueueRef.current.push({ type, data });

    if (!processingTimeoutRef.current) {
      processingTimeoutRef.current = setTimeout(processMessageQueue, MESSAGE_BATCH_DELAY);
    }
  }, [processMessageQueue]);

  // Initialize socket connection when wallet is connected
  useEffect(() => {
    if (isConnected && address) {
      // Use mock server for development if no real server is available
      const useMockServer = !process.env.REACT_APP_SOCKET_URL || process.env.NODE_ENV === 'development';

      let newSocket;

      if (useMockServer) {
        // Start mock server and create mock connection
        mockSocketServer.start();
        newSocket = mockSocketServer.connect(address);
        setConnectionStatus('connected');
      } else {
        newSocket = io(process.env.REACT_APP_SOCKET_URL, {
          auth: {
            walletAddress: address,
          },
          transports: ['websocket', 'polling'],
        });
      }

      newSocket.on('connect', () => {
        console.log('Connected to communication server');
        setConnectionStatus('connected');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from communication server');
        setConnectionStatus('disconnected');
      });

      newSocket.on('reconnect', () => {
        console.log('Reconnected to communication server');
        setConnectionStatus('connected');
      });

      // Handle member presence updates
      newSocket.on('member_presence', (data) => {
        setOnlineMembers(new Set(data.onlineMembers));
      });

      // Handle new messages with batching
      newSocket.on('new_message', (message) => {
        queueMessage('new_message', message);
      });

      // Handle new proposals with batching
      newSocket.on('new_proposal', (proposal) => {
        queueMessage('new_proposal', proposal);
      });

      // Handle proposal votes
      newSocket.on('proposal_vote', (voteData) => {
        setProposals(prev => ({
          ...prev,
          [voteData.chamaId]: prev[voteData.chamaId]?.map(proposal =>
            proposal.id === voteData.proposalId
              ? { ...proposal, votes: voteData.votes, hasVoted: voteData.hasVoted }
              : proposal
          ) || []
        }));
      });

      // Handle new announcements with batching
      newSocket.on('new_announcement', (announcement) => {
        queueMessage('new_announcement', announcement);

        // Add to notifications queue
        queueMessage('notification', {
          type: 'announcement',
          title: 'New Announcement',
          message: announcement.title,
          chamaId: announcement.chamaId,
          priority: announcement.priority
        });
      });

      // Handle real-time notifications with batching
      newSocket.on('notification', (notification) => {
        queueMessage('notification', notification);
      });

      // Handle initial chama data when joining a room
      newSocket.on('chama_messages', (messages) => {
        if (Array.isArray(messages) && messages.length > 0) {
          const chamaId = messages[0].chamaId;
          setMessages(prev => ({
            ...prev,
            [chamaId]: messages
          }));
        }
      });

      newSocket.on('chama_proposals', (proposals) => {
        if (Array.isArray(proposals) && proposals.length > 0) {
          const chamaId = proposals[0].chamaId;
          setProposals(prev => ({
            ...prev,
            [chamaId]: proposals
          }));
        }
      });

      newSocket.on('chama_announcements', (announcements) => {
        if (Array.isArray(announcements) && announcements.length > 0) {
          const chamaId = announcements[0].chamaId;
          setAnnouncements(prev => ({
            ...prev,
            [chamaId]: announcements
          }));
        }
      });

      setSocket(newSocket);

      return () => {
        // Cleanup performance optimization timeouts
        if (processingTimeoutRef.current) {
          clearTimeout(processingTimeoutRef.current);
          processingTimeoutRef.current = null;
        }

        // Process any remaining messages in queue
        if (messageQueueRef.current.length > 0) {
          processMessageQueue();
          messageQueueRef.current = [];
        }

        if (useMockServer) {
          mockSocketServer.stop();
        } else {
          newSocket.disconnect();
        }
        setSocket(null);
        setConnectionStatus('disconnected');
      };
    }
  }, [isConnected, address]);

  // Send message function
  const sendMessage = useCallback((chamaId, content, threadId = null) => {
    if (socket && connectionStatus === 'connected') {
      const message = {
        chamaId,
        content,
        threadId,
        sender: address,
        timestamp: new Date().toISOString(),
      };
      socket.emit('send_message', message);
    }
  }, [socket, connectionStatus, address]);

  // Create proposal function
  const createProposal = useCallback((chamaId, title, description, options, deadline) => {
    if (socket && connectionStatus === 'connected') {
      const proposal = {
        chamaId,
        title,
        description,
        options,
        deadline,
        creator: address,
        timestamp: new Date().toISOString(),
      };
      socket.emit('create_proposal', proposal);
    }
  }, [socket, connectionStatus, address]);

  // Vote on proposal function
  const voteOnProposal = useCallback((chamaId, proposalId, optionIndex) => {
    if (socket && connectionStatus === 'connected') {
      socket.emit('vote_proposal', {
        chamaId,
        proposalId,
        optionIndex,
        voter: address,
      });
    }
  }, [socket, connectionStatus, address]);

  // Create announcement function
  const createAnnouncement = useCallback((chamaId, title, content, priority = 'normal') => {
    if (socket && connectionStatus === 'connected') {
      const announcement = {
        chamaId,
        title,
        content,
        priority,
        creator: address,
        timestamp: new Date().toISOString(),
      };
      socket.emit('create_announcement', announcement);
    }
  }, [socket, connectionStatus, address]);

  // Join chama room function
  const joinChamaRoom = useCallback((chamaId) => {
    if (socket && connectionStatus === 'connected') {
      socket.emit('join_chama', { chamaId, walletAddress: address });
    }
  }, [socket, connectionStatus, address]);

  // Leave chama room function
  const leaveChamaRoom = useCallback((chamaId) => {
    if (socket && connectionStatus === 'connected') {
      socket.emit('leave_chama', { chamaId, walletAddress: address });
    }
  }, [socket, connectionStatus, address]);

  // Mark notification as read
  const markNotificationAsRead = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    socket,
    connectionStatus,
    onlineMembers,
    messages,
    proposals,
    announcements,
    notifications,
    sendMessage,
    createProposal,
    voteOnProposal,
    createAnnouncement,
    joinChamaRoom,
    leaveChamaRoom,
    markNotificationAsRead,
    clearAllNotifications,
  };

  return (
    <CommunicationContext.Provider value={value}>
      {children}
    </CommunicationContext.Provider>
  );
};
