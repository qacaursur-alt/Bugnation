import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import FileUpload from "@/components/file-upload";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import HomeContentManager from "@/components/admin/HomeContentManager";
import TestimonialsManager from "@/components/admin/TestimonialsManager";
import UsersManager from "@/components/admin/UsersManager";
import SEOManager from "@/components/admin/SEOManager";
import FAQManager from "@/components/admin/FAQManager";
import EnquiryManager from "@/components/admin/EnquiryManager";
import EnrollmentsManager from "@/components/admin/EnrollmentsManager";
import ReviewsManager from "@/components/admin/ReviewsManager";
import CourseManager from "@/components/admin/CourseManager";
import CourseManagement from "@/components/admin/CourseManagement";
import CourseManagementNew from "@/components/admin/CourseManagementNew";
import CourseManagementTest from "@/components/admin/CourseManagementTest";
import CourseManagementSimple from "@/components/admin/CourseManagementSimple";
import CourseManagementDebug from "@/components/admin/CourseManagementDebug";
import QuizManager from "@/components/admin/QuizManager";
import TutorManager from "@/components/admin/TutorManager";
import AIAdminAssistant from "@/components/admin/AIAdminAssistant";
import FeaturedCoursesManager from "@/components/admin/FeaturedCoursesManager";
import SettingsManager from "@/components/admin/SettingsManager";
import {
  Users,
  MessageSquare,
  MessageCircle,
  BookOpen,
  CheckCircle,
  Clock,
  X,
  Layers,
  FileText,
  Calendar,
  Upload,
  DollarSign,
  Video,
  Link,
  Home,
  Star,
  HelpCircle,
  Search,
  Bot,
  Filter,
  Settings,
  Image,
  Edit,
  Trash2,
  Plus,
  Eye,
  Save,
  Menu,
  X as CloseIcon,
  ChevronLeft,
  ChevronRight,
  Globe,
  Tag,
  Type,
  Palette,
  Layout,
  Database,
  BarChart3,
  UserPlus,
  Shield,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
} from "lucide-react";

// Sidebar Component
function AdminSidebar({ isOpen, onToggle, activeTab, onTabChange }: {
  isOpen: boolean;
  onToggle: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  const [, setLocation] = useLocation();
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot },
    { id: 'enrollments', label: 'Enrollments', icon: CheckCircle },
    { id: 'reviews', label: 'Reviews', icon: MessageCircle },
    { id: 'home', label: 'Home Page', icon: Home },
    { id: 'featured-courses', label: 'Featured Courses', icon: Star },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'testimonials', label: 'Testimonials', icon: Star },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle },
    { id: 'enquiries', label: 'Enquiries', icon: Mail },
    { id: 'quiz', label: 'Quiz Management', icon: HelpCircle },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'tutors', label: 'Tutor Management', icon: Users },
    { id: 'media', label: 'Media Library', icon: Image },
    { id: 'seo', label: 'SEO & Meta', icon: Globe },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

    return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white border-r border-slate-200 z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        w-64
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <img 
                src="/attached_assets/New Project (4).png" 
                alt="Debug Nation Logo" 
                className="h-8 w-8 brightness-0"
              />
              <span className="font-bold text-lg">Admin Panel</span>
            </div>
              <Button
                variant="ghost"
                size="sm"
              onClick={onToggle}
              className="lg:hidden h-4 w-4 p-0"
              >
              <CloseIcon className="h-3 w-3" />
              </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'overview') {
                      setLocation('/admin');
                    } else {
                      setLocation(`/admin/${item.id}`);
                    }
                    onTabChange(item.id);
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors text-sm
                    ${activeTab === item.id 
                      ? 'bg-primary text-white' 
                      : 'text-slate-600 hover:bg-slate-100'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200">
            <div className="text-xs text-slate-500">
              Debug Nation Admin v2.0
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Overview Dashboard Component
function OverviewDashboard({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { data: stats, isLoading, error } = useQuery<{
    totalUsers: number;
    totalCourses: number;
    totalTestimonials: number;
    totalEnrollments: number;
    pendingEnrollments: number;
    activeUsers: number;
    totalRevenue: number;
    totalReviews: number;
    totalFAQs: number;
    recentEnrollments: any[];
  }>({
    queryKey: ["/api/admin/stats"],
  });

  // Debug logging
  console.log('Admin stats:', { stats, isLoading, error });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Dashboard Overview</h2>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Dashboard Overview</h2>
          <p className="text-red-600">Error loading stats: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Dashboard Overview</h2>
        <p className="text-slate-600">Welcome to the Debug Nation admin panel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('users')}>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-600">Total Users</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.totalUsers || 0}</p>
                <p className="text-xs text-slate-500">{stats?.activeUsers || 0} active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('courses')}>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-600">Courses</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.totalCourses || 0}</p>
                <p className="text-xs text-slate-500">Self-Paced & Live</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('enrollments')}>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-600">Enrollments</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.totalEnrollments || 0}</p>
                <p className="text-xs text-orange-600">{stats?.pendingEnrollments || 0} pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('reviews')}>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-600">Reviews</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.totalTestimonials || 0}</p>
                <p className="text-xs text-slate-500">Student feedback</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Revenue Card */}
      {stats?.totalRevenue && stats.totalRevenue > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-slate-500">From course enrollments</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                className="h-20 flex flex-col space-y-2"
                onClick={() => setActiveTab('courses')}
              >
                <Plus className="h-6 w-6" />
                <span>Add Course</span>
              </Button>
              <Button
                variant="outline" 
                className="h-20 flex flex-col space-y-2"
                onClick={() => setActiveTab('enrollments')}
              >
                <CheckCircle className="h-6 w-6" />
                <span>Review Enrollments</span>
              </Button>
              <Button
                variant="outline" 
                className="h-20 flex flex-col space-y-2"
                onClick={() => setActiveTab('reviews')}
              >
                <Star className="h-6 w-6" />
                <span>Manage Reviews</span>
              </Button>
              <Button
                variant="outline" 
                className="h-20 flex flex-col space-y-2"
                onClick={() => setActiveTab('users')}
              >
                <Users className="h-6 w-6" />
                <span>Manage Users</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentEnrollments && stats.recentEnrollments.length > 0 ? (
              <div className="space-y-3">
                {stats.recentEnrollments.slice(0, 5).map((enrollment: any) => (
                  <div key={enrollment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{enrollment.user?.firstName} {enrollment.user?.lastName}</p>
                      <p className="text-xs text-slate-600">{enrollment.courseGroup?.name}</p>
                    </div>
                    <Badge variant={enrollment.status === 'approved' ? 'default' : 'secondary'}>
                      {enrollment.status}
                    </Badge>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => setActiveTab('enrollments')}
                >
                  View All Enrollments
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No recent enrollments</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Main Admin Component
export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');


  // Set active tab based on URL path
  useEffect(() => {
    const path = location;
    if (path === '/admin') {
      setActiveTab('overview');
    } else if (path.startsWith('/admin/')) {
      const tab = path.replace('/admin/', '');
      setActiveTab(tab);
    }
  }, [location]);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/signin';
      return;
    }
    if (user && (user as any).role !== 'admin') {
      window.location.href = '/dashboard';
      return;
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated || (user as any)?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Access Denied</h1>
          <p className="text-slate-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    try {
      switch (activeTab) {
        case 'overview':
          return <OverviewDashboard setActiveTab={setActiveTab} />;
        case 'ai-assistant':
          return <AIAdminAssistant />;
        case 'enrollments':
          return <EnrollmentsManager />;
        case 'reviews':
          return <ReviewsManager />;
        case 'home':
          return <HomeContentManager />;
        case 'featured-courses':
          return <FeaturedCoursesManager />;
        case 'courses':
          console.log('Rendering CourseManagementSimple component');
          return (
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Course Management</h2>
              <p className="text-slate-600 mb-4">Testing courses section...</p>
              <div className="bg-yellow-100 p-4 rounded mb-4">
                <p className="text-yellow-800">Debug: CourseManagementSimple component should render below</p>
                <p className="text-yellow-800">Current time: {new Date().toLocaleTimeString()}</p>
              </div>
              <div className="bg-green-100 p-4 rounded mb-4">
                <p className="text-green-800">Simple test component - if you see this, basic rendering works</p>
              </div>
              <CourseManagementSimple />
            </div>
          );
        case 'testimonials':
          return <TestimonialsManager />;
        case 'faqs':
          return <FAQManager />;
        case 'enquiries':
          return <EnquiryManager />;
        case 'quiz':
          return <QuizManager />;
        case 'users':
          return <UsersManager />;
        case 'tutors':
          return <TutorManager />;
        case 'media':
          return (
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Media Library</h2>
              <p className="text-slate-600">Media library management is coming soon.</p>
            </div>
          );
        case 'seo':
          return <SEOManager />;
        case 'settings':
          return <SettingsManager />;
        default:
          return (
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Section Not Available</h2>
              <p className="text-slate-600 mb-4">This section is not implemented yet.</p>
              <OverviewDashboard setActiveTab={setActiveTab} />
            </div>
          );
      }
    } catch (error) {
      console.error('Error rendering admin content:', error);
      return (
        <div className="p-6">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Component</h2>
          <p className="text-slate-600">There was an error loading the {activeTab} component.</p>
          <pre className="mt-4 p-4 bg-red-50 rounded text-sm">{error instanceof Error ? error.message : String(error)}</pre>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Mobile Header */}
          <div className="lg:hidden bg-white border-b border-slate-200 px-2 py-1">
            <div className="flex items-center justify-between">
                      <Button 
                variant="ghost"
                          size="sm"
                onClick={() => setSidebarOpen(true)}
                        className="h-6 w-6 p-0"
                        >
                <Menu className="h-3 w-3" />
                        </Button>
                  <div className="flex items-center space-x-1">
                <img 
                  src="/attached_assets/New Project (4).png" 
                  alt="Debug Nation Logo" 
                  className="h-4 w-4 brightness-0"
                />
                <span className="font-semibold text-sm">Admin</span>
                  </div>
                </div>
              </div>

          {/* Content Area */}
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
