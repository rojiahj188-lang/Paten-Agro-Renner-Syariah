import React, { useState } from 'react';

interface RennerLogoProps {
  className?: string;
  size?: number;
}

export const RennerLogo: React.FC<RennerLogoProps> = ({
  className = 'w-10 h-10',
  size = 40
}) => {
  const [imageFailed, setImageFailed] = useState<boolean>(false);

  return (
    <div className={`relative flex items-center justify-center rounded-2xl overflow-hidden shadow-sm shrink-0 border border-emerald-600/40 bg-emerald-900 ${className}`}>
      {!imageFailed ? (
        <img
          src="/renner-logo.jpg"
          alt="Logo Renner Syariah - Paten Agro"
          className="w-full h-full object-cover object-center"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Official Renner Syariah Emerald Green Background */}
          <rect width="200" height="200" rx="36" fill="#016836" />

          {/* Official Stylized 'R' Tree Mark in Solid Pure White */}
          <g fill="#FFFFFF">
            {/* 1. Top-Left Branch Segment */}
            <path d="M 22 16 H 88 V 76 L 22 46 Z" />

            {/* 2. Middle-Left Branch Segment */}
            <path d="M 22 60 L 88 90 V 134 L 22 104 Z" />

            {/* 3. Bottom-Left Segment with Smooth Rounded Corner */}
            <path d="M 22 118 L 88 148 V 184 H 52 C 34 184 22 172 22 154 Z" />

            {/* 4. Upper Bowl Segment */}
            <path d="M 104 16 H 144 C 168 16 182 30 182 52 C 182 66 174 76 164 80 L 104 76 Z" />

            {/* 5. Lower Bowl Segment */}
            <path d="M 104 90 L 158 84 C 170 92 172 106 164 116 L 104 134 Z" />

            {/* 6. Sturdy Diagonal Leg */}
            <path d="M 104 148 L 148 127 L 182 184 H 140 L 104 148 Z" />
          </g>
        </svg>
      )}
    </div>
  );
};

