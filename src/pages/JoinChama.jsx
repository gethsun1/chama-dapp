// src/pages/JoinChama.jsx
import React, { useState, useEffect } from "react";
import { 
  Container, Grid, Card, CardContent, Typography, Button, 
  Box, Dialog, DialogTitle, DialogContent, CardActions, DialogActions, Fade 
} from "@mui/material";
import { MonetizationOn, Groups, CalendarToday } from "@mui/icons-material";
import { Contract, BrowserProvider, formatUnits, parseUnits } from "ethers";
import { useAppKitProvider } from '@reown/appkit/react';
import { useNavigate } from "react-router-dom";
import { ChamaFactoryABI, contractAddress } from '../contracts/ChamaFactoryConfig';




// Updated safe conversion to handle Ethers BigNumber
const safeConvert = (val) => {
  if (val === null || val === undefined) return "";
  if (typeof val?._isBigNumber === "boolean") return val.toString();
  if (typeof val === "bigint") return val.toString();
  if (typeof val.toString === "function") return val.toString();
  return val;
};

const formatCycleDuration = (duration) => {
  const d = Number(duration);
  if (d === 86400) return "Daily";
  if (d === 604800) return "Weekly";
  if (d === 2592000) return "Monthly";
  return `${d}`;
};

const convertWeiToEth = (weiValue) => {
  try {
    return formatUnits(weiValue, "ether");
  } catch (error) {
    console.error("Conversion error:", error);
    return safeConvert(weiValue);
  }
};

const formatChama = (chamaArray) => ({
  id: parseInt(safeConvert(chamaArray[0])),
  creator: safeConvert(chamaArray[1]),
  name: safeConvert(chamaArray[2]),
  description: safeConvert(chamaArray[3]),
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
  const [chamas, setChamas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);
  
  const { walletProvider } = useAppKitProvider('eip155');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChamas = async () => {
      if (!walletProvider) return;

      try {
        const ethersProvider = new BrowserProvider(walletProvider);
        const factoryContract = new Contract(
          contractAddress,
          ChamaFactoryABI,
          ethersProvider
        );

        const count = await factoryContract.chamaCount();
        const chamaCount = parseInt(count.toString());

        const chamaPromises = [];
        for (let i = 1; i <= chamaCount; i++) {
          chamaPromises.push(factoryContract.chamas(i));
        }

        const rawChamas = await Promise.all(chamaPromises);
        const formatted = rawChamas.map(chama => formatChama(chama));
        setChamas(formatted);
      } catch (error) {
        console.error("Error fetching chamas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChamas();
  }, [walletProvider]);

  const handleJoin = async () => {
    if (!selectedChama || !walletProvider) return;

    try {
      setJoinLoading(true);
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      
      const factoryContract = new Contract(
        contractAddress,
        ChamaFactoryABI,
        signer
      );

      // Convert depositAmount back to wei
      const value = parseUnits(selectedChama.depositAmount, "ether");
      
      const tx = await factoryContract.joinChama(selectedChama.id, { value });
      await tx.wait();
      handleClose();
      
      // Redirect to Dashboard after successful join
      navigate("/dashboard");
    } catch (error) {
      console.error("Join error:", error);
    } finally {
      setJoinLoading(false);
    }
  };

  const handleOpen = (chama) => {
    setSelectedChama(chama);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedChama(null);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
        Available Chamas
      </Typography>
      <Grid container spacing={4}>
        {chamas.map((chama, index) => (
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
                >
                  Join
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

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
