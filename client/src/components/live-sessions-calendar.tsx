import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, ExternalLink } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface LiveSessionsCalendarProps {
  groupId: string;
}

interface LiveSession {
  id: string;
  title: string;
  description: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  googleMeetLink?: string;
  isActive: boolean;
}

export function LiveSessionsCalendar({ groupId }: LiveSessionsCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: sessions = [], isLoading } = useQuery<LiveSession[]>({
    queryKey: ["/api/live-sessions", groupId],
    enabled: !!groupId,
  });

  // Get current date and time
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().split(' ')[0];

  // Filter sessions for the selected date
  const todaysSessions = sessions.filter(session => {
    const sessionDate = new Date(session.sessionDate).toISOString().split('T')[0];
    return sessionDate === currentDate;
  });

  // Check if a session is currently live
  const isSessionLive = (session: LiveSession) => {
    const sessionDate = new Date(session.sessionDate).toISOString().split('T')[0];
    if (sessionDate !== currentDate) return false;
    
    const startTime = session.startTime.split('T')[1]?.split('.')[0] || session.startTime;
    const endTime = session.endTime.split('T')[1]?.split('.')[0] || session.endTime;
    
    return currentTime >= startTime && currentTime <= endTime;
  };

  // Get upcoming sessions (next 7 days)
  const upcomingSessions = sessions
    .filter(session => {
      const sessionDate = new Date(session.sessionDate);
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return sessionDate >= today && sessionDate <= nextWeek;
    })
    .sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime());

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-slate-600 mt-2">Loading live sessions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Today's Live Sessions */}
      {todaysSessions.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <Video className="h-5 w-5 mr-2" />
              Today's Live Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaysSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-200">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">{session.title}</h3>
                    <p className="text-sm text-slate-600 mb-2">{session.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {isSessionLive(session) && (
                      <Badge className="bg-red-500 text-white animate-pulse">
                        LIVE NOW
                      </Badge>
                    )}
                    {session.googleMeetLink ? (
                      <Button
                        size="sm"
                        onClick={() => window.open(session.googleMeetLink, '_blank')}
                        className={isSessionLive(session) ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {isSessionLive(session) ? 'Join Live' : 'Join Session'}
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled>
                        Link Coming Soon
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Upcoming Sessions (Next 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No upcoming sessions scheduled</p>
              <p className="text-sm text-slate-500 mt-2">Check back later for new session announcements</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">{session.title}</h3>
                    <p className="text-sm text-slate-600 mb-2">{session.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(session.sessionDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      Upcoming
                    </Badge>
                    {session.googleMeetLink ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(session.googleMeetLink, '_blank')}
                        disabled={!isSessionLive(session)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Join Session
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled>
                        Link Coming Soon
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
