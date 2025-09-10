import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  BookOpen, 
  Video, 
  FileText, 
  Users, 
  Settings,
  Edit,
  Trash2,
  Eye,
  Play,
  File,
  Image,
  Presentation
} from "lucide-react";

// Course Categories Manager
function CourseCategoriesManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["/api/course-categories"],
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/course-categories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/course-categories"] });
      toast({ title: "Category created successfully" });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      return await apiRequest("PUT", `/api/course-categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/course-categories"] });
      toast({ title: "Category updated successfully" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/course-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/course-categories"] });
      toast({ title: "Category deleted successfully" });
    },
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      await deleteCategoryMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Course Categories</h2>
          <p className="text-slate-600">Manage course categories (Self-Paced, Live Classes)</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category: any) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: category.color || '#3b82f6' }}
                  >
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <Badge variant={category.type === 'self_paced' ? 'default' : 'secondary'}>
                      {category.type === 'self_paced' ? 'Self-Paced' : 'Live Classes'}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-sm">{category.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Category Modal */}
      {(isCreateModalOpen || editingCategory) && (
        <CategoryForm
          category={editingCategory}
          onSave={editingCategory ? updateCategoryMutation.mutateAsync : createCategoryMutation.mutateAsync}
          onCancel={() => {
            setIsCreateModalOpen(false);
            setEditingCategory(null);
          }}
        />
      )}
    </div>
  );
}

// Category Form Component
function CategoryForm({ category, onSave, onCancel }: {
  category?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    type: category?.type || 'self_paced',
    icon: category?.icon || 'BookOpen',
    color: category?.color || '#3b82f6',
    orderIndex: category?.orderIndex || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = category ? { ...formData, id: category.id } : formData;
    await onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {category ? 'Edit Category' : 'Create Category'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Category Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="self_paced">Self-Paced</option>
              <option value="live">Live Classes</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Color
            </label>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full h-10 border border-slate-300 rounded-md"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {category ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Course Subcategories Manager
function CourseSubcategoriesManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/course-categories"],
  });

  const { data: subcategories = [], isLoading } = useQuery({
    queryKey: ["/api/course-subcategories"],
  });

  const createSubcategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/course-subcategories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/course-subcategories"] });
      toast({ title: "Subcategory created successfully" });
    },
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<any>(null);

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleEdit = (subcategory: any) => {
    setEditingSubcategory(subcategory);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this subcategory?")) {
      await apiRequest("DELETE", `/api/course-subcategories/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/course-subcategories"] });
      toast({ title: "Subcategory deleted successfully" });
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c: any) => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Course Subcategories</h2>
          <p className="text-slate-600">Manage subcategories under each main category</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Subcategory
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subcategories.map((subcategory: any) => (
          <Card key={subcategory.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: subcategory.color || '#10b981' }}
                  >
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{subcategory.name}</CardTitle>
                    <Badge variant="outline">
                      {getCategoryName(subcategory.categoryId)}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(subcategory)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(subcategory.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-sm">{subcategory.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Subcategory Modal */}
      {(isCreateModalOpen || editingSubcategory) && (
        <SubcategoryForm
          subcategory={editingSubcategory}
          categories={categories}
          onSave={editingSubcategory ? 
            async (data: any) => {
              await apiRequest("PUT", `/api/course-subcategories/${data.id}`, data);
              queryClient.invalidateQueries({ queryKey: ["/api/course-subcategories"] });
              toast({ title: "Subcategory updated successfully" });
            } : 
            createSubcategoryMutation.mutateAsync
          }
          onCancel={() => {
            setIsCreateModalOpen(false);
            setEditingSubcategory(null);
          }}
        />
      )}
    </div>
  );
}

// Subcategory Form Component
function SubcategoryForm({ subcategory, categories, onSave, onCancel }: {
  subcategory?: any;
  categories: any[];
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    categoryId: subcategory?.categoryId || '',
    name: subcategory?.name || '',
    description: subcategory?.description || '',
    icon: subcategory?.icon || 'BookOpen',
    color: subcategory?.color || '#10b981',
    orderIndex: subcategory?.orderIndex || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = subcategory ? { ...formData, id: subcategory.id } : formData;
    await onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {subcategory ? 'Edit Subcategory' : 'Create Subcategory'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Parent Category
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category: any) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Subcategory Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Color
            </label>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full h-10 border border-slate-300 rounded-md"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {subcategory ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Content Types Manager
function ContentTypesManager() {
  const contentTypes = [
    { type: 'video', name: 'Video', icon: Video, color: 'bg-red-500' },
    { type: 'document', name: 'Document', icon: FileText, color: 'bg-blue-500' },
    { type: 'pdf', name: 'PDF', icon: File, color: 'bg-red-600' },
    { type: 'ppt', name: 'PowerPoint', icon: Presentation, color: 'bg-orange-500' },
    { type: 'image', name: 'Image', icon: Image, color: 'bg-green-500' },
    { type: 'quiz', name: 'Quiz', icon: Settings, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Content Types</h2>
        <p className="text-slate-600">Supported content types for course materials</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {contentTypes.map((contentType) => (
          <Card key={contentType.type} className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className={`w-12 h-12 ${contentType.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                <contentType.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-medium text-slate-900">{contentType.name}</h3>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Course Groups Manager
function CourseGroupsManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/course-categories"],
  });

  const { data: subcategories = [] } = useQuery({
    queryKey: ["/api/course-subcategories"],
  });

  const { data: courseGroups = [], isLoading } = useQuery({
    queryKey: ["/api/course-groups"],
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/course-groups", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/course-groups"] });
      toast({ title: "Course group created successfully" });
    },
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleEdit = (group: any) => {
    setEditingGroup(group);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this course group?")) {
      await apiRequest("DELETE", `/api/course-groups/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/course-groups"] });
      toast({ title: "Course group deleted successfully" });
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c: any) => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const getSubcategoryName = (subcategoryId: string) => {
    const subcategory = subcategories.find((s: any) => s.id === subcategoryId);
    return subcategory?.name || 'None';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Course Groups</h2>
          <p className="text-slate-600">Manage course groups and pricing plans</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Course Group
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courseGroups.map((group: any) => (
          <Card key={group.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <div className="flex space-x-2">
                      <Badge variant="outline">
                        {getCategoryName(group.categoryId)}
                      </Badge>
                      {group.subcategoryId && (
                        <Badge variant="secondary">
                          {getSubcategoryName(group.subcategoryId)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(group)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(group.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-slate-600 text-sm">{group.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-green-600">
                    ₹{group.price}
                  </span>
                  <Badge variant={group.difficulty === 'beginner' ? 'default' : group.difficulty === 'intermediate' ? 'secondary' : 'destructive'}>
                    {group.difficulty}
                  </Badge>
                </div>
                {group.type === 'live' && (
                  <div className="text-sm text-slate-500">
                    Max Students: {group.maxStudents || 'Unlimited'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Course Group Modal */}
      {(isCreateModalOpen || editingGroup) && (
        <CourseGroupForm
          group={editingGroup}
          categories={categories}
          subcategories={subcategories}
          onSave={editingGroup ? 
            async (data: any) => {
              await apiRequest("PUT", `/api/course-groups/${data.id}`, data);
              queryClient.invalidateQueries({ queryKey: ["/api/course-groups"] });
              toast({ title: "Course group updated successfully" });
            } : 
            createGroupMutation.mutateAsync
          }
          onCancel={() => {
            setIsCreateModalOpen(false);
            setEditingGroup(null);
          }}
        />
      )}
    </div>
  );
}

// Course Group Form Component
function CourseGroupForm({ group, categories, subcategories, onSave, onCancel }: {
  group?: any;
  categories: any[];
  subcategories: any[];
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    categoryId: group?.categoryId || '',
    subcategoryId: group?.subcategoryId || '',
    name: group?.name || '',
    description: group?.description || '',
    price: group?.price || '149.00',
    difficulty: group?.difficulty || 'beginner',
    duration: group?.duration || 30,
    maxStudents: group?.maxStudents || '',
    features: group?.features || [],
    thumbnail: group?.thumbnail || '',
  });

  const [newFeature, setNewFeature] = useState('');

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = group ? { ...formData, id: group.id } : formData;
    await onSave(data);
  };

  const selectedCategory = categories.find(c => c.id === formData.categoryId);
  const filteredSubcategories = subcategories.filter(s => s.categoryId === formData.categoryId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {group ? 'Edit Course Group' : 'Create Course Group'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, subcategoryId: '' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.type === 'self_paced' ? 'Self-Paced' : 'Live'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Subcategory
              </label>
              <select
                value={formData.subcategoryId}
                onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!formData.categoryId}
              >
                <option value="">Select a subcategory (optional)</option>
                {filteredSubcategories.map((subcategory: any) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Course Group Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., SELF-PACED – Fundamentals"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Describe what students will learn..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Duration (days)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {selectedCategory?.type === 'live' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Max Students (for live classes)
              </label>
              <input
                type="number"
                value={formData.maxStudents}
                onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Leave empty for unlimited"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Features
            </label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a feature..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                />
                <Button type="button" onClick={handleAddFeature}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                    <span>{feature}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(index)}
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {group ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Learning Paths Manager
function LearningPathsManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: courseGroups = [] } = useQuery({
    queryKey: ["/api/course-groups"],
  });

  const { data: learningPaths = [], isLoading } = useQuery({
    queryKey: ["/api/learning-paths"],
  });

  const createPathMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/learning-paths", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learning-paths"] });
      toast({ title: "Learning path created successfully" });
    },
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPath, setEditingPath] = useState<any>(null);

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleEdit = (path: any) => {
    setEditingPath(path);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this learning path?")) {
      await apiRequest("DELETE", `/api/learning-paths/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/learning-paths"] });
      toast({ title: "Learning path deleted successfully" });
    }
  };

  const getCourseGroupName = (groupId: string) => {
    const group = courseGroups.find((g: any) => g.id === groupId);
    return group?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Learning Paths</h2>
          <p className="text-slate-600">Manage learning paths and modules for courses</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Learning Path
        </Button>
      </div>

      <div className="space-y-4">
        {learningPaths.map((path: any) => (
          <Card key={path.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{path.title}</CardTitle>
                    <Badge variant="outline">
                      {getCourseGroupName(path.groupId)}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(path)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(path.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-sm mb-3">{path.description}</p>
              <div className="flex items-center space-x-4 text-sm text-slate-500">
                <span>Order: {path.orderIndex}</span>
                {path.requiresQuiz && (
                  <Badge variant="secondary">Quiz Required</Badge>
                )}
                {path.quizRequiredToUnlock && (
                  <Badge variant="destructive">Quiz Required to Unlock</Badge>
                )}
                {path.passingScore && (
                  <span>Passing Score: {path.passingScore}%</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Learning Path Modal */}
      {(isCreateModalOpen || editingPath) && (
        <LearningPathForm
          path={editingPath}
          courseGroups={courseGroups}
          onSave={editingPath ? 
            async (data: any) => {
              await apiRequest("PUT", `/api/learning-paths/${data.id}`, data);
              queryClient.invalidateQueries({ queryKey: ["/api/learning-paths"] });
              toast({ title: "Learning path updated successfully" });
            } : 
            createPathMutation.mutateAsync
          }
          onCancel={() => {
            setIsCreateModalOpen(false);
            setEditingPath(null);
          }}
        />
      )}
    </div>
  );
}

// Learning Path Form Component
function LearningPathForm({ path, courseGroups, onSave, onCancel }: {
  path?: any;
  courseGroups: any[];
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    groupId: path?.groupId || '',
    title: path?.title || '',
    description: path?.description || '',
    orderIndex: path?.orderIndex || 1,
    requiresQuiz: path?.requiresQuiz || false,
    quizRequiredToUnlock: path?.quizRequiredToUnlock || false,
    passingScore: path?.passingScore || 70,
    maxAttempts: path?.maxAttempts || 3,
    unlockMessage: path?.unlockMessage || 'Complete the previous session and pass the quiz to unlock this content.',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = path ? { ...formData, id: path.id } : formData;
    await onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {path ? 'Edit Learning Path' : 'Create Learning Path'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Course Group *
            </label>
            <select
              value={formData.groupId}
              onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a course group</option>
              {courseGroups.map((group: any) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Module Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Module 1: Introduction to Software Testing"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Describe what students will learn in this module..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Order Index *
              </label>
              <input
                type="number"
                value={formData.orderIndex}
                onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Passing Score (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.passingScore}
                onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="requiresQuiz"
                checked={formData.requiresQuiz}
                onChange={(e) => setFormData({ ...formData, requiresQuiz: e.target.checked })}
                className="rounded border-slate-300"
              />
              <label htmlFor="requiresQuiz" className="text-sm font-medium text-slate-700">
                This module requires a quiz
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="quizRequiredToUnlock"
                checked={formData.quizRequiredToUnlock}
                onChange={(e) => setFormData({ ...formData, quizRequiredToUnlock: e.target.checked })}
                className="rounded border-slate-300"
              />
              <label htmlFor="quizRequiredToUnlock" className="text-sm font-medium text-slate-700">
                Quiz must be passed to unlock next module
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Unlock Message
            </label>
            <textarea
              value={formData.unlockMessage}
              onChange={(e) => setFormData({ ...formData, unlockMessage: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Message shown when module is locked..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {path ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main Course Manager Component
export default function CourseManager() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Course Management</h1>
        <p className="text-slate-600">Comprehensive course management system with categories, content types, and learning paths</p>
      </div>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="subcategories">Subcategories</TabsTrigger>
          <TabsTrigger value="course-groups">Course Groups</TabsTrigger>
          <TabsTrigger value="learning-paths">Learning Paths</TabsTrigger>
          <TabsTrigger value="content-types">Content Types</TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories">
          <CourseCategoriesManager />
        </TabsContent>
        
        <TabsContent value="subcategories">
          <CourseSubcategoriesManager />
        </TabsContent>
        
        <TabsContent value="course-groups">
          <CourseGroupsManager />
        </TabsContent>
        
        <TabsContent value="learning-paths">
          <LearningPathsManager />
        </TabsContent>
        
        <TabsContent value="content-types">
          <ContentTypesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}