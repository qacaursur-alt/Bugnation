import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, BookOpen, Video, Calendar, Users, FileText, Play } from "lucide-react";

interface CourseGroup {
  id: string;
  name: string;
  description: string;
  price: string;
  categoryId: string;
  categoryName: string;
  features: string[];
  difficulty: string;
  duration: number;
  maxStudents?: number;
  thumbnail?: string;
  isActive: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  courseId: string;
  isActive: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  courseGroupId: string;
  isActive: boolean;
}

export default function CourseManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("courses");
  const [selectedCourseGroup, setSelectedCourseGroup] = useState<CourseGroup | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isLiveCalendarDialogOpen, setIsLiveCalendarDialogOpen] = useState(false);

  // Fetch course groups
  const { data: courseGroups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ["/api/course-groups"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/course-groups");
      return response;
    },
  });

  // Fetch courses for selected group
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/courses", selectedCourseGroup?.id],
    queryFn: async () => {
      if (!selectedCourseGroup) return [];
      const response = await apiRequest("GET", `/api/courses?groupId=${selectedCourseGroup.id}`);
      return response;
    },
    enabled: !!selectedCourseGroup,
  });

  // Fetch modules for selected course
  const { data: modules = [], isLoading: modulesLoading } = useQuery({
    queryKey: ["/api/modules", selectedCourse?.id],
    queryFn: async () => {
      if (!selectedCourse) return [];
      const response = await apiRequest("GET", `/api/modules?courseId=${selectedCourse.id}`);
      return response.sort((a: Module, b: Module) => a.orderIndex - b.orderIndex);
    },
    enabled: !!selectedCourse,
  });

  // Create course group mutation
  const createCourseGroupMutation = useMutation({
    mutationFn: async (data: Partial<CourseGroup>) => {
      return await apiRequest("POST", "/api/admin/course-groups", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/course-groups"] });
      toast({ title: "Course group created successfully" });
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create course group",
        description: error?.message || "Unknown error occurred",
        variant: "destructive"
      });
    },
  });

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: async (data: Partial<Course>) => {
      return await apiRequest("POST", "/api/admin/courses", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses", selectedCourseGroup?.id] });
      toast({ title: "Course created successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create course",
        description: error?.message || "Unknown error occurred",
        variant: "destructive"
      });
    },
  });

  // Create module mutation
  const createModuleMutation = useMutation({
    mutationFn: async (data: Partial<Module>) => {
      return await apiRequest("POST", "/api/admin/modules", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/modules", selectedCourse?.id] });
      toast({ title: "Module created successfully" });
      setIsModuleDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create module",
        description: error?.message || "Unknown error occurred",
        variant: "destructive"
      });
    },
  });

  const handleCreateCourseGroup = (formData: FormData) => {
    const categoryId = formData.get("categoryId") as string;
    const isLiveCourse = categoryId === "dbe012db-3df5-472e-a283-991a779318ab"; // Premium Live Classes ID
    
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      categoryId: categoryId,
      features: (formData.get("features") as string).split("\n").filter(f => f.trim()),
      difficulty: formData.get("difficulty") as string,
      duration: parseInt(formData.get("duration") as string),
      maxStudents: isLiveCourse ? parseInt(formData.get("maxStudents") as string) : undefined,
      // For live courses, add batch timing info
      ...(isLiveCourse && {
        batchTimings: formData.get("batchTimings") as string,
        startDate: formData.get("startDate") as string,
        endDate: formData.get("endDate") as string,
      })
    };
    createCourseGroupMutation.mutate(data);
  };

  const handleCreateCourse = (formData: FormData) => {
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      courseGroupId: selectedCourseGroup?.id,
    };
    createCourseMutation.mutate(data);
  };

  const handleCreateModule = (formData: FormData) => {
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      courseId: selectedCourse?.id,
      orderIndex: modules.length + 1,
    };
    createModuleMutation.mutate(data);
  };

  const getCategoryName = (categoryId: string) => {
    const categoryMap: { [key: string]: string } = {
      "c917e560-5c4e-41cb-a2eb-571420a45647": "Self-Paced Learning",
      "dbe012db-3df5-472e-a283-991a779318ab": "Premium Live Classes",
    };
    return categoryMap[categoryId] || "Unknown";
  };

  const isLiveCourse = (categoryId: string) => {
    return categoryId === "dbe012db-3df5-472e-a283-991a779318ab";
  };

  if (groupsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Course Management</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Course Group
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Course Group</DialogTitle>
            </DialogHeader>
            <form action={handleCreateCourseGroup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Course Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input id="price" name="price" type="number" step="0.01" required />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={3} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="categoryId">Category</Label>
                  <Select name="categoryId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="c917e560-5c4e-41cb-a2eb-571420a45647">Self-Paced Learning</SelectItem>
                      <SelectItem value="dbe012db-3df5-472e-a283-991a779318ab">Premium Live Classes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select name="difficulty" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (hours)</Label>
                  <Input id="duration" name="duration" type="number" required />
                </div>
                <div>
                  <Label htmlFor="maxStudents">Max Students (for live courses)</Label>
                  <Input id="maxStudents" name="maxStudents" type="number" />
                </div>
              </div>
              <div>
                <Label htmlFor="features">What's included (one per line)</Label>
                <Textarea 
                  id="features" 
                  name="features" 
                  rows={4} 
                  placeholder="Lifetime access&#10;Certificate of completion&#10;Hands-on projects&#10;24/7 support&#10;Study materials" 
                />
                <p className="text-xs text-slate-500 mt-1">
                  List the key features and benefits students will get with this course
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createCourseGroupMutation.isPending}>
                  {createCourseGroupMutation.isPending ? "Creating..." : "Create Course Group"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="courses">Course Groups</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="live-calendar">Live Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courseGroups.map((group: CourseGroup) => (
              <Card 
                key={group.id} 
                className={`cursor-pointer hover:shadow-lg transition-shadow ${
                  selectedCourseGroup?.id === group.id ? 'border-primary ring-2 ring-primary/50' : ''
                }`}
                onClick={() => setSelectedCourseGroup(group)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <Badge variant={isLiveCourse(group.categoryId) ? "default" : "secondary"}>
                      {getCategoryName(group.categoryId)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 text-sm mb-3 line-clamp-2">{group.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Price:</span>
                      <span className="font-semibold">₹{group.price}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Duration:</span>
                      <span>{group.duration} hours</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Difficulty:</span>
                      <span className="capitalize">{group.difficulty}</span>
                    </div>
                    {group.maxStudents && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Max Students:</span>
                        <span>{group.maxStudents}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCourseGroup(group);
                        setActiveTab("modules");
                      }}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Manage Modules
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="modules" className="space-y-4">
          {selectedCourseGroup ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Modules for {selectedCourseGroup.name}</h3>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("live-calendar")}
                    disabled={!isLiveCourse(selectedCourseGroup.categoryId)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Live Calendar
                  </Button>
                  <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Module
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Module</DialogTitle>
                      </DialogHeader>
                      <form action={handleCreateModule} className="space-y-4">
                        <div>
                          <Label htmlFor="title">Module Title</Label>
                          <Input id="title" name="title" required />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea id="description" name="description" rows={3} />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsModuleDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createModuleMutation.isPending}>
                            {createModuleMutation.isPending ? "Creating..." : "Create Module"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {modulesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {modules.map((module: Module) => (
                    <Card key={module.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center justify-between">
                          {module.title}
                          <Badge variant="outline">Module {module.orderIndex}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-600 text-sm mb-3 line-clamp-2">{module.description}</p>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-1" />
                            Content
                          </Button>
                          <Button variant="outline" size="sm">
                            <Play className="h-4 w-4 mr-1" />
                            Quiz
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Select a course group to manage modules</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="live-calendar" className="space-y-4">
          {selectedCourseGroup && isLiveCourse(selectedCourseGroup.categoryId) ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Live Calendar for {selectedCourseGroup.name}</h3>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Class
                </Button>
              </div>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">Live calendar management coming soon...</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Video className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Select a live course to manage calendar</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
