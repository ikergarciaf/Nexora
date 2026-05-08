import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  color?: string;
}

export const NexoraLogo: React.FC<LogoProps> = ({ className = "", size = 40, color = "#008477" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="10" y="10" width="80" height="80" rx="16" fill={color} />
      <path d="M30 70V30L55 60V30" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M55 70L70 70" stroke="white" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
};

export default NexoraLogo;
