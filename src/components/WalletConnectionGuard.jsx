// src/components/WalletConnectionGuard.jsx
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  Stack,
  Chip,
} from '@mui/material';
import {
  AccountBalanceWallet,
  Warning,
  NetworkCheck,
} from '@mui/icons-material';
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import ConnectButton from '../ConnectButton';

const WalletConnectionGuard = ({ 
  children, 
  requireNetwork = true,
  showNetworkWarning = true,
  customMessage = null 
}) => {
  const { isConnected, address } = useAppKitAccount();
  const { caipNetwork } = useAppKitNetwork();

  // Check if connected to Scroll Sepolia (chainId: 534351)
  const isCorrectNetwork = caipNetwork?.id === '534351' || caipNetwork?.id === 534351;
  const networkName = caipNetwork?.name || 'Unknown Network';

  // If wallet is connected and network is correct (or network check is disabled), render children
  if (isConnected && (!requireNetwork || isCorrectNetwork)) {
    return children;
  }

  // If wallet is not connected, show connection prompt
  if (!isConnected) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Card elevation={2}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <AccountBalanceWallet 
              sx={{ 
                fontSize: 80, 
                color: 'primary.main', 
                mb: 3,
                opacity: 0.8 
              }} 
            />
            <Typography variant="h4" gutterBottom color="text.primary">
              Connect Your Wallet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
              {customMessage || 
                'To access this feature, please connect your wallet. We support all major Ethereum wallets and ensure your security through decentralized authentication.'
              }
            </Typography>
            
            <Stack spacing={3} alignItems="center">
              <ConnectButton />
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Supported Networks:
                </Typography>
                <Stack direction="row" spacing={1} justifyContent="center">
                  <Chip 
                    label="Scroll Sepolia" 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                  <Chip 
                    label="Scroll Mainnet" 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // If wallet is connected but wrong network, show network warning
  if (isConnected && requireNetwork && !isCorrectNetwork && showNetworkWarning) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Card elevation={2}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Warning 
              sx={{ 
                fontSize: 80, 
                color: 'warning.main', 
                mb: 3,
                opacity: 0.8 
              }} 
            />
            <Typography variant="h4" gutterBottom color="text.primary">
              Wrong Network
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              You're currently connected to <strong>{networkName}</strong>. 
              Please switch to Scroll Sepolia to use this application.
            </Typography>
            
            <Alert severity="info" sx={{ mb: 4, textAlign: 'left' }}>
              <Typography variant="body2">
                <strong>How to switch networks:</strong>
              </Typography>
              <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                1. Open your wallet (MetaMask, etc.)<br/>
                2. Click on the network dropdown<br/>
                3. Select "Scroll Sepolia" or add it manually<br/>
                4. Refresh this page
              </Typography>
            </Alert>

            <Stack spacing={2} alignItems="center">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NetworkCheck color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Connected to: <Chip label={networkName} size="small" color="warning" />
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Required Network:
                </Typography>
                <Chip 
                  label="Scroll Sepolia (Chain ID: 534351)" 
                  size="small" 
                  color="primary" 
                />
              </Box>
              
              <Button 
                variant="outlined" 
                onClick={() => window.location.reload()}
                sx={{ mt: 2 }}
              >
                Refresh Page
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // Fallback - should not reach here normally
  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Alert severity="error">
        <Typography variant="body1">
          Unable to verify wallet connection status. Please refresh the page.
        </Typography>
      </Alert>
    </Container>
  );
};

export default WalletConnectionGuard;
