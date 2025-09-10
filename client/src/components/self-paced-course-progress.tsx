import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface SelfPacedCourseProgressProps {
  courseGroupId: string;
  userId: string;
}

interface CourseModule {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  requiresQuiz: boolean;
  quizRequiredToUnlock: boolean;
  passingScore: number;
  maxAttempts: number;
  unlockMessage: string;
}

interface ModuleProgress {
  id: string;
  userId: string;
  groupId: string;
  moduleId: string;
  isCompleted: boolean;
  completedAt: string | null;
  quizPassed: boolean;
  quizScore: number | null;
  quizAttempts: number;
  timeSpent: number;
}

export function useSelfPacedCourseProgress(courseGroupId: string, userId: string) {
  // Fetch course modules
  const { data: modules = [], isLoading: modulesLoading, error: modulesError } = useQuery({
    queryKey: ["/api/course-modules", courseGroupId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/course-modules?courseGroupId=${courseGroupId}`);
      return response.json();
    },
    enabled: !!courseGroupId,
  });

  // Fetch module progress
  const { data: progress = [], isLoading: progressLoading, error: progressError } = useQuery({
    queryKey: ["/api/module-progress", userId, courseGroupId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/module-progress?userId=${userId}&groupId=${courseGroupId}`);
      return response.json();
    },
    enabled: !!userId && !!courseGroupId,
  });

  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (!modules.length) return 0;
    
    const completedModules = modules.filter((module: CourseModule) => {
      const moduleProgress = progress.find((p: ModuleProgress) => p.moduleId === module.id);
      return moduleProgress?.isCompleted || false;
    }).length;
    
    return (completedModules / modules.length) * 100;
  };

  // Calculate module progress
  const getModuleProgress = (moduleId: string) => {
    const moduleProgress = progress.find((p: ModuleProgress) => p.moduleId === moduleId);
    return {
      isCompleted: moduleProgress?.isCompleted || false,
      quizPassed: moduleProgress?.quizPassed || false,
      quizScore: moduleProgress?.quizScore || null,
      quizAttempts: moduleProgress?.quizAttempts || 0,
      timeSpent: moduleProgress?.timeSpent || 0,
      completedAt: moduleProgress?.completedAt || null
    };
  };

  // Check if module is unlocked
  const isModuleUnlocked = (module: CourseModule, index: number) => {
    if (index === 0) return true;
    
    const previousModule = modules[index - 1];
    if (!previousModule) return true;
    
    if (!previousModule.quizRequiredToUnlock) return true;
    
    const previousModuleProgress = getModuleProgress(previousModule.id);
    return previousModuleProgress.isCompleted && previousModuleProgress.quizPassed;
  };

  // Get next unlocked module
  const getNextUnlockedModule = () => {
    for (let i = 0; i < modules.length; i++) {
      const module = modules[i];
      if (isModuleUnlocked(module, i)) {
        const moduleProgress = getModuleProgress(module.id);
        if (!moduleProgress.isCompleted) {
          return { module, index: i };
        }
      }
    }
    return null;
  };

  return {
    modules: modules as CourseModule[],
    progress: progress as ModuleProgress[],
    overallProgress: calculateOverallProgress(),
    getModuleProgress,
    isModuleUnlocked,
    getNextUnlockedModule,
    isLoading: modulesLoading || progressLoading,
    error: modulesError || progressError
  };
}

export default useSelfPacedCourseProgress;
