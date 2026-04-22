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
      {/* Geometrically Balanced Cloud */}
      <path 
        d="M25 75C16.7157 75 10 68.2843 10 60C10 52.4578 15.578 46.2166 22.8427 45.148C25.4385 30.6859 38.006 19.5 53 19.5C65.5126 19.5 76.2625 27.81 79.851 39.2941C88.3752 40.5739 95 47.9252 95 56.8C95 66.8516 86.8516 75 76.8 75H25Z" 
        fill={color} 
      />
      
      {/* Sharp, High-Contrast Negative Space N */}
      <path 
        d="M40 60V35L60 60V35" 
        stroke="white" 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Minimal Accent for a 'Modern App' look */}
      <rect x="73" y="32" width="6" height="6" rx="3" fill="white" className="opacity-30" />
    </svg>
  );
};

export default NexoraLogo;
