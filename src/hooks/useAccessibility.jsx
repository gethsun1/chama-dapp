// src/hooks/useAccessibility.js
import { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme } from '@mui/material/styles';

/**
 * Custom hook for accessibility features
 * Provides keyboard navigation, focus management, and screen reader support
 */
export const useAccessibility = () => {
  const theme = useTheme();
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [announceMessage, setAnnounceMessage] = useState('');
  const announcementRef = useRef(null);

  // Screen reader announcement
  const announce = useCallback((message, priority = 'polite') => {
    setAnnounceMessage(message);
    if (announcementRef.current) {
      announcementRef.current.setAttribute('aria-live', priority);
      // Clear after announcement to allow re-announcement of same message
      setTimeout(() => setAnnounceMessage(''), 100);
    }
  }, []);

  // High contrast mode toggle
  const toggleHighContrast = useCallback(() => {
    setIsHighContrast(prev => !prev);
    announce(isHighContrast ? 'High contrast mode disabled' : 'High contrast mode enabled');
  }, [isHighContrast, announce]);

  // Keyboard navigation helpers
  const handleKeyNavigation = useCallback((event, items, currentIndex, onSelect) => {
    const { key } = event;
    let newIndex = currentIndex;

    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowUp':
        event.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = items.length - 1;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (onSelect && items[currentIndex]) {
          onSelect(items[currentIndex], currentIndex);
        }
        break;
      case 'Escape':
        event.preventDefault();
        // Let parent handle escape
        return false;
      default:
        return false;
    }

    return newIndex;
  }, []);

  // Focus management
  const focusElement = useCallback((element, options = {}) => {
    if (element) {
      element.focus(options);
      // Announce focus change for screen readers
      const label = element.getAttribute('aria-label') || 
                   element.getAttribute('title') || 
                   element.textContent?.trim();
      if (label && options.announce !== false) {
        announce(`Focused on ${label}`);
      }
    }
  }, [announce]);

  // Trap focus within a container
  const trapFocus = useCallback((containerRef, isActive = true) => {
    useEffect(() => {
      if (!isActive || !containerRef.current) return;

      const container = containerRef.current;
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleTabKey = (e) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      container.addEventListener('keydown', handleTabKey);
      return () => container.removeEventListener('keydown', handleTabKey);
    }, [isActive]);
  }, []);

  // Generate accessible IDs
  const generateId = useCallback((prefix = 'accessible') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // High contrast styles
  const getHighContrastStyles = useCallback(() => {
    if (!isHighContrast) return {};

    return {
      backgroundColor: '#000000',
      color: '#ffffff',
      border: '2px solid #ffffff',
      '& .MuiButton-root': {
        backgroundColor: '#000000',
        color: '#ffffff',
        border: '2px solid #ffffff',
        '&:hover': {
          backgroundColor: '#333333',
        },
        '&:focus': {
          outline: '3px solid #ffff00',
          outlineOffset: '2px',
        },
      },
      '& .MuiTextField-root': {
        '& .MuiOutlinedInput-root': {
          backgroundColor: '#000000',
          color: '#ffffff',
          '& fieldset': {
            borderColor: '#ffffff',
            borderWidth: '2px',
          },
          '&:hover fieldset': {
            borderColor: '#ffffff',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#ffff00',
            borderWidth: '3px',
          },
        },
      },
      '& .MuiCard-root': {
        backgroundColor: '#000000',
        color: '#ffffff',
        border: '2px solid #ffffff',
      },
      '& .MuiChip-root': {
        backgroundColor: '#333333',
        color: '#ffffff',
        border: '1px solid #ffffff',
      },
    };
  }, [isHighContrast]);

  // ARIA live region component
  const AriaLiveRegion = () => (
    <div
      ref={announcementRef}
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      }}
    >
      {announceMessage}
    </div>
  );

  return {
    // State
    isHighContrast,
    
    // Functions
    announce,
    toggleHighContrast,
    handleKeyNavigation,
    focusElement,
    trapFocus,
    generateId,
    getHighContrastStyles,
    
    // Components
    AriaLiveRegion,
  };
};

/**
 * Hook for managing focus within lists/grids
 */
export const useListNavigation = (items = [], options = {}) => {
  const [focusedIndex, setFocusedIndex] = useState(options.initialIndex || 0);
  const { handleKeyNavigation, announce } = useAccessibility();

  const handleKeyDown = useCallback((event) => {
    const newIndex = handleKeyNavigation(
      event, 
      items, 
      focusedIndex, 
      options.onSelect
    );
    
    if (newIndex !== false && newIndex !== focusedIndex) {
      setFocusedIndex(newIndex);
      if (options.announceNavigation) {
        announce(`Item ${newIndex + 1} of ${items.length}`);
      }
    }
  }, [items, focusedIndex, handleKeyNavigation, announce, options]);

  const setFocus = useCallback((index) => {
    if (index >= 0 && index < items.length) {
      setFocusedIndex(index);
    }
  }, [items.length]);

  return {
    focusedIndex,
    setFocus,
    handleKeyDown,
    isItemFocused: (index) => index === focusedIndex,
  };
};

export default useAccessibility;
