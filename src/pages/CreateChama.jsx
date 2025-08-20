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
import { STARKNET_NETWORK } from '../contracts/StarknetFactoryConfig';
import { cairo, Contract as SnContract, RpcProvider, hash } from 'starknet';
import { useNetwork, Networks } from '../contexts/NetworkContext';
import { useStarknetWallet } from '../contexts/StarknetWalletContext';
import { shortAddr, explorerContractUrl } from '../utils/starknet';

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
  // Starknet-only UI state
  const [snTokenAddress, setSnTokenAddress] = useState('0x0');
  const [snTokenError, setSnTokenError] = useState('');
  const [snTxHash, setSnTxHash] = useState('');
  const [snError, setSnError] = useState('');
  const [snCoreAddr, setSnCoreAddr] = useState('');
  const [snVaultAddr, setSnVaultAddr] = useState('');

  // Toast state
  const [toastOpen, setToastOpen] = useState(false);

  // AppKit hooks for EVM wallet connection and network info
  const { isConnected, address } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const { walletProvider } = useAppKitProvider('eip155');
  // Starknet wallet context
  const { selected } = useNetwork();
  const { isConnected: isSnConnected, address: snAddress, account: snAccount, connect: snConnect } = useStarknetWallet();

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
      if (!contributionCycle || !depositAmount || !contributionAmount) {
        alert("Missing required fields");
        return;
      }

      // Branch by network selection
      if (selected === Networks.STARKNET) {
        if (!isSnConnected) {
          await snConnect();
        }
        if (!snAccount || !snAddress) {
          throw new Error("Starknet wallet not connected");
        }
        // Validate token address
        if (snTokenAddress && snTokenAddress !== '0x0') {
          const { isValidStarknetAddress } = await import('../utils/starknet');
          if (!isValidStarknetAddress(snTokenAddress)) {
            setSnTokenError('Invalid Starknet address');
            return;
          }
        }

        // Convert to cairo u256 and numeric types using precise parseUnits
        const depositWei = parseUnits(depositAmount, 18);
        const contributionWei = parseUnits(contributionAmount, 18);
        const depositU256 = cairo.uint256(depositWei.toString());
        const contributionU256 = cairo.uint256(contributionWei.toString());
        const penaltyBps = Math.round(penalty); // keep % as integer for now
        const maxMembersU16 = Math.max(1, Math.min(65535, maxMembers));
        const cycleSecs = getCycleDuration(contributionCycle);

        // Minimal ABI for create_chama_udc; matches Cairo signature
        const factoryAbiSn = [
          {
            name: 'create_chama_udc',
            type: 'function',
            state_mutability: 'external',
            inputs: [
              { name: 'token', type: 'core::starknet::contract_address::ContractAddress' },
              { name: 'deposit_amount', type: 'core::integer::u256' },
              { name: 'contribution_amount', type: 'core::integer::u256' },
              { name: 'penalty_bps', type: 'core::integer::u16' },
              { name: 'max_members', type: 'core::integer::u16' },
              { name: 'cycle_duration_secs', type: 'core::integer::u64' },
            ],
            outputs: [
              { type: 'core::integer::u64' },
              { type: 'core::starknet::contract_address::ContractAddress' },
              { type: 'core::starknet::contract_address::ContractAddress' },
            ],
          },
        ];

        // Execute Starknet tx
        const factory = new SnContract(factoryAbiSn, STARKNET_NETWORK.factoryAddress, snAccount);
        setSnError('');
        setSnTxHash('');
        setSnCoreAddr('');
        setSnVaultAddr('');

        const tx = await factory.create_chama_udc(snTokenAddress || '0x0', depositU256, contributionU256, penaltyBps, maxMembersU16, cycleSecs);
        const txHash = tx?.transaction_hash || tx;
        setSnTxHash(String(txHash));
        console.log('[SN TX SENT]', txHash);

        // Wait for acceptance and try to read emitted event to get core/vault addresses
        const provider = new RpcProvider({ nodeUrl: STARKNET_NETWORK.rpcUrl });
        try {
          await provider.waitForTransaction(txHash);
          const receipt = await provider.getTransactionReceipt(txHash);
          if (receipt?.events?.length) {
            // Align with event schema: ChamaDeployed { id: u64, core: ContractAddress, vault: ContractAddress }
            // Starknet encodes typed event data as felts in `data` array in order
            const evt = receipt.events.find(e => (e.from_address || e.fromAddress) === STARKNET_NETWORK.factoryAddress) || receipt.events[0];
            const data = evt?.data || [];
            if (data.length >= 3) {
              // data[0]=id, data[1]=core, data[2]=vault as hex felts
              const coreHex = String(data[1]);
              const vaultHex = String(data[2]);
              setSnCoreAddr(coreHex);
              setSnVaultAddr(vaultHex);
            }
          }
        } catch (waitErr) {
          console.warn('[SN WAIT/RECEIPT WARN]', waitErr);
        }

        // If token provided, attempt ERC-20 approval for contribution amount to Vault (if discovered)
        if (snTokenAddress && snTokenAddress !== '0x0' && snVaultAddr) {
          try {
            const erc20Abi = [
              {
                name: 'approve',
                type: 'function',
                state_mutability: 'external',
                inputs: [
                  { name: 'spender', type: 'core::starknet::contract_address::ContractAddress' },
                  { name: 'amount', type: 'core::integer::u256' },
                ],
                outputs: [],
              },
            ];
            const token = new SnContract(erc20Abi, snTokenAddress, snAccount);
            await token.approve(snVaultAddr, contributionU256);
            console.log('[SN APPROVE] Submitted for spender', snVaultAddr);
          } catch (approveErr) {
            console.error('[SN APPROVE ERROR]', approveErr);
            setSnError(approveErr?.message || String(approveErr));
          }
        }

        // Show toast and link to explorer (keep on current page so user sees addresses)
        setToastOpen(true);
        return;
      }

      // Default EVM path (Scroll)
      if (!isConnected) {
        alert("Please connect your wallet.");
        return;
      }
      if (chainId !== EXPECTED_CHAIN_ID) {
        alert("Please switch to the Scroll Sepolia Testnet.");
        return;
      }

      const depositValue = parseFloat(depositAmount);
      const contributionValue = parseFloat(contributionAmount);
      if (isNaN(depositValue)) throw new Error("Invalid deposit amount");
      if (isNaN(contributionValue)) throw new Error("Invalid contribution amount");

      const depositInWei = parseUnits(depositAmount, 18);
      const contributionInWei = parseUnits(contributionAmount, 18);
      const cycleDurationNumeric = getCycleDuration(contributionCycle);

      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      if (!signer) throw new Error("No signer available");

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
        depositAmount,
        contributionAmount,
        cycleDuration: getHumanReadableCycle(contributionCycle),
        penalty: Math.round(penalty),
      };

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

      setToastOpen(true);
      setTimeout(() => navigate("/join-chama"), 2000);
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
          {/* Starknet connect hint when Starknet is selected */}
          {selected === Networks.STARKNET && !isSnConnected && (
            <Box sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: 'warning.50', border: 1, borderColor: 'warning.main' }}>
              <Typography variant="body2" color="text.primary">
                To create on Starknet, please connect your Starknet wallet (Argent X or Braavos).
              </Typography>
              <Button onClick={snConnect} sx={{ mt: 1 }} variant="outlined">Connect Starknet Wallet</Button>
              {snError && (
                <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                  {snError}
                </Typography>
              )}
            </Box>
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

              {/* Starknet-only: ERC-20 token address */}
              {selected === Networks.STARKNET && (
                <Grid item xs={12}>
                  <TextField
                    label="Starknet Token Address (ERC‑20)"
                    fullWidth
                    value={snTokenAddress}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSnTokenAddress(val);
                      // inline validate
                      try {
                        const { isValidStarknetAddress } = require('../utils/starknet');
                        setSnTokenError(isValidStarknetAddress(val) ? '' : 'Invalid Starknet address');
                      } catch {
                        // fallback: basic check
                        const ok = typeof val === 'string' && val.startsWith('0x');
                        setSnTokenError(ok ? '' : 'Invalid Starknet address');
                      }
                    }}
                    error={Boolean(snTokenError)}
                    helperText={snTokenError || "Enter token contract address on Starknet Sepolia (0x0 for none)"}
                  />
                </Grid>
              )}
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
                disabled={selected === Networks.STARKNET ? !isSnConnected : !isFormEnabled}
              >
                {selected === Networks.STARKNET ? 'Create Chama (Starknet)' : 'Create Chama'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Fade>
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToastOpen(false)} severity="success" sx={{ width: '100%' }}>
          Chama has been created successfully!
          {selected === Networks.STARKNET && (
            <Box sx={{ mt: 1 }}>
              {snTxHash && (
                <div>
                  <a
                    href={`${STARKNET_NETWORK.explorerBase}/tx/${snTxHash}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'inherit', textDecoration: 'underline' }}
                  >
                    View transaction on Starkscan
                  </a>
                </div>
              )}
              {(snCoreAddr || snVaultAddr) && (
                <div style={{ marginTop: 8 }}>
                  {snCoreAddr && (
                    <div>
                      Core: <a href={explorerContractUrl(snCoreAddr)} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>{shortAddr(snCoreAddr)}</a>
                    </div>
                  )}
                  {snVaultAddr && (
                    <div>
                      Vault: <a href={explorerContractUrl(snVaultAddr)} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>{shortAddr(snVaultAddr)}</a>
                    </div>
                  )}
                </div>
              )}
            </Box>
          )}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreateChama;
