// src/components/StatusIndicator.jsx
import React from 'react';
import {
  Chip,
  Box,
  Typography,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  CheckCircle,
  Schedule,
  Warning,
  Error,
  Pause,
  PlayArrow,
  Stop,
  HourglassEmpty,
  TrendingUp,
  Group,
} from '@mui/icons-material';

const StatusIndicator = ({ 
  status, 
  variant = 'chip', 
  size = 'medium',
  showIcon = true,
  showLabel = true,
  customLabel = null,
  tooltip = null 
}) => {
  const theme = useTheme();

  // Status configurations
  const statusConfig = {
    active: {
      label: 'Active',
      color: 'success',
      icon: CheckCircle,
      description: 'Chama is currently active and accepting contributions',
    },
    pending: {
      label: 'Pending',
      color: 'warning',
      icon: Schedule,
      description: 'Waiting for more members or pending activation',
    },
    paused: {
      label: 'Paused',
      color: 'info',
      icon: Pause,
      description: 'Chama activities are temporarily paused',
    },
    completed: {
      label: 'Completed',
      color: 'primary',
      icon: CheckCircle,
      description: 'Chama cycle has been completed successfully',
    },
    cancelled: {
      label: 'Cancelled',
      color: 'error',
      icon: Stop,
      description: 'Chama has been cancelled or terminated',
    },
    expired: {
      label: 'Expired',
      color: 'error',
      icon: Error,
      description: 'Chama has expired due to inactivity',
    },
    waiting: {
      label: 'Waiting',
      color: 'default',
      icon: HourglassEmpty,
      description: 'Waiting for next cycle or action',
    },
    contributing: {
      label: 'Contributing',
      color: 'success',
      icon: TrendingUp,
      description: 'Currently in contribution phase',
    },
    distributing: {
      label: 'Distributing',
      color: 'info',
      icon: PlayArrow,
      description: 'Distributing funds to members',
    },
    recruiting: {
      label: 'Recruiting',
      color: 'secondary',
      icon: Group,
      description: 'Looking for new members to join',
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const IconComponent = config.icon;
  const displayLabel = customLabel || config.label;
  const displayTooltip = tooltip || config.description;

  // Chip variant
  if (variant === 'chip') {
    const chipContent = (
      <Chip
        icon={showIcon ? <IconComponent /> : undefined}
        label={showLabel ? displayLabel : ''}
        color={config.color}
        size={size}
        variant="outlined"
        sx={{
          fontWeight: 500,
          '& .MuiChip-icon': {
            fontSize: size === 'small' ? 16 : 18,
          },
        }}
      />
    );

    if (displayTooltip) {
      return (
        <Tooltip title={displayTooltip} arrow>
          {chipContent}
        </Tooltip>
      );
    }

    return chipContent;
  }

  // Badge variant
  if (variant === 'badge') {
    const badgeContent = (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1,
          py: 0.5,
          borderRadius: 1,
          backgroundColor: `${config.color}.50`,
          color: `${config.color}.main`,
          border: 1,
          borderColor: `${config.color}.200`,
        }}
      >
        {showIcon && (
          <IconComponent 
            sx={{ 
              fontSize: size === 'small' ? 14 : 16,
              color: `${config.color}.main` 
            }} 
          />
        )}
        {showLabel && (
          <Typography 
            variant={size === 'small' ? 'caption' : 'body2'}
            sx={{ 
              fontWeight: 500,
              color: `${config.color}.main`,
              lineHeight: 1,
            }}
          >
            {displayLabel}
          </Typography>
        )}
      </Box>
    );

    if (displayTooltip) {
      return (
        <Tooltip title={displayTooltip} arrow>
          {badgeContent}
        </Tooltip>
      );
    }

    return badgeContent;
  }

  // Dot variant (minimal indicator)
  if (variant === 'dot') {
    const dotContent = (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Box
          sx={{
            width: size === 'small' ? 8 : 10,
            height: size === 'small' ? 8 : 10,
            borderRadius: '50%',
            backgroundColor: `${config.color}.main`,
            boxShadow: `0 0 0 2px ${theme.palette[config.color]?.light || theme.palette.grey[300]}`,
          }}
        />
        {showLabel && (
          <Typography 
            variant={size === 'small' ? 'caption' : 'body2'}
            sx={{ fontWeight: 500 }}
          >
            {displayLabel}
          </Typography>
        )}
      </Box>
    );

    if (displayTooltip) {
      return (
        <Tooltip title={displayTooltip} arrow>
          {dotContent}
        </Tooltip>
      );
    }

    return dotContent;
  }

  // Icon variant
  if (variant === 'icon') {
    const iconContent = (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: showLabel ? 0.5 : 0,
        }}
      >
        <IconComponent
          sx={{
            fontSize: size === 'small' ? 18 : 24,
            color: `${config.color}.main`,
          }}
        />
        {showLabel && (
          <Typography 
            variant={size === 'small' ? 'body2' : 'body1'}
            sx={{ 
              fontWeight: 500,
              color: `${config.color}.main`,
            }}
          >
            {displayLabel}
          </Typography>
        )}
      </Box>
    );

    if (displayTooltip) {
      return (
        <Tooltip title={displayTooltip} arrow>
          {iconContent}
        </Tooltip>
      );
    }

    return iconContent;
  }

  // Default to chip if variant is not recognized
  return (
    <Chip
      icon={showIcon ? <IconComponent /> : undefined}
      label={showLabel ? displayLabel : ''}
      color={config.color}
      size={size}
      variant="outlined"
    />
  );
};

// Predefined status indicators for common use cases
export const ChamaStatusIndicator = ({ chama, ...props }) => {
  // Logic to determine chama status based on chama data
  const determineStatus = () => {
    if (!chama) return 'pending';
    
    // Add your business logic here
    // This is a simplified example
    if (chama.isActive) return 'active';
    if (chama.isPaused) return 'paused';
    if (chama.isCompleted) return 'completed';
    if (chama.isCancelled) return 'cancelled';
    
    return 'pending';
  };

  return (
    <StatusIndicator 
      status={determineStatus()} 
      {...props} 
    />
  );
};

export const NetworkStatusIndicator = ({ isConnected, networkName, ...props }) => {
  const status = isConnected ? 'active' : 'error';
  const label = isConnected ? `Connected to ${networkName}` : 'Not Connected';
  
  return (
    <StatusIndicator 
      status={status}
      customLabel={label}
      {...props} 
    />
  );
};

export default StatusIndicator;
