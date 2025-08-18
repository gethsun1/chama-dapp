// src/components/StatsSection.jsx
import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import CountUp from 'react-countup';

const stats = [
  { id: 1, label: 'Total Savings', end: 1000000, prefix: '$' },
  { id: 2, label: 'Active Members', end: 5000 },
  { id: 3, label: 'Weekly Contributions', end: 50000, prefix: '$' },
  { id: 4, label: 'Growth Rate', end: 15, suffix: '%' },
];

const StatsSection = () => {
  return (
    <Box
      sx={{
        py: 5,
        background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)', // A subtle gradient background
      }}
    >
      <Typography variant="h4" align="center" gutterBottom>
        Chama DApp Performance
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.id}>
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
              <Typography variant="h6" gutterBottom>
                {stat.label}
              </Typography>
              <Typography variant="h4">
                <CountUp
                  start={0}
                  end={stat.end}
                  duration={2}
                  separator=","
                  prefix={stat.prefix ? stat.prefix : ''}
                  suffix={stat.suffix ? stat.suffix : ''}
                />
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default StatsSection;
