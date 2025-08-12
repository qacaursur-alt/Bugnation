import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProgressTracker } from "@/components/progress-tracker";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Bell,
  Download,
  Upload,
  Calendar,
  Tag,
  CheckCircle,
  Clock,
  Play,
  Lock,
} from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery<any[]>({
    queryKey: ["/api/my-enrollments"],
    enabled: !!user,
    retry: false,
  });

  const { data: certificates = [] } = useQuery<any[]>({
    queryKey: ["/api/my-certificates"],
    enabled: !!user,
    retry: false,
  });

  if (isLoading || enrollmentsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentEnrollment = enrollments[0]; // Get the primary active enrollment

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Dashboard Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary">TestAcademy Pro</h1>
              <div className="ml-10">
                <span className="text-slate-600">Welcome back,</span>
                <span className="font-semibold ml-1">
                  {(user as any)?.firstName} {(user as any)?.lastName}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <img
                  src={(user as any)?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/api/logout'}
                  className="text-slate-600 hover:text-primary"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {enrollments.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">No Active Enrollments</h2>
              <p className="text-slate-600 mb-6">
                You haven't enrolled in any courses yet. Browse our available courses to get started.
              </p>
              <Button
                onClick={() => window.location.href = '/api/logout'}
                className="bg-primary hover:bg-blue-700 text-white"
              >
                Browse Courses
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Current Course Progress */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold text-slate-800">
                      {currentEnrollment?.course.title}
                    </CardTitle>
                    <Badge variant="secondary">
                      Day {currentEnrollment?.currentDay} of {currentEnrollment?.course.duration}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Overall Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-600">Overall Progress</span>
                      <span className="font-semibold text-primary">
                        {currentEnrollment?.progress || 0}%
                      </span>
                    </div>
                    <Progress value={currentEnrollment?.progress || 0} className="h-3" />
                  </div>

                  {/* Today's Lesson */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2">Today's Focus</h3>
                    <p className="text-slate-600 mb-3">
                      Test Case Design Techniques - Boundary Value Analysis
                    </p>
                    <div className="flex space-x-3">
                      <Button className="bg-primary hover:bg-blue-700 text-white">
                        <Play className="mr-2 h-4 w-4" />
                        Continue Learning
                      </Button>
                      <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download Handbook
                      </Button>
                    </div>
                  </div>

                  {/* Weekly Progress */}
                  <ProgressTracker currentDay={currentEnrollment?.currentDay || 1} />
                </CardContent>
              </Card>

              {/* Learning Modules */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Modules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white text-sm">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">Module 1: Testing Fundamentals</h3>
                          <p className="text-slate-600 text-sm">Introduction to Software Testing • 7 lessons</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-accent border-accent">
                        Completed
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="border-2 border-primary rounded-lg p-4 bg-blue-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">2</div>
                        <div>
                          <h3 className="font-semibold text-slate-800">Module 2: Test Case Design</h3>
                          <p className="text-slate-600 text-sm">Design Techniques & Best Practices • 8 lessons</p>
                        </div>
                      </div>
                      <Badge className="bg-primary text-white">
                        Current
                      </Badge>
                    </div>
                    <div className="mt-3 ml-12">
                      <Progress value={60} className="h-2" />
                      <p className="text-xs text-slate-500 mt-1">5 of 8 lessons completed</p>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 opacity-60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center text-slate-500 text-sm font-medium">3</div>
                        <div>
                          <h3 className="font-semibold text-slate-500">Module 3: Automation Basics</h3>
                          <p className="text-slate-500 text-sm">Introduction to Selenium • 10 lessons</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-slate-500">
                        <Lock className="mr-1 h-3 w-3" />
                        Locked
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Assignments */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Assignments</CardTitle>
                    <Button variant="ghost" size="sm">View All</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-800">Test Case Design Exercise</h3>
                      <Badge variant="outline" className="bg-warning text-white border-warning">
                        Due Tomorrow
                      </Badge>
                    </div>
                    <p className="text-slate-600 text-sm mb-3">
                      Create test cases for the login functionality using boundary value analysis
                    </p>
                    <div className="flex space-x-3">
                      <Button size="sm" className="bg-primary hover:bg-blue-700 text-white">
                        Submit Assignment
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="mr-1 h-3 w-3" />
                        Download Template
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-800">Bug Report Practice</h3>
                      <Badge className="bg-accent text-white">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Submitted
                      </Badge>
                    </div>
                    <p className="text-slate-600 text-sm mb-2">
                      Write detailed bug reports for the provided scenarios
                    </p>
                    <p className="text-green-600 text-sm font-medium">Grade: 95/100 - Excellent work!</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Learning Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Learning Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Study Streak</span>
                    <span className="font-bold text-accent">7 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Hours Completed</span>
                    <span className="font-bold text-primary">46h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Assignments Done</span>
                    <span className="font-bold text-secondary">12/20</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Course Progress</span>
                    <span className="font-bold text-slate-800">{currentEnrollment?.progress || 0}%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="ghost"
                    className="w-full justify-start bg-slate-50 hover:bg-slate-100"
                  >
                    <Download className="text-primary mr-3 h-4 w-4" />
                    Download Today's Material
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start bg-slate-50 hover:bg-slate-100"
                  >
                    <Upload className="text-secondary mr-3 h-4 w-4" />
                    Submit Assignment
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start bg-slate-50 hover:bg-slate-100"
                  >
                    <Calendar className="text-accent mr-3 h-4 w-4" />
                    View Schedule
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start bg-slate-50 hover:bg-slate-100"
                  >
                    <Tag className="text-warning mr-3 h-4 w-4" />
                    Check Certification
                  </Button>
                </CardContent>
              </Card>

              {/* Upcoming Deadlines */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Deadlines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-warning rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">Test Case Assignment</p>
                      <p className="text-xs text-slate-500">Due tomorrow</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-error rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">Module 2 Quiz</p>
                      <p className="text-xs text-slate-500">Due in 3 days</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">Automation Project</p>
                      <p className="text-xs text-slate-500">Due next week</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
