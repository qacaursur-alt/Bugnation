import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { LiveSessionsCalendar } from "@/components/live-sessions-calendar";
import { 
  BookOpen, 
  Calendar, 
  Video, 
  Clock,
  ExternalLink,
  Users,
  Play,
  Plus,
  Edit,
  Settings,
  BarChart3,
  MessageCircle,
  Bell,
  Crown,
  Hand,
  Monitor
} from "lucide-react";

export default function TutorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [sessionForm, setSessionForm] = useState({
    title: '',
    description: '',
    sessionDate: '',
    startTime: '',
    endTime: '',
    maxParticipants: '',
    notes: ''
  });

  // Fetch tutor's assigned courses
  const { data: courses = [] } = useQuery({
    queryKey: ["/api/tutor/courses"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/tutor/courses");
      return response as unknown as any[];
    },
  });

  // Fetch live sessions for selected course
  const { data: liveSessions = [] } = useQuery({
    queryKey: ["/api/tutor/live-sessions", selectedCourse],
    queryFn: async () => {
      if (!selectedCourse) return [];
      const response = await apiRequest("GET", `/api/tutor/live-sessions/${selectedCourse}`);
      return response as unknown as any[];
    },
    enabled: !!selectedCourse,
  });

  // Fetch tutor statistics
  const { data: stats = {} } = useQuery({
    queryKey: ["/api/tutor/stats"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/tutor/stats");
      return response as any;
    },
  });

  // Create live session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/tutor/live-sessions", { ...data, groupId: selectedCourse });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/live-sessions", selectedCourse] });
      setIsCreateSessionOpen(false);
      resetSessionForm();
      toast({
        title: "Success",
        description: "Live session created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create live session",
        variant: "destructive",
      });
    },
  });

  // Start session mutation
  const startSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      return apiRequest("POST", `/api/tutor/live-sessions/${sessionId}/start`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/live-sessions", selectedCourse] });
      toast({
        title: "Session Started",
        description: "Live session has been started successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start session",
        variant: "destructive",
      });
    },
  });

  const resetSessionForm = () => {
    setSessionForm({
      title: '',
      description: '',
      sessionDate: '',
      startTime: '',
      endTime: '',
      maxParticipants: '',
      notes: ''
    });
    setEditingSession(null);
  };

  const handleCreateSession = () => {
    resetSessionForm();
    setIsCreateSessionOpen(true);
  };

  const handleEditSession = (session: any) => {
    setEditingSession(session);
    setSessionForm({
      title: session.title,
      description: session.description,
      sessionDate: session.sessionDate,
      startTime: session.startTime,
      endTime: session.endTime,
      maxParticipants: session.maxParticipants?.toString() || '',
      notes: session.notes || ''
    });
    setIsCreateSessionOpen(true);
  };

  const handleSubmitSession = () => {
    createSessionMutation.mutate(sessionForm);
  };

  const handleStartSession = (session: any) => {
    startSessionMutation.mutate(session.id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isSessionUpcoming = (session: any) => {
    const now = new Date();
    const sessionTime = new Date(session.startTime);
    return sessionTime > now;
  };

  const isSessionLive = (session: any) => {
    const now = new Date();
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);
    return now >= startTime && now <= endTime;
  };

  const handleJoinSession = (session: any) => {
    if (session.googleMeetLink) {
      window.open(session.googleMeetLink, '_blank');
    } else {
      alert('Google Meet link not available for this session');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Teaching Dashboard
          </h1>
          <p className="text-slate-600">
            Welcome back, {(user as any)?.firstName}! Manage your live classes and sessions.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="sessions">Live Sessions</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-slate-600">Total Courses</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.totalCourses || courses.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Video className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-slate-600">Live Sessions</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.totalSessions || liveSessions.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Users className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-slate-600">Total Students</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.totalStudents || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <BarChart3 className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-slate-600">This Month</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.thisMonthSessions || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {liveSessions.slice(0, 3).map((session: any) => (
                      <div key={session.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                            <Video className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{session.title}</p>
                            <p className="text-sm text-slate-600">
                              {formatDate(session.sessionDate)} at {formatTime(session.startTime)}
                            </p>
                          </div>
                        </div>
                        <Badge variant={isSessionLive(session) ? "default" : "outline"}>
                          {isSessionLive(session) ? "Live Now" : "Upcoming"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="courses">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">Assigned Courses</h2>
                <Badge variant="outline" className="text-sm">
                  {courses.length} course{courses.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              {courses.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No Courses Assigned</h3>
                    <p className="text-slate-500">
                      You haven't been assigned to any courses yet. Contact your administrator.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course: any) => (
                    <Card 
                      key={course.id} 
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedCourse === course.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedCourse(course.id)}
                    >
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                            <BookOpen className="h-6 w-6" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{course.name}</CardTitle>
                            <Badge variant="outline" className="mt-1">
                              {course.difficulty}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                          {course.description}
                        </p>
                        <div className="space-y-2 text-sm text-slate-500">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>{course.duration} days</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>Assigned: {formatDate(course.assignedAt)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sessions">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">Live Sessions</h2>
                <div className="flex items-center gap-4">
                  {selectedCourse && (
                    <Badge variant="outline" className="text-sm">
                      {liveSessions.length} session{liveSessions.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                  {selectedCourse && (
                    <Button onClick={handleCreateSession}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Session
                    </Button>
                  )}
                </div>
              </div>

              {!selectedCourse ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Select a Course</h3>
                    <p className="text-slate-500">
                      Choose a course from the "My Courses" tab to view its live sessions.
                    </p>
                  </CardContent>
                </Card>
              ) : liveSessions.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Video className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No Sessions Scheduled</h3>
                    <p className="text-slate-500">
                      No live sessions have been scheduled for this course yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {liveSessions.map((session: any) => (
                    <Card key={session.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white">
                              <Video className="h-5 w-5" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{session.title}</CardTitle>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge 
                                  variant={
                                    isSessionLive(session) ? "default" : 
                                    isSessionUpcoming(session) ? "secondary" : 
                                    "outline"
                                  }
                                  className={
                                    isSessionLive(session) ? "bg-green-100 text-green-800" :
                                    isSessionUpcoming(session) ? "bg-blue-100 text-blue-800" :
                                    "bg-gray-100 text-gray-800"
                                  }
                                >
                                  {isSessionLive(session) ? "Live Now" : 
                                   isSessionUpcoming(session) ? "Upcoming" : 
                                   "Completed"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {isSessionUpcoming(session) || isSessionLive(session) ? (
                              <Button
                                onClick={() => handleJoinSession(session)}
                                className="flex items-center space-x-2"
                              >
                                <Play className="h-4 w-4" />
                                <span>{isSessionLive(session) ? "Join Now" : "Join Session"}</span>
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button variant="outline" disabled>
                                Session Ended
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-600 text-sm mb-3">{session.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-slate-700">Date:</span>
                            <p className="text-slate-600">{formatDate(session.sessionDate)}</p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-700">Time:</span>
                            <p className="text-slate-600">
                              {formatTime(session.startTime)} - {formatTime(session.endTime)}
                            </p>
                          </div>
                          {session.googleMeetLink && (
                            <div className="md:col-span-2">
                              <span className="font-medium text-slate-700">Meeting Link:</span>
                              <p className="text-slate-600 break-all">{session.googleMeetLink}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">Live Sessions Calendar</h2>
                <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={() => setSelectedCourse('')}>
                    View All Courses
                  </Button>
                  {selectedCourse && (
                    <Button onClick={handleCreateSession}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Session
                    </Button>
                  )}
                </div>
              </div>
              
              {selectedCourse ? (
                <LiveSessionsCalendar groupId={selectedCourse} />
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Select a Course</h3>
                    <p className="text-slate-500">
                      Choose a course from the "My Courses" tab to view its live sessions calendar.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Create/Edit Session Dialog */}
        <Dialog open={isCreateSessionOpen} onOpenChange={setIsCreateSessionOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSession ? 'Edit Live Session' : 'Create Live Session'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="sessionTitle">Session Title</Label>
                <Input
                  id="sessionTitle"
                  value={sessionForm.title}
                  onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                  placeholder="Enter session title"
                />
              </div>
              <div>
                <Label htmlFor="sessionDescription">Description</Label>
                <Textarea
                  id="sessionDescription"
                  value={sessionForm.description}
                  onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })}
                  placeholder="Enter session description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sessionDate">Session Date</Label>
                  <Input
                    id="sessionDate"
                    type="date"
                    value={sessionForm.sessionDate}
                    onChange={(e) => setSessionForm({ ...sessionForm, sessionDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxParticipants">Max Participants</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    value={sessionForm.maxParticipants}
                    onChange={(e) => setSessionForm({ ...sessionForm, maxParticipants: e.target.value })}
                    placeholder="Enter max participants"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={sessionForm.startTime}
                    onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={sessionForm.endTime}
                    onChange={(e) => setSessionForm({ ...sessionForm, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={sessionForm.notes}
                  onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })}
                  placeholder="Enter any additional notes"
                  rows={2}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateSessionOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitSession} disabled={createSessionMutation.isPending}>
                  {createSessionMutation.isPending ? 'Creating...' : (editingSession ? 'Update Session' : 'Create Session')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
