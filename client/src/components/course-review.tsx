import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Star, Send, ThumbsUp, MessageCircle, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface CourseReviewProps {
  groupId: string;
  userId: string;
}

interface Review {
  id: string;
  userId: string;
  groupId: string;
  rating: number;
  title: string;
  comment: string;
  userName: string;
  userEmail: string;
  createdAt: string;
  isApproved: boolean;
  helpfulCount: number;
}

export function CourseReview({ groupId, userId }: CourseReviewProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews", groupId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/reviews?groupId=${groupId}`);
      return response;
    },
    enabled: !!groupId,
  });

  const { data: userReview } = useQuery<Review>({
    queryKey: ["/api/reviews/user", groupId, userId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/reviews/user?groupId=${groupId}&userId=${userId}`);
      return response;
    },
    enabled: !!groupId && !!userId,
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData: {
      groupId: string;
      userId: string;
      rating: number;
      title: string;
      comment: string;
    }) => {
      return apiRequest("POST", "/api/reviews", reviewData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews", groupId] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/user", groupId, userId] });
      setRating(0);
      setTitle("");
      setComment("");
      toast({
        title: "Review submitted",
        description: "Your review has been submitted for approval.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    },
  });

  const helpfulMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      return apiRequest("POST", `/api/reviews/${reviewId}/helpful`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews", groupId] });
    },
  });

  const handleSubmitReview = async () => {
    if (!rating || !title.trim() || !comment.trim()) {
      toast({
        title: "Please fill all fields",
        description: "Rating, title, and comment are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitReviewMutation.mutateAsync({
        groupId,
        userId,
        rating,
        title: title.trim(),
        comment: comment.trim(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHelpful = (reviewId: string) => {
    helpfulMutation.mutate(reviewId);
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const approvedReviews = reviews.filter(review => review.isApproved);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Course Reviews</h2>
        <p className="text-slate-600">Share your experience and read what others think</p>
      </div>

      {/* Rating Summary */}
      {approvedReviews.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">{averageRating.toFixed(1)}</div>
                <div className="flex items-center justify-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(averageRating)
                          ? "text-yellow-400 fill-current"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  Based on {approvedReviews.length} review{approvedReviews.length !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="flex-1">
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = approvedReviews.filter(r => r.rating === star).length;
                    const percentage = approvedReviews.length > 0 ? (count / approvedReviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center space-x-2">
                        <span className="text-sm w-8">{star}</span>
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <div className="flex-1 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-600 w-8">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Review Form */}
      {!userReview ? (
        <Card>
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="rating">Rating *</Label>
              <div className="flex items-center space-x-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= rating
                          ? "text-yellow-400 fill-current"
                          : "text-slate-300 hover:text-yellow-400"
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-sm text-slate-600">
                    {rating} star{rating !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="title">Review Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your experience"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="comment">Your Review *</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your detailed experience with this course..."
                className="mt-2"
                rows={4}
              />
            </div>

            <Button
              onClick={handleSubmitReview}
              disabled={isSubmitting || !rating || !title.trim() || !comment.trim()}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-green-600">
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">Your Review</span>
              <Badge variant={userReview.isApproved ? "default" : "secondary"}>
                {userReview.isApproved ? "Approved" : "Pending Approval"}
              </Badge>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= userReview.rating
                          ? "text-yellow-400 fill-current"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium">{userReview.title}</span>
              </div>
              <p className="text-slate-600">{userReview.comment}</p>
              <p className="text-sm text-slate-500">
                Submitted on {new Date(userReview.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-slate-600 mt-2">Loading reviews...</p>
        </div>
      ) : approvedReviews.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Reviews ({approvedReviews.length})
          </h3>
          {approvedReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{review.userName}</div>
                      <div className="flex items-center space-x-2">
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleHelpful(review.id)}
                    className="flex items-center space-x-1"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>{review.helpfulCount}</span>
                  </Button>
                </div>
                <h4 className="font-medium text-slate-900 mb-2">{review.title}</h4>
                <p className="text-slate-600">{review.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Reviews Yet</h3>
            <p className="text-slate-600">Be the first to share your experience!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
