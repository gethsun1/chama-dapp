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
import { useStarknetWallet } from '../contexts/StarknetWalletContext';
import { useNetwork, Networks } from '../contexts/NetworkContext';
import ConnectButton from '../ConnectButton';

const WalletConnectionGuard = ({ 
  children, 
  requireNetwork = true,
  showNetworkWarning = true,
  customMessage = null 
}) => {
  const { isConnected: evmConnected, address: evmAddress } = useAppKitAccount();
  const { caipNetwork } = useAppKitNetwork();
  const { isConnected: starknetConnected, address: starknetAddress } = useStarknetWallet();
  const { selected } = useNetwork();

  // Determine current connection state based on selected network
  const isConnected = selected === Networks.STARKNET ? starknetConnected : evmConnected;
  const address = selected === Networks.STARKNET ? starknetAddress : evmAddress;

  // Check if connected to correct network based on selection
  let isCorrectNetwork = false;
  let networkName = 'Unknown Network';
  
  if (selected === Networks.EVM_SCROLL) {
    // Check if connected to Scroll Sepolia (chainId: 534351)
    isCorrectNetwork = caipNetwork?.id === '534351' || caipNetwork?.id === 534351;
    networkName = caipNetwork?.name || 'Unknown Network';
  } else if (selected === Networks.STARKNET) {
    // For Starknet, we consider it correct if connected (Starknet wallets auto-detect network)
    isCorrectNetwork = starknetConnected;
    networkName = 'Starknet Sepolia';
  }

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
              Connect Your {selected === Networks.STARKNET ? 'Starknet' : 'EVM'} Wallet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
              {customMessage || 
                `To access this feature, please connect your ${selected === Networks.STARKNET ? 'Starknet' : 'EVM'} wallet. We support ${selected === Networks.STARKNET ? 'Argent X and Braavos' : 'all major Ethereum wallets'} and ensure your security through decentralized authentication.`
              }
            </Typography>
            
            <Stack spacing={3} alignItems="center">
              <ConnectButton />
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Selected Network:
                </Typography>
                <Stack direction="row" spacing={1} justifyContent="center">
                  <Chip 
                    label={selected === Networks.STARKNET ? 'Starknet Sepolia' : 'Scroll Sepolia'} 
                    size="small" 
                    color="primary" 
                    variant="filled" 
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
              Wrong Network Detected
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
              {selected === Networks.STARKNET 
                ? 'Please connect to Starknet Sepolia network to continue.'
                : 'Please switch to Scroll Sepolia network to continue.'
              }
            </Typography>
            
            <Stack spacing={3} alignItems="center">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <NetworkCheck color="warning" />
                <Typography variant="body2" color="text.secondary">
                  Current: {networkName}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Required Network:
                </Typography>
                <Chip 
                  label={selected === Networks.STARKNET ? 'Starknet Sepolia' : 'Scroll Sepolia'} 
                  size="small" 
                  color="success" 
                  variant="outlined" 
                />
              </Box>
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
