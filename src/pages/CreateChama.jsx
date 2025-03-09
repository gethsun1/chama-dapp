// src/pages/CreateChama.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Slider,
  MenuItem,
  IconButton,
  Fade,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Add, Remove } from '@mui/icons-material';
import { useAccount, useChainId, useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';
import ChamaFactoryABI from '../contracts/ChamaFactoryABI.json';

const contractAddress = "0x154d1E286A9A3c1d4B1e853A9a7e61b1e934B756";
// Expected chain id for Scroll Sepolia Testnet
const EXPECTED_CHAIN_ID = 534351;

const CreateChama = () => {
  // Form state
  const [chamaName, setChamaName] = useState('');
  const [description, setDescription] = useState('');
  const [startDateTime, setStartDateTime] = useState(new Date());
  const [contributionCycle, setContributionCycle] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');
  const [penalty, setPenalty] = useState(0);
  const [maxMembers, setMaxMembers] = useState(1);
  const [rules, setRules] = useState('');
  const [formVisible, setFormVisible] = useState(true);

  // Wallet and network hooks
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  // Debug logging wallet status
  useEffect(() => {
    console.log("[DEBUG] Wallet Status:", { 
      isConnected, 
      chainId, 
      expectedChain: EXPECTED_CHAIN_ID,
      address
    });
  }, [isConnected, chainId, address]);

  // Handlers for maximum members stepper
  const handleIncrementMaxMembers = () => setMaxMembers(prev => prev + 1);
  const handleDecrementMaxMembers = () => {
    if (maxMembers > 1) setMaxMembers(prev => prev - 1);
  };

  // Prepare the write contract hook for creating a Chama.
  // Note the mode: 'recklesslyUnprepared' which forces initialization.
  const { write: createChamaWrite, isLoading: createLoading, error } = useWriteContract({
    mode: 'recklesslyUnprepared',
    address: contractAddress,
    abi: ChamaFactoryABI,
    functionName: 'createChama',
    mutation: {
      onError: (error) => {
        console.error("[TX ERROR]", error);
        console.log("Error details:", {
          cause: error.cause,
          metaMessages: error.metaMessages,
          details: error.details
        });
      },
      onSuccess: (txHash) => {
        console.log("[TX SUCCESS] Hash:", txHash);
      },
      onSettled: () => {
        console.log("[TX SETTLED]");
      }
    },
  });

  // Helper function to map contribution cycle to seconds
  const getCycleDuration = (cycle) => {
    const durations = {
      daily: 86400,
      weekly: 604800,
      monthly: 2592000,
    };
    return durations[cycle.toLowerCase()] || 86400;
  };

  // Handler for form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      console.log("[SUBMIT] Initiating creation...");

      if (!isConnected) {
        alert("Please connect your wallet.");
        return;
      }
      if (chainId !== EXPECTED_CHAIN_ID) {
        alert("Please switch to the Scroll Sepolia Testnet.");
        return;
      }
      if (!contributionCycle || !depositAmount || !contributionAmount) {
        alert("Missing required fields");
        return;
      }

      // Validate numeric values
      const depositValue = Number(depositAmount);
      const contributionValue = Number(contributionAmount);
      if (isNaN(depositValue)) throw new Error("Invalid deposit amount");
      if (isNaN(contributionValue)) throw new Error("Invalid contribution amount");

      // Convert amounts from ETH to Wei using viem's parseUnits.
      const depositInWei = parseUnits(depositValue.toFixed(18), 18);
      const contributionInWei = parseUnits(contributionValue.toFixed(18), 18);

      console.log("[VALUES] Converted:", {
        depositInWei: depositInWei.toString(),
        contributionInWei: contributionInWei.toString(),
        penalty: Math.round(penalty),
        maxMembers,
      });

      // Ensure write function is available
      if (!createChamaWrite) {
        throw new Error("Write function not initialized");
      }

      createChamaWrite({
        args: [
          chamaName.trim(),
          description.trim(),
          depositInWei,
          contributionInWei,
          Math.round(penalty),
          maxMembers,
          getCycleDuration(contributionCycle),
        ],
      });
    } catch (error) {
      console.error("[VALIDATION ERROR]", error);
      alert(`Submission failed: ${error.message}`);
    }
  };

  // Handler for cancellation
  const handleCancel = () => {
    console.log('Creation cancelled');
  };

  // Determine if form can be submitted
  const isFormEnabled = isConnected && chainId === EXPECTED_CHAIN_ID;

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Fade in={formVisible} timeout={1000}>
        <Paper
          elevation={4}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ffffff, #f7f9fc)',
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
            Create Your Chama
          </Typography>
          <Typography variant="body2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Fill out the details below to launch your decentralized savings group.
          </Typography>
          {!isConnected && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              Please connect your wallet to create a Chama.
            </Typography>
          )}
          {isConnected && chainId !== EXPECTED_CHAIN_ID && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              Please switch to the Scroll Sepolia Testnet.
            </Typography>
          )}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Chama Name"
                  fullWidth
                  required
                  value={chamaName}
                  onChange={(e) => setChamaName(e.target.value)}
                  inputProps={{ 'aria-label': 'Chama Name' }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description & Goals"
                  fullWidth
                  multiline
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  inputProps={{ 'aria-label': 'Description and Goals' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Start Date & Time"
                    value={startDateTime}
                    onChange={(newValue) => setStartDateTime(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        required
                        inputProps={{
                          ...params.inputProps,
                          'aria-label': 'Start Date and Time',
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Contribution Cycle"
                  select
                  fullWidth
                  required
                  value={contributionCycle}
                  onChange={(e) => setContributionCycle(e.target.value)}
                  inputProps={{ 'aria-label': 'Contribution Cycle' }}
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Deposit Amount (ETH)"
                  type="number"
                  fullWidth
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  inputProps={{ 'aria-label': 'Deposit Amount', min: 0, step: "any" }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Contribution Amount per Cycle (ETH)"
                  type="number"
                  fullWidth
                  required
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  inputProps={{ 'aria-label': 'Contribution Amount per Cycle', min: 0, step: "any" }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Penalty Slash (in %): {penalty}%
                </Typography>
                <Slider
                  value={penalty}
                  onChange={(e, newValue) => setPenalty(newValue)}
                  min={0}
                  max={100}
                  valueLabelDisplay="auto"
                  aria-labelledby="penalty-slider"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Maximum Members
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton onClick={handleDecrementMaxMembers} aria-label="Decrease maximum members">
                    <Remove />
                  </IconButton>
                  <Typography variant="body1" sx={{ mx: 2 }} aria-label="Maximum Members Count">
                    {maxMembers}
                  </Typography>
                  <IconButton onClick={handleIncrementMaxMembers} aria-label="Increase maximum members">
                    <Add />
                  </IconButton>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Rules & Regulations"
                  fullWidth
                  multiline
                  rows={3}
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  inputProps={{ 'aria-label': 'Rules and Regulations' }}
                />
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCancel}
                sx={{ transition: 'all 0.3s ease', '&:hover': { transform: 'scale(1.02)' } }}
                aria-label="Cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ transition: 'all 0.3s ease', '&:hover': { transform: 'scale(1.02)' } }}
                aria-label="Create Chama"
                disabled={!isFormEnabled || createLoading}
              >
                {createLoading ? "Creating..." : "Create Chama"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Fade>
    </Container>
  );
};

export default CreateChama;
