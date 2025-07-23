// src/services/mockSocketServer.js
// Mock WebSocket server for development and testing
// This simulates real-time functionality when a backend server is not available

class MockSocketServer {
  constructor() {
    this.connections = new Map();
    this.chamaRooms = new Map();
    this.messages = new Map();
    this.proposals = new Map();
    this.announcements = new Map();
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('Mock Socket Server started for development');
    
    // Simulate some initial data
    this.seedMockData();
  }

  stop() {
    this.isRunning = false;
    this.connections.clear();
    this.chamaRooms.clear();
    console.log('Mock Socket Server stopped');
  }

  seedMockData() {
    // Seed some mock messages for testing
    const mockMessages = [
      {
        id: '1',
        chamaId: '1',
        content: 'Welcome to the Chama communication hub!',
        sender: '0x1234...5678',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        threadId: null
      },
      {
        id: '2',
        chamaId: '1',
        content: 'Great to see everyone here. Looking forward to our savings journey!',
        sender: '0x8765...4321',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        threadId: null
      }
    ];

    // Seed mock proposals
    const mockProposals = [
      {
        id: '1',
        chamaId: '1',
        title: 'Increase Monthly Contribution',
        description: 'Should we increase our monthly contribution from 0.1 ETH to 0.15 ETH?',
        options: ['Yes, increase to 0.15 ETH', 'No, keep at 0.1 ETH', 'Increase to 0.12 ETH'],
        deadline: new Date(Date.now() + 7 * 24 * 3600000).toISOString(),
        creator: '0x1234...5678',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        votes: { 0: 2, 1: 1, 2: 0 },
        hasVoted: false
      }
    ];

    // Seed mock announcements
    const mockAnnouncements = [
      {
        id: '1',
        chamaId: '1',
        title: 'Next Payout Scheduled',
        content: 'The next payout is scheduled for this Friday. Please ensure your contributions are up to date.',
        priority: 'high',
        creator: '0x1234...5678',
        timestamp: new Date(Date.now() - 43200000).toISOString(),
        readBy: []
      }
    ];

    this.messages.set('1', mockMessages);
    this.proposals.set('1', mockProposals);
    this.announcements.set('1', mockAnnouncements);
  }

  // Simulate socket connection
  connect(walletAddress) {
    const connectionId = `conn_${Date.now()}_${Math.random()}`;
    this.connections.set(connectionId, {
      walletAddress,
      connectedAt: new Date(),
      rooms: new Set()
    });
    
    return {
      id: connectionId,
      emit: this.createEmitFunction(connectionId),
      on: this.createOnFunction(connectionId),
      disconnect: () => this.disconnect(connectionId)
    };
  }

  disconnect(connectionId) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      // Leave all rooms
      connection.rooms.forEach(room => {
        this.leaveRoom(connectionId, room);
      });
      this.connections.delete(connectionId);
    }
  }

  createEmitFunction(connectionId) {
    return (event, data) => {
      switch (event) {
        case 'join_chama':
          this.joinRoom(connectionId, `chama_${data.chamaId}`);
          break;
        case 'leave_chama':
          this.leaveRoom(connectionId, `chama_${data.chamaId}`);
          break;
        case 'send_message':
          this.handleMessage(connectionId, data);
          break;
        case 'create_proposal':
          this.handleProposal(connectionId, data);
          break;
        case 'vote_proposal':
          this.handleVote(connectionId, data);
          break;
        case 'create_announcement':
          this.handleAnnouncement(connectionId, data);
          break;
      }
    };
  }

  createOnFunction(connectionId) {
    return (event, callback) => {
      // Store event listeners (simplified for mock)
      const connection = this.connections.get(connectionId);
      if (connection) {
        if (!connection.listeners) connection.listeners = new Map();
        connection.listeners.set(event, callback);
      }
    };
  }

  joinRoom(connectionId, roomId) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.rooms.add(roomId);
      if (!this.chamaRooms.has(roomId)) {
        this.chamaRooms.set(roomId, new Set());
      }
      this.chamaRooms.get(roomId).add(connectionId);
      
      // Send existing data to the newly joined member
      const chamaId = roomId.replace('chama_', '');
      this.sendToConnection(connectionId, 'chama_messages', this.messages.get(chamaId) || []);
      this.sendToConnection(connectionId, 'chama_proposals', this.proposals.get(chamaId) || []);
      this.sendToConnection(connectionId, 'chama_announcements', this.announcements.get(chamaId) || []);
    }
  }

  leaveRoom(connectionId, roomId) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.rooms.delete(roomId);
      const room = this.chamaRooms.get(roomId);
      if (room) {
        room.delete(connectionId);
      }
    }
  }

  handleMessage(connectionId, messageData) {
    const message = {
      ...messageData,
      id: `msg_${Date.now()}_${Math.random()}`,
      timestamp: new Date().toISOString()
    };

    // Store message
    const chamaMessages = this.messages.get(messageData.chamaId) || [];
    chamaMessages.push(message);
    this.messages.set(messageData.chamaId, chamaMessages);

    // Broadcast to room
    this.broadcastToRoom(`chama_${messageData.chamaId}`, 'new_message', message);
  }

  handleProposal(connectionId, proposalData) {
    const proposal = {
      ...proposalData,
      id: `prop_${Date.now()}_${Math.random()}`,
      votes: {},
      hasVoted: false
    };

    // Store proposal
    const chamaProposals = this.proposals.get(proposalData.chamaId) || [];
    chamaProposals.push(proposal);
    this.proposals.set(proposalData.chamaId, chamaProposals);

    // Broadcast to room
    this.broadcastToRoom(`chama_${proposalData.chamaId}`, 'new_proposal', proposal);
  }

  handleVote(connectionId, voteData) {
    const chamaProposals = this.proposals.get(voteData.chamaId) || [];
    const proposal = chamaProposals.find(p => p.id === voteData.proposalId);
    
    if (proposal) {
      if (!proposal.votes) proposal.votes = {};
      proposal.votes[voteData.optionIndex] = (proposal.votes[voteData.optionIndex] || 0) + 1;
      proposal.hasVoted = true;

      // Broadcast vote update
      this.broadcastToRoom(`chama_${voteData.chamaId}`, 'proposal_vote', {
        chamaId: voteData.chamaId,
        proposalId: voteData.proposalId,
        votes: proposal.votes,
        hasVoted: true
      });
    }
  }

  handleAnnouncement(connectionId, announcementData) {
    const announcement = {
      ...announcementData,
      id: `ann_${Date.now()}_${Math.random()}`,
      readBy: []
    };

    // Store announcement
    const chamaAnnouncements = this.announcements.get(announcementData.chamaId) || [];
    chamaAnnouncements.push(announcement);
    this.announcements.set(announcementData.chamaId, chamaAnnouncements);

    // Broadcast to room
    this.broadcastToRoom(`chama_${announcementData.chamaId}`, 'new_announcement', announcement);
  }

  broadcastToRoom(roomId, event, data) {
    const room = this.chamaRooms.get(roomId);
    if (room) {
      room.forEach(connectionId => {
        this.sendToConnection(connectionId, event, data);
      });
    }
  }

  sendToConnection(connectionId, event, data) {
    const connection = this.connections.get(connectionId);
    if (connection && connection.listeners) {
      const callback = connection.listeners.get(event);
      if (callback) {
        // Simulate async delivery
        setTimeout(() => callback(data), 10);
      }
    }
  }
}

// Export singleton instance
export const mockSocketServer = new MockSocketServer();
export default mockSocketServer;
