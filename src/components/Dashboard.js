import React from 'react';
import { Typography, Paper, List, ListItem, ListItemText, Box } from '@mui/material';

function Dashboard() {
  const userData = {
    contributions: '5 ETH',
    payoutsReceived: '2 ETH',
    chamaStatus: 'Active',
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Paper elevation={4} sx={{ p: 4, width: '100%', maxWidth: 500 }}>
        <Typography variant="h5" color="primary" gutterBottom>
          Dashboard
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="Total Contributions" secondary={userData.contributions} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Payouts Received" secondary={userData.payoutsReceived} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Chama Status" secondary={userData.chamaStatus} />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
}

export default Dashboard;
