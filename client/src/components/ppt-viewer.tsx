import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2,
  Download,
  Play,
  Pause
} from "lucide-react";

interface PPTViewerProps {
  isOpen: boolean;
  onClose: () => void;
  slides: SlideData[];
}

interface SlideData {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  notes?: string;
}

export function PPTViewer({ isOpen, onClose, slides }: PPTViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const currentSlideData = slides[currentSlide];

  if (!isOpen || !currentSlideData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isFullscreen ? 'max-w-none w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] h-[calc(100vh-4rem)] sm:h-[calc(100vh-6rem)] top-2 sm:top-8 left-2 sm:left-4' : 'max-w-4xl w-[calc(100vw-2rem)] sm:w-auto'} p-0 overflow-hidden`}>
        <DialogHeader className="p-3 sm:p-6 pb-0 flex-shrink-0">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <DialogTitle className="text-lg sm:text-xl font-bold truncate flex-1 min-w-0">
              {currentSlideData.title}
            </DialogTitle>
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={togglePlay}
                className="hidden sm:flex"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                <span className="hidden sm:inline">Close</span>
                <span className="sm:hidden">×</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
          {/* Main Slide Content */}
          <Card className="mb-6 flex-1">
            <CardContent className="p-4 sm:p-6 lg:p-8 min-h-[300px] sm:min-h-[400px] flex flex-col justify-center">
              {currentSlideData.imageUrl && (
                <div className="mb-4 sm:mb-6 flex justify-center">
                  <img
                    src={currentSlideData.imageUrl}
                    alt={currentSlideData.title}
                    className="max-w-full max-h-48 sm:max-h-64 object-contain rounded-lg shadow-lg"
                  />
                </div>
              )}
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">
                  {currentSlideData.title}
                </h2>
                <div className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line max-h-96 overflow-y-auto">
                  {currentSlideData.content}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Slide Navigation */}
          <div className="flex items-center justify-between flex-wrap gap-4 flex-shrink-0">
            <Button
              variant="outline"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="flex-shrink-0"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 justify-center">
              <span className="text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                {currentSlide + 1} of {slides.length}
              </span>
              <div className="flex space-x-1 max-w-xs overflow-x-auto">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors flex-shrink-0 ${
                      index === currentSlide 
                        ? 'bg-blue-500' 
                        : 'bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className="flex-shrink-0"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Speaker Notes */}
          {currentSlideData.notes && (
            <Card className="mt-4 flex-shrink-0">
              <CardContent className="p-3 sm:p-4">
                <h4 className="font-medium text-slate-900 mb-2 text-sm sm:text-base">Speaker Notes:</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{currentSlideData.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Sample PPT data for "What is Software Testing?"
export const softwareTestingSlides: SlideData[] = [
  {
    id: "1",
    title: "What is Software Testing?",
    content: `Software Testing is the process of evaluating and verifying that a software application or system does what it is supposed to do.

Key Points:
• Identifies bugs, errors, and defects
• Ensures quality and reliability
• Validates functionality meets requirements
• Reduces risk of failures in production`,
    notes: "Start with a clear definition and emphasize the importance of testing in software development."
  },
  {
    id: "2",
    title: "Why is Software Testing Important?",
    content: `1. Quality Assurance
   • Ensures software meets user expectations
   • Prevents costly bugs in production

2. Risk Mitigation
   • Identifies potential issues early
   • Reduces business risks

3. Cost Savings
   • Early bug detection is cheaper
   • Prevents customer dissatisfaction

4. User Experience
   • Delivers reliable, user-friendly software
   • Builds customer trust`,
    notes: "Explain the business value of testing and how it impacts the bottom line."
  },
  {
    id: "3",
    title: "Types of Software Testing",
    content: `Manual Testing
• Human testers execute test cases
• Exploratory testing
• Usability testing

Automated Testing
• Scripts execute test cases
• Regression testing
• Performance testing

Testing Levels
• Unit Testing
• Integration Testing
• System Testing
• Acceptance Testing`,
    notes: "Cover the main categories and explain when to use each type."
  },
  {
    id: "4",
    title: "Testing Methodologies",
    content: `Black Box Testing
• Tests functionality without knowing internal code
• Focus on inputs and outputs

White Box Testing
• Tests internal code structure
• Code coverage analysis

Gray Box Testing
• Combination of both approaches
• Limited knowledge of internal structure

Agile Testing
• Continuous testing throughout development
• Test-driven development (TDD)`,
    notes: "Explain different approaches and their use cases in modern development."
  },
  {
    id: "5",
    title: "Common Testing Tools",
    content: `Manual Testing Tools
• Jira, Bugzilla (Bug tracking)
• TestRail (Test management)
• Postman (API testing)

Automation Tools
• Selenium (Web automation)
• Appium (Mobile testing)
• Cypress (Modern web testing)
• Jest (Unit testing)

Performance Tools
• JMeter (Load testing)
• LoadRunner (Enterprise testing)`,
    notes: "Show popular tools and their specific use cases."
  },
  {
    id: "6",
    title: "Testing Lifecycle",
    content: `1. Test Planning
   • Define test strategy
   • Identify test cases

2. Test Design
   • Create test scenarios
   • Prepare test data

3. Test Execution
   • Run test cases
   • Report bugs

4. Test Closure
   • Analyze results
   • Prepare test reports

5. Maintenance
   • Update test cases
   • Regression testing`,
    notes: "Walk through the complete testing process from start to finish."
  },
  {
    id: "7",
    title: "Career in Software Testing",
    content: `Career Paths
• Manual Tester
• Automation Engineer
• Test Lead
• QA Manager
• Test Architect

Skills Required
• Technical knowledge
• Analytical thinking
• Attention to detail
• Communication skills
• Domain knowledge

Growth Opportunities
• High demand in industry
• Good salary prospects
• Continuous learning
• Career advancement`,
    notes: "Motivate students about career opportunities in testing field."
  },
  {
    id: "8",
    title: "Get Started with Testing",
    content: `Learning Path
1. Learn testing fundamentals
2. Practice with real projects
3. Learn automation tools
4. Get certified
5. Build portfolio

Next Steps
• Join our comprehensive course
• Hands-on practice sessions
• Industry expert guidance
• Job placement assistance
• Lifetime support

Ready to start your testing journey?`,
    notes: "Encourage enrollment and highlight course benefits."
  }
];
