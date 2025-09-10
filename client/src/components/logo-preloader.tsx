import React from 'react';

interface LogoPreloaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function LogoPreloader({ size = 'md', className = '' }: LogoPreloaderProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        {/* Logo with pulse animation */}
        <img 
          src="/attached_assets/New Project (4).png" 
          alt="Debug Nation Logo" 
          className="h-full w-full object-contain animate-pulse"
        />
        
        {/* Rotating ring around logo */}
        <div className="absolute inset-0 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        
        {/* Glowing effect */}
        <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping"></div>
      </div>
    </div>
  );
}

// Full screen preloader
export function FullScreenPreloader() {
  return (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <LogoPreloader size="xl" className="mb-4" />
        <p className="text-slate-600 font-medium">Loading Debug Nation...</p>
        <div className="mt-4 w-32 h-1 bg-slate-200 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-primary rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
