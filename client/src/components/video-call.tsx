import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Users, 
  Copy,
  Share2,
  Monitor,
  MonitorOff,
  Hand,
  Settings,
  MessageCircle,
  MoreVertical,
  User,
  Crown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoCallProps {
  sessionId: string;
  sessionTitle: string;
  isHost?: boolean;
  onEndCall?: () => void;
  userId?: string;
  userName?: string;
}

interface Participant {
  id: string;
  name: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  hasRaisedHand: boolean;
  isHost: boolean;
  stream?: MediaStream;
}

export default function VideoCall({ sessionId, sessionTitle, isHost = false, onEndCall, userId, userName }: VideoCallProps) {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [hasRaisedHand, setHasRaisedHand] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [roomCode, setRoomCode] = useState(sessionId);
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{id: string, user: string, message: string, timestamp: Date}>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<any>(null);
  const socketRef = useRef<any>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check device availability on mount
    const checkDevices = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          const audioDevices = devices.filter(device => device.kind === 'audioinput');
          
          console.log('Device check:', { videoDevices: videoDevices.length, audioDevices: audioDevices.length });
          
          if (videoDevices.length === 0 && audioDevices.length === 0) {
            toast({
              title: "No Devices Found",
              description: "No camera or microphone detected. Please connect devices and refresh the page.",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error('Error checking devices:', error);
      }
    };

    checkDevices();

    // Initialize socket connection
    const initSocket = async () => {
      try {
        const { io } = await import('socket.io-client');
        socketRef.current = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:5000', {
          timeout: 5000,
          forceNew: true
        });
        
        socketRef.current.on('connect', () => {
          console.log('Connected to video call server');
          if (isHost) {
            socketRef.current.emit('create-room', sessionId);
          } else {
            socketRef.current.emit('join-room', sessionId);
          }
        });

        socketRef.current.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          toast({
            title: "Connection Error",
            description: "Failed to connect to video call server. Please check if the server is running.",
            variant: "destructive",
          });
        });

      socketRef.current.on('room-created', (roomId: string) => {
        setRoomCode(roomId);
        toast({
          title: "Room Created",
          description: `Share this code with participants: ${roomId}`,
        });
      });

      socketRef.current.on('user-joined', (participant: Participant) => {
        setParticipants(prev => [...prev, participant]);
        toast({
          title: "User Joined",
          description: `${participant.name} joined the call`,
        });
      });

      socketRef.current.on('user-left', (userId: string) => {
        setParticipants(prev => prev.filter(p => p.id !== userId));
        toast({
          title: "User Left",
          description: "A participant left the call",
        });
      });

      socketRef.current.on('user-updated', (participant: Participant) => {
        setParticipants(prev => prev.map(p => p.id === participant.id ? participant : p));
      });

      socketRef.current.on('chat-message', (message: {id: string, user: string, message: string, timestamp: string}) => {
        setChatMessages(prev => [...prev, {...message, timestamp: new Date(message.timestamp)}]);
      });

      socketRef.current.on('hand-raised', (userId: string, userName: string) => {
        setParticipants(prev => prev.map(p => p.id === userId ? {...p, hasRaisedHand: true} : p));
        toast({
          title: "Hand Raised",
          description: `${userName} raised their hand`,
        });
      });

      socketRef.current.on('hand-lowered', (userId: string) => {
        setParticipants(prev => prev.map(p => p.id === userId ? {...p, hasRaisedHand: false} : p));
      });

      socketRef.current.on('offer', async (data: any) => {
        try {
          const { default: SimplePeer } = await import('simple-peer');
          peerRef.current = new SimplePeer({ initiator: false, trickle: false });
          
          peerRef.current.on('signal', (signalData: any) => {
            socketRef.current.emit('answer', { ...signalData, room: sessionId });
          });

          peerRef.current.on('stream', (stream: MediaStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = stream;
            }
          });

          await peerRef.current.signal(data);
        } catch (error) {
          console.error('Error handling offer:', error);
        }
      });

      socketRef.current.on('answer', (data: any) => {
        if (peerRef.current) {
          peerRef.current.signal(data);
        }
      });

      socketRef.current.on('ice-candidate', (data: any) => {
        if (peerRef.current) {
          peerRef.current.signal(data);
        }
      });
      } catch (error) {
        console.error('Error initializing socket:', error);
        toast({
          title: "Connection Error",
          description: "Failed to initialize video call connection",
          variant: "destructive",
        });
      }
    };

    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [sessionId, isHost, toast]);

  const startCall = async () => {
    try {
      // Check if media devices are available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera and microphone access not supported by this browser');
      }

      // Check available devices first
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      const audioDevices = devices.filter(device => device.kind === 'audioinput');
      
      console.log('Available devices:', { videoDevices: videoDevices.length, audioDevices: audioDevices.length });

      if (videoDevices.length === 0 && audioDevices.length === 0) {
        throw new Error('No camera or microphone devices found on this system');
      }

      // Request permissions with more specific constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoDevices.length > 0 ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } : false,
        audio: audioDevices.length > 0 ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      if (isHost) {
        const { default: SimplePeer } = await import('simple-peer');
        peerRef.current = new SimplePeer({ 
          initiator: true, 
          stream: stream,
          trickle: false 
        });

        peerRef.current.on('signal', (data: any) => {
          socketRef.current.emit('offer', { ...data, room: sessionId });
        });

        peerRef.current.on('stream', (stream: MediaStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
        });
      }

      setIsConnected(true);
      setHasError(false);
      setErrorMessage('');
      toast({
        title: "Call Started",
        description: "Video call is now active",
      });
    } catch (error: any) {
      console.error('Error starting call:', error);
      setHasError(true);
      let errorMessage = "Failed to access camera/microphone";
      let actionMessage = "";
      
      if (error.name === 'NotAllowedError') {
        errorMessage = "Camera and microphone access denied";
        actionMessage = "Please click the camera/microphone icon in your browser's address bar and allow permissions, then refresh the page.";
      } else if (error.name === 'NotFoundError') {
        errorMessage = "No camera or microphone found";
        actionMessage = "Please check that your camera and microphone are connected and not being used by another application.";
      } else if (error.name === 'NotReadableError') {
        errorMessage = "Camera or microphone is being used by another application";
        actionMessage = "Please close other applications that might be using your camera/microphone (like Zoom, Teams, etc.) and try again.";
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = "Camera settings are not supported. Trying with basic settings...";
        // Try with basic constraints
        try {
          const basicStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });
          localStreamRef.current = basicStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = basicStream;
          }
          setIsConnected(true);
          toast({
            title: "Call Started",
            description: "Video call started with basic settings",
          });
          return;
        } catch (basicError) {
          errorMessage = "Unable to access camera/microphone with any settings";
          actionMessage = "Please check your device settings and browser permissions.";
        }
      } else if (error.message.includes('No camera or microphone devices found')) {
        errorMessage = "No camera or microphone devices found on this system";
        actionMessage = "Please connect a camera and microphone to your device and refresh the page.";
      }
      
      setErrorMessage(`${errorMessage}${actionMessage ? ` - ${actionMessage}` : ''}`);
      
      toast({
        title: "Error",
        description: (
          <div>
            <div className="font-medium">{errorMessage}</div>
            {actionMessage && <div className="text-sm mt-1 text-gray-600">{actionMessage}</div>}
          </div>
        ),
        variant: "destructive",
      });
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    if (socketRef.current) {
      socketRef.current.emit('leave-room', sessionId);
    }
    setIsConnected(false);
    onEndCall?.();
    toast({
      title: "Call Ended",
      description: "Video call has been ended",
    });
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast({
      title: "Copied",
      description: "Room code copied to clipboard",
    });
  };

  const shareRoom = () => {
    if (navigator.share) {
      navigator.share({
        title: `Join ${sessionTitle}`,
        text: `Join the video call for ${sessionTitle}`,
        url: `${window.location.origin}/video-call/${roomCode}`
      });
    } else {
      copyRoomCode();
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(track => track.stop());
          screenStreamRef.current = null;
        }
        setIsScreenSharing(false);
        // Switch back to camera
        if (localVideoRef.current && localStreamRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
      } else {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        screenStreamRef.current = screenStream;
        setIsScreenSharing(true);
        
        if (screenShareRef.current) {
          screenShareRef.current.srcObject = screenStream;
        }
        
        // Notify other participants
        socketRef.current?.emit('screen-share-started', sessionId);
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      toast({
        title: "Error",
        description: "Failed to start screen sharing",
        variant: "destructive",
      });
    }
  };

  const toggleRaiseHand = () => {
    const newRaiseHandState = !hasRaisedHand;
    setHasRaisedHand(newRaiseHandState);
    
    if (newRaiseHandState) {
      socketRef.current?.emit('raise-hand', sessionId, userId, userName);
    } else {
      socketRef.current?.emit('lower-hand', sessionId, userId);
    }
  };

  const sendChatMessage = () => {
    if (newMessage.trim() && socketRef.current) {
      const message = {
        id: Date.now().toString(),
        user: userName || 'Anonymous',
        message: newMessage.trim(),
        timestamp: new Date().toISOString()
      };
      
      socketRef.current.emit('chat-message', sessionId, message);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendChatMessage();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <div className="flex gap-4 h-[calc(100vh-8rem)]">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col">
          <Card className="flex-1">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  {sessionTitle} - Video Call
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono">{roomCode}</Badge>
                  <Button size="sm" variant="outline" onClick={copyRoomCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={shareRoom}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Video Grid */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {/* Local Video */}
                <div className="relative bg-slate-900 rounded-lg overflow-hidden">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    <User className="h-3 w-3" />
                    You {isMuted && '(Muted)'} {isVideoOff && '(Video Off)'}
                    {isHost && <Crown className="h-3 w-3 text-yellow-400" />}
                  </div>
                  {hasRaisedHand && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                      <Hand className="h-3 w-3" />
                      Hand Raised
                    </div>
                  )}
                </div>

                {/* Screen Share Video */}
                {isScreenSharing && (
                  <div className="relative bg-slate-900 rounded-lg overflow-hidden">
                    <video
                      ref={screenShareRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                      Screen Share
                    </div>
                  </div>
                )}

                {/* Remote Participants */}
                {participants.map((participant) => (
                  <div key={participant.id} className="relative bg-slate-900 rounded-lg overflow-hidden">
                    <video
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {participant.name}
                      {participant.isHost && <Crown className="h-3 w-3 text-yellow-400" />}
                    </div>
                    {participant.hasRaisedHand && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                        <Hand className="h-3 w-3" />
                        Hand Raised
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-2 flex-wrap">
                {!isConnected ? (
                  <div className="text-center">
                    {hasError ? (
                      <div className="space-y-3">
                        <div className="text-red-600 text-sm max-w-md">
                          {errorMessage}
                        </div>
                        <Button onClick={startCall} className="bg-green-600 hover:bg-green-700">
                          <Video className="h-4 w-4 mr-2" />
                          Try Again
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={startCall} className="bg-green-600 hover:bg-green-700">
                        <Video className="h-4 w-4 mr-2" />
                        Start Call
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={toggleMute}
                      className={isMuted ? 'bg-red-600 text-white hover:bg-red-700' : ''}
                    >
                      {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={toggleVideo}
                      className={isVideoOff ? 'bg-red-600 text-white hover:bg-red-700' : ''}
                    >
                      {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={toggleScreenShare}
                      className={isScreenSharing ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                    >
                      {isScreenSharing ? <MonitorOff className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={toggleRaiseHand}
                      className={hasRaisedHand ? 'bg-yellow-600 text-white hover:bg-yellow-700' : ''}
                    >
                      {hasRaisedHand ? <Hand className="h-4 w-4" /> : <Hand className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowChat(!showChat)}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowSettings(!showSettings)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={endCall}
                    >
                      <PhoneOff className="h-4 w-4 mr-2" />
                      End Call
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80">
            <Card className="h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Chat</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                  {chatMessages.map((message) => (
                    <div key={message.id} className="text-sm">
                      <div className="font-medium text-slate-700">{message.user}</div>
                      <div className="text-slate-600">{message.message}</div>
                      <div className="text-xs text-slate-400">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    ref={chatInputRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button onClick={sendChatMessage} size="sm">
                    Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Participants List */}
      <Card className="mt-4">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4" />
            <span className="font-medium">
              Participants ({participants.length + 1})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-full text-sm">
              <User className="h-4 w-4" />
              {userName || 'You'} {isHost && <Crown className="h-4 w-4 text-yellow-600" />}
            </div>
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-sm">
                <User className="h-4 w-4" />
                {participant.name}
                {participant.isHost && <Crown className="h-4 w-4 text-yellow-600" />}
                {participant.hasRaisedHand && <Hand className="h-4 w-4 text-yellow-600" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
