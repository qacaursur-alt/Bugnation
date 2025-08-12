import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertEnquirySchema, type Course } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { X } from "lucide-react";

interface EnrollmentModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
}

const enquiryFormSchema = insertEnquirySchema.extend({
  courseId: z.string().min(1, "Please select a course"),
});

type EnquiryFormData = z.infer<typeof enquiryFormSchema>;

export function EnrollmentModal({ course, isOpen, onClose }: EnrollmentModalProps) {
  const { toast } = useToast();
  
  const form = useForm<EnquiryFormData>({
    resolver: zodResolver(enquiryFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      courseId: course?.id || "",
    },
  });

  // Update form when course changes
  useEffect(() => {
    if (course) {
      form.setValue("courseId", course.id);
    }
  }, [course, form]);

  const submitEnquiryMutation = useMutation({
    mutationFn: async (data: EnquiryFormData) => {
      await apiRequest("POST", "/api/enquiries", data);
    },
    onSuccess: () => {
      toast({
        title: "Enquiry Submitted!",
        description: "You will receive payment instructions via email within 24 hours.",
      });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit enquiry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EnquiryFormData) => {
    submitEnquiryMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold text-slate-800">
              Start Your Learning Journey
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700">Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your full name"
                      {...field}
                      className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700">Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                      className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700">Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="Enter your phone number"
                      {...field}
                      className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700">Selected Course</FormLabel>
                  <FormControl>
                    <Input
                      value={course?.title || ""}
                      disabled
                      className="px-4 py-3 border border-slate-300 rounded-lg bg-slate-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-slate-600 mb-2">Next Steps:</p>
              <ol className="text-sm text-slate-600 space-y-1">
                <li>1. Submit this form to send us your enquiry</li>
                <li>2. We'll email you payment instructions within 24 hours</li>
                <li>3. Complete payment via UPI or bank transfer</li>
                <li>4. Get instant access to your learning dashboard</li>
              </ol>
            </div>
            
            <Button
              type="submit"
              disabled={submitEnquiryMutation.isPending}
              className="w-full bg-primary hover:bg-blue-700 text-white py-3 font-semibold transition-colors"
            >
              {submitEnquiryMutation.isPending ? "Submitting..." : "Send Enquiry & Get Payment Details"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
