// src/components/BreadcrumbNavigation.jsx
import React from 'react';
import {
  Breadcrumbs,
  Link,
  Typography,
  Box,
  Container,
  Paper,
} from '@mui/material';
import {
  NavigateNext,
  Home,
  Dashboard,
  Add,
  Group,
} from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const BreadcrumbNavigation = ({ 
  customBreadcrumbs = null,
  showContainer = true,
  showBackground = true 
}) => {
  const location = useLocation();

  // Icon mapping for different routes
  const routeIcons = {
    '/': Home,
    '/dashboard': Dashboard,
    '/create-chama': Add,
    '/join-chama': Group,
  };

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    if (customBreadcrumbs) {
      return customBreadcrumbs;
    }

    const pathnames = location.pathname.split('/').filter((x) => x);
    
    // Always start with Home
    const breadcrumbs = [
      {
        label: 'Home',
        path: '/',
        icon: Home,
      }
    ];

    // Add breadcrumbs for each path segment
    let currentPath = '';
    pathnames.forEach((pathname, index) => {
      currentPath += `/${pathname}`;
      
      // Convert pathname to readable label
      const label = pathname
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      const IconComponent = routeIcons[currentPath];
      
      breadcrumbs.push({
        label,
        path: currentPath,
        icon: IconComponent,
        isLast: index === pathnames.length - 1,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on home page unless there are custom breadcrumbs
  if (location.pathname === '/' && !customBreadcrumbs) {
    return null;
  }

  const breadcrumbContent = (
    <Box sx={{ py: 2 }}>
      <Breadcrumbs
        separator={<NavigateNext fontSize="small" />}
        aria-label="breadcrumb"
        sx={{
          '& .MuiBreadcrumbs-separator': {
            color: 'text.secondary',
          },
        }}
      >
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const IconComponent = breadcrumb.icon;

          if (isLast) {
            return (
              <Box
                key={breadcrumb.path}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: 'text.primary',
                }}
              >
                {IconComponent && (
                  <IconComponent sx={{ fontSize: 16 }} />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                  }}
                >
                  {breadcrumb.label}
                </Typography>
              </Box>
            );
          }

          return (
            <Link
              key={breadcrumb.path}
              component={RouterLink}
              to={breadcrumb.path}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: 'text.secondary',
                textDecoration: 'none',
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              {IconComponent && (
                <IconComponent sx={{ fontSize: 16 }} />
              )}
              <Typography variant="body2">
                {breadcrumb.label}
              </Typography>
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );

  if (!showContainer) {
    return breadcrumbContent;
  }

  if (showBackground) {
    return (
      <Paper
        elevation={0}
        sx={{
          backgroundColor: 'grey.50',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="xl">
          {breadcrumbContent}
        </Container>
      </Paper>
    );
  }

  return (
    <Container maxWidth="xl">
      {breadcrumbContent}
    </Container>
  );
};

// Hook for easy breadcrumb management
export const useBreadcrumbs = () => {
  const location = useLocation();

  const setBreadcrumbs = (breadcrumbs) => {
    // This could be enhanced with context or state management
    // For now, it's a placeholder for future implementation
    return breadcrumbs;
  };

  return { setBreadcrumbs, currentPath: location.pathname };
};

// Predefined breadcrumb configurations for common pages
export const breadcrumbConfigs = {
  dashboard: [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Dashboard', path: '/dashboard', icon: Dashboard },
  ],
  createChama: [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Create Chama', path: '/create-chama', icon: Add },
  ],
  joinChama: [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Join Chama', path: '/join-chama', icon: Group },
  ],
  chamaDetails: (chamaName) => [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Dashboard', path: '/dashboard', icon: Dashboard },
    { label: chamaName || 'Chama Details', path: '#', icon: Group },
  ],
};

export default BreadcrumbNavigation;
