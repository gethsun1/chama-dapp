// src/components/Footer.jsx
import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'primary.main',
        color: 'secondary.main',
        py: 3,
        mt: 'auto', 
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" align="center">
          &copy; {new Date().getFullYear()} Chama DApp. All rights reserved.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, flexWrap: 'wrap', gap: 2 }}>
          <Link href="#" color="inherit" sx={{ mx: 2 }}>
            Documentation
          </Link>
          <Link href="#" color="inherit" sx={{ mx: 2 }}>
            Social Media
          </Link>
          <Link href="#" color="inherit" sx={{ mx: 2 }}>
            Terms of Service
          </Link>
          {/* Starknet status */}
          <Typography variant="caption" sx={{ mx: 2, opacity: 0.9 }}>
            Starknet Factory: <code>0x013a4210e9db58c72a3506629455333dec9544dd27208ec49bbb98670409ed14</code>
          </Typography>
          <Link
            href={`https://sepolia.starkscan.co/contract/0x013a4210e9db58c72a3506629455333dec9544dd27208ec49bbb98670409ed14`}
            target="_blank"
            rel="noreferrer"
            color="inherit"
            sx={{ mx: 2 }}
          >
            View on Starkscan
          </Link>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
