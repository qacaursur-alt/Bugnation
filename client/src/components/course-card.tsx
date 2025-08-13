import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@shared/schema";
import { CheckCircle } from "lucide-react";

interface CourseCardProps {
  course: Course;
  onSelect: () => void;
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

export function CourseCard({ course, onSelect }: CourseCardProps) {
  const colors = getCourseColor(course.category || '');
  const isPopular = course.category === 'complete';
  const isPremium = course.category === 'premium';

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
        <Button
          onClick={onSelect}
          className={`w-full ${colors.bg} hover:opacity-90 text-white py-3 font-medium transition-colors`}
        >
          {isPremium ? 'Book Live Sessions' : 'Start This Path'}
        </Button>
      </CardContent>
    </Card>
  );
}
