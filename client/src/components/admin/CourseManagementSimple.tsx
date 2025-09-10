import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, BookOpen, Calendar, FileText, Video, Link, Image, File, Presentation, Users, Trash2 } from "lucide-react";

interface CourseGroup {
  id: string;
  name: string;
  description: string;
  price: string;
  categoryId: string;
  isActive: boolean;
  courseType: string;
  isLiveCourse: boolean;
  features: string[];
  difficulty: string;
  duration: number;
  maxStudents?: number;
  startDate?: string;
  endDate?: string;
  batchTimings?: string;
  googleMeetLink?: string;
}

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  type: string;
  fileUrl?: string;
  externalUrl?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
  thumbnail?: string;
  isActive: boolean;
  createdAt: string;
}

interface CourseModule {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  isActive: boolean;
  requiresQuiz: boolean;
  quizRequiredToUnlock: boolean;
  passingScore: number;
  maxAttempts: number;
  unlockMessage: string;
  createdAt: string;
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
  maxParticipants?: number;
  notes?: string;
  createdAt: string;
}

export default function CourseManagementSimple() {
  console.log('CourseManagementSimple component rendering');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStudyMaterialsDialogOpen, setIsStudyMaterialsDialogOpen] = useState(false);
  const [isModulesDialogOpen, setIsModulesDialogOpen] = useState(false);
  const [isLiveSessionsDialogOpen, setIsLiveSessionsDialogOpen] = useState(false);
  const [isTutorAssignmentDialogOpen, setIsTutorAssignmentDialogOpen] = useState(false);
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [isEditSessionOpen, setIsEditSessionOpen] = useState(false);
  const [isViewSessionOpen, setIsViewSessionOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseGroup | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  
  // Session form state
  const [sessionForm, setSessionForm] = useState({
    title: '',
    description: '',
    sessionDate: '',
    startTime: '',
    endTime: '',
    googleMeetLink: '',
    maxParticipants: '',
    notes: ''
  });

  // Edit session form state
  const [editSessionForm, setEditSessionForm] = useState({
    title: '',
    description: '',
    sessionDate: '',
    startTime: '',
    endTime: '',
    googleMeetLink: '',
    maxParticipants: '',
    notes: ''
  });

  // Debug component rendering
  React.useEffect(() => {
    console.log('CourseManagementSimple mounted');
    return () => console.log('CourseManagementSimple unmounted');
  }, []);

  // Debug dialog state changes
  React.useEffect(() => {
    console.log('Edit dialog state changed:', isEditDialogOpen);
  }, [isEditDialogOpen]);

  React.useEffect(() => {
    console.log('Study materials dialog state changed:', isStudyMaterialsDialogOpen);
  }, [isStudyMaterialsDialogOpen]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    courseType: 'self_paced',
    categoryId: '',
    features: [] as string[],
    difficulty: 'beginner',
    duration: '',
    maxStudents: '',
    batchTimings: '',
    googleMeetLink: '',
    startDate: '',
    endDate: ''
  });

  // Debug edit dialog and form data
  React.useEffect(() => {
    if (isEditDialogOpen) {
      console.log('Edit dialog opened with selectedCourse:', selectedCourse);
      console.log('Form data:', formData);
    }
  }, [isEditDialogOpen, selectedCourse, formData]);

  // Fetch course groups
  const { data: courseGroupsData, isLoading: groupsLoading, error: groupsError } = useQuery({
    queryKey: ["/api/course-groups"],
    queryFn: async () => {
      console.log('Fetching course groups...');
      const response = await apiRequest("GET", "/api/course-groups");
      console.log('Course groups response:', response);
      const data = await response.json();
      console.log('Course groups data:', data);
      return data;
    },
  });

  // Ensure courseGroups is always an array
  const courseGroups = Array.isArray(courseGroupsData) ? courseGroupsData : [];
  console.log('Course groups state:', { 
    courseGroups, 
    courseGroupsData, 
    isArray: Array.isArray(courseGroupsData),
    type: typeof courseGroupsData,
    groupsLoading, 
    groupsError 
  });

  // Fetch study materials for selected course
  const { data: studyMaterialsData } = useQuery({
    queryKey: ["/api/study-materials", selectedCourse?.id],
    queryFn: async () => {
      if (!selectedCourse?.id) return [];
      const response = await apiRequest("GET", `/api/study-materials?courseGroupId=${selectedCourse.id}`);
      return response.json();
    },
    enabled: !!selectedCourse?.id,
  });

  // Fetch course modules for selected course
  const { data: courseModulesData } = useQuery({
    queryKey: ["/api/course-modules", selectedCourse?.id],
    queryFn: async () => {
      if (!selectedCourse?.id) return [];
      const response = await apiRequest("GET", `/api/course-modules?courseGroupId=${selectedCourse.id}`);
      return response.json();
    },
    enabled: !!selectedCourse?.id,
  });

  // Fetch live sessions for selected course
  const { data: liveSessionsData } = useQuery({
    queryKey: ["/api/live-sessions", selectedCourse?.id],
    queryFn: async () => {
      if (!selectedCourse?.id) return [];
      console.log('Fetching live sessions for course:', selectedCourse.id);
      const response = await apiRequest("GET", `/api/live-sessions/${selectedCourse.id}`);
      const data = await response.json();
      console.log('Live sessions response:', data);
      return data;
    },
    enabled: !!selectedCourse?.id,
  });

  // Fetch tutors
  const { data: tutorsData, isLoading: tutorsLoading, error: tutorsError } = useQuery({
    queryKey: ["/api/admin/tutors"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/tutors");
      const data = await response.json();
      return data;
    },
  });

  // Ensure tutors is always an array
  const tutors = Array.isArray(tutorsData) ? tutorsData : [];
  
  // Debug tutors data
  console.log('Tutors data:', { 
    tutorsData, 
    tutors, 
    isArray: Array.isArray(tutorsData),
    type: typeof tutorsData,
    tutorsLoading, 
    tutorsError 
  });

  // Fetch course tutors for selected course
  const { data: courseTutors = [], isLoading: courseTutorsLoading, error: courseTutorsError } = useQuery({
    queryKey: ["/api/admin/course-tutors", selectedCourse?.id],
    queryFn: async () => {
      if (!selectedCourse?.id) return [];
      try {
        const response = await apiRequest("GET", `/api/admin/course-tutors/${selectedCourse.id}`);
        // Ensure response is always an array
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error("Error fetching course tutors:", error);
        return [];
      }
    },
    enabled: !!selectedCourse?.id,
  });

  const studyMaterials = Array.isArray(studyMaterialsData) ? studyMaterialsData : [];
  const courseModules = Array.isArray(courseModulesData) ? courseModulesData : [];
  const liveSessions = Array.isArray(liveSessionsData) ? liveSessionsData : [];
  
  // Debug live sessions data
  console.log('Live sessions debug:', {
    liveSessionsData,
    liveSessions,
    isArray: Array.isArray(liveSessionsData),
    length: liveSessions.length,
    selectedCourse: selectedCourse?.id
  });

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/course-groups", data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Course created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/course-groups"] });
      setIsCreateDialogOpen(false);
      setFormData({
        name: '',
        description: '',
        price: '',
        courseType: 'self_paced',
        categoryId: '',
        features: [],
        difficulty: 'beginner',
        duration: '',
        maxStudents: '',
        batchTimings: '',
        googleMeetLink: '',
        startDate: '',
        endDate: ''
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create course",
        variant: "destructive",
      });
    },
  });

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/admin/course-groups/${selectedCourse?.id}`, data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Course updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/course-groups"] });
      setIsEditDialogOpen(false);
      setSelectedCourse(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update course",
        variant: "destructive",
      });
    },
  });

  // Delete study material mutation
  const deleteStudyMaterialMutation = useMutation({
    mutationFn: async (materialId: string) => {
      const response = await apiRequest("DELETE", `/api/study-materials/${materialId}`);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Study material deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/study-materials", selectedCourse?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete study material",
        variant: "destructive",
      });
    },
  });

  // Delete course module mutation
  const deleteModuleMutation = useMutation({
    mutationFn: async (moduleId: string) => {
      const response = await apiRequest("DELETE", `/api/course-modules/${moduleId}`);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Module deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/course-modules", selectedCourse?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete module",
        variant: "destructive",
      });
    },
  });

  // Delete live session mutation
  const deleteLiveSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/live-sessions/${sessionId}`);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Live session deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/live-sessions", selectedCourse?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete live session",
        variant: "destructive",
      });
    },
  });

  // Assign tutor mutation
  const assignTutorMutation = useMutation({
    mutationFn: async (data: { courseGroupId: string; tutorId: string }) => {
      await apiRequest("POST", "/api/admin/course-tutors", data);
    },
    onSuccess: () => {
      toast({
        title: "Tutor Assigned",
        description: "Tutor has been assigned to the course successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/course-tutors", selectedCourse?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to assign tutor: ${error?.message || 'Please try again.'}`,
        variant: "destructive",
      });
    },
  });

  // Remove tutor mutation
  const removeTutorMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      await apiRequest("DELETE", `/api/admin/course-tutors/${assignmentId}`);
    },
    onSuccess: () => {
      toast({
        title: "Tutor Removed",
        description: "Tutor has been removed from the course successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/course-tutors", selectedCourse?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to remove tutor: ${error?.message || 'Please try again.'}`,
        variant: "destructive",
      });
    },
  });

  // Create live session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/live-sessions", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/live-sessions", selectedCourse?.id] });
      toast({ title: "Live session created successfully" });
      setIsAddSessionOpen(false);
      setSessionForm({
        title: '',
        description: '',
        sessionDate: '',
        startTime: '',
        endTime: '',
        googleMeetLink: '',
        maxParticipants: '',
        notes: ''
      });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create session", description: error.message, variant: "destructive" });
    },
  });

  // Update live session mutation
  const updateSessionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/admin/live-sessions/${selectedSession?.id}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/live-sessions", selectedCourse?.id] });
      toast({ title: "Live session updated successfully" });
      setIsEditSessionOpen(false);
      setSelectedSession(null);
      setEditSessionForm({
        title: '',
        description: '',
        sessionDate: '',
        startTime: '',
        endTime: '',
        googleMeetLink: '',
        maxParticipants: '',
        notes: ''
      });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update live session", description: error.message, variant: "destructive" });
    },
  });

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSessionInputChange = (field: string, value: string) => {
    setSessionForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse?.id) return;
    
    const sessionData = {
      groupId: selectedCourse.id,
      ...sessionForm,
      maxParticipants: sessionForm.maxParticipants ? parseInt(sessionForm.maxParticipants) : null
    };
    
    createSessionMutation.mutate(sessionData);
  };

  const openEditDialog = (course: CourseGroup) => {
    console.log('Opening edit dialog for course:', course);
    setSelectedCourse(course);
    
    const newFormData = {
      name: course.name,
      description: course.description,
      price: course.price,
      courseType: course.courseType,
      categoryId: course.categoryId,
      features: course.features || [],
      difficulty: course.difficulty,
      duration: course.duration?.toString() || '',
      maxStudents: course.maxStudents?.toString() || '',
      batchTimings: course.batchTimings || '',
      googleMeetLink: course.googleMeetLink || '',
      startDate: course.startDate ? new Date(course.startDate).toISOString().split('T')[0] : '',
      endDate: course.endDate ? new Date(course.endDate).toISOString().split('T')[0] : ''
    };
    
    console.log('Setting form data:', newFormData);
    setFormData(newFormData);
    console.log('Setting edit dialog state to true');
    setIsEditDialogOpen(true);
    console.log('Edit dialog state set to true');
  };

  const openStudyMaterialsDialog = (course: CourseGroup) => {
    console.log('Opening study materials dialog for course:', course);
    setSelectedCourse(course);
    setIsStudyMaterialsDialogOpen(true);
    console.log('Study materials dialog state set to true');
  };

  const openModulesDialog = (course: CourseGroup) => {
    console.log('Opening modules dialog for course:', course);
    setSelectedCourse(course);
    setIsModulesDialogOpen(true);
    console.log('Modules dialog state set to true');
  };

  const openLiveSessionsDialog = (course: CourseGroup) => {
    console.log('Opening live sessions dialog for course:', course);
    setSelectedCourse(course);
    setIsLiveSessionsDialogOpen(true);
    console.log('Live sessions dialog state set to true');
  };

  const openQuizDialog = (course: CourseGroup) => {
    console.log('Opening quiz dialog for course:', course);
    setSelectedCourse(course);
    setIsQuizDialogOpen(true);
    console.log('Quiz dialog state set to true');
  };

  const openTutorAssignmentDialog = (course: CourseGroup) => {
    console.log('Opening tutor assignment dialog for course:', course);
    setSelectedCourse(course);
    setIsTutorAssignmentDialogOpen(true);
    console.log('Tutor assignment dialog state set to true');
  };

  const openEditSessionDialog = (session: LiveSession) => {
    console.log('Opening edit session dialog for session:', session);
    setSelectedSession(session);
    setEditSessionForm({
      title: session.title,
      description: session.description || '',
      sessionDate: session.sessionDate ? new Date(session.sessionDate).toISOString().split('T')[0] : '',
      startTime: session.startTime ? new Date(session.startTime).toISOString().slice(11, 16) : '',
      endTime: session.endTime ? new Date(session.endTime).toISOString().slice(11, 16) : '',
      googleMeetLink: session.googleMeetLink || '',
      maxParticipants: session.maxParticipants?.toString() || '',
      notes: session.notes || ''
    });
    setIsEditSessionOpen(true);
  };

  const openViewSessionDialog = (session: LiveSession) => {
    console.log('Opening view session dialog for session:', session);
    setSelectedSession(session);
    setIsViewSessionOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Set categoryId based on course type
    const categoryId = formData.courseType === 'live' 
      ? '5f5016f3-131b-4f66-97d0-09572bfac723' // Premium Live Classes category
      : '00702585-feb2-477d-857b-16170eb04ba2'; // Self-Paced Learning category
    
    // Prepare the data for submission
    const submitData = {
      ...formData,
      categoryId,
      price: parseFloat(formData.price) || 0,
      duration: parseInt(formData.duration) || 0,
      maxStudents: formData.maxStudents ? parseInt(formData.maxStudents) : null,
      features: formData.features || [],
      isLiveCourse: formData.courseType === 'live',
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
    };

    // Use the appropriate mutation based on whether we're editing or creating
    if (isEditDialogOpen && selectedCourse) {
      updateCourseMutation.mutate(submitData);
    } else {
      createCourseMutation.mutate(submitData);
    }
  };

  if (groupsError) {
    console.error('Error loading course groups:', groupsError);
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Courses</h3>
          <p className="text-slate-600">{groupsError.message}</p>
        </div>
      </div>
    );
  }

  if (groupsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Debug logging
  console.log('Rendering CourseManagementSimple with:', { 
    courseGroupsLength: courseGroups.length,
    groupsLoading, 
    groupsError,
    dialogStates: {
      isEditDialogOpen,
      isStudyMaterialsDialogOpen,
      isModulesDialogOpen,
      isLiveSessionsDialogOpen,
      isTutorAssignmentDialogOpen
    }
  });


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Course Management</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Create Course Dialog */}
      {isCreateDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create New Course</h2>
              <button
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Course Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter course name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="Enter price"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter course description"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="courseType">Course Type *</Label>
                  <Select value={formData.courseType} onValueChange={(value) => handleInputChange('courseType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="self_paced">Self-Paced</SelectItem>
                      <SelectItem value="live">Live Course</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (hours)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="Enter duration in hours"
                  />
                </div>
                <div>
                  <Label htmlFor="maxStudents">Max Students (for live courses)</Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    value={formData.maxStudents}
                    onChange={(e) => handleInputChange('maxStudents', e.target.value)}
                    placeholder="Enter max students"
                  />
                </div>
              </div>

              {formData.courseType === 'live' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="batchTimings">Batch Timings</Label>
                    <Input
                      id="batchTimings"
                      value={formData.batchTimings}
                      onChange={(e) => handleInputChange('batchTimings', e.target.value)}
                      placeholder="e.g., Monday-Friday 6:00 PM - 8:00 PM"
                    />
                  </div>
                  <div>
                    <Label htmlFor="googleMeetLink">Google Meet Link</Label>
                    <Input
                      id="googleMeetLink"
                      value={formData.googleMeetLink}
                      onChange={(e) => handleInputChange('googleMeetLink', e.target.value)}
                      placeholder="https://meet.google.com/..."
                    />
                  </div>
                </>
              )}

              {/* What's Included Section */}
              <div>
                <Label htmlFor="features">What's Included:</Label>
                <div className="space-y-2">
                  {formData.features && formData.features.length > 0 ? (
                    formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={feature}
                          onChange={(e) => {
                            const newFeatures = [...formData.features];
                            newFeatures[index] = e.target.value;
                            handleInputChange('features', newFeatures);
                          }}
                          placeholder="Enter feature"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newFeatures = formData.features.filter((_, i) => i !== index);
                            handleInputChange('features', newFeatures);
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
                      const newFeatures = [...(formData.features || []), ''];
                      handleInputChange('features', newFeatures);
                    }}
                    className="w-full"
                  >
                    + Add Feature
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  List the key features and benefits students will get with this course
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createCourseMutation.isPending}
                >
                  {createCourseMutation.isPending ? "Creating..." : "Create Course"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {courseGroups.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-slate-600 mb-2">No Courses Found</h3>
          <p className="text-slate-500">Create your first course to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courseGroups.map((group: CourseGroup) => (
            <Card key={group.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <Badge variant={group.courseType === 'live' ? 'default' : 'secondary'}>
                    {group.courseType === 'live' ? 'Live' : 'Self-Paced'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-sm mb-3">{group.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Price:</span>
                    <span className="font-semibold">₹{group.price}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Difficulty:</span>
                    <span className="capitalize">{group.difficulty}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Duration:</span>
                    <span>{group.duration} days</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Edit button clicked for course:', group);
                      openEditDialog(group);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Materials button clicked for course:', group);
                      openStudyMaterialsDialog(group);
                    }}
                  >
                    <BookOpen className="h-4 w-4 mr-1" />
                    Materials
                  </Button>
                  
                  {group.courseType === 'self_paced' ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Modules button clicked for course:', group);
                          openModulesDialog(group);
                        }}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Modules
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Quiz button clicked for course:', group);
                          openQuizDialog(group);
                        }}
                      >
                        <BookOpen className="h-4 w-4 mr-1" />
                        Quiz
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Sessions button clicked for course:', group);
                          openLiveSessionsDialog(group);
                        }}
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Sessions
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Assign Tutor button clicked for course:', group);
                          openTutorAssignmentDialog(group);
                        }}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Assign Tutor
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Course Dialog */}
      {isEditDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Course: {selectedCourse?.name}</h2>
              <button
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                onClick={() => setIsEditDialogOpen(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Course Name *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter course name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-price">Price (₹) *</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="Enter price"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-description">Description *</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter course description"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-courseType">Course Type *</Label>
                  <Select value={formData.courseType} onValueChange={(value) => handleInputChange('courseType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="self_paced">Self-Paced</SelectItem>
                      <SelectItem value="live">Live Course</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-difficulty">Difficulty Level</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* What's Included Section */}
              <div>
                <Label htmlFor="edit-features">What's Included:</Label>
                <div className="space-y-2">
                  {formData.features && formData.features.length > 0 ? (
                    formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={feature}
                          onChange={(e) => {
                            const newFeatures = [...formData.features];
                            newFeatures[index] = e.target.value;
                            handleInputChange('features', newFeatures);
                          }}
                          placeholder="Enter feature"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newFeatures = formData.features.filter((_, i) => i !== index);
                            handleInputChange('features', newFeatures);
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
                      const newFeatures = [...(formData.features || []), ''];
                      handleInputChange('features', newFeatures);
                    }}
                    className="w-full"
                  >
                    + Add Feature
                  </Button>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateCourseMutation.isPending}
                >
                  {updateCourseMutation.isPending ? "Updating..." : "Update Course"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Study Materials Dialog */}
      {isStudyMaterialsDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Study Materials - {selectedCourse?.name}</h2>
              <button
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                onClick={() => setIsStudyMaterialsDialogOpen(false)}
              >
                ✕
              </button>
            </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-600">Manage study materials for this course</p>
              <Button 
                size="sm"
                onClick={() => window.location.href = `/admin/study-materials?courseGroupId=${selectedCourse?.id}`}
              >
                <Plus className="h-4 w-4 mr-2" />
                Manage Materials
              </Button>
            </div>
            
            {studyMaterials.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No study materials added yet</p>
                <p className="text-sm text-slate-500">Add your first study material to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studyMaterials.map((material: StudyMaterial) => (
                  <Card key={material.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{material.title}</h4>
                          <p className="text-sm text-slate-600 mt-1">{material.description}</p>
                          <div className="flex items-center mt-2">
                            {material.type === 'video' && <Video className="h-4 w-4 text-red-500 mr-1" />}
                            {material.type === 'document' && <File className="h-4 w-4 text-blue-500 mr-1" />}
                            {material.type === 'pdf' && <FileText className="h-4 w-4 text-red-500 mr-1" />}
                            {material.type === 'ppt' && <Presentation className="h-4 w-4 text-orange-500 mr-1" />}
                            {material.type === 'image' && <Image className="h-4 w-4 text-green-500 mr-1" />}
                            {material.type === 'external_link' && <Link className="h-4 w-4 text-purple-500 mr-1" />}
                            <span className="text-xs text-slate-500 capitalize">{material.type}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              // Open edit modal or redirect to edit page
                              window.open(`/admin/study-materials?courseGroupId=${selectedCourse?.id}&edit=${material.id}`, '_blank');
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this study material?")) {
                                deleteStudyMaterialMutation.mutate(material.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            onClick={() => setIsStudyMaterialsDialogOpen(false)}
          >
            ✕
          </button>
        </div>
      </div>
      )}

      {/* Course Modules Dialog */}
      {isModulesDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Course Modules - {selectedCourse?.name}</h2>
              <button
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                onClick={() => setIsModulesDialogOpen(false)}
              >
                ✕
              </button>
            </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-600">Manage course modules and quizzes for self-paced learning</p>
              <Button 
                size="sm"
                onClick={() => window.location.href = `/admin/study-materials?courseGroupId=${selectedCourse?.id}`}
              >
                <Plus className="h-4 w-4 mr-2" />
                Manage Modules
              </Button>
            </div>
            
            {courseModules.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No modules created yet</p>
                <p className="text-sm text-slate-500">Create your first module to structure the course</p>
              </div>
            ) : (
              <div className="space-y-4">
                {courseModules.map((module: CourseModule) => (
                  <Card key={module.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{module.title}</h4>
                            <Badge variant="outline">Module {module.orderIndex}</Badge>
                            {module.requiresQuiz && <Badge variant="secondary">Quiz Required</Badge>}
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{module.description}</p>
                          {module.requiresQuiz && (
                            <div className="text-xs text-slate-500">
                              Passing Score: {module.passingScore}% | Max Attempts: {module.maxAttempts}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              // Open edit modal or redirect to edit page
                              window.open(`/admin/study-materials?courseGroupId=${selectedCourse?.id}&tab=modules&edit=${module.id}`, '_blank');
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              // Open module content management
                              window.open(`/admin/study-materials?courseGroupId=${selectedCourse?.id}&tab=modules&module=${module.id}`, '_blank');
                            }}
                          >
                            <BookOpen className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this module?")) {
                                deleteModuleMutation.mutate(module.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            onClick={() => setIsModulesDialogOpen(false)}
          >
            ✕
          </button>
        </div>
      </div>
      )}

      {/* Live Sessions Dialog */}
      {isLiveSessionsDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Live Sessions - {selectedCourse?.name}</h2>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    // Generate a unique session ID for the video call
                    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    window.open(`/video-call/${sessionId}`, '_blank');
                  }}
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Start Video Call
                </Button>
                <button
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                  onClick={() => setIsLiveSessionsDialogOpen(false)}
                >
                  ✕
                </button>
              </div>
            </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-600">Schedule live sessions and manage class timings</p>
              <Button 
                size="sm"
                onClick={() => setIsAddSessionOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Session
              </Button>
            </div>
            
            {liveSessions.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No live sessions scheduled yet</p>
                <p className="text-sm text-slate-500">Schedule your first live session to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {liveSessions.map((session: LiveSession) => (
                  <Card key={session.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{session.title}</h4>
                          <p className="text-sm text-slate-600 mt-1">{session.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                            <span>Date: {new Date(session.sessionDate).toLocaleDateString()}</span>
                            <span>Time: {new Date(session.startTime).toLocaleTimeString()} - {new Date(session.endTime).toLocaleTimeString()}</span>
                            {session.googleMeetLink && <span className="text-blue-600">Google Meet Available</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openEditSessionDialog(session)}
                            title="Edit session"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openViewSessionDialog(session)}
                            title="View session details"
                          >
                            <BookOpen className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              // Open video call in new tab
                              window.open(`/video-call/${session.id}`, '_blank');
                            }}
                            title="Join video call"
                            className="bg-blue-600 text-white hover:bg-blue-700"
                          >
                            <Video className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this live session?")) {
                                deleteLiveSessionMutation.mutate(session.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            onClick={() => setIsLiveSessionsDialogOpen(false)}
          >
            ✕
          </button>
        </div>
      </div>
      )}

      {/* Tutor Assignment Dialog */}
      {isTutorAssignmentDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Tutor Assignment - {selectedCourse?.name}</h2>
              <button
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                onClick={() => setIsTutorAssignmentDialogOpen(false)}
              >
                ✕
              </button>
            </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-600">Assign tutors to this live course</p>
            </div>
            
            {/* Tutor Assignment Form */}
            <div className="bg-slate-50 p-4 rounded-lg border">
              <h4 className="font-medium mb-3">Assign New Tutor</h4>
              <div className="flex gap-2">
                <Select onValueChange={(tutorId) => {
                  if (tutorId && selectedCourse?.id) {
                    assignTutorMutation.mutate({ courseGroupId: selectedCourse.id, tutorId });
                  }
                }}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a tutor to assign" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(tutors) && tutors.map((tutor: any) => (
                      <SelectItem key={tutor.id} value={tutor.id}>
                        {tutor.firstName} {tutor.lastName} ({tutor.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {Array.isArray(tutors) && tutors.length === 0 && (
                <p className="text-sm text-slate-500 mt-2">No tutors available. Create tutors first in Tutor Management.</p>
              )}
            </div>
            
            {courseTutorsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading tutors...</p>
              </div>
            ) : courseTutorsError ? (
              <div className="text-center py-8">
                <p className="text-red-600">Error loading tutors. Please try again.</p>
              </div>
            ) : !Array.isArray(courseTutors) || courseTutors.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No tutors assigned yet</p>
                <p className="text-sm text-slate-500">Assign a tutor to this course to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Array.isArray(courseTutors) && courseTutors.map((assignment: any) => (
                  <Card key={assignment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{assignment.tutor?.firstName} {assignment.tutor?.lastName}</h4>
                          <p className="text-sm text-slate-600 mt-1">{assignment.tutor?.email}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                            <span>Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              assignment.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {assignment.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              if (confirm("Are you sure you want to remove this tutor assignment?")) {
                                removeTutorMutation.mutate(assignment.id);
                              }
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Quiz Dialog */}
      {isQuizDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Quiz Management - {selectedCourse?.name}</h2>
              <button
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                onClick={() => setIsQuizDialogOpen(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-600">Manage objective type quizzes for this self-paced course</p>
                <Button 
                  size="sm"
                  onClick={() => {
                    // Open quiz management in a new tab or handle differently
                    window.open(`/admin/study-materials?courseGroupId=${selectedCourse?.id}`, '_blank');
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Quizzes
                </Button>
              </div>
              
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600">Quiz management is now available!</p>
                <p className="text-sm text-gray-500 mt-2">Click "Manage Quizzes" to create and manage quiz questions for your modules</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Session Dialog */}
      {isAddSessionOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Live Session - {selectedCourse?.name}</h2>
              <button
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                onClick={() => setIsAddSessionOpen(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Title</label>
                <input
                  type="text"
                  value={sessionForm.title}
                  onChange={(e) => handleSessionInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter session title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={sessionForm.description}
                  onChange={(e) => handleSessionInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter session description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Session Date</label>
                  <input
                    type="date"
                    value={sessionForm.sessionDate}
                    onChange={(e) => handleSessionInputChange('sessionDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
                  <input
                    type="number"
                    value={sessionForm.maxParticipants}
                    onChange={(e) => handleSessionInputChange('maxParticipants', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional"
                    min="1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={sessionForm.startTime}
                    onChange={(e) => handleSessionInputChange('startTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={sessionForm.endTime}
                    onChange={(e) => handleSessionInputChange('endTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Meet Link (Optional)</label>
                <input
                  type="url"
                  value={sessionForm.googleMeetLink}
                  onChange={(e) => handleSessionInputChange('googleMeetLink', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://meet.google.com/..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={sessionForm.notes}
                  onChange={(e) => handleSessionInputChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes for this session"
                  rows={2}
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddSessionOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createSessionMutation.isPending}
                >
                  {createSessionMutation.isPending ? "Creating..." : "Create Session"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Session Dialog */}
      {isEditSessionOpen && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Live Session - {selectedSession.title}</h2>
              <button
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                onClick={() => {
                  setIsEditSessionOpen(false);
                  setSelectedSession(null);
                }}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              updateSessionMutation.mutate({
                ...editSessionForm,
                groupId: selectedCourse?.id,
                sessionDate: new Date(editSessionForm.sessionDate).toISOString(),
                startTime: new Date(`${editSessionForm.sessionDate}T${editSessionForm.startTime}`).toISOString(),
                endTime: new Date(`${editSessionForm.sessionDate}T${editSessionForm.endTime}`).toISOString(),
                maxParticipants: editSessionForm.maxParticipants ? parseInt(editSessionForm.maxParticipants) : null
              });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Title</label>
                <input
                  type="text"
                  value={editSessionForm.title}
                  onChange={(e) => setEditSessionForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter session title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editSessionForm.description}
                  onChange={(e) => setEditSessionForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter session description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Session Date</label>
                  <input
                    type="date"
                    value={editSessionForm.sessionDate}
                    onChange={(e) => setEditSessionForm(prev => ({ ...prev, sessionDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
                  <input
                    type="number"
                    value={editSessionForm.maxParticipants}
                    onChange={(e) => setEditSessionForm(prev => ({ ...prev, maxParticipants: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional"
                    min="1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={editSessionForm.startTime}
                    onChange={(e) => setEditSessionForm(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={editSessionForm.endTime}
                    onChange={(e) => setEditSessionForm(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Meet Link (Optional)</label>
                <input
                  type="url"
                  value={editSessionForm.googleMeetLink}
                  onChange={(e) => setEditSessionForm(prev => ({ ...prev, googleMeetLink: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://meet.google.com/..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={editSessionForm.notes}
                  onChange={(e) => setEditSessionForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes for this session"
                  rows={2}
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditSessionOpen(false);
                    setSelectedSession(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateSessionMutation.isPending}
                >
                  {updateSessionMutation.isPending ? "Updating..." : "Update Session"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Session Dialog */}
      {isViewSessionOpen && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Session Details - {selectedSession.title}</h2>
              <button
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                onClick={() => {
                  setIsViewSessionOpen(false);
                  setSelectedSession(null);
                }}
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Title</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{selectedSession.title}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                  {selectedSession.description || 'No description provided'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Session Date</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                    {new Date(selectedSession.sessionDate).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                    {selectedSession.maxParticipants || 'No limit'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                    {new Date(selectedSession.startTime).toLocaleTimeString()}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                    {new Date(selectedSession.endTime).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Meet Link</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                  {selectedSession.googleMeetLink ? (
                    <a 
                      href={selectedSession.googleMeetLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {selectedSession.googleMeetLink}
                    </a>
                  ) : 'No Google Meet link provided'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                  {selectedSession.notes || 'No notes provided'}
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewSessionOpen(false);
                    setSelectedSession(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsViewSessionOpen(false);
                    openEditSessionDialog(selectedSession);
                  }}
                >
                  Edit Session
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
