import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { 
  Calendar, 
  Clock, 
  Video, 
  ExternalLink, 
  Play,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";

interface LiveSession {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  googleMeetLink: string;
  groupId: string;
  moduleId?: string;
}

interface SessionAccess {
  canJoin: boolean;
  reason?: string;
  session?: LiveSession;
  timeUntilStart?: number;
  timeUntilEnd?: number;
}

interface LiveSessionsCalendarProps {
  groupId: string;
  userId?: string;
}

export default function LiveSessionsCalendar({ groupId, userId }: LiveSessionsCalendarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Debug logging
  console.log('LiveSessionsCalendar props:', { groupId, userId });


  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Fetch upcoming sessions
  const { data: sessions = [], isLoading: sessionsLoading, error: sessionsError } = useQuery({
    queryKey: ["/api/live-sessions", groupId],
    queryFn: async () => {
      console.log('Fetching live sessions for groupId:', groupId);
      const response = await apiRequest("GET", `/api/live-sessions/${groupId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Live sessions API error:', response.status, errorText);
        throw new Error(`Failed to fetch live sessions: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      console.log('Live sessions data:', data);
      return data;
    },
    enabled: !!groupId,
    retry: false, // Don't retry on error to avoid spam
  });

  // Fetch upcoming sessions for user
  const { data: userSessions = [] } = useQuery({
    queryKey: ["/api/upcoming-sessions"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/upcoming-sessions");
      if (!response.ok) {
        throw new Error('Failed to fetch user sessions');
      }
      return response.json();
    },
    enabled: !!userId,
  });

  // Check session access
  const checkSessionAccess = async (sessionId: string): Promise<SessionAccess> => {
    try {
      const response = await apiRequest("GET", `/api/session/${sessionId}/check-access`);
      return await response.json();
    } catch (error) {
      console.error("Error checking session access:", error);
      return { canJoin: false, reason: "Error checking access" };
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeUntilSession = (startTime: string) => {
    const start = new Date(startTime);
    const now = currentTime;
    const diff = start.getTime() - now.getTime();

    if (diff < 0) {
      return { status: 'ended', text: 'Session ended' };
    } else if (diff < 60 * 60 * 1000) { // Less than 1 hour
      const minutes = Math.floor(diff / (60 * 1000));
      return { status: 'starting', text: `Starts in ${minutes} minutes` };
    } else if (diff < 24 * 60 * 60 * 1000) { // Less than 1 day
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return { status: 'upcoming', text: `Starts in ${hours} hours` };
    } else {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return { status: 'upcoming', text: `Starts in ${days} days` };
    }
  };

  const getSessionStatus = (session: LiveSession) => {
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    const now = currentTime;

    if (now < start) {
      return 'upcoming';
    } else if (now >= start && now <= end) {
      return 'live';
    } else {
      return 'ended';
    }
  };

  const handleJoinSession = async (session: LiveSession) => {
    try {
      console.log('Attempting to join session:', session.id);
      
      // For now, bypass access check and directly open the Google Meet link if available
      if (session.googleMeetLink && session.googleMeetLink.trim() !== '') {
        console.log('Opening Google Meet link directly:', session.googleMeetLink);
        window.open(session.googleMeetLink, '_blank');
        return;
      }
      
      // If no Google Meet link, try the access check
      const accessCheck = await checkSessionAccess(session.id);
      console.log('Access check result:', accessCheck);
      
      if (accessCheck.canJoin) {
        // Redirect to video call page
        window.location.href = `/video-call/${session.id}`;
      } else {
        alert(`Cannot join session: ${accessCheck.reason || 'Access denied'}`);
      }
    } catch (error) {
      console.error('Error joining session:', error);
      alert('Unable to join session. Please try again or contact support.');
    }
  };

  if (!groupId) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">No Course Selected</h3>
        <p className="text-slate-600">Please select a live course to view live sessions.</p>
      </div>
    );
  }

  // Check if groupId looks like a valid UUID
  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(groupId);
  if (!isValidUUID) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-900 mb-2">Invalid Course ID</h3>
        <p className="text-red-600">The course ID format is invalid. Please select a different course.</p>
        <p className="text-xs text-gray-500 mt-2">Group ID: {groupId}</p>
      </div>
    );
  }

  if (sessionsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (sessionsError) {
    const errorMessage = sessionsError.message || 'Unknown error occurred';
    const isAccessDenied = errorMessage.includes('Access denied') || errorMessage.includes('403');
    const isCourseGroupNotFound = errorMessage.includes('Course group not found') || errorMessage.includes('404');
    
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-900 mb-2">
          {isAccessDenied ? 'Access Denied' : 
           isCourseGroupNotFound ? 'Course Not Found' : 'Error Loading Sessions'}
        </h3>
        <p className="text-red-600">
          {isAccessDenied 
            ? 'You need to be enrolled and approved for this course to view live sessions.'
            : isCourseGroupNotFound
            ? 'This course is no longer available. Please contact support or select a different course.'
            : 'Failed to load live sessions. Please try again later.'
          }
        </p>
        <p className="text-sm text-red-500 mt-2">Error: {errorMessage}</p>
        <p className="text-xs text-gray-500 mt-1">Group ID: {groupId}</p>
        <p className="text-xs text-gray-500">User ID: {userId}</p>
        {isCourseGroupNotFound && (
          <div className="mt-4 space-x-4">
            <button 
              onClick={() => window.location.reload()} 
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Refresh Page
            </button>
            <button 
              onClick={() => {
                // Go back to courses tab to select a different course
                window.location.href = '/dashboard?tab=courses';
              }}
              className="text-sm text-green-600 hover:text-green-800 underline"
            >
              Select Different Course
            </button>
          </div>
        )}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">No Live Sessions</h3>
        <p className="text-slate-600">No live sessions have been scheduled for this course yet.</p>
        <p className="text-sm text-slate-500 mt-2">Group ID: {groupId}</p>
        <p className="text-xs text-gray-400 mt-1">Contact your instructor to schedule live sessions.</p>
        <p className="text-xs text-gray-400 mt-1">Debug: sessions.length = {sessions.length}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Live Sessions</h3>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Video className="h-3 w-3 mr-1" />
          {sessions.length} Sessions
        </Badge>
      </div>
      
      {/* Debug info */}
      <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
        Debug: Found {sessions.length} sessions for group {groupId}
      </div>

      <div className="space-y-3">
        {sessions.map((session: LiveSession) => {
          const status = getSessionStatus(session);
          const timeInfo = getTimeUntilSession(session.startTime);
          const isLive = status === 'live';
          const isUpcoming = status === 'upcoming';
          const isEnded = status === 'ended';

          return (
            <Card 
              key={session.id} 
              className={`transition-all hover:shadow-md ${
                isLive ? 'ring-2 ring-green-500 bg-green-50' : 
                isUpcoming ? 'ring-1 ring-blue-200' : 
                'opacity-75'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      {session.title}
                      {isLive && (
                        <Badge className="bg-green-100 text-green-800 border-green-300">
                          <Play className="h-3 w-3 mr-1" />
                          LIVE
                        </Badge>
                      )}
                      {isUpcoming && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <Clock className="h-3 w-3 mr-1" />
                          Upcoming
                        </Badge>
                      )}
                      {isEnded && (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                          <XCircle className="h-3 w-3 mr-1" />
                          Ended
                        </Badge>
                      )}
                    </CardTitle>
                    {session.description && (
                      <p className="text-sm text-slate-600 mt-1">{session.description}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center space-x-4 text-sm text-slate-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatTime(session.startTime)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {new Date(session.startTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} - {new Date(session.endTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-500">
                      {timeInfo.text}
                    </div>
                    
                    <div className="flex space-x-2">
                      {isLive && (
                        <Button
                          size="sm"
                          onClick={() => handleJoinSession(session)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Join Now
                        </Button>
                      )}
                      
                      {isUpcoming && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleJoinSession(session)}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Join When Live
                        </Button>
                      )}

                      {session.googleMeetLink && session.googleMeetLink.trim() !== '' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(session.googleMeetLink, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Meeting Link
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {userSessions.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Upcoming Sessions</span>
          </div>
          <p className="text-sm text-blue-700">
            You have {userSessions.length} upcoming live session{userSessions.length !== 1 ? 's' : ''} across all your enrolled courses.
          </p>
        </div>
      )}
    </div>
  );
}
