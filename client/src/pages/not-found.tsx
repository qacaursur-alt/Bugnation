import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { 
  Home, 
  Search, 
  ArrowLeft, 
  AlertTriangle,
  BookOpen,
  Users,
  Mail,
  Phone,
  Clock,
  Facebook,
  Twitter,
  Linkedin,
  Youtube
} from "lucide-react";

export default function NotFound() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a href="/" className="flex items-center">
                <img 
                  src="/attached_assets/New Project (4).png" 
                  alt="Debug Nation Logo" 
                  className="h-8 w-auto brightness-0"
                />
              </a>
              <nav className="hidden md:block ml-10">
                <div className="flex items-center space-x-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = '/'}
                    className="text-slate-600 hover:text-primary"
                  >
                    Home
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = '/course-groups'}
                    className="text-slate-600 hover:text-primary"
                  >
                    Browse Courses
                  </Button>
                  {isAuthenticated && (user as any)?.role === 'admin' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.location.href = '/admin'}
                      className="text-slate-600 hover:text-primary"
                    >
                      Admin
                    </Button>
                  )}
                </div>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = '/dashboard'}
                    className="text-slate-600 hover:text-primary"
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => { 
                      await fetch('/api/auth/signout', { method: 'POST' }); 
                      window.location.href = '/'; 
                    }}
                    className="text-slate-600 hover:text-primary"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = '/signin'}
                    className="text-slate-600 hover:text-primary"
                  >
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => window.location.href = '/signup'}
                    className="bg-primary hover:bg-blue-700 text-white"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="bg-white shadow-xl border-0">
            <CardContent className="p-12">
              {/* 404 Illustration */}
              <div className="mb-8">
                <div className="relative">
                  <div className="text-9xl font-bold text-primary/20 mb-4">404</div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <AlertTriangle className="h-16 w-16 text-primary" />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              <h1 className="text-4xl font-bold text-slate-800 mb-4">
                Oops! Page Not Found
              </h1>
              <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                The page you're looking for seems to have wandered off into the digital void. 
                Don't worry, even the best testers encounter bugs sometimes!
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button
                  size="lg"
                  onClick={() => window.location.href = '/'}
                  className="bg-primary hover:bg-blue-700 text-white px-8 py-3"
                >
                  <Home className="h-5 w-5 mr-2" />
                  Go Home
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="border-primary text-primary hover:bg-primary hover:text-white px-8 py-3"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Go Back
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => window.location.href = '/course-groups'}
                  className="border-accent text-accent hover:bg-accent hover:text-white px-8 py-3"
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  Browse Courses
                </Button>
              </div>

              {/* Help Section */}
              <div className="bg-slate-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">
                  Need Help Finding Something?
                </h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-600">
                  <div className="flex items-center justify-center">
                    <BookOpen className="h-4 w-4 mr-2 text-primary" />
                    <span>Browse our courses</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <Users className="h-4 w-4 mr-2 text-primary" />
                    <span>Contact support</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <Search className="h-4 w-4 mr-2 text-primary" />
                    <span>Search the site</span>
                  </div>
                </div>
          </div>

              {/* Fun Message */}
              <div className="text-center">
                <p className="text-slate-500 italic">
                  "The best way to find out if you can trust somebody is to trust them." 
                  <br />
                  <span className="text-sm">- Ernest Hemingway (and probably a good tester too)</span>
                </p>
              </div>
        </CardContent>
      </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12">
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
                <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="/course-groups" className="hover:text-white transition-colors">All Courses</a></li>
                <li><a href="/#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/#contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-2 text-slate-200">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Student Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Technical Issues</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Payment Help</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Contact Info</h4>
              <div className="space-y-2 text-slate-200">
                <p className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  support@debugnation.com
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
            <p className="text-slate-200 text-sm">© 2024 Debug Nation. All rights reserved.</p>
            <div className="flex space-x-6 text-sm text-slate-200 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
