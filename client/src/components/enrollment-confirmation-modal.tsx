import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import { X, Phone, User, Calendar } from "lucide-react";
interface EnrollmentConfirmationModalProps {
  courseGroup: any;
  isOpen: boolean;
  onClose: () => void;
  initialStudyPath?: "self-paced" | "premium-live";
}

const enrollmentSchema = z.object({
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  studyPath: z.enum(["self-paced", "premium-live"], {
    required_error: "Please select a study path",
  }),
});

type EnrollmentData = z.infer<typeof enrollmentSchema>;

export function EnrollmentConfirmationModal({ courseGroup, isOpen, onClose, initialStudyPath = "self-paced" }: EnrollmentConfirmationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  
  // Use a state variable to control the radio button selection
  const [selectedStudyPath, setSelectedStudyPath] = useState<"self-paced" | "premium-live">("self-paced");
  
  const form = useForm<EnrollmentData>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      phoneNumber: "",
      studyPath: initialStudyPath,
    },
  });
  
  // Update state and form when modal opens or initialStudyPath changes
  useEffect(() => {
    console.log("EnrollmentConfirmationModal: initialStudyPath changed to:", initialStudyPath);
    console.log("EnrollmentConfirmationModal: isOpen:", isOpen);
    console.log("EnrollmentConfirmationModal: Course group:", courseGroup);
    console.log("EnrollmentConfirmationModal: Course group courseType:", (courseGroup as any)?.courseType);
    
    if (isOpen) {
      // Update the state variable
      setSelectedStudyPath(initialStudyPath);
      
      // Reset the form with the new values
      form.reset({
        phoneNumber: "",
        studyPath: initialStudyPath,
      });
      
      // Force update the form value
      form.setValue("studyPath", initialStudyPath);
      
      console.log("EnrollmentConfirmationModal: Updated selectedStudyPath to:", initialStudyPath);
      console.log("EnrollmentConfirmationModal: Form studyPath value:", form.getValues("studyPath"));
    }
  }, [isOpen, initialStudyPath, form, courseGroup]);

  // Watch the study path to update pricing
  const formSelectedStudyPath = form.watch("studyPath");
  console.log("EnrollmentConfirmationModal: formSelectedStudyPath from form.watch:", formSelectedStudyPath);
  console.log("EnrollmentConfirmationModal: selectedStudyPath state:", selectedStudyPath);
  console.log("EnrollmentConfirmationModal: initialStudyPath prop:", initialStudyPath);
  
  // Get the price based on selected study path
  const getPrice = () => {
    console.log("getPrice: selectedStudyPath =", selectedStudyPath);
    console.log("getPrice: courseGroup.price =", courseGroup?.price);
    
    // Always use the actual course price, regardless of study path
    if (courseGroup?.price) {
      return `₹${courseGroup.price}`;
    }
    
    // Fallback prices based on study path if no course price
    if (selectedStudyPath === "premium-live") {
      return "₹25,000";
    }
    return "₹149";
  };

  const getCourseTitle = () => {
    console.log("getCourseTitle: selectedStudyPath =", selectedStudyPath);
    console.log("getCourseTitle: courseGroup =", courseGroup);
    
    // Use course name if available, otherwise fallback to study path
    if (courseGroup?.name) {
      return courseGroup.name;
    }
    
    if (selectedStudyPath === "premium-live") {
      return "Premium Live Classes";
    }
    return "Self-Paced Learning";
  };

  const getCourseDescription = () => {
    // Use course description if available, otherwise fallback to study path
    if (courseGroup?.description) {
      return courseGroup.description;
    }
    
    if (selectedStudyPath === "premium-live") {
      return "Interactive live sessions with instructor";
    }
    return "Learn at your own pace with structured modules";
  };

  const submitEnrollmentMutation = useMutation({
    mutationFn: async (data: EnrollmentData) => {
      if (!isAuthenticated) {
        window.location.href = '/signin';
        return;
      }
      
      // Use the course group ID directly
      let groupId = courseGroup?.id;
      if (!groupId) {
        throw new Error("Course group ID is required");
      }
      
      await apiRequest("POST", "/api/enrollments", {
        groupId,
        phoneNumber: data.phoneNumber,
        studyPath: data.studyPath,
      });
    },
    onSuccess: () => {
      toast({
        title: "Enrollment Request Submitted!",
        description: "Your enrollment is pending approval. You'll be contacted for payment details.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/me/groups"] });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      console.error("Enrollment error:", error);
      
      // Check if the error message contains "401" (Unauthorized)
      if (error?.message?.includes("401") || error?.status === 401) {
        toast({
          title: "Authentication Required",
          description: "Please log in to submit your enrollment request.",
          variant: "destructive",
        });
        window.location.href = '/signin';
      } else if (error?.message?.includes("already enrolled") || error?.message?.includes("Already enrolled") || error?.status === 400) {
        toast({
          title: "Already Enrolled",
          description: "You are already enrolled in this course. Check your dashboard for enrollment status.",
          variant: "destructive",
        });
        onClose();
      } else {
        toast({
          title: "Error",
          description: `Failed to submit enrollment request: ${error?.message || 'Please try again.'}`,
          variant: "destructive",
        });
      }
    },
  });

  const onSubmit = (data: EnrollmentData) => {
    submitEnrollmentMutation.mutate(data);
  };

  if (!courseGroup) return null;

  // If user is not authenticated, show a message and redirect
  if (!isAuthenticated) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-2xl font-bold text-foreground">
                Authentication Required
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                You need to be logged in to submit an enrollment request.
              </p>
              <Button
                onClick={() => window.location.href = '/signin'}
                className="w-full bg-primary hover:bg-accent text-white py-3 font-semibold"
              >
                Go to Login
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Confirm Enrollment
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Course Info */}
          <div className="bg-muted p-4 rounded-lg border border-border">
            <h3 className="font-semibold text-foreground mb-2">{getCourseTitle()}</h3>
            <p className="text-sm text-muted-foreground mb-2">{getCourseDescription()}</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-primary">{getPrice()}</span>
              <span className="text-sm text-muted-foreground">Lifetime Access</span>
            </div>
          </div>

          <Form {...form} key={`${isOpen}-${initialStudyPath}`}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-primary" />
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Enter your phone number"
                        {...field}
                        className="px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="studyPath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-primary" />
                      Choose Study Path
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => {
                          console.log("RadioGroup onValueChange:", value);
                          setSelectedStudyPath(value as "self-paced" | "premium-live");
                          field.onChange(value);
                        }}
                        value={field.value}
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:bg-muted transition-colors">
                          <RadioGroupItem value="self-paced" id="self-paced" />
                          <Label htmlFor="self-paced" className="flex-1 cursor-pointer">
                            <div>
                              <div className="font-medium text-foreground">Self-Paced Learning</div>
                              <div className="text-sm text-muted-foreground">Learn at your own pace with structured modules</div>
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:bg-muted transition-colors">
                          <RadioGroupItem value="premium-live" id="premium-live" />
                          <Label htmlFor="premium-live" className="flex-1 cursor-pointer">
                            <div>
                              <div className="font-medium text-foreground">Premium Live Classes</div>
                              <div className="text-sm text-muted-foreground">Interactive live sessions with instructor</div>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                <p className="text-sm text-primary mb-2 font-medium">What happens next?</p>
                <ol className="text-sm text-primary/80 space-y-1">
                  <li>1. Submit your enrollment request</li>
                  <li>2. Admin will contact you for payment details</li>
                  <li>3. Complete payment via WhatsApp/Phone call</li>
                  <li>4. Get approved and start learning!</li>
                </ol>
              </div>
              
              <Button
                type="submit"
                disabled={submitEnrollmentMutation.isPending}
                className="w-full bg-primary hover:bg-accent text-white py-3 font-semibold transition-all duration-200 hover:scale-105"
              >
                {submitEnrollmentMutation.isPending ? "Submitting..." : "Submit Enrollment Request"}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
