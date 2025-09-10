import React from 'react';
import { Button } from './button';
import MaterialIcon from './material-icon';
import { cn } from '../../lib/utils';

interface MaterialButtonProps {
  children: React.ReactNode;
  variant?: 'filled' | 'outlined' | 'text' | 'fab';
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'accent' | 'error' | 'success';
  icon?: string;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const MaterialButton: React.FC<MaterialButtonProps> = ({
  children,
  variant = 'filled',
  size = 'medium',
  color = 'primary',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  className = '',
  onClick,
  type = 'button'
}) => {
  const sizeClasses = {
    small: 'h-8 px-3 text-sm',
    medium: 'h-10 px-4 text-base',
    large: 'h-12 px-6 text-lg'
  };

  const colorClasses = {
    primary: {
      filled: 'bg-primary hover:bg-primary/90 text-primary-foreground',
      outlined: 'border-primary text-primary hover:bg-primary/10',
      text: 'text-primary hover:bg-primary/10',
      fab: 'bg-primary hover:bg-primary/90 text-primary-foreground rounded-full'
    },
    secondary: {
      filled: 'bg-secondary hover:bg-secondary/90 text-secondary-foreground',
      outlined: 'border-secondary text-secondary hover:bg-secondary/10',
      text: 'text-secondary-foreground hover:bg-secondary/10',
      fab: 'bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full'
    },
    accent: {
      filled: 'bg-accent hover:bg-accent/90 text-accent-foreground',
      outlined: 'border-accent text-accent hover:bg-accent/10',
      text: 'text-accent hover:bg-accent/10',
      fab: 'bg-accent hover:bg-accent/90 text-accent-foreground rounded-full'
    },
    error: {
      filled: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
      outlined: 'border-destructive text-destructive hover:bg-destructive/10',
      text: 'text-destructive hover:bg-destructive/10',
      fab: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full'
    },
    success: {
      filled: 'bg-success hover:bg-success/90 text-white',
      outlined: 'border-success text-success hover:bg-success/10',
      text: 'text-success hover:bg-success/10',
      fab: 'bg-success hover:bg-success/90 text-white rounded-full'
    }
  };

  const baseClasses = cn(
    'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    sizeClasses[size],
    colorClasses[color][variant],
    variant === 'outlined' && 'border',
    variant === 'fab' && 'aspect-square',
    className
  );

  const iconSize = size === 'small' ? 'small' : size === 'large' ? 'large' : 'medium';

  return (
    <Button
      type={type}
      className={baseClasses}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <MaterialIcon name="refresh" size={iconSize} className="animate-spin" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <MaterialIcon name={icon} size={iconSize} />
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <MaterialIcon name={icon} size={iconSize} />
          )}
        </>
      )}
    </Button>
  );
};

export default MaterialButton;
