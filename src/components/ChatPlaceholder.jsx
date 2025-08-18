// src/components/ChatPlaceholder.jsx
import React, { useState } from 'react';
import { Fab, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';

const ChatPlaceholder = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      {/* Floating Chat Button */}
      <Fab
        color="primary"
        aria-label="chat"
        onClick={handleOpen}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <ChatIcon />
      </Fab>

      {/* Chat Placeholder Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>AI Assistant (Coming Soon Chama Dapp AI Assistant)</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Our AI assistant will soon be available to help guide you through Chama Dapp!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChatPlaceholder;
