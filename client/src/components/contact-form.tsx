import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Send, CheckCircle, MessageCircle, Mail, Phone, Clock } from "lucide-react";

interface ContactFormProps {
  onSuccess?: () => void;
}

export function ContactForm({ onSuccess }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    courseInterest: "",
    message: "",
  });

  const submitEnquiryMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Transform data to match backend API expectations
      // For contact form enquiries, always send null for courseId since these are general enquiries
      const enquiryData = {
        fullName: data.name,
        email: data.email,
        phone: data.phone,
        courseId: null, // Contact form is for general enquiries, not specific course enrollments
        message: data.message,
        courseInterest: data.courseInterest,
      };
      return apiRequest("POST", "/api/enquiries", enquiryData);
    },
    onSuccess: () => {
      toast({
        title: "Enquiry submitted successfully!",
        description: "We'll get back to you within 24 hours.",
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        courseInterest: "",
        message: "",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit enquiry",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Please fill required fields",
        description: "Name, email, and message are required.",
        variant: "destructive",
      });
      return;
    }
    submitEnquiryMutation.mutate(formData);
  };

  const handleWhatsAppContact = () => {
    const message = `Hi! I'm interested in learning more about your software testing courses. Can you please provide more information?`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/919876543210?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmailContact = () => {
    const subject = "Enquiry about Software Testing Courses";
    const body = "Hi,\n\nI'm interested in learning more about your software testing courses. Please provide more information.\n\nThank you!";
    const mailtoUrl = `mailto:info@testacademy.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="space-y-8">
      {/* Contact Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-green-600" />
              WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              Get instant responses and quick answers to your questions.
            </p>
            <Button 
              onClick={handleWhatsAppContact}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat on WhatsApp
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2 text-blue-600" />
              Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              Send us a detailed message and we'll respond within 24 hours.
            </p>
            <Button 
              onClick={handleEmailContact}
              variant="outline"
              className="w-full"
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Contact Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Phone className="h-5 w-5 mr-2 text-slate-600" />
            Contact Form
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <Label htmlFor="courseInterest">Course Interest</Label>
                <Select
                  value={formData.courseInterest}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, courseInterest: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course interest" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self-paced">Self-Paced Learning (₹149)</SelectItem>
                    <SelectItem value="premium-live">Premium Live Classes (₹25,000)</SelectItem>
                    <SelectItem value="both">Both Courses</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Tell us about your learning goals, questions, or any specific requirements..."
                rows={4}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={submitEnquiryMutation.isPending}
              className="w-full"
            >
              {submitEnquiryMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Enquiry
                </>
              )}
            </Button>
          </form>

          {/* Contact Info */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-medium text-slate-900">WhatsApp</h4>
                <p className="text-sm text-slate-600">+91 98765 43210</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-slate-900">Email</h4>
                <p className="text-sm text-slate-600">info@testacademy.com</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-medium text-slate-900">Hours</h4>
                <p className="text-sm text-slate-600">9 AM - 7 PM</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
