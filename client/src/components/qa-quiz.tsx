import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Lock, Unlock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  orderIndex: number;
}

interface QAQuizProps {
  questions: Question[];
  onComplete: (score: number, passed: boolean) => void;
  isLocked: boolean;
  onUnlock: () => void;
}

export function QAQuiz({ questions, onComplete, isLocked, onUnlock }: QAQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswerSelect = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const answerArray = Object.entries(answers).map(([questionId, userAnswer]) => ({
        questionId,
        userAnswer
      }));

      const response = await fetch(`/api/learning-paths/${questions[0]?.learningPathId}/submit-answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers: answerArray }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setShowResults(true);
        onComplete(result.score, result.passed);
        
        if (result.passed) {
          toast({
            title: "Congratulations! 🎉",
            description: `You scored ${result.score}% and passed the quiz! The next session is now unlocked.`,
          });
        } else {
          toast({
            title: "Quiz Failed",
            description: `You scored ${result.score}%. You need at least 70% to pass. Please try again.`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to submit quiz. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLocked) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Lock className="h-16 w-16 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">Session Locked</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">
            Complete the previous session and pass the quiz to unlock this content.
          </p>
          <Button onClick={onUnlock} variant="outline">
            <Unlock className="h-4 w-4 mr-2" />
            Check Previous Session
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    const correctAnswers = Object.entries(answers).filter(([questionId, userAnswer]) => {
      const question = questions.find(q => q.id === questionId);
      return question?.correctAnswer === userAnswer;
    }).length;

    const score = Math.round((correctAnswers / questions.length) * 100);
    const passed = score >= 70;

    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {passed ? (
              <CheckCircle className="h-16 w-16 text-green-500" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {passed ? "Quiz Passed! 🎉" : "Quiz Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-4xl font-bold text-primary">{score}%</div>
          <p className="text-muted-foreground">
            You answered {correctAnswers} out of {questions.length} questions correctly.
          </p>
          {passed ? (
            <Badge className="bg-green-500 text-white">
              <CheckCircle className="h-4 w-4 mr-1" />
              Passed
            </Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle className="h-4 w-4 mr-1" />
              Failed (Need 70% to pass)
            </Badge>
          )}
          <div className="pt-4">
            <Button onClick={() => window.location.reload()}>
              Continue Learning
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            Question {currentQuestionIndex + 1} of {questions.length}
          </CardTitle>
          <Badge variant="outline">
            {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">{currentQuestion.question}</h3>
          <RadioGroup
            value={answers[currentQuestion.id] || ""}
            onValueChange={handleAnswerSelect}
            className="space-y-3"
          >
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!answers[currentQuestion.id] || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : isLastQuestion ? "Submit Quiz" : "Next"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
