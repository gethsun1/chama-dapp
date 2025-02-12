import React, { useState } from 'react';
import { Typography, TextField, Button, Paper, Box } from '@mui/material';

function CreateChama() {
  const [chamaName, setChamaName] = useState('');
  const [cycleDuration, setCycleDuration] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ chamaName, cycleDuration, contributionAmount });
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Paper elevation={4} sx={{ p: 4, width: '100%', maxWidth: 500 }}>
        <Typography variant="h5" color="primary" gutterBottom>
          Create a New Chama
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Chama Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={chamaName}
            onChange={(e) => setChamaName(e.target.value)}
          />
          <TextField
            label="Cycle Duration (in days)"
            variant="outlined"
            type="number"
            fullWidth
            margin="normal"
            value={cycleDuration}
            onChange={(e) => setCycleDuration(e.target.value)}
          />
          <TextField
            label="Contribution Amount (in ETH)"
            variant="outlined"
            type="number"
            fullWidth
            margin="normal"
            value={contributionAmount}
            onChange={(e) => setContributionAmount(e.target.value)}
          />
          <Button variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
            Create Chama
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

export default CreateChama;
