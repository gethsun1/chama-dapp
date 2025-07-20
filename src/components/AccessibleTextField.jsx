// src/components/AccessibleTextField.jsx
import React, { useState, useId } from 'react';
import {
  TextField,
  FormControl,
  FormLabel,
  FormHelperText,
  InputAdornment,
  IconButton,
  Box,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Info,
  CheckCircle,
  Error,
} from '@mui/icons-material';

const AccessibleTextField = ({
  label,
  helperText,
  errorText,
  successText,
  required = false,
  type = 'text',
  showPasswordToggle = false,
  showCharacterCount = false,
  maxLength,
  validation,
  tooltipText,
  startIcon,
  endIcon,
  value = '',
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  placeholder,
  multiline = false,
  rows = 4,
  fullWidth = true,
  variant = 'outlined',
  size = 'medium',
  autoComplete,
  inputProps = {},
  sx = {},
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  
  const fieldId = useId();
  const helperTextId = useId();
  const errorTextId = useId();
  
  // Determine if field has error
  const hasError = Boolean(errorText && touched);
  const hasSuccess = Boolean(successText && touched && !hasError);
  
  // Character count
  const characterCount = value ? value.length : 0;
  const isOverLimit = maxLength && characterCount > maxLength;
  
  // Validation state
  const validationState = validation ? validation(value) : { isValid: true };
  const showValidationError = touched && !validationState.isValid;
  
  // Handle password visibility toggle
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };
  
  // Handle focus
  const handleFocus = (event) => {
    setFocused(true);
    if (onFocus) onFocus(event);
  };
  
  // Handle blur
  const handleBlur = (event) => {
    setFocused(false);
    setTouched(true);
    if (onBlur) onBlur(event);
  };
  
  // Handle change
  const handleChange = (event) => {
    if (onChange) onChange(event);
  };
  
  // Determine input type
  const inputType = type === 'password' && showPassword ? 'text' : type;
  
  // Build input props
  const enhancedInputProps = {
    ...inputProps,
    'aria-describedby': [
      helperText ? helperTextId : null,
      hasError || showValidationError ? errorTextId : null,
    ].filter(Boolean).join(' ') || undefined,
    'aria-invalid': hasError || showValidationError,
    'aria-required': required,
    maxLength: maxLength,
  };
  
  // Build end adornment
  const endAdornment = (
    <>
      {type === 'password' && showPasswordToggle && (
        <InputAdornment position="end">
          <IconButton
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={handleTogglePassword}
            edge="end"
            size="small"
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      )}
      {endIcon && (
        <InputAdornment position="end">
          {endIcon}
        </InputAdornment>
      )}
      {hasSuccess && (
        <InputAdornment position="end">
          <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
        </InputAdornment>
      )}
      {(hasError || showValidationError) && (
        <InputAdornment position="end">
          <Error sx={{ color: 'error.main', fontSize: 20 }} />
        </InputAdornment>
      )}
    </>
  );
  
  // Build start adornment
  const startAdornment = startIcon ? (
    <InputAdornment position="start">
      {startIcon}
    </InputAdornment>
  ) : undefined;
  
  return (
    <FormControl fullWidth={fullWidth} error={hasError || showValidationError}>
      {/* Label with tooltip */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
        <FormLabel
          htmlFor={fieldId}
          required={required}
          sx={{
            color: focused ? 'primary.main' : 'text.primary',
            fontWeight: 500,
            fontSize: '0.875rem',
          }}
        >
          {label}
        </FormLabel>
        {tooltipText && (
          <Tooltip title={tooltipText} arrow>
            <Info sx={{ fontSize: 16, color: 'text.secondary', cursor: 'help' }} />
          </Tooltip>
        )}
      </Box>
      
      {/* Text Field */}
      <TextField
        id={fieldId}
        type={inputType}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        multiline={multiline}
        rows={multiline ? rows : undefined}
        fullWidth={fullWidth}
        variant={variant}
        size={size}
        autoComplete={autoComplete}
        error={hasError || showValidationError}
        InputProps={{
          ...enhancedInputProps,
          startAdornment,
          endAdornment,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
              borderWidth: 2,
            },
            '&.Mui-error fieldset': {
              borderColor: 'error.main',
            },
          },
          ...sx,
        }}
        {...props}
      />
      
      {/* Helper Text and Character Count */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mt: 0.5 }}>
        <Box sx={{ flex: 1 }}>
          {/* Helper Text */}
          {helperText && !hasError && !showValidationError && (
            <FormHelperText id={helperTextId} sx={{ color: 'text.secondary' }}>
              {helperText}
            </FormHelperText>
          )}
          
          {/* Success Text */}
          {hasSuccess && (
            <FormHelperText sx={{ color: 'success.main' }}>
              {successText}
            </FormHelperText>
          )}
          
          {/* Error Text */}
          {hasError && (
            <FormHelperText id={errorTextId} error>
              {errorText}
            </FormHelperText>
          )}
          
          {/* Validation Error */}
          {showValidationError && (
            <FormHelperText id={errorTextId} error>
              {validationState.message}
            </FormHelperText>
          )}
        </Box>
        
        {/* Character Count */}
        {showCharacterCount && (
          <Typography
            variant="caption"
            sx={{
              color: isOverLimit ? 'error.main' : 'text.secondary',
              fontWeight: isOverLimit ? 600 : 400,
              ml: 1,
              flexShrink: 0,
            }}
          >
            {characterCount}{maxLength && `/${maxLength}`}
          </Typography>
        )}
      </Box>
    </FormControl>
  );
};

// Validation helpers
export const validators = {
  required: (value) => ({
    isValid: Boolean(value && value.trim()),
    message: 'This field is required',
  }),
  
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      isValid: !value || emailRegex.test(value),
      message: 'Please enter a valid email address',
    };
  },
  
  minLength: (min) => (value) => ({
    isValid: !value || value.length >= min,
    message: `Must be at least ${min} characters long`,
  }),
  
  maxLength: (max) => (value) => ({
    isValid: !value || value.length <= max,
    message: `Must be no more than ${max} characters long`,
  }),
  
  number: (value) => ({
    isValid: !value || !isNaN(Number(value)),
    message: 'Please enter a valid number',
  }),
  
  positiveNumber: (value) => ({
    isValid: !value || (!isNaN(Number(value)) && Number(value) > 0),
    message: 'Please enter a positive number',
  }),
  
  ethereum: (value) => {
    const ethRegex = /^0x[a-fA-F0-9]{40}$/;
    return {
      isValid: !value || ethRegex.test(value),
      message: 'Please enter a valid Ethereum address',
    };
  },
  
  combine: (...validators) => (value) => {
    for (const validator of validators) {
      const result = validator(value);
      if (!result.isValid) {
        return result;
      }
    }
    return { isValid: true };
  },
};

export default AccessibleTextField;
