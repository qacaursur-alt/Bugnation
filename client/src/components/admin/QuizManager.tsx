import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { Edit, Save, Plus, Trash2, HelpCircle, Clock, Users, Target } from "lucide-react";

// Edit Question Form
function EditQuestionForm({ question, onSave, onCancel }: {
  question: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    question: question?.question || "",
    options: question?.options || ["", "", "", ""],
    correctAnswer: question?.correctAnswer || "",
    explanation: question?.explanation || "",
    orderIndex: question?.orderIndex || 1,
    isActive: question?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, ""]
    });
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({ ...formData, options: newOptions });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="question">Question</Label>
        <Textarea
          id="question"
          value={formData.question}
          onChange={(e) => setFormData({ ...formData, question: e.target.value })}
          placeholder="Enter the question"
          rows={3}
          required
        />
      </div>
      
      <div>
        <Label>Answer Options</Label>
        <div className="space-y-2">
          {formData.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                required
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeOption(index)}
                disabled={formData.options.length <= 2}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addOption}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Option
          </Button>
        </div>
      </div>
      
      <div>
        <Label htmlFor="correctAnswer">Correct Answer</Label>
        <Select
          value={formData.correctAnswer}
          onValueChange={(value) => setFormData({ ...formData, correctAnswer: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select correct answer" />
          </SelectTrigger>
          <SelectContent>
            {formData.options.map((option, index) => (
              <SelectItem key={index} value={option} disabled={!option.trim()}>
                {option || `Option ${index + 1}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="explanation">Explanation (Optional)</Label>
        <Textarea
          id="explanation"
          value={formData.explanation}
          onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
          placeholder="Explain why this is the correct answer"
          rows={3}
        />
      </div>
      
      <div>
        <Label htmlFor="orderIndex">Order Index</Label>
        <Input
          id="orderIndex"
          type="number"
          value={formData.orderIndex}
          onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 0 })}
          placeholder="Display order"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: !!checked })}
        />
        <Label htmlFor="isActive">Active</Label>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>
    </form>
  );
}

// Quiz Manager Component
export default function QuizManager({ courseGroupId }: { courseGroupId?: string }) {
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedLearningPath, setSelectedLearningPath] = useState<string>("");
  const queryClient = useQueryClient();

  // Get learning paths for the course group
  const { data: learningPaths = [] } = useQuery({
    queryKey: ["/api/learning-paths"],
    enabled: !!courseGroupId,
  });

  // Filter learning paths for this course group
  const courseGroupLearningPaths = learningPaths.filter((path: any) => path.groupId === courseGroupId);

  // Get questions for the selected learning path
  const { data: questions = [], isLoading } = useQuery({
    queryKey: ["/api/learning-paths", selectedLearningPath, "questions"],
    enabled: !!selectedLearningPath,
    queryFn: async () => {
      if (!selectedLearningPath) return [];
      const response = await apiRequest("GET", `/api/learning-paths/${selectedLearningPath}/questions`);
      return response;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!selectedLearningPath) {
        throw new Error("Please select a learning path first");
      }
      return apiRequest("POST", `/api/admin/learning-paths/${selectedLearningPath}/questions`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learning-paths", selectedLearningPath, "questions"] });
      setIsCreating(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      if (!selectedLearningPath) {
        throw new Error("Please select a learning path first");
      }
      return apiRequest("PUT", `/api/admin/learning-paths/${selectedLearningPath}/questions/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learning-paths", selectedLearningPath, "questions"] });
      setEditingQuestion(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!selectedLearningPath) {
        throw new Error("Please select a learning path first");
      }
      return apiRequest("DELETE", `/api/admin/learning-paths/${selectedLearningPath}/questions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learning-paths", selectedLearningPath, "questions"] });
    },
  });

  const handleCreate = (data: any) => {
    // Convert options array to the format expected by the questions table
    const formattedData = {
      ...data,
      options: data.options.filter((option: string) => option.trim() !== ""),
    };
    createMutation.mutate(formattedData);
  };

  const handleUpdate = (data: any) => {
    // Convert options array to the format expected by the questions table
    const formattedData = {
      ...data,
      options: data.options.filter((option: string) => option.trim() !== ""),
    };
    updateMutation.mutate({ id: editingQuestion.id, ...formattedData });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredQuestions = questions;

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading questions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Quiz Management</h2>
          <p className="text-gray-600">Manage quiz questions and assessments</p>
        </div>
        <Button onClick={() => setIsCreating(true)} disabled={!selectedLearningPath}>
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </Button>
      </div>

      {/* Learning Path Selector */}
      <div className="space-y-2">
        <Label htmlFor="learningPath">Select Learning Path</Label>
        <Select value={selectedLearningPath} onValueChange={setSelectedLearningPath}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a learning path to manage questions" />
          </SelectTrigger>
          <SelectContent>
            {courseGroupLearningPaths.map((path: any) => (
              <SelectItem key={path.id} value={path.id}>
                {path.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!selectedLearningPath && (
          <p className="text-sm text-gray-500">
            Please select a learning path to view and manage quiz questions.
          </p>
        )}
      </div>

      {/* Quiz Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Questions</p>
                <p className="text-2xl font-bold">{questions.length}</p>
              </div>
              <HelpCircle className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Questions</p>
                <p className="text-2xl font-bold text-green-600">
                  {questions.filter((q: any) => q.isActive).length}
                </p>
              </div>
              <Target className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Learning Path</p>
                <p className="text-2xl font-bold text-purple-600">
                  {courseGroupLearningPaths.find((p: any) => p.id === selectedLearningPath)?.title || 'None'}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Options</p>
                <p className="text-2xl font-bold text-orange-600">
                  {questions.length > 0 
                    ? (questions.reduce((sum: number, q: any) => sum + (q.options?.length || 0), 0) / questions.length).toFixed(1)
                    : 0
                  }
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Questions List */}
      {selectedLearningPath && (
        <div className="grid gap-4">
          {filteredQuestions.map((question: any) => (
            <Card key={question.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{question.question}</CardTitle>
                    <CardDescription className="mt-2">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">
                          Order: {question.orderIndex}
                        </span>
                        <span className="text-sm text-gray-500">
                          {question.options?.length || 0} options
                        </span>
                        {!question.isActive && (
                          <span className="text-xs text-red-600 font-medium">
                            (Inactive)
                          </span>
                        )}
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingQuestion(question)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(question.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Options:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {question.options?.map((option: string, index: number) => (
                        <div
                          key={index}
                          className={`p-2 rounded text-sm ${
                            option === question.correctAnswer
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-gray-50 text-gray-700"
                          }`}
                        >
                          {option}
                          {option === question.correctAnswer && (
                            <span className="ml-2 text-green-600 font-medium">✓</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  {question.explanation && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Explanation:</h4>
                      <p className="text-sm text-gray-600">{question.explanation}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedLearningPath && filteredQuestions.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first quiz question for this learning path.
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </CardContent>
        </Card>
      )}

      {!selectedLearningPath && (
        <Card className="text-center py-8">
          <CardContent>
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Learning Path</h3>
            <p className="text-gray-600 mb-4">
              Please select a learning path above to view and manage quiz questions.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isCreating || !!editingQuestion} onOpenChange={() => {
        setIsCreating(false);
        setEditingQuestion(null);
      }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? "Create New Question" : "Edit Question"}
            </DialogTitle>
          </DialogHeader>
          <EditQuestionForm
            question={editingQuestion}
            onSave={isCreating ? handleCreate : handleUpdate}
            onCancel={() => {
              setIsCreating(false);
              setEditingQuestion(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
