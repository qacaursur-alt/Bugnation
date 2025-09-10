import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { Edit, Save, Globe, ExternalLink, Eye } from "lucide-react";

// Edit SEO Form
function EditSEOForm({ seo, onSave, onCancel }: {
  seo: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: seo?.title || '',
    description: seo?.description || '',
    keywords: seo?.keywords || '',
    ogTitle: seo?.ogTitle || '',
    ogDescription: seo?.ogDescription || '',
    ogImage: seo?.ogImage || '',
    twitterTitle: seo?.twitterTitle || '',
    twitterDescription: seo?.twitterDescription || '',
    twitterImage: seo?.twitterImage || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...seo, ...formData });
  };

  const getCharacterCount = (text: string, max: number) => {
    const count = text.length;
    return (
      <span className={`text-xs ${count > max ? 'text-red-500' : 'text-slate-500'}`}>
        {count}/{max}
      </span>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic SEO */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Globe className="h-5 w-5 mr-2" />
          Basic SEO
        </h3>
        
        <div>
          <Label htmlFor="title">Page Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Page title (50-60 characters)"
          />
          <div className="flex justify-between mt-1">
            {getCharacterCount(formData.title, 60)}
            <span className="text-xs text-slate-500">Recommended: 50-60 characters</span>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Meta Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Meta description (150-160 characters)"
            rows={3}
          />
          <div className="flex justify-between mt-1">
            {getCharacterCount(formData.description, 160)}
            <span className="text-xs text-slate-500">Recommended: 150-160 characters</span>
          </div>
        </div>

        <div>
          <Label htmlFor="keywords">Keywords</Label>
          <Input
            id="keywords"
            value={formData.keywords}
            onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
            placeholder="keyword1, keyword2, keyword3"
          />
          <p className="text-xs text-slate-500 mt-1">
            Separate keywords with commas
          </p>
        </div>
      </div>

      {/* Open Graph */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="text-lg font-semibold flex items-center">
          <ExternalLink className="h-5 w-5 mr-2" />
          Open Graph (Facebook, LinkedIn)
        </h3>
        
        <div>
          <Label htmlFor="ogTitle">OG Title</Label>
          <Input
            id="ogTitle"
            value={formData.ogTitle}
            onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
            placeholder="Open Graph title"
          />
          <div className="flex justify-between mt-1">
            {getCharacterCount(formData.ogTitle, 95)}
            <span className="text-xs text-slate-500">Recommended: 40-95 characters</span>
          </div>
        </div>

        <div>
          <Label htmlFor="ogDescription">OG Description</Label>
          <Textarea
            id="ogDescription"
            value={formData.ogDescription}
            onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
            placeholder="Open Graph description"
            rows={2}
          />
          <div className="flex justify-between mt-1">
            {getCharacterCount(formData.ogDescription, 200)}
            <span className="text-xs text-slate-500">Recommended: 40-200 characters</span>
          </div>
        </div>

        <div>
          <Label htmlFor="ogImage">OG Image URL</Label>
          <Input
            id="ogImage"
            value={formData.ogImage}
            onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
            placeholder="https://example.com/og-image.jpg"
          />
          <p className="text-xs text-slate-500 mt-1">
            Recommended: 1200x630px, JPG or PNG
          </p>
        </div>
      </div>

      {/* Twitter Cards */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Eye className="h-5 w-5 mr-2" />
          Twitter Cards
        </h3>
        
        <div>
          <Label htmlFor="twitterTitle">Twitter Title</Label>
          <Input
            id="twitterTitle"
            value={formData.twitterTitle}
            onChange={(e) => setFormData({ ...formData, twitterTitle: e.target.value })}
            placeholder="Twitter title"
          />
          <div className="flex justify-between mt-1">
            {getCharacterCount(formData.twitterTitle, 70)}
            <span className="text-xs text-slate-500">Recommended: 40-70 characters</span>
          </div>
        </div>

        <div>
          <Label htmlFor="twitterDescription">Twitter Description</Label>
          <Textarea
            id="twitterDescription"
            value={formData.twitterDescription}
            onChange={(e) => setFormData({ ...formData, twitterDescription: e.target.value })}
            placeholder="Twitter description"
            rows={2}
          />
          <div className="flex justify-between mt-1">
            {getCharacterCount(formData.twitterDescription, 200)}
            <span className="text-xs text-slate-500">Recommended: 40-200 characters</span>
          </div>
        </div>

        <div>
          <Label htmlFor="twitterImage">Twitter Image URL</Label>
          <Input
            id="twitterImage"
            value={formData.twitterImage}
            onChange={(e) => setFormData({ ...formData, twitterImage: e.target.value })}
            placeholder="https://example.com/twitter-image.jpg"
          />
          <p className="text-xs text-slate-500 mt-1">
            Recommended: 1200x675px, JPG or PNG
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
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

// SEO Manager
export default function SEOManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: seoData = [], isLoading } = useQuery({
    queryKey: ["/api/seo"],
  });

  const updateSEOMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", "/api/seo", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seo"] });
      toast({ title: "SEO settings updated successfully" });
    },
  });

  const [editingSEO, setEditingSEO] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEdit = (seo: any) => {
    setEditingSEO(seo);
    setIsEditModalOpen(true);
  };

  const handleSave = async (data: any) => {
    await updateSEOMutation.mutateAsync(data);
    setIsEditModalOpen(false);
    setEditingSEO(null);
  };

  const pages = [
    { key: 'home', label: 'Home Page', path: '/', description: 'Main landing page' },
    { key: 'courses', label: 'Courses Page', path: '/courses', description: 'Course listings and details' },
    { key: 'signin', label: 'Sign In Page', path: '/signin', description: 'User authentication' },
    { key: 'signup', label: 'Sign Up Page', path: '/signup', description: 'User registration' },
    { key: 'dashboard', label: 'Dashboard', path: '/dashboard', description: 'User dashboard' },
    { key: 'admin', label: 'Admin Panel', path: '/admin', description: 'Administrative interface' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">SEO & Meta Tags</h2>
        <p className="text-slate-600">Manage meta tags and SEO settings for all pages</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {pages.map((page) => {
          const seo = seoData.find((s: any) => s.page === page.key);
          return (
            <Card key={page.key} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    {page.label}
                  </CardTitle>
                  <p className="text-sm text-slate-500">{page.path}</p>
                  <p className="text-xs text-slate-400">{page.description}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(seo || { page: page.key })}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-slate-500 uppercase tracking-wide">Title</Label>
                    <div className="text-sm font-medium mt-1">
                      {seo?.title || 'Not set'}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500 uppercase tracking-wide">Description</Label>
                    <div className="text-sm text-slate-700 mt-1 line-clamp-2">
                      {seo?.description || 'Not set'}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500 uppercase tracking-wide">Keywords</Label>
                    <div className="text-sm text-slate-700 mt-1">
                      {seo?.keywords || 'Not set'}
                    </div>
                  </div>
                  {seo?.ogImage && (
                    <div>
                      <Label className="text-xs text-slate-500 uppercase tracking-wide">OG Image</Label>
                      <div className="mt-1">
                        <img 
                          src={seo.ogImage} 
                          alt="OG Preview" 
                          className="w-16 h-16 object-cover rounded border"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit SEO Settings</DialogTitle>
          </DialogHeader>
          {editingSEO && (
            <EditSEOForm
              seo={editingSEO}
              onSave={handleSave}
              onCancel={() => setIsEditModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
