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
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import SelfPacedWorkflowGuide from './SelfPacedWorkflowGuide';

// Course Module Manager Component
function CourseModuleManager({ courseGroupId }: { courseGroupId?: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedCourseGroup, setSelectedCourseGroup] = useState<string>(courseGroupId || '');
  const [isCreateModuleOpen, setIsCreateModuleOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [currentModuleId, setCurrentModuleId] = useState<string>('');

  // Fetch course groups
  const { data: courseGroups = [] } = useQuery({
    queryKey: ["/api/course-groups"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/course-groups");
      return response;
    },
  });

  // Fetch modules for selected course
  const { data: modules = [] } = useQuery({
    queryKey: ["/api/course-modules", selectedCourseGroup],
    queryFn: async () => {
      if (!selectedCourseGroup) return [];
      const response = await apiRequest("GET", `/api/course-modules?courseGroupId=${selectedCourseGroup}`);
      return response;
    },
    enabled: !!selectedCourseGroup,
  });

  // Create module mutation
  const createModuleMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/course-modules", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/course-modules"] });
      toast({ title: "Module created successfully" });
      setIsCreateModuleOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error creating module", 
        description: error.message || "Failed to create module",
        variant: "destructive" 
      });
    },
  });

  // Update module mutation
  const updateModuleMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", `/api/course-modules/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/course-modules"] });
      toast({ title: "Module updated successfully" });
      setEditingModule(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error updating module", 
        description: error.message || "Failed to update module",
        variant: "destructive" 
      });
    },
  });

  // Delete module mutation
  const deleteModuleMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/course-modules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/course-modules"] });
      toast({ title: "Module deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error deleting module", 
        description: error.message || "Failed to delete module",
        variant: "destructive" 
      });
    },
  });

  const handleCreateModule = () => {
    if (!selectedCourseGroup) {
      toast({ 
        title: "Please select a course first", 
        variant: "destructive" 
      });
      return;
    }
    setIsCreateModuleOpen(true);
  };

  const handleEditModule = (module: any) => {
    setEditingModule(module);
  };

  const handleDeleteModule = async (id: string) => {
    if (confirm("Are you sure you want to delete this module?")) {
      deleteModuleMutation.mutate(id);
    }
  };

  const handleManageQuiz = (moduleId: string) => {
    setCurrentModuleId(moduleId);
    setShowQuizModal(true);
  };

  const getCourseName = (courseGroupId: string) => {
    const group = (courseGroups as any[]).find((g: any) => g.id === courseGroupId);
    return group?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Course Modules</h2>
          <p className="text-slate-600">Create and manage modules for self-paced courses</p>
        </div>
        <Button onClick={handleCreateModule} disabled={!selectedCourseGroup}>
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

      {/* Modules List */}
      {selectedCourseGroup && (
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
                        {getCourseName(module.courseGroupId)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
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
                {module.requiresQuiz && (
                  <div className="mt-2 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>Quiz Required (Pass: {module.passingScore}%)</span>
                    </div>
                  </div>
                )}
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
          selectedCourseGroup={selectedCourseGroup}
          onSave={editingModule ? 
            updateModuleMutation.mutateAsync : 
            createModuleMutation.mutateAsync
          }
          onCancel={() => {
            setIsCreateModuleOpen(false);
            setEditingModule(null);
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
function ModuleForm({ module, courseGroups, selectedCourseGroup, onSave, onCancel }: {
  module?: any;
  courseGroups: any[];
  selectedCourseGroup: string;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    courseGroupId: module?.courseGroupId || selectedCourseGroup,
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
      setIsCreateQuestionOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error creating question", 
        description: error.message || "Failed to create question",
        variant: "destructive" 
      });
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", `/api/module-quiz-questions/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/module-quiz-questions"] });
      toast({ title: "Question updated successfully" });
      setEditingQuestion(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error updating question", 
        description: error.message || "Failed to update question",
        variant: "destructive" 
      });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/module-quiz-questions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/module-quiz-questions"] });
      toast({ title: "Question deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error deleting question", 
        description: error.message || "Failed to delete question",
        variant: "destructive" 
      });
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
      deleteQuestionMutation.mutate(id);
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
              updateQuestionMutation.mutateAsync : 
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
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    moduleId: moduleId,
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
      toast({ 
        title: "Invalid JSON format", 
        description: "Please check your options and correct answer format",
        variant: "destructive" 
      });
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
              <p className="text-xs text-slate-500 mt-1">
                Enter options as a JSON array. Example: ["Option A", "Option B", "Option C", "Option D"]
              </p>
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
            <p className="text-xs text-slate-500 mt-1">
              For multiple choice: Enter the exact text of the correct option or the index (0, 1, 2, etc.)
            </p>
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

// Main Study Materials Manager Component
export default function StudyMaterialsManagerFixed({ courseGroupId }: { courseGroupId?: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Self-Paced Course Management</h1>
        <p className="text-slate-600">Create modules and quizzes for self-paced learning</p>
      </div>

      <SelfPacedWorkflowGuide />

      <Tabs defaultValue="modules" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="modules">Course Modules</TabsTrigger>
          <TabsTrigger value="quiz">Quiz Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="modules">
          <CourseModuleManager courseGroupId={courseGroupId} />
        </TabsContent>
        
        <TabsContent value="quiz">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">Quiz Management</h3>
            <p className="text-slate-600">Quizzes are managed within each module. Create a module first, then add quiz questions.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
