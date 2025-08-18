// src/components/EmailSubscription.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';

const EmailSubscription = () => {
  const [open, setOpen] = useState(true); // show popup on first render
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = async () => {
    try {
      console.log('Subscribing email:', email);
      const response = await fetch('http://localhost:3000/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (response.ok) {
        setSubmitted(true);
        setOpen(false);
        alert("Subscription successful! You'll receive updates from Chama Dapp.");
      } else {
        console.error("Subscription failed:", data.error);
        alert(`Subscription failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Error subscribing email:", error);
      alert("An error occurred while subscribing. Please try again.");
    }
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>Subscribe for Updates</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" gutterBottom>
            Enter your email address to receive the latest updates, including notifications when new Chamas are created.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="standard"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubscribe} color="primary" disabled={!email}>
          Subscribe
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmailSubscription;
