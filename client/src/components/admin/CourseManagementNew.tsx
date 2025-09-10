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
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen, 
  Video, 
  Calendar, 
  Users, 
  FileText, 
  Play,
  Clock,
  DollarSign,
  Settings,
  Upload,
  Link as LinkIcon
} from "lucide-react";

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
  courseType: string;
  isLiveCourse: boolean;
  batchTimings?: string;
  googleMeetLink?: string;
  startDate?: string;
  endDate?: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  courseGroupId: string;
  isActive: boolean;
  requiresQuiz: boolean;
  quizRequiredToUnlock: boolean;
  passingScore: number;
  maxAttempts: number;
  unlockMessage: string;
}

interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: string;
  fileUrl?: string;
  externalUrl?: string;
  orderIndex: number;
  isRequired: boolean;
  isActive: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  type: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
  orderIndex: number;
}

interface LiveSession {
  id: string;
  title: string;
  description: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  googleMeetLink: string;
  moduleId: string;
  isActive: boolean;
}

export default function CourseManagementNew() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("courses");
  const [selectedCourseGroup, setSelectedCourseGroup] = useState<CourseGroup | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
  const [isLiveCalendarDialogOpen, setIsLiveCalendarDialogOpen] = useState(false);

  console.log('CourseManagementNew component rendering');

  // Fetch course groups
  const { data: courseGroups = [], isLoading: groupsLoading, error: groupsError } = useQuery({
    queryKey: ["/api/course-groups"],
    queryFn: async () => {
      console.log('Fetching course groups...');
      const response = await apiRequest("GET", "/api/course-groups");
      console.log('Course groups response:', response);
      return response;
    },
  });

  console.log('Course groups state:', { courseGroups, groupsLoading, groupsError });

  // Fetch modules for selected course group
  const { data: modules = [], isLoading: modulesLoading } = useQuery({
    queryKey: ["/api/modules", selectedCourseGroup?.id],
    queryFn: async () => {
      if (!selectedCourseGroup) return [];
      const response = await apiRequest("GET", `/api/modules?courseGroupId=${selectedCourseGroup.id}`);
      return response.sort((a: Module, b: Module) => a.orderIndex - b.orderIndex);
    },
    enabled: !!selectedCourseGroup,
  });

  // Fetch content items for selected module
  const { data: contentItems = [], isLoading: contentLoading } = useQuery({
    queryKey: ["/api/content-items", selectedModule?.id],
    queryFn: async () => {
      if (!selectedModule) return [];
      const response = await apiRequest("GET", `/api/content-items?moduleId=${selectedModule.id}`);
      return response.sort((a: ContentItem, b: ContentItem) => a.orderIndex - b.orderIndex);
    },
    enabled: !!selectedModule,
  });

  // Fetch quiz questions for selected module
  const { data: quizQuestions = [], isLoading: quizLoading } = useQuery({
    queryKey: ["/api/quiz-questions", selectedModule?.id],
    queryFn: async () => {
      if (!selectedModule) return [];
      const response = await apiRequest("GET", `/api/quiz-questions?moduleId=${selectedModule.id}`);
      return response.sort((a: QuizQuestion, b: QuizQuestion) => a.orderIndex - b.orderIndex);
    },
    enabled: !!selectedModule,
  });

  // Fetch live sessions for selected course group
  const { data: liveSessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["/api/live-sessions", selectedCourseGroup?.id],
    queryFn: async () => {
      if (!selectedCourseGroup) return [];
      const response = await apiRequest("GET", `/api/live-sessions/${selectedCourseGroup.id}`);
      return response.sort((a: LiveSession, b: LiveSession) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime());
    },
    enabled: !!selectedCourseGroup,
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

  // Create module mutation
  const createModuleMutation = useMutation({
    mutationFn: async (data: Partial<Module>) => {
      return await apiRequest("POST", "/api/admin/modules", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/modules", selectedCourseGroup?.id] });
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

  // Create content item mutation
  const createContentMutation = useMutation({
    mutationFn: async (data: Partial<ContentItem>) => {
      return await apiRequest("POST", "/api/admin/content-items", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content-items", selectedModule?.id] });
      toast({ title: "Content item created successfully" });
      setIsContentDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create content item",
        description: error?.message || "Unknown error occurred",
        variant: "destructive"
      });
    },
  });

  // Create quiz question mutation
  const createQuizMutation = useMutation({
    mutationFn: async (data: Partial<QuizQuestion>) => {
      return await apiRequest("POST", "/api/admin/quiz-questions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quiz-questions", selectedModule?.id] });
      toast({ title: "Quiz question created successfully" });
      setIsQuizDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create quiz question",
        description: error?.message || "Unknown error occurred",
        variant: "destructive"
      });
    },
  });

  // Create live session mutation
  const createLiveSessionMutation = useMutation({
    mutationFn: async (data: Partial<LiveSession>) => {
      return await apiRequest("POST", "/api/admin/live-sessions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/live-sessions", selectedCourseGroup?.id] });
      toast({ title: "Live session created successfully" });
      setIsLiveCalendarDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create live session",
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
      courseType: isLiveCourse ? "live" : "self_paced",
      isLiveCourse: isLiveCourse,
      maxStudents: isLiveCourse ? parseInt(formData.get("maxStudents") as string) : undefined,
      batchTimings: isLiveCourse ? formData.get("batchTimings") as string : undefined,
      startDate: isLiveCourse ? formData.get("startDate") as string : undefined,
      endDate: isLiveCourse ? formData.get("endDate") as string : undefined,
      googleMeetLink: isLiveCourse ? formData.get("googleMeetLink") as string : undefined,
    };
    createCourseGroupMutation.mutate(data);
  };

  const handleCreateModule = (formData: FormData) => {
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      courseGroupId: selectedCourseGroup?.id,
      orderIndex: modules.length + 1,
      requiresQuiz: formData.get("requiresQuiz") === "on",
      quizRequiredToUnlock: formData.get("quizRequiredToUnlock") === "on",
      passingScore: parseInt(formData.get("passingScore") as string) || 70,
      maxAttempts: parseInt(formData.get("maxAttempts") as string) || 3,
      unlockMessage: formData.get("unlockMessage") as string || "Complete the previous module and pass the quiz to unlock this content.",
    };
    createModuleMutation.mutate(data);
  };

  const handleCreateContent = (formData: FormData) => {
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      type: formData.get("type") as string,
      moduleId: selectedModule?.id,
      fileUrl: formData.get("fileUrl") as string,
      externalUrl: formData.get("externalUrl") as string,
      orderIndex: contentItems.length + 1,
      isRequired: formData.get("isRequired") === "on",
    };
    createContentMutation.mutate(data);
  };

  const handleCreateQuizQuestion = (formData: FormData) => {
    const options = (formData.get("options") as string).split("\n").filter(o => o.trim());
    const data = {
      question: formData.get("question") as string,
      type: "multiple_choice",
      moduleId: selectedModule?.id,
      options: options,
      correctAnswer: formData.get("correctAnswer") as string,
      explanation: formData.get("explanation") as string,
      points: parseInt(formData.get("points") as string) || 1,
      orderIndex: quizQuestions.length + 1,
    };
    createQuizMutation.mutate(data);
  };

  const handleCreateLiveSession = (formData: FormData) => {
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      groupId: selectedCourseGroup?.id,
      moduleId: formData.get("moduleId") as string,
      sessionDate: formData.get("sessionDate") as string,
      startTime: formData.get("startTime") as string,
      endTime: formData.get("endTime") as string,
      googleMeetLink: formData.get("googleMeetLink") as string,
    };
    createLiveSessionMutation.mutate(data);
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

  if (groupsError) {
    console.error('Error loading course groups:', groupsError);
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Courses</h3>
          <p className="text-slate-600">{groupsError.message}</p>
        </div>
      </div>
    );
  }

  if (groupsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  console.log('Rendering CourseManagementNew component');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Course Management</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
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
                  <Label htmlFor="duration">Duration (days)</Label>
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
                  {createCourseGroupMutation.isPending ? "Creating..." : "Create Course"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
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
                      <span>{group.duration} days</span>
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
                    <DialogContent className="max-w-2xl">
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
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="requiresQuiz" name="requiresQuiz" />
                            <Label htmlFor="requiresQuiz">Requires Quiz</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="quizRequiredToUnlock" name="quizRequiredToUnlock" />
                            <Label htmlFor="quizRequiredToUnlock">Quiz Required to Unlock Next Module</Label>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="passingScore">Passing Score (%)</Label>
                            <Input id="passingScore" name="passingScore" type="number" defaultValue="70" />
                          </div>
                          <div>
                            <Label htmlFor="maxAttempts">Max Attempts</Label>
                            <Input id="maxAttempts" name="maxAttempts" type="number" defaultValue="3" />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="unlockMessage">Unlock Message</Label>
                          <Textarea id="unlockMessage" name="unlockMessage" rows={2} defaultValue="Complete the previous module and pass the quiz to unlock this content." />
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
                        <div className="space-y-2">
                          {module.requiresQuiz && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Play className="h-4 w-4 text-blue-500" />
                              <span>Quiz Required</span>
                            </div>
                          )}
                          {module.quizRequiredToUnlock && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Settings className="h-4 w-4 text-orange-500" />
                              <span>Unlocks Next Module</span>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedModule(module);
                              setActiveTab("content");
                            }}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Content
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedModule(module);
                              setActiveTab("content");
                            }}
                          >
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
              <p className="text-slate-600">Select a course to manage modules</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          {selectedModule ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Content for {selectedModule.title}</h3>
                <div className="flex space-x-2">
                  <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Content
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Content Item</DialogTitle>
                      </DialogHeader>
                      <form action={handleCreateContent} className="space-y-4">
                        <div>
                          <Label htmlFor="title">Title</Label>
                          <Input id="title" name="title" required />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea id="description" name="description" rows={3} />
                        </div>
                        <div>
                          <Label htmlFor="type">Type</Label>
                          <Select name="type" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select content type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="video">Video</SelectItem>
                              <SelectItem value="document">Document</SelectItem>
                              <SelectItem value="pdf">PDF</SelectItem>
                              <SelectItem value="ppt">PowerPoint</SelectItem>
                              <SelectItem value="external_link">External Link</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="fileUrl">File URL</Label>
                          <Input id="fileUrl" name="fileUrl" placeholder="https://..." />
                        </div>
                        <div>
                          <Label htmlFor="externalUrl">External URL</Label>
                          <Input id="externalUrl" name="externalUrl" placeholder="https://..." />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="isRequired" name="isRequired" defaultChecked />
                          <Label htmlFor="isRequired">Required Content</Label>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsContentDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createContentMutation.isPending}>
                            {createContentMutation.isPending ? "Adding..." : "Add Content"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={isQuizDialogOpen} onOpenChange={setIsQuizDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Quiz Question
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Quiz Question</DialogTitle>
                      </DialogHeader>
                      <form action={handleCreateQuizQuestion} className="space-y-4">
                        <div>
                          <Label htmlFor="question">Question</Label>
                          <Textarea id="question" name="question" rows={3} required />
                        </div>
                        <div>
                          <Label htmlFor="options">Options (one per line)</Label>
                          <Textarea id="options" name="options" rows={4} placeholder="Option A&#10;Option B&#10;Option C&#10;Option D" required />
                        </div>
                        <div>
                          <Label htmlFor="correctAnswer">Correct Answer</Label>
                          <Input id="correctAnswer" name="correctAnswer" required />
                        </div>
                        <div>
                          <Label htmlFor="explanation">Explanation</Label>
                          <Textarea id="explanation" name="explanation" rows={2} />
                        </div>
                        <div>
                          <Label htmlFor="points">Points</Label>
                          <Input id="points" name="points" type="number" defaultValue="1" />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsQuizDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createQuizMutation.isPending}>
                            {createQuizMutation.isPending ? "Adding..." : "Add Question"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Content Items */}
                <div>
                  <h4 className="font-semibold mb-3">Content Items</h4>
                  {contentLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {contentItems.map((item: ContentItem) => (
                        <Card key={item.id} className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium">{item.title}</h5>
                              <p className="text-sm text-slate-600">{item.type}</p>
                            </div>
                            <Badge variant={item.isRequired ? "default" : "secondary"}>
                              {item.isRequired ? "Required" : "Optional"}
                            </Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quiz Questions */}
                <div>
                  <h4 className="font-semibold mb-3">Quiz Questions</h4>
                  {quizLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {quizQuestions.map((question: QuizQuestion) => (
                        <Card key={question.id} className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium">{question.question}</h5>
                              <p className="text-sm text-slate-600">{question.points} point(s)</p>
                            </div>
                            <Badge variant="outline">Q{question.orderIndex}</Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Select a module to manage content</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="live-calendar" className="space-y-4">
          {selectedCourseGroup && isLiveCourse(selectedCourseGroup.categoryId) ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Live Calendar for {selectedCourseGroup.name}</h3>
                <Dialog open={isLiveCalendarDialogOpen} onOpenChange={setIsLiveCalendarDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Class
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Schedule Live Class</DialogTitle>
                    </DialogHeader>
                    <form action={handleCreateLiveSession} className="space-y-4">
                      <div>
                        <Label htmlFor="title">Session Title</Label>
                        <Input id="title" name="title" required />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" rows={3} />
                      </div>
                      <div>
                        <Label htmlFor="moduleId">Module</Label>
                        <Select name="moduleId" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select module" />
                          </SelectTrigger>
                          <SelectContent>
                            {modules.map((module: Module) => (
                              <SelectItem key={module.id} value={module.id}>
                                {module.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="sessionDate">Session Date</Label>
                          <Input id="sessionDate" name="sessionDate" type="date" required />
                        </div>
                        <div>
                          <Label htmlFor="startTime">Start Time</Label>
                          <Input id="startTime" name="startTime" type="time" required />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="endTime">End Time</Label>
                        <Input id="endTime" name="endTime" type="time" required />
                      </div>
                      <div>
                        <Label htmlFor="googleMeetLink">Google Meet Link</Label>
                        <Input id="googleMeetLink" name="googleMeetLink" placeholder="https://meet.google.com/..." required />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsLiveCalendarDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createLiveSessionMutation.isPending}>
                          {createLiveSessionMutation.isPending ? "Scheduling..." : "Schedule Class"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              {sessionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {liveSessions.map((session: LiveSession) => (
                    <Card key={session.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-base">{session.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-600 text-sm mb-3">{session.description}</p>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            <span>{new Date(session.sessionDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Clock className="h-4 w-4 text-green-500" />
                            <span>{session.startTime} - {session.endTime}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <LinkIcon className="h-4 w-4 text-purple-500" />
                            <a href={session.googleMeetLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              Join Meeting
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
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
