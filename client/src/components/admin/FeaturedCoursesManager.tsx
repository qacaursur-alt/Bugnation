import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Video, Save, RefreshCw } from "lucide-react";

interface CourseGroup {
  id: string;
  name: string;
  description: string;
  price: string;
  category: {
    name: string;
    type: string;
  };
  subcategory?: {
    name: string;
  };
  isActive: boolean;
}

interface FeaturedCoursesSettings {
  featuredCourseIds: string[];
  showFeaturedCourses: boolean;
}

export default function FeaturedCoursesManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [showFeatured, setShowFeatured] = useState(true);

  // Fetch all course groups
  const { data: courseGroups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ["/api/course-groups"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/course-groups");
      if (!response.ok) {
        throw new Error('Failed to fetch course groups');
      }
      return response.json();
    },
  });

  // Fetch current featured courses settings
  const { data: featuredSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/featured-courses"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/featured-courses");
      if (!response.ok) {
        throw new Error('Failed to fetch featured courses');
      }
      return response.json();
    },
  });

  // Update featured courses
  const updateFeaturedMutation = useMutation({
    mutationFn: async (data: FeaturedCoursesSettings) => {
      const response = await apiRequest("POST", "/api/admin/featured-courses", data);
      if (!response.ok) {
        throw new Error('Failed to update featured courses');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Featured courses updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/featured-courses"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update featured courses",
        variant: "destructive",
      });
    },
  });

  // Initialize selected courses when settings load
  React.useEffect(() => {
    if (featuredSettings && featuredSettings.length > 0) {
      const courseIds = featuredSettings.map((course: any) => course.id);
      setSelectedCourses(courseIds);
    }
  }, [featuredSettings]);

  const handleCourseToggle = (courseId: string) => {
    setSelectedCourses(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const handleSave = () => {
    updateFeaturedMutation.mutate({
      featuredCourseIds: selectedCourses,
      showFeaturedCourses: showFeatured,
    });
  };

  const handleReset = () => {
    if (featuredSettings && featuredSettings.length > 0) {
      const courseIds = featuredSettings.map((course: any) => course.id);
      setSelectedCourses(courseIds);
    } else {
      setSelectedCourses([]);
    }
  };

  if (groupsLoading || settingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading featured courses settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Featured Courses Manager</h2>
        <p className="text-slate-600">Choose which courses to showcase in the "Choose Your Learning Path" section on the home page</p>
      </div>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-featured"
              checked={showFeatured}
              onCheckedChange={(checked) => setShowFeatured(checked as boolean)}
            />
            <label htmlFor="show-featured" className="text-sm font-medium">
              Show featured courses on home page
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Course Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Select Featured Courses</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={updateFeaturedMutation.isPending}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateFeaturedMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {updateFeaturedMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Select up to 2 courses to feature in the main "Choose Your Learning Path" section. 
              These will be displayed prominently on the home page.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courseGroups.map((course: CourseGroup) => {
                const isSelected = selectedCourses.includes(course.id);
                const isLive = course.category?.type === 'live';
                
                return (
                  <div
                    key={course.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                        : 'border-slate-200 hover:border-slate-300'
                    } ${selectedCourses.length >= 2 && !isSelected ? 'opacity-50' : ''}`}
                    onClick={() => {
                      if (selectedCourses.length < 2 || isSelected) {
                        handleCourseToggle(course.id);
                      }
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => {
                          if (selectedCourses.length < 2 || isSelected) {
                            handleCourseToggle(course.id);
                          }
                        }}
                        disabled={selectedCourses.length >= 2 && !isSelected}
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isLive 
                              ? 'bg-warning/20 text-warning' 
                              : 'bg-primary/20 text-primary'
                          }`}>
                            {isLive ? (
                              <Video className="h-4 w-4" />
                            ) : (
                              <BookOpen className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{course.name}</h3>
                            <Badge variant={isLive ? "destructive" : "secondary"} className="text-xs">
                              {isLive ? 'Live Course' : 'Self-Paced'}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{course.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-green-600">₹{course.price}</span>
                          <span className="text-xs text-slate-500">
                            {course.category?.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedCourses.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Selected courses:</strong> {selectedCourses.length}/2
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedCourses.map(courseId => {
                    const course = courseGroups.find((c: CourseGroup) => c.id === courseId);
                    return course ? (
                      <Badge key={courseId} variant="outline" className="bg-white">
                        {course.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            This is how the featured courses will appear on the home page:
          </p>
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl">
            {selectedCourses.slice(0, 2).map(courseId => {
              const course = courseGroups.find((c: CourseGroup) => c.id === courseId);
              if (!course) return null;
              
              const isLive = course.category?.type === 'live';
              
              return (
                <div key={courseId} className="border rounded-lg p-4 bg-slate-50">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-6 h-6 rounded flex items-center justify-center ${
                      isLive 
                        ? 'bg-warning/20 text-warning' 
                        : 'bg-primary/20 text-primary'
                    }`}>
                      {isLive ? (
                        <Video className="h-3 w-3" />
                      ) : (
                        <BookOpen className="h-3 w-3" />
                      )}
                    </div>
                    <Badge className={`text-xs ${
                      isLive 
                        ? 'bg-warning text-white' 
                        : 'bg-primary text-white'
                    }`}>
                      {isLive ? 'PREMIUM LIVE' : 'SELF-PACED'}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">{course.name}</h3>
                  <p className="text-sm text-slate-600 mb-2">{course.description}</p>
                  <div className="text-lg font-bold text-green-600">₹{course.price}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
