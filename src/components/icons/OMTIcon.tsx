import React from 'react';

interface OMTIconProps {
  className?: string;
  size?: number;
}

const OMTIcon: React.FC<OMTIconProps> = ({ className = "", size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 40"
      className={className}
      fill="currentColor"
    >
      {/* O */}
      <ellipse cx="12" cy="20" rx="10" ry="18" fill="none" stroke="currentColor" strokeWidth="3"/>
      <ellipse cx="12" cy="20" rx="6" ry="12" fill="none" stroke="currentColor" strokeWidth="2"/>
      
      {/* M */}
      <path d="M30 38 L30 2 L38 16 L46 2 L46 38 M30 2 L46 2" stroke="currentColor" strokeWidth="3" fill="none"/>
      
      {/* T */}
      <path d="M55 2 L85 2 M70 2 L70 38" stroke="currentColor" strokeWidth="3" fill="none"/>
    </svg>
  );
};

export default OMTIcon;