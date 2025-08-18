// src/components/communication/ChatInterface.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Chip,
  Stack,
  Divider,
  Badge,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  InputAdornment,
  Fade,
  Zoom,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Send,
  EmojiEmotions,
  AttachFile,
  MoreVert,
  Reply,
  Circle,
  KeyboardArrowDown,
  Close,
} from '@mui/icons-material';
import { useAppKitAccount } from '@reown/appkit/react';
import { useCommunication } from '../../contexts/CommunicationContext';
import { formatDistanceToNow } from 'date-fns';
import { useMessageVirtualization, useOptimizedUpdates } from '../../hooks/useMessageVirtualization';
import { useAccessibility, useListNavigation } from '../../hooks/useAccessibility';

const ChatInterface = ({ chamaId, chamaName }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { address } = useAppKitAccount();
  const { messages, onlineMembers, sendMessage, joinChamaRoom } = useCommunication();
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Accessibility features
  const {
    announce,
    isHighContrast,
    getHighContrastStyles,
    AriaLiveRegion,
    generateId,
    focusElement
  } = useAccessibility();

  const chamaMessages = messages[chamaId] || [];

  // Use message virtualization for performance
  const {
    containerRef,
    visibleMessages,
    totalHeight,
    offsetY,
    handleScroll,
    scrollToBottom,
    isScrolling,
    isNearBottom,
    messageCount,
  } = useMessageVirtualization(chamaMessages, 400);

  // Optimized message updates
  const optimizedSendMessage = useOptimizedUpdates(
    useCallback((updates) => {
      // Process batched message updates
      updates.forEach(([chamaId, content, threadId]) => {
        sendMessage(chamaId, content, threadId);
      });
    }, [sendMessage]),
    50
  );

  // Join chama room when component mounts
  useEffect(() => {
    if (chamaId) {
      joinChamaRoom(chamaId);
    }
  }, [chamaId, joinChamaRoom]);

  // Show/hide scroll to bottom button
  useEffect(() => {
    setShowScrollToBottom(!isNearBottom && messageCount > 10);
  }, [isNearBottom, messageCount]);

  // Handle typing indicator
  useEffect(() => {
    if (newMessage.trim()) {
      setIsTyping(true);
      const timeout = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
    }
  }, [newMessage]);

  const handleSendMessage = useCallback(() => {
    if (newMessage.trim() && chamaId) {
      optimizedSendMessage(chamaId, newMessage.trim(), replyingTo?.id);

      // Announce message sent for screen readers
      announce(`Message sent: ${newMessage.trim()}`);

      setNewMessage('');
      setReplyingTo(null);
      setIsTyping(false);

      // Focus back to input after sending
      setTimeout(() => {
        focusElement(inputRef.current, { announce: false });
      }, 100);
    }
  }, [newMessage, chamaId, optimizedSendMessage, replyingTo, announce, focusElement]);

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleReply = (message) => {
    setReplyingTo(message);
    inputRef.current?.focus();
  };

  const formatMessageTime = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const isOnline = (memberAddress) => {
    return onlineMembers.has(memberAddress);
  };

  const getAvatarColor = (address) => {
    const colors = ['#1976d2', '#26a69a', '#4caf50', '#ff9800', '#f44336', '#9c27b0'];
    const index = address ? address.charCodeAt(2) % colors.length : 0;
    return colors[index];
  };

  const MessageItem = ({ message, isOwn }) => (
    <Fade in timeout={300}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: isOwn ? 'flex-end' : 'flex-start',
          mb: isMobile ? 1.5 : 2,
          px: isMobile ? 1 : 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: isOwn ? 'row-reverse' : 'row',
            alignItems: 'flex-start',
            maxWidth: isMobile ? '85%' : '70%',
            gap: isMobile ? 0.75 : 1,
          }}
        >
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              isOnline(message.sender) ? (
                <Circle sx={{ color: 'success.main', fontSize: isMobile ? 10 : 12 }} />
              ) : null
            }
          >
            <Avatar
              sx={{
                width: isMobile ? 36 : 32,
                height: isMobile ? 36 : 32,
                bgcolor: getAvatarColor(message.sender),
                fontSize: isMobile ? '0.9rem' : '0.875rem',
                flexShrink: 0,
              }}
            >
              {message.sender?.charAt(2)?.toUpperCase() || 'U'}
            </Avatar>
          </Badge>

          <Paper
            elevation={1}
            sx={{
              p: isMobile ? 1.25 : 1.5,
              bgcolor: isOwn ? 'primary.main' : 'background.paper',
              color: isOwn ? 'primary.contrastText' : 'text.primary',
              borderRadius: isMobile ? 2.5 : 2,
              position: 'relative',
              minWidth: isMobile ? 120 : 100,
              maxWidth: '100%',
              // Enhanced touch target for mobile
              ...(isMobile && {
                '&:active': {
                  transform: 'scale(0.98)',
                  transition: 'transform 0.1s ease',
                },
              }),
            }}
          >
            {message.threadId && (
              <Box
                sx={{
                  mb: 1,
                  p: isMobile ? 0.75 : 1,
                  bgcolor: isOwn ? 'primary.dark' : 'grey.100',
                  borderRadius: 1,
                  fontSize: isMobile ? '0.7rem' : '0.75rem',
                  opacity: 0.8,
                }}
              >
                <Typography variant="caption">
                  Replying to message...
                </Typography>
              </Box>
            )}

            <Typography
              variant="body2"
              sx={{
                wordBreak: 'break-word',
                fontSize: isMobile ? '0.9rem' : '0.875rem',
                lineHeight: isMobile ? 1.4 : 1.43,
              }}
            >
              {message.content}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: isMobile ? 0.75 : 0.5,
                gap: 1,
                flexWrap: isMobile ? 'wrap' : 'nowrap',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.7,
                  fontSize: isMobile ? '0.65rem' : '0.7rem',
                  flexShrink: 0,
                }}
              >
                {formatMessageTime(message.timestamp)}
              </Typography>

              {!isOwn && (
                <Tooltip title="Reply" placement={isMobile ? 'top' : 'top-end'}>
                  <IconButton
                    size={isMobile ? "medium" : "small"}
                    onClick={() => handleReply(message)}
                    sx={{
                      opacity: 0.7,
                      '&:hover': { opacity: 1 },
                      '&:active': {
                        opacity: 1,
                        transform: 'scale(0.95)',
                      },
                      color: 'inherit',
                      minWidth: isMobile ? 44 : 'auto',
                      minHeight: isMobile ? 44 : 'auto',
                      padding: isMobile ? 1 : 0.5,
                    }}
                  >
                    <Reply fontSize={isMobile ? "medium" : "small"} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Fade>
  );

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...getHighContrastStyles(),
      }}
      ref={chatContainerRef}
      role="region"
      aria-label={`Chat for ${chamaName}`}
    >
      <AriaLiveRegion />
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600 }}
              id={generateId('chat-title')}
            >
              {chamaName} Chat
            </Typography>
            <Chip
              size="small"
              label={`${onlineMembers.size} online`}
              color="success"
              variant="outlined"
              aria-label={`${onlineMembers.size} members currently online`}
            />
          </Box>
        }
        action={
          <IconButton
            aria-label="Chat options"
            aria-haspopup="true"
          >
            <MoreVert />
          </IconButton>
        }
        sx={{ pb: 1 }}
      />

      <Divider />

      <CardContent
        sx={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          p: 0,
        }}
      >
        {/* Messages Area */}
        <Box
          sx={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {chamaMessages.length === 0 ? (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                color: 'text.secondary',
              }}
            >
              <Typography variant="body2">
                No messages yet. Start the conversation!
              </Typography>
            </Box>
          ) : (
            <>
              {/* Virtualized Message Container */}
              <Box
                ref={containerRef}
                onScroll={handleScroll}
                sx={{
                  height: '100%',
                  overflow: 'auto',
                  p: 2,
                  scrollBehavior: isScrolling ? 'auto' : 'smooth',
                }}
              >
                <Box
                  sx={{
                    height: totalHeight,
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      transform: `translateY(${offsetY}px)`,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                    }}
                  >
                    {visibleMessages.map((message, index) => (
                      <MessageItem
                        key={message.id || index}
                        message={message}
                        isOwn={message.sender === address}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>

              {/* Scroll to Bottom Button */}
              {showScrollToBottom && (
                <Zoom in>
                  <IconButton
                    onClick={scrollToBottom}
                    sx={{
                      position: 'absolute',
                      bottom: isMobile ? 20 : 16,
                      right: isMobile ? 20 : 16,
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      '&:active': {
                        transform: 'scale(0.95)',
                      },
                      boxShadow: isMobile ? 3 : 2,
                      width: isMobile ? 48 : 'auto',
                      height: isMobile ? 48 : 'auto',
                    }}
                    size={isMobile ? "medium" : "small"}
                  >
                    <KeyboardArrowDown fontSize={isMobile ? "medium" : "small"} />
                  </IconButton>
                </Zoom>
              )}

              {/* Loading indicator for scrolling */}
              {isScrolling && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 1,
                  }}
                >
                  <CircularProgress size={16} />
                </Box>
              )}
            </>
          )}
        </Box>

        {/* Reply Preview */}
        {replyingTo && (
          <Zoom in>
            <Box
              sx={{
                mx: isMobile ? 1 : 2,
                mb: 1,
                p: isMobile ? 1.25 : 1,
                bgcolor: 'grey.100',
                borderRadius: isMobile ? 2 : 1,
                borderLeft: 3,
                borderColor: 'primary.main',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 1,
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                  Replying to:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.8,
                    fontSize: isMobile ? '0.85rem' : '0.875rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {replyingTo.content.substring(0, isMobile ? 40 : 50)}
                  {replyingTo.content.length > (isMobile ? 40 : 50) ? '...' : ''}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => setReplyingTo(null)}
                sx={{
                  opacity: 0.7,
                  '&:hover': { opacity: 1 },
                  minWidth: isMobile ? 32 : 'auto',
                  minHeight: isMobile ? 32 : 'auto',
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Box>
          </Zoom>
        )}

        {/* Message Input */}
        <Box
          sx={{ p: isMobile ? 1.5 : 2, pt: 1 }}
          role="region"
          aria-label="Message composition area"
        >
          <TextField
            ref={inputRef}
            fullWidth
            multiline
            maxRows={isMobile ? 4 : 3}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            variant="outlined"
            size={isMobile ? "medium" : "small"}
            aria-label={`Type a message in ${chamaName} chat`}
            aria-describedby={replyingTo ? generateId('reply-context') : undefined}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Stack direction="row" spacing={isMobile ? 0.5 : 0.5} alignItems="center">
                    {isMobile && (
                      <IconButton
                        size="medium"
                        disabled
                        sx={{
                          opacity: 0.5,
                          minWidth: 44,
                          minHeight: 44,
                        }}
                      >
                        <EmojiEmotions />
                      </IconButton>
                    )}
                    {!isMobile && (
                      <>
                        <IconButton size="small" disabled>
                          <EmojiEmotions />
                        </IconButton>
                        <IconButton size="small" disabled>
                          <AttachFile />
                        </IconButton>
                      </>
                    )}
                    <IconButton
                      size={isMobile ? "medium" : "small"}
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      color="primary"
                      aria-label={`Send message${replyingTo ? ' as reply' : ''}`}
                      aria-describedby={newMessage.trim() ? undefined : 'send-button-disabled'}
                      sx={{
                        minWidth: isMobile ? 48 : 'auto',
                        minHeight: isMobile ? 48 : 'auto',
                        '&:active': {
                          transform: 'scale(0.95)',
                        },
                        '&:focus': {
                          outline: '2px solid',
                          outlineColor: 'primary.main',
                          outlineOffset: '2px',
                        },
                        ...(isMobile && {
                          bgcolor: newMessage.trim() ? 'primary.main' : 'transparent',
                          color: newMessage.trim() ? 'white' : 'primary.main',
                          '&:hover': {
                            bgcolor: newMessage.trim() ? 'primary.dark' : 'action.hover',
                          },
                        }),
                      }}
                    >
                      <Send fontSize={isMobile ? "medium" : "small"} />
                    </IconButton>
                  </Stack>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: isMobile ? 3 : 3,
                fontSize: isMobile ? '1rem' : '0.875rem',
                ...(isMobile && {
                  '& .MuiInputBase-input': {
                    padding: '14px 16px',
                  },
                }),
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
