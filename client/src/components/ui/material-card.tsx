import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import MaterialIcon from './material-icon';

interface MaterialCardProps {
  title?: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  children: React.ReactNode;
  className?: string;
  elevation?: 'low' | 'medium' | 'high';
  onClick?: () => void;
}

const MaterialCard: React.FC<MaterialCardProps> = ({
  title,
  subtitle,
  icon,
  iconColor = 'var(--primary)',
  children,
  className = '',
  elevation = 'medium',
  onClick
}) => {
  const elevationClasses = {
    low: 'shadow-sm',
    medium: 'shadow-md',
    high: 'shadow-lg'
  };

  const cardClasses = `
    transition-all duration-200 
    hover:shadow-lg hover:-translate-y-1
    ${elevationClasses[elevation]}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `.trim();

  return (
    <Card className={cardClasses} onClick={onClick}>
      {(title || subtitle || icon) && (
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            {icon && (
              <div 
                className="p-2 rounded-full"
                style={{ backgroundColor: `${iconColor}20` }}
              >
                <MaterialIcon 
                  name={icon} 
                  color={iconColor}
                  size="medium"
                />
              </div>
            )}
            <div className="flex-1">
              {title && (
                <CardTitle className="text-lg font-medium text-foreground">
                  {title}
                </CardTitle>
              )}
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className={title || subtitle || icon ? 'pt-0' : ''}>
        {children}
      </CardContent>
    </Card>
  );
};

export default MaterialCard;
