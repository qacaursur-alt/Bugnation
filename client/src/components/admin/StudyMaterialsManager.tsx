import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  BookOpen, 
  Video, 
  FileText, 
  File,
  Image,
  Presentation,
  Upload,
  Edit,
  Trash2,
  Eye,
  Play,
  Download,
  ExternalLink,
  X
} from "lucide-react";

// Documents Manager
function DocumentsManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedCourseGroup, setSelectedCourseGroup] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');

  const { data: courseGroupsData, isLoading: courseGroupsLoading, error: courseGroupsError } = useQuery({
    queryKey: ["/api/course-groups"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/course-groups");
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error fetching course groups:', error);
        return [];
      }
    },
  });

  // Ensure courseGroups is always an array
  const courseGroups = Array.isArray(courseGroupsData) ? courseGroupsData : [];

  const { data: coursesData, isLoading: coursesLoading, error: coursesError } = useQuery({
    queryKey: ["/api/courses"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/courses");
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error fetching courses:', error);
        return [];
      }
    },
  });

  // Ensure courses is always an array
  const courses = Array.isArray(coursesData) ? coursesData : [];

  const { data: documentsData, isLoading: documentsLoading, error: documentsError } = useQuery({
    queryKey: ["/api/study-materials", selectedCourse],
    queryFn: async () => {
      if (!selectedCourse) return [];
      try {
        const response = await apiRequest("GET", `/api/study-materials?courseId=${selectedCourse}`);
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error fetching study materials:', error);
        return [];
      }
    },
    enabled: !!selectedCourse,
  });

  // Ensure documents is always an array
  const documents = Array.isArray(documentsData) ? documentsData : [];

  const createDocumentMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/study-materials", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/study-materials"] });
      toast({ title: "Study material created successfully" });
    },
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<any>(null);

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleEdit = (document: any) => {
    setEditingDocument(document);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this study material?")) {
      await apiRequest("DELETE", `/api/study-materials/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/study-materials"] });
      toast({ title: "Study material deleted successfully" });
    }
  };

  const getCourseName = (courseId: string) => {
    const course = (courses as any[]).find((c: any) => c.id === courseId);
    return course?.title || 'Unknown';
  };

  const getCourseGroupName = (courseGroupId: string) => {
    const group = (courseGroups as any[]).find((g: any) => g.id === courseGroupId);
    return group?.name || 'Unknown';
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'document': return FileText;
      case 'pdf': return File;
      case 'ppt': return Presentation;
      case 'image': return Image;
      default: return File;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-500';
      case 'document': return 'bg-blue-500';
      case 'pdf': return 'bg-red-600';
      case 'ppt': return 'bg-orange-500';
      case 'image': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Add error handling
  if (courseGroupsError || coursesError || documentsError) {
    console.error('Error loading data:', { courseGroupsError, coursesError, documentsError });
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Data</h3>
          <p className="text-slate-600">
            {courseGroupsError?.message || coursesError?.message || documentsError?.message || "Failed to load data"}
          </p>
        </div>
      </div>
    );
  }

  // Add loading state
  if (courseGroupsLoading || coursesLoading || documentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Debug logging
  console.log('DocumentsManager rendering with:', { 
    courseGroups, 
    courses, 
    documents, 
    courseGroupsLength: courseGroups.length,
    coursesLength: courses.length,
    documentsLength: documents.length,
    courseGroupsLoading, 
    coursesLoading, 
    documentsLoading,
    courseGroupsError,
    coursesError,
    documentsError
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Study Materials</h2>
          <p className="text-slate-600">Manage documents, videos, PDFs, and other study materials</p>
        </div>
        <Button onClick={handleCreate} disabled={!selectedCourse}>
          <Plus className="h-4 w-4 mr-2" />
          Add Material
        </Button>
      </div>

      {/* Course Selection */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Select Course *
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a course...</option>
            {(courseGroups as any[]).map((group: any) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(documents as any[]).map((document: any) => {
          const IconComponent = getContentTypeIcon(document.type);
          const colorClass = getContentTypeColor(document.type);
          
          return (
            <Card key={document.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${colorClass} rounded-lg flex items-center justify-center text-white`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{document.title}</CardTitle>
                      <div className="space-y-1">
                      <Badge variant="outline">
                          {getCourseName(document.courseId)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {getCourseGroupName(document.courseGroupId)}
                      </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(document)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(document.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-sm mb-3">{document.description}</p>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span className="capitalize">{document.type}</span>
                  <div className="flex space-x-2">
                    {document.fileUrl && (
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    )}
                    {document.externalUrl && (
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Open
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create/Edit Document Modal */}
      {(isCreateModalOpen || editingDocument) && (
        <DocumentForm
          document={editingDocument}
          courseGroups={courseGroups as any[]}
          courses={courses as any[]}
          selectedCourseGroup={selectedCourseGroup}
          selectedCourse={selectedCourse}
          onSave={editingDocument ? 
            async (data: any) => {
              await apiRequest("PUT", `/api/study-materials/${data.id}`, data);
              queryClient.invalidateQueries({ queryKey: ["/api/study-materials"] });
              toast({ title: "Study material updated successfully" });
            } : 
            createDocumentMutation.mutateAsync
          }
          onCancel={() => {
            setIsCreateModalOpen(false);
            setEditingDocument(null);
          }}
        />
      )}
    </div>
  );
}

// Document Form Component
function DocumentForm({ document, courseGroups, courses, selectedCourseGroup, selectedCourse, onSave, onCancel }: {
  document?: any;
  courseGroups: any[];
  courses: any[];
  selectedCourseGroup: string;
  selectedCourse: string;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    courseId: document?.courseId || selectedCourse, // This will be the course group ID
    courseGroupId: document?.courseGroupId || selectedCourseGroup,
    title: document?.title || '',
    description: document?.description || '',
    type: document?.type || 'document',
    fileUrl: document?.fileUrl || '',
    externalUrl: document?.externalUrl || '',
    fileName: document?.fileName || '',
    orderIndex: document?.orderIndex || 1,
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiRequest("POST", "/api/upload", formData);
      const responseData = await response.json();
      
      setFormData(prev => ({
        ...prev,
        fileUrl: responseData.url,
        fileName: file.name,
        type: getFileType(file.name)
      }));
      
      toast({ title: "File uploaded successfully" });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const getFileType = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
        return 'video';
      case 'pdf':
        return 'pdf';
      case 'ppt':
      case 'pptx':
        return 'ppt';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image';
      case 'doc':
      case 'docx':
      case 'txt':
        return 'document';
      default:
        return 'document';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = document ? { ...formData, id: document.id } : formData;
    await onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {document ? 'Edit Study Material' : 'Add Study Material'}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Course *
            </label>
            <select
              value={formData.courseGroupId}
              onChange={(e) => setFormData({ ...formData, courseGroupId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a course</option>
              {courseGroups.map((group: any) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter material title..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the material..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Content Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="video">Video</option>
                <option value="document">Document</option>
                <option value="pdf">PDF</option>
                <option value="ppt">PowerPoint</option>
                <option value="image">Image</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Order Index
              </label>
              <Input
                type="number"
                value={formData.orderIndex}
                onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) })}
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Upload File
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600 mb-2">
                {isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
              </p>
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id="file-upload"
                accept=".mp4,.avi,.mov,.wmv,.pdf,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.doc,.docx,.txt"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Choose File'}
              </label>
              {formData.fileName && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ {formData.fileName}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              External URL (Alternative to file upload)
            </label>
            <Input
              type="url"
              value={formData.externalUrl}
              onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
              placeholder="https://example.com/video"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              {document ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Course Module Manager Component
function CourseModuleManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedCourseGroup, setSelectedCourseGroup] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<string>('');

  const { data: courseGroups = [] } = useQuery({
    queryKey: ["/api/course-groups"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/course-groups");
      return response;
    },
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["/api/courses"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/courses");
      return response;
    },
  });

  const { data: modules = [] } = useQuery({
    queryKey: ["/api/course-modules", selectedCourse],
    queryFn: async () => {
      if (!selectedCourse) return [];
      const response = await apiRequest("GET", `/api/course-modules?courseGroupId=${selectedCourse}`);
      return response;
    },
    enabled: !!selectedCourse,
  });

  const createModuleMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/course-modules", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/course-modules"] });
      toast({ title: "Module created successfully" });
    },
  });

  const [isCreateModuleOpen, setIsCreateModuleOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [currentModuleId, setCurrentModuleId] = useState<string>('');

  const handleCreateModule = () => {
    setIsCreateModuleOpen(true);
  };

  const handleEditModule = (module: any) => {
    setEditingModule(module);
  };

  const handleDeleteModule = async (id: string) => {
    if (confirm("Are you sure you want to delete this module?")) {
      await apiRequest("DELETE", `/api/course-modules/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/course-modules"] });
      toast({ title: "Module deleted successfully" });
    }
  };

  const handleManageMaterials = (moduleId: string) => {
    setCurrentModuleId(moduleId);
    setShowMaterialsModal(true);
  };

  const handleManageQuiz = (moduleId: string) => {
    setCurrentModuleId(moduleId);
    setShowQuizModal(true);
  };

  const getCourseName = (courseId: string) => {
    const course = (courses as any[]).find((c: any) => c.id === courseId);
    return course?.title || 'Unknown';
  };

  const getCourseGroupName = (courseGroupId: string) => {
    const group = (courseGroups as any[]).find((g: any) => g.id === courseGroupId);
    return group?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Course Modules</h2>
          <p className="text-slate-600">Create and manage modules for courses</p>
        </div>
        <Button onClick={handleCreateModule} disabled={!selectedCourse}>
          <Plus className="h-4 w-4 mr-2" />
          Add Module
        </Button>
      </div>

      {/* Course Selection */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Select Course *
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              setSelectedModule(''); // Reset module selection
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a course...</option>
            {(courseGroups as any[]).map((group: any) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Modules List */}
      {selectedCourse && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(modules as any[]).map((module: any) => (
            <Card key={module.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <Badge variant="outline">
                        {getCourseName(module.courseId)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedModule(module.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Manage
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditModule(module)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteModule(module.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-sm mb-3">{module.description}</p>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Order: {module.orderIndex}</span>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleManageMaterials(module.id)}
                    >
                      <BookOpen className="h-4 w-4 mr-1" />
                      Materials
                    </Button>
                    {module.requiresQuiz && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleManageQuiz(module.id)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Quiz
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Module Modal */}
      {(isCreateModuleOpen || editingModule) && (
        <ModuleForm
          module={editingModule}
          courseGroups={courseGroups as any[]}
          courses={courses as any[]}
          selectedCourseGroup={selectedCourseGroup}
          selectedCourse={selectedCourse}
          onSave={editingModule ? 
            async (data: any) => {
              await apiRequest("PUT", `/api/course-modules/${data.id}`, data);
              queryClient.invalidateQueries({ queryKey: ["/api/course-modules"] });
              toast({ title: "Module updated successfully" });
            } : 
            createModuleMutation.mutateAsync
          }
          onCancel={() => {
            setIsCreateModuleOpen(false);
            setEditingModule(null);
          }}
        />
      )}

      {/* Module Study Materials Modal */}
      {showMaterialsModal && (
        <ModuleStudyMaterialSelector
          moduleId={currentModuleId}
          onClose={() => {
            setShowMaterialsModal(false);
            setCurrentModuleId('');
          }}
        />
      )}

      {/* Module Quiz Modal */}
      {showQuizModal && (
        <ModuleQuizManager
          moduleId={currentModuleId}
          onClose={() => {
            setShowQuizModal(false);
            setCurrentModuleId('');
          }}
        />
      )}
    </div>
  );
}

// Module Form Component
function ModuleForm({ module, courseGroups, courses, selectedCourseGroup, selectedCourse, onSave, onCancel }: {
  module?: any;
  courseGroups: any[];
  courses: any[];
  selectedCourseGroup: string;
  selectedCourse: string;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    courseGroupId: module?.courseGroupId || selectedCourse,
    title: module?.title || '',
    description: module?.description || '',
    orderIndex: module?.orderIndex || 1,
    requiresQuiz: module?.requiresQuiz || false,
    quizRequiredToUnlock: module?.quizRequiredToUnlock || false,
    passingScore: module?.passingScore || 70,
    maxAttempts: module?.maxAttempts || 3,
    unlockMessage: module?.unlockMessage || 'Complete the previous module and pass the quiz to unlock this content.',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = module ? { ...formData, id: module.id } : formData;
    await onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {module ? 'Edit Module' : 'Add Module'}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Course *
            </label>
            <select
              value={formData.courseGroupId}
              onChange={(e) => setFormData({ ...formData, courseGroupId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a course</option>
              {courseGroups.map((group: any) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Module Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter module title..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the module..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Order Index
              </label>
              <Input
                type="number"
                value={formData.orderIndex}
                onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) })}
                min="1"
              />
            </div>
          </div>

          {/* Quiz Settings */}
          <div className="border-t pt-4">
            <h4 className="text-md font-medium text-slate-700 mb-3">Quiz Settings</h4>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="requiresQuiz"
                  checked={formData.requiresQuiz}
                  onChange={(e) => setFormData({ ...formData, requiresQuiz: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="requiresQuiz" className="text-sm font-medium text-slate-700">
                  This module requires a quiz
                </label>
              </div>

              {formData.requiresQuiz && (
                <>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="quizRequiredToUnlock"
                      checked={formData.quizRequiredToUnlock}
                      onChange={(e) => setFormData({ ...formData, quizRequiredToUnlock: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="quizRequiredToUnlock" className="text-sm font-medium text-slate-700">
                      Quiz must be passed to unlock next module
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Passing Score (%)
                      </label>
                      <Input
                        type="number"
                        value={formData.passingScore}
                        onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                        min="1"
                        max="100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Max Attempts
                      </label>
                      <Input
                        type="number"
                        value={formData.maxAttempts}
                        onChange={(e) => setFormData({ ...formData, maxAttempts: parseInt(e.target.value) })}
                        min="1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Unlock Message
                    </label>
                    <Textarea
                      value={formData.unlockMessage}
                      onChange={(e) => setFormData({ ...formData, unlockMessage: e.target.value })}
                      placeholder="Message shown when module is locked..."
                      rows={2}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {module ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Module Study Material Selector Component
function ModuleStudyMaterialSelector({ moduleId, onClose }: { moduleId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedStudyMaterials, setSelectedStudyMaterials] = useState<string[]>([]);

  const { data: moduleMaterials = [] } = useQuery({
    queryKey: ["/api/module-study-materials", moduleId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/module-study-materials/${moduleId}`);
      return response;
    },
  });

  const { data: allStudyMaterials = [] } = useQuery({
    queryKey: ["/api/study-materials"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/study-materials");
      return response;
    },
  });

  const addMaterialMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/module-study-materials", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/module-study-materials"] });
      toast({ title: "Study material added to module" });
    },
  });

  const removeMaterialMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/module-study-materials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/module-study-materials"] });
      toast({ title: "Study material removed from module" });
    },
  });

  const handleAddMaterial = async (studyMaterialId: string) => {
    await addMaterialMutation.mutateAsync({
      moduleId,
      studyMaterialId,
      orderIndex: (moduleMaterials as any[]).length,
      isRequired: true,
    });
  };

  const handleRemoveMaterial = async (id: string) => {
    await removeMaterialMutation.mutateAsync(id);
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'document': return FileText;
      case 'pdf': return File;
      case 'ppt': return Presentation;
      case 'image': return Image;
      default: return File;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-500';
      case 'document': return 'bg-blue-500';
      case 'pdf': return 'bg-red-600';
      case 'ppt': return 'bg-orange-500';
      case 'image': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Manage Module Study Materials</h3>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Study Materials */}
          <div>
            <h4 className="text-md font-medium text-slate-700 mb-4">Available Study Materials</h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {(allStudyMaterials as any[]).map((material: any) => {
                const isAlreadyAdded = (moduleMaterials as any[]).some((mm: any) => mm.studyMaterialId === material.id);
                const IconComponent = getContentTypeIcon(material.type);
                const colorClass = getContentTypeColor(material.type);
                
                return (
                  <div key={material.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 ${colorClass} rounded-lg flex items-center justify-center text-white`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{material.title}</p>
                        <p className="text-xs text-slate-500 capitalize">{material.type}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={isAlreadyAdded ? "outline" : "default"}
                      disabled={isAlreadyAdded}
                      onClick={() => handleAddMaterial(material.id)}
                    >
                      {isAlreadyAdded ? "Added" : "Add"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Module Study Materials */}
          <div>
            <h4 className="text-md font-medium text-slate-700 mb-4">Module Study Materials</h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {(moduleMaterials as any[]).map((moduleMaterial: any) => {
                const material = moduleMaterial.studyMaterial;
                if (!material) return null;
                
                const IconComponent = getContentTypeIcon(material.type);
                const colorClass = getContentTypeColor(material.type);
                
                return (
                  <div key={moduleMaterial.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 ${colorClass} rounded-lg flex items-center justify-center text-white`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{material.title}</p>
                        <p className="text-xs text-slate-500 capitalize">{material.type}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveMaterial(moduleMaterial.id)}
                    >
                      Remove
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Module Quiz Manager Component
function ModuleQuizManager({ moduleId, onClose }: { moduleId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCreateQuestionOpen, setIsCreateQuestionOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  const { data: questions = [] } = useQuery({
    queryKey: ["/api/module-quiz-questions", moduleId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/module-quiz-questions/${moduleId}`);
      return response;
    },
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/module-quiz-questions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/module-quiz-questions"] });
      toast({ title: "Quiz question created successfully" });
    },
  });

  const handleCreateQuestion = () => {
    setIsCreateQuestionOpen(true);
  };

  const handleEditQuestion = (question: any) => {
    setEditingQuestion(question);
  };

  const handleDeleteQuestion = async (id: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      await apiRequest("DELETE", `/api/module-quiz-questions/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/module-quiz-questions"] });
      toast({ title: "Question deleted successfully" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Manage Module Quiz Questions</h3>
          <div className="flex space-x-2">
            <Button onClick={handleCreateQuestion}>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {(questions as any[]).map((question: any, index: number) => (
            <Card key={question.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="outline">Q{index + 1}</Badge>
                    <Badge variant="secondary" className="capitalize">{question.type}</Badge>
                    <Badge variant="outline">{question.points} point{question.points !== 1 ? 's' : ''}</Badge>
                  </div>
                  <p className="text-sm font-medium mb-2">{question.question}</p>
                  {question.options && (
                    <div className="text-xs text-slate-600">
                      <p>Options: {JSON.stringify(question.options)}</p>
                      <p>Correct Answer: {JSON.stringify(question.correctAnswer)}</p>
                    </div>
                  )}
                  {question.explanation && (
                    <p className="text-xs text-slate-500 mt-2">Explanation: {question.explanation}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditQuestion(question)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteQuestion(question.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Create/Edit Question Modal */}
        {(isCreateQuestionOpen || editingQuestion) && (
          <QuizQuestionForm
            question={editingQuestion}
            moduleId={moduleId}
            onSave={editingQuestion ? 
              async (data: any) => {
                await apiRequest("PUT", `/api/module-quiz-questions/${data.id}`, data);
                queryClient.invalidateQueries({ queryKey: ["/api/module-quiz-questions"] });
                toast({ title: "Question updated successfully" });
              } : 
              createQuestionMutation.mutateAsync
            }
            onCancel={() => {
              setIsCreateQuestionOpen(false);
              setEditingQuestion(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

// Quiz Question Form Component
function QuizQuestionForm({ question, moduleId, onSave, onCancel }: {
  question?: any;
  moduleId: string;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    question: question?.question || '',
    type: question?.type || 'multiple_choice',
    options: question?.options ? JSON.stringify(question.options, null, 2) : '[]',
    correctAnswer: question?.correctAnswer ? JSON.stringify(question.correctAnswer, null, 2) : '""',
    explanation: question?.explanation || '',
    points: question?.points || 1,
    orderIndex: question?.orderIndex || 0,
    isActive: question?.isActive !== false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        options: JSON.parse(formData.options),
        correctAnswer: JSON.parse(formData.correctAnswer),
        id: question?.id,
      };
      await onSave(data);
    } catch (error) {
      alert("Invalid JSON format in options or correct answer");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {question ? 'Edit Quiz Question' : 'Add Quiz Question'}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Question *
            </label>
            <Textarea
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="Enter the question..."
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Question Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="multiple_choice">Multiple Choice</option>
                <option value="true_false">True/False</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Points
              </label>
              <Input
                type="number"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                min="1"
              />
            </div>
          </div>

          {formData.type === 'multiple_choice' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Options (JSON Array) *
              </label>
              <Textarea
                value={formData.options}
                onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                placeholder='["Option 1", "Option 2", "Option 3", "Option 4"]'
                rows={3}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Correct Answer *
            </label>
            <Textarea
              value={formData.correctAnswer}
              onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
              placeholder='For multiple choice: "Option 1" or 0 (index). For true/false: true or false'
              rows={2}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Explanation
            </label>
            <Textarea
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              placeholder="Explain why this is the correct answer..."
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {question ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Live Session Calendar Component
function LiveSessionCalendar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedCourseGroup, setSelectedCourseGroup] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);

  const { data: courseGroups = [] } = useQuery({
    queryKey: ["/api/course-groups"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/course-groups");
      return response;
    },
  });

  const { data: liveSessions = [], isLoading: liveSessionsLoading, error: liveSessionsError } = useQuery({
    queryKey: ["/api/live-sessions", selectedCourseGroup],
    queryFn: async () => {
      if (!selectedCourseGroup) return [];
      try {
        const response = await apiRequest("GET", `/api/live-sessions/${selectedCourseGroup}`);
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error("Error fetching live sessions:", error);
        return [];
      }
    },
    enabled: !!selectedCourseGroup,
  });

  const createSessionMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/live-sessions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/live-sessions"] });
      toast({ title: "Live session created successfully" });
    },
  });

  const handleCreateSession = () => {
    setIsCreateSessionOpen(true);
  };

  const handleEditSession = (session: any) => {
    setEditingSession(session);
  };

  const handleDeleteSession = async (id: string) => {
    if (confirm("Are you sure you want to delete this live session?")) {
      await apiRequest("DELETE", `/api/admin/live-sessions/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/live-sessions"] });
      toast({ title: "Live session deleted successfully" });
    }
  };

  const getCourseGroupName = (courseGroupId: string) => {
    const group = (courseGroups as any[]).find((g: any) => g.id === courseGroupId);
    return group?.name || 'Unknown';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Live Sessions Calendar</h2>
          <p className="text-slate-600">Schedule and manage live course sessions</p>
        </div>
        <Button onClick={handleCreateSession} disabled={!selectedCourseGroup}>
          <Plus className="h-4 w-4 mr-2" />
          Add Session
        </Button>
      </div>

      {/* Course Selection */}
      <div className="bg-white p-4 rounded-lg border">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Select Course *
          </label>
          <select
            value={selectedCourseGroup}
            onChange={(e) => setSelectedCourseGroup(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a course...</option>
            {(courseGroups as any[]).map((group: any) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Sessions List */}
      {selectedCourseGroup && (
        <div className="space-y-4">
          {liveSessionsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading live sessions...</p>
            </div>
          ) : liveSessionsError ? (
            <div className="text-center py-8">
              <p className="text-red-600">Error loading live sessions</p>
            </div>
          ) : Array.isArray(liveSessions) && liveSessions.length > 0 ? (
            liveSessions.map((session: any) => (
              <Card key={session.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white">
                      <Video className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{session.title}</CardTitle>
                      <Badge variant="outline">
                        {getCourseGroupName(session.groupId)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditSession(session)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteSession(session.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-sm mb-3">{session.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-slate-700">Date:</span>
                    <p className="text-slate-600">{formatDate(session.sessionDate)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Time:</span>
                    <p className="text-slate-600">
                      {formatTime(session.startTime)} - {formatTime(session.endTime)}
                    </p>
                  </div>
                  {session.googleMeetLink && (
                    <div className="md:col-span-2">
                      <span className="font-medium text-slate-700">Meeting Link:</span>
                      <p className="text-blue-600">
                        <a href={session.googleMeetLink} target="_blank" rel="noopener noreferrer">
                          {session.googleMeetLink}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No live sessions found for this course group.</p>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Session Modal */}
      {(isCreateSessionOpen || editingSession) && (
        <LiveSessionForm
          session={editingSession}
          courseGroups={courseGroups as any[]}
          selectedCourseGroup={selectedCourseGroup}
          onSave={editingSession ? 
            async (data: any) => {
              await apiRequest("PUT", `/api/admin/live-sessions/${data.id}`, data);
              queryClient.invalidateQueries({ queryKey: ["/api/live-sessions"] });
              toast({ title: "Live session updated successfully" });
              setEditingSession(null);
            } : 
            createSessionMutation.mutateAsync
          }
          onCancel={() => {
            setIsCreateSessionOpen(false);
            setEditingSession(null);
          }}
        />
      )}
    </div>
  );
}

// Live Session Form Component
function LiveSessionForm({ session, courseGroups, selectedCourseGroup, onSave, onCancel }: {
  session?: any;
  courseGroups: any[];
  selectedCourseGroup: string;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    groupId: session?.groupId || selectedCourseGroup,
    title: session?.title || '',
    description: session?.description || '',
    sessionDate: session?.sessionDate ? new Date(session.sessionDate).toISOString().split('T')[0] : '',
    startTime: session?.startTime ? new Date(session.startTime).toISOString().slice(0, 16) : '',
    endTime: session?.endTime ? new Date(session.endTime).toISOString().slice(0, 16) : '',
    googleMeetLink: session?.googleMeetLink || '',
  });

  // Update form data when session changes
  useEffect(() => {
    if (session) {
      setFormData({
        groupId: session.groupId || selectedCourseGroup,
        title: session.title || '',
        description: session.description || '',
        sessionDate: session.sessionDate ? new Date(session.sessionDate).toISOString().split('T')[0] : '',
        startTime: session.startTime ? new Date(session.startTime).toISOString().slice(0, 16) : '',
        endTime: session.endTime ? new Date(session.endTime).toISOString().slice(0, 16) : '',
        googleMeetLink: session.googleMeetLink || '',
      });
    } else {
      setFormData({
        groupId: selectedCourseGroup,
        title: '',
        description: '',
        sessionDate: '',
        startTime: '',
        endTime: '',
        googleMeetLink: '',
      });
    }
  }, [session, selectedCourseGroup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      sessionDate: new Date(formData.sessionDate).toISOString(),
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
      id: session?.id,
    };
    await onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {session ? 'Edit Live Session' : 'Add Live Session'}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Course *
            </label>
            <select
              value={formData.groupId}
              onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a course</option>
              {courseGroups.map((group: any) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Session Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter session title..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the session..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Session Date *
              </label>
              <Input
                type="date"
                value={formData.sessionDate}
                onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Start Time *
              </label>
              <Input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                End Time *
              </label>
              <Input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Google Meet Link
            </label>
            <Input
              type="url"
              value={formData.googleMeetLink}
              onChange={(e) => setFormData({ ...formData, googleMeetLink: e.target.value })}
              placeholder="https://meet.google.com/..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {session ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main Study Materials Manager Component
export default function StudyMaterialsManager({ courseGroupId }: { courseGroupId?: string }) {
  console.log('StudyMaterialsManager component rendering with courseGroupId:', courseGroupId);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Study Materials Management</h1>
        <p className="text-slate-600">Upload and manage videos, documents, PDFs, PowerPoints, and other study materials</p>
      </div>

      <Tabs defaultValue="materials" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="materials">Study Materials</TabsTrigger>
          <TabsTrigger value="modules">Course Modules</TabsTrigger>
          <TabsTrigger value="live-sessions">Live Sessions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="materials">
          <DocumentsManager />
        </TabsContent>
        
        <TabsContent value="modules">
          <CourseModuleManager />
        </TabsContent>
        
        <TabsContent value="live-sessions">
          <LiveSessionCalendar />
        </TabsContent>
      </Tabs>
    </div>
  );
}