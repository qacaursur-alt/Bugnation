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
    default:
      return { bg: 'bg-slate-700', border: 'border-slate-700', accent: 'bg-accent' };
  }
};

export function CourseCard({ course, onSelect }: CourseCardProps) {
  const colors = getCourseColor(course.category || '');
  const isPopular = course.category === 'complete';

  return (
    <Card 
      className={`overflow-hidden hover:shadow-xl transition-shadow ${
        isPopular ? 'border-2 border-primary' : ''
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
        </div>
        <p className="text-blue-100 mt-2">
          {course.duration} Days • {course.dailyHours} hrs/day
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <ul className="space-y-3 mb-6">
          {course.features?.map((feature, index) => (
            <li key={index} className="flex items-center text-slate-600">
              <CheckCircle className="text-accent mr-3 h-4 w-4" />
              {feature}
            </li>
          ))}
        </ul>
        <Button
          onClick={onSelect}
          className={`w-full ${colors.bg} hover:opacity-90 text-white py-3 font-medium transition-colors`}
        >
          Start This Path
        </Button>
      </CardContent>
    </Card>
  );
}
