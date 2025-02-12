import React, { useState } from 'react';
import { Typography, Paper, Box, Button } from '@mui/material';
import Web3Modal from 'web3modal';
import { BrowserProvider } from 'ethers';

function Home() {
  const [walletAddress, setWalletAddress] = useState(null);

  const connectWallet = async () => {
    try {
      // Create an instance of Web3Modal
      const web3Modal = new Web3Modal({
        cacheProvider: false, 
      });

      // Open the wallet connection modal
      const instance = await web3Modal.connect();

      // Create an ethers provider using BrowserProvider (ethers v6)
      const provider = new BrowserProvider(instance);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setWalletAddress(address);
    } catch (error) {
      console.error('Wallet connection error:', error);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh',
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          textAlign: 'center',
          maxWidth: 500,
          backgroundColor: 'rgba(255,255,255,0.7)', 
          backdropFilter: 'blur(8px)', 
        }}
      >
        <Typography variant="h4" color="primary" gutterBottom>
          Welcome to Chama DApp
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          A decentralized way to manage savings groups securely on the blockchain.
        </Typography>
        {walletAddress ? (
          <Typography variant="body2" color="textSecondary">
            Connected: {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
          </Typography>
        ) : (
          <Button variant="contained" color="primary" onClick={connectWallet}>
            Connect Wallet
          </Button>
        )}
      </Paper>
    </Box>
  );
}

export default Home;
