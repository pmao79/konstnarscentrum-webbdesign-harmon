
import React from 'react';

const SKCLogo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="text-center">
        <div className="relative inline-block">
          <span className="font-black text-[2.5rem] leading-none tracking-tighter">SKC</span>
          <div className="absolute h-[2px] bg-yellow-400 w-full -left-1 top-1/2 z-[-1]" 
               style={{ width: 'calc(100% + 8px)' }}></div>
        </div>
        <div className="text-[0.6rem] font-bold mt-[-2px]">SVENSKT KONSTNÄRSCENTRUM</div>
      </div>
    </div>
  );
};

export default SKCLogo;
