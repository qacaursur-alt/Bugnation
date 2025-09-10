import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  FileText, 
  File,
  Image,
  Presentation,
  Download,
  ExternalLink,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw
} from "lucide-react";

interface ContentViewerProps {
  content: {
    id: string;
    title: string;
    description?: string;
    type: 'video' | 'document' | 'pdf' | 'ppt' | 'image';
    fileUrl?: string;
    externalUrl?: string;
    fileName?: string;
    fileSize?: number;
    duration?: number;
  };
  onComplete?: () => void;
  isCompleted?: boolean;
  showProgress?: boolean;
}

export default function ContentViewer({ 
  content, 
  onComplete, 
  isCompleted = false, 
  showProgress = true 
}: ContentViewerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (onComplete && !isCompleted) {
      onComplete();
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'document': return FileText;
      case 'pdf': return File;
      case 'ppt': return Presentation;
      case 'image': return Image;
      default: return File;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-500';
      case 'document': return 'bg-blue-500';
      case 'pdf': return 'bg-red-600';
      case 'ppt': return 'bg-orange-500';
      case 'image': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const renderContent = () => {
    const src = content.fileUrl || content.externalUrl;
    if (!src) return null;

    switch (content.type) {
      case 'video':
        return (
          <div className="relative w-full bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-auto"
              onEnded={handleVideoEnded}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              controls
            >
              <source src={src} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Custom Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handlePlayPause}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleMute}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  
                  <span className="text-sm">
                    {formatDuration(content.duration)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleFullscreen}
                    className="text-white hover:bg-white/20"
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'pdf':
        return (
          <div className="w-full h-96 border rounded-lg overflow-hidden">
            <iframe
              src={src}
              className="w-full h-full"
              title={content.title}
            />
          </div>
        );
      
      case 'image':
        return (
          <div className="w-full">
            <img
              src={src}
              alt={content.title}
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        );
      
      case 'ppt':
        return (
          <div className="w-full h-96 border rounded-lg overflow-hidden">
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(src)}`}
              className="w-full h-full"
              title={content.title}
            />
          </div>
        );
      
      case 'document':
        return (
          <div className="w-full h-96 border rounded-lg overflow-hidden">
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(src)}`}
              className="w-full h-full"
              title={content.title}
            />
          </div>
        );
      
      default:
        return (
          <div className="w-full h-32 flex items-center justify-center bg-slate-100 rounded-lg">
            <p className="text-slate-500">Preview not available for this content type</p>
          </div>
        );
    }
  };

  const IconComponent = getContentTypeIcon(content.type);
  const colorClass = getContentTypeColor(content.type);

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${colorClass} rounded-lg flex items-center justify-center text-white`}>
              <IconComponent className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{content.title}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="capitalize">
                  {content.type}
                </Badge>
                {content.fileSize && (
                  <span className="text-sm text-slate-500">
                    {formatFileSize(content.fileSize)}
                  </span>
                )}
                {content.duration && content.type === 'video' && (
                  <span className="text-sm text-slate-500">
                    {formatDuration(content.duration)}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {content.fileUrl && (
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            )}
            {content.externalUrl && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.open(content.externalUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Open
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {content.description && (
          <p className="text-slate-600 mb-4">{content.description}</p>
        )}
        
        <div className="space-y-4">
          {renderContent()}
          
          {showProgress && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center space-x-2">
                {isCompleted ? (
                  <Badge variant="default" className="bg-green-500">
                    ✓ Completed
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    In Progress
                  </Badge>
                )}
              </div>
              
              {!isCompleted && onComplete && (
                <Button 
                  onClick={onComplete}
                  size="sm"
                  variant="outline"
                >
                  Mark as Complete
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
