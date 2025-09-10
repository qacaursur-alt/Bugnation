import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, 
  CheckCircle, 
  XCircle, 
  MessageCircle, 
  User, 
  Calendar,
  ThumbsUp,
  Edit,
  Trash2,
  Plus
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface Review {
  id: string;
  groupId: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  userName: string;
  userEmail: string;
  createdAt: string;
  isApproved: boolean;
  helpfulCount: number;
  courseGroup?: {
    id: string;
    name: string;
  };
}

interface Testimonial {
  id: string;
  studentName: string;
  studentRole: string;
  courseName: string;
  testimonial: string;
  rating: number;
  isApproved: boolean;
  createdAt: string;
}

export default function ReviewsManager() {
  const [selectedTab, setSelectedTab] = useState("reviews");
  const [isAddingTestimonial, setIsAddingTestimonial] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({
    studentName: "",
    studentRole: "",
    courseName: "",
    testimonial: "",
    rating: 5,
  });
  const queryClient = useQueryClient();

  const { data: reviewsData, isLoading: reviewsLoading, error: reviewsError } = useQuery({
    queryKey: ["/api/admin/reviews"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/admin/reviews");
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error fetching reviews:', error);
        return [];
      }
    },
  });

  // Ensure reviews is always an array
  const reviews = Array.isArray(reviewsData) ? reviewsData : [];

  const { data: testimonialsData, isLoading: testimonialsLoading, error: testimonialsError } = useQuery({
    queryKey: ["/api/admin/testimonials"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/admin/testimonials");
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        return [];
      }
    },
  });

  // Ensure testimonials is always an array
  const testimonials = Array.isArray(testimonialsData) ? testimonialsData : [];

  const approveReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      return apiRequest("POST", `/api/admin/reviews/${reviewId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      toast({ title: "Review approved successfully" });
    },
  });

  const rejectReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      return apiRequest("POST", `/api/admin/reviews/${reviewId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      toast({ title: "Review rejected" });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      return apiRequest("DELETE", `/api/admin/reviews/${reviewId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      toast({ title: "Review deleted successfully" });
    },
  });

  const approveTestimonialMutation = useMutation({
    mutationFn: async (testimonialId: string) => {
      return apiRequest("POST", `/api/admin/testimonials/${testimonialId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      toast({ title: "Testimonial approved successfully" });
    },
  });

  const rejectTestimonialMutation = useMutation({
    mutationFn: async (testimonialId: string) => {
      return apiRequest("POST", `/api/admin/testimonials/${testimonialId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      toast({ title: "Testimonial rejected" });
    },
  });

  const addTestimonialMutation = useMutation({
    mutationFn: async (testimonialData: typeof newTestimonial) => {
      return apiRequest("POST", "/api/admin/testimonials", testimonialData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      setNewTestimonial({
        studentName: "",
        studentRole: "",
        courseName: "",
        testimonial: "",
        rating: 5,
      });
      setIsAddingTestimonial(false);
      toast({ title: "Testimonial added successfully" });
    },
  });

  const handleAddTestimonial = () => {
    if (!newTestimonial.studentName || !newTestimonial.testimonial) {
      toast({
        title: "Please fill required fields",
        description: "Student name and testimonial are required.",
        variant: "destructive",
      });
      return;
    }
    addTestimonialMutation.mutate(newTestimonial);
  };

  // Add error handling (only show error if both queries fail)
  if (reviewsError && testimonialsError) {
    console.error('Error loading reviews/testimonials:', { reviewsError, testimonialsError });
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Data</h3>
          <p className="text-slate-600">
            {reviewsError?.message || testimonialsError?.message || "Failed to load reviews and testimonials"}
          </p>
        </div>
      </div>
    );
  }

  // Add loading state
  if (reviewsLoading || testimonialsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pendingReviews = reviews.filter(review => !review.isApproved);
  const approvedReviews = reviews.filter(review => review.isApproved);
  const pendingTestimonials = testimonials.filter(testimonial => !testimonial.isApproved);
  const approvedTestimonials = testimonials.filter(testimonial => testimonial.isApproved);

  // Debug logging
  console.log('ReviewsManager rendering with:', { 
    reviews, 
    testimonials, 
    reviewsLength: reviews.length,
    testimonialsLength: testimonials.length,
    reviewsLoading, 
    testimonialsLoading,
    reviewsError,
    testimonialsError
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Reviews & Testimonials</h2>
        <p className="text-slate-600">Manage student reviews and testimonials</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-6">
          {/* Reviews Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <MessageCircle className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Total Reviews</p>
                    <p className="text-2xl font-bold text-slate-900">{reviews.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Approved</p>
                    <p className="text-2xl font-bold text-slate-900">{approvedReviews.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <XCircle className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Pending</p>
                    <p className="text-2xl font-bold text-slate-900">{pendingReviews.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Reviews */}
          {pendingReviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <XCircle className="h-5 w-5 mr-2 text-orange-600" />
                  Pending Reviews ({pendingReviews.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingReviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{review.userName}</div>
                          <div className="text-sm text-slate-600">{review.userEmail}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= review.rating
                                      ? "text-yellow-400 fill-current"
                                      : "text-slate-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-slate-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => approveReviewMutation.mutate(review.id)}
                          disabled={approveReviewMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectReviewMutation.mutate(review.id)}
                          disabled={rejectReviewMutation.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteReviewMutation.mutate(review.id)}
                          disabled={deleteReviewMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 mb-1">{review.title}</h4>
                      <p className="text-slate-600">{review.comment}</p>
                    </div>
                    {review.courseGroup && (
                      <Badge variant="outline">{review.courseGroup.name}</Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Approved Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Approved Reviews ({approvedReviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {approvedReviews.length > 0 ? (
                approvedReviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{review.userName}</div>
                          <div className="text-sm text-slate-600">{review.userEmail}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= review.rating
                                      ? "text-yellow-400 fill-current"
                                      : "text-slate-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-slate-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                            <Badge variant="outline" className="text-green-600">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              {review.helpfulCount} helpful
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteReviewMutation.mutate(review.id)}
                        disabled={deleteReviewMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 mb-1">{review.title}</h4>
                      <p className="text-slate-600">{review.comment}</p>
                    </div>
                    {review.courseGroup && (
                      <Badge variant="outline">{review.courseGroup.name}</Badge>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No approved reviews yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials" className="space-y-6">
          {/* Testimonials Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Star className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Total Testimonials</p>
                    <p className="text-2xl font-bold text-slate-900">{testimonials.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Approved</p>
                    <p className="text-2xl font-bold text-slate-900">{approvedTestimonials.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <XCircle className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Pending</p>
                    <p className="text-2xl font-bold text-slate-900">{pendingTestimonials.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add Testimonial */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add New Testimonial</CardTitle>
                <Button
                  onClick={() => setIsAddingTestimonial(!isAddingTestimonial)}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isAddingTestimonial ? "Cancel" : "Add Testimonial"}
                </Button>
              </div>
            </CardHeader>
            {isAddingTestimonial && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="studentName">Student Name *</Label>
                    <Input
                      id="studentName"
                      value={newTestimonial.studentName}
                      onChange={(e) => setNewTestimonial(prev => ({ ...prev, studentName: e.target.value }))}
                      placeholder="Enter student name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="studentRole">Student Role</Label>
                    <Input
                      id="studentRole"
                      value={newTestimonial.studentRole}
                      onChange={(e) => setNewTestimonial(prev => ({ ...prev, studentRole: e.target.value }))}
                      placeholder="e.g., Software Engineer"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="courseName">Course Name</Label>
                  <Input
                    id="courseName"
                    value={newTestimonial.courseName}
                    onChange={(e) => setNewTestimonial(prev => ({ ...prev, courseName: e.target.value }))}
                    placeholder="Enter course name"
                  />
                </div>
                <div>
                  <Label htmlFor="testimonial">Testimonial *</Label>
                  <Textarea
                    id="testimonial"
                    value={newTestimonial.testimonial}
                    onChange={(e) => setNewTestimonial(prev => ({ ...prev, testimonial: e.target.value }))}
                    placeholder="Enter testimonial text"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="rating">Rating</Label>
                  <div className="flex items-center space-x-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewTestimonial(prev => ({ ...prev, rating: star }))}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= newTestimonial.rating
                              ? "text-yellow-400 fill-current"
                              : "text-slate-300 hover:text-yellow-400"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={handleAddTestimonial}
                  disabled={addTestimonialMutation.isPending}
                >
                  {addTestimonialMutation.isPending ? "Adding..." : "Add Testimonial"}
                </Button>
              </CardContent>
            )}
          </Card>

          {/* Pending Testimonials */}
          {pendingTestimonials.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <XCircle className="h-5 w-5 mr-2 text-orange-600" />
                  Pending Testimonials ({pendingTestimonials.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingTestimonials.map((testimonial) => (
                  <div key={testimonial.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-slate-900">{testimonial.studentName}</div>
                        {testimonial.studentRole && (
                          <div className="text-sm text-slate-600">{testimonial.studentRole}</div>
                        )}
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= testimonial.rating
                                    ? "text-yellow-400 fill-current"
                                    : "text-slate-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-slate-500">
                            {new Date(testimonial.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => approveTestimonialMutation.mutate(testimonial.id)}
                          disabled={approveTestimonialMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectTestimonialMutation.mutate(testimonial.id)}
                          disabled={rejectTestimonialMutation.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-600 italic">"{testimonial.testimonial}"</p>
                    </div>
                    {testimonial.courseName && (
                      <Badge variant="outline">{testimonial.courseName}</Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Approved Testimonials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Approved Testimonials ({approvedTestimonials.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {approvedTestimonials.length > 0 ? (
                approvedTestimonials.map((testimonial) => (
                  <div key={testimonial.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-slate-900">{testimonial.studentName}</div>
                        {testimonial.studentRole && (
                          <div className="text-sm text-slate-600">{testimonial.studentRole}</div>
                        )}
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= testimonial.rating
                                    ? "text-yellow-400 fill-current"
                                    : "text-slate-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-slate-500">
                            {new Date(testimonial.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectTestimonialMutation.mutate(testimonial.id)}
                        disabled={rejectTestimonialMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                    <div>
                      <p className="text-slate-600 italic">"{testimonial.testimonial}"</p>
                    </div>
                    {testimonial.courseName && (
                      <Badge variant="outline">{testimonial.courseName}</Badge>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No approved testimonials yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
