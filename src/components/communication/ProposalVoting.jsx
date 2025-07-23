// src/components/communication/ProposalVoting.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Tooltip,
  Paper,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add,
  HowToVote,
  Schedule,
  CheckCircle,
  Cancel,
  Visibility,
  TrendingUp,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useAppKitAccount } from '@reown/appkit/react';
import { useCommunication } from '../../contexts/CommunicationContext';
import { formatDistanceToNow, isAfter } from 'date-fns';
import dayjs from 'dayjs';
import { useAccessibility, useListNavigation } from '../../hooks/useAccessibility';

const ProposalVoting = ({ chamaId, chamaName, isCreator = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { address } = useAppKitAccount();
  const { proposals, createProposal, voteOnProposal } = useCommunication();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    options: ['', ''],
    deadline: dayjs().add(7, 'day'),
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
  const proposalsListRef = useRef(null);

  const chamaProposals = proposals[chamaId] || [];

  // List navigation for proposals
  const { focusedIndex, setFocus, handleKeyDown, isItemFocused } = useListNavigation(
    chamaProposals,
    {
      onSelect: (proposal) => {
        setSelectedProposal(proposal);
        setViewDialogOpen(true);
        announce(`Opening proposal: ${proposal.title}`);
      },
      announceNavigation: true,
    }
  );

  const handleCreateProposal = useCallback(() => {
    if (newProposal.title.trim() && newProposal.description.trim()) {
      const validOptions = newProposal.options.filter(opt => opt.trim());
      if (validOptions.length >= 2) {
        createProposal(
          chamaId,
          newProposal.title.trim(),
          newProposal.description.trim(),
          validOptions,
          newProposal.deadline.toISOString()
        );

        // Announce success
        announce(`Proposal "${newProposal.title.trim()}" created successfully`);

        setNewProposal({
          title: '',
          description: '',
          options: ['', ''],
          deadline: dayjs().add(7, 'day'),
        });
        setCreateDialogOpen(false);
      } else {
        announce('Please provide at least 2 voting options');
      }
    } else {
      announce('Please fill in all required fields');
    }
  }, [newProposal, chamaId, createProposal, announce]);

  const handleVote = useCallback((proposalId, optionIndex) => {
    voteOnProposal(chamaId, proposalId, optionIndex);
    const proposal = chamaProposals.find(p => p.id === proposalId);
    if (proposal) {
      announce(`Vote cast for "${proposal.options[optionIndex]}" in proposal "${proposal.title}"`);
    }
  }, [chamaId, voteOnProposal, chamaProposals, announce]);

  const handleOpenCreateDialog = useCallback(() => {
    setCreateDialogOpen(true);
    announce('Opening create proposal dialog');
  }, [announce]);

  const handleCloseCreateDialog = useCallback(() => {
    setCreateDialogOpen(false);
    announce('Create proposal dialog closed');
  }, [announce]);

  const handleOpenViewDialog = useCallback((proposal) => {
    setSelectedProposal(proposal);
    setViewDialogOpen(true);
    announce(`Opening proposal details: ${proposal.title}`);
  }, [announce]);

  const handleCloseViewDialog = useCallback(() => {
    setViewDialogOpen(false);
    setSelectedProposal(null);
    announce('Proposal details closed');
  }, [announce]);

  const addOption = () => {
    setNewProposal(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const updateOption = (index, value) => {
    setNewProposal(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const removeOption = (index) => {
    if (newProposal.options.length > 2) {
      setNewProposal(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const getProposalStatus = (proposal) => {
    const now = new Date();
    const deadline = new Date(proposal.deadline);
    
    if (isAfter(now, deadline)) {
      return { status: 'closed', label: 'Voting Closed', color: 'error' };
    }
    
    return { status: 'active', label: 'Active', color: 'success' };
  };

  const calculateVotePercentages = (votes) => {
    const totalVotes = Object.values(votes || {}).reduce((sum, count) => sum + count, 0);
    if (totalVotes === 0) return {};
    
    const percentages = {};
    Object.entries(votes).forEach(([option, count]) => {
      percentages[option] = (count / totalVotes) * 100;
    });
    return percentages;
  };

  const ProposalCard = ({ proposal, index }) => {
    const status = getProposalStatus(proposal);
    const percentages = calculateVotePercentages(proposal.votes);
    const totalVotes = Object.values(proposal.votes || {}).reduce((sum, count) => sum + count, 0);
    const isFocused = isItemFocused(index);
    const proposalId = generateId(`proposal-${proposal.id}`);

    return (
      <Card
        id={proposalId}
        role="article"
        tabIndex={0}
        aria-label={`Proposal: ${proposal.title}. Status: ${status.status}. ${totalVotes} votes cast. Deadline ${formatDistanceToNow(new Date(proposal.deadline), { addSuffix: true })}.`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpenViewDialog(proposal);
          }
        }}
        onClick={() => handleOpenViewDialog(proposal)}
        sx={{
          mb: isMobile ? 1.5 : 2,
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
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 2,
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? 1 : 0,
            }}
          >
            <Box sx={{ flex: 1, width: '100%' }}>
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                component="h3"
                id={generateId(`proposal-title-${proposal.id}`)}
                sx={{
                  fontWeight: 600,
                  mb: 1,
                  fontSize: isMobile ? '1.1rem' : '1.25rem',
                }}
              >
                {proposal.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                id={generateId(`proposal-description-${proposal.id}`)}
                aria-describedby={generateId(`proposal-title-${proposal.id}`)}
                sx={{
                  mb: isMobile ? 1 : 2,
                  fontSize: isMobile ? '0.9rem' : '0.875rem',
                  lineHeight: isMobile ? 1.4 : 1.43,
                }}
              >
                {proposal.description}
              </Typography>
            </Box>
            <Chip
              label={status.label}
              color={status.color}
              size={isMobile ? "medium" : "small"}
              variant="outlined"
              sx={{
                alignSelf: isMobile ? 'flex-start' : 'flex-start',
                flexShrink: 0,
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 1,
                fontSize: isMobile ? '0.85rem' : '0.875rem',
                fontWeight: 500,
              }}
            >
              Voting Options ({totalVotes} votes)
            </Typography>

            {proposal.options.map((option, index) => {
              const voteCount = proposal.votes?.[index] || 0;
              const percentage = percentages[index] || 0;

              return (
                <Box key={index} sx={{ mb: isMobile ? 2 : 1.5 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 0.5,
                      flexWrap: isMobile ? 'wrap' : 'nowrap',
                      gap: isMobile ? 0.5 : 0,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: isMobile ? '0.9rem' : '0.875rem',
                        fontWeight: 500,
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      {option}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        fontSize: isMobile ? '0.75rem' : '0.75rem',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {voteCount} votes ({percentage.toFixed(1)}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{
                      height: isMobile ? 8 : 6,
                      borderRadius: 3,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                      },
                    }}
                  />
                </Box>
              );
            })}
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? 2 : 0,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontSize: isMobile ? '0.75rem' : '0.75rem',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Schedule sx={{ fontSize: isMobile ? 16 : 14, mr: 0.5 }} />
              Deadline: {formatDistanceToNow(new Date(proposal.deadline), { addSuffix: true })}
            </Typography>

            <Stack
              direction={isMobile ? "column" : "row"}
              spacing={isMobile ? 1 : 1}
              sx={{ width: isMobile ? '100%' : 'auto' }}
            >
              {status.status === 'active' && !proposal.hasVoted && (
                <Button
                  size={isMobile ? "medium" : "small"}
                  variant="contained"
                  startIcon={<HowToVote />}
                  onClick={() => {
                    setSelectedProposal(proposal);
                    setViewDialogOpen(true);
                  }}
                  sx={{
                    minHeight: isMobile ? 44 : 'auto',
                    fontSize: isMobile ? '0.9rem' : '0.875rem',
                    '&:active': {
                      transform: 'scale(0.95)',
                    },
                  }}
                  fullWidth={isMobile}
                >
                  Vote
                </Button>
              )}

              {proposal.hasVoted && (
                <Chip
                  label="Voted"
                  color="success"
                  size={isMobile ? "medium" : "small"}
                  icon={<CheckCircle />}
                  sx={{
                    alignSelf: isMobile ? 'flex-start' : 'center',
                  }}
                />
              )}

              <Button
                size={isMobile ? "medium" : "small"}
                variant="outlined"
                startIcon={<Visibility />}
                onClick={() => {
                  setSelectedProposal(proposal);
                  setViewDialogOpen(true);
                }}
                sx={{
                  minHeight: isMobile ? 44 : 'auto',
                  fontSize: isMobile ? '0.9rem' : '0.875rem',
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                }}
                fullWidth={isMobile}
              >
                View
              </Button>
            </Stack>
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
      aria-label={`Proposal voting for ${chamaName}`}
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
          id={generateId('proposals-heading')}
          sx={{
            fontWeight: 600,
            fontSize: isMobile ? '1.5rem' : '1.25rem',
          }}
        >
          Proposals & Voting
        </Typography>
        {isCreator && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenCreateDialog}
            size={isMobile ? "large" : "medium"}
            aria-label="Create new proposal"
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
            Create Proposal
          </Button>
        )}
      </Box>

      {chamaProposals.length === 0 ? (
        <Paper
          role="status"
          aria-label="No proposals available"
          sx={{
            p: 4,
            textAlign: 'center',
            bgcolor: 'grey.50',
            ...getHighContrastStyles()
          }}
        >
          <TrendingUp
            sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }}
            aria-hidden="true"
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Proposals Yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isCreator 
              ? 'Create the first proposal to get member input on important decisions.'
              : 'No proposals have been created yet. Check back later for voting opportunities.'
            }
          </Typography>
        </Paper>
      ) : (
        <Box
          ref={proposalsListRef}
          role="feed"
          aria-label={`${chamaProposals.length} proposals`}
          aria-describedby={generateId('proposals-heading')}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          {chamaProposals.map((proposal, index) => (
            <ProposalCard key={proposal.id} proposal={proposal} index={index} />
          ))}
        </Box>
      )}

      {/* Create Proposal Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        aria-labelledby={generateId('create-proposal-title')}
        aria-describedby={generateId('create-proposal-description')}
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
          id={generateId('create-proposal-title')}
          sx={{
            fontSize: isMobile ? '1.25rem' : '1.25rem',
            fontWeight: 600,
            pb: isMobile ? 1 : 2,
          }}
        >
          Create New Proposal
        </DialogTitle>
        <DialogContent sx={{ px: isMobile ? 2 : 3 }}>
          <Stack spacing={isMobile ? 3 : 3} sx={{ mt: 1 }}>
            <TextField
              label="Proposal Title"
              fullWidth
              value={newProposal.title}
              onChange={(e) => setNewProposal(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter a clear, concise title"
              size={isMobile ? "medium" : "small"}
              sx={{
                '& .MuiInputBase-input': isMobile ? {
                  fontSize: '1rem',
                  padding: '16px 14px',
                } : {},
              }}
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={isMobile ? 4 : 3}
              value={newProposal.description}
              onChange={(e) => setNewProposal(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Provide details about what members are voting on"
              size={isMobile ? "medium" : "small"}
              sx={{
                '& .MuiInputBase-input': isMobile ? {
                  fontSize: '1rem',
                } : {},
              }}
            />

            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 2,
                  fontSize: isMobile ? '1rem' : '0.875rem',
                  fontWeight: 600,
                }}
              >
                Voting Options
              </Typography>
              {newProposal.options.map((option, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: isMobile ? 2 : 1 }}>
                  <TextField
                    fullWidth
                    size={isMobile ? "medium" : "small"}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    sx={{
                      '& .MuiInputBase-input': isMobile ? {
                        fontSize: '1rem',
                        padding: '14px 12px',
                      } : {},
                    }}
                  />
                  {newProposal.options.length > 2 && (
                    <IconButton
                      onClick={() => removeOption(index)}
                      color="error"
                      size={isMobile ? "medium" : "small"}
                      sx={{
                        minWidth: isMobile ? 48 : 'auto',
                        minHeight: isMobile ? 48 : 'auto',
                        '&:active': {
                          transform: 'scale(0.95)',
                        },
                      }}
                    >
                      <Cancel />
                    </IconButton>
                  )}
                </Box>
              ))}
              <Button
                size={isMobile ? "medium" : "small"}
                onClick={addOption}
                startIcon={<Add />}
                sx={{
                  mt: 1,
                  minHeight: isMobile ? 44 : 'auto',
                  fontSize: isMobile ? '0.9rem' : '0.875rem',
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                }}
              >
                Add Option
              </Button>
            </Box>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Voting Deadline"
                value={newProposal.deadline}
                onChange={(newValue) => setNewProposal(prev => ({ ...prev, deadline: newValue }))}
                minDateTime={dayjs()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </LocalizationProvider>
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
            onClick={() => setCreateDialogOpen(false)}
            size={isMobile ? "large" : "medium"}
            sx={{
              minHeight: isMobile ? 48 : 'auto',
              fontSize: isMobile ? '1rem' : '0.875rem',
            }}
            fullWidth={isMobile}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateProposal}
            variant="contained"
            disabled={!newProposal.title.trim() || !newProposal.description.trim() ||
                     newProposal.options.filter(opt => opt.trim()).length < 2}
            size={isMobile ? "large" : "medium"}
            sx={{
              minHeight: isMobile ? 48 : 'auto',
              fontSize: isMobile ? '1rem' : '0.875rem',
              '&:active': {
                transform: 'scale(0.95)',
              },
            }}
            fullWidth={isMobile}
          >
            Create Proposal
          </Button>
        </DialogActions>
      </Dialog>

      {/* Vote/View Proposal Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            ...(isMobile && {
              margin: 0,
              borderRadius: 0,
              maxHeight: '100vh',
            }),
          },
        }}
      >
        {selectedProposal && (
          <>
            <DialogTitle
              sx={{
                fontSize: isMobile ? '1.25rem' : '1.25rem',
                fontWeight: 600,
                pb: isMobile ? 1 : 2,
              }}
            >
              {selectedProposal.title}
            </DialogTitle>
            <DialogContent sx={{ px: isMobile ? 2 : 3 }}>
              <Typography
                variant="body2"
                sx={{
                  mb: 3,
                  fontSize: isMobile ? '0.95rem' : '0.875rem',
                  lineHeight: isMobile ? 1.5 : 1.43,
                }}
              >
                {selectedProposal.description}
              </Typography>

              {!selectedProposal.hasVoted && getProposalStatus(selectedProposal).status === 'active' ? (
                <FormControl component="fieldset" sx={{ width: '100%' }}>
                  <FormLabel
                    component="legend"
                    sx={{
                      fontSize: isMobile ? '1rem' : '0.875rem',
                      fontWeight: 600,
                      mb: isMobile ? 2 : 1,
                    }}
                  >
                    Choose your vote:
                  </FormLabel>
                  <RadioGroup sx={{ gap: isMobile ? 1 : 0.5 }}>
                    {selectedProposal.options.map((option, index) => (
                      <FormControlLabel
                        key={index}
                        value={index}
                        control={
                          <Radio
                            sx={{
                              '&.Mui-checked': {
                                color: 'primary.main',
                              },
                              ...(isMobile && {
                                padding: 1.5,
                              }),
                            }}
                          />
                        }
                        label={
                          <Typography
                            sx={{
                              fontSize: isMobile ? '1rem' : '0.875rem',
                              fontWeight: 500,
                            }}
                          >
                            {option}
                          </Typography>
                        }
                        onClick={() => handleVote(selectedProposal.id, index)}
                        sx={{
                          margin: 0,
                          padding: isMobile ? 1.5 : 1,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                          '&:active': isMobile ? {
                            transform: 'scale(0.98)',
                          } : {},
                          mb: isMobile ? 1 : 0.5,
                        }}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              ) : (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Current Results:
                  </Typography>
                  {selectedProposal.options.map((option, index) => {
                    const voteCount = selectedProposal.votes?.[index] || 0;
                    const percentages = calculateVotePercentages(selectedProposal.votes);
                    const percentage = percentages[index] || 0;
                    
                    return (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2">{option}</Typography>
                          <Typography variant="caption">
                            {voteCount} votes ({percentage.toFixed(1)}%)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={percentage}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ProposalVoting;
