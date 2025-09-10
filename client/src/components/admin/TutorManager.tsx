import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  Users, 
  BookOpen, 
  Trash2,
  UserPlus,
  UserCheck
} from "lucide-react";

export default function TutorManager() {
  console.log('TutorManager component rendering');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateTutorOpen, setIsCreateTutorOpen] = useState(false);
  const [isAssignTutorOpen, setIsAssignTutorOpen] = useState(false);
  const [selectedCourseGroup, setSelectedCourseGroup] = useState<string>('');

  // Fetch tutors
  const { data: tutors = [], isLoading: tutorsLoading, error: tutorsError } = useQuery({
    queryKey: ["/api/admin/tutors"],
    queryFn: async () => {
      console.log('Fetching tutors...');
      const response = await apiRequest("GET", "/api/admin/tutors");
      const data = await response.json();
      console.log('Tutors response:', data);
      return data;
    },
  });

  // Fetch course groups
  const { data: courseGroups = [], isLoading: courseGroupsLoading, error: courseGroupsError } = useQuery({
    queryKey: ["/api/course-groups"],
    queryFn: async () => {
      console.log('Fetching course groups...');
      const response = await apiRequest("GET", "/api/course-groups");
      const data = await response.json();
      console.log('Course groups response:', data);
      return data;
    },
  });

  // Fetch course tutors for a specific course
  const { data: courseTutors = [], isLoading: courseTutorsLoading, error: courseTutorsError } = useQuery({
    queryKey: ["/api/admin/course-tutors", selectedCourseGroup],
    queryFn: async () => {
      if (!selectedCourseGroup) return [];
      console.log('Fetching course tutors for:', selectedCourseGroup);
      const response = await apiRequest("GET", `/api/admin/course-tutors/${selectedCourseGroup}`);
      const data = await response.json();
      console.log('Course tutors response:', data);
      return data;
    },
    enabled: !!selectedCourseGroup,
  });

  console.log('TutorManager state:', { 
    tutors, 
    courseGroups, 
    courseTutors, 
    tutorsLoading, 
    courseGroupsLoading, 
    courseTutorsLoading,
    tutorsError,
    courseGroupsError,
    courseTutorsError
  });

  // Create tutor mutation
  const createTutorMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/admin/tutors", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tutors"] });
      toast({ title: "Tutor created successfully" });
      setIsCreateTutorOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create tutor", 
        description: error.message || "An error occurred",
        variant: "destructive" 
      });
    },
  });

  // Assign tutor mutation
  const assignTutorMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/admin/course-tutors", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/course-tutors", selectedCourseGroup] });
      toast({ title: "Tutor assigned successfully" });
      setIsAssignTutorOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to assign tutor", 
        description: error.message || "An error occurred",
        variant: "destructive" 
      });
    },
  });

  // Remove tutor mutation
  const removeTutorMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      return await apiRequest("DELETE", `/api/admin/course-tutors/${assignmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/course-tutors", selectedCourseGroup] });
      toast({ title: "Tutor removed successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to remove tutor", 
        description: error.message || "An error occurred",
        variant: "destructive" 
      });
    },
  });

  const handleCreateTutor = async (data: any) => {
    await createTutorMutation.mutateAsync(data);
  };

  const handleAssignTutor = async (data: any) => {
    await assignTutorMutation.mutateAsync(data);
  };

  const handleRemoveTutor = async (assignmentId: string) => {
    if (confirm("Are you sure you want to remove this tutor from the course?")) {
      await removeTutorMutation.mutateAsync(assignmentId);
    }
  };

  if (tutorsError || courseGroupsError) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Data</h3>
          <p className="text-slate-500">
            {tutorsError?.message || courseGroupsError?.message || "An error occurred while loading data"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Tutor Management</h2>
          <p className="text-slate-600">Manage tutors and their course assignments</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateTutorOpen} onOpenChange={setIsCreateTutorOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Create Tutor
              </Button>
            </DialogTrigger>
            <CreateTutorForm 
              onSubmit={handleCreateTutor} 
              onCancel={() => setIsCreateTutorOpen(false)}
              isLoading={createTutorMutation.isPending}
            />
          </Dialog>
        </div>
      </div>

      {/* Course Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Course Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="course-group">Select Course to Manage Tutors</Label>
              {courseGroupsLoading ? (
                <div className="text-center py-4">
                  <p className="text-slate-500">Loading courses...</p>
                </div>
              ) : (
                <Select value={selectedCourseGroup} onValueChange={setSelectedCourseGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a course..." />
                  </SelectTrigger>
                  <SelectContent>
                    {courseGroups.map((group: any) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Tutors */}
      {selectedCourseGroup && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Assigned Tutors
              </CardTitle>
              <Dialog open={isAssignTutorOpen} onOpenChange={setIsAssignTutorOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Assign Tutor
                  </Button>
                </DialogTrigger>
                <AssignTutorForm 
                  courseGroupId={selectedCourseGroup}
                  tutors={tutors}
                  onSubmit={handleAssignTutor} 
                  onCancel={() => setIsAssignTutorOpen(false)}
                  isLoading={assignTutorMutation.isPending}
                />
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {courseTutors.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No tutors assigned to this course</p>
            ) : (
              <div className="space-y-3">
                {courseTutors.map((assignment: any) => (
                  <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{assignment.tutor.firstName} {assignment.tutor.lastName}</p>
                        <p className="text-sm text-slate-500">{assignment.tutor.email}</p>
                        <p className="text-xs text-slate-400">
                          Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={assignment.isActive ? "default" : "secondary"}>
                        {assignment.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveTutor(assignment.id)}
                        disabled={removeTutorMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* All Tutors List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Tutors
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tutorsLoading ? (
            <div className="text-center py-4">
              <p className="text-slate-500">Loading tutors...</p>
            </div>
          ) : tutors.length === 0 ? (
            <p className="text-slate-500 text-center py-4">No tutors found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tutors.map((tutor: any) => (
                <div key={tutor.id} className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{tutor.firstName} {tutor.lastName}</p>
                      <p className="text-sm text-slate-500">{tutor.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant={tutor.isActive ? "default" : "secondary"}>
                      {tutor.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {new Date(tutor.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Create Tutor Form Component
function CreateTutorForm({ onSubmit, onCancel, isLoading }: {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create New Tutor</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Tutor"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

// Assign Tutor Form Component
function AssignTutorForm({ courseGroupId, tutors, onSubmit, onCancel, isLoading }: {
  courseGroupId: string;
  tutors: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [tutorId, setTutorId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ courseGroupId, tutorId });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Assign Tutor to Course</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="tutor">Select Tutor</Label>
          <Select value={tutorId} onValueChange={setTutorId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a tutor..." />
            </SelectTrigger>
            <SelectContent>
              {tutors.map((tutor: any) => (
                <SelectItem key={tutor.id} value={tutor.id}>
                  {tutor.firstName} {tutor.lastName} ({tutor.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !tutorId}>
            {isLoading ? "Assigning..." : "Assign Tutor"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
