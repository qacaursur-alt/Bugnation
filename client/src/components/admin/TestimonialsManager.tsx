import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FileUpload from "@/components/file-upload";
import { apiRequest } from "@/lib/queryClient";
import { Edit, Save, Plus, Star, Upload } from "lucide-react";

// Edit Testimonial Form with Image Upload
function EditTestimonialForm({ testimonial, onSave, onCancel }: {
  testimonial: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: testimonial?.name || '',
    role: testimonial?.role || '',
    company: testimonial?.company || '',
    content: testimonial?.content || '',
    rating: testimonial?.rating || 5,
    image: testimonial?.image || '',
    imageAlt: testimonial?.imageAlt || '',
    isActive: testimonial?.isActive ?? true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageUpload = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let imageUrl = formData.image;
    
    // If a new image file is uploaded, handle the upload
    if (imageFile) {
      try {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const result = await response.json();
          imageUrl = result.url;
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
    
    onSave({ 
      ...testimonial, 
      ...formData, 
      image: imageUrl 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="role">Role</Label>
          <Input
            id="role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="company">Company</Label>
        <Input
          id="company"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="content">Testimonial Content</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="rating">Rating</Label>
        <Select
          value={formData.rating.toString()}
          onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5].map((rating) => (
              <SelectItem key={rating} value={rating.toString()}>
                {rating} Star{rating > 1 ? 's' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Image Upload Section */}
      <div className="space-y-4">
        <Label>Profile Image</Label>
        
        {/* Current Image Preview */}
        {(formData.image || imagePreview) && (
          <div className="flex items-center space-x-4">
            <img
              src={imagePreview || formData.image}
              alt="Current profile"
              className="w-20 h-20 rounded-full object-cover border"
            />
            <div className="text-sm text-slate-600">
              Current image
            </div>
          </div>
        )}

        {/* File Upload */}
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6">
          <FileUpload
            onFileSelect={handleImageUpload}
            accept="image/*"
            maxSize={5 * 1024 * 1024} // 5MB
          />
          <p className="text-xs text-slate-500 mt-2">
            Upload a new image or use the URL field below
          </p>
        </div>

        {/* Image URL Input */}
        <div>
          <Label htmlFor="image">Image URL (Alternative)</Label>
          <Input
            id="image"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div>
          <Label htmlFor="imageAlt">Image Alt Text</Label>
          <Input
            id="imageAlt"
            value={formData.imageAlt}
            onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })}
            placeholder="Description of the image for accessibility"
          />
        </div>
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
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </form>
  );
}

// Testimonials Manager with Image Upload
export default function TestimonialsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ["/api/testimonials"],
  });

  const updateTestimonialMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", "/api/testimonials", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      toast({ title: "Testimonial updated successfully" });
    },
  });

  const [editingTestimonial, setEditingTestimonial] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEdit = (testimonial: any) => {
    setEditingTestimonial(testimonial);
    setIsEditModalOpen(true);
  };

  const handleSave = async (data: any) => {
    await updateTestimonialMutation.mutateAsync(data);
    setIsEditModalOpen(false);
    setEditingTestimonial(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Testimonials</h2>
          <p className="text-slate-600">Manage success stories and testimonials</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial: any) => (
          <Card key={testimonial.id}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.imageAlt || testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold">{testimonial.name}</h3>
                  <p className="text-sm text-slate-600">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-sm text-slate-700 mb-4">{testimonial.content}</p>
              <div className="flex justify-between items-center">
                <div className="flex text-yellow-400">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(testimonial)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Testimonial</DialogTitle>
          </DialogHeader>
          {editingTestimonial && (
            <EditTestimonialForm
              testimonial={editingTestimonial}
              onSave={handleSave}
              onCancel={() => setIsEditModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
