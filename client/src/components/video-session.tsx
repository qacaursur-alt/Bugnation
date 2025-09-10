import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import MaterialIcon from './ui/material-icon';
import { cn } from '../lib/utils';

interface VideoSessionProps {
  isOpen: boolean;
  onClose: () => void;
  sessionTitle?: string;
  className?: string;
}

const VideoSession: React.FC<VideoSessionProps> = ({
  isOpen,
  onClose,
  sessionTitle = "Live Session",
  className = ""
}) => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [participants, setParticipants] = useState([
    { id: '1', name: 'You', isHost: true, isVideoOn: true },
    { id: '2', name: 'Instructor', isHost: false, isVideoOn: true },
    { id: '3', name: 'Student 1', isHost: false, isVideoOn: false },
    { id: '4', name: 'Student 2', isHost: false, isVideoOn: true }
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      // Simulate video stream
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          if (process.env.NODE_ENV === 'development') {
            console.log('Error accessing media devices:', err);
          }
        });
    }
  }, [isOpen]);

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    // Update your video stream here
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    // Update your audio stream here
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    // Implement screen sharing logic here
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Implement recording logic here
  };

  const leaveSession = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className={cn(
        "w-full max-w-6xl h-[90vh] flex flex-col",
        "bg-background border-0 shadow-2xl",
        className
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-primary text-primary-foreground rounded-t-lg">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <MaterialIcon name="videocam" size="small" />
            {sessionTitle}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <MaterialIcon name="close" size="small" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Main Video Area */}
          <div className="flex-1 flex">
            {/* Primary Video */}
            <div className="flex-1 relative bg-gray-900 rounded-lg m-4">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover rounded-lg"
                style={{ display: isVideoEnabled ? 'block' : 'none' }}
              />
              {!isVideoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg">
                  <div className="text-center text-white">
                    <MaterialIcon name="videocam_off" size="large" className="mb-2" />
                    <p>Camera is off</p>
                  </div>
                </div>
              )}
              
              {/* Video Overlay Info */}
              <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {participants.find(p => p.isHost)?.name || 'Host'}
              </div>
              
              {isRecording && (
                <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  Recording
                </div>
              )}
            </div>
            
            {/* Participants Sidebar */}
            <div className="w-64 bg-muted/50 p-4 space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground">Participants ({participants.length})</h3>
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center space-x-3 p-2 bg-background rounded-lg">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm">
                    {participant.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{participant.name}</p>
                    {participant.isHost && (
                      <p className="text-xs text-muted-foreground">Host</p>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    {participant.isVideoOn ? (
                      <MaterialIcon name="videocam" size="small" className="text-green-600" />
                    ) : (
                      <MaterialIcon name="videocam_off" size="small" className="text-gray-400" />
                    )}
                    <MaterialIcon name="mic" size="small" className="text-green-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Controls */}
          <div className="border-t p-4">
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant={isAudioEnabled ? "default" : "destructive"}
                size="sm"
                onClick={toggleAudio}
                className="rounded-full w-12 h-12"
              >
                <MaterialIcon 
                  name={isAudioEnabled ? "mic" : "mic_off"} 
                  size="medium" 
                />
              </Button>
              
              <Button
                variant={isVideoEnabled ? "default" : "destructive"}
                size="sm"
                onClick={toggleVideo}
                className="rounded-full w-12 h-12"
              >
                <MaterialIcon 
                  name={isVideoEnabled ? "videocam" : "videocam_off"} 
                  size="medium" 
                />
              </Button>
              
              <Button
                variant={isScreenSharing ? "default" : "outline"}
                size="sm"
                onClick={toggleScreenShare}
                className="rounded-full w-12 h-12"
              >
                <MaterialIcon 
                  name={isScreenSharing ? "stop_screen_share" : "screen_share"} 
                  size="medium" 
                />
              </Button>
              
              <Button
                variant={isRecording ? "destructive" : "outline"}
                size="sm"
                onClick={toggleRecording}
                className="rounded-full w-12 h-12"
              >
                <MaterialIcon 
                  name={isRecording ? "stop" : "fiber_manual_record"} 
                  size="medium" 
                />
              </Button>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={leaveSession}
                className="rounded-full w-12 h-12"
              >
                <MaterialIcon name="call_end" size="medium" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoSession;
