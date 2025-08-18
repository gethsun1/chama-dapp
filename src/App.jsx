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
import { CommunicationProvider } from "./contexts/CommunicationContext";
import CommunicationHubTest from "./components/communication/CommunicationHubTest";
import { NetworkProvider } from "./contexts/NetworkContext";

function App() {
  return (
    <>
      <AppKitConfig /> {/* Initialize AppKit at root level */}
      <NetworkProvider>
        <CommunicationProvider>
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
                  <Route path="/test-communication" element={<CommunicationHubTest />} />
                </Routes>
              </Box>
              <Footer />
            </Box>
          </Router>
        </CommunicationProvider>
      </NetworkProvider>
    </>
  );
}

export default App;
