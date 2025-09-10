import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Edit, Trash2, Copy, Video, Users, Clock, Calendar as CalendarIcon2, Play, Pause, Eye, Settings } from 'lucide-react';

interface LiveCourse {
  id: string;
  name: string;
  description: string;
  price: number;
  maxStudents: number;
  currentEnrollments: number;
  startDate: string;
  endDate: string;
  batchTimings: string;
  isActive: boolean;
  isEnrollmentActive: boolean;
  enrollmentStatus: 'open' | 'closed' | 'full';
  tutorId: string;
  tutorName: string;
  thumbnail: string;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

interface LiveSession {
  id: string;
  title: string;
  description: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  sessionStatus: 'scheduled' | 'live' | 'completed' | 'cancelled';
  canStartClass: boolean;
  isVideoCallActive: boolean;
  videoCallRoomId: string;
  maxParticipants: number;
  currentParticipants: number;
}

export default function LiveCourseManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<LiveCourse | null>(null);
  const [editingSession, setEditingSession] = useState<LiveSession | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Form states
  const [courseForm, setCourseForm] = useState({
    name: '',
    description: '',
    price: '',
    maxStudents: '',
    startDate: '',
    endDate: '',
    batchTimings: '',
    tutorId: '',
    thumbnail: '',
    isActive: true,
    isEnrollmentActive: true,
    features: [] as string[]
  });

  const [sessionForm, setSessionForm] = useState({
    title: '',
    description: '',
    sessionDate: '',
    startTime: '',
    endTime: '',
    maxParticipants: '',
    notes: ''
  });

  // Fetch live courses
  const { data: liveCourses = [], isLoading: coursesLoading } = useQuery<LiveCourse[]>({
    queryKey: ['/api/admin/live-courses'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/live-courses');
      return response as LiveCourse[];
    },
  });

  // Fetch tutors for assignment
  const { data: tutors = [] } = useQuery({
    queryKey: ['/api/admin/tutors'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/tutors');
      return response as any[];
    },
  });

  // Fetch live sessions for selected course
  const { data: liveSessions = [], isLoading: sessionsLoading } = useQuery<LiveSession[]>({
    queryKey: ['/api/admin/live-sessions', selectedCourse],
    queryFn: async () => {
      if (!selectedCourse) return [];
      const response = await apiRequest('GET', `/api/admin/live-sessions/${selectedCourse}`);
      return response as LiveSession[];
    },
    enabled: !!selectedCourse,
  });

  // Create live course mutation
  const createCourseMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/admin/live-courses', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/live-courses'] });
      setIsCreateDialogOpen(false);
      resetCourseForm();
      toast({
        title: "Success",
        description: "Live course created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create live course",
        variant: "destructive",
      });
    },
  });

  // Update live course mutation
  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest('PUT', `/api/admin/live-courses/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/live-courses'] });
      setIsEditDialogOpen(false);
      setEditingCourse(null);
      resetCourseForm();
      toast({
        title: "Success",
        description: "Live course updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update live course",
        variant: "destructive",
      });
    },
  });

  // Duplicate course mutation
  const duplicateCourseMutation = useMutation({
    mutationFn: async (courseId: string) => {
      return apiRequest('POST', `/api/admin/live-courses/${courseId}/duplicate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/live-courses'] });
      toast({
        title: "Success",
        description: "Course duplicated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to duplicate course",
        variant: "destructive",
      });
    },
  });

  // Bulk duplicate courses mutation
  const bulkDuplicateMutation = useMutation({
    mutationFn: async (courseIds: string[]) => {
      return apiRequest('POST', '/api/admin/live-courses/bulk-duplicate', { courseIds });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/live-courses'] });
      toast({
        title: "Success",
        description: `${data.count} courses duplicated successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to duplicate courses",
        variant: "destructive",
      });
    },
  });

  // Create live session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', `/api/admin/live-sessions`, { ...data, groupId: selectedCourse });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/live-sessions', selectedCourse] });
      setIsSessionDialogOpen(false);
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

  // Toggle course status mutation
  const toggleCourseStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiRequest('PATCH', `/api/admin/live-courses/${id}/status`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/live-courses'] });
      toast({
        title: "Success",
        description: "Course status updated successfully",
      });
    },
  });

  // Toggle enrollment status mutation
  const toggleEnrollmentMutation = useMutation({
    mutationFn: async ({ id, isEnrollmentActive }: { id: string; isEnrollmentActive: boolean }) => {
      return apiRequest('PATCH', `/api/admin/live-courses/${id}/enrollment`, { isEnrollmentActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/live-courses'] });
      toast({
        title: "Success",
        description: "Enrollment status updated successfully",
      });
    },
  });

  const resetCourseForm = () => {
    setCourseForm({
      name: '',
      description: '',
      price: '',
      maxStudents: '',
      startDate: '',
      endDate: '',
      batchTimings: '',
      tutorId: '',
      thumbnail: '',
      isActive: true,
      isEnrollmentActive: true,
      features: []
    });
  };

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
  };

  const handleEditCourse = (course: LiveCourse) => {
    setEditingCourse(course);
    setCourseForm({
      name: course.name,
      description: course.description,
      price: course.price.toString(),
      maxStudents: course.maxStudents.toString(),
      startDate: course.startDate,
      endDate: course.endDate,
      batchTimings: course.batchTimings,
      tutorId: course.tutorId,
      thumbnail: course.thumbnail,
      isActive: course.isActive,
      isEnrollmentActive: course.isEnrollmentActive,
      features: course.features || []
    });
    setIsEditDialogOpen(true);
  };

  const handleCreateSession = () => {
    resetSessionForm();
    setIsSessionDialogOpen(true);
  };

  const handleEditSession = (session: LiveSession) => {
    setEditingSession(session);
    setSessionForm({
      title: session.title,
      description: session.description,
      sessionDate: session.sessionDate,
      startTime: session.startTime,
      endTime: session.endTime,
      maxParticipants: session.maxParticipants.toString(),
      notes: ''
    });
    setIsSessionDialogOpen(true);
  };

  const handleSubmitCourse = () => {
    if (editingCourse) {
      updateCourseMutation.mutate({ id: editingCourse.id, data: courseForm });
    } else {
      createCourseMutation.mutate(courseForm);
    }
  };

  const handleSubmitSession = () => {
    createSessionMutation.mutate(sessionForm);
  };

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSelectAllCourses = () => {
    if (selectedCourses.length === liveCourses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(liveCourses.map(course => course.id));
    }
  };

  const handleBulkDuplicate = () => {
    if (selectedCourses.length > 0) {
      bulkDuplicateMutation.mutate(selectedCourses);
      setSelectedCourses([]);
      setShowBulkActions(false);
    }
  };

  const handleDuplicateCourse = (courseId: string) => {
    duplicateCourseMutation.mutate(courseId);
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

  const isCourseActive = (course: LiveCourse) => {
    const now = new Date();
    const startDate = new Date(course.startDate);
    const endDate = new Date(course.endDate);
    return now >= startDate && now <= endDate;
  };

  const isSessionUpcoming = (session: LiveSession) => {
    const now = new Date();
    const sessionTime = new Date(session.startTime);
    return sessionTime > now;
  };

  const isSessionLive = (session: LiveSession) => {
    const now = new Date();
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);
    return now >= startTime && now <= endTime;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Live Course Management</h2>
          <p className="text-slate-600">Manage live courses, sessions, and enrollment controls</p>
        </div>
        <div className="flex items-center gap-4">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetCourseForm(); setEditingCourse(null); }}>
                <Plus className="h-4 w-4 mr-2" />
                Create Live Course
              </Button>
            </DialogTrigger>
          </Dialog>
          
          {liveCourses.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowBulkActions(!showBulkActions)}
            >
              <Copy className="h-4 w-4 mr-2" />
              Bulk Actions
            </Button>
          )}
        </div>

        {/* Bulk Actions Panel */}
        {showBulkActions && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={handleSelectAllCourses}
                    size="sm"
                  >
                    {selectedCourses.length === liveCourses.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <span className="text-sm text-slate-600">
                    {selectedCourses.length} of {liveCourses.length} courses selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleBulkDuplicate}
                    disabled={selectedCourses.length === 0 || bulkDuplicateMutation.isPending}
                    size="sm"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {bulkDuplicateMutation.isPending ? 'Duplicating...' : `Duplicate ${selectedCourses.length} Courses`}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowBulkActions(false);
                      setSelectedCourses([]);
                    }}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Course Dialog */}
        <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            setEditingCourse(null);
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCourse ? 'Edit Live Course' : 'Create Live Course'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Course Name</Label>
                  <Input
                    id="name"
                    value={courseForm.name}
                    onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                    placeholder="Enter course name"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                    placeholder="Enter price"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="Enter course description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxStudents">Max Students</Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    value={courseForm.maxStudents}
                    onChange={(e) => setCourseForm({ ...courseForm, maxStudents: e.target.value })}
                    placeholder="Enter max students"
                  />
                </div>
                <div>
                  <Label htmlFor="tutorId">Assign Tutor</Label>
                  <Select
                    value={courseForm.tutorId}
                    onValueChange={(value) => setCourseForm({ ...courseForm, tutorId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tutor" />
                    </SelectTrigger>
                    <SelectContent>
                      {tutors.map((tutor) => (
                        <SelectItem key={tutor.id} value={tutor.id}>
                          {tutor.firstName} {tutor.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={courseForm.startDate}
                    onChange={(e) => setCourseForm({ ...courseForm, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={courseForm.endDate}
                    onChange={(e) => setCourseForm({ ...courseForm, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="batchTimings">Batch Timings</Label>
                <Input
                  id="batchTimings"
                  value={courseForm.batchTimings}
                  onChange={(e) => setCourseForm({ ...courseForm, batchTimings: e.target.value })}
                  placeholder="e.g., Monday to Friday, 6:00 PM - 8:00 PM"
                />
              </div>

              {/* What's Included Section */}
              <div>
                <Label htmlFor="features">What's Included:</Label>
                <div className="space-y-2">
                  {courseForm.features && courseForm.features.length > 0 ? (
                    courseForm.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={feature}
                          onChange={(e) => {
                            const newFeatures = [...courseForm.features];
                            newFeatures[index] = e.target.value;
                            setCourseForm({ ...courseForm, features: newFeatures });
                          }}
                          placeholder="Enter feature"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newFeatures = courseForm.features.filter((_, i) => i !== index);
                            setCourseForm({ ...courseForm, features: newFeatures });
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No features added yet</p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newFeatures = [...(courseForm.features || []), ''];
                      setCourseForm({ ...courseForm, features: newFeatures });
                    }}
                    className="w-full"
                  >
                    + Add Feature
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  List the key features and benefits students will get with this course
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={courseForm.isActive}
                    onCheckedChange={(checked) => setCourseForm({ ...courseForm, isActive: !!checked })}
                  />
                  <Label htmlFor="isActive">Active Course</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isEnrollmentActive"
                    checked={courseForm.isEnrollmentActive}
                    onCheckedChange={(checked) => setCourseForm({ ...courseForm, isEnrollmentActive: !!checked })}
                  />
                  <Label htmlFor="isEnrollmentActive">Accepting Enrollments</Label>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => {
                  setIsCreateDialogOpen(false);
                  setIsEditDialogOpen(false);
                  setEditingCourse(null);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitCourse} disabled={createCourseMutation.isPending || updateCourseMutation.isPending}>
                  {editingCourse 
                    ? (updateCourseMutation.isPending ? 'Updating...' : 'Update Course')
                    : (createCourseMutation.isPending ? 'Creating...' : 'Create Course')
                  }
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="courses">Live Courses</TabsTrigger>
          <TabsTrigger value="sessions">Live Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          <div className="space-y-4">
            {coursesLoading ? (
              <div className="text-center py-8">Loading courses...</div>
            ) : liveCourses.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Video className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No Live Courses</h3>
                  <p className="text-slate-500">Create your first live course to get started.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveCourses.map((course) => (
                  <Card 
                    key={course.id} 
                    className={`hover:shadow-lg transition-shadow ${
                      selectedCourses.includes(course.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {showBulkActions && (
                            <input
                              type="checkbox"
                              checked={selectedCourses.includes(course.id)}
                              onChange={() => handleSelectCourse(course.id)}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                          )}
                          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                            <Video className="h-6 w-6" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{course.name}</CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={course.isActive ? "default" : "secondary"}>
                                {course.isActive ? "Active" : "Inactive"}
                              </Badge>
                              <Badge variant={course.enrollmentStatus === 'open' ? "default" : "outline"}>
                                {course.enrollmentStatus}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditCourse(course)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDuplicateCourse(course.id)}
                            disabled={duplicateCourseMutation.isPending}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="space-y-2 text-sm text-slate-500">
                        <div className="flex items-center justify-between">
                          <span>Price:</span>
                          <span className="font-medium">₹{course.price}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Students:</span>
                          <span className="font-medium">{course.currentEnrollments}/{course.maxStudents}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CalendarIcon2 className="h-4 w-4" />
                          <span>{formatDate(course.startDate)} - {formatDate(course.endDate)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{course.batchTimings}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>Tutor: {course.tutorName}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleCourseStatusMutation.mutate({ 
                              id: course.id, 
                              isActive: !course.isActive 
                            })}
                            disabled={toggleCourseStatusMutation.isPending}
                          >
                            {course.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleEnrollmentMutation.mutate({ 
                              id: course.id, 
                              isEnrollmentActive: !course.isEnrollmentActive 
                            })}
                            disabled={toggleEnrollmentMutation.isPending}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setSelectedCourse(course.id)}
                          className={selectedCourse === course.id ? 'bg-blue-600' : ''}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Sessions
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sessions">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Live Sessions</h3>
                {selectedCourse && (
                  <p className="text-sm text-slate-600">
                    Sessions for: {liveCourses.find(c => c.id === selectedCourse)?.name}
                  </p>
                )}
              </div>
              {selectedCourse && (
                <Button onClick={handleCreateSession}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Session
                </Button>
              )}
            </div>

            {!selectedCourse ? (
              <Card>
                <CardContent className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Select a Course</h3>
                  <p className="text-slate-500">Choose a course to view and manage its live sessions.</p>
                </CardContent>
              </Card>
            ) : sessionsLoading ? (
              <div className="text-center py-8">Loading sessions...</div>
            ) : liveSessions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Video className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No Sessions</h3>
                  <p className="text-slate-500">Create live sessions for this course.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {liveSessions.map((session) => (
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
                              {session.isVideoCallActive && (
                                <Badge variant="destructive">Video Call Active</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditSession(session)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {session.canStartClass && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Start Class
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 text-sm mb-3">{session.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
                        <div>
                          <span className="font-medium text-slate-700">Participants:</span>
                          <p className="text-slate-600">{session.currentParticipants}/{session.maxParticipants}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Session Dialog */}
      <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Live Session</DialogTitle>
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
              <Button variant="outline" onClick={() => setIsSessionDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitSession} disabled={createSessionMutation.isPending}>
                {createSessionMutation.isPending ? 'Creating...' : 'Create Session'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
