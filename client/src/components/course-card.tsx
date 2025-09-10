import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@shared/schema";
import { CheckCircle, Users, Clock, AlertCircle, Lock } from "lucide-react";

interface CourseCardProps {
  course: Course;
  onSelect: () => void;
  enrollmentStatus?: 'available' | 'full' | 'closed' | 'inactive' | 'not_started' | 'ended';
  currentEnrollments?: number;
  maxStudents?: number;
  startDate?: string;
  endDate?: string;
  isEnrollmentActive?: boolean;
}

const getCourseColor = (category: string) => {
  switch (category) {
    case 'complete':
      return { bg: 'bg-primary', border: 'border-primary', accent: 'bg-accent' };
    case 'fasttrack':
      return { bg: 'bg-secondary', border: 'border-secondary', accent: 'bg-accent' };
    case 'automation':
      return { bg: 'bg-slate-700', border: 'border-slate-700', accent: 'bg-accent' };
    case 'manual':
      return { bg: 'bg-emerald-600', border: 'border-emerald-600', accent: 'bg-accent' };
    case 'sql':
      return { bg: 'bg-purple-600', border: 'border-purple-600', accent: 'bg-accent' };
    case 'jmeter':
      return { bg: 'bg-orange-600', border: 'border-orange-600', accent: 'bg-accent' };
    case 'premium':
      return { bg: 'bg-gradient-to-r from-yellow-500 to-orange-500', border: 'border-yellow-500', accent: 'bg-yellow-500' };
    default:
      return { bg: 'bg-slate-700', border: 'border-slate-700', accent: 'bg-accent' };
  }
};

export function CourseCard({ 
  course, 
  onSelect, 
  enrollmentStatus = 'available',
  currentEnrollments = 0,
  maxStudents = 0,
  startDate,
  endDate,
  isEnrollmentActive = true
}: CourseCardProps) {
  const colors = getCourseColor((course as any).category || '');
  const isPopular = (course as any).category === 'complete';
  const isPremium = (course as any).category === 'premium';
  const isLiveCourse = (course as any).category === 'premium' || (course as any).courseType === 'live';
  
  // Determine enrollment status
  const getEnrollmentStatus = () => {
    if (!isEnrollmentActive) return 'closed';
    if (enrollmentStatus === 'inactive') return 'inactive';
    if (enrollmentStatus === 'ended') return 'ended';
    if (enrollmentStatus === 'not_started') return 'not_started';
    if (maxStudents > 0 && currentEnrollments >= maxStudents) return 'full';
    return 'available';
  };
  
  const enrollmentStatusValue = getEnrollmentStatus();
  
  const getStatusBadge = () => {
    switch (enrollmentStatusValue) {
      case 'full':
        return { text: 'FULL', color: 'bg-red-100 text-red-800', icon: <Users className="h-3 w-3" /> };
      case 'closed':
        return { text: 'ENROLLMENT CLOSED', color: 'bg-gray-100 text-gray-800', icon: <Lock className="h-3 w-3" /> };
      case 'inactive':
        return { text: 'INACTIVE', color: 'bg-gray-100 text-gray-800', icon: <AlertCircle className="h-3 w-3" /> };
      case 'ended':
        return { text: 'COURSE ENDED', color: 'bg-gray-100 text-gray-800', icon: <Clock className="h-3 w-3" /> };
      case 'not_started':
        return { text: 'NOT STARTED', color: 'bg-blue-100 text-blue-800', icon: <Clock className="h-3 w-3" /> };
      default:
        return null;
    }
  };
  
  const statusBadge = getStatusBadge();
  const isEnrollmentDisabled = enrollmentStatusValue !== 'available';

  return (
    <Card 
      className={`overflow-hidden hover:shadow-xl transition-shadow ${
        isPopular ? 'border-2 border-primary' : ''
      } ${
        isPremium ? 'border-2 border-yellow-500 shadow-lg' : ''
      }`}
    >
      <CardHeader className={`${colors.bg} text-white px-6 py-4`}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">{course.title}</CardTitle>
          {isPopular && (
            <Badge className="bg-accent text-white text-xs px-2 py-1">
              POPULAR
            </Badge>
          )}
          {isPremium && (
            <Badge className="bg-yellow-600 text-white text-xs px-2 py-1">
              PREMIUM LIVE
            </Badge>
          )}
        </div>
        <p className={`mt-2 ${isPremium ? 'text-yellow-100' : 'text-blue-100'}`}>
          {course.duration} Days • {course.dailyHours} hrs/day
        </p>
        <div className="mt-2">
          <span className="text-2xl font-bold">₹{course.price?.toLocaleString()}</span>
          {isPremium && (
            <span className="ml-2 text-yellow-100 text-sm">(Live Sessions)</span>
          )}
        </div>
        
        {/* Live Course Info */}
        {isLiveCourse && (
          <div className="mt-3 space-y-1">
            {maxStudents > 0 && (
              <div className="flex items-center text-sm">
                <Users className="h-4 w-4 mr-2" />
                <span>{currentEnrollments}/{maxStudents} students enrolled</span>
              </div>
            )}
            {startDate && (
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2" />
                <span>Starts: {new Date(startDate).toLocaleDateString()}</span>
              </div>
            )}
            {endDate && (
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2" />
                <span>Ends: {new Date(endDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-6">
        <ul className="space-y-3 mb-6">
          {course.features?.map((feature, index) => (
            <li key={index} className="flex items-center text-slate-600">
              <CheckCircle className={`mr-3 h-4 w-4 ${isPremium ? 'text-yellow-500' : 'text-accent'}`} />
              {feature}
            </li>
          ))}
        </ul>
        
        {/* Status Badge */}
        {statusBadge && (
          <div className="mb-4">
            <Badge className={`${statusBadge.color} flex items-center gap-1 w-full justify-center`}>
              {statusBadge.icon}
              {statusBadge.text}
            </Badge>
          </div>
        )}
        
        {/* Enrollment Button */}
        <Button
          onClick={onSelect}
          disabled={isEnrollmentDisabled}
          className={`w-full ${
            isEnrollmentDisabled 
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
              : `${colors.bg} hover:opacity-90 text-white`
          } py-3 font-medium transition-colors`}
        >
          {isEnrollmentDisabled ? (
            <>
              {enrollmentStatusValue === 'full' && 'Course Full'}
              {enrollmentStatusValue === 'closed' && 'Enrollment Closed'}
              {enrollmentStatusValue === 'inactive' && 'Course Inactive'}
              {enrollmentStatusValue === 'ended' && 'Course Ended'}
              {enrollmentStatusValue === 'not_started' && 'Not Started Yet'}
            </>
          ) : (
            <>
              {isPremium ? 'Book Live Sessions' : 'Start This Path'}
            </>
          )}
        </Button>
        
        {/* Additional Info for Live Courses */}
        {isLiveCourse && !isEnrollmentDisabled && (
          <div className="mt-3 space-y-2">
            {/* Enrollment Progress */}
            {maxStudents > 0 && (
              <div className="text-center">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min((currentEnrollments / maxStudents) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {maxStudents - currentEnrollments} spots remaining
                </p>
              </div>
            )}
            
            {/* Course Dates */}
            {(startDate || endDate) && (
              <div className="text-center space-y-1">
                {startDate && (
                  <p className="text-xs text-slate-600">
                    <strong>Starts:</strong> {new Date(startDate).toLocaleDateString()}
                  </p>
                )}
                {endDate && (
                  <p className="text-xs text-slate-600">
                    <strong>Ends:</strong> {new Date(endDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
            
            {/* Enrollment Status */}
            <div className="text-center">
              <p className="text-xs text-slate-500">
                {currentEnrollments} enrolled
                {maxStudents > 0 && ` of ${maxStudents} max`}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
