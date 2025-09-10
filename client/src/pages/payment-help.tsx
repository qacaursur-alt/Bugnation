import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Shield, Clock, CheckCircle, AlertCircle, HelpCircle, Phone } from 'lucide-react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

const PaymentHelp = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    issueType: '',
    transactionId: '',
    amount: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast({
        title: "Payment Issue Reported",
        description: "Our payment support team will assist you within 24 hours.",
      });
    }, 2000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const paymentMethods = [
    {
      name: 'Credit/Debit Cards',
      icon: <CreditCard className="h-5 w-5" />,
      color: 'bg-blue-100 text-blue-600',
      description: 'Visa, Mastercard, American Express'
    },
    {
      name: 'UPI Payments',
      icon: <Phone className="h-5 w-5" />,
      color: 'bg-green-100 text-green-600',
      description: 'Google Pay, PhonePe, Paytm, BHIM'
    },
    {
      name: 'Net Banking',
      icon: <Shield className="h-5 w-5" />,
      color: 'bg-purple-100 text-purple-600',
      description: 'All major Indian banks'
    }
  ];

  const commonIssues = [
    {
      title: 'Payment failed but money deducted',
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      solution: 'This usually resolves automatically within 24-48 hours. If not, contact us with your transaction details.'
    },
    {
      title: 'Course still locked after payment',
      icon: <Clock className="h-5 w-5 text-yellow-500" />,
      solution: 'Payment processing can take up to 30 minutes. If still locked after that, contact our support team.'
    },
    {
      title: 'Refund not received',
      icon: <HelpCircle className="h-5 w-5 text-blue-500" />,
      solution: 'Refunds take 5-7 business days to reflect in your account. Check with your bank if it takes longer.'
    },
    {
      title: 'Payment gateway error',
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      solution: 'Try a different payment method or browser. Clear your browser cache and try again.'
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Issue Reported!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for contacting us. Our payment support team will investigate and resolve your issue within 24 hours.
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
                    transactionId: '',
                    amount: '',
                    description: ''
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
          
          <h1 className="text-3xl font-bold text-gray-900">Payment Help</h1>
          <p className="text-gray-600 mt-2">Get assistance with payment issues and billing questions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods & Common Issues */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Accepted Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map((method, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className={`p-2 rounded-lg ${method.color}`}>
                      {method.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{method.name}</p>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Common Payment Issues</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {commonIssues.map((issue, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      {issue.icon}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{issue.title}</h4>
                        <p className="text-sm text-gray-600">{issue.solution}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Refund Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">7-day money-back guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600">Refunds processed within 5-7 business days</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-gray-600">Secure payment processing</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Support Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Report Payment Issue</CardTitle>
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
                        <SelectValue placeholder="Select the type of payment issue" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="payment-failed">Payment failed but money deducted</SelectItem>
                        <SelectItem value="course-locked">Course still locked after payment</SelectItem>
                        <SelectItem value="refund-issue">Refund not received</SelectItem>
                        <SelectItem value="gateway-error">Payment gateway error</SelectItem>
                        <SelectItem value="double-charge">Double charged</SelectItem>
                        <SelectItem value="partial-refund">Partial refund needed</SelectItem>
                        <SelectItem value="billing-inquiry">Billing inquiry</SelectItem>
                        <SelectItem value="other">Other payment issue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transaction ID
                      </label>
                      <Input
                        value={formData.transactionId}
                        onChange={(e) => handleInputChange('transactionId', e.target.value)}
                        placeholder="Enter transaction ID if available"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount (₹)
                      </label>
                      <Input
                        value={formData.amount}
                        onChange={(e) => handleInputChange('amount', e.target.value)}
                        placeholder="Enter amount paid"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description of the Issue *
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Please provide detailed information about your payment issue..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Important Information</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Please include your transaction ID and payment method used</li>
                      <li>• Screenshots of error messages are helpful</li>
                      <li>• We'll respond within 24 hours during business days</li>
                      <li>• Refunds are processed within 5-7 business days</li>
                    </ul>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !formData.name || !formData.email || !formData.issueType || !formData.description}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Submit Payment Issue
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

export default PaymentHelp;
