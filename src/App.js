import React, { memo } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Parallax } from "react-parallax";
import { AppBar, Toolbar, Typography, Button, Container, CssBaseline, Box } from "@mui/material";
import Home from "./components/Home";
import CreateChama from "./components/CreateChama";
import JoinChama from "./components/JoinChama";
import Dashboard from "./components/Dashboard";

// Custom theme colors
const PRIMARY_COLOR = "#6c4629";
const BACKGROUND_IMAGE = "/assets/background.svg"; // Ensure this path is correct

const Navbar = memo(() => (
  <AppBar position="sticky" sx={{ backgroundColor: PRIMARY_COLOR }}>
    <Toolbar>
      <Typography
        variant="h6"
        component="div"
        sx={{ flexGrow: 1, fontWeight: "bold", color: "#fff" }}
      >
        Chama DApp
      </Typography>
      {/* Navigation */}
      <Box sx={{ display: "flex", gap: 2 }}>
        {["Home", "Create", "Join", "Dashboard"].map((text, index) => (
          <Button key={index} href={`/${text.toLowerCase()}`} sx={{ color: "#fff" }}>
            {text}
          </Button>
        ))}
      </Box>
    </Toolbar>
  </AppBar>
));

const App = () => {
  return (
    <Router>
      {/* Global styles reset */}
      <CssBaseline />

      {/* Navbar */}
      <Navbar />

      {/* Parallax Background */}
      <Parallax bgImage={BACKGROUND_IMAGE} strength={500} style={{ minHeight: "100vh" }}>
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <Typography variant="h2" sx={{ color: "#fff", fontWeight: "bold", textShadow: "2px 2px 5px rgba(0,0,0,0.7)" }}>
            Welcome to Chama DApp
          </Typography>
        </Box>
      </Parallax>

      {/* Main Content */}
      <Container sx={{ mt: 4, backgroundColor: "rgba(255,255,255,0.9)", p: 3, borderRadius: 2 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateChama />} />
          <Route path="/join" element={<JoinChama />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Container>
    </Router>
  );
};

export default App;
