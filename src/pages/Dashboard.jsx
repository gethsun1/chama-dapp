// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Snackbar,
  Alert,
  IconButton,
  Box,
  Fade,
  Chip,
  Stack,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ContentCopy,
  AccountBalanceWallet,
  Groups,
  TrendingUp,
  Schedule,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";
import ChamaCard from "./ChamaCard";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import useJoinedChamas from "../hooks/useJoinedChamas";
import { BrowserProvider, formatUnits } from "ethers";
import WalletConnectionGuard from "../components/WalletConnectionGuard";
import { LoadingSpinner, MetricCardSkeleton } from "../components/LoadingState";
import CommunicationHub from "../components/communication/CommunicationHub";
import { useCommunication } from "../contexts/CommunicationContext";

// MetricCard Component
const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = "primary",
  loading = false
}) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {title}
            </Typography>
            {Icon && (
              <Icon sx={{ color: `${color}.main`, fontSize: 24 }} />
            )}
          </Box>

          {loading ? (
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                --
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Loading...
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {value}
              </Typography>

              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}

              {trend && trendValue && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {trend === 'up' ? (
                    <ArrowUpward sx={{ fontSize: 16, color: 'success.main' }} />
                  ) : (
                    <ArrowDownward sx={{ fontSize: 16, color: 'error.main' }} />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      color: trend === 'up' ? 'success.main' : 'error.main',
                      fontWeight: 500
                    }}
                  >
                    {trendValue}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const { isConnected, address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [walletBalance, setWalletBalance] = useState("Loading...");
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [selectedChamaForComm, setSelectedChamaForComm] = useState(null);
  const [commHubOpen, setCommHubOpen] = useState(false);
  const joinedChamas = useJoinedChamas();
  const { notifications } = useCommunication();

  // Contribution history sample data (for demo purposes)
  const contributionData = [
    { name: "Jan", amount: 2.5 },
    { name: "Feb", amount: 3.0 },
    { name: "Mar", amount: 3.5 },
  ];

  // Pie chart data for funds allocation
  const pieData = [
    { name: "Held Deposit", value: 1 },
    { name: "Contributions", value: 4.2 },
  ];
  const COLORS = ["#1976d2", "#26a69a"];

  // Copies the wallet address to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    setOpenSnackbar(true);
  };

  // Fetch the ETH balance of the connected wallet
  useEffect(() => {
    const fetchBalance = async () => {
      if (!isConnected || !walletProvider || !address) {
        setBalanceLoading(false);
        return;
      }
      try {
        setBalanceLoading(true);
        const provider = new BrowserProvider(walletProvider);
        const balanceBN = await provider.getBalance(address);
        const balance = formatUnits(balanceBN, 18);
        setWalletBalance(parseFloat(balance).toFixed(4));
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
        setWalletBalance("Error");
      } finally {
        setBalanceLoading(false);
      }
    };

    fetchBalance();
  }, [isConnected, walletProvider, address]);

  // Calculate metrics
  const totalHeldDeposit = joinedChamas.reduce((acc, chama) => {
    const deposit = parseFloat(chama.depositHeld || "0");
    return acc + deposit;
  }, 0);

  const totalContributions = joinedChamas.reduce((acc, chama) => {
    const contribution = parseFloat(chama.contributionAmount || "0");
    return acc + contribution;
  }, 0);

  // Calculate next payout (mock calculation)
  const getNextPayout = () => {
    if (joinedChamas.length === 0) return "No active chamas";
    // This would be calculated based on actual chama cycles
    return "3 days";
  };

  return (
    <WalletConnectionGuard>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back! Here's an overview of your Chama activities.
          </Typography>
        </Box>

        {/* Metrics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Total Balance"
              value={balanceLoading ? "--" : `${walletBalance} ETH`}
              subtitle="Wallet Balance"
              icon={AccountBalanceWallet}
              color="primary"
              loading={balanceLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Active Chamas"
              value={joinedChamas.length}
              subtitle="Joined Groups"
              icon={Groups}
              color="secondary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Total Deposits"
              value={`${totalHeldDeposit.toFixed(4)} ETH`}
              subtitle="Held in Chamas"
              icon={TrendingUp}
              color="success"
              trend="up"
              trendValue="+12.5%"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Next Payout"
              value={getNextPayout()}
              subtitle="Estimated Time"
              icon={Schedule}
              color="warning"
            />
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          {/* User Profile Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: 'fit-content' }}>
              <CardContent>
                <Stack spacing={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main" }}>
                      {isConnected && address ? address.charAt(2).toUpperCase() : "U"}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {isConnected && address ? "On-Chain User" : "Loading..."}
                      </Typography>
                      <Chip
                        label="Connected"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Wallet Address
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {isConnected ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={copyToClipboard}
                        sx={{ '&:hover': { transform: 'scale(1.1)' } }}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        ETH Balance
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {balanceLoading ? "Loading..." : `${walletBalance} ETH`}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Held Deposit
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {totalHeldDeposit.toFixed(4)} ETH
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Active Chamas Section */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Your Active Chamas
                </Typography>
                <Fade in timeout={1000}>
                  <Box>
                    {joinedChamas && joinedChamas.length > 0 ? (
                      <Stack spacing={2}>
                        {joinedChamas.map((chama) => (
                          <ChamaCard
                            key={chama.id}
                            chama={chama}
                            onOpenCommunication={() => {
                              setSelectedChamaForComm(chama);
                              setCommHubOpen(true);
                            }}
                          />
                        ))}
                      </Stack>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Groups sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No Active Chamas
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          You haven't joined any Chamas yet. Start by creating or joining one!
                        </Typography>
                        <Button variant="contained" href="/join-chama">
                          Browse Chamas
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Fade>
              </CardContent>
            </Card>
          </Grid>

          {/* Analytics Section */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Contribution History
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={contributionData}>
                    <XAxis dataKey="name" stroke="#718096" />
                    <YAxis stroke="#718096" />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#1976d2" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Funds Allocation
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Snackbar for copy confirmation */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={() => setOpenSnackbar(false)}
        >
          <Alert severity="success" onClose={() => setOpenSnackbar(false)}>
            Address copied to clipboard!
          </Alert>
        </Snackbar>

        {/* Communication Hub */}
        {selectedChamaForComm && (
          <CommunicationHub
            chamaId={selectedChamaForComm.id}
            chamaName={selectedChamaForComm.name}
            members={selectedChamaForComm.members || []}
            isCreator={selectedChamaForComm.creator === address}
            open={commHubOpen}
            onClose={() => {
              setCommHubOpen(false);
              setSelectedChamaForComm(null);
            }}
            variant="drawer"
          />
        )}
      </Container>
    </WalletConnectionGuard>
  );
};

export default Dashboard;
