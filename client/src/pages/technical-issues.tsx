import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bug, Monitor, Wifi, Video, Download, AlertTriangle, CheckCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

const TechnicalIssues = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    issueType: '',
    description: '',
    browser: '',
    operatingSystem: '',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    screenshots: false,
    errorMessages: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast({
        title: "Technical Issue Reported",
        description: "Our technical team will investigate and get back to you soon.",
      });
    }, 2000);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const commonIssues = [
    {
      id: 'video-loading',
      title: 'Video content not loading',
      icon: <Video className="h-5 w-5" />,
      color: 'bg-red-100 text-red-600',
      solutions: [
        'Check your internet connection',
        'Clear browser cache and cookies',
        'Try a different browser',
        'Disable browser extensions temporarily'
      ]
    },
    {
      id: 'login-issues',
      title: 'Cannot log in to account',
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'bg-yellow-100 text-yellow-600',
      solutions: [
        'Verify your email and password',
        'Check if Caps Lock is enabled',
        'Try password reset',
        'Clear browser data'
      ]
    },
    {
      id: 'course-access',
      title: 'Course materials not accessible',
      icon: <Download className="h-5 w-5" />,
      color: 'bg-blue-100 text-blue-600',
      solutions: [
        'Ensure payment is completed',
        'Check enrollment status',
        'Try refreshing the page',
        'Contact support if payment is confirmed'
      ]
    },
    {
      id: 'video-call',
      title: 'Video call not working',
      icon: <Monitor className="h-5 w-5" />,
      color: 'bg-green-100 text-green-600',
      solutions: [
        'Allow camera and microphone permissions',
        'Check if other apps are using camera',
        'Try a different browser',
        'Restart your browser'
      ]
    }
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Issue Reported!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for reporting this technical issue. Our team will investigate and provide a solution within 24-48 hours.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => setLocation('/')}
                className="w-full"
              >
                Back to Home
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({
                    name: '',
                    email: '',
                    issueType: '',
                    description: '',
                    browser: '',
                    operatingSystem: '',
                    stepsToReproduce: '',
                    expectedBehavior: '',
                    actualBehavior: '',
                    screenshots: false,
                    errorMessages: ''
                  });
                }}
                className="w-full"
              >
                Report Another Issue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => setLocation('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900">Technical Issues</h1>
          <p className="text-gray-600 mt-2">Report technical problems and get help from our support team</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Common Issues */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="h-5 w-5" />
                  Common Issues & Solutions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {commonIssues.map((issue) => (
                  <div key={issue.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${issue.color}`}>
                        {issue.icon}
                      </div>
                      <h4 className="font-semibold text-gray-900">{issue.title}</h4>
                    </div>
                    <ul className="space-y-1">
                      {issue.solutions.map((solution, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="text-green-500">•</span>
                          {solution}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Troubleshooting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Wifi className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Check Internet Connection</p>
                    <p className="text-sm text-gray-600">Ensure you have a stable internet connection</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Monitor className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Try Different Browser</p>
                    <p className="text-sm text-gray-600">Chrome, Firefox, Safari, or Edge</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <Download className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">Clear Browser Cache</p>
                    <p className="text-sm text-gray-600">Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Technical Issue Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Report Technical Issue</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Issue Type *
                    </label>
                    <Select value={formData.issueType} onValueChange={(value) => handleInputChange('issueType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the type of issue" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video-loading">Video content not loading</SelectItem>
                        <SelectItem value="login-issues">Login/Account issues</SelectItem>
                        <SelectItem value="course-access">Course access problems</SelectItem>
                        <SelectItem value="video-call">Video call issues</SelectItem>
                        <SelectItem value="payment">Payment processing</SelectItem>
                        <SelectItem value="performance">Slow performance</SelectItem>
                        <SelectItem value="mobile">Mobile app issues</SelectItem>
                        <SelectItem value="other">Other technical issue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Browser
                      </label>
                      <Select value={formData.browser} onValueChange={(value) => handleInputChange('browser', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your browser" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="chrome">Google Chrome</SelectItem>
                          <SelectItem value="firefox">Mozilla Firefox</SelectItem>
                          <SelectItem value="safari">Safari</SelectItem>
                          <SelectItem value="edge">Microsoft Edge</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Operating System
                      </label>
                      <Select value={formData.operatingSystem} onValueChange={(value) => handleInputChange('operatingSystem', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your OS" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="windows">Windows</SelectItem>
                          <SelectItem value="macos">macOS</SelectItem>
                          <SelectItem value="linux">Linux</SelectItem>
                          <SelectItem value="android">Android</SelectItem>
                          <SelectItem value="ios">iOS</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description of the Issue *
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe the technical issue you're experiencing..."
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Steps to Reproduce
                    </label>
                    <Textarea
                      value={formData.stepsToReproduce}
                      onChange={(e) => handleInputChange('stepsToReproduce', e.target.value)}
                      placeholder="1. Go to... 2. Click on... 3. See error..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expected Behavior
                      </label>
                      <Textarea
                        value={formData.expectedBehavior}
                        onChange={(e) => handleInputChange('expectedBehavior', e.target.value)}
                        placeholder="What should happen?"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Actual Behavior
                      </label>
                      <Textarea
                        value={formData.actualBehavior}
                        onChange={(e) => handleInputChange('actualBehavior', e.target.value)}
                        placeholder="What actually happens?"
                        rows={2}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Error Messages (if any)
                    </label>
                    <Textarea
                      value={formData.errorMessages}
                      onChange={(e) => handleInputChange('errorMessages', e.target.value)}
                      placeholder="Copy and paste any error messages you see..."
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="screenshots"
                      checked={formData.screenshots}
                      onCheckedChange={(checked) => handleInputChange('screenshots', !!checked)}
                    />
                    <label htmlFor="screenshots" className="text-sm font-medium text-gray-700">
                      I have screenshots of the issue (we'll contact you for them)
                    </label>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !formData.name || !formData.email || !formData.issueType || !formData.description}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Bug className="h-4 w-4 mr-2" />
                        Report Issue
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalIssues;
