import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, HelpCircle, BookOpen, Video, CreditCard, User, Settings } from 'lucide-react';
import { useLocation } from 'wouter';

const HelpCenter = () => {
  const [, setLocation] = useLocation();

  const faqCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <BookOpen className="h-5 w-5" />,
      color: 'bg-blue-100 text-blue-600',
      questions: [
        {
          question: 'How do I enroll in a course?',
          answer: 'To enroll in a course, browse our available courses, select the one you want, and click "Enroll Now". You\'ll be redirected to complete your enrollment and payment.'
        },
        {
          question: 'What is the difference between self-paced and live courses?',
          answer: 'Self-paced courses allow you to learn at your own speed with pre-recorded materials. Live courses include scheduled video sessions with instructors and real-time interaction.'
        },
        {
          question: 'How do I access my course materials?',
          answer: 'Once enrolled and payment is confirmed, you can access your course materials through your dashboard. Navigate to "My Courses" and select your enrolled course.'
        }
      ]
    },
    {
      id: 'technical',
      title: 'Technical Support',
      icon: <Settings className="h-5 w-5" />,
      color: 'bg-green-100 text-green-600',
      questions: [
        {
          question: 'I can\'t access my course materials. What should I do?',
          answer: 'First, ensure your payment is completed. If payment is confirmed, try logging out and logging back in. If the issue persists, contact our technical support team.'
        },
        {
          question: 'Video content is not loading properly. How can I fix this?',
          answer: 'Check your internet connection and try refreshing the page. If videos still don\'t load, try using a different browser or clearing your browser cache.'
        },
        {
          question: 'I\'m having trouble with the video call feature. What should I do?',
          answer: 'Ensure you have granted camera and microphone permissions to your browser. Try refreshing the page and joining the call again. If issues persist, contact support.'
        }
      ]
    },
    {
      id: 'payment',
      title: 'Payment & Billing',
      icon: <CreditCard className="h-5 w-5" />,
      color: 'bg-purple-100 text-purple-600',
      questions: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards, debit cards, and UPI payments through our secure payment gateway.'
        },
        {
          question: 'Can I get a refund if I\'m not satisfied?',
          answer: 'We offer a 7-day money-back guarantee for all courses. Contact our support team within 7 days of enrollment for a full refund.'
        },
        {
          question: 'I made a payment but my course is still locked. What should I do?',
          answer: 'Payment processing can take a few minutes. If your course is still locked after 30 minutes, please contact our support team with your payment details.'
        }
      ]
    },
    {
      id: 'account',
      title: 'Account & Profile',
      icon: <User className="h-5 w-5" />,
      color: 'bg-orange-100 text-orange-600',
      questions: [
        {
          question: 'How do I update my profile information?',
          answer: 'You can update your profile information by going to your dashboard and clicking on your profile picture, then selecting "Edit Profile".'
        },
        {
          question: 'I forgot my password. How can I reset it?',
          answer: 'Click on "Forgot Password" on the login page and enter your email address. You\'ll receive a password reset link in your email.'
        },
        {
          question: 'How do I change my email address?',
          answer: 'Contact our support team to change your email address. We\'ll need to verify your identity before making this change.'
        }
      ]
    }
  ];

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
          
          <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
          <p className="text-gray-600 mt-2">Find answers to common questions and get support</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search for help articles, FAQs, and guides..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Video Tutorials</h3>
              <p className="text-sm text-gray-600">Watch step-by-step guides</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-sm text-gray-600">Get instant help from our team</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Documentation</h3>
              <p className="text-sm text-gray-600">Detailed guides and references</p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
          
          {faqCategories.map((category) => (
            <Card key={category.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${category.color}`}>
                    {category.icon}
                  </div>
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {category.questions.map((faq, index) => (
                    <div key={index} className="p-6 hover:bg-gray-50">
                      <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-12">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Still need help?</h3>
              <p className="text-gray-600 mb-6">Our support team is here to help you succeed</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => setLocation('/student-support')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Contact Support
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setLocation('/technical-issues')}
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Report Technical Issue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
