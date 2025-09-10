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
import { apiRequest } from "@/lib/queryClient";
import { Edit, Save, Plus, Trash2, HelpCircle } from "lucide-react";

// Edit FAQ Form
function EditFAQForm({ faq, onSave, onCancel }: {
  faq: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    question: faq?.question || "",
    answer: faq?.answer || "",
    category: faq?.category || "general",
    orderIndex: faq?.orderIndex || 0,
    isActive: faq?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="question">Question</Label>
        <Input
          id="question"
          value={formData.question}
          onChange={(e) => setFormData({ ...formData, question: e.target.value })}
          placeholder="Enter FAQ question"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="answer">Answer</Label>
        <Textarea
          id="answer"
          value={formData.answer}
          onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
          placeholder="Enter FAQ answer"
          rows={4}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="courses">Courses</SelectItem>
            <SelectItem value="payment">Payment</SelectItem>
            <SelectItem value="technical">Technical</SelectItem>
            <SelectItem value="enrollment">Enrollment</SelectItem>
          </SelectContent>
        </Select>
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

// FAQ Manager Component
export default function FAQManager() {
  const [editingFAQ, setEditingFAQ] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ["/api/faqs"],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/faqs", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      setIsCreating(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest(`/api/faqs/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      setEditingFAQ(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/faqs/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
    },
  });

  const handleCreate = (data: any) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (data: any) => {
    updateMutation.mutate({ id: editingFAQ.id, ...data });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this FAQ?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading FAQs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">FAQ Management</h2>
          <p className="text-gray-600">Manage frequently asked questions</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add FAQ
        </Button>
      </div>

      <div className="grid gap-4">
        {faqs.map((faq: any) => (
          <Card key={faq.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                  <CardDescription className="mt-2">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-2">
                      {faq.category}
                    </span>
                    <span className="text-sm text-gray-500">
                      Order: {faq.orderIndex}
                    </span>
                    {!faq.isActive && (
                      <span className="ml-2 text-xs text-red-600 font-medium">
                        (Inactive)
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingFAQ(faq)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(faq.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{faq.answer}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {faqs.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first FAQ.</p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add FAQ
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isCreating || !!editingFAQ} onOpenChange={() => {
        setIsCreating(false);
        setEditingFAQ(null);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? "Create New FAQ" : "Edit FAQ"}
            </DialogTitle>
          </DialogHeader>
          <EditFAQForm
            faq={editingFAQ}
            onSave={isCreating ? handleCreate : handleUpdate}
            onCancel={() => {
              setIsCreating(false);
              setEditingFAQ(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
