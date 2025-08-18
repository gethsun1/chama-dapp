// src/components/communication/NotificationCenter.jsx
import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Typography,
  Button,
  Divider,
  Chip,
  Stack,
  Paper,
  Tooltip,
  useTheme,
  useMediaQuery,
  Drawer,
  AppBar,
  Toolbar,
  SwipeableDrawer,
} from '@mui/material';
import {
  Notifications,
  NotificationsNone,
  Close,
  Campaign,
  HowToVote,
  Chat,
  Event,
  Assignment,
  Circle,
  CheckCircle,
  Clear,
} from '@mui/icons-material';
import { useCommunication } from '../../contexts/CommunicationContext';
import { formatDistanceToNow } from 'date-fns';
import { useAccessibility, useListNavigation } from '../../hooks/useAccessibility';

const NotificationCenter = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { notifications, markNotificationAsRead, clearAllNotifications } = useCommunication();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Accessibility features
  const {
    announce,
    isHighContrast,
    getHighContrastStyles,
    AriaLiveRegion,
    generateId,
    focusElement
  } = useAccessibility();

  // List navigation for notifications
  const { focusedIndex, setFocus, handleKeyDown, isItemFocused } = useListNavigation(
    notifications,
    {
      onSelect: (notification) => markNotificationAsRead(notification.id),
      announceNavigation: true,
    }
  );

  const handleClick = (event) => {
    if (isMobile) {
      setMobileDrawerOpen(true);
      announce(`Opening notifications panel. ${unreadCount} unread notifications.`);
    } else {
      setAnchorEl(event.currentTarget);
      announce(`Notifications panel opened. ${unreadCount} unread notifications.`);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMobileDrawerOpen(false);
    announce('Notifications panel closed.');
  };

  const handleMarkAsRead = (notificationId) => {
    markNotificationAsRead(notificationId);
    announce('Notification marked as read.');
  };

  const handleClearAll = () => {
    clearAllNotifications();
    announce('All notifications cleared.');
  };

  const open = Boolean(anchorEl);
  const unreadCount = notifications.length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'announcement':
        return <Campaign color="primary" />;
      case 'proposal':
        return <HowToVote color="secondary" />;
      case 'message':
        return <Chat color="info" />;
      case 'event':
        return <Event color="warning" />;
      case 'task':
        return <Assignment color="success" />;
      default:
        return <Circle color="action" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const NotificationItem = ({ notification, index }) => (
    <ListItem
      sx={{
        borderLeft: 3,
        borderColor: `${getPriorityColor(notification.priority)}.main`,
        bgcolor: 'background.paper',
        py: isMobile ? 2 : 1.5,
        px: isMobile ? 2 : 1,
        '&:hover': {
          bgcolor: 'action.hover',
        },
        '&:active': isMobile ? {
          bgcolor: 'action.selected',
          transform: 'scale(0.98)',
          transition: 'all 0.1s ease-in-out',
        } : {},
        '&:focus': {
          bgcolor: 'action.selected',
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: '-2px',
        },
        ...getHighContrastStyles(),
      }}
      role="button"
      tabIndex={0}
      aria-label={`Notification: ${notification.title}. ${notification.message}. ${formatDistanceToNow(notification.timestamp, { addSuffix: true })}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleMarkAsRead(notification.id);
        }
      }}
    >
      <ListItemAvatar>
        <Avatar
          sx={{
            bgcolor: 'background.default',
            width: isMobile ? 40 : 32,
            height: isMobile ? 40 : 32,
          }}
        >
          {getNotificationIcon(notification.type)}
        </Avatar>
      </ListItemAvatar>

      <ListItemText
        primary={
          <Box
            sx={{
              display: 'flex',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: 1,
              flexDirection: isMobile ? 'column' : 'row',
            }}
          >
            <Typography
              variant={isMobile ? "body1" : "subtitle2"}
              sx={{
                fontWeight: 600,
                fontSize: isMobile ? '1rem' : '0.875rem',
                lineHeight: isMobile ? 1.3 : 1.2,
              }}
            >
              {notification.title}
            </Typography>
            {notification.priority && notification.priority !== 'normal' && (
              <Chip
                label={notification.priority}
                size={isMobile ? "medium" : "small"}
                color={getPriorityColor(notification.priority)}
                variant="outlined"
                sx={{
                  fontSize: isMobile ? '0.75rem' : '0.6875rem',
                  height: isMobile ? 28 : 24,
                  alignSelf: isMobile ? 'flex-start' : 'center',
                }}
              />
            )}
          </Box>
        }
        secondary={
          <Box sx={{ mt: isMobile ? 1 : 0.5 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 0.5,
                fontSize: isMobile ? '0.875rem' : '0.75rem',
                lineHeight: isMobile ? 1.4 : 1.3,
              }}
            >
              {notification.message}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontSize: isMobile ? '0.75rem' : '0.6875rem',
              }}
            >
              {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
              {notification.chamaId && ` • Chama ${notification.chamaId}`}
            </Typography>
          </Box>
        }
      />

      <ListItemSecondaryAction>
        <Tooltip title="Mark as read">
          <IconButton
            edge="end"
            size={isMobile ? "medium" : "small"}
            onClick={() => handleMarkAsRead(notification.id)}
            aria-label={`Mark notification "${notification.title}" as read`}
            sx={{
              '&:active': isMobile ? {
                transform: 'scale(0.9)',
              } : {},
              '&:focus': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: '2px',
              },
            }}
          >
            <Close fontSize={isMobile ? "medium" : "small"} />
          </IconButton>
        </Tooltip>
      </ListItemSecondaryAction>
    </ListItem>
  );

  return (
    <>
      <AriaLiveRegion />
      <Tooltip title={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}>
        <IconButton
          onClick={handleClick}
          color="inherit"
          size={isMobile ? "large" : "medium"}
          aria-label={`Notifications${unreadCount > 0 ? `. ${unreadCount} unread notifications` : '. No unread notifications'}`}
          aria-expanded={open || mobileDrawerOpen}
          aria-haspopup="true"
          sx={{
            '&:hover': {
              bgcolor: 'action.hover',
            },
            '&:active': isMobile ? {
              transform: 'scale(0.9)',
              transition: 'transform 0.1s ease-in-out',
            } : {},
            '&:focus': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: '2px',
            },
            p: isMobile ? 1.5 : 1,
            ...getHighContrastStyles(),
          }}
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            max={99}
            sx={{
              '& .MuiBadge-badge': {
                fontSize: isMobile ? '0.75rem' : '0.6875rem',
                minWidth: isMobile ? 20 : 16,
                height: isMobile ? 20 : 16,
              },
            }}
          >
            {unreadCount > 0 ?
              <Notifications fontSize={isMobile ? "medium" : "default"} /> :
              <NotificationsNone fontSize={isMobile ? "medium" : "default"} />
            }
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Mobile Drawer */}
      {isMobile ? (
        <SwipeableDrawer
          anchor="right"
          open={mobileDrawerOpen}
          onClose={handleClose}
          onOpen={() => setMobileDrawerOpen(true)}
          disableSwipeToOpen
          PaperProps={{
            sx: {
              width: '100vw',
              maxWidth: 400,
              height: '100vh',
            },
          }}
        >
          {/* Mobile Header */}
          <AppBar position="static" elevation={0} color="default">
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
                Notifications
              </Typography>
              <IconButton
                edge="end"
                onClick={handleClose}
                sx={{
                  '&:active': {
                    transform: 'scale(0.9)',
                  },
                }}
              >
                <Close />
              </IconButton>
            </Toolbar>
          </AppBar>

          {/* Mobile Content */}
          <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {unreadCount > 0 && (
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body1" color="text.secondary">
                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </Typography>
                  <Button
                    size="medium"
                    onClick={handleClearAll}
                    startIcon={<CheckCircle />}
                    aria-label={`Clear all ${unreadCount} notifications`}
                    sx={{
                      '&:active': {
                        transform: 'scale(0.95)',
                      },
                      '&:focus': {
                        outline: '2px solid',
                        outlineColor: 'primary.main',
                        outlineOffset: '2px',
                      },
                    }}
                  >
                    Clear All
                  </Button>
                </Box>
              </Box>
            )}

            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {notifications.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center', mt: 4 }}>
                  <NotificationsNone sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Notifications
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    You're all caught up! New notifications will appear here.
                  </Typography>
                </Box>
              ) : (
                <List
                  sx={{ p: 0 }}
                  role="list"
                  aria-label="Notifications list"
                  onKeyDown={handleKeyDown}
                >
                  {notifications
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .map((notification, index) => (
                      <React.Fragment key={notification.id}>
                        <NotificationItem
                          notification={notification}
                          index={index}
                        />
                        {index < notifications.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                </List>
              )}
            </Box>

            {notifications.length > 0 && (
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Notifications are automatically cleared after being read
                </Typography>
              </Box>
            )}
          </Box>
        </SwipeableDrawer>
      ) : (
        /* Desktop Popover */
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              width: 400,
              maxWidth: '90vw',
              maxHeight: 500,
              overflow: 'hidden',
            },
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Notifications
              </Typography>
              {unreadCount > 0 && (
                <Button
                  size="small"
                  onClick={handleClearAll}
                  startIcon={<CheckCircle />}
                  aria-label={`Clear all ${unreadCount} notifications`}
                  sx={{
                    '&:focus': {
                      outline: '2px solid',
                      outlineColor: 'primary.main',
                      outlineOffset: '2px',
                    },
                  }}
                >
                  Clear All
                </Button>
              )}
            </Box>
            {unreadCount > 0 && (
              <Typography variant="body2" color="text.secondary">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </Typography>
            )}
          </Box>

          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {notifications.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <NotificationsNone sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Notifications
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You're all caught up! New notifications will appear here.
                </Typography>
              </Box>
            ) : (
              <List
                sx={{ p: 0 }}
                role="list"
                aria-label="Notifications list"
                onKeyDown={handleKeyDown}
              >
                {notifications
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .map((notification, index) => (
                    <React.Fragment key={notification.id}>
                      <NotificationItem
                        notification={notification}
                        index={index}
                      />
                      {index < notifications.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
              </List>
            )}
          </Box>

          {notifications.length > 0 && (
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Notifications are automatically cleared after being read
              </Typography>
            </Box>
          )}
        </Popover>
      )}
    </>
  );
};

export default NotificationCenter;
