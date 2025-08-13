import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CourseCard } from "@/components/course-card";
import { EnrollmentModal } from "@/components/enrollment-modal";
import type { Course } from "@shared/schema";
import {
  CheckCircle,
  Star,
  Tag,
  ArrowRight,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  Clock,
} from "lucide-react";

export default function Landing() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Junior QA Engineer at TCS",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      content: "The structured approach and practical exercises made learning easy. Got my first testing job within 2 months of completion!",
      rating: 5,
    },
    {
      name: "Rahul Kumar", 
      role: "Automation Tester at Infosys",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      content: "Excellent content quality and the self-paced format worked perfectly with my schedule. Highly recommend the automation course!",
      rating: 5,
    },
    {
      name: "Sneha Patel",
      role: "Senior QA Lead at Wipro", 
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      content: "Great value for money! The course material is comprehensive and the certificate helped me get a promotion.",
      rating: 5,
    },
  ];

  const faqs = [
    {
      question: "Is this suitable for complete beginners?",
      answer: "Absolutely! Our courses are designed to take you from zero to job-ready, with no prior testing experience required.",
    },
    {
      question: "How do I access the course materials?",
      answer: "After enrollment and payment confirmation, you'll get access to your personal dashboard where you can download handbooks and access all course materials.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "Currently we accept UPI payments and bank transfers. After enrollment, you'll receive detailed payment instructions.",
    },
    {
      question: "Will I get a certificate?",
      answer: "Yes! Upon completing your course and passing the final exam, you'll receive an industry-recognized certificate that you can add to your resume and LinkedIn profile.",
    },
    {
      question: "Can I learn at my own pace?",
      answer: "Yes, our courses are completely self-paced. While we recommend 2 hours per day, you can adjust the schedule based on your availability.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary">TestAcademy Pro</h1>
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <a href="#courses" className="text-slate-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Courses</a>
                  <a href="#how-it-works" className="text-slate-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">How It Works</a>
                  <a href="#pricing" className="text-slate-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Pricing</a>
                  <a href="#testimonials" className="text-slate-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Reviews</a>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/api/login'}
                className="text-slate-600 hover:text-primary font-medium"
              >
                Sign In
              </Button>
              <Button
                onClick={() => window.location.href = '/api/login'}
                className="bg-primary hover:bg-blue-700 text-white font-medium"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-secondary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                Master Software Testing with Expert Guidance
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Choose from self-paced courses (₹149) or premium live video sessions (₹25,000). 
                From manual testing to automation - become job-ready in just 60-90 days.
              </p>
              <Button
                size="lg"
                onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-accent hover:bg-green-600 text-white px-8 py-4 text-lg font-semibold shadow-lg transition-all transform hover:scale-105"
              >
                Start Learning Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <div className="mt-8 flex items-center space-x-6 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="text-accent mr-2 h-4 w-4" />
                  <span>2000+ Students</span>
                </div>
                <div className="flex items-center">
                  <Star className="text-yellow-400 mr-2 h-4 w-4" />
                  <span>4.8/5 Rating</span>
                </div>
                <div className="flex items-center">
                  <Tag className="text-accent mr-2 h-4 w-4" />
                  <span>Industry Tag</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
                alt="Software testing workspace"
                className="rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Choose Your Learning Path</h2>
            <p className="text-lg text-slate-600">Structured courses designed to take you from beginner to professional</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onSelect={() => handleCourseSelect(course)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">How It Works</h2>
            <p className="text-lg text-slate-600">Simple 4-step process to start your testing career</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-2">Select Your Course</h3>
              <p className="text-slate-600">Choose the learning path that matches your career goals and timeline.</p>
            </div>
            <div className="text-center">
              <div className="bg-secondary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-2">Sign Up & Pay</h3>
              <p className="text-slate-600">Register with basic details and make payment via UPI or bank transfer.</p>
            </div>
            <div className="text-center">
              <div className="bg-accent text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-2">Start Learning</h3>
              <p className="text-slate-600">Access your dashboard, download handbooks, and complete daily exercises.</p>
            </div>
            <div className="text-center">
              <div className="bg-slate-700 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">4</div>
              <h3 className="text-xl font-semibold mb-2">Get Certified</h3>
              <p className="text-slate-600">Complete the course, pass the exam, and receive your industry certificate.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Choose Your Learning Format</h2>
            <p className="text-lg text-slate-600">Quality education with flexible pricing options to match your needs</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Regular Courses */}
            <Card className="bg-gradient-to-r from-primary to-secondary text-white">
              <CardContent className="p-8">
                <div className="text-center">
                  <Badge className="bg-accent text-white mb-4">SELF-PACED</Badge>
                  <div className="text-5xl font-bold mb-2">₹149</div>
                  <p className="text-xl mb-6">Any Self-Study Course</p>
                  <ul className="space-y-3 mb-8 text-left">
                    <li className="flex items-center">
                      <CheckCircle className="text-accent mr-3 h-4 w-4" />
                      Complete course access
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-accent mr-3 h-4 w-4" />
                      Downloadable handbooks
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-accent mr-3 h-4 w-4" />
                      Practical assignments
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-accent mr-3 h-4 w-4" />
                      Progress tracking
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-accent mr-3 h-4 w-4" />
                      Industry certificate
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-accent mr-3 h-4 w-4" />
                      Lifetime access
                    </li>
                  </ul>
                  <Button
                    size="lg"
                    onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full bg-accent hover:bg-green-600 text-white font-semibold"
                  >
                    Choose Self-Study
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Premium Live Course */}
            <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-2 border-yellow-400 shadow-lg">
              <CardContent className="p-8">
                <div className="text-center">
                  <Badge className="bg-yellow-600 text-white mb-4">PREMIUM LIVE</Badge>
                  <div className="text-5xl font-bold mb-2">₹25,000</div>
                  <p className="text-xl mb-6">Live Video Call Sessions</p>
                  <ul className="space-y-3 mb-8 text-left">
                    <li className="flex items-center">
                      <CheckCircle className="text-yellow-200 mr-3 h-4 w-4" />
                      Live video call sessions
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-yellow-200 mr-3 h-4 w-4" />
                      Direct instructor teaching
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-yellow-200 mr-3 h-4 w-4" />
                      Personal mentorship
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-yellow-200 mr-3 h-4 w-4" />
                      Manual + Automation both
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-yellow-200 mr-3 h-4 w-4" />
                      Real-time doubt clearing
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-yellow-200 mr-3 h-4 w-4" />
                      Job placement guarantee
                    </li>
                  </ul>
                  <Button
                    size="lg"
                    onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold"
                  >
                    Book Live Sessions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Success Stories</h2>
            <p className="text-lg text-slate-600">Join thousands of students who've transformed their careers</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-slate-600 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex text-yellow-400 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-700">{testimonial.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="bg-white border">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">{faq.question}</h3>
                  <p className="text-slate-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">TestAcademy Pro</h3>
              <p className="text-slate-300 mb-4">
                Empowering the next generation of software testing professionals with practical, industry-focused education.
              </p>
              <div className="flex space-x-4">
                <Facebook className="h-5 w-5 text-slate-400 hover:text-white cursor-pointer" />
                <Twitter className="h-5 w-5 text-slate-400 hover:text-white cursor-pointer" />
                <Linkedin className="h-5 w-5 text-slate-400 hover:text-white cursor-pointer" />
                <Youtube className="h-5 w-5 text-slate-400 hover:text-white cursor-pointer" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-300">
                <li><a href="#courses" className="hover:text-white">All Courses</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-300">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Student Support</a></li>
                <li><a href="#" className="hover:text-white">Technical Issues</a></li>
                <li><a href="#" className="hover:text-white">Payment Help</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-slate-300">
                <p className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  support@testacademypro.com
                </p>
                <p className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  +91 98765 43210
                </p>
                <p className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Mon-Fri: 9AM-6PM IST
                </p>
              </div>
            </div>
          </div>
          <hr className="my-8 border-slate-700" />
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">© 2024 TestAcademy Pro. All rights reserved.</p>
            <div className="flex space-x-6 text-sm text-slate-400 mt-4 md:mt-0">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
              <a href="#" className="hover:text-white">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Enrollment Modal */}
      <EnrollmentModal
        course={selectedCourse}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
