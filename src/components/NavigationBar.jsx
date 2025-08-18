// src/components/NavigationBar.jsx
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  useTheme,
  useMediaQuery,
  Typography,
  Divider,
  Stack,
  Chip,
  Avatar,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Home,
  Add,
  Group,
  Dashboard,
  AccountBalanceWallet,
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import ConnectButton from "../ConnectButton";
import { useAppKitAccount } from '@reown/appkit/react';
import heroLogo from "../assets/hero-logo.svg";
import NotificationCenter from "./communication/NotificationCenter";
import { useNetwork, Networks } from "../contexts/NetworkContext";

const NavigationBar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isConnected, address } = useAppKitAccount();
  const location = useLocation();
  const { selected, setSelected } = useNetwork();

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const navLinks = [
    { title: "Home", path: "/", icon: Home },
    { title: "Create Chama", path: "/create-chama", icon: Add },
    { title: "Join Chama", path: "/join-chama", icon: Group },
    { title: "Dashboard", path: "/dashboard", icon: Dashboard },
  ];

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar sx={{ px: { xs: 2, md: 3 } }}>
        {/* Logo */}
        <Box sx={{ flexGrow: 1 }}>
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              '&:hover': { opacity: 0.8 }
            }}
          >
            <img
              src={heroLogo}
              alt="Chama DApp Logo"
              style={{ height: "40px" }}
            />
          </Box>
        </Box>

        {/* Desktop Navigation */}
        {!isMobile && (
          <Stack direction="row" spacing={1} sx={{ mr: 2 }}>
            {navLinks.map((link, index) => (
              <Button
                key={index}
                component={Link}
                to={link.path}
                startIcon={<link.icon />}
                sx={{
                  color: isActivePath(link.path) ? 'primary.main' : 'text.primary',
                  textTransform: 'none',
                  fontWeight: isActivePath(link.path) ? 600 : 400,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  backgroundColor: isActivePath(link.path) ? 'primary.50' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'primary.50',
                    color: 'primary.main',
                  },
                }}
              >
                {link.title}
              </Button>
            ))}
          </Stack>
        )}

        {/* Network Toggle, Notifications and Connect Button */}
        <Stack direction="row" spacing={1} alignItems="center">
          {/* Simple network toggle bound to context */}
          <Chip
            label="EVM"
            size="small"
            color={selected === Networks.EVM_SCROLL ? 'primary' : 'default'}
            variant={selected === Networks.EVM_SCROLL ? 'filled' : 'outlined'}
            sx={{ cursor: 'pointer' }}
            onClick={() => setSelected(Networks.EVM_SCROLL)}
          />
          <Chip
            label="Starknet"
            size="small"
            color={selected === Networks.STARKNET ? 'primary' : 'default'}
            variant={selected === Networks.STARKNET ? 'filled' : 'outlined'}
            sx={{ cursor: 'pointer' }}
            onClick={() => setSelected(Networks.STARKNET)}
          />
          {isConnected && <NotificationCenter />}
          <ConnectButton />
        </Stack>

        {/* Mobile Menu Button */}
        {isMobile && (
          <IconButton
            edge="end"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{ ml: 1 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Enhanced Mobile Drawer */}
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={toggleDrawer(false)}
          PaperProps={{
            sx: {
              width: 280,
              backgroundColor: 'background.paper',
            }
          }}
        >
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Drawer Header */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Menu
              </Typography>
              <IconButton onClick={toggleDrawer(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Box>

            <Divider />

            {/* User Info (if connected) */}
            {isConnected && (
              <>
                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {address ? address.charAt(2).toUpperCase() : 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Connected
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                        {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    icon={<AccountBalanceWallet />}
                    label="Wallet Connected"
                    size="small"
                    color="success"
                    variant="outlined"
                    sx={{ width: '100%' }}
                  />
                </Box>
                <Divider />
              </>
            )}

            {/* Navigation Links */}
            <Box sx={{ flex: 1, py: 1 }}>
              <List>
                {navLinks.map((link, index) => (
                  <ListItem
                    key={index}
                    component={Link}
                    to={link.path}
                    onClick={toggleDrawer(false)}
                    sx={{
                      mx: 1,
                      mb: 0.5,
                      borderRadius: 2,
                      backgroundColor: isActivePath(link.path) ? 'primary.50' : 'transparent',
                      color: isActivePath(link.path) ? 'primary.main' : 'text.primary',
                      '&:hover': {
                        backgroundColor: 'primary.50',
                        color: 'primary.main',
                      },
                    }}
                  >
                    <ListItemIcon sx={{
                      color: isActivePath(link.path) ? 'primary.main' : 'text.secondary',
                      minWidth: 40
                    }}>
                      <link.icon />
                    </ListItemIcon>
                    <ListItemText
                      primary={link.title}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontWeight: isActivePath(link.path) ? 600 : 400,
                        }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Footer */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" align="center" display="block">
                Chama DApp v2.0
              </Typography>
            </Box>
          </Box>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;
