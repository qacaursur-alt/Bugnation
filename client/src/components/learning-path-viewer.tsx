import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import ContentViewer from "./content-viewer";
import { QAQuiz } from "./qa-quiz";
import { 
  BookOpen, 
  Lock, 
  Unlock, 
  CheckCircle, 
  Circle, 
  Play,
  Clock,
  Award,
  AlertCircle,
  HelpCircle,
  FileText
} from "lucide-react";

interface LearningPathViewerProps {
  courseGroupId: string;
  userId: string;
  onSwitchToLiveSessions?: () => void;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  requiresQuiz: boolean;
  quizRequiredToUnlock: boolean;
  passingScore: number;
  maxAttempts: number;
  unlockMessage: string;
  documents: Document[];
}

interface Document {
  id: string;
  title: string;
  description: string;
  type: string;
  fileUrl?: string;
  externalUrl?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
  orderIndex: number;
}

interface Progress {
  learningPathId: string;
  documentId: string;
  isCompleted: boolean;
  completedAt?: string;
  score?: number;
  attempts: number;
}

export default function LearningPathViewer({ courseGroupId, userId, onSwitchToLiveSessions }: LearningPathViewerProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);

  console.log('LearningPathViewer rendered with:', { courseGroupId, userId });

  const { data: learningPaths = [], isLoading: pathsLoading, error: pathsError } = useQuery({
    queryKey: ["/api/learning-paths", courseGroupId],
    queryFn: async () => {
      console.log('Fetching learning paths for courseGroupId:', courseGroupId);
      const response = await apiRequest("GET", `/api/learning-paths?groupId=${courseGroupId}`);
      console.log('Learning paths response:', response);
      return response.sort((a: LearningPath, b: LearningPath) => a.orderIndex - b.orderIndex);
    },
    enabled: !!courseGroupId,
  });

  // Check if this is a live course (no learning paths)
  const isLiveCourse = learningPaths.length === 0 && !pathsLoading;

  const { data: progress = [], isLoading: progressLoading } = useQuery({
    queryKey: ["/api/learning-path-progress", userId, courseGroupId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/learning-path-progress?userId=${userId}&groupId=${courseGroupId}`);
      return response.json();
    },
  });

  const { data: documents = [], isLoading: documentsLoading } = useQuery({
    queryKey: ["/api/documents", selectedPath?.id],
    queryFn: async () => {
      if (!selectedPath) return [];
      const response = await apiRequest("GET", `/api/documents?learningPathId=${selectedPath.id}`);
      return response.sort((a: Document, b: Document) => a.orderIndex - b.orderIndex);
    },
    enabled: !!selectedPath,
  });

  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ["/api/learning-paths", selectedPath?.id, "questions"],
    queryFn: async () => {
      if (!selectedPath) return [];
      const response = await apiRequest("GET", `/api/learning-paths/${selectedPath.id}/questions`);
      return response.json();
    },
    enabled: !!selectedPath && selectedPath.requiresQuiz,
  });

  const markCompleteMutation = useMutation({
    mutationFn: async ({ documentId, learningPathId }: { documentId: string; learningPathId: string }) => {
      return await apiRequest("POST", "/api/learning-path-progress", {
        userId,
        learningPathId,
        documentId,
        isCompleted: true,
        completedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learning-path-progress"] });
      toast({ title: "Progress saved successfully" });
    },
  });

  const getPathProgress = (pathId: string) => {
    // Find the specific path and get its documents
    const path = learningPaths.find(p => p.id === pathId);
    const pathDocuments = path?.documents || [];
    const completedDocuments = progress.filter(p => 
      p.learningPathId === pathId && p.isCompleted
    );
    return {
      total: pathDocuments.length,
      completed: completedDocuments.length,
      percentage: pathDocuments.length > 0 ? (completedDocuments.length / pathDocuments.length) * 100 : 0
    };
  };

  const isPathUnlocked = (path: LearningPath, index: number) => {
    if (index === 0) return true; // First path is always unlocked
    
    const previousPath = learningPaths[index - 1];
    if (!previousPath) return true;
    
    if (!previousPath.quizRequiredToUnlock) return true;
    
    // Check if previous path's quiz was passed
    const previousPathProgress = progress.filter(p => p.learningPathId === previousPath.id);
    const hasPassedQuiz = previousPathProgress.some(p => 
      p.score && p.score >= previousPath.passingScore
    );
    
    return hasPassedQuiz;
  };

  const isDocumentCompleted = (documentId: string, learningPathId: string) => {
    return progress.some(p => 
      p.documentId === documentId && 
      p.learningPathId === learningPathId && 
      p.isCompleted
    );
  };

  const handleDocumentComplete = async (documentId: string) => {
    if (!selectedPath) return;
    
    await markCompleteMutation.mutateAsync({
      documentId,
      learningPathId: selectedPath.id,
    });
  };

  const handlePathSelect = (path: LearningPath) => {
    setSelectedPath(path);
    setSelectedDocument(null);
  };

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
    setShowQuiz(false);
  };

  const handleStartQuiz = () => {
    setShowQuiz(true);
    setSelectedDocument(null);
  };

  const handleQuizComplete = (score: number, passed: boolean) => {
    setShowQuiz(false);
    queryClient.invalidateQueries({ queryKey: ["/api/learning-path-progress"] });
    queryClient.invalidateQueries({ queryKey: ["/api/learning-paths"] });
    
    if (passed) {
      toast({
        title: "Quiz Passed! 🎉",
        description: "Great job! The next session is now unlocked.",
      });
    } else {
      toast({
        title: "Quiz Failed",
        description: "Don't worry! You can retake the quiz to improve your score.",
        variant: "destructive",
      });
    }
  };

  if (pathsLoading || progressLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading learning content...</p>
          <p className="text-xs text-slate-500 mt-2">Course ID: {courseGroupId}</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (pathsError) {
    console.error('Error loading learning paths:', pathsError);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Content</h3>
          <p className="text-slate-600 mb-4">There was an error loading the learning paths for this course.</p>
          <p className="text-xs text-slate-500">Course ID: {courseGroupId}</p>
          <p className="text-xs text-slate-500">Error: {pathsError.message}</p>
        </div>
      </div>
    );
  }

  // Show message for live courses (no learning paths)
  if (isLiveCourse) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Play className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Live Course Detected</h3>
        <p className="text-slate-600 mb-6 max-w-md mx-auto">
          This is a live course with interactive sessions. Learning paths are not available for live courses.
          Check the "Live Sessions" tab to view your scheduled classes and study materials.
        </p>
        <div className="space-y-2">
          <p className="text-sm text-slate-500">Course ID: {courseGroupId}</p>
          <p className="text-sm text-slate-500">Learning paths found: {learningPaths.length}</p>
        </div>
        <Button 
          onClick={() => {
            if (onSwitchToLiveSessions) {
              onSwitchToLiveSessions();
            } else {
              console.log('Live course detected - should switch to live sessions tab');
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 mt-4"
        >
          View Live Sessions
        </Button>
      </div>
    );
  }

  // Show message when no learning paths are available
  if (learningPaths.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="h-8 w-8 text-slate-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">No Learning Path Available</h3>
        <p className="text-slate-600 mb-6 max-w-md mx-auto">
          This course doesn't have any learning paths set up yet. Please contact support or check back later.
        </p>
        <p className="text-xs text-slate-500">Course ID: {courseGroupId}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Learning Path</h2>
        <p className="text-slate-600">Follow the structured learning path to master the course content</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Learning Paths List */}
        <div className="lg:col-span-1">
          <div className="space-y-3">
            {learningPaths.map((path, index) => {
              const isUnlocked = isPathUnlocked(path, index);
              const pathProgress = getPathProgress(path.id);
              const isCompleted = pathProgress.percentage === 100;
              
              return (
                <Card 
                  key={path.id} 
                  className={`cursor-pointer transition-all ${
                    selectedPath?.id === path.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:shadow-md'
                  } ${!isUnlocked ? 'opacity-60' : ''}`}
                  onClick={() => isUnlocked && handlePathSelect(path)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted 
                            ? 'bg-green-500 text-white' 
                            : isUnlocked 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-300 text-gray-600'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : isUnlocked ? (
                            <Play className="h-4 w-4" />
                          ) : (
                            <Lock className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-sm">{path.title}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={isCompleted ? "default" : isUnlocked ? "secondary" : "outline"}>
                              {isCompleted ? 'Completed' : isUnlocked ? 'Available' : 'Locked'}
                            </Badge>
                            {path.requiresQuiz && (
                              <Badge variant="outline" className="text-xs">
                                Quiz Required
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {isUnlocked && (
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-slate-600">
                          <span>Progress</span>
                          <span>{pathProgress.completed}/{pathProgress.total}</span>
                        </div>
                        <Progress value={pathProgress.percentage} className="h-2" />
                      </div>
                    </CardContent>
                  )}
                  
                  {!isUnlocked && (
                    <CardContent className="pt-0">
                      <div className="flex items-center space-x-2 text-sm text-slate-500">
                        <AlertCircle className="h-4 w-4" />
                        <span>{path.unlockMessage}</span>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Documents List */}
        <div className="lg:col-span-1">
          {selectedPath ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {selectedPath.title}
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  {selectedPath.description}
                </p>
              </div>
              
              <div className="space-y-2">
                {documents.map((document) => {
                  const isCompleted = isDocumentCompleted(document.id, selectedPath.id);
                  
                  return (
                    <Card 
                      key={document.id}
                      className={`cursor-pointer transition-all ${
                        selectedDocument?.id === document.id 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handleDocumentSelect(document)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              isCompleted 
                                ? 'bg-green-500 text-white' 
                                : 'bg-slate-200 text-slate-600'
                            }`}>
                              {isCompleted ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <Circle className="h-3 w-3" />
                              )}
                            </div>
                            <div>
                              <h4 className="text-sm font-medium">{document.title}</h4>
                              <p className="text-xs text-slate-500 capitalize">
                                {document.type}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                
                {/* Quiz Section */}
                {selectedPath.requiresQuiz && (
                  <Card 
                    className={`cursor-pointer transition-all ${
                      showQuiz 
                        ? 'ring-2 ring-purple-500 bg-purple-50' 
                        : 'hover:shadow-md border-purple-200'
                    }`}
                    onClick={handleStartQuiz}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center bg-purple-500 text-white">
                            <HelpCircle className="h-3 w-3" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Quiz: {selectedPath.title}</h4>
                            <p className="text-xs text-slate-500">
                              Test your knowledge - {questions.length} questions
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-purple-300 text-purple-700">
                          Required
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Select a Learning Path</h3>
              <p className="text-slate-600">Choose a module to view its content and materials</p>
            </div>
          )}
        </div>

        {/* Content Viewer */}
        <div className="lg:col-span-1">
          {showQuiz && selectedPath ? (
            <QAQuiz
              questions={questions}
              onComplete={handleQuizComplete}
              isLocked={false}
              onUnlock={() => {}}
            />
          ) : selectedDocument ? (
            <ContentViewer
              content={selectedDocument}
              onComplete={() => handleDocumentComplete(selectedDocument.id)}
              isCompleted={isDocumentCompleted(selectedDocument.id, selectedPath?.id || '')}
              showProgress={true}
            />
          ) : selectedPath ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Select Study Material</h3>
              <p className="text-slate-600">Choose a document or quiz to view its content</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Content Selected</h3>
              <p className="text-slate-600">Select a learning path and study material to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
