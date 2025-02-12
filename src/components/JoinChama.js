import React, { useState } from 'react';
import { Typography, TextField, Button, Paper } from '@mui/material';

function JoinChama() {
  const [chamaId, setChamaId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ chamaId });
  };

  return (
    <Paper elevation={3} sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Join a Chama
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Chama ID"
          variant="outlined"
          fullWidth
          margin="normal"
          value={chamaId}
          onChange={(e) => setChamaId(e.target.value)}
        />
        <Button variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
          Join Chama
        </Button>
      </form>
    </Paper>
  );
}

export default JoinChama;
