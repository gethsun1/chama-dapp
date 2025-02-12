import React, { memo } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Container, CssBaseline, Box } from "@mui/material";
import Home from "./components/Home";
import CreateChama from "./components/CreateChama";
import JoinChama from "./components/JoinChama";
import Dashboard from "./components/Dashboard";
import backgroundImage from "./assets/background.svg";

const PRIMARY_COLOR = "#6c4629";

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
      <CssBaseline />
      {/* Global fixed background image */}
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
          zIndex: -1,
        }}
      />
      {/* App content */}
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
    </Router>
  );
};

export default App;
