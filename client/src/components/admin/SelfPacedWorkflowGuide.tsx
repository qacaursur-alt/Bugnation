import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, BookOpen, FileText, HelpCircle } from 'lucide-react';

const SelfPacedWorkflowGuide = () => {
  const steps = [
    {
      id: 1,
      title: "Create Course",
      description: "First, create a self-paced course with basic information like title, description, and price.",
      icon: BookOpen,
      status: "completed"
    },
    {
      id: 2,
      title: "Add Modules",
      description: "Create learning modules to structure your course content. Each module can have a title, description, and order.",
      icon: FileText,
      status: "current"
    },
    {
      id: 3,
      title: "Configure Quizzes",
      description: "Add quiz questions to modules. Set passing scores and unlock requirements for progressive learning.",
      icon: HelpCircle,
      status: "upcoming"
    },
    {
      id: 4,
      title: "Publish Course",
      description: "Once modules and quizzes are ready, your self-paced course is ready for students to enroll.",
      icon: CheckCircle,
      status: "upcoming"
    }
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-500" />
          Self-Paced Course Creation Workflow
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            const isLast = index === steps.length - 1;
            
            return (
              <div key={step.id} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.status === 'completed' ? 'bg-green-100 text-green-600' :
                    step.status === 'current' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  {!isLast && (
                    <div className={`w-0.5 h-8 mt-2 ${
                      step.status === 'completed' ? 'bg-green-200' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-slate-900">{step.title}</h3>
                    <Badge variant={
                      step.status === 'completed' ? 'default' :
                      step.status === 'current' ? 'secondary' :
                      'outline'
                    }>
                      {step.status === 'completed' ? 'Completed' :
                       step.status === 'current' ? 'Current Step' :
                       'Upcoming'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 Quick Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Modules are created in order - students progress through them sequentially</li>
            <li>• Quizzes can be optional or required to unlock the next module</li>
            <li>• Set appropriate passing scores (typically 70-80%) for quiz requirements</li>
            <li>• Add explanations to quiz questions to help students learn from mistakes</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SelfPacedWorkflowGuide;
