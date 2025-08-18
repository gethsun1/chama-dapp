

// src/components/HeroSection.jsx
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Paper,
  Fade
} from '@mui/material';
import heroBg from '../assets/hero-bg.svg';
import { useTypewriter, Cursor } from 'react-simple-typewriter';

const HeroSection = () => {
  // Typewriter effect for subheading text using array destructuring
  const [text] = useTypewriter({
    words: [
      "Empowering Decentralized Table Banking & Savings Groups With Blockchain Technology"
    ],
    loop: 1,
    typeSpeed: 10,
    deleteSpeed: 10,
    delaySpeed: 500,
  });

  return (
    <Box
      sx={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        py: { xs: 5, md: 10 },
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}
    >
      <Container maxWidth="lg">
        <Fade in timeout={1500}>
          <Paper
            elevation={6}
            sx={{
              p: { xs: 3, md: 6 },
              borderRadius: 2,
              backgroundColor: 'rgba(255,255,255,0.9)',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 900,
                fontFamily: '"Chonburi", serif',
                fontSize: { xs: '2.5rem', md: '4rem' },
              }}
            >
              Welcome To Chama DApp
            </Typography>
            <Typography
              variant="h5"
              component="p"
              gutterBottom
              sx={{ color: 'primary.main', 
                        minHeight: '3rem',
                        fontStyle: 'italic',
                        fontFamily: '"Merriweather", serif'}}
            >
              {text}
              <Cursor />
            </Typography>

            <Grid container spacing={4} sx={{ textAlign: 'left', mt: 3, alignItems: 'stretch' }}>
              
              <Grid item xs={12} md={6}>
                <Card elevation={4} sx={{ borderRadius: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <CardHeader
                    title="What is a Chama?"
                    sx={{ textAlign: 'center', backgroundColor: 'primary.main', color: 'white' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="body1">
                      A Chama is a community-based savings group that borrows its core principles from the traditional <strong>ROSCA</strong> (Rotating Savings and Credit Association) model. In a ROSCA, members regularly contribute a fixed sum to a common pool, and each member gets the opportunity to receive the entire pooled amount in turn. This model has long been used to empower unbanked and underbanked communities by providing a simple yet effective means of accessing a lump sum of money without relying on formal financial institutions.
                      <br /><br />
                      In a Chama, members commit to contributing periodically, fostering mutual trust, collective responsibility, and financial discipline. This collaborative approach not only helps individuals save and access funds for emergencies or investments but also builds a resilient network of support within the community.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card elevation={4} sx={{ borderRadius: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <CardHeader
                    title="Why Chama DApp?"
                    sx={{ textAlign: 'center', backgroundColor: 'primary.main', color: 'white' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="body1" component="div">
                      Traditional Chamas often face challenges such as:
                      <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                        <li>💡 Lack of transparency in fund management</li>
                        <li>💡 Trust issues when members default on contributions</li>
                        <li>💡 Mismanagement or even misappropriation of funds by administrators</li>
                      </ul>
                      <br />
                      Chama DApp addresses these issues by bringing the entire process on-chain. Using smart contracts & Blockchain Technology, it enforces contribution rules (with penalty for defaults) and implements member-driven governance, ensuring that every participant has a voice and that funds are managed transparently.
                      <br /><br />
                      This digital transformation of the ROSCA model not only preserves the core benefits of community-based savings but also introduces enhanced security, accountability, and efficiency to empower communities financially.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

             
              <Grid item xs={12}>
                <Card elevation={4} sx={{ borderRadius: 2 }}>
                  <CardHeader
                    title="How It Works"
                    sx={{ textAlign: 'center', backgroundColor: 'primary.main', color: 'white' }}
                  />
                  <CardContent>
                    <Typography variant="body1">
                      1. Connect your wallet using the  Connect button.<br />
                      2. Create a new Chama or join an existing one by specifying deposit, contribution, penalty, and maximum members.<br />
                      3. Enjoy automated, transparent contributions and payouts with built-in governance mechanisms that give every member a voice.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default HeroSection;
