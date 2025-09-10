import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, ExternalLink } from "lucide-react";

interface VideoPlayerProps {
  youtubeUrl: string;
  title?: string;
  description?: string;
}

export function VideoPlayer({ youtubeUrl, title, description }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Extract video ID from YouTube URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeVideoId(youtubeUrl);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;

  if (!embedUrl || !videoId) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            <p>Invalid YouTube URL</p>
            <Button
              variant="outline"
              onClick={() => window.open(youtubeUrl, '_blank')}
              className="mt-2"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in YouTube
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Play className="h-5 w-5" />
          <span>{title || "Video Content"}</span>
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          {isPlaying ? (
            <iframe
              src={embedUrl}
              title={title || "YouTube Video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          ) : (
            <div className="relative w-full h-full">
              {thumbnailUrl && (
                <img
                  src={thumbnailUrl}
                  alt={title || "Video Thumbnail"}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                <Button
                  onClick={() => setIsPlaying(true)}
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4"
                >
                  <Play className="h-8 w-8" />
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => window.open(youtubeUrl, '_blank')}
            size="sm"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in YouTube
          </Button>
          {isPlaying && (
            <Button
              variant="outline"
              onClick={() => setIsPlaying(false)}
              size="sm"
            >
              Stop Video
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
