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
  Snackbar,
  Alert,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Add, Remove } from '@mui/icons-material';
import {
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitProvider,
} from '@reown/appkit/react';
import { Contract, BrowserProvider, parseUnits } from 'ethers';
import { useNavigate } from 'react-router-dom';
import { ChamaFactoryABI, contractAddress } from '../contracts/ChamaFactoryConfig';

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

  // Toast state
  const [toastOpen, setToastOpen] = useState(false);

  // AppKit hooks for wallet connection and network info
  const { isConnected, address } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const { walletProvider } = useAppKitProvider('eip155');

  // For navigation
  const navigate = useNavigate();

  useEffect(() => {
    console.log("[DEBUG] Wallet Status:", {
      isConnected,
      chainId,
      expectedChain: EXPECTED_CHAIN_ID,
      address,
      walletProvider,
    });
  }, [isConnected, chainId, address, walletProvider]);

  const handleIncrementMaxMembers = () => setMaxMembers(prev => prev + 1);
  const handleDecrementMaxMembers = () => {
    if (maxMembers > 1) setMaxMembers(prev => prev - 1);
  };

  // Helper function to map contribution cycle to duration in seconds
  const getCycleDuration = (cycle) => {
    const durations = {
      daily: 86400,
      weekly: 604800,
      monthly: 2592000,
    };
    return durations[cycle.toLowerCase()] || 86400;
  };

  // Helper to get a human-readable cycle string (e.g., "Daily")
  const getHumanReadableCycle = (cycle) => {
    const mapping = {
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
    };
    return mapping[cycle.toLowerCase()] || `${cycle} sec`;
  };

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
      const depositValue = parseFloat(depositAmount);
      const contributionValue = parseFloat(contributionAmount);
      if (isNaN(depositValue)) throw new Error("Invalid deposit amount");
      if (isNaN(contributionValue)) throw new Error("Invalid contribution amount");

      // Convert amounts using ethers' parseUnits (returns bigint)
      const depositInWei = parseUnits(depositAmount, 18);
      const contributionInWei = parseUnits(contributionAmount, 18);
      const cycleDurationNumeric = getCycleDuration(contributionCycle);

      console.log("[VALUES] Converted:", {
        depositInWei: depositInWei.toString(),
        contributionInWei: contributionInWei.toString(),
        penalty: Math.round(penalty),
        maxMembers,
        cycleDuration: cycleDurationNumeric,
      });

      if (!walletProvider) {
        throw new Error("No injected provider found via AppKit");
      }
      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      if (!signer) {
        throw new Error("No signer available");
      }

      const contract = new Contract(contractAddress, ChamaFactoryABI, signer);
      const tx = await contract.createChama(
        chamaName.trim(),
        description.trim(),
        depositInWei,
        contributionInWei,
        BigInt(Math.round(penalty)),
        BigInt(maxMembers),
        BigInt(cycleDurationNumeric)
      );
      console.log("[TX SENT] Hash:", tx.hash);
      await tx.wait();
      console.log("[TX CONFIRMED]");

      // Prepare notification payload
      const notifyPayload = {
        chamaName: chamaName.trim(),
        description: description.trim(),
        depositAmount, // as entered by user (in ETH)
        contributionAmount, // as entered by user (in ETH)
        cycleDuration: getHumanReadableCycle(contributionCycle),
        penalty: Math.round(penalty),
      };

      // Trigger email notifications via notify endpoint
      try {
        const notifyResponse = await fetch('http://localhost:3000/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notifyPayload),
        });
        const notifyData = await notifyResponse.json();
        console.log("[NOTIFY] Response:", notifyData);
      } catch (notifyError) {
        console.error("[NOTIFY ERROR]", notifyError);
      }

      // Show toast and redirect after a short delay
      setToastOpen(true);
      setTimeout(() => {
        navigate("/join-chama");
      }, 2000);
    } catch (error) {
      console.error("[ERROR]", error);
      alert(`Submission failed: ${error.shortMessage || error.message}`);
    }
  };

  const handleCancel = () => {
    console.log('Creation cancelled');
  };

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
          {/* Coming soon notice for Starknet */}
          <Box sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: 'warning.50', border: 1, borderColor: 'warning.main' }}>
            <Typography variant="body2" color="text.primary">
              Starknet support: Coming soon. Current Create Chama flow targets Scroll Sepolia (EVM).
            </Typography>
          </Box>
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
                disabled={!isFormEnabled}
              >
                Create Chama
              </Button>
            </Box>
          </Box>
        </Paper>
      </Fade>
      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToastOpen(false)} severity="success" sx={{ width: '100%' }}>
          Chama has been created successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreateChama;
