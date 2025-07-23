// src/components/communication/CommunicationHub.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Badge,
  IconButton,
  Tooltip,
  Fab,
  Drawer,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
  Chip,
  Stack,
  Alert,
  Collapse,
} from '@mui/material';
import {
  Chat,
  HowToVote,
  Campaign,
  Group,
  Close,
  Refresh,
  Settings,
  Notifications,
  SignalWifiOff,
  SignalWifi4Bar,
} from '@mui/icons-material';
import { useAppKitAccount } from '@reown/appkit/react';
import { useCommunication } from '../../contexts/CommunicationContext';
import useRealTimeConnection from '../../hooks/useRealTimeConnection';
import ChatInterface from './ChatInterface';
import ProposalVoting from './ProposalVoting';
import AnnouncementSystem from './AnnouncementSystem';
import MemberCoordination from './MemberCoordination';

const CommunicationHub = ({ 
  chamaId, 
  chamaName, 
  members = [], 
  isCreator = false,
  open = false,
  onClose = () => {},
  variant = 'drawer' // 'drawer' or 'embedded'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { address } = useAppKitAccount();
  const { 
    messages, 
    proposals, 
    announcements, 
    notifications,
    connectionStatus,
    clearAllNotifications 
  } = useCommunication();
  const { 
    isRealTimeEnabled, 
    getConnectionStatusInfo, 
    forceReconnect 
  } = useRealTimeConnection();

  const [activeTab, setActiveTab] = useState(0);
  const [showConnectionAlert, setShowConnectionAlert] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Touch/swipe handling for mobile navigation
  const minSwipeDistance = 50;

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && activeTab < 3) {
      setActiveTab(activeTab + 1);
      setSwipeDirection('left');
    }
    if (isRightSwipe && activeTab > 0) {
      setActiveTab(activeTab - 1);
      setSwipeDirection('right');
    }

    // Reset swipe direction after animation
    setTimeout(() => setSwipeDirection(null), 300);
  };

  // Show connection alert when disconnected
  useEffect(() => {
    setShowConnectionAlert(connectionStatus === 'disconnected');
  }, [connectionStatus]);

  // Count unread items
  const unreadCounts = {
    chat: messages[chamaId]?.filter(m => m.sender !== address && !m.read).length || 0,
    proposals: proposals[chamaId]?.filter(p => !p.hasVoted && p.creator !== address).length || 0,
    announcements: announcements[chamaId]?.filter(a => !a.readBy?.includes(address)).length || 0,
    coordination: 0, // Would be calculated based on pending tasks/events
  };

  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  const connectionInfo = getConnectionStatusInfo();

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`communication-tabpanel-${index}`}
      aria-labelledby={`communication-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ height: '100%', overflow: 'hidden' }}>
          {children}
        </Box>
      )}
    </div>
  );

  const CommunicationContent = () => (
    <Box sx={{ 
      height: variant === 'drawer' ? '100vh' : '600px',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.default'
    }}>
      {/* Header */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {chamaName} Communication Hub
          </Typography>
          
          <Stack direction="row" spacing={1} alignItems="center">
            {/* Connection Status */}
            <Tooltip title={connectionInfo.message}>
              <Chip
                icon={isRealTimeEnabled ? <SignalWifi4Bar /> : <SignalWifiOff />}
                label={connectionInfo.status}
                size="small"
                color={connectionInfo.color}
                variant="outlined"
              />
            </Tooltip>

            {/* Notifications */}
            <Tooltip title="Clear notifications">
              <IconButton 
                onClick={clearAllNotifications}
                disabled={notifications.length === 0}
              >
                <Badge badgeContent={notifications.length} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Refresh */}
            <Tooltip title="Reconnect">
              <IconButton onClick={forceReconnect} disabled={isRealTimeEnabled}>
                <Refresh />
              </IconButton>
            </Tooltip>

            {/* Close (for drawer variant) */}
            {variant === 'drawer' && (
              <IconButton onClick={onClose}>
                <Close />
              </IconButton>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Connection Alert */}
      <Collapse in={showConnectionAlert}>
        <Alert 
          severity="warning" 
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setShowConnectionAlert(false)}
            >
              <Close fontSize="inherit" />
            </IconButton>
          }
        >
          Real-time features are currently unavailable. Some functionality may be limited.
        </Alert>
      </Collapse>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons={isMobile ? "auto" : false}
          allowScrollButtonsMobile={isMobile}
          sx={{
            '& .MuiTab-root': {
              minHeight: isMobile ? 56 : 64,
              textTransform: 'none',
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              fontWeight: 500,
              minWidth: isMobile ? 80 : 'auto',
              padding: isMobile ? '8px 12px' : '12px 16px',
            },
            '& .MuiTabs-flexContainer': {
              justifyContent: isMobile ? 'flex-start' : 'space-around',
            },
            '& .MuiTabs-scrollButtons': {
              '&.Mui-disabled': {
                opacity: 0.3,
              },
            },
          }}
        >
          <Tab 
            icon={
              <Badge badgeContent={unreadCounts.chat} color="error">
                <Chat />
              </Badge>
            }
            label="Chat"
            id="communication-tab-0"
            aria-controls="communication-tabpanel-0"
          />
          <Tab 
            icon={
              <Badge badgeContent={unreadCounts.proposals} color="error">
                <HowToVote />
              </Badge>
            }
            label="Proposals"
            id="communication-tab-1"
            aria-controls="communication-tabpanel-1"
          />
          <Tab 
            icon={
              <Badge badgeContent={unreadCounts.announcements} color="error">
                <Campaign />
              </Badge>
            }
            label="Announcements"
            id="communication-tab-2"
            aria-controls="communication-tabpanel-2"
          />
          <Tab 
            icon={
              <Badge badgeContent={unreadCounts.coordination} color="error">
                <Group />
              </Badge>
            }
            label="Coordination"
            id="communication-tab-3"
            aria-controls="communication-tabpanel-3"
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          p: isMobile ? 1 : 2,
          position: 'relative',
        }}
        onTouchStart={isMobile ? handleTouchStart : undefined}
        onTouchMove={isMobile ? handleTouchMove : undefined}
        onTouchEnd={isMobile ? handleTouchEnd : undefined}
      >
        <TabPanel value={activeTab} index={0}>
          <ChatInterface 
            chamaId={chamaId}
            chamaName={chamaName}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <ProposalVoting 
            chamaId={chamaId}
            chamaName={chamaName}
            isCreator={isCreator}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <AnnouncementSystem 
            chamaId={chamaId}
            chamaName={chamaName}
            isCreator={isCreator}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <MemberCoordination 
            chamaId={chamaId}
            chamaName={chamaName}
            members={members}
            isCreator={isCreator}
          />
        </TabPanel>
      </Box>
    </Box>
  );

  if (variant === 'embedded') {
    return (
      <Card sx={{ height: '600px' }}>
        <CommunicationContent />
      </Card>
    );
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isMobile ? '100vw' : '800px',
          maxWidth: '100vw',
        },
      }}
    >
      <CommunicationContent />
    </Drawer>
  );
};

// Floating Action Button for opening the communication hub
export const CommunicationFab = ({ 
  chamaId, 
  chamaName, 
  members = [], 
  isCreator = false 
}) => {
  const [open, setOpen] = useState(false);
  const { notifications } = useCommunication();
  
  const unreadCount = notifications.filter(n => n.chamaId === chamaId).length;

  return (
    <>
      <Fab
        color="primary"
        aria-label="communication hub"
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <Chat />
        </Badge>
      </Fab>

      <CommunicationHub
        chamaId={chamaId}
        chamaName={chamaName}
        members={members}
        isCreator={isCreator}
        open={open}
        onClose={() => setOpen(false)}
        variant="drawer"
      />
    </>
  );
};

export default CommunicationHub;
