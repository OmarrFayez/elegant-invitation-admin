import React from 'react';

interface WishMoneyIconProps {
  className?: string;
  size?: number;
}

const WishMoneyIcon: React.FC<WishMoneyIconProps> = ({ className = "", size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 40"
      className={className}
      fill="currentColor"
    >
      {/* W */}
      <path d="M5 2 L12 38 L20 15 L28 38 L35 2" stroke="currentColor" strokeWidth="3" fill="none"/>
      
      {/* Dollar-like symbol with lines */}
      <g transform="translate(45, 0)">
        <path d="M10 5 L25 35 M15 5 L30 35 M20 5 L35 35 M25 5 L40 35" stroke="currentColor" strokeWidth="2"/>
        <path d="M5 10 L45 10 M0 20 L50 20 M5 30 L45 30" stroke="currentColor" strokeWidth="2"/>
      </g>
    </svg>
  );
};

export default WishMoneyIcon;