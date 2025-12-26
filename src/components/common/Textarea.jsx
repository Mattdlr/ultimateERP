/**
 * Textarea Component
 * Reusable textarea with consistent styling
 *
 * Features:
 * - Integrated label support
 * - Auto-resize option
 * - Required field indicator
 * - Character count (optional)
 */

import React from 'react';

export default function Textarea({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  rows = 4,
  maxLength,
  showCharCount = false,
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
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className="form-textarea"
        {...props}
      />
      {showCharCount && maxLength && (
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'right' }}>
          {value?.length || 0} / {maxLength}
        </div>
      )}
    </div>
  );
}
