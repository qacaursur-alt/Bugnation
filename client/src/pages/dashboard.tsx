import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProgressTracker } from "@/components/progress-tracker";
import { LiveSessionsCalendar } from "@/components/live-sessions-calendar";
import { VideoPlayer } from "@/components/video-player";
import { PDFViewer } from "@/components/pdf-viewer";
import { StudyPath } from "@/components/study-path";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoSession from "@/components/video-session";
import MaterialButton from "@/components/ui/material-button";
import LogoPreloader from "@/components/logo-preloader";
import StudentDashboard from "@/components/student-dashboard";
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
  FileText,
  Link as LinkIcon,
  Video,
  ExternalLink,
} from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isVideoSessionOpen, setIsVideoSessionOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation("/signin");
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery<any[]>({
    queryKey: ["/api/my-enrollments"],
    enabled: !!user,
    retry: false,
  });

  const { data: userGroups = [], isLoading: userGroupsLoading } = useQuery<any[]>({
    queryKey: ["/api/me/groups"],
    enabled: !!user,
    retry: false,
  });

  // Separate groups by status
  const pendingGroups = userGroups.filter((group: any) => group.status === 'pending');
  const approvedGroups = userGroups.filter((group: any) => group.status === 'approved');
  const activeGroups = userGroups.filter((group: any) => group.status === 'active');

  const activeGroupId = activeGroups[0]?.groupId as string | undefined;

  const { data: groupLearning = { paths: [], documents: {} } } = useQuery<any>({
    queryKey: ["/api/me/groups", activeGroupId, "learning"],
    queryFn: async () => {
      if (!activeGroupId) return { paths: [], documents: {} };
      const res = await fetch(`/api/me/groups/${activeGroupId}/learning`, { credentials: "include" });
      if (!res.ok) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to fetch learning content:', res.status, res.statusText);
        }
        return { paths: [], documents: {} };
      }
      return res.json();
    },
    enabled: !!activeGroupId,
    retry: false,
  });

  if (isLoading || enrollmentsLoading || userGroupsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LogoPreloader size="lg" />
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
              <a href="/" className="flex items-center">
                <img 
                  src="/attached_assets/New Project (4).png" 
                  alt="Debug Nation Logo" 
                  className="h-6 sm:h-8 w-auto brightness-0"
                />
              </a>
              <div className="hidden md:block ml-4 sm:ml-10">
                <div className="flex items-center space-x-3 lg:space-x-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLocation('/')}
                    className="text-slate-600 hover:text-primary text-xs sm:text-sm"
                  >
                    Home
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLocation('/course-groups')}
                    className="text-slate-600 hover:text-primary text-xs sm:text-sm"
                  >
                    Browse Courses
                  </Button>
                  {(user as any)?.role === 'admin' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLocation('/admin')}
                      className="text-slate-600 hover:text-primary text-xs sm:text-sm"
                    >
                      Admin
                    </Button>
                  )}
                </div>
              </div>
              <div className="hidden lg:block ml-4 sm:ml-10">
                <span className="text-slate-600 text-sm">Welcome back,</span>
                <span className="font-semibold ml-1 text-sm">
                  {(user as any)?.firstName} {(user as any)?.lastName}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <img
                  src={(user as any)?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"}
                  alt="Profile"
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => { await fetch('/api/auth/signout', { method: 'POST' }); setLocation('/'); }}
                  className="text-slate-600 hover:text-primary text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Sign Out</span>
                  <span className="sm:hidden">Out</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <StudentDashboard />
      </div>
      
      {/* Video Session Modal */}
      <VideoSession
        isOpen={isVideoSessionOpen}
        onClose={() => setIsVideoSessionOpen(false)}
        sessionTitle="Live Learning Session"
      />
    </div>
  );
}
