// src/components/LoadingState.jsx
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Grid,
} from '@mui/material';

// Loading Spinner Component
export const LoadingSpinner = ({ 
  size = 40, 
  message = "Loading...", 
  fullScreen = false,
  color = "primary" 
}) => {
  const content = (
    <Stack 
      spacing={2} 
      alignItems="center" 
      justifyContent="center"
      sx={{ 
        minHeight: fullScreen ? '50vh' : '200px',
        textAlign: 'center' 
      }}
    >
      <CircularProgress size={size} color={color} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Stack>
  );

  if (fullScreen) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '100vh',
          width: '100%' 
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
};

// Card Skeleton Component
export const CardSkeleton = ({ 
  count = 1, 
  showActions = true, 
  height = 200,
  spacing = 2 
}) => {
  const skeletons = Array.from({ length: count }, (_, index) => (
    <Card key={index} sx={{ height }}>
      <CardContent>
        <Stack spacing={1}>
          {/* Title */}
          <Skeleton variant="text" width="60%" height={32} />
          
          {/* Subtitle */}
          <Skeleton variant="text" width="40%" height={24} />
          
          {/* Content lines */}
          <Box sx={{ mt: 2 }}>
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="80%" height={20} />
            <Skeleton variant="text" width="90%" height={20} />
          </Box>
          
          {/* Metrics or additional info */}
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={100} height={24} sx={{ borderRadius: 1 }} />
          </Box>
          
          {/* Action buttons */}
          {showActions && (
            <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  ));

  if (count === 1) {
    return skeletons[0];
  }

  return (
    <Stack spacing={spacing}>
      {skeletons}
    </Stack>
  );
};

// Table Skeleton Component
export const TableSkeleton = ({ 
  rows = 5, 
  columns = 4, 
  showHeader = true,
  cellHeight = 53 
}) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        {showHeader && (
          <TableHead>
            <TableRow>
              {Array.from({ length: columns }, (_, index) => (
                <TableCell key={index}>
                  <Skeleton variant="text" width="80%" height={24} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {Array.from({ length: rows }, (_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: columns }, (_, colIndex) => (
                <TableCell key={colIndex} sx={{ height: cellHeight }}>
                  <Skeleton 
                    variant="text" 
                    width={colIndex === 0 ? "60%" : "80%"} 
                    height={20} 
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Metric Card Skeleton
export const MetricCardSkeleton = ({ count = 4 }) => {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: count }, (_, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Skeleton variant="text" width="70%" height={24} />
                <Skeleton variant="text" width="50%" height={40} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Skeleton variant="circular" width={16} height={16} />
                  <Skeleton variant="text" width="40%" height={20} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

// Dashboard Skeleton (combines multiple skeleton types)
export const DashboardSkeleton = () => {
  return (
    <Stack spacing={4}>
      {/* Header */}
      <Box>
        <Skeleton variant="text" width="300px" height={48} />
        <Skeleton variant="text" width="500px" height={24} />
      </Box>
      
      {/* Metrics */}
      <MetricCardSkeleton count={4} />
      
      {/* Main content area */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <CardSkeleton count={3} spacing={3} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
              <Stack spacing={2}>
                {Array.from({ length: 4 }, (_, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="80%" height={20} />
                      <Skeleton variant="text" width="60%" height={16} />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
};

// List Skeleton
export const ListSkeleton = ({ 
  items = 5, 
  showAvatar = true, 
  showSecondaryText = true,
  showActions = false 
}) => {
  return (
    <Stack spacing={1}>
      {Array.from({ length: items }, (_, index) => (
        <Box 
          key={index} 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          {showAvatar && <Skeleton variant="circular" width={40} height={40} />}
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="70%" height={24} />
            {showSecondaryText && (
              <Skeleton variant="text" width="50%" height={20} />
            )}
          </Box>
          {showActions && (
            <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
          )}
        </Box>
      ))}
    </Stack>
  );
};

// Form Skeleton
export const FormSkeleton = ({ fields = 4, showSubmitButton = true }) => {
  return (
    <Stack spacing={3}>
      {Array.from({ length: fields }, (_, index) => (
        <Box key={index}>
          <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 1 }} />
        </Box>
      ))}
      {showSubmitButton && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
        </Box>
      )}
    </Stack>
  );
};

export default {
  LoadingSpinner,
  CardSkeleton,
  TableSkeleton,
  MetricCardSkeleton,
  DashboardSkeleton,
  ListSkeleton,
  FormSkeleton,
};
