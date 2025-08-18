// src/components/BenefitsSection.jsx
import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';

const benefits = [
  {
    id: 1,
    title: 'Transparency',
    description:
      'Every transaction is recorded on the public blockchain, ensuring complete traceability of funds and building trust among members.',
    icon: '🔍',
  },
  {
    id: 2,
    title: 'Security',
    description:
      'Decentralized architecture safeguards your funds against fraud and unauthorized access, providing you with peace of mind.',
    icon: '🔒',
  },
  {
    id: 3,
    title: 'Community Empowerment',
    description:
      'Our platform fosters collaboration and active participation, empowering members to take part in governance and collective decision-making.',
    icon: '🤝',
  },
];

const BenefitsSection = () => {
  return (
    <Box sx={{ py: 5, backgroundColor: 'grey.100' }}>
      <Typography variant="h4" align="center" gutterBottom>
        Discover the Benefits of Chama DApp
      </Typography>
      <Typography variant="body1" align="center" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
        Experience a platform that combines cutting-edge blockchain technology with community-driven finance,
        ensuring transparency, security, and empowerment for every member.
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {benefits.map((benefit) => (
          <Grid item xs={12} sm={6} md={4} key={benefit.id}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                textAlign: 'center',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: 6,
                },
              }}
            >
              <Typography variant="h3">{benefit.icon}</Typography>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                {benefit.title}
              </Typography>
              <Typography variant="body1">{benefit.description}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default BenefitsSection;
