import React, { memo, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Container,
  CssBaseline,
  Box,
  Button,
  useMediaQuery
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from '@mui/icons-material/Menu';
import Home from "./components/Home";
import CreateChama from "./components/CreateChama";
import JoinChama from "./components/JoinChama";
import Dashboard from "./components/Dashboard";
import backgroundImage from "./assets/background.svg";
import logo from "./assets/logo.svg";

const PRIMARY_COLOR_TRANSPARENT = "rgba(108,70,41,0.8)";

// Navbar Component
const Navbar = memo(() => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Mobile: < 600px

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (route) => {
    setAnchorEl(null);
    if (route) navigate(route);
  };

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: PRIMARY_COLOR_TRANSPARENT,
          backdropFilter: "blur(5px)"
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* Logo & Title */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <img src={logo} alt="Chama DApp Logo" style={{ height: 40 }} />
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#fff" }}>Chama DApp</Typography>
              <Typography variant="subtitle2" sx={{ fontStyle: "italic", color: "#fff" }}>
                Revolutionising Community Savings on the Blockchain
              </Typography>
            </Box>
          </Box>

          {/* Navigation */}
          {isMobile ? (
            <>
              {/* Hamburger Menu */}
              <IconButton edge="end" color="inherit" onClick={handleMenuOpen}>
                <MenuIcon />
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => handleMenuClose()}>
                <MenuItem onClick={() => handleMenuClose("/")}>Home</MenuItem>
                <MenuItem onClick={() => handleMenuClose("/create")}>Create</MenuItem>
                <MenuItem onClick={() => handleMenuClose("/join")}>Join</MenuItem>
                <MenuItem onClick={() => handleMenuClose("/dashboard")}>Dashboard</MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button color="inherit" onClick={() => navigate("/")}>Home</Button>
              <Button color="inherit" onClick={() => navigate("/create")}>Create</Button>
              <Button color="inherit" onClick={() => navigate("/join")}>Join</Button>
              <Button color="inherit" onClick={() => navigate("/dashboard")}>Dashboard</Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </>
  );
});

const App = () => {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <CssBaseline />
      {/* Global Background */}
      <Box
        sx={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          backgroundPosition: "center",
          backgroundSize: "cover",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1
        }}
      />
      {/* Content */}
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Navbar />
        <Container sx={{ mt: 4, p: 3 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateChama />} />
            <Route path="/join" element={<JoinChama />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Container>
      </Box>
    </BrowserRouter>
  );
};

export default App;
