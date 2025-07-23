// src/components/ChamaCard.jsx
import React, { useState, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  IconButton,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Snackbar,
  Alert,
  Stack,
  Chip,
} from "@mui/material";
import {
  ContentCopy,
  WhatsApp,
  Telegram,
  Twitter,
  Email,
  Schedule,
  AccountBalance,
  TrendingUp,
  Warning,
  Chat,
} from "@mui/icons-material";
import StatusIndicator from "../components/StatusIndicator";

const ChamaCard = React.memo(({ chama, onContribute, onOpenCommunication }) => {
  // State to control the share modal visibility
  const [shareModalOpen, setShareModalOpen] = useState(false);
  // State to manage the snackbar for copied link confirmation
  const [copySnackbarOpen, setCopySnackbarOpen] = useState(false);

  // Memoize the shareable URL
  const shareUrl = useMemo(() =>
    `https://chama-dapp.vercel.app/chama/${chama.id}`,
    [chama.id]
  );

  // Memoize formatted cycle duration
  const formattedCycleDuration = useMemo(() => {
    if (!chama.cycleDuration) return "N/A";
    const duration = Number(chama.cycleDuration);
    switch (duration) {
      case 86400: return "Daily";
      case 604800: return "Weekly";
      case 2592000: return "Monthly";
      default: return `${duration} sec`;
    }
  }, [chama.cycleDuration]);

  // Memoize chama status
  const chamaStatus = useMemo(() => {
    // Add logic to determine status based on chama data
    if (chama.isActive) return 'active';
    if (chama.isPaused) return 'paused';
    if (chama.isCompleted) return 'completed';
    return 'pending';
  }, [chama.isActive, chama.isPaused, chama.isCompleted]);

  // Memoized callback for copying URL
  const handleCopyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySnackbarOpen(true);
    } catch (error) {
      console.error("Failed to copy URL:", error);
    }
  }, [shareUrl]);

  // Memoized callback for contributing
  const handleContribute = useCallback(() => {
    if (onContribute) {
      onContribute(chama);
    } else {
      alert(`Contribute to ${chama.name} coming soon!`);
    }
  }, [chama, onContribute]);

  // Memoized callback for opening share modal
  const handleOpenShareModal = useCallback(() => {
    setShareModalOpen(true);
  }, []);

  // Memoized callback for closing share modal
  const handleCloseShareModal = useCallback(() => {
    setShareModalOpen(false);
  }, []);

  // Memoized callback for closing snackbar
  const handleCloseSnackbar = useCallback(() => {
    setCopySnackbarOpen(false);
  }, []);

  return (
    <>
      <Card sx={{ mb: 2, transition: 'all 0.2s ease-in-out', '&:hover': { boxShadow: 3 } }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {chama.name}
              </Typography>
              <StatusIndicator
                status={chamaStatus}
                variant="chip"
                size="small"
              />
            </Box>
          }
          sx={{ pb: 1 }}
        />
        <CardContent sx={{ pt: 0 }}>
          <Stack spacing={2}>
            {/* Chama Details Grid */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Cycle
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formattedCycleDuration}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountBalance sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Deposit
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {chama.depositAmount ? `${chama.depositAmount} ETH` : "N/A"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUp sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Contribution
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {chama.contributionAmount ? `${chama.contributionAmount} ETH` : "N/A"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Warning sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Penalty
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {chama.penalty ? `${chama.penalty}%` : "N/A"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 1, pt: 1, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleContribute}
                sx={{ flex: 1, minWidth: "120px" }}
                startIcon={<TrendingUp />}
              >
                Contribute
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleOpenShareModal}
                sx={{ flex: 1, minWidth: "120px" }}
                startIcon={<Email />}
              >
                Invite Members
              </Button>
              {onOpenCommunication && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={onOpenCommunication}
                  sx={{ flex: 1, minWidth: "120px" }}
                  startIcon={<Chat />}
                >
                  Communication
                </Button>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Share Modal for inviting members */}
      <Dialog open={shareModalOpen} onClose={handleCloseShareModal} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 600 }}>
          Invite Members to {chama.name}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Typography variant="body1">
              Share this link to invite members:
            </Typography>

            <Box sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              p: 2,
              backgroundColor: 'grey.50',
              borderRadius: 1,
              border: 1,
              borderColor: 'divider'
            }}>
              <Typography
                variant="body2"
                sx={{
                  flex: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  wordBreak: 'break-all'
                }}
              >
                {shareUrl}
              </Typography>
              <IconButton
                onClick={handleCopyUrl}
                title="Copy Share URL"
                size="small"
                sx={{ '&:hover': { backgroundColor: 'primary.50' } }}
              >
                <ContentCopy />
              </IconButton>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Share via:
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton
                  color="success"
                  onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareUrl)}`, '_blank')}
                  title="Share on WhatsApp"
                >
                  <WhatsApp />
                </IconButton>
                <IconButton
                  color="info"
                  onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}`, '_blank')}
                  title="Share on Telegram"
                >
                  <Telegram />
                </IconButton>
                <IconButton
                  color="primary"
                  onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`, '_blank')}
                  title="Share on Twitter"
                >
                  <Twitter />
                </IconButton>
                <IconButton
                  color="secondary"
                  onClick={() => window.location.href = `mailto:?subject=Join%20Chama&body=${encodeURIComponent(shareUrl)}`}
                  title="Share via Email"
                >
                  <Email />
                </IconButton>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseShareModal} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar notification when URL is copied */}
      <Snackbar
        open={copySnackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: "100%" }}>
          Share URL copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
});

// Add display name for debugging
ChamaCard.displayName = 'ChamaCard';

export default ChamaCard;
