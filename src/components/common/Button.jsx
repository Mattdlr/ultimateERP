/**
 * Button Component
 * Reusable button with multiple style variants
 *
 * Variants:
 * - primary: Main action button (orange)
 * - secondary: Secondary action button (dark)
 * - ghost: Transparent button
 */

import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const combinedClassName = `${baseClass} ${variantClass} ${className}`.trim();

  return (
    <button
      type={type}
      className={combinedClassName}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
