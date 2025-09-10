import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CourseCard } from "@/components/course-card";
import { EnrollmentModal } from "@/components/enrollment-modal";
import { EnrollmentConfirmationModal } from "@/components/enrollment-confirmation-modal";
import { ContactForm } from "@/components/contact-form";
import { PPTViewer, softwareTestingSlides } from "@/components/ppt-viewer";
import MaterialButton from "@/components/ui/material-button";
import MaterialCard from "@/components/ui/material-card";
import { FullScreenPreloader } from "@/components/logo-preloader";
import { useAuth } from "@/hooks/useAuth";
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
  User,
  LogOut,
  Presentation,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Smooth scroll function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const [enrollmentModal, setEnrollmentModal] = useState<{
    isOpen: boolean;
    courseGroup: any;
    initialStudyPath?: "self-paced" | "premium-live";
  }>({
    isOpen: false,
    courseGroup: null,
    initialStudyPath: "self-paced",
  });
  const [isScrolled, setIsScrolled] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isPPTViewerOpen, setIsPPTViewerOpen] = useState(false);
  const [expandedFAQs, setExpandedFAQs] = useState<Set<string>>(new Set());
  const { user, isAuthenticated } = useAuth();

  // Define proper types for content
  interface HomeContent {
    id: string;
    section: string;
    title: string;
    subtitle: string;
    description: string;
    content?: any;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    isActive: boolean;
    orderIndex: number;
    createdAt: string;
    updatedAt: string;
  }

  interface Testimonial {
    id: string;
    name: string;
    role: string;
    company: string;
    image?: string;
    content: string;
    rating: number;
    isActive: boolean;
    orderIndex: number;
    createdAt: string;
    updatedAt: string;
  }

  interface FAQ {
    id: string;
    question: string;
    answer: string;
    isActive: boolean;
    orderIndex: number;
    createdAt: string;
    updatedAt: string;
  }

  // Fetch featured courses for the "Choose Your Learning Path" section
  const { data: featuredCourses = [] } = useQuery<any[]>({
    queryKey: ["/api/featured-courses"],
    queryFn: async () => {
      const response = await fetch('/api/featured-courses');
      if (!response.ok) {
        throw new Error('Failed to fetch featured courses');
      }
      return response.json();
    },
  });

  // Fetch all course groups for the "Available Courses" section
  const { data: courseGroups = [] } = useQuery<any[]>({
    queryKey: ["/api/course-groups"],
    queryFn: async () => {
      const response = await fetch('/api/course-groups');
      if (!response.ok) {
        throw new Error('Failed to fetch course groups');
      }
      return response.json();
    },
  });

  const { data: homeContent = [], isLoading: homeContentLoading, error: homeContentError } = useQuery<HomeContent[]>({
    queryKey: ["/api/home-content"],
    retry: 3,
    staleTime: 30 * 1000, // 30 seconds for faster updates
    refetchInterval: 60 * 1000, // Refetch every minute
  });

  const { data: testimonialsData = [], isLoading: testimonialsLoading, error: testimonialsError } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
    retry: 3,
    staleTime: 5 * 60 * 1000,
  });

  const { data: faqsData = [], isLoading: faqsLoading, error: faqsError } = useQuery<FAQ[]>({
    queryKey: ["/api/faqs"],
    retry: 3,
    staleTime: 5 * 60 * 1000,
  });

  // No preloader delays - content shows immediately

  // Handle scroll for sticky navigation
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // No intersection observer - no scroll animations



  // Helper functions to get content with fallbacks and proper error handling
  const getContentBySection = (section: string, key: keyof HomeContent, fallback: string): string => {
    if (homeContentError) {
      console.warn('Error loading home content:', homeContentError);
      return fallback;
    }
    
    const content = homeContent.find((c: HomeContent) => c.section === section);
    if (!content) {
      return fallback;
    }
    
    const value = content[key];
    return typeof value === 'string' ? value : fallback;
  };

  const getHeroContent = () => ({
    mainHeading: getContentBySection('hero-title', 'title', 'Master Software Testing'),
    tagline: getContentBySection('hero-tagline', 'title', 'Where Bugs Meet Their Match'),
    description: getContentBySection('hero-description', 'description', 'Choose from self-paced courses (₹149) or premium live video sessions (₹25,000). From manual testing to automation - become job-ready in just 60-90 days.'),
    ctaText: getContentBySection('hero-cta', 'title', 'Start Learning Now')
  });

  const getStatsContent = () => {
    if (homeContentError) {
      console.warn('Error loading stats content:', homeContentError);
      return {
        students: '2000+',
        rating: '4.8/5',
        jobs: '95%'
      };
    }
    
    const statsSection = homeContent.filter((c: HomeContent) => c.section.startsWith('stats-'));
    return {
      students: statsSection.find((s: HomeContent) => s.section === 'stats-students')?.subtitle || '2000+',
      rating: statsSection.find((s: HomeContent) => s.section === 'stats-rating')?.subtitle || '4.8/5',
      jobs: statsSection.find((s: HomeContent) => s.section === 'stats-jobs')?.subtitle || '95%'
    };
  };

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handlePurchase = (group: any) => {
    if (!isAuthenticated) {
      window.location.href = '/signin';
      return;
    }
    
    // Determine the initial study path based on the group course type
    const initialStudyPath = group.courseType === 'live' ? 'premium-live' : 'self-paced';
    console.log("Landing: Course type:", group.courseType, "Initial study path:", initialStudyPath);
    console.log("Landing: Full group object:", group);
    
    // For logged-in users, show enrollment confirmation modal
    setEnrollmentModal({
      isOpen: true,
      courseGroup: {
        ...group,
        courseType: group.courseType, // Ensure courseType is explicitly passed
      },
      initialStudyPath,
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      window.location.href = "/";
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
      console.error("Signout failed:", error);
      }
      window.location.href = "/";
    }
  };

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(faqId)) {
        newSet.delete(faqId);
      } else {
        newSet.add(faqId);
      }
      return newSet;
    });
  };

  // Use database content with fallbacks and proper error handling
  const testimonials: Testimonial[] = testimonialsError ? [
    {
      id: 'fallback-1',
      name: "Priya Sharma",
      role: "Junior QA Engineer at TCS",
      company: "TCS",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      content: "The structured approach and practical exercises made learning easy. Got my first testing job within 2 months of completion!",
      rating: 5,
      isActive: true,
      orderIndex: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'fallback-2',
      name: "Rahul Kumar", 
      role: "Automation Tester at Infosys",
      company: "Infosys",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      content: "Excellent content quality and the self-paced format worked perfectly with my schedule. Highly recommend the automation course!",
      rating: 5,
      isActive: true,
      orderIndex: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'fallback-3',
      name: "Sneha Patel",
      role: "Senior QA Lead at Wipro", 
      company: "Wipro",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      content: "Great value for money! The course material is comprehensive and the certificate helped me get a promotion.",
      rating: 5,
      isActive: true,
      orderIndex: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ] : testimonialsData.length > 0 ? testimonialsData : [
    {
      id: 'fallback-1',
      name: "Priya Sharma",
      role: "Junior QA Engineer at TCS",
      company: "TCS",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      content: "The structured approach and practical exercises made learning easy. Got my first testing job within 2 months of completion!",
      rating: 5,
      isActive: true,
      orderIndex: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'fallback-2',
      name: "Rahul Kumar", 
      role: "Automation Tester at Infosys",
      company: "Infosys",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      content: "Excellent content quality and the self-paced format worked perfectly with my schedule. Highly recommend the automation course!",
      rating: 5,
      isActive: true,
      orderIndex: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'fallback-3',
      name: "Sneha Patel",
      role: "Senior QA Lead at Wipro",
      company: "Wipro",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      content: "Great value for money! The course material is comprehensive and the certificate helped me get a promotion.",
      rating: 5,
      isActive: true,
      orderIndex: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const faqs: FAQ[] = faqsError ? [
    {
      id: 'fallback-1',
      question: "Is this suitable for complete beginners?",
      answer: "Absolutely! Our courses are designed to take you from zero to job-ready, with no prior testing experience required.",
      isActive: true,
      orderIndex: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'fallback-2',
      question: "How do I access the course materials?",
      answer: "After enrollment and payment confirmation, you'll get access to your personal dashboard where you can download handbooks and access all course materials.",
      isActive: true,
      orderIndex: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'fallback-3',
      question: "What payment methods do you accept?",
      answer: "Currently we accept UPI payments and bank transfers. After enrollment, you'll receive detailed payment instructions.",
      isActive: true,
      orderIndex: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'fallback-4',
      question: "Will I get a certificate?",
      answer: "Yes! Upon completing your course and passing the final exam, you'll receive an industry-recognized certificate that you can add to your resume and LinkedIn profile.",
      isActive: true,
      orderIndex: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'fallback-5',
      question: "Can I learn at my own pace?",
      answer: "Yes, our courses are completely self-paced. While we recommend 2 hours per day, you can adjust the schedule based on your availability.",
      isActive: true,
      orderIndex: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'fallback-6',
      question: "What if I have questions during the course?",
      answer: "We provide dedicated support through WhatsApp groups and email. Our instructors are available to help you throughout your learning journey.",
      isActive: true,
      orderIndex: 6,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ] : faqsData.length > 0 ? faqsData : [
    {
      id: 'fallback-1',
      question: "Is this suitable for complete beginners?",
      answer: "Absolutely! Our courses are designed to take you from zero to job-ready, with no prior testing experience required.",
      isActive: true,
      orderIndex: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'fallback-2',
      question: "How do I access the course materials?",
      answer: "After enrollment and payment confirmation, you'll get access to your personal dashboard where you can download handbooks and access all course materials.",
      isActive: true,
      orderIndex: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'fallback-3',
      question: "What payment methods do you accept?",
      answer: "Currently we accept UPI payments and bank transfers. After enrollment, you'll receive detailed payment instructions.",
      isActive: true,
      orderIndex: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'fallback-4',
      question: "Will I get a certificate?",
      answer: "Yes! Upon completing your course and passing the final exam, you'll receive an industry-recognized certificate that you can add to your resume and LinkedIn profile.",
      isActive: true,
      orderIndex: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'fallback-5',
      question: "Can I learn at my own pace?",
      answer: "Yes, our courses are completely self-paced. While we recommend 2 hours per day, you can adjust the schedule based on your availability.",
      isActive: true,
      orderIndex: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // No preloader - content shows immediately

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 ${
        isScrolled 
          ? 'bg-white shadow-lg border-b backdrop-blur-md' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a href="/" className="flex items-center">
                <img 
                  src="/attached_assets/New Project (4).png" 
                  alt="Debug Nation Logo" 
                  className={`h-8 w-auto ${
                    isScrolled 
                      ? 'opacity-100 brightness-0' 
                      : 'opacity-90 brightness-0 invert drop-shadow-lg'
                  }`}
                />
              </a>
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <button onClick={() => scrollToSection('courses')} className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isScrolled 
                      ? 'text-slate-600 hover:text-primary' 
                      : 'text-white/90 hover:text-white drop-shadow-md'
                  }`}>Courses</button>
                  <button onClick={() => scrollToSection('how-it-works')} className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isScrolled 
                      ? 'text-slate-600 hover:text-primary' 
                      : 'text-white/90 hover:text-white drop-shadow-md'
                  }`}>How It Works</button>
                  <button onClick={() => scrollToSection('pricing')} className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isScrolled 
                      ? 'text-slate-600 hover:text-primary' 
                      : 'text-white/90 hover:text-white drop-shadow-md'
                  }`}>Pricing</button>
                  <button onClick={() => scrollToSection('testimonials')} className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isScrolled 
                      ? 'text-slate-600 hover:text-primary' 
                      : 'text-white/90 hover:text-white drop-shadow-md'
                  }`}>Reviews</button>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {!isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => setLocation('/courses')}
                    className={`font-medium h-10 px-4 ${
                      isScrolled 
                        ? 'text-slate-600 hover:text-primary' 
                        : 'text-white/90 hover:text-white'
                    }`}
                  >
                    Browse Courses
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setLocation('/signin')}
                    className={`font-medium h-10 px-4 ${
                      isScrolled 
                        ? 'text-slate-600 hover:text-primary' 
                        : 'text-white/90 hover:text-white'
                    }`}
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => setLocation('/signup')}
                    className={`font-medium h-10 px-6 ${
                      isScrolled 
                        ? 'bg-primary hover:bg-blue-700 text-white' 
                        : 'bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm'
                    }`}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Get Started
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <User className={`h-4 w-4 ${
                        isScrolled ? 'text-slate-600' : 'text-white/90'
                      }`} />
                      <span className={`${
                        isScrolled ? 'text-slate-600' : 'text-white/90'
                      }`}>
                        Welcome, {(user as any)?.firstName}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => setLocation('/courses')}
                      className={`transition-colors duration-300 font-medium h-10 px-4 ${
                        isScrolled 
                          ? 'text-slate-600 hover:text-primary' 
                          : 'text-white/90 hover:text-white'
                      }`}
                    >
                      Browse Courses
                    </Button>
                    <Button
                      onClick={() => setLocation('/dashboard')}
                      className={`font-medium h-10 px-6 transition-all duration-300 ${
                        isScrolled 
                          ? 'bg-primary hover:bg-blue-700 text-white' 
                          : 'bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm'
                      }`}
                    >
                      Dashboard
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleSignOut}
                      className={`font-medium h-10 px-4 ${
                        isScrolled 
                          ? 'text-slate-600 hover:text-red-600' 
                          : 'text-white/90 hover:text-white'
                      }`}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Enhanced ERUDO Style */}
      <section id="hero" className="relative overflow-hidden h-screen pt-16">

        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Professional software development and testing environment"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Loading State */}
        {homeContentLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white text-lg">Loading content...</p>
            </div>
          </div>
        )}
        

        
        {/* Error State */}
        {homeContentError && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-8 text-center max-w-md mx-4">
              <div className="text-red-200 text-4xl mb-4">⚠️</div>
              <p className="text-white text-lg mb-2">Content Loading Error</p>
              <p className="text-red-200 text-sm">Using fallback content. Please refresh the page.</p>
            </div>
          </div>
        )}
        
        {/* Black gradient overlay */}
        <div className="absolute inset-0 hero-black-overlay"></div>
        
        {/* Static background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-primary/15 rounded-full blur-xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-56 h-56 bg-accent/10 rounded-full blur-2xl"></div>
        </div>



                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="w-full">
            {/* Mobile Layout - Stacked */}
            <div className="block lg:hidden">
              <div className="text-center space-y-6">
                {/* Main heading */}
            <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 leading-tight drop-shadow-lg">
                    {getHeroContent().mainHeading}
                    <br />
                    <span className="bg-gradient-to-r from-yellow-300 to-yellow-100 bg-clip-text text-transparent drop-shadow-md">
                      with Debug Nation
                    </span>
              </h1>
                  
                  {/* Tagline */}
                  <div className="inline-flex items-center px-3 py-2 glass-morphism rounded-full mb-4 shadow-3xl">
                    <span className="text-yellow-300 font-semibold text-sm text-glow">
                      "{getHeroContent().tagline}"
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-base sm:text-lg text-white max-w-lg mx-auto leading-relaxed drop-shadow-lg px-4">
                  {getHeroContent().description}
                </p>

                {/* CTA Button */}
            <div>
                  <MaterialButton
                    variant="filled"
                    color="primary"
                    size="large"
                    icon="school"
                    iconPosition="left"
                    onClick={() => setLocation('/courses')}
                    className="px-8 py-4 text-lg font-bold shadow-2xl"
                  >
                    {getHeroContent().ctaText}
                  </MaterialButton>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                  <div className="glass-morphism rounded-xl p-3 shadow-3xl">
                    <div className="flex flex-col items-center">
                      <CheckCircle className="text-yellow-300 h-4 w-4 mb-1 text-glow" />
                      <span className="text-lg font-bold text-white text-glow">{getStatsContent().students}</span>
                      <p className="text-white font-medium text-xs text-glow">Students</p>
                    </div>
                  </div>
                  
                  <div className="glass-morphism rounded-xl p-3 shadow-3xl">
                    <div className="flex flex-col items-center">
                      <Star className="text-yellow-300 h-4 w-4 mb-1 text-glow" />
                      <span className="text-lg font-bold text-white text-glow">{getStatsContent().rating}</span>
                      <p className="text-white font-medium text-xs text-glow">Rating</p>
                    </div>
                  </div>
                  
                  <div className="glass-morphism rounded-xl p-3 shadow-3xl">
                    <div className="flex flex-col items-center">
                      <Tag className="text-yellow-300 h-4 w-4 mb-1 text-glow" />
                      <span className="text-lg font-bold text-white text-glow">{getStatsContent().jobs}</span>
                      <p className="text-white font-medium text-xs text-glow">Jobs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Layout - Two Columns */}
            <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-center w-full">
              {/* Left Column - Text Content */}
              <div className="text-center lg:text-left">
            {/* Main heading with enhanced typography */}
                <div className="mb-6">
                  <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
                {getHeroContent().mainHeading}
                <br />
                    <span className="bg-gradient-to-r from-yellow-300 to-yellow-100 bg-clip-text text-transparent drop-shadow-md">
                  with Debug Nation
                </span>
              </h1>
              
              {/* Tagline with better styling */}
                  <div className="inline-flex items-center px-4 py-2 glass-morphism rounded-full mb-6 shadow-3xl">
                    <span className="text-yellow-300 font-semibold text-base text-glow">
                  "{getHeroContent().tagline}"
                </span>
              </div>
            </div>

            {/* Description with better typography */}
                <p className="text-lg xl:text-xl text-white max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed drop-shadow-lg">
              {getHeroContent().description}
            </p>

            {/* CTA Buttons with enhanced styling */}
            <div className="mb-8 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-center lg:justify-start">
              <MaterialButton
                variant="filled"
                color="primary"
                size="large"
                icon="school"
                iconPosition="left"
                onClick={() => setLocation('/courses')}
                className="px-12 py-6 text-xl font-bold shadow-2xl w-full sm:w-auto h-16"
              >
                {getHeroContent().ctaText}
              </MaterialButton>
              
              <Button
                variant="outline"
                onClick={() => setIsPPTViewerOpen(true)}
                className="px-12 py-6 text-xl font-bold shadow-2xl border-white/30 text-white hover:bg-white/10 w-full sm:w-auto h-16 flex items-center justify-center gap-2 bg-transparent"
              >
                <Presentation className="h-5 w-5" />
                What is Software Testing?
              </Button>
            </div>

            {/* Stats with enhanced design */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto lg:mx-0">
              <div className="glass-morphism rounded-xl p-3 shadow-3xl">
                <div className="flex items-center justify-center mb-1">
                  <CheckCircle className="text-yellow-300 h-5 w-5 mr-2 text-glow" />
                  <span className="text-xl font-bold text-white text-glow">{getStatsContent().students}</span>
                </div>
                <p className="text-white font-medium text-xs text-glow">Students Trained</p>
              </div>
              
              <div className="glass-morphism rounded-xl p-3 shadow-3xl">
                <div className="flex items-center justify-center mb-1">
                  <Star className="text-yellow-300 h-5 w-5 mr-2 text-glow" />
                  <span className="text-xl font-bold text-white text-glow">{getStatsContent().rating}</span>
                </div>
                <p className="text-white font-medium text-xs text-glow">Rating</p>
              </div>
              
              <div className="glass-morphism rounded-xl p-3 shadow-3xl">
                <div className="flex items-center justify-center mb-1">
                  <Tag className="text-yellow-300 h-5 w-5 mr-2 text-glow" />
                  <span className="text-xl font-bold text-white text-glow">{getStatsContent().jobs}</span>
                </div>
                <p className="text-white font-medium text-xs text-glow">Job Placement</p>
              </div>
            </div>
        </div>

              {/* Right Column - Software Testing Visualization */}
              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  {/* Main visualization container */}
                  <div className="relative w-full max-w-lg">
                    {/* Background glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 rounded-3xl blur-2xl transform rotate-3"></div>
                    
                    {/* Visualization container */}
                    <div className="relative bg-white/20 backdrop-blur-sm rounded-3xl p-6 xl:p-8 border border-white/30 shadow-2xl">
                      {/* Software Testing Illustration */}
                      <div className="text-center">
                        {/* Code/Testing Icon */}
                        <div className="mb-4 xl:mb-6">
                          <div className="w-20 h-20 xl:w-24 xl:h-24 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
                            <svg className="w-10 h-10 xl:w-12 xl:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
                        </div>
                        
                        {/* Testing Process Visualization */}
                        <div className="space-y-3 xl:space-y-4">
                          <div className="flex items-center justify-between bg-white/10 rounded-lg p-2 xl:p-3 border border-white/20">
                            <span className="text-white font-medium text-sm xl:text-base drop-shadow-md">Manual Testing</span>
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between bg-white/10 rounded-lg p-2 xl:p-3 border border-white/20">
                            <span className="text-white font-medium text-sm xl:text-base drop-shadow-md">Automation</span>
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between bg-white/10 rounded-lg p-2 xl:p-3 border border-white/20">
                            <span className="text-white font-medium text-sm xl:text-base drop-shadow-md">API Testing</span>
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                            </div>
                </div>
              </div>
              
                        {/* Success indicator */}
                        <div className="mt-4 xl:mt-6 flex items-center justify-center space-x-2">
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          <span className="text-green-300 font-semibold text-sm xl:text-base drop-shadow-md">Job Ready in 60-90 Days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Courses Section */}
      <section id="courses" className="py-16 logo-watermark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Choose Your Learning Path</h2>
            <p className="text-lg text-slate-600">Structured courses designed to take you from beginner to professional</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {featuredCourses.length > 0 ? (
              featuredCourses.slice(0, 2).map((course: any) => (
                <Card key={course.id} className="relative overflow-hidden hover-lift border-2 border-primary/20">
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary to-accent"></div>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge className={`mb-3 font-bold ${
                          course.courseType === 'live' 
                            ? 'bg-warning text-white border-warning' 
                            : 'bg-success text-white border-success'
                        }`}>
                          {course.courseType === 'live' ? 'LIVE' : 'SELF-PACED'}
                        </Badge>
                        <CardTitle className="text-2xl mb-2 text-foreground font-bold">{course.name}</CardTitle>
                        <CardDescription className="text-lg text-muted-foreground">
                          {course.description || (course.courseType === 'live' ? 'Live Video Call Sessions' : 'Any Self-Study Course')}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-primary mb-2">
                          ₹{course.price}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {course.courseType === 'live' ? 'Complete program' : 'One-time payment'}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-semibold text-foreground">What's included:</h4>
                        <ul className="text-sm space-y-2">
                          {course.features?.slice(0, 6).map((feature: string, index: number) => (
                            <li key={index} className="flex items-center">
                              <span className="text-success mr-2 font-bold">✓</span>
                              <span className="text-foreground">{feature}</span>
                            </li>
                          )) || (
                            <>
                              <li className="flex items-center">
                                <span className="text-success mr-2 font-bold">✓</span>
                                <span className="text-foreground">Complete course access</span>
                              </li>
                              <li className="flex items-center">
                                <span className="text-success mr-2 font-bold">✓</span>
                                <span className="text-foreground">Downloadable handbooks</span>
                              </li>
                              <li className="flex items-center">
                                <span className="text-success mr-2 font-bold">✓</span>
                                <span className="text-foreground">Practical assignments</span>
                              </li>
                              <li className="flex items-center">
                                <span className="text-success mr-2 font-bold">✓</span>
                                <span className="text-foreground">Progress tracking</span>
                              </li>
                              <li className="flex items-center">
                                <span className="text-success mr-2 font-bold">✓</span>
                                <span className="text-foreground">Industry certificate</span>
                              </li>
                              <li className="flex items-center">
                                <span className="text-success mr-2 font-bold">✓</span>
                                <span className="text-foreground">Lifetime access</span>
                              </li>
                            </>
                          )}
                        </ul>
                      </div>

                      <Button 
                        onClick={() => handlePurchase({ 
                          id: course.id, 
                          name: course.name, 
                          title: course.name,
                          price: parseFloat(course.price),
                          courseType: course.courseType
                        })}
                        className={`w-full text-white h-10 text-lg font-semibold ${
                          course.courseType === 'live' 
                            ? 'bg-warning hover:bg-error' 
                            : 'bg-primary hover:bg-accent'
                        }`}
                      >
                        Start This Path
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              // Fallback to course groups if no featured courses are set
              courseGroups.slice(0, 2).map((course: any) => (
                <Card key={course.id} className="relative overflow-hidden hover-lift border-2 border-primary/20">
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary to-accent"></div>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge className={`mb-3 font-bold ${
                          course.courseType === 'live' 
                            ? 'bg-warning text-white border-warning' 
                            : 'bg-success text-white border-success'
                        }`}>
                          {course.courseType === 'live' ? 'LIVE' : 'SELF-PACED'}
                        </Badge>
                        <CardTitle className="text-2xl mb-2 text-foreground font-bold">{course.name}</CardTitle>
                        <CardDescription className="text-lg text-muted-foreground">
                          {course.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-primary mb-2">
                          ₹{course.price}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {course.courseType === 'live' ? 'Complete program' : 'One-time payment'}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-semibold text-foreground">What's included:</h4>
                        <ul className="text-sm space-y-2">
                          {course.features?.slice(0, 6).map((feature: string, index: number) => (
                            <li key={index} className="flex items-center">
                              <span className="text-success mr-2 font-bold">✓</span>
                              <span className="text-foreground">{feature}</span>
                            </li>
                          )) || (
                            <>
                          <li className="flex items-center">
                            <span className="text-success mr-2 font-bold">✓</span>
                            <span className="text-foreground">Complete course access</span>
                          </li>
                          <li className="flex items-center">
                            <span className="text-success mr-2 font-bold">✓</span>
                            <span className="text-foreground">Downloadable handbooks</span>
                          </li>
                          <li className="flex items-center">
                            <span className="text-success mr-2 font-bold">✓</span>
                            <span className="text-foreground">Practical assignments</span>
                          </li>
                          <li className="flex items-center">
                            <span className="text-success mr-2 font-bold">✓</span>
                            <span className="text-foreground">Progress tracking</span>
                          </li>
                          <li className="flex items-center">
                            <span className="text-success mr-2 font-bold">✓</span>
                            <span className="text-foreground">Industry certificate</span>
                          </li>
                          <li className="flex items-center">
                            <span className="text-success mr-2 font-bold">✓</span>
                            <span className="text-foreground">Lifetime access</span>
                          </li>
                            </>
                          )}
                        </ul>
                      </div>

                      <Button 
                        onClick={() => handlePurchase({ 
                          id: course.id, 
                          name: course.name, 
                          title: course.name,
                          price: parseFloat(course.price),
                          courseType: course.courseType
                        })}
                        className={`w-full text-white h-10 text-lg font-semibold ${
                          course.courseType === 'live' 
                            ? 'bg-warning hover:bg-error' 
                            : 'bg-primary hover:bg-accent'
                        }`}
                      >
                        Start This Path
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          
          {/* Dynamic Course Groups Display */}
          {(courseGroups as any[]).length > 0 && (
            <div className="mt-16">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Available Courses</h3>
                <p className="text-lg text-slate-600">Explore our comprehensive course offerings</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(courseGroups as any[]).map((group: any, index: number) => (
                  <Card key={group.id} className="relative overflow-hidden hover-lift border-2 border-primary/20">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary to-accent"></div>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl mb-2 text-foreground font-bold">{group.name}</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {group.description || 'Comprehensive testing course'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold text-primary">₹{group.price || 149}</span>
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            {group.duration || 'Self-paced'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <CheckCircle className="h-4 w-4 mr-2 text-success" />
                            <span>Comprehensive curriculum</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <CheckCircle className="h-4 w-4 mr-2 text-success" />
                            <span>Practical projects</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <CheckCircle className="h-4 w-4 mr-2 text-success" />
                            <span>Certificate of completion</span>
                          </div>
                        </div>
                        
                        <Button 
                          onClick={() => setLocation('/courses')}
                          className="w-full bg-primary hover:bg-primary/90 text-white"
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-slate-100 logo-shape-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">How It Works</h2>
            <p className="text-lg text-slate-600">Simple 4-step process to start your testing career</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-success text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-2">Select Your Course</h3>
              <p className="text-slate-600">Choose the learning path that matches your career goals and timeline.</p>
            </div>
            <div className="text-center">
              <div className="bg-warning text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-2">Sign Up & Pay</h3>
              <p className="text-slate-600">Register with basic details and make payment via UPI or bank transfer.</p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-2">Start Learning</h3>
              <p className="text-slate-600">Access your dashboard, download handbooks, and complete daily exercises.</p>
            </div>
            <div className="text-center">
              <div className="bg-accent text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">4</div>
              <h3 className="text-xl font-semibold mb-2">Get Certified</h3>
              <p className="text-slate-600">Complete the course, pass the exam, and receive your industry certificate.</p>
            </div>
          </div>
        </div>
      </section>


      {/* Testimonials */}
      <section id="testimonials" className="py-16 bg-gradient-to-br from-slate-50 to-white border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Success Stories</h2>
            <p className="text-xl text-slate-700 font-semibold max-w-3xl mx-auto">Join thousands of students who've transformed their careers with our comprehensive testing courses</p>
          </div>
          
          {/* Loading State for Testimonials */}
          {testimonialsLoading && (
          <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-white animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                      <div>
                        <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-32"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-300 rounded"></div>
                      <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Error State for Testimonials */}
          {testimonialsError && (
            <div className="text-center py-12">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                <div className="text-yellow-600 text-4xl mb-4">⚠️</div>
                <p className="text-yellow-800 text-lg mb-2">Testimonials Loading Error</p>
                <p className="text-yellow-700 text-sm">Using fallback testimonials.</p>
              </div>
            </div>
          )}
          
          {/* Testimonials Content */}
          {!testimonialsLoading && !testimonialsError && (
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial: Testimonial, index: number) => (
              <Card key={index} className="bg-white shadow-xl border-2 border-slate-300 hover:shadow-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg">{testimonial.name}</h4>
                      <p className="text-slate-600 text-sm font-semibold">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex text-yellow-400 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-800 leading-relaxed font-medium">{testimonial.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 logo-watermark-lg bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Find answers to common questions about our courses, enrollment process, and learning experience.
            </p>
          </div>
          
          {/* Loading State for FAQs */}
          {faqsLoading && (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm animate-pulse">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="h-6 bg-slate-300 rounded w-3/4"></div>
                      <div className="h-6 w-6 bg-slate-300 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Error State for FAQs */}
          {faqsError && (
            <div className="text-center py-12">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 max-w-md mx-auto shadow-sm">
                <div className="text-yellow-600 text-4xl mb-4">⚠️</div>
                <p className="text-yellow-800 text-lg mb-2 font-semibold">FAQs Loading Error</p>
                <p className="text-yellow-700 text-sm">Using fallback FAQs.</p>
              </div>
            </div>
          )}
          
          {/* FAQs Content */}
          {!faqsLoading && !faqsError && (
            <div className="space-y-4">
              {faqs.map((faq: FAQ, index: number) => {
                const isExpanded = expandedFAQs.has(faq.id);
                return (
                  <div
                    key={faq.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-slate-50"
                    >
                      <h3 className="text-lg font-semibold text-slate-900 pr-4 leading-relaxed">
                        {faq.question}
                      </h3>
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-primary transition-transform duration-200" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-400 transition-transform duration-200" />
                        )}
                      </div>
                    </button>
                    
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-6 pb-6 pt-0">
                        <div className="border-t border-slate-100 pt-4">
                          <p className="text-slate-600 leading-relaxed text-base">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Additional Help Section */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-8 border border-primary/10">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Still have questions?</h3>
              <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                Can't find what you're looking for? Our support team is here to help you succeed in your learning journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Contact Support
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation('/courses')}
                  className="border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Browse Courses
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Get in Touch</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Have questions about our courses? Need help choosing the right path? 
              We're here to help you succeed in your software testing journey.
            </p>
          </div>
          
          <ContactForm />
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="bg-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">Debug Nation</h3>
              <p className="text-slate-200 mb-4">
                Empowering the next generation of software testing professionals with practical, industry-focused education.
              </p>
              <div className="flex space-x-4">
                <Facebook className="h-5 w-5 text-slate-200 hover:text-white cursor-pointer" />
                <Twitter className="h-5 w-5 text-slate-200 hover:text-white cursor-pointer" />
                <Linkedin className="h-5 w-5 text-slate-200 hover:text-white cursor-pointer" />
                <Youtube className="h-5 w-5 text-slate-200 hover:text-white cursor-pointer" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
              <ul className="space-y-2 text-slate-200">
                <li><button onClick={() => scrollToSection('courses')} className="hover:text-white transition-colors text-left">All Courses</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors text-left">Pricing</button></li>
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-2 text-slate-200">
                <li><a href="/help-center" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/student-support" className="hover:text-white transition-colors">Student Support</a></li>
                <li><a href="/technical-issues" className="hover:text-white transition-colors">Technical Issues</a></li>
                <li><a href="/payment-help" className="hover:text-white transition-colors">Payment Help</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Contact Info</h4>
              <div className="space-y-2 text-slate-200">
                <p className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-slate-200" />
                  support@debugnation.com
                </p>
                <p className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-slate-200" />
                  +91 98765 43210
                </p>
                <p className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-slate-200" />
                  Mon-Fri: 9AM-6PM IST
                </p>
              </div>
            </div>
          </div>
          <hr className="my-8 border-slate-700" />
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-200 text-sm">© 2024 Debug Nation. All rights reserved.</p>
            <div className="flex space-x-6 text-sm text-slate-200 mt-4 md:mt-0">
              <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</a>
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

      {/* Enrollment Confirmation Modal */}
      <EnrollmentConfirmationModal
        key={`${enrollmentModal.courseGroup?.id}-${enrollmentModal.initialStudyPath}`}
        courseGroup={enrollmentModal.courseGroup}
        isOpen={enrollmentModal.isOpen}
        onClose={() => setEnrollmentModal({ isOpen: false, courseGroup: null, initialStudyPath: "self-paced" })}
        initialStudyPath={enrollmentModal.initialStudyPath}
      />

      {/* PPT Viewer */}
      <PPTViewer
        isOpen={isPPTViewerOpen}
        onClose={() => setIsPPTViewerOpen(false)}
        slides={softwareTestingSlides}
      />
    </div>
  );
}
