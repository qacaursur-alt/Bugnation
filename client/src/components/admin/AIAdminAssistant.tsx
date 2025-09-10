import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { Bot, Lightbulb, BookOpen, HelpCircle, TrendingUp, Users, FileText, Zap } from 'lucide-react';

interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export default function AIAdminAssistant() {
  const [query, setQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('chat');
  const [responses, setResponses] = useState<Array<{id: string, query: string, response: string, type: string}>>([]);

  const aiChatMutation = useMutation({
    mutationFn: async (data: { messages: Array<{role: string, content: string}>, context?: string }) => {
      console.log('AI Chat request:', data);
      const response = await apiRequest('POST', '/api/ai/chat', data);
      return response.json();
    },
    onSuccess: (data: AIResponse, variables) => {
      console.log('AI Chat success:', data);
      const newResponse = {
        id: Date.now().toString(),
        query: variables.messages[variables.messages.length - 1].content,
        response: data.content,
        type: 'chat'
      };
      setResponses(prev => [...prev, newResponse]);
    },
    onError: (error) => {
      console.error('AI Chat error:', error);
      const newResponse = {
        id: Date.now().toString(),
        query: 'AI Chat Error',
        response: `Error: ${error.message}. Please check if the AI service is running.`,
        type: 'error'
      };
      setResponses(prev => [...prev, newResponse]);
    }
  });

  const generateRecommendationsMutation = useMutation({
    mutationFn: async (data: { interests: string[], currentLevel: string }) => {
      console.log('AI Recommendations request:', data);
      const response = await apiRequest('POST', '/api/ai/recommendations', data);
      return response.json();
    },
    onSuccess: (data: { recommendations: string }, variables) => {
      console.log('AI Recommendations success:', data);
      const newResponse = {
        id: Date.now().toString(),
        query: `Recommendations for: ${variables.interests.join(', ')} (${variables.currentLevel} level)`,
        response: data.recommendations,
        type: 'recommendations'
      };
      setResponses(prev => [...prev, newResponse]);
    },
    onError: (error) => {
      console.error('AI Recommendations error:', error);
      const newResponse = {
        id: Date.now().toString(),
        query: 'AI Recommendations Error',
        response: `Error: ${error.message}. Please check if the AI service is running.`,
        type: 'error'
      };
      setResponses(prev => [...prev, newResponse]);
    }
  });

  const generateStudyTipsMutation = useMutation({
    mutationFn: async (data: { topic: string, difficulty: string }) => {
      const response = await apiRequest('POST', '/api/ai/study-tips', data);
      return response.json();
    },
    onSuccess: (data: { tips: string }, variables) => {
      const newResponse = {
        id: Date.now().toString(),
        query: `Study tips for: ${variables.topic} (${variables.difficulty} level)`,
        response: data.tips,
        type: 'tips'
      };
      setResponses(prev => [...prev, newResponse]);
    }
  });

  const generateQuizQuestionsMutation = useMutation({
    mutationFn: async (data: { topic: string, difficulty: string, count: number }) => {
      const response = await apiRequest('POST', '/api/ai/quiz-questions', data);
      return response.json();
    },
    onSuccess: (data: { questions: Array<any> }, variables) => {
      const questionsText = data.questions.map((q, i) => 
        `${i + 1}. ${q.question}\n   Options: ${q.options.join(', ')}\n   Correct: ${q.options[q.correct]}`
      ).join('\n\n');
      
      const newResponse = {
        id: Date.now().toString(),
        query: `Quiz questions for: ${variables.topic} (${variables.difficulty} level)`,
        response: questionsText,
        type: 'quiz'
      };
      setResponses(prev => [...prev, newResponse]);
    }
  });

  const handleChatSubmit = () => {
    if (!query.trim()) return;
    
    const chatHistory = responses
      .filter(r => r.type === 'chat')
      .map(r => [
        { role: 'user', content: r.query },
        { role: 'assistant', content: r.response }
      ])
      .flat();
    
    aiChatMutation.mutate({
      messages: [...chatHistory, { role: 'user', content: query }],
      context: 'TestCademy admin panel - help with course management, student support, content creation'
    });
    
    setQuery('');
  };

  const quickActions = [
    {
      title: 'Course Recommendations',
      description: 'Generate course recommendations for students',
      icon: <TrendingUp className="w-5 h-5" />,
      action: () => {
        const interests = prompt('Enter student interests (comma-separated):')?.split(',').map(s => s.trim()) || ['software testing'];
        const level = prompt('Enter current level (beginner/intermediate/advanced):') || 'beginner';
        generateRecommendationsMutation.mutate({ interests, currentLevel: level });
      }
    },
    {
      title: 'Study Tips',
      description: 'Generate study tips for specific topics',
      icon: <BookOpen className="w-5 h-5" />,
      action: () => {
        const topic = prompt('Enter topic:') || 'software testing';
        const difficulty = prompt('Enter difficulty (beginner/intermediate/advanced):') || 'beginner';
        generateStudyTipsMutation.mutate({ topic, difficulty });
      }
    },
    {
      title: 'Quiz Questions',
      description: 'Generate quiz questions for any topic',
      icon: <HelpCircle className="w-5 h-5" />,
      action: () => {
        const topic = prompt('Enter topic:') || 'software testing';
        const difficulty = prompt('Enter difficulty (beginner/intermediate/advanced):') || 'beginner';
        const count = parseInt(prompt('Number of questions (1-10):') || '5');
        generateQuizQuestionsMutation.mutate({ topic, difficulty, count: Math.min(Math.max(count, 1), 10) });
      }
    },
    {
      title: 'Content Ideas',
      description: 'Get ideas for course content and materials',
      icon: <FileText className="w-5 h-5" />,
      action: () => {
        const topic = prompt('Enter course topic:') || 'software testing fundamentals';
        setQuery(`Generate content ideas and learning objectives for a course on ${topic}`);
        setSelectedTab('chat');
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bot className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold">AI Admin Assistant</h2>
          <p className="text-gray-600">Get AI-powered help with course management and content creation</p>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
          <TabsTrigger value="tools">AI Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                AI Chat Assistant
              </CardTitle>
              <CardDescription>
                Ask questions about course management, student support, or get creative ideas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask me anything about course management..."
                  onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                />
                <Button 
                  onClick={handleChatSubmit}
                  disabled={!query.trim() || aiChatMutation.isPending}
                >
                  {aiChatMutation.isPending ? 'Thinking...' : 'Ask'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setQuery("Hello, can you help me with course management?");
                    handleChatSubmit();
                  }}
                  disabled={aiChatMutation.isPending}
                >
                  Test AI
                </Button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {responses.filter(r => r.type === 'chat').map((response) => (
                  <div key={response.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-sm">AI Response</span>
                    </div>
                    <p className="text-sm text-gray-700">{response.response}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer" onClick={action.action}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{action.title}</h3>
                      <p className="text-xs text-gray-600 mt-1">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>AI Generated Content</CardTitle>
              <CardDescription>View all AI-generated recommendations, tips, and questions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {responses.filter(r => r.type !== 'chat').map((response) => (
                  <div key={response.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-600" />
                        <span className="font-medium text-sm">{response.query}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {response.type}
                      </Badge>
                    </div>
                    <div className="bg-gray-50 rounded p-3">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap">{response.response}</pre>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
