/**
 * Input Component
 * Reusable text input with consistent styling
 *
 * Features:
 * - Integrated label support
 * - Error state handling
 * - Required field indicator
 * - Placeholder support
 */

import React from 'react';

export default function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  className = '',
  ...props
}) {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span style={{ color: 'var(--accent-orange)' }}> *</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="form-input"
        {...props}
      />
      {error && (
        <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
          {error}
        </div>
      )}
    </div>
  );
}
