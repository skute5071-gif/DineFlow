import React from 'react';

interface VegBadgeProps {
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export const VegBadge: React.FC<VegBadgeProps> = ({ showLabel = false, size = 'md' }) => {
  const boxSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <div className="inline-flex items-center gap-1.5" title="100% Pure Vegetarian">
      <div
        className={`${boxSize} border-1.5 border-[#15803D] bg-white rounded-[3px] p-[1.5px] flex items-center justify-center shrink-0`}
      >
        <div className={`${dotSize} rounded-full bg-[#15803D]`} />
      </div>
      {showLabel && (
        <span className="text-[11px] font-semibold tracking-wider text-[#15803D] uppercase">
          Pure Veg
        </span>
      )}
    </div>
  );
};
