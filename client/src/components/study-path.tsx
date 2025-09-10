import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { QAQuiz } from "./qa-quiz";
import { 
  BookOpen, 
  FileText, 
  Play, 
  Lock, 
  CheckCircle, 
  Clock,
  Award,
  Brain
} from "lucide-react";

interface Document {
  id: string;
  title: string;
  description: string;
  type: string;
  fileUrl?: string;
  externalUrl?: string;
  orderIndex: number;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  documents: Document[];
}

interface LearningPathProgress {
  id: string;
  learningPathId: string;
  documentId?: string;
  isCompleted: boolean;
  completedAt?: string;
  score?: number;
  attempts: number;
}

interface StudyPathProps {
  groupId: string;
  paths: LearningPath[];
}

export function StudyPath({ groupId, paths }: StudyPathProps) {
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentPathProgress, setCurrentPathProgress] = useState<LearningPathProgress[]>([]);

  // Fetch user progress for the selected path
  const { data: progress = [] } = useQuery({
    queryKey: [`/api/me/progress/${selectedPath?.id}`],
    enabled: !!selectedPath,
  });

  // Fetch questions for the selected path
  const { data: questions = [] } = useQuery({
    queryKey: [`/api/learning-paths/${selectedPath?.id}/questions`],
    enabled: !!selectedPath && showQuiz,
  });

  useEffect(() => {
    if (progress) {
      setCurrentPathProgress(progress);
    }
  }, [progress]);

  const isPathCompleted = (pathId: string) => {
    return currentPathProgress.some(p => p.learningPathId === pathId && p.isCompleted);
  };

  const isPathLocked = (pathIndex: number) => {
    if (pathIndex === 0) return false; // First path is always unlocked
    const previousPath = paths[pathIndex - 1];
    return !isPathCompleted(previousPath.id);
  };

  const isDocumentLocked = (pathIndex: number, docIndex: number) => {
    const path = paths[pathIndex];
    if (docIndex === 0) return isPathLocked(pathIndex); // First document depends on path lock
    const previousDoc = path.documents[docIndex - 1];
    return !currentPathProgress.some(p => p.documentId === previousDoc.id && p.isCompleted);
  };

  const getPathProgress = (pathId: string) => {
    const pathProgress = currentPathProgress.filter(p => p.learningPathId === pathId);
    const completedDocs = pathProgress.filter(p => p.isCompleted).length;
    const totalDocs = paths.find(p => p.id === pathId)?.documents.length || 0;
    return totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0;
  };

  const handleDocumentClick = (path: LearningPath, document: Document, pathIndex: number, docIndex: number) => {
    if (isDocumentLocked(pathIndex, docIndex)) {
      return; // Don't allow access to locked content
    }
    
    setSelectedPath(path);
    setSelectedDocument(document);
    setShowQuiz(false);
  };

  const handleQuizComplete = (score: number, passed: boolean) => {
    if (passed) {
      // Refresh progress data
      window.location.reload();
    }
    setShowQuiz(false);
  };

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };

  if (showQuiz && selectedPath) {
    return (
      <QAQuiz
        questions={questions}
        onComplete={handleQuizComplete}
        isLocked={false}
        onUnlock={() => setShowQuiz(false)}
      />
    );
  }

  if (selectedDocument) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{selectedDocument.title}</h2>
            <p className="text-muted-foreground">{selectedDocument.description}</p>
          </div>
          <Button onClick={() => setSelectedDocument(null)} variant="outline">
            Back to Study Path
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-6">
            {selectedDocument.type === 'pdf' && selectedDocument.fileUrl ? (
              <iframe
                src={selectedDocument.fileUrl}
                className="w-full h-96 border rounded"
                title={selectedDocument.title}
              />
            ) : selectedDocument.externalUrl ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">External content</p>
                <Button asChild>
                  <a href={selectedDocument.externalUrl} target="_blank" rel="noopener noreferrer">
                    <Play className="h-4 w-4 mr-2" />
                    Open Content
                  </a>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-4" />
                <p>Content not available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button onClick={handleStartQuiz} className="bg-primary">
            <Brain className="h-4 w-4 mr-2" />
            Take Quiz to Unlock Next Session
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Study Path</h2>
        <p className="text-muted-foreground">
          Complete each session in order. Pass the quiz to unlock the next session.
        </p>
      </div>

      <div className="space-y-4">
        {paths.map((path, pathIndex) => {
          const isLocked = isPathLocked(pathIndex);
          const isCompleted = isPathCompleted(path.id);
          const progress = getPathProgress(path.id);

          return (
            <Card key={path.id} className={`${isLocked ? 'opacity-60' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${isCompleted ? 'bg-green-500' : isLocked ? 'bg-gray-400' : 'bg-primary'}`}>
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-white" />
                      ) : isLocked ? (
                        <Lock className="h-5 w-5 text-white" />
                      ) : (
                        <BookOpen className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{path.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{path.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={isCompleted ? "default" : isLocked ? "secondary" : "outline"}>
                      {isCompleted ? "Completed" : isLocked ? "Locked" : "Available"}
                    </Badge>
                    {!isLocked && (
                      <div className="mt-2">
                        <Progress value={progress} className="w-24" />
                        <p className="text-xs text-muted-foreground mt-1">{progress}%</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {path.documents.map((document, docIndex) => {
                    const isDocLocked = isDocumentLocked(pathIndex, docIndex);
                    const isDocCompleted = currentPathProgress.some(
                      p => p.documentId === document.id && p.isCompleted
                    );

                    return (
                      <div
                        key={document.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          isDocLocked ? 'bg-gray-50 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'
                        }`}
                        onClick={() => handleDocumentClick(path, document, pathIndex, docIndex)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-1 rounded ${isDocCompleted ? 'bg-green-500' : isDocLocked ? 'bg-gray-400' : 'bg-blue-500'}`}>
                            {isDocCompleted ? (
                              <CheckCircle className="h-4 w-4 text-white" />
                            ) : isDocLocked ? (
                              <Lock className="h-4 w-4 text-white" />
                            ) : (
                              <FileText className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{document.title}</p>
                            <p className="text-sm text-muted-foreground">{document.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isDocCompleted && (
                            <Badge variant="default" className="bg-green-500">
                              <Award className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                          {isDocLocked && (
                            <Badge variant="secondary">
                              <Lock className="h-3 w-3 mr-1" />
                              Locked
                            </Badge>
                          )}
                          {!isDocLocked && !isDocCompleted && (
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              Available
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
