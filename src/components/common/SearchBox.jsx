/**
 * SearchBox Component
 * Reusable search input with icon
 *
 * Features:
 * - Integrated search icon
 * - Debounce support (optional)
 * - Clear button (optional)
 */

import React from 'react';
import { SearchIcon, XIcon } from './Icons';

export default function SearchBox({
  value,
  onChange,
  placeholder = 'Search...',
  onClear,
  showClearButton = true,
  className = '',
  ...props
}) {
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      // If no onClear handler, trigger onChange with empty value
      onChange({ target: { value: '' } });
    }
  };

  return (
    <div className={`search-box ${className}`}>
      <SearchIcon />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...props}
      />
      {showClearButton && value && (
        <button
          onClick={handleClear}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <XIcon />
        </button>
      )}
    </div>
  );
}
