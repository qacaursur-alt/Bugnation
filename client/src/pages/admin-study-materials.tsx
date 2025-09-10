import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, BookOpen, Calendar, FileText } from 'lucide-react';
import StudyMaterialsManagerFixed from '@/components/admin/StudyMaterialsManagerFixed';

const AdminStudyMaterials = () => {
  const [, setLocation] = useLocation();
  const [courseGroupId, setCourseGroupId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('materials');

  useEffect(() => {
    // Get courseGroupId from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const groupId = urlParams.get('courseGroupId');
    const tab = urlParams.get('tab') || 'materials';
    
    if (groupId) {
      setCourseGroupId(groupId);
      setActiveTab(tab);
    }
  }, []);

  const handleBack = () => {
    setLocation('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900">Study Materials Management</h1>
          <p className="text-gray-600 mt-2">Manage study materials, modules, and live sessions for courses</p>
          
          {/* Workflow Guide */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">📚 Recommended Workflow:</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. <strong>Study Materials:</strong> Upload videos, documents, PDFs, and other materials</li>
              <li>2. <strong>Course Modules:</strong> Create modules and assign materials to each module</li>
              <li>3. <strong>Quiz Management:</strong> Create quiz questions for learning paths</li>
              <li>4. <strong>Live Sessions:</strong> Schedule live video sessions for interactive learning</li>
            </ol>
          </div>
        </div>

        {/* Tabs */}
        <StudyMaterialsManagerFixed courseGroupId={courseGroupId} />
      </div>
    </div>
  );
};

export default AdminStudyMaterials;
