import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Admin from "@/pages/admin";
import AdminStudyMaterials from "@/pages/admin-study-materials";
import TutorDashboard from "@/pages/tutor-dashboard";
import NotFound from "@/pages/not-found";
import SignIn from "@/pages/signin";
import SignUp from "@/pages/signup";
import CourseGroups from "@/pages/course-groups";
import VideoCallPage from "@/pages/video-call";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import CookiePolicy from "@/pages/cookie-policy";
import HelpCenter from "@/pages/help-center";
import StudentSupport from "@/pages/student-support";
import TechnicalIssues from "@/pages/technical-issues";
import PaymentHelp from "@/pages/payment-help";
import FloatingChatButton from "@/components/floating-chat-button";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes - accessible to everyone */}
      <Route path="/" component={Landing} />
      <Route path="/signin" component={SignIn} />
      <Route path="/signup" component={SignUp} />
      <Route path="/courses" component={CourseGroups} />
      <Route path="/course-groups" component={CourseGroups} />
      <Route path="/video-call/:sessionId" component={VideoCallPage} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/cookie-policy" component={CookiePolicy} />
      <Route path="/help-center" component={HelpCenter} />
      <Route path="/student-support" component={StudentSupport} />
      <Route path="/technical-issues" component={TechnicalIssues} />
      <Route path="/payment-help" component={PaymentHelp} />
      
      {/* Protected routes - only for authenticated users */}
      <Route path="/dashboard" component={Dashboard} />
      {isAuthenticated && (user as any)?.role === 'admin' && (
        <>
          <Route path="/admin" component={Admin} />
          <Route path="/admin/study-materials" component={AdminStudyMaterials} />
          <Route path="/admin/courses" component={Admin} />
          <Route path="/admin/materials" component={Admin} />
          <Route path="/admin/tutors" component={Admin} />
          <Route path="/admin/users" component={Admin} />
          <Route path="/admin/enrollments" component={Admin} />
          <Route path="/admin/reviews" component={Admin} />
          <Route path="/admin/testimonials" component={Admin} />
          <Route path="/admin/faqs" component={Admin} />
          <Route path="/admin/enquiries" component={Admin} />
          <Route path="/admin/quiz" component={Admin} />
          <Route path="/admin/home" component={Admin} />
          <Route path="/admin/featured-courses" component={Admin} />
          <Route path="/admin/seo" component={Admin} />
          <Route path="/admin/ai-assistant" component={Admin} />
          <Route path="/admin/media" component={Admin} />
          <Route path="/admin/settings" component={Admin} />
        </>
      )}
      {isAuthenticated && (user as any)?.role === 'tutor' && (
        <Route path="/tutor-dashboard" component={TutorDashboard} />
      )}
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <FloatingChatButton />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
