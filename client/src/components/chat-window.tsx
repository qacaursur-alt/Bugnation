import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import MaterialIcon from './ui/material-icon';
import { cn } from '../lib/utils';
import { apiRequest } from '../lib/queryClient';

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
  isOwn: boolean;
  isAI?: boolean;
}

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  isOpen,
  onClose,
  title = "Live Chat",
  className = ""
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'AI Assistant',
      message: 'Hello! I\'m your AI assistant for TestCademy. I can help you with questions about software testing, course recommendations, study tips, and more. How can I assist you today?',
      timestamp: new Date(),
      isOwn: false,
      isAI: true
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'You',
        message: newMessage.trim(),
        timestamp: new Date(),
        isOwn: true
      };
      
      setMessages(prev => [...prev, userMessage]);
      const currentMessage = newMessage.trim();
      setNewMessage('');
      
      // Show typing indicator
      setIsTyping(true);
      
      try {
        if (isAIEnabled) {
          // Get AI response
          const chatHistory = messages.map(msg => ({
            role: msg.isOwn ? 'user' : 'assistant',
            content: msg.message
          }));
          
          const response = await apiRequest('/api/ai/chat', 'POST', {
            messages: [...chatHistory, { role: 'user', content: currentMessage }],
            context: 'TestCademy software testing academy'
          });
          
          const responseData = await response.json();
          
          const aiResponse: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sender: 'AI Assistant',
            message: responseData.content,
            timestamp: new Date(),
            isOwn: false,
            isAI: true
          };
          
          setMessages(prev => [...prev, aiResponse]);
        } else {
          // Fallback to human support
          const supportResponse: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sender: 'Support',
            message: 'Thank you for your message. Our support team will get back to you shortly!',
            timestamp: new Date(),
            isOwn: false
          };
          setMessages(prev => [...prev, supportResponse]);
        }
      } catch (error) {
        console.error('Chat error:', error);
        const errorResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'System',
          message: 'Sorry, I encountered an error. Please try again or contact our support team.',
          timestamp: new Date(),
          isOwn: false
        };
        setMessages(prev => [...prev, errorResponse]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <Card className={cn(
      "fixed bottom-4 right-4 w-80 h-96 z-50 flex flex-col",
      "shadow-2xl border-0 bg-background",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-primary text-primary-foreground rounded-t-lg">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <MaterialIcon name="chat" size="small" />
            {title}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {isAIEnabled ? 'AI Powered' : 'Human Support'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAIEnabled(!isAIEnabled)}
            className="text-primary-foreground hover:bg-primary-foreground/20"
            title={isAIEnabled ? 'Switch to Human Support' : 'Switch to AI Assistant'}
          >
            <MaterialIcon name={isAIEnabled ? "smart_toy" : "support_agent"} size="small" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <MaterialIcon name="close" size="small" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Quick Actions */}
        {messages.length === 1 && (
          <div className="p-4 border-b">
            <p className="text-sm text-muted-foreground mb-2">Quick actions:</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNewMessage("What courses do you offer?")}
                className="text-xs"
              >
                View Courses
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNewMessage("How do I enroll?")}
                className="text-xs"
              >
                Enrollment Help
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNewMessage("What is software testing?")}
                className="text-xs"
              >
                Learn Basics
              </Button>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.isOwn ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2",
                  message.isOwn
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <div className="text-sm font-medium mb-1 flex items-center gap-1">
                  {message.isAI && <MaterialIcon name="smart_toy" size="small" />}
                  {message.sender}
                </div>
                <div className="text-sm">{message.message}</div>
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted text-muted-foreground rounded-lg px-3 py-2">
                <div className="flex items-center space-x-1">
                  <span className="text-sm">Support is typing</span>
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="border-t p-3">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isTyping}
              size="sm"
              className="px-3"
            >
              <MaterialIcon name="send" size="small" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatWindow;
