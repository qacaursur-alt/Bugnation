import React, { useState } from 'react';
import { Button } from './ui/button';
import MaterialIcon from './ui/material-icon';
import ChatWindow from './chat-window';
import { cn } from '../lib/utils';

interface FloatingChatButtonProps {
  className?: string;
  position?: 'bottom-right' | 'bottom-left';
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  className = '',
  position = 'bottom-right'
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  return (
    <>
      <Button
        onClick={() => setIsChatOpen(true)}
        className={cn(
          "fixed z-40 h-14 w-14 rounded-full shadow-lg",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          "transition-all duration-300 hover:scale-110",
          "flex items-center justify-center",
          positionClasses[position],
          className
        )}
        size="lg"
      >
        <MaterialIcon name="chat" size="large" />
      </Button>
      
      <ChatWindow
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        title="Live Support"
      />
    </>
  );
};

export default FloatingChatButton;
