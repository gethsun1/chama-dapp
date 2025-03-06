// src/pages/JoinChama.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CardActions,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
} from "@mui/material";
import { MonetizationOn, Groups, CalendarToday } from "@mui/icons-material";
import { useReadContract, useReadContracts, useWriteContract } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import ChamaFactoryABI from "../contracts/ChamaFactoryABI.json";

const contractAddress = "0x154d1E286A9A3c1d4B1e853A9a7e61b1e934B756";

// Improved safe conversion: if the value is null/undefined returns empty string;
// if it's a bigint, return its string representation; otherwise, use toString().
const safeConvert = (val) => {
  if (val === null || val === undefined) return "";
  if (typeof val === "bigint") return val.toString();
  if (typeof val.toString === "function") return val.toString();
  return val;
};

// Helper function to format cycle duration
const formatCycleDuration = (duration) => {
  const d = Number(duration);
  if (d === 86400) return "Daily";
  if (d === 604800) return "Weekly";
  if (d === 2592000) return "Monthly";
  return `${d}`; // fallback: display the number as a string
};

// Helper function to convert a Wei value (as a bigint or string) to ETH using viem
const convertWeiToEth = (weiValue) => {
  try {
    const bn = typeof weiValue === "bigint" ? weiValue : BigInt(safeConvert(weiValue));
    return formatUnits(bn, "ether");
  } catch (error) {
    console.error("Conversion error:", error);
    return safeConvert(weiValue);
  }
};

// Formatter for a Chama item: expects an array of 14 values (from the "result" property)
const formatChama = (chamaArray) => ({
  id: parseInt(safeConvert(chamaArray[0])),
  creator: safeConvert(chamaArray[1]),
  name: safeConvert(chamaArray[2]),
  description: safeConvert(chamaArray[3]),
  // Convert deposit and contribution amounts from Wei to ETH:
  depositAmount: convertWeiToEth(chamaArray[4]),
  contributionAmount: convertWeiToEth(chamaArray[5]),
  penalty: safeConvert(chamaArray[6]),
  maxMembers: safeConvert(chamaArray[7]),
  membersCount: safeConvert(chamaArray[8]),
  cycleDuration: safeConvert(chamaArray[9]),
  currentRound: safeConvert(chamaArray[10]),
  currentCycle: safeConvert(chamaArray[11]),
  nextCycleStart: safeConvert(chamaArray[12]),
  isActive: chamaArray[13],
});

const JoinChama = () => {
  const [open, setOpen] = useState(false);
  const [selectedChama, setSelectedChama] = useState(null);

  // 1. Read total number of created Chamas using useReadContract
  const { data: chamaCount, isLoading: countLoading } = useReadContract({
    address: contractAddress,
    abi: ChamaFactoryABI,
    functionName: "chamaCount",
    watch: true,
  });

  // 2. Batch fetch all Chama details using useReadContracts
  const calls =
    chamaCount && !isNaN(parseInt(chamaCount.toString()))
      ? Array.from(
          { length: parseInt(chamaCount.toString()) },
          (_, index) => ({
            address: contractAddress,
            abi: ChamaFactoryABI,
            functionName: "chamas",
            args: [index + 1],
          })
        )
      : [];

  const { data: rawChamas, isLoading: chamasLoading } = useReadContracts({
    contracts: calls,
    watch: true,
  });

  // Log raw data for debugging
  useEffect(() => {
    console.log("Raw Chamas:", rawChamas);
  }, [rawChamas]);

  // Format the raw chamas: each item has a "result" property containing the array of values.
  const chamas =
    rawChamas && Array.isArray(rawChamas)
      ? rawChamas.map((item) => formatChama(item.result))
      : [];

  // 3. Prepare the write call for joining a Chama using useWriteContract
  const { write: joinWrite, isLoading: joinLoading } = useWriteContract({
    address: contractAddress,
    abi: ChamaFactoryABI,
    functionName: "joinChama",
    args: [selectedChama ? selectedChama.id : 0],
    // When sending a join transaction, convert the ETH value back to Wei using viem's parseUnits.
    overrides: {
      value: selectedChama
        ? parseUnits(selectedChama.depositAmount, "ether")
        : undefined,
    },
    onError(error) {
      console.error("Join error:", error);
    },
  });

  const handleOpen = (chama) => {
    setSelectedChama(chama);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedChama(null);
  };

  const handleJoin = () => {
    if (joinWrite) {
      joinWrite();
    }
  };

  if (countLoading || chamasLoading) return <div>Loading...</div>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
        Available Chamas
      </Typography>
      <Grid container spacing={4}>
        {chamas &&
          chamas.map((chama, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  p: 2,
                  borderRadius: 2,
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: 8,
                  },
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: "medium" }}>
                    {chama.name || "No Name"}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                    sx={{ mt: 1, mb: 2 }}
                  >
                    {chama.description || "No Description"}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                    <CalendarToday fontSize="small" color="action" />
                    <Typography variant="body2">
                      Cycle: {formatCycleDuration(chama.cycleDuration)}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                    <MonetizationOn fontSize="small" color="action" />
                    <Typography variant="body2">
                      Deposit: {chama.depositAmount} ETH
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      Contribution: {chama.contributionAmount} ETH
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      Penalty: {chama.penalty}%
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      Max Members: {chama.maxMembers}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2">
                      Members Joined: {chama.membersCount}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => handleOpen(chama)}
                    sx={{
                      transition: "transform 0.3s",
                      "&:hover": { transform: "scale(1.02)" },
                    }}
                  >
                    Join
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
      </Grid>

      {/* Animated Dialog for Chama Details */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <Fade in={open} timeout={500}>
          <Box>
            <DialogTitle sx={{ fontWeight: "bold" }}>
              {selectedChama?.name || "No Name"}
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="body1" gutterBottom>
                {selectedChama?.description || "No Description"}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Cycle Duration:
                </Typography>
                <Typography variant="body2">
                  {formatCycleDuration(selectedChama?.cycleDuration)}
                </Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Deposit Amount:
                </Typography>
                <Typography variant="body2">
                  {selectedChama?.depositAmount} ETH
                </Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Contribution Amount:
                </Typography>
                <Typography variant="body2">
                  {selectedChama?.contributionAmount} ETH
                </Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Penalty:
                </Typography>
                <Typography variant="body2">
                  {selectedChama?.penalty}%
                </Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Maximum Members:
                </Typography>
                <Typography variant="body2">
                  {selectedChama?.maxMembers}
                </Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Members Joined:
                </Typography>
                <Typography variant="body2">
                  {selectedChama?.membersCount}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={handleClose} color="secondary">
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleJoin}
                disabled={joinLoading}
              >
                {joinLoading ? "Joining..." : "Confirm Join"}
              </Button>
            </DialogActions>
          </Box>
        </Fade>
      </Dialog>
    </Container>
  );
};

export default JoinChama;
