import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  CheckCircle, 
  Lock, 
  Play, 
  FileText,
  Clock,
  Award,
  AlertCircle
} from 'lucide-react';
import useSelfPacedCourseProgress from './self-paced-course-progress';

interface SelfPacedCourseViewerProps {
  courseGroupId: string;
  userId: string;
  courseName: string;
}

export default function SelfPacedCourseViewer({ 
  courseGroupId, 
  userId, 
  courseName 
}: SelfPacedCourseViewerProps) {
  const {
    modules,
    overallProgress,
    getModuleProgress,
    isModuleUnlocked,
    getNextUnlockedModule,
    isLoading,
    error
  } = useSelfPacedCourseProgress(courseGroupId, userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Course</h3>
          <p className="text-slate-600">Failed to load course modules and progress.</p>
        </div>
      </div>
    );
  }

  const nextModule = getNextUnlockedModule();

  return (
    <div className="space-y-6">
      {/* Course Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-blue-500" />
                {courseName}
              </CardTitle>
              <p className="text-slate-600 mt-1">Self-Paced Learning Course</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(overallProgress)}%
              </div>
              <p className="text-sm text-slate-500">Overall Progress</p>
            </div>
          </div>
          <Progress value={overallProgress} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Next Module to Study */}
      {nextModule && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Play className="h-5 w-5" />
              Continue Learning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900">
                  Module {nextModule.index + 1}: {nextModule.module.title}
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  {nextModule.module.description}
                </p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Play className="h-4 w-4 mr-2" />
                Start Module
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Modules */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Course Modules</h3>
        <div className="grid gap-4">
          {modules.map((module, index) => {
            const moduleProgress = getModuleProgress(module.id);
            const isUnlocked = isModuleUnlocked(module, index);
            const isCompleted = moduleProgress.isCompleted;
            const isCurrent = nextModule?.module.id === module.id;

            return (
              <Card 
                key={module.id} 
                className={`transition-all ${
                  isCurrent ? 'ring-2 ring-blue-500 bg-blue-50' : 
                  isCompleted ? 'bg-green-50 border-green-200' :
                  !isUnlocked ? 'bg-gray-50 border-gray-200' : 
                  'hover:shadow-md'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        isCompleted ? 'bg-green-500 text-white' :
                        isCurrent ? 'bg-blue-500 text-white' :
                        !isUnlocked ? 'bg-gray-400 text-white' :
                        'bg-slate-500 text-white'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : !isUnlocked ? (
                          <Lock className="h-6 w-6" />
                        ) : (
                          <FileText className="h-6 w-6" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-slate-900">
                            Module {index + 1}: {module.title}
                          </h4>
                          <Badge variant={
                            isCompleted ? 'default' :
                            isCurrent ? 'secondary' :
                            !isUnlocked ? 'outline' :
                            'secondary'
                          }>
                            {isCompleted ? 'Completed' :
                             isCurrent ? 'Current' :
                             !isUnlocked ? 'Locked' :
                             'Available'}
                          </Badge>
                          {module.requiresQuiz && (
                            <Badge variant="outline" className="text-xs">
                              Quiz Required
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-slate-600 mb-3">
                          {module.description}
                        </p>
                        
                        {module.requiresQuiz && (
                          <div className="text-xs text-slate-500 mb-2">
                            <div className="flex items-center gap-4">
                              <span>Passing Score: {module.passingScore}%</span>
                              <span>Max Attempts: {module.maxAttempts}</span>
                              {moduleProgress.quizAttempts > 0 && (
                                <span>Attempts: {moduleProgress.quizAttempts}/{module.maxAttempts}</span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {!isUnlocked && module.unlockMessage && (
                          <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                            {module.unlockMessage}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      {isCompleted && (
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">
                            Completed
                          </div>
                          {moduleProgress.completedAt && (
                            <div className="text-xs text-slate-500">
                              {new Date(moduleProgress.completedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {isUnlocked && !isCompleted && (
                        <Button 
                          size="sm" 
                          className={isCurrent ? 'bg-blue-600 hover:bg-blue-700' : ''}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          {isCurrent ? 'Continue' : 'Start'}
                        </Button>
                      )}
                      
                      {!isUnlocked && (
                        <div className="text-right text-sm text-slate-500">
                          Complete previous module
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Progress Bar for Current Module */}
                  {isCurrent && !isCompleted && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm text-slate-600 mb-1">
                        <span>Module Progress</span>
                        <span>{Math.round(moduleProgress.timeSpent > 0 ? Math.min((moduleProgress.timeSpent / 30) * 100, 100) : 0)}%</span>
                      </div>
                      <Progress 
                        value={moduleProgress.timeSpent > 0 ? Math.min((moduleProgress.timeSpent / 30) * 100, 100) : 0} 
                        className="h-2" 
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Course Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Course Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {modules.length}
              </div>
              <p className="text-sm text-slate-500">Total Modules</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {modules.filter(m => getModuleProgress(m.id).isCompleted).length}
              </div>
              <p className="text-sm text-slate-500">Completed</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {modules.filter(m => m.requiresQuiz).length}
              </div>
              <p className="text-sm text-slate-500">Quizzes</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(overallProgress)}%
              </div>
              <p className="text-sm text-slate-500">Progress</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
