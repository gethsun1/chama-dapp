import React from 'react';
import { Button, Chip } from '@mui/material';
import { AccountBalanceWallet } from '@mui/icons-material';
import { useNetwork, Networks } from './contexts/NetworkContext';
import { useStarknetWallet } from './contexts/StarknetWalletContext';
import { useAppKitAccount } from '@reown/appkit/react';

export default function ConnectButton(props) {
  const { selected } = useNetwork();
  const { isConnected: starknetConnected, connect: connectStarknet, disconnect: disconnectStarknet, address: starknetAddress } = useStarknetWallet();
  const { isConnected: evmConnected, address: evmAddress } = useAppKitAccount();

  // Determine current connection state based on selected network
  const isConnected = selected === Networks.STARKNET ? starknetConnected : evmConnected;
  const currentAddress = selected === Networks.STARKNET ? starknetAddress : evmAddress;

  const handleConnect = async () => {
    if (selected === Networks.STARKNET) {
      try {
        await connectStarknet();
      } catch (error) {
        console.error('Failed to connect Starknet wallet:', error);
      }
    }
    // For EVM, AppKit handles the connection automatically
  };

  const handleDisconnect = () => {
    if (selected === Networks.STARKNET) {
      disconnectStarknet();
    }
    // For EVM, AppKit handles the disconnection automatically
  };

  // If EVM is selected, show AppKit button
  if (selected === Networks.EVM_SCROLL) {
    return <appkit-button style={props.style} />;
  }

  // If Starknet is selected, show custom Starknet connection button
  if (selected === Networks.STARKNET) {
    if (isConnected) {
      return (
        <Button
          variant="outlined"
          startIcon={<AccountBalanceWallet />}
          onClick={handleDisconnect}
          sx={{
            backgroundColor: "white",
            color: "black",
            border: "2px solid black",
            borderRadius: "8px",
            padding: "8px 16px",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": {
              backgroundColor: "black",
              color: "white",
            },
            ...props.style
          }}
        >
          {starknetAddress ? `${starknetAddress.slice(0, 6)}...${starknetAddress.slice(-4)}` : 'Disconnect'}
        </Button>
      );
    }

    return (
      <Button
        variant="contained"
        startIcon={<AccountBalanceWallet />}
        onClick={handleConnect}
        sx={{
          backgroundColor: "black",
          color: "white",
          border: "2px solid white",
          borderRadius: "8px",
          padding: "8px 16px",
          textTransform: "none",
          fontWeight: 600,
          "&:hover": {
            backgroundColor: "white",
            color: "black",
          },
          ...props.style
        }}
      >
        Connect Starknet
      </Button>
    );
  }

  // Fallback
  return null;
}
