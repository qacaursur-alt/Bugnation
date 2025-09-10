import React from 'react';

interface MaterialIconProps {
  name: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const MaterialIcon: React.FC<MaterialIconProps> = ({ 
  name, 
  className = '', 
  size = 'medium',
  color 
}) => {
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-xl'
  };

  const style = color ? { color } : {};

  return (
    <span 
      className={`material-icons ${sizeClasses[size]} ${className}`}
      style={style}
    >
      {name}
    </span>
  );
};

export default MaterialIcon;
