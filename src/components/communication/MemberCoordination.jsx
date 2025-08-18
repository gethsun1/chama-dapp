// src/components/communication/MemberCoordination.jsx
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
  Tabs,
  Tab,
  LinearProgress,
  Grid,
  Divider,
  AvatarGroup,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add,
  Event,
  Assignment,
  CheckCircle,
  Schedule,
  Person,
  Group,
  CalendarToday,
  Task,
  TrendingUp,
  Edit,
  Delete,
  PlayArrow,
  Pause,
  Stop,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useAppKitAccount } from '@reown/appkit/react';
import { formatDistanceToNow, format, isAfter, isBefore } from 'date-fns';
import dayjs from 'dayjs';
import { useAccessibility, useListNavigation } from '../../hooks/useAccessibility';

const MemberCoordination = ({ chamaId, chamaName, members = [], isCreator = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { address } = useAppKitAccount();
  const [activeTab, setActiveTab] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('event'); // 'event' or 'task'

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
  const eventsListRef = useRef(null);
  const tasksListRef = useRef(null);
  
  // Mock data - in real implementation, this would come from context/API
  const [events, setEvents] = useState([
    {
      id: '1',
      title: 'Monthly Contribution Meeting',
      description: 'Discuss next month\'s contribution schedule and any changes',
      date: new Date(Date.now() + 7 * 24 * 3600000),
      creator: address,
      attendees: [address],
      type: 'meeting',
    },
  ]);

  const [tasks, setTasks] = useState([
    {
      id: '1',
      title: 'Update Contribution Records',
      description: 'Verify and update all member contribution records for Q1',
      assignee: address,
      creator: address,
      dueDate: new Date(Date.now() + 3 * 24 * 3600000),
      status: 'in_progress',
      priority: 'high',
      progress: 60,
    },
  ]);

  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    date: dayjs().add(1, 'day'),
    assignee: '',
    priority: 'medium',
    type: 'meeting',
  });

  // List navigation for events and tasks
  const eventsNavigation = useListNavigation(events, {
    onSelect: (event) => announce(`Selected event: ${event.title}`),
    announceNavigation: true,
  });

  const tasksNavigation = useListNavigation(tasks, {
    onSelect: (task) => announce(`Selected task: ${task.title}`),
    announceNavigation: true,
  });

  const handleCreateItem = useCallback(() => {
    if (newItem.title.trim() && newItem.description.trim()) {
      if (dialogType === 'event') {
        const newEvent = {
          id: Date.now().toString(),
          title: newItem.title.trim(),
          description: newItem.description.trim(),
          date: newItem.date.toDate(),
          creator: address,
          attendees: [address],
          type: newItem.type,
        };
        setEvents(prev => [...prev, newEvent]);
        announce(`Event "${newItem.title.trim()}" created successfully`);
      } else {
        const newTask = {
          id: Date.now().toString(),
          title: newItem.title.trim(),
          description: newItem.description.trim(),
          assignee: newItem.assignee || address,
          creator: address,
          dueDate: newItem.date.toDate(),
          status: 'pending',
          priority: newItem.priority,
          progress: 0,
        };
        setTasks(prev => [...prev, newTask]);
        announce(`Task "${newItem.title.trim()}" created successfully`);
      }

      setNewItem({
        title: '',
        description: '',
        date: dayjs().add(1, 'day'),
        assignee: '',
        priority: 'medium',
        type: 'meeting',
      });
      setCreateDialogOpen(false);
    }
  }, [newItem, dialogType, address, announce]);

  const handleOpenCreateDialog = useCallback((type) => {
    setDialogType(type);
    setCreateDialogOpen(true);
    announce(`Opening create ${type} dialog`);
  }, [announce]);

  const handleCloseCreateDialog = useCallback(() => {
    setCreateDialogOpen(false);
    announce('Create dialog closed');
  }, [announce]);

  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
    const tabName = newValue === 0 ? 'Events' : 'Tasks';
    announce(`Switched to ${tabName} tab`);
  }, [announce]);

  const updateTaskStatus = useCallback((taskId, newStatus) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        announce(`Task "${task.title}" status updated to ${newStatus}`);
        return { ...task, status: newStatus };
      }
      return task;
    }));
  }, [announce]);

  const updateTaskProgress = useCallback((taskId, progress) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        announce(`Task "${task.title}" progress updated to ${progress}%`);
        return { ...task, progress };
      }
      return task;
    }));
  }, [announce]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'primary';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const EventCard = ({ event, index }) => {
    const isFocused = eventsNavigation.isItemFocused(index);
    const eventId = generateId(`event-${event.id}`);

    return (
      <Card
        id={eventId}
        role="article"
        tabIndex={0}
        aria-label={`Event: ${event.title}. ${format(event.date, 'PPP')} at ${format(event.date, 'p')}. ${event.attendees.length} attendees.`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            announce(`Event details: ${event.title}`);
          }
        }}
        sx={{
          mb: 2,
          cursor: 'pointer',
          '&:active': isMobile ? {
            transform: 'scale(0.98)',
            transition: 'transform 0.1s ease-in-out',
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
      <CardContent sx={{ p: isMobile ? 2 : 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: isMobile ? 1.5 : 2,
            flexDirection: isMobile ? 'column' : 'row',
          }}
        >
          {!isMobile && (
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <Event />
            </Avatar>
          )}

          <Box sx={{ flex: 1, width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {isMobile && (
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                  <Event fontSize="small" />
                </Avatar>
              )}
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                component="h3"
                id={generateId(`event-title-${event.id}`)}
                sx={{
                  fontWeight: 600,
                  fontSize: isMobile ? '1.1rem' : '1.25rem',
                }}
              >
                {event.title}
              </Typography>
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              id={generateId(`event-description-${event.id}`)}
              aria-describedby={generateId(`event-title-${event.id}`)}
              sx={{
                mb: 2,
                lineHeight: isMobile ? 1.4 : 1.5,
              }}
            >
              {event.description}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? 1 : 2,
                mb: 2,
                flexWrap: 'wrap',
              }}
            >
              <Chip
                icon={<CalendarToday />}
                label={format(event.date, isMobile ? 'MMM dd' : 'MMM dd, yyyy')}
                size={isMobile ? "medium" : "small"}
                variant="outlined"
                aria-label={`Event date: ${format(event.date, 'PPPP')}`}
                sx={{
                  fontSize: isMobile ? '0.875rem' : '0.75rem',
                  height: isMobile ? 36 : 'auto',
                }}
              />
              <Chip
                icon={<Schedule />}
                label={format(event.date, 'h:mm a')}
                size={isMobile ? "medium" : "small"}
                variant="outlined"
                aria-label={`Event time: ${format(event.date, 'p')}`}
                sx={{
                  fontSize: isMobile ? '0.875rem' : '0.75rem',
                  height: isMobile ? 36 : 'auto',
                }}
              />
              <Chip
                label={event.type}
                size={isMobile ? "medium" : "small"}
                color="primary"
                aria-label={`Event type: ${event.type}`}
                sx={{
                  fontSize: isMobile ? '0.875rem' : '0.75rem',
                  height: isMobile ? 36 : 'auto',
                }}
              />
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 1 : 0,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {event.attendees.length} attending
                </Typography>
                <AvatarGroup
                  max={3}
                  sx={{
                    '& .MuiAvatar-root': {
                      width: isMobile ? 28 : 24,
                      height: isMobile ? 28 : 24,
                      fontSize: isMobile ? '0.875rem' : '0.75rem'
                    }
                  }}
                >
                  {event.attendees.map((attendee, index) => (
                    <Avatar key={index} sx={{ bgcolor: 'secondary.main' }}>
                      {attendee.charAt(2)?.toUpperCase()}
                    </Avatar>
                  ))}
                </AvatarGroup>
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: isMobile ? '0.875rem' : '0.75rem' }}
              >
                {formatDistanceToNow(event.date, { addSuffix: true })}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
  };

  const TaskCard = ({ task, index }) => {
    const isOverdue = isAfter(new Date(), task.dueDate) && task.status !== 'completed';
    const status = isOverdue ? 'overdue' : task.status;
    const isFocused = tasksNavigation.isItemFocused(index);
    const taskId = generateId(`task-${task.id}`);

    return (
      <Card
        id={taskId}
        role="article"
        tabIndex={0}
        aria-label={`Task: ${task.title}. Status: ${status}. Priority: ${task.priority}. Due ${formatDistanceToNow(task.dueDate, { addSuffix: true })}. Progress: ${task.progress}%.`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            announce(`Task details: ${task.title}, ${status}, ${task.progress}% complete`);
          }
        }}
        sx={{
          mb: 2,
          cursor: 'pointer',
          '&:active': isMobile ? {
            transform: 'scale(0.98)',
            transition: 'transform 0.1s ease-in-out',
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
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: isMobile ? 1.5 : 2,
              flexDirection: isMobile ? 'column' : 'row',
            }}
          >
            {!isMobile && (
              <Avatar sx={{ bgcolor: getStatusColor(status) + '.main' }}>
                <Assignment />
              </Avatar>
            )}

            <Box sx={{ flex: 1, width: '100%' }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 1,
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? 1 : 0,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {isMobile && (
                    <Avatar sx={{ bgcolor: getStatusColor(status) + '.main', width: 32, height: 32 }}>
                      <Assignment fontSize="small" />
                    </Avatar>
                  )}
                  <Typography
                    variant={isMobile ? "subtitle1" : "h6"}
                    sx={{
                      fontWeight: 600,
                      fontSize: isMobile ? '1.1rem' : '1.25rem',
                    }}
                  >
                    {task.title}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    flexWrap: 'wrap',
                    width: isMobile ? '100%' : 'auto',
                  }}
                >
                  <Chip
                    label={task.priority}
                    size={isMobile ? "medium" : "small"}
                    color={getPriorityColor(task.priority)}
                    variant="outlined"
                    sx={{
                      fontSize: isMobile ? '0.875rem' : '0.75rem',
                      height: isMobile ? 36 : 'auto',
                    }}
                  />
                  <Chip
                    label={status.replace('_', ' ')}
                    size={isMobile ? "medium" : "small"}
                    color={getStatusColor(status)}
                    sx={{
                      fontSize: isMobile ? '0.875rem' : '0.75rem',
                      height: isMobile ? 36 : 'auto',
                    }}
                  />
                </Box>
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 2,
                  lineHeight: isMobile ? 1.4 : 1.5,
                }}
              >
                {task.description}
              </Typography>

              {task.status !== 'completed' && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: isMobile ? '0.875rem' : '0.75rem' }}
                    >
                      Progress
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: isMobile ? '0.875rem' : '0.75rem' }}
                    >
                      {task.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={task.progress}
                    sx={{
                      height: isMobile ? 8 : 6,
                      borderRadius: 3,
                    }}
                  />
                </Box>
              )}

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
                    flexWrap: 'wrap',
                  }}
                >
                  <Person sx={{ fontSize: isMobile ? 18 : 16, color: 'text.secondary' }} />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: isMobile ? '0.875rem' : '0.75rem' }}
                  >
                    {task.assignee === address ? 'You' : `${task.assignee.slice(0, 6)}...${task.assignee.slice(-4)}`}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: isMobile ? '0.875rem' : '0.75rem' }}
                  >
                    • Due {formatDistanceToNow(task.dueDate, { addSuffix: true })}
                  </Typography>
                </Box>

                {task.assignee === address && task.status !== 'completed' && (
                  <Stack
                    direction={isMobile ? "column" : "row"}
                    spacing={1}
                    sx={{ width: isMobile ? '100%' : 'auto' }}
                  >
                    {task.status === 'pending' && (
                      <Button
                        size={isMobile ? "large" : "small"}
                        startIcon={<PlayArrow />}
                        onClick={() => updateTaskStatus(task.id, 'in_progress')}
                        fullWidth={isMobile}
                        sx={{
                          minHeight: isMobile ? 44 : 'auto',
                          fontSize: isMobile ? '0.875rem' : '0.75rem',
                          '&:active': {
                            transform: 'scale(0.95)',
                          },
                        }}
                      >
                        Start
                      </Button>
                    )}
                    {task.status === 'in_progress' && (
                      <Button
                        size={isMobile ? "large" : "small"}
                        startIcon={<CheckCircle />}
                        onClick={() => updateTaskStatus(task.id, 'completed')}
                        color="success"
                        fullWidth={isMobile}
                        sx={{
                          minHeight: isMobile ? 44 : 'auto',
                          fontSize: isMobile ? '0.875rem' : '0.75rem',
                          '&:active': {
                            transform: 'scale(0.95)',
                          },
                        }}
                      >
                        Complete
                      </Button>
                    )}
                  </Stack>
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Trap focus in dialog
  trapFocus(createDialogRef, createDialogOpen);

  return (
    <Box
      role="region"
      aria-label={`Member coordination for ${chamaName}`}
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
          sx={{
            fontWeight: 600,
            fontSize: isMobile ? '1.5rem' : '1.25rem',
          }}
        >
          Member Coordination
        </Typography>
        {isCreator && (
          <Stack
            direction={isMobile ? "column" : "row"}
            spacing={1}
            sx={{ width: isMobile ? '100%' : 'auto' }}
          >
            <Button
              variant="outlined"
              startIcon={<Event />}
              onClick={() => handleOpenCreateDialog('event')}
              size={isMobile ? "large" : "medium"}
              fullWidth={isMobile}
              aria-label="Create new event"
              sx={{
                minHeight: isMobile ? 48 : 'auto',
                fontSize: isMobile ? '1rem' : '0.875rem',
                px: isMobile ? 3 : 2,
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
              New Event
            </Button>
            <Button
              variant="contained"
              startIcon={<Assignment />}
              onClick={() => handleOpenCreateDialog('task')}
              size={isMobile ? "large" : "medium"}
              fullWidth={isMobile}
              aria-label="Create new task"
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
            >
              New Task
            </Button>
          </Stack>
        )}
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="Member coordination tabs"
          sx={{
            '& .MuiTab-root': {
              '&:focus': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: '2px',
              },
            },
          }}
        >
          <Tab
            label={`Events (${events.length})`}
            id={generateId('events-tab')}
            aria-controls={generateId('events-panel')}
            aria-label={`Events tab, ${events.length} events`}
          />
          <Tab
            label={`Tasks (${tasks.length})`}
            id={generateId('tasks-tab')}
            aria-controls={generateId('tasks-panel')}
            aria-label={`Tasks tab, ${tasks.length} tasks`}
          />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Box
          role="tabpanel"
          id={generateId('events-panel')}
          aria-labelledby={generateId('events-tab')}
          aria-label={`Events panel with ${events.length} events`}
        >
          {events.length === 0 ? (
            <Paper
              role="status"
              aria-label="No events scheduled"
              sx={{
                p: 4,
                textAlign: 'center',
                bgcolor: 'grey.50',
                ...getHighContrastStyles()
              }}
            >
              <Event
                sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }}
                aria-hidden="true"
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Events Scheduled
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isCreator
                  ? 'Schedule your first event to coordinate with members.'
                  : 'No events have been scheduled yet.'
                }
              </Typography>
            </Paper>
          ) : (
            <Box
              ref={eventsListRef}
              role="feed"
              aria-label={`${events.length} scheduled events`}
              onKeyDown={eventsNavigation.handleKeyDown}
              tabIndex={-1}
            >
              {events
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} />
                ))}
            </Box>
          )}
        </Box>
      )}

      {activeTab === 1 && (
        <Box
          role="tabpanel"
          id={generateId('tasks-panel')}
          aria-labelledby={generateId('tasks-tab')}
          aria-label={`Tasks panel with ${tasks.length} tasks`}
        >
          {tasks.length === 0 ? (
            <Paper
              role="status"
              aria-label="No tasks assigned"
              sx={{
                p: 4,
                textAlign: 'center',
                bgcolor: 'grey.50',
                ...getHighContrastStyles()
              }}
            >
              <Assignment
                sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }}
                aria-hidden="true"
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Tasks Assigned
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isCreator
                  ? 'Create your first task to organize member responsibilities.'
                  : 'No tasks have been assigned yet.'
                }
              </Typography>
            </Paper>
          ) : (
            <Box
              ref={tasksListRef}
              role="feed"
              aria-label={`${tasks.length} assigned tasks`}
              onKeyDown={tasksNavigation.handleKeyDown}
              tabIndex={-1}
            >
              {tasks
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                .map((task, index) => (
                  <TaskCard key={task.id} task={task} index={index} />
                ))}
            </Box>
          )}
        </Box>
      )}

      {/* Create Event/Task Dialog */}
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
            margin: isMobile ? 0 : 2,
            maxHeight: isMobile ? '100vh' : 'calc(100vh - 64px)',
            ...getHighContrastStyles(),
          },
        }}
      >
        <DialogTitle
          id={generateId('create-dialog-title')}
          sx={{
            fontSize: isMobile ? '1.5rem' : '1.25rem',
            fontWeight: 600,
            pb: isMobile ? 1 : 2,
          }}
        >
          Create New {dialogType === 'event' ? 'Event' : 'Task'}
        </DialogTitle>
        <DialogContent
          id={generateId('create-dialog-description')}
          sx={{ px: isMobile ? 2 : 3 }}
        >
          <Stack spacing={isMobile ? 2.5 : 3} sx={{ mt: 1 }}>
            <TextField
              label={`${dialogType === 'event' ? 'Event' : 'Task'} Title`}
              fullWidth
              required
              value={newItem.title}
              onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
              placeholder={`Enter ${dialogType} title`}
              aria-describedby={generateId('title-help')}
              inputProps={{
                'aria-label': `${dialogType === 'event' ? 'Event' : 'Task'} title`,
                maxLength: 100,
              }}
            />

            <TextField
              label="Description"
              fullWidth
              required
              multiline
              rows={3}
              value={newItem.description}
              onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
              placeholder={`Describe the ${dialogType} details`}
              aria-describedby={generateId('description-help')}
              inputProps={{
                'aria-label': `${dialogType === 'event' ? 'Event' : 'Task'} description`,
                maxLength: 500,
              }}
            />

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label={dialogType === 'event' ? 'Event Date & Time' : 'Due Date & Time'}
                value={newItem.date}
                onChange={(newValue) => setNewItem(prev => ({ ...prev, date: newValue }))}
                minDateTime={dayjs()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    'aria-label': `Select ${dialogType === 'event' ? 'event' : 'task'} date and time`,
                    'aria-describedby': generateId('datetime-help'),
                  },
                }}
              />
            </LocalizationProvider>

            {dialogType === 'event' && (
              <FormControl fullWidth>
                <InputLabel id={generateId('event-type-label')}>Event Type</InputLabel>
                <Select
                  value={newItem.type}
                  label="Event Type"
                  labelId={generateId('event-type-label')}
                  onChange={(e) => setNewItem(prev => ({ ...prev, type: e.target.value }))}
                  aria-describedby={generateId('event-type-help')}
                  inputProps={{
                    'aria-label': 'Select event type',
                  }}
                >
                  <MenuItem value="meeting">Meeting</MenuItem>
                  <MenuItem value="social">Social Event</MenuItem>
                  <MenuItem value="training">Training/Workshop</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            )}

            {dialogType === 'task' && (
              <>
                <FormControl fullWidth>
                  <InputLabel id={generateId('assignee-label')}>Assign To</InputLabel>
                  <Select
                    value={newItem.assignee}
                    label="Assign To"
                    labelId={generateId('assignee-label')}
                    onChange={(e) => setNewItem(prev => ({ ...prev, assignee: e.target.value }))}
                    aria-describedby={generateId('assignee-help')}
                    inputProps={{
                      'aria-label': 'Select task assignee',
                    }}
                  >
                    <MenuItem value={address}>Myself</MenuItem>
                    {members.filter(m => m !== address).map((member) => (
                      <MenuItem key={member} value={member}>
                        {member.slice(0, 6)}...{member.slice(-4)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel id={generateId('priority-label')}>Priority</InputLabel>
                  <Select
                    value={newItem.priority}
                    label="Priority"
                    labelId={generateId('priority-label')}
                    onChange={(e) => setNewItem(prev => ({ ...prev, priority: e.target.value }))}
                    aria-describedby={generateId('priority-help')}
                    inputProps={{
                      'aria-label': 'Select task priority',
                    }}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{
            px: isMobile ? 2 : 3,
            pb: isMobile ? 2 : 1,
            gap: isMobile ? 1 : 0,
            flexDirection: isMobile ? 'column-reverse' : 'row',
          }}
        >
          <Button
            onClick={handleCloseCreateDialog}
            size={isMobile ? "large" : "medium"}
            fullWidth={isMobile}
            aria-label={`Cancel creating ${dialogType}`}
            sx={{
              minHeight: isMobile ? 48 : 'auto',
              fontSize: isMobile ? '1rem' : '0.875rem',
              '&:focus': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: '2px',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateItem}
            variant="contained"
            disabled={!newItem.title.trim() || !newItem.description.trim()}
            size={isMobile ? "large" : "medium"}
            fullWidth={isMobile}
            aria-label={`Create new ${dialogType}`}
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
          >
            Create {dialogType === 'event' ? 'Event' : 'Task'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MemberCoordination;
