import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Users,
  MessageSquare,
  BookOpen,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";

export default function Admin() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user as any)?.role !== 'admin')) {
      toast({
        title: "Unauthorized",
        description: "Admin access required. Redirecting...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: enquiries = [], isLoading: enquiriesLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/enquiries"],
    enabled: !!user && (user as any)?.role === 'admin',
    retry: false,
  });

  const activateEnquiryMutation = useMutation({
    mutationFn: async (enquiryId: string) => {
      await apiRequest("POST", `/api/admin/enquiries/${enquiryId}/activate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/enquiries"] });
      toast({
        title: "Success",
        description: "Enquiry activated and enrollment created",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to activate enquiry",
        variant: "destructive",
      });
    },
  });

  if (isLoading || enquiriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pendingEnquiries = enquiries.filter(e => e.status === 'pending');
  const activeEnquiries = enquiries.filter(e => e.status === 'activated');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary">TestAcademy Pro</h1>
              <Badge className="ml-4 bg-purple-600 text-white">Admin Panel</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-slate-600">
                Welcome, <span className="font-semibold">{(user as any)?.firstName}</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/'}
                className="text-slate-600 hover:text-primary"
              >
                Dashboard
              </Button>
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

      {/* Admin Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary rounded-lg">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Pending Enquiries</p>
                  <p className="text-2xl font-bold text-slate-800">{pendingEnquiries.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-accent rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Active Students</p>
                  <p className="text-2xl font-bold text-slate-800">{activeEnquiries.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-secondary rounded-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Courses</p>
                  <p className="text-2xl font-bold text-slate-800">6</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-warning rounded-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Completions</p>
                  <p className="text-2xl font-bold text-slate-800">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Admin Tabs */}
        <Tabs defaultValue="enquiries" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="enquiries">Enquiries</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>

          {/* Enquiries Tab */}
          <TabsContent value="enquiries" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Enquiries</CardTitle>
              </CardHeader>
              <CardContent>
                {enquiries.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No enquiries yet</p>
                ) : (
                  <div className="space-y-4">
                    {enquiries.map((enquiry) => (
                      <div
                        key={enquiry.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              <h3 className="font-semibold text-slate-800">{enquiry.fullName}</h3>
                              <Badge
                                variant={enquiry.status === 'pending' ? 'destructive' : 'default'}
                                className={
                                  enquiry.status === 'pending' 
                                    ? 'bg-warning text-white' 
                                    : 'bg-accent text-white'
                                }
                              >
                                {enquiry.status === 'pending' ? 'Pending' : 'Activated'}
                              </Badge>
                            </div>
                            <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-600">
                              <p><strong>Email:</strong> {enquiry.email}</p>
                              <p><strong>Phone:</strong> {enquiry.phone}</p>
                              <p><strong>Course ID:</strong> {enquiry.courseId}</p>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                              Submitted: {new Date(enquiry.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {enquiry.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => activateEnquiryMutation.mutate(enquiry.id)}
                                disabled={activateEnquiryMutation.isPending}
                                className="bg-accent hover:bg-green-600 text-white"
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Activate
                              </Button>
                              <Button variant="outline" size="sm">
                                Send Payment Info
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Students</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-slate-500 py-8">
                  Student management features coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Course Management</CardTitle>
                  <Button className="bg-primary hover:bg-blue-700 text-white">
                    Add New Course
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-center text-slate-500 py-8">
                  Course management features coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assignment Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-slate-500 py-8">
                  Assignment review features coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
