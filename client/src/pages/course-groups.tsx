import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useState } from "react";
import { PaymentModal } from "../components/payment-modal";
import { EnrollmentConfirmationModal } from "../components/enrollment-confirmation-modal";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";

export default function CourseGroups() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    groupId: string;
    groupName: string;
    amount: number;
  }>({
    isOpen: false,
    groupId: '',
    groupName: '',
    amount: 0,
  });

  const [enrollmentModal, setEnrollmentModal] = useState<{
    isOpen: boolean;
    courseGroup: any;
    initialStudyPath?: "self-paced" | "premium-live";
  }>({
    isOpen: false,
    courseGroup: null,
    initialStudyPath: "self-paced",
  });

  const { data: groups, isLoading } = useQuery({
    queryKey: ["/api/course-groups"],
    queryFn: async () => {
      const response = await fetch('/api/course-groups');
      if (!response.ok) {
        throw new Error('Failed to fetch course groups');
      }
      return response.json();
    },
    enabled: true,
  });

  // Fetch user's existing enrollments to check if already enrolled
  const { data: userEnrollments = [] } = useQuery({
    queryKey: ["/api/my-enrollments"],
    queryFn: async () => {
      const response = await fetch('/api/my-enrollments');
      if (!response.ok) {
        throw new Error('Failed to fetch user enrollments');
      }
      return response.json();
    },
    enabled: !!(user as any)?.id,
  });

  const handlePurchase = (group: any) => {
    if (!isAuthenticated) {
      setLocation('/signin');
      return;
    }
    
    // Check if user is already enrolled in this course
    const isAlreadyEnrolled = userEnrollments.some((enrollment: any) => 
      enrollment.groupId === group.id
    );
    
    if (isAlreadyEnrolled) {
      // Show a message that they're already enrolled
      toast({
        title: "Already Enrolled",
        description: "You are already enrolled in this course. Check your dashboard for enrollment status.",
        variant: "destructive",
      });
      return;
    }
    
    // Determine the initial study path based on the group course type
    const initialStudyPath = group.courseType === 'live' ? 'premium-live' : 'self-paced';
    console.log("CourseGroups: Course type:", group.courseType, "Initial study path:", initialStudyPath);
    console.log("CourseGroups: Full group object:", group);
    
    // For logged-in users, show enrollment confirmation modal
    setEnrollmentModal({
      isOpen: true,
      courseGroup: {
        ...group,
        courseType: group.courseType, // Ensure courseType is explicitly passed
      },
      initialStudyPath,
    });
  };

  const handlePaymentSuccess = () => {
    // Invalidate all relevant queries to refresh data
    queryClient.invalidateQueries({ queryKey: ["/api/user/course-groups"] });
    queryClient.invalidateQueries({ queryKey: ["/api/my-enrollments"] });
    queryClient.invalidateQueries({ queryKey: ["/api/me/groups"] });
    
    // Show success message and redirect
    toast({
      title: "Payment Successful!",
      description: "You have been enrolled in the course. Redirecting to dashboard...",
    });
    
    setTimeout(() => {
      setLocation('/dashboard');
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading course groups...</div>
      </div>
    );
  }

  console.log('Course Groups Data:', groups);
  console.log('Is Loading:', isLoading);
  console.log('Groups Length:', groups?.length);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a href="/" className="flex items-center">
                <img 
                  src="/attached_assets/New Project (4).png" 
                  alt="Debug Nation Logo" 
                  className="h-8 w-auto brightness-0"
                />
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setLocation('/')}
                className="text-muted-foreground hover:text-foreground font-medium"
              >
                Home
              </Button>
              {isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => setLocation('/dashboard')}
                    className="text-muted-foreground hover:text-foreground font-medium"
                  >
                    Dashboard
                  </Button>
                  {(user as any)?.role === 'admin' && (
                    <Button
                      variant="ghost"
                      onClick={() => setLocation('/admin')}
                      className="text-muted-foreground hover:text-foreground font-medium"
                    >
                      Admin
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    onClick={async () => {
                      await fetch('/api/auth/signout', { method: 'POST' });
                      setLocation('/');
                    }}
                    className="text-muted-foreground hover:text-foreground font-medium"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => setLocation('/signin')}
                    className="text-muted-foreground hover:text-foreground font-medium"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => setLocation('/signup')}
                    className="bg-primary hover:bg-accent text-white font-medium"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Professional Banner Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="mb-8">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary/20 text-primary border border-primary/30">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Professional Software Testing Education
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
              Master Software Testing with{" "}
              <span className="text-primary">Debug Nation</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl lg:text-2xl text-slate-300 mb-12 leading-relaxed max-w-3xl mx-auto">
              Choose your learning path with flexible pricing options designed to match your career goals and schedule.
            </p>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="flex flex-col items-center p-6 bg-white/5 rounded-lg border border-white/10">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">Live Sessions</h3>
                <p className="text-slate-300 text-sm text-center">Interactive video calls with expert instructors</p>
              </div>

              <div className="flex flex-col items-center p-6 bg-white/5 rounded-lg border border-white/10">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">Self-Paced</h3>
                <p className="text-slate-300 text-sm text-center">Learn at your own pace with comprehensive materials</p>
              </div>

              <div className="flex flex-col items-center p-6 bg-white/5 rounded-lg border border-white/10">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">Certification</h3>
                <p className="text-slate-300 text-sm text-center">Industry-recognized certificates upon completion</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => document.getElementById('courses-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg font-semibold"
              >
                View Courses
              </Button>
              <button 
                onClick={() => setLocation('/signup')}
                className="border-2 border-white/30 text-white hover:bg-white/10 hover:text-white px-8 py-3 text-lg font-semibold bg-transparent rounded-lg transition-all duration-200 hover:border-white/50"
              >
                Get Started
              </button>
            </div>
      </div>
        </div>
      </section>

      {/* Available Course Groups */}
      <div id="courses-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {groups && Array.isArray(groups) && groups.length > 0 ? (
        <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Available Courses</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {groups.map((group: any) => (
              <Card key={group.id} className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-primary/50 bg-white">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent"></div>
                <CardHeader className="pb-4 pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className={`mb-3 font-bold text-xs px-3 py-1 ${
                        group.courseType === 'live' 
                          ? 'bg-warning text-white border-warning' 
                          : 'bg-primary text-white border-primary'
                      }`}>
                        {group.courseType === 'live' ? 'LIVE' : 'SELF-PACED'}
                      </Badge>
                      <CardTitle className="text-xl mb-2 text-foreground font-bold">{group.name}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                        {group.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">
                        ₹{group.price === "149.00" ? "149" : group.price}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        One-time payment
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground text-sm">What's included:</h4>
                      <ul className="text-xs space-y-1">
                        {group.features?.map((feature: string, index: number) => (
                          <li key={index} className="flex items-center">
                            <span className="text-success mr-2 font-bold">✓</span>
                            <span className="text-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button 
                      onClick={() => handlePurchase(group)}
                      className="w-full bg-primary hover:bg-primary/90 text-white py-3 text-sm font-semibold transition-all duration-200 hover:shadow-lg rounded-lg"
                    >
                      {group.price === "25000.00" ? "Book Live Sessions" : "Start Learning"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-foreground mb-4">No Courses Available</h2>
            <p className="text-muted-foreground">Check back later for new courses!</p>
        </div>
      )}
      </div>


      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal(prev => ({ ...prev, isOpen: false }))}
        groupId={paymentModal.groupId}
        groupName={paymentModal.groupName}
        amount={paymentModal.amount}
        onSuccess={handlePaymentSuccess}
      />

      <EnrollmentConfirmationModal
        key={`${enrollmentModal.courseGroup?.id}-${enrollmentModal.initialStudyPath}`}
        isOpen={enrollmentModal.isOpen}
        onClose={() => setEnrollmentModal(prev => ({ ...prev, isOpen: false }))}
        courseGroup={enrollmentModal.courseGroup}
        initialStudyPath={enrollmentModal.initialStudyPath}
      />
    </div>
  );
}
