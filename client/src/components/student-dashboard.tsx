import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import LearningPathViewer from "./learning-path-viewer";
import { LiveSessionsCalendar } from "./live-sessions-calendar";
import LiveSessionsCalendarNew from "./live-sessions-calendar-new";
import { StudyWallet } from "./study-wallet";
import { CertificateViewer } from "./certificate-viewer";
import { CourseReview } from "./course-review";
import PaymentCompletionPopup from "./payment-completion-popup";
import useSelfPacedCourseProgress from "./self-paced-course-progress";
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Clock, 
  Award,
  TrendingUp,
  Calendar,
  Users,
  Star,
  ArrowRight,
  Video,
  FileText,
  Download,
  Wallet
} from "lucide-react";

const VideoIcon = Video;

interface CourseGroup {
  id: string;
  name: string;
  description: string;
  price: string;
  difficulty: string;
  duration: number;
  features: string[];
  categoryId: string;
  subcategoryId?: string;
  thumbnail?: string;
  categoryName?: string;
  subcategoryName?: string;
  courseType?: string;
  // Enrollment details
  enrollmentId?: string;
  enrollmentStatus?: string;
  paymentStatus?: string;
  enrolledAt?: string;
  activatedAt?: string;
  expiresAt?: string;
  phoneNumber?: string;
  studyPath?: string;
  status?: string;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  requiresQuiz: boolean;
  quizRequiredToUnlock: boolean;
  passingScore: number;
  documents: Document[];
}

interface Document {
  id: string;
  title: string;
  type: string;
  fileUrl?: string;
  externalUrl?: string;
  duration?: number;
  orderIndex: number;
}

interface Progress {
  learningPathId: string;
  documentId: string;
  isCompleted: boolean;
  completedAt?: string;
  score?: number;
  attempts: number;
}

export default function StudentDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const [selectedCourseGroup, setSelectedCourseGroup] = useState<CourseGroup | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/signin");
      return;
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Get self-paced course progress for the selected course
  // Use the correct course group ID (uniqueId is the actual database ID)
  const courseGroupId = selectedCourseGroup ? (selectedCourseGroup as any).uniqueId || selectedCourseGroup.id : '';
  const selfPacedProgress = useSelfPacedCourseProgress(
    courseGroupId, 
    (user as any)?.id || ''
  );

  // Helper function to calculate progress for any course
  const calculateCourseProgress = (groupId: string, courseType: string, modules: any[], progress: any[]) => {
    if (courseType !== 'self_paced' || !modules.length) return 0;
    
    const completedModules = modules.filter((module: any) => {
      const moduleProgress = progress.find((p: any) => p.moduleId === module.id);
      return moduleProgress?.isCompleted || false;
    }).length;
    
    return (completedModules / modules.length) * 100;
  };

  // Update URL when course or tab changes
  const updateURL = (courseId?: string, tab?: string) => {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (courseId) {
      urlParams.set('course', courseId);
    } else {
      urlParams.delete('course');
    }
    
    if (tab) {
      urlParams.set('tab', tab);
    } else {
      urlParams.delete('tab');
    }
    
    const newSearch = urlParams.toString();
    const newURL = newSearch ? `?${newSearch}` : '/dashboard';
    setLocation(newURL);
  };

  // Determine if selected course is live or self-paced
  const isSelectedCourseLive = selectedCourseGroup?.courseType === 'live';
  const isSelectedCourseSelfPaced = selectedCourseGroup && selectedCourseGroup.courseType === 'self_paced';
  
  console.log('Selected course analysis:', {
    selectedCourseGroup,
    courseType: selectedCourseGroup?.courseType,
    isSelectedCourseLive,
    isSelectedCourseSelfPaced,
    activeTab
  });

  // Determine which tabs should be visible
  const getVisibleTabs = () => {
    if (!selectedCourseGroup) {
      // No course selected - only show Overview and My Courses
      return ["overview", "courses"];
    } else if (isSelectedCourseLive) {
      // Live course selected - show Live Sessions, Certificates, Reviews (hide Learning Path)
      return ["overview", "courses", "live", "certificates", "reviews"];
    } else if (isSelectedCourseSelfPaced) {
      // Self-paced course selected - show Learning Path, Certificates, Reviews (hide Live Sessions)
      return ["overview", "courses", "learning", "certificates", "reviews"];
    }
    return ["overview", "courses"];
  };

  const visibleTabs = getVisibleTabs();
  
  console.log('Tab visibility:', {
    selectedCourseGroup: !!selectedCourseGroup,
    isSelectedCourseLive,
    isSelectedCourseSelfPaced,
    visibleTabs,
    activeTab,
    isActiveTabVisible: visibleTabs.includes(activeTab)
  });

  // Reset to overview tab when no course is selected and user tries to access hidden tabs
  useEffect(() => {
    if (!selectedCourseGroup && !visibleTabs.includes(activeTab)) {
      setActiveTab("overview");
    }
  }, [selectedCourseGroup, activeTab, visibleTabs]);

  // Function to clear course selection
  const clearCourseSelection = () => {
    setSelectedCourseGroup(null);
    setActiveTab("overview");
    updateURL(undefined, "overview");
  };

  // Function to check if selected course has completed payment
  const isSelectedCoursePaid = () => {
    if (!selectedCourseGroup) return false;
    return selectedCourseGroup.paymentStatus === 'paid' && 
           selectedCourseGroup.status === 'active';
  };

  // Function to handle tab click with payment check
  const handleTabClick = (tabValue: string) => {
    // If it's a restricted tab and payment is not completed, show payment popup
    const restrictedTabs = ['learning', 'live', 'certificates', 'reviews'];
    if (restrictedTabs.includes(tabValue) && !isSelectedCoursePaid()) {
      setIsPaymentPopupOpen(true);
      return;
    }
    
    setActiveTab(tabValue);
    // Use the uniqueId (course group ID) for the URL
    const courseId = selectedCourseGroup ? (selectedCourseGroup as any).uniqueId : undefined;
    updateURL(courseId, tabValue);
  };

  console.log('StudentDashboard rendering, user:', user);

  // Fetch user's enrolled course groups
  const { data: courseGroups = [], isLoading: groupsLoading, error: groupsError } = useQuery({
    queryKey: ["/api/user/course-groups", (user as any)?.id],
    queryFn: async () => {
      console.log('Fetching course groups for user:', (user as any)?.id);
      const response = await apiRequest("GET", `/api/user/course-groups`);
      console.log('Course groups response:', response);
      if (!response.ok) {
        throw new Error('Failed to fetch course groups');
      }
      return response.json();
    },
    enabled: !!(user as any)?.id,
  });

  console.log('Course groups state:', { courseGroups, groupsLoading, groupsError });

  // Also fetch from the me/groups endpoint as fallback
  const { data: userGroups = [], isLoading: userGroupsLoading, error: userGroupsError } = useQuery({
    queryKey: ["/api/me/groups", (user as any)?.id],
    queryFn: async () => {
      console.log('Fetching user groups...');
      const response = await apiRequest("GET", `/api/me/groups`);
      console.log('User groups response:', response);
      if (!response.ok) {
        throw new Error('Failed to fetch user groups');
      }
      return response.json();
    },
    enabled: !!(user as any)?.id,
  });

  console.log('User groups state:', { userGroups, userGroupsLoading, userGroupsError });


  // Fetch available courses to show when not enrolled
  const { data: availableCourses = [], isLoading: availableCoursesLoading } = useQuery({
    queryKey: ["/api/course-groups"],
    queryFn: async () => {
      console.log('Fetching available courses...');
      const response = await apiRequest("GET", "/api/course-groups");
      console.log('Available courses response:', response);
      if (!response.ok) {
        throw new Error('Failed to fetch available courses');
      }
      return response.json();
    },
  });

  console.log('Available courses state:', { availableCourses, availableCoursesLoading });

  // Fetch learning paths for selected course group
  const { data: learningPaths = [], isLoading: pathsLoading } = useQuery({
    queryKey: ["/api/learning-paths", courseGroupId],
    queryFn: async () => {
      if (!courseGroupId) return [];
      const response = await apiRequest("GET", `/api/learning-paths?groupId=${courseGroupId}`);
      const data = await response.json();
      return data.sort((a: LearningPath, b: LearningPath) => a.orderIndex - b.orderIndex);
    },
    enabled: !!courseGroupId,
  });

  // Fetch progress for selected course group
  const { data: progress = [], isLoading: progressLoading } = useQuery({
    queryKey: ["/api/learning-path-progress", (user as any)?.id, courseGroupId],
    queryFn: async () => {
      if (!courseGroupId || !(user as any)?.id) return [];
      const response = await apiRequest("GET", `/api/learning-path-progress?userId=${(user as any).id}&groupId=${courseGroupId}`);
      return response.json();
    },
    enabled: !!courseGroupId && !!(user as any)?.id,
  });

  // Debug: Log progress calculation data
  console.log('Progress calculation debug:', {
    selectedCourseGroup: selectedCourseGroup ? {
      id: selectedCourseGroup.id,
      uniqueId: (selectedCourseGroup as any).uniqueId,
      courseType: selectedCourseGroup.courseType,
      name: selectedCourseGroup.name
    } : null,
    courseGroupId,
    learningPaths: learningPaths.length,
    progress: progress.length,
    selfPacedProgress: selfPacedProgress.overallProgress
  });

  // If user is not authenticated, redirect to login
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-medium text-slate-900 mb-2">Please Login</h3>
          <p className="text-slate-600 mb-4">You need to be logged in to access your dashboard.</p>
          <Button onClick={() => window.location.href = '/signin'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Show error if there's an issue
  if (groupsError) {
    console.error('Error loading course groups:', groupsError);
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Dashboard</h3>
          <p className="text-slate-600">{groupsError.message}</p>
        </div>
      </div>
    );
  }

  if (userGroupsError) {
    console.error('Error loading user groups:', userGroupsError);
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading User Data</h3>
          <p className="text-slate-600">{userGroupsError.message}</p>
        </div>
      </div>
    );
  }

  const getOverallProgress = (groupId?: string) => {
    console.log('getOverallProgress called with:', { groupId, courseGroupId, selectedCourseGroup: selectedCourseGroup?.id, courseType: selectedCourseGroup?.courseType });
    
    // If no groupId provided, return 0
    if (!groupId) {
      console.log('No groupId provided, returning 0');
      return 0;
    }
    
    // Find the course group to determine its type
    const targetCourse = uniqueCourses.find((course: any) => 
      (course.uniqueId || course.id) === groupId
    );
    
    if (!targetCourse) {
      console.log('Course not found for groupId:', groupId);
      return 0;
    }
    
    // For self-paced courses, use the new module-based progress system
    if (targetCourse.courseType === 'self_paced') {
      // Only use selfPacedProgress if this is the currently selected course
      if (groupId === courseGroupId) {
        console.log('Using self-paced progress for selected course:', selfPacedProgress.overallProgress);
        return selfPacedProgress.overallProgress;
      } else {
        // For other self-paced courses, return 0 for now
        // TODO: Implement proper progress calculation for non-selected courses
        console.log('Self-paced course not selected, returning 0 for now');
        return 0;
      }
    }
    
    // For live courses or legacy learning paths, use the old system
    if (!learningPaths.length) {
      console.log('No learning paths found');
      return 0;
    }
    
    // Filter learning paths by group if specified
    // Note: learning paths use 'groupId' field, not 'courseGroupId'
    const relevantPaths = groupId 
      ? learningPaths.filter((path: any) => path.groupId === groupId)
      : learningPaths;
    
    console.log('Relevant paths:', { total: learningPaths.length, relevant: relevantPaths.length, groupId });
    
    if (!relevantPaths.length) return 0;
    
    // Since documents are not included in learning paths API, we'll calculate progress
    // based on the number of learning paths and completed progress entries
    const totalPaths = relevantPaths.length;
    const completedPaths = relevantPaths.filter((path: any) => {
      const pathProgress = progress.filter((p: any) => p.learningPathId === path.id);
      return pathProgress.length > 0 && pathProgress.every((p: any) => p.isCompleted);
    }).length;
    
    const progressPercentage = totalPaths > 0 ? (completedPaths / totalPaths) * 100 : 0;
    console.log('Learning path progress calculation:', { totalPaths, completedPaths, progressPercentage });
    
    return progressPercentage;
  };

  const getPathProgress = (pathId: string) => {
    // Since documents are not included in learning paths API, we'll calculate progress
    // based on the progress entries for this learning path
    const pathProgress = progress.filter((p: any) => p.learningPathId === pathId);
    const completedDocuments = pathProgress.filter((p: any) => p.isCompleted).length;
    
    // For now, we'll assume each learning path has at least one document
    // This is a simplified approach since we don't have document count from the API
    const totalDocuments = Math.max(pathProgress.length, 1);
    
    const result = {
      total: totalDocuments,
      completed: completedDocuments,
      percentage: totalDocuments > 0 ? (completedDocuments / totalDocuments) * 100 : 0
    };
    
    console.log('getPathProgress for pathId:', pathId, result);
    return result;
  };

  const isPathUnlocked = (path: LearningPath, index: number) => {
    if (index === 0) return true;
    
    const previousPath = learningPaths[index - 1];
    if (!previousPath) return true;
    
    if (!previousPath.quizRequiredToUnlock) return true;
    
    const previousPathProgress = progress.filter((p: any) => p.learningPathId === previousPath.id);
    const hasPassedQuiz = previousPathProgress.some((p: any) => 
      p.score && p.score >= previousPath.passingScore
    );
    
    return hasPassedQuiz;
  };

  // Combine both data sources and show all enrolled courses regardless of payment status
  // Normalize the data structures to use consistent IDs
  const normalizedCourseGroups = courseGroups.map((course: any) => ({
    ...course,
    uniqueId: course.id // course group ID
  }));
  
  const normalizedUserGroups = userGroups.map((enrollment: any) => ({
    ...enrollment,
    uniqueId: enrollment.groupId, // course group ID
    enrollmentId: enrollment.id, // enrollment ID
    enrollmentStatus: enrollment.status,
    paymentStatus: enrollment.paymentStatus || 'pending',
    // Ensure course type fields are included
    courseType: enrollment.courseType,
    isLiveCourse: enrollment.isLiveCourse
  }));
  
  // Only show courses that the user has actually enrolled in
  const uniqueCourses = normalizedUserGroups.filter((course: any, index: number, self: any[]) => 
    index === self.findIndex((c: any) => c.uniqueId === course.uniqueId)
  );

  console.log('Final state:', { 
    courseGroups, 
    userGroups, 
    uniqueCourses,
    uniqueCoursesLength: uniqueCourses.length
  });

  // Debug: Log the selected course group details
  if (selectedCourseGroup) {
    console.log('Selected course group details:', {
      id: selectedCourseGroup.id,
      name: selectedCourseGroup.name,
      courseType: selectedCourseGroup.courseType,
      isLiveCourse: (selectedCourseGroup as any).isLiveCourse,
      paymentStatus: selectedCourseGroup.paymentStatus
    });
  }

  // Debug: Fetch user course data to check for inconsistencies
  const { data: debugData } = useQuery({
    queryKey: ["/api/debug/user-course-data", (user as any)?.id],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/debug/user-course-data");
      return response.json();
    },
    enabled: !!(user as any)?.id,
  });

  if (debugData) {
    console.log('Debug data:', debugData);
  }

  // Handle course selection and tab from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('course');
    const tab = urlParams.get('tab') || 'overview';
    
    console.log('URL parameters:', { courseId, tab, uniqueCoursesLength: uniqueCourses.length });
    
    // Set the tab first
    if (tab && ['overview', 'courses', 'learning', 'live', 'certificates', 'reviews'].includes(tab)) {
      setActiveTab(tab);
    }
    
    // Handle course selection
    if (courseId && uniqueCourses.length > 0) {
      const course = uniqueCourses.find((c: any) => c.uniqueId === courseId);
      console.log('Found course from URL:', { course, courseId, uniqueId: course?.uniqueId });
      if (course) {
        // Ensure the course has both id and uniqueId set correctly
        const selectedCourse = {...course, id: course.uniqueId, uniqueId: course.uniqueId};
        setSelectedCourseGroup(selectedCourse);
      } else {
        console.log('Course not found in uniqueCourses, available uniqueIds:', uniqueCourses.map((c: any) => c.uniqueId));
        // Clear the selected course if it's not in the user's enrolled courses
        setSelectedCourseGroup(null);
        // Update URL to remove the invalid course parameter
        updateURL(undefined, tab);
      }
    } else if (courseId && uniqueCourses.length === 0) {
      // If there's a courseId in URL but no courses loaded yet, wait for courses to load
      console.log('Course ID in URL but no courses loaded yet, waiting...');
    }
  }, [uniqueCourses]);

  if (groupsLoading || userGroupsLoading || availableCoursesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!uniqueCourses.length) {
    return (
      <div className="space-y-6">
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">No Courses Enrolled</h3>
          <p className="text-slate-600 mb-6">You haven't enrolled in any courses yet. Browse our available courses below:</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableCourses.map((course: any) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{course.name}</CardTitle>
                  <p className="text-slate-600 text-sm">{course.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-600">₹{course.price}</span>
                      <Badge variant={course.courseType === 'live' ? 'destructive' : 'secondary'}>
                        {course.courseType === 'live' ? 'Live Course' : 'Self-Paced'}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-500">Duration: {course.duration} hours</p>
                      <p className="text-sm text-slate-500">Difficulty: {course.difficulty}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-700">What's included:</p>
                      <ul className="text-xs text-slate-600 space-y-1">
                        {course.features?.slice(0, 3).map((feature: string, index: number) => (
                          <li key={index} className="flex items-center">
                            <span className="text-green-500 mr-2">✓</span>
                            {feature}
                          </li>
                        ))}
                        {course.features?.length > 3 && (
                          <li className="text-slate-500">+{course.features.length - 3} more features</li>
                        )}
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <Button 
                        className="w-full" 
                        onClick={() => window.location.href = `/?enroll=${course.id}`}
                      >
                        Enroll Now
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={(e) => {
                          e.stopPropagation();
                          const selectedGroup = {...course};
                          setSelectedCourseGroup(selectedGroup);
                          
                          // Auto-switch to appropriate tab when course is selected
                          const tabToSwitch = course.courseType === 'live' ? "live" : "learning";
                          setActiveTab(tabToSwitch);
                          updateURL(course.uniqueId, tabToSwitch);
                        }}
                      >
                        {course.courseType === 'live' ? 'View Live Sessions' : 'View Learning Path'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    );
  }

  // Fallback in case of any unexpected issues
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-medium text-slate-900 mb-2">Loading Dashboard</h3>
          <p className="text-slate-600">Please wait while we load your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">My Learning Dashboard</h1>
        <p className="text-sm sm:text-base text-slate-600">Track your progress and continue your learning journey</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabClick} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">Overview</TabsTrigger>
          <TabsTrigger value="courses" className="text-xs sm:text-sm py-2">My Courses</TabsTrigger>
          {visibleTabs.includes("learning") && (
            <TabsTrigger 
              value="learning"
              className={`text-xs sm:text-sm py-2 ${!isSelectedCoursePaid() ? "opacity-60" : ""}`}
            >
              <span className="hidden sm:inline">Learning Path</span>
              <span className="sm:hidden">Learning</span>
              {!isSelectedCoursePaid() && selectedCourseGroup && (
                <span className="ml-1 text-xs">🔒</span>
              )}
            </TabsTrigger>
          )}
          {visibleTabs.includes("live") && (
            <TabsTrigger 
              value="live"
              className={`text-xs sm:text-sm py-2 ${!isSelectedCoursePaid() ? "opacity-60" : ""}`}
            >
              <span className="hidden sm:inline">Live Sessions</span>
              <span className="sm:hidden">Live</span>
              {!isSelectedCoursePaid() && selectedCourseGroup && (
                <span className="ml-1 text-xs">🔒</span>
              )}
            </TabsTrigger>
          )}
          {visibleTabs.includes("certificates") && (
            <TabsTrigger 
              value="certificates"
              className={`text-xs sm:text-sm py-2 ${!isSelectedCoursePaid() ? "opacity-60" : ""}`}
            >
              <span className="hidden sm:inline">Certificates</span>
              <span className="sm:hidden">Certs</span>
              {!isSelectedCoursePaid() && selectedCourseGroup && (
                <span className="ml-1 text-xs">🔒</span>
              )}
            </TabsTrigger>
          )}
          {visibleTabs.includes("reviews") && (
            <TabsTrigger 
              value="reviews"
              className={`text-xs sm:text-sm py-2 ${!isSelectedCoursePaid() ? "opacity-60" : ""}`}
            >
              <span className="hidden sm:inline">Reviews</span>
              <span className="sm:hidden">Reviews</span>
              {!isSelectedCoursePaid() && selectedCourseGroup && (
                <span className="ml-1 text-xs">🔒</span>
              )}
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="overview">
          <div className="space-y-6">
            {/* Selected Course Indicator */}
            {selectedCourseGroup && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-900">Currently Selected Course</h3>
                        <p className="text-sm text-blue-700">{selectedCourseGroup.name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            {selectedCourseGroup.courseType === 'live' ? "Premium Live" : "Self-Paced"}
                          </Badge>
                          {!isSelectedCoursePaid() && (
                            <Badge variant="destructive" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                              Payment Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearCourseSelection}
                      className="text-blue-600 border-blue-600 hover:bg-blue-100"
                    >
                      Clear Selection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Progress Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-600">Courses Enrolled</p>
                    <p className="text-2xl font-bold text-slate-900">{uniqueCourses.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-600">Overall Progress</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {Math.round(getOverallProgress(courseGroupId))}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Award className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-600">Certificates</p>
                      <p className="text-2xl font-bold text-slate-900">0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progress
                    .filter((p: any) => p.isCompleted)
                    .sort((a: any, b: any) => new Date(b.completedAt || '').getTime() - new Date(a.completedAt || '').getTime())
                    .slice(0, 5)
                    .map((item: any, index: number) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Completed a lesson</p>
                          <p className="text-xs text-slate-500">
                            {item.completedAt ? new Date(item.completedAt).toLocaleDateString() : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="courses">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {uniqueCourses.map((group: any) => {
              // Use the correct ID for progress calculation
              const groupId = group.uniqueId || group.id;
              const groupProgress = getOverallProgress(groupId);
              const isPaid = group.paymentStatus === 'paid';
              const isActive = group.status === 'active';
              const isAccessible = isPaid && isActive;
              
              // For live courses, check if it's a live course by course type
              const isLiveCourse = group.courseType === 'live';
              console.log('Course detection:', { 
                groupName: group.name, 
                price: group.price, 
                courseType: group.courseType, 
                studyPath: group.studyPath, 
                categoryName: group.categoryName,
                isLiveCourse,
                fullGroup: group
              });
              
              return (
                <Card 
                  key={group.uniqueId} 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedCourseGroup?.id === group.uniqueId ? 'ring-2 ring-blue-500' : ''
                  } ${!isAccessible ? 'opacity-75' : ''}`}
                  onClick={() => {
                    const selectedGroup = {...group, id: group.uniqueId, uniqueId: group.uniqueId};
                    setSelectedCourseGroup(selectedGroup);
                    
                    // Check if payment is completed before auto-switching to restricted tabs
                    const isPaid = group.paymentStatus === 'paid';
                    const isActive = group.status === 'active';
                    const isAccessible = isPaid && isActive;
                    
                    if (isAccessible) {
                      // Auto-switch to appropriate tab when course is selected
                      const tabToSwitch = isLiveCourse ? "live" : "learning";
                      setActiveTab(tabToSwitch);
                      updateURL(group.uniqueId, tabToSwitch);
                    } else {
                      // If payment not completed, stay on courses tab and show payment popup
                      setActiveTab("courses");
                      updateURL(group.uniqueId, "courses");
                      setIsPaymentPopupOpen(true);
                    }
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0 ${
                          group.categoryName === 'Premium Live Classes' 
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                            : 'bg-gradient-to-br from-blue-500 to-purple-600'
                        }`}>
                          {group.categoryName === 'Premium Live Classes' ? (
                            <Video className="h-5 w-5 sm:h-6 sm:w-6" />
                          ) : (
                            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base sm:text-lg truncate">{group.name}</CardTitle>
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                            <Badge variant={group.difficulty === 'beginner' ? 'default' : group.difficulty === 'intermediate' ? 'secondary' : 'destructive'} className="text-xs">
                              {group.difficulty}
                            </Badge>
                            {group.paymentStatus && (
                              <Badge variant={
                                group.paymentStatus === 'paid' ? 'default' : 
                                group.paymentStatus === 'pending' ? 'secondary' : 
                                'destructive'
                              } className={`text-xs ${
                                group.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                group.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {group.paymentStatus === 'paid' ? 'Paid' :
                                 group.paymentStatus === 'pending' ? 'Pending' :
                                 'Failed'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 text-sm mb-4">{group.description}</p>
                    
                    {/* Payment Status Message */}
                    {!isAccessible && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800 font-medium">
                          {group.paymentStatus === 'pending' && 'Complete payment to access course content'}
                          {group.paymentStatus === 'failed' && 'Payment failed. Please retry payment.'}
                          {group.enrollmentStatus === 'pending' && 'Enrollment pending approval'}
                          {group.status === 'pending' && 'Enrollment pending approval'}
                          {!group.paymentStatus && !group.status && 'Complete enrollment to access course content'}
                        </p>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-slate-600">
                        <span>Progress</span>
                        <span>{isAccessible ? Math.round(groupProgress) : 0}%</span>
                      </div>
                      <Progress value={isAccessible ? groupProgress : 0} className="h-2" />
                      
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <div className="flex flex-col">
                          <span className="text-xl sm:text-2xl font-bold text-green-600">
                            ₹{group.price}
                          </span>
                          <span className="text-xs text-slate-500 capitalize">
                            {group.categoryName}
                          </span>
                        </div>
                        <Button 
                          size="sm" 
                          variant={isAccessible ? "outline" : "secondary"}
                          disabled={!isAccessible}
                          className="w-full sm:w-auto"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            console.log('Continue Learning button clicked for group:', group);
                            console.log('isAccessible:', isAccessible, 'isLiveCourse:', isLiveCourse);
                            console.log('Group courseType:', group.courseType, 'isLiveCourse field:', group.isLiveCourse);
                            
                            if (isAccessible) {
                              const selectedGroup = {...group, id: group.uniqueId, uniqueId: group.uniqueId};
                              console.log('Setting selected course group:', selectedGroup);
                              setSelectedCourseGroup(selectedGroup);
                              
                              // For live courses, switch to live sessions tab, otherwise learning path tab
                              const tabToSwitch = isLiveCourse ? "live" : "learning";
                              console.log('Switching to', tabToSwitch, 'tab');
                              setActiveTab(tabToSwitch);
                              updateURL(group.uniqueId, tabToSwitch);
                            } else {
                              // Show payment popup for incomplete payments
                              setIsPaymentPopupOpen(true);
                            }
                          }}
                        >
                          {isAccessible ? (
                            <>
                              <span className="hidden sm:inline">Continue Learning</span>
                              <span className="sm:hidden">Continue</span>
                              <ArrowRight className="h-4 w-4 ml-1" />
                            </>
                          ) : (
                            <>
                              <span className="hidden sm:inline">
                                {group.paymentStatus === 'pending' ? 'Complete Payment' : 'Complete Enrollment'}
                              </span>
                              <span className="sm:hidden">
                                {group.paymentStatus === 'pending' ? 'Pay' : 'Enroll'}
                              </span>
                              <Wallet className="h-4 w-4 ml-1" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="learning">
          {selectedCourseGroup ? (
            <div>
              <LearningPathViewer 
                courseGroupId={selectedCourseGroup.id} 
                userId={(user as any)?.id || ''} 
                onSwitchToLiveSessions={() => setActiveTab("live")}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Select a Self-Paced Course</h3>
              <p className="text-slate-600">Choose a self-paced course from the "My Courses" tab to view its learning path</p>
              <Button 
                onClick={() => {
                  setActiveTab("courses");
                  updateURL(undefined, "courses");
                }} 
                className="mt-4"
              >
                Go to My Courses
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="live">
          <div className="space-y-6">
            {selectedCourseGroup && isSelectedCourseLive ? (
              /* Live Sessions for Selected Live Course */
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedCourseGroup.name}</h2>
                    <p className="text-slate-600">Live video sessions and study materials</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    <VideoIcon className="h-4 w-4 mr-1" />
                    Premium Live
                  </Badge>
                </div>

                {/* Enrollment Status Message */}
                {!isSelectedCoursePaid() && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <VideoIcon className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          Preview Mode
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>You're viewing live sessions for this course. To join live sessions and access all features, please enroll in this course.</p>
                        </div>
                        <div className="mt-3">
                          <Button 
                            size="sm" 
                            onClick={() => window.location.href = `/?enroll=${selectedCourseGroup.id}`}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Enroll Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Live Sessions Calendar */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        Live Sessions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <LiveSessionsCalendarNew groupId={selectedCourseGroup.id} userId={(user as any)?.id} />
                    </CardContent>
                  </Card>

                  {/* Study Wallet */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Wallet className="h-5 w-5 mr-2" />
                        Study Wallet
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <StudyWallet groupId={selectedCourseGroup.id} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : selectedCourseGroup && !isSelectedCourseLive ? (
              /* Self-paced course selected - show message */
              <div className="text-center py-12">
                <VideoIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Live Sessions Not Available</h3>
                <p className="text-slate-600 mb-4">This is a self-paced course. Live sessions are only available for premium live classes.</p>
                <Button 
                  onClick={() => setActiveTab("learning")} 
                  className="mt-4"
                >
                  Go to Learning Path
                </Button>
              </div>
            ) : (
              /* No course selected */
              <div className="text-center py-12">
                <VideoIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Select a Live Course</h3>
                <p className="text-slate-600 mb-4">Choose a premium live course from the "My Courses" tab to view live sessions</p>
                <Button 
                  onClick={() => {
                  setActiveTab("courses");
                  updateURL(selectedCourseGroup ? (selectedCourseGroup as any).uniqueId : undefined, "courses");
                }} 
                  className="mt-4"
                >
                  Go to My Courses
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="certificates">
          <div className="space-y-6">
            {selectedCourseGroup ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{selectedCourseGroup.name}</h3>
                    <p className="text-sm text-slate-600">{selectedCourseGroup.description}</p>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <Award className="h-3 w-3 mr-1" />
                    {selectedCourseGroup.courseType === 'live' ? "Premium Live" : "Self-Paced"}
                  </Badge>
                </div>
                
                <CertificateViewer userId={(user as any)?.id || ""} groupId={selectedCourseGroup.id} />
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Select a Course</h3>
                <p className="text-slate-600 mb-4">Choose a course from the "My Courses" tab to view certificates</p>
                <Button 
                  onClick={() => {
                  setActiveTab("courses");
                  updateURL(undefined, "courses");
                }} 
                  className="mt-4"
                >
                  Go to My Courses
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reviews">
          <div className="space-y-6">
            {selectedCourseGroup ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{selectedCourseGroup.name}</h3>
                    <p className="text-sm text-slate-600">{selectedCourseGroup.description}</p>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <Award className="h-3 w-3 mr-1" />
                    {selectedCourseGroup.courseType === 'live' ? "Premium Live" : "Self-Paced"}
                  </Badge>
                </div>
                
                <CourseReview groupId={selectedCourseGroup.id} userId={(user as any)?.id || ""} />
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Select a Course</h3>
                <p className="text-slate-600 mb-4">Choose a course from the "My Courses" tab to view and leave reviews</p>
                <Button 
                  onClick={() => {
                  setActiveTab("courses");
                  updateURL(undefined, "courses");
                }} 
                  className="mt-4"
                >
                  Go to My Courses
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Payment Completion Popup */}
      <PaymentCompletionPopup
        isOpen={isPaymentPopupOpen}
        onClose={() => setIsPaymentPopupOpen(false)}
        courseName={selectedCourseGroup?.name || ''}
        coursePrice={selectedCourseGroup?.price || ''}
      />
    </div>
  );
}
