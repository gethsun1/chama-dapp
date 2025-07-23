// src/components/communication/CommunicationHubTest.jsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  Stack,
} from '@mui/material';
import { Chat, CheckCircle, Error } from '@mui/icons-material';
import CommunicationHub from './CommunicationHub';
import { useCommunication } from '../../contexts/CommunicationContext';
import { useAppKitAccount } from '@reown/appkit/react';

const CommunicationHubTest = () => {
  const [hubOpen, setHubOpen] = useState(false);
  const [testResults, setTestResults] = useState({});
  const [integrationTests, setIntegrationTests] = useState({});
  const { address } = useAppKitAccount();
  const {
    connectionStatus,
    socket,
    sendMessage,
    createProposal,
    createAnnouncement,
    joinChamaRoom,
    messages,
    proposals,
    announcements
  } = useCommunication();

  const testChamaData = {
    id: 'test-chama-1',
    name: 'Test Chama for Communication',
    members: [address],
    creator: address
  };

  const runTests = () => {
    const results = {};

    // Test 1: Communication Context
    results.contextLoaded = !!useCommunication;

    // Test 2: Socket Connection
    results.socketExists = !!socket;
    results.connectionStatus = connectionStatus;

    // Test 3: Address Available
    results.addressAvailable = !!address;

    // Test 4: Functions Available
    results.sendMessageAvailable = typeof sendMessage === 'function';
    results.createProposalAvailable = typeof createProposal === 'function';
    results.createAnnouncementAvailable = typeof createAnnouncement === 'function';

    setTestResults(results);
  };

  const runIntegrationTests = async () => {
    const results = {};
    const testChamaId = testChamaData.id;

    try {
      // Test 1: Join Chama Room
      joinChamaRoom(testChamaId);
      results.joinRoom = true;

      // Test 2: Send Test Message
      sendMessage(testChamaId, 'Test message from integration test');
      results.sendMessage = true;

      // Test 3: Create Test Proposal
      createProposal(
        testChamaId,
        'Test Proposal',
        'This is a test proposal for integration testing',
        ['Option A', 'Option B'],
        new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      );
      results.createProposal = true;

      // Test 4: Create Test Announcement
      createAnnouncement(testChamaId, 'Test Announcement', 'This is a test announcement', 'normal');
      results.createAnnouncement = true;

      // Wait a bit for async operations
      setTimeout(() => {
        // Test 5: Check if data was stored
        results.messagesStored = messages[testChamaId]?.length > 0;
        results.proposalsStored = proposals[testChamaId]?.length > 0;
        results.announcementsStored = announcements[testChamaId]?.length > 0;

        setIntegrationTests(results);
      }, 1000);

    } catch (error) {
      console.error('Integration test error:', error);
      results.error = error.message;
      setIntegrationTests(results);
    }
  };

  const TestResult = ({ label, success, details }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      {success ? (
        <CheckCircle color="success" />
      ) : (
        <Error color="error" />
      )}
      <Typography variant="body2">
        {label}: {details}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Communication Hub Test
      </Typography>
      
      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Status
            </Typography>
            <Button 
              variant="outlined" 
              onClick={runTests}
              sx={{ mb: 2 }}
            >
              Run Tests
            </Button>
            
            {Object.keys(testResults).length > 0 && (
              <Box>
                <TestResult 
                  label="Communication Context"
                  success={testResults.contextLoaded}
                  details={testResults.contextLoaded ? "Loaded" : "Failed"}
                />
                <TestResult 
                  label="Socket"
                  success={testResults.socketExists}
                  details={testResults.socketExists ? "Available" : "Not Available"}
                />
                <TestResult 
                  label="Connection Status"
                  success={testResults.connectionStatus === 'connected'}
                  details={testResults.connectionStatus}
                />
                <TestResult
                  label="Wallet Address"
                  success={testResults.addressAvailable}
                  details={testResults.addressAvailable ? "Connected" : "Not Connected"}
                />
                <TestResult
                  label="Send Message Function"
                  success={testResults.sendMessageAvailable}
                  details={testResults.sendMessageAvailable ? "Available" : "Not Available"}
                />
                <TestResult
                  label="Create Proposal Function"
                  success={testResults.createProposalAvailable}
                  details={testResults.createProposalAvailable ? "Available" : "Not Available"}
                />
                <TestResult
                  label="Create Announcement Function"
                  success={testResults.createAnnouncementAvailable}
                  details={testResults.createAnnouncementAvailable ? "Available" : "Not Available"}
                />
              </Box>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Integration Tests
            </Typography>
            <Button
              variant="outlined"
              onClick={runIntegrationTests}
              sx={{ mb: 2 }}
              disabled={connectionStatus !== 'connected'}
            >
              Run Integration Tests
            </Button>

            {Object.keys(integrationTests).length > 0 && (
              <Box>
                <TestResult
                  label="Join Chama Room"
                  success={integrationTests.joinRoom}
                  details={integrationTests.joinRoom ? "Success" : "Failed"}
                />
                <TestResult
                  label="Send Message"
                  success={integrationTests.sendMessage}
                  details={integrationTests.sendMessage ? "Success" : "Failed"}
                />
                <TestResult
                  label="Create Proposal"
                  success={integrationTests.createProposal}
                  details={integrationTests.createProposal ? "Success" : "Failed"}
                />
                <TestResult
                  label="Create Announcement"
                  success={integrationTests.createAnnouncement}
                  details={integrationTests.createAnnouncement ? "Success" : "Failed"}
                />
                <TestResult
                  label="Messages Stored"
                  success={integrationTests.messagesStored}
                  details={integrationTests.messagesStored ? "Success" : "Failed"}
                />
                <TestResult
                  label="Proposals Stored"
                  success={integrationTests.proposalsStored}
                  details={integrationTests.proposalsStored ? "Success" : "Failed"}
                />
                <TestResult
                  label="Announcements Stored"
                  success={integrationTests.announcementsStored}
                  details={integrationTests.announcementsStored ? "Success" : "Failed"}
                />
                {integrationTests.error && (
                  <TestResult
                    label="Error"
                    success={false}
                    details={integrationTests.error}
                  />
                )}
              </Box>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Communication Hub Test
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Click the button below to test the communication hub functionality.
            </Typography>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<Chat />}
              onClick={() => setHubOpen(true)}
              sx={{ mb: 2 }}
            >
              Open Communication Hub
            </Button>
            
            {hubOpen && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Communication Hub should be open now. Check if the drawer appears on the right side.
              </Alert>
            )}
          </CardContent>
        </Card>
      </Stack>

      {/* Communication Hub */}
      <CommunicationHub
        chamaId={testChamaData.id}
        chamaName={testChamaData.name}
        members={testChamaData.members}
        isCreator={true}
        open={hubOpen}
        onClose={() => setHubOpen(false)}
        variant="drawer"
      />
    </Box>
  );
};

export default CommunicationHubTest;
