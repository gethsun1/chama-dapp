import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import NavigationBar from "./components/NavigationBar";
import BreadcrumbNavigation from "./components/BreadcrumbNavigation";
import LandingPage from "./components/LandingPage";
import CreateChama from "./pages/CreateChama";
import JoinChama from "./pages/JoinChama";
import Dashboard from "./pages/Dashboard";
import Footer from "./components/Footer";
import AppKitConfig from "./config"; // Initialize AppKit at root level
import ChatPlaceholder from "./components/ChatPlaceholder"; // Import the ChatPlaceholder

function App() {
  return (
    <>
      <AppKitConfig /> {/* Initialize AppKit at root level */}
      <Router>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          <NavigationBar />
          <BreadcrumbNavigation />
          <Box sx={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/create-chama" element={<CreateChama />} />
              <Route path="/join-chama" element={<JoinChama />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </Router>
      {/* ChatPlaceholder is rendered globally */}
      <ChatPlaceholder />
    </>
  );
}

export default App;
