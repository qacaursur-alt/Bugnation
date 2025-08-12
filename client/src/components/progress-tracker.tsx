import { CheckCircle } from "lucide-react";

interface ProgressTrackerProps {
  currentDay: number;
}

export function ProgressTracker({ currentDay }: ProgressTrackerProps) {
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Calculate current week starting from Monday
  const currentWeekStart = Math.floor((currentDay - 1) / 7) * 7 + 1;
  const currentWeekDays = Array.from({ length: 7 }, (_, i) => currentWeekStart + i);

  const getDayStatus = (dayNumber: number) => {
    if (dayNumber < currentDay) return 'completed';
    if (dayNumber === currentDay) return 'current';
    return 'upcoming';
  };

  const getDayColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-accent text-white';
      case 'current':
        return 'bg-primary text-white';
      case 'upcoming':
        return 'bg-slate-200 text-slate-400';
      default:
        return 'bg-slate-200 text-slate-400';
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">This Week's Progress</h3>
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const dayNumber = currentWeekDays[index];
          const status = getDayStatus(dayNumber);
          
          return (
            <div key={day} className="text-center">
              <div className="text-xs text-slate-500 mb-1">{day}</div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${getDayColor(status)}`}>
                {status === 'completed' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  dayNumber
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
