import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

function Home() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh',
      }}
    >
      <Paper elevation={4} sx={{ p: 4, textAlign: 'center', maxWidth: 500 }}>
        <Typography variant="h4" color="primary" gutterBottom>
          Welcome to Chama DApp
        </Typography>
        <Typography variant="body1">
          A decentralized way to manage savings groups securely on the blockchain.
        </Typography>
      </Paper>
    </Box>
  );
}

export default Home;
