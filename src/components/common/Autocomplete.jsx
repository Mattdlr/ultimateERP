/**
 * Autocomplete Component
 * Searchable dropdown with autocomplete functionality
 *
 * Features:
 * - Search/filter items
 * - Keyboard navigation (up/down arrows, enter to select)
 * - Click outside to close
 * - Selected item display
 * - Clear selection
 */

import React, { useState, useRef, useEffect } from 'react';
import { XIcon } from './Icons';

export default function Autocomplete({
  label,
  items = [],
  value,
  onChange,
  onSelect,
  placeholder = 'Search...',
  displayField = 'name',
  detailField,
  required = false,
  disabled = false,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Find selected item from value
  const selectedItem = items.find(item => item.id === value);

  // Filter items based on search term
  const filteredItems = items.filter(item => {
    const searchText = item[displayField]?.toLowerCase() || '';
    const detail = detailField ? (item[detailField]?.toLowerCase() || '') : '';
    const term = searchTerm.toLowerCase();
    return searchText.includes(term) || detail.includes(term);
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredItems.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredItems[highlightedIndex]) {
          handleSelect(filteredItems[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        break;
      default:
        break;
    }
  };

  const handleSelect = (item) => {
    if (onSelect) {
      onSelect(item);
    } else if (onChange) {
      onChange({ target: { value: item.id } });
    }
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(0);
  };

  const handleClear = () => {
    if (onChange) {
      onChange({ target: { value: '' } });
    }
    setSearchTerm('');
  };

  return (
    <div className={`form-group ${className}`} ref={containerRef}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span style={{ color: 'var(--accent-orange)' }}> *</span>}
        </label>
      )}

      <div className="autocomplete-container">
        {selectedItem ? (
          // Show selected item
          <div className="autocomplete-selected">
            <div>
              <div className="autocomplete-item-name">{selectedItem[displayField]}</div>
              {detailField && selectedItem[detailField] && (
                <div className="autocomplete-item-detail">{selectedItem[detailField]}</div>
              )}
            </div>
            <button onClick={handleClear} disabled={disabled}>
              <XIcon />
            </button>
          </div>
        ) : (
          // Show search input
          <input
            ref={inputRef}
            type="text"
            className="form-input"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
              setHighlightedIndex(0);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
          />
        )}

        {/* Dropdown */}
        {isOpen && !selectedItem && filteredItems.length > 0 && (
          <div className="autocomplete-dropdown">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className={`autocomplete-item ${index === highlightedIndex ? 'highlighted' : ''}`}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="autocomplete-item-name">{item[displayField]}</div>
                {detailField && item[detailField] && (
                  <div className="autocomplete-item-detail">{item[detailField]}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {isOpen && !selectedItem && filteredItems.length === 0 && searchTerm && (
          <div className="autocomplete-dropdown">
            <div className="autocomplete-item" style={{ color: 'var(--text-muted)' }}>
              No items found
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
