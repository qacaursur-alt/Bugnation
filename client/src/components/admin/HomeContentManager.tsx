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
import { apiRequest } from "@/lib/queryClient";
import { Edit, Save } from "lucide-react";

// Edit Content Form Component
function EditContentForm({ content, onSave, onCancel }: {
  content: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: content?.title || '',
    subtitle: content?.subtitle || '',
    description: content?.description || '',
    metaTitle: content?.metaTitle || '',
    metaDescription: content?.metaDescription || '',
    metaKeywords: content?.metaKeywords || '',
    isActive: content?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...content, ...formData });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input
          id="subtitle"
          value={formData.subtitle}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="metaTitle">Meta Title</Label>
          <Input
            id="metaTitle"
            value={formData.metaTitle}
            onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="metaDescription">Meta Description</Label>
          <Input
            id="metaDescription"
            value={formData.metaDescription}
            onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="metaKeywords">Meta Keywords</Label>
        <Input
          id="metaKeywords"
          value={formData.metaKeywords}
          onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
          placeholder="keyword1, keyword2, keyword3"
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
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </form>
  );
}

// Home Page Content Manager
export default function HomeContentManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: homeContent = [], isLoading: homeContentLoading } = useQuery({
    queryKey: ["/api/home-content"],
  });

  const updateContentMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", "/api/home-content", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/home-content"] });
      toast({ title: "Content updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error updating content", variant: "destructive" });
    },
  });

  const [editingContent, setEditingContent] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEdit = (content: any, sectionKey: string) => {
    // If no content exists, create a new content object with the section key
    const contentToEdit = content || { 
      section: sectionKey, 
      title: '', 
      subtitle: '', 
      description: '', 
      metaTitle: '', 
      metaDescription: '', 
      metaKeywords: '', 
      isActive: true 
    };
    setEditingContent(contentToEdit);
    setIsEditModalOpen(true);
  };

  const handleSave = async (data: any) => {
    await updateContentMutation.mutateAsync(data);
    setIsEditModalOpen(false);
    setEditingContent(null);
  };

  const createDefaultContentMutation = useMutation({
    mutationFn: async (sectionKey: string) => {
      const defaultContent = getDefaultContent(sectionKey);
      return await apiRequest("POST", "/api/home-content", defaultContent);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/home-content"] });
      toast({ title: "Default content created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error creating default content", variant: "destructive" });
    },
  });

  const getDefaultContent = (sectionKey: string) => {
    const defaults = {
      'hero-title': { title: 'Master Software Testing', subtitle: '', description: '' },
      'hero-tagline': { title: 'Where Bugs Meet Their Match', subtitle: '', description: '' },
      'hero-description': { title: '', subtitle: '', description: 'Choose from self-paced courses (₹149) or premium live video sessions (₹25,000). From manual testing to automation - become job-ready in just 60-90 days.' },
      'hero-cta': { title: 'Start Learning Now', subtitle: '', description: '' },
      'stats-students': { title: '', subtitle: '2000+', description: '' },
      'stats-rating': { title: '', subtitle: '4.8/5', description: '' },
      'stats-jobs': { title: '', subtitle: '95%', description: '' },
    };
    
    return {
      section: sectionKey,
      ...defaults[sectionKey as keyof typeof defaults],
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      isActive: true
    };
  };

  const handleCreateDefault = (sectionKey: string) => {
    createDefaultContentMutation.mutate(sectionKey);
  };

  const sections = [
    { key: 'hero-title', label: 'Hero Title', type: 'text', description: 'Main heading on the homepage' },
    { key: 'hero-tagline', label: 'Hero Tagline', type: 'text', description: 'Subtitle under the main heading' },
    { key: 'hero-description', label: 'Hero Description', type: 'textarea', description: 'Description text in the hero section' },
    { key: 'hero-cta', label: 'Hero CTA Button', type: 'text', description: 'Text for the main call-to-action button' },
    { key: 'stats-students', label: 'Students Count', type: 'text', description: 'Number of students (e.g., 2000+)' },
    { key: 'stats-rating', label: 'Rating', type: 'text', description: 'Average rating (e.g., 4.8/5)' },
    { key: 'stats-jobs', label: 'Job Placement', type: 'text', description: 'Job placement percentage (e.g., 95%)' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Home Page Content</h2>
          <p className="text-slate-600">Manage all content displayed on the homepage</p>
        </div>
        <Button
          onClick={() => {
            sections.forEach(section => {
              const content = homeContent.find((c: any) => c.section === section.key);
              if (!content) {
                handleCreateDefault(section.key);
              }
            });
          }}
          disabled={createDefaultContentMutation.isPending}
          variant="default"
        >
          Create All Default Content
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sections.map((section) => {
          const content = homeContent.find((c: any) => c.section === section.key);
          return (
            <Card key={section.key}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">{section.label}</CardTitle>
                <div className="flex gap-2">
                  {!content && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleCreateDefault(section.key)}
                      disabled={createDefaultContentMutation.isPending}
                    >
                      Create Default
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(content, section.key)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {content ? 'Edit' : 'Add Content'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Current Content:</Label>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    {content ? (
                      <div className="space-y-1">
                        {content.title && <div><strong>Title:</strong> {content.title}</div>}
                        {content.subtitle && <div><strong>Subtitle:</strong> {content.subtitle}</div>}
                        {content.description && <div><strong>Description:</strong> {content.description}</div>}
                        {!content.title && !content.subtitle && !content.description && 'No content set'}
                      </div>
                    ) : (
                      'No content set'
                    )}
                  </div>
                  {section.description && (
                    <p className="text-sm text-slate-500 mt-2">{section.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
          </DialogHeader>
          {editingContent && (
            <EditContentForm
              content={editingContent}
              onSave={handleSave}
              onCancel={() => setIsEditModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
