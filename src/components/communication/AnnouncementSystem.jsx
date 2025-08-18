// src/components/communication/AnnouncementSystem.jsx
import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Paper,
  Alert,
  Divider,
  Badge,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add,
  Campaign,
  PriorityHigh,
  Info,
  Warning,
  Error,
  CheckCircle,
  Visibility,
  VisibilityOff,
  Schedule,
  Person,
} from '@mui/icons-material';
import { useAppKitAccount } from '@reown/appkit/react';
import { useCommunication } from '../../contexts/CommunicationContext';
import { formatDistanceToNow } from 'date-fns';
import { useAccessibility, useListNavigation } from '../../hooks/useAccessibility';

const AnnouncementSystem = ({ chamaId, chamaName, isCreator = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { address } = useAppKitAccount();
  const { announcements, createAnnouncement } = useCommunication();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    priority: 'normal',
  });

  // Accessibility features
  const {
    announce,
    isHighContrast,
    getHighContrastStyles,
    AriaLiveRegion,
    generateId,
    focusElement,
    trapFocus
  } = useAccessibility();

  // Refs for focus management
  const createDialogRef = useRef(null);
  const viewDialogRef = useRef(null);
  const announcementListRef = useRef(null);

  const chamaAnnouncements = announcements[chamaId] || [];

  // List navigation for announcements
  const { focusedIndex, setFocus, handleKeyDown, isItemFocused } = useListNavigation(
    chamaAnnouncements,
    {
      onSelect: (announcement) => {
        setSelectedAnnouncement(announcement);
        setViewDialogOpen(true);
        announce(`Opening announcement: ${announcement.title}`);
      },
      announceNavigation: true,
    }
  );

  const handleCreateAnnouncement = useCallback(() => {
    if (newAnnouncement.title.trim() && newAnnouncement.content.trim()) {
      createAnnouncement(
        chamaId,
        newAnnouncement.title.trim(),
        newAnnouncement.content.trim(),
        newAnnouncement.priority
      );

      // Announce success
      announce(`Announcement "${newAnnouncement.title.trim()}" created successfully`);

      setNewAnnouncement({
        title: '',
        content: '',
        priority: 'normal',
      });
      setCreateDialogOpen(false);
    }
  }, [newAnnouncement, chamaId, createAnnouncement, announce]);

  const handleOpenCreateDialog = useCallback(() => {
    setCreateDialogOpen(true);
    announce('Opening create announcement dialog');
  }, [announce]);

  const handleCloseCreateDialog = useCallback(() => {
    setCreateDialogOpen(false);
    announce('Create announcement dialog closed');
  }, [announce]);

  const handleOpenViewDialog = useCallback((announcement) => {
    setSelectedAnnouncement(announcement);
    setViewDialogOpen(true);
    announce(`Opening announcement: ${announcement.title}`);
  }, [announce]);

  const handleCloseViewDialog = useCallback(() => {
    setViewDialogOpen(false);
    setSelectedAnnouncement(null);
    announce('Announcement view closed');
  }, [announce]);

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'high':
        return {
          color: 'error',
          icon: PriorityHigh,
          label: 'High Priority',
          bgcolor: 'error.light',
          textColor: 'error.contrastText',
        };
      case 'medium':
        return {
          color: 'warning',
          icon: Warning,
          label: 'Medium Priority',
          bgcolor: 'warning.light',
          textColor: 'warning.contrastText',
        };
      case 'low':
        return {
          color: 'info',
          icon: Info,
          label: 'Low Priority',
          bgcolor: 'info.light',
          textColor: 'info.contrastText',
        };
      default:
        return {
          color: 'primary',
          icon: Campaign,
          label: 'Normal',
          bgcolor: 'primary.light',
          textColor: 'primary.contrastText',
        };
    }
  };

  const AnnouncementCard = ({ announcement, index }) => {
    const priorityConfig = getPriorityConfig(announcement.priority);
    const PriorityIcon = priorityConfig.icon;
    const isUnread = !announcement.readBy?.includes(address);
    const isFocused = isItemFocused(index);
    const cardId = generateId(`announcement-${announcement.id}`);

    return (
      <Card
        id={cardId}
        role="article"
        tabIndex={0}
        aria-label={`${announcement.title}. ${priorityConfig.label}. ${isUnread ? 'Unread. ' : ''}Posted ${formatDistanceToNow(new Date(announcement.timestamp), { addSuffix: true })} by ${announcement.creator?.slice(0, 6)}...${announcement.creator?.slice(-4)}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpenViewDialog(announcement);
          }
        }}
        onClick={() => handleOpenViewDialog(announcement)}
        sx={{
          mb: isMobile ? 1.5 : 2,
          border: announcement.priority === 'high' ? 2 : 1,
          borderColor: announcement.priority === 'high' ? 'error.main' : 'divider',
          position: 'relative',
          cursor: 'pointer',
          '&:active': isMobile ? {
            transform: 'scale(0.98)',
            transition: 'transform 0.1s ease',
          } : {},
          '&:focus': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: '2px',
          },
          '&:hover': {
            boxShadow: theme.shadows[4],
          },
          ...(isFocused && {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: '2px',
          }),
          ...getHighContrastStyles(),
        }}
      >
        {isUnread && (
          <Box
            role="status"
            aria-label="Unread announcement"
            sx={{
              position: 'absolute',
              top: isMobile ? 12 : 8,
              right: isMobile ? 12 : 8,
              width: isMobile ? 10 : 8,
              height: isMobile ? 10 : 8,
              borderRadius: '50%',
              bgcolor: 'primary.main',
            }}
          />
        )}

        <CardContent sx={{ p: isMobile ? 2.5 : 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: isMobile ? 1.5 : 2,
              mb: 2,
              flexDirection: isMobile ? 'column' : 'row',
            }}
          >
            <Avatar
              role="img"
              aria-label={`${priorityConfig.label} priority announcement`}
              sx={{
                bgcolor: priorityConfig.bgcolor,
                color: priorityConfig.textColor,
                width: isMobile ? 48 : 40,
                height: isMobile ? 48 : 40,
                alignSelf: isMobile ? 'flex-start' : 'flex-start',
              }}
            >
              <PriorityIcon fontSize={isMobile ? "medium" : "small"} />
            </Avatar>

            <Box sx={{ flex: 1, width: '100%' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  gap: 1,
                  mb: 1,
                  flexDirection: isMobile ? 'column' : 'row',
                }}
              >
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  component="h3"
                  id={generateId(`announcement-title-${announcement.id}`)}
                  sx={{
                    fontWeight: 600,
                    fontSize: isMobile ? '1.1rem' : '1.25rem',
                    flex: 1,
                  }}
                >
                  {announcement.title}
                </Typography>
                <Chip
                  label={priorityConfig.label}
                  color={priorityConfig.color}
                  size={isMobile ? "medium" : "small"}
                  variant="outlined"
                  aria-label={`Priority: ${priorityConfig.label}`}
                  sx={{
                    alignSelf: isMobile ? 'flex-start' : 'center',
                  }}
                />
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                id={generateId(`announcement-content-${announcement.id}`)}
                aria-describedby={generateId(`announcement-title-${announcement.id}`)}
                sx={{
                  mb: isMobile ? 2.5 : 2,
                  display: '-webkit-box',
                  WebkitLineClamp: isMobile ? 4 : 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  fontSize: isMobile ? '0.9rem' : '0.875rem',
                  lineHeight: isMobile ? 1.5 : 1.43,
                }}
              >
                {announcement.content}
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? 2 : 0,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    flexWrap: isMobile ? 'wrap' : 'nowrap',
                  }}
                >
                  <Person sx={{ fontSize: isMobile ? 18 : 16, color: 'text.secondary' }} />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: isMobile ? '0.75rem' : '0.75rem' }}
                  >
                    {announcement.creator?.slice(0, 6)}...{announcement.creator?.slice(-4)}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: isMobile ? '0.75rem' : '0.75rem' }}
                  >
                    • {formatDistanceToNow(new Date(announcement.timestamp), { addSuffix: true })}
                  </Typography>
                </Box>

                <Button
                  size={isMobile ? "medium" : "small"}
                  variant="outlined"
                  startIcon={<Visibility />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenViewDialog(announcement);
                  }}
                  aria-label={`Read full announcement: ${announcement.title}`}
                  sx={{
                    minHeight: isMobile ? 44 : 'auto',
                    fontSize: isMobile ? '0.9rem' : '0.875rem',
                    px: isMobile ? 2.5 : 2,
                    '&:active': {
                      transform: 'scale(0.95)',
                    },
                    '&:focus': {
                      outline: '2px solid',
                      outlineColor: 'primary.main',
                      outlineOffset: '2px',
                    },
                  }}
                  fullWidth={isMobile}
                >
                  Read More
                </Button>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Trap focus in dialogs
  trapFocus(createDialogRef, createDialogOpen);
  trapFocus(viewDialogRef, viewDialogOpen);

  return (
    <Box
      role="region"
      aria-label={`Announcements for ${chamaName}`}
      sx={{ ...getHighContrastStyles() }}
    >
      <AriaLiveRegion />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          mb: 3,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 2 : 0,
        }}
      >
        <Typography
          variant={isMobile ? "h5" : "h6"}
          component="h2"
          id={generateId('announcements-heading')}
          sx={{
            fontWeight: 600,
            fontSize: isMobile ? '1.5rem' : '1.25rem',
          }}
        >
          Announcements
        </Typography>
        {isCreator && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenCreateDialog}
            size={isMobile ? "large" : "medium"}
            aria-label="Create new announcement"
            sx={{
              minHeight: isMobile ? 48 : 'auto',
              fontSize: isMobile ? '1rem' : '0.875rem',
              px: isMobile ? 3 : 2,
              '&:active': {
                transform: 'scale(0.95)',
              },
              '&:focus': {
                outline: '2px solid',
                outlineColor: 'primary.contrastText',
                outlineOffset: '2px',
              },
            }}
            fullWidth={isMobile}
          >
            New Announcement
          </Button>
        )}
      </Box>

      {chamaAnnouncements.length === 0 ? (
        <Paper
          role="status"
          aria-label="No announcements available"
          sx={{
            p: 4,
            textAlign: 'center',
            bgcolor: 'grey.50',
            ...getHighContrastStyles()
          }}
        >
          <Campaign
            sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }}
            aria-hidden="true"
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Announcements Yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isCreator
              ? 'Create your first announcement to keep members informed.'
              : 'No announcements have been posted yet. Check back later for updates.'
            }
          </Typography>
        </Paper>
      ) : (
        <Box
          ref={announcementListRef}
          role="feed"
          aria-label={`${chamaAnnouncements.length} announcements`}
          aria-describedby={generateId('announcements-heading')}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <Stack spacing={2}>
            {chamaAnnouncements
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .map((announcement, index) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  index={index}
                />
              ))}
          </Stack>
        </Box>
      )}

      {/* Create Announcement Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        aria-labelledby={generateId('create-dialog-title')}
        aria-describedby={generateId('create-dialog-description')}
        PaperProps={{
          ref: createDialogRef,
          sx: {
            ...(isMobile && {
              margin: 0,
              borderRadius: 0,
              maxHeight: '100vh',
            }),
            ...getHighContrastStyles(),
          },
        }}
      >
        <DialogTitle
          id={generateId('create-dialog-title')}
          sx={{
            fontSize: isMobile ? '1.25rem' : '1.25rem',
            fontWeight: 600,
            pb: isMobile ? 1 : 2,
          }}
        >
          Create New Announcement
        </DialogTitle>
        <DialogContent
          id={generateId('create-dialog-description')}
          sx={{ px: isMobile ? 2 : 3 }}
        >
          <Stack spacing={isMobile ? 3 : 3} sx={{ mt: 1 }}>
            <TextField
              label="Announcement Title"
              fullWidth
              required
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter a clear, descriptive title"
              size={isMobile ? "medium" : "small"}
              aria-describedby={generateId('title-help')}
              inputProps={{
                'aria-label': 'Announcement title',
                maxLength: 100,
              }}
              sx={{
                '& .MuiInputBase-input': isMobile ? {
                  fontSize: '1rem',
                  padding: '16px 14px',
                } : {},
              }}
            />

            <TextField
              label="Content"
              fullWidth
              required
              multiline
              rows={isMobile ? 5 : 4}
              value={newAnnouncement.content}
              onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write your announcement content here..."
              size={isMobile ? "medium" : "small"}
              aria-describedby={generateId('content-help')}
              inputProps={{
                'aria-label': 'Announcement content',
                maxLength: 1000,
              }}
              sx={{
                '& .MuiInputBase-input': isMobile ? {
                  fontSize: '1rem',
                } : {},
              }}
            />

            <FormControl fullWidth required>
              <InputLabel
                id={generateId('priority-label')}
                sx={{
                  fontSize: isMobile ? '1rem' : '1rem',
                }}
              >
                Priority Level
              </InputLabel>
              <Select
                value={newAnnouncement.priority}
                label="Priority Level"
                labelId={generateId('priority-label')}
                onChange={(e) => setNewAnnouncement(prev => ({ ...prev, priority: e.target.value }))}
                size={isMobile ? "medium" : "small"}
                aria-describedby={generateId('priority-help')}
                inputProps={{
                  'aria-label': 'Select announcement priority level',
                }}
                sx={{
                  '& .MuiSelect-select': isMobile ? {
                    fontSize: '1rem',
                    padding: '16px 14px',
                  } : {},
                }}
              >
                <MenuItem
                  value="low"
                  sx={{
                    minHeight: isMobile ? 56 : 'auto',
                    fontSize: isMobile ? '1rem' : '0.875rem',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Info color="info" />
                    Low Priority
                  </Box>
                </MenuItem>
                <MenuItem
                  value="normal"
                  sx={{
                    minHeight: isMobile ? 56 : 'auto',
                    fontSize: isMobile ? '1rem' : '0.875rem',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Campaign color="primary" />
                    Normal
                  </Box>
                </MenuItem>
                <MenuItem
                  value="medium"
                  sx={{
                    minHeight: isMobile ? 56 : 'auto',
                    fontSize: isMobile ? '1rem' : '0.875rem',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Warning color="warning" />
                    Medium Priority
                  </Box>
                </MenuItem>
                <MenuItem
                  value="high"
                  sx={{
                    minHeight: isMobile ? 56 : 'auto',
                    fontSize: isMobile ? '1rem' : '0.875rem',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PriorityHigh color="error" />
                    High Priority
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <Alert
              severity="info"
              sx={{ mt: 2 }}
              role="region"
              aria-label="Priority level guidelines"
            >
              <Typography variant="body2" id={generateId('priority-help')}>
                <strong>Priority Guidelines:</strong>
                <br />
                • <strong>High:</strong> Urgent matters requiring immediate attention
                <br />
                • <strong>Medium:</strong> Important updates that need timely response
                <br />
                • <strong>Normal:</strong> General information and updates
                <br />
                • <strong>Low:</strong> Optional information and reminders
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{
            px: isMobile ? 2 : 3,
            py: isMobile ? 2 : 1,
            gap: isMobile ? 1 : 0,
            flexDirection: isMobile ? 'column-reverse' : 'row',
          }}
        >
          <Button
            onClick={handleCloseCreateDialog}
            size={isMobile ? "large" : "medium"}
            aria-label="Cancel creating announcement"
            sx={{
              minHeight: isMobile ? 48 : 'auto',
              fontSize: isMobile ? '1rem' : '0.875rem',
              '&:focus': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: '2px',
              },
            }}
            fullWidth={isMobile}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateAnnouncement}
            variant="contained"
            disabled={!newAnnouncement.title.trim() || !newAnnouncement.content.trim()}
            size={isMobile ? "large" : "medium"}
            aria-label="Post new announcement"
            sx={{
              minHeight: isMobile ? 48 : 'auto',
              fontSize: isMobile ? '1rem' : '0.875rem',
              '&:active': {
                transform: 'scale(0.95)',
              },
              '&:focus': {
                outline: '2px solid',
                outlineColor: 'primary.contrastText',
                outlineOffset: '2px',
              },
            }}
            fullWidth={isMobile}
          >
            Post Announcement
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Announcement Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        aria-labelledby={generateId('view-dialog-title')}
        aria-describedby={generateId('view-dialog-content')}
        PaperProps={{
          ref: viewDialogRef,
          sx: {
            ...(isMobile && {
              margin: 0,
              borderRadius: 0,
              maxHeight: '100vh',
            }),
            ...getHighContrastStyles(),
          },
        }}
      >
        {selectedAnnouncement && (
          <>
            <DialogTitle id={generateId('view-dialog-title')}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="h6" component="h2" sx={{ flex: 1 }}>
                  {selectedAnnouncement.title}
                </Typography>
                <Chip
                  label={getPriorityConfig(selectedAnnouncement.priority).label}
                  color={getPriorityConfig(selectedAnnouncement.priority).color}
                  size="small"
                  variant="outlined"
                  aria-label={`Priority: ${getPriorityConfig(selectedAnnouncement.priority).label}`}
                />
              </Box>
            </DialogTitle>
            <DialogContent id={generateId('view-dialog-content')}>
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  aria-label={`Posted by ${selectedAnnouncement.creator?.slice(0, 6)}...${selectedAnnouncement.creator?.slice(-4)} ${formatDistanceToNow(new Date(selectedAnnouncement.timestamp), { addSuffix: true })}`}
                >
                  Posted by {selectedAnnouncement.creator?.slice(0, 6)}...{selectedAnnouncement.creator?.slice(-4)}
                  {' • '}
                  {formatDistanceToNow(new Date(selectedAnnouncement.timestamp), { addSuffix: true })}
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} aria-hidden="true" />

              <Typography
                variant="body1"
                sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}
                role="article"
                aria-label="Announcement content"
              >
                {selectedAnnouncement.content}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleCloseViewDialog}
                aria-label="Close announcement view"
                sx={{
                  '&:focus': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: '2px',
                  },
                }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AnnouncementSystem;
