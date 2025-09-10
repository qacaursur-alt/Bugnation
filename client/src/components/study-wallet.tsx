import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { PDFViewer } from "./pdf-viewer";
import { PPTViewer } from "./ppt-viewer";
import ContentViewer from "./content-viewer";
import { 
  Download, 
  FileText, 
  Video, 
  Image, 
  File, 
  Search,
  Filter,
  SortAsc,
  Folder,
  BookOpen,
  Presentation,
  Archive,
  Eye,
  Play
} from "lucide-react";

interface StudyWalletProps {
  groupId: string;
}

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  type: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  uploadedAt: string;
  category?: string;
  tags?: string[];
}

export function StudyWallet({ groupId }: StudyWalletProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);

  const { data: materials = [], isLoading } = useQuery<StudyMaterial[]>({
    queryKey: ["/api/study-materials", groupId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/study-materials?groupId=${groupId}`);
      return response.json();
    },
    enabled: !!groupId,
  });

  // Filter and sort materials
  const filteredMaterials = (materials || [])
    .filter(material => {
      const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           material.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || material.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        case "oldest":
          return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        case "name":
          return a.title.localeCompare(b.title);
        case "size":
          return (b.fileSize || 0) - (a.fileSize || 0);
        default:
          return 0;
      }
    });

  // Group materials by type
  const materialsByType = {
    documents: filteredMaterials.filter(m => m.type === 'pdf' || m.type === 'doc' || m.type === 'docx'),
    videos: filteredMaterials.filter(m => m.type === 'video' || m.type === 'mp4'),
    presentations: filteredMaterials.filter(m => m.type === 'ppt' || m.type === 'pptx'),
    images: filteredMaterials.filter(m => m.type === 'image' || m.type === 'jpg' || m.type === 'png'),
    archives: filteredMaterials.filter(m => m.type === 'zip' || m.type === 'rar'),
    other: filteredMaterials.filter(m => !['pdf', 'doc', 'docx', 'video', 'mp4', 'ppt', 'pptx', 'image', 'jpg', 'png', 'zip', 'rar'].includes(m.type))
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'video':
      case 'mp4':
        return <Video className="h-5 w-5 text-blue-500" />;
      case 'ppt':
      case 'pptx':
        return <Presentation className="h-5 w-5 text-orange-500" />;
      case 'image':
      case 'jpg':
      case 'png':
        return <Image className="h-5 w-5 text-green-500" />;
      case 'zip':
      case 'rar':
        return <Archive className="h-5 w-5 text-purple-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleViewMaterial = (material: StudyMaterial) => {
    setSelectedMaterial(material);
    setViewerOpen(true);
  };

  const handleDownloadMaterial = (material: StudyMaterial) => {
    if (!material.fileUrl) {
      console.error('No file URL available for download');
      return;
    }
    
    const link = document.createElement('a');
    link.href = material.fileUrl;
    link.download = material.fileName || material.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileType = (type: string) => {
    if (type === 'pdf') return 'pdf';
    if (type === 'ppt' || type === 'pptx') return 'ppt';
    if (type === 'video' || type === 'mp4') return 'video';
    if (type === 'image' || type === 'jpg' || type === 'png') return 'image';
    if (type === 'doc' || type === 'docx') return 'document';
    return 'document';
  };

  const canView = (material: StudyMaterial) => {
    const viewableTypes = ['pdf', 'ppt', 'pptx', 'video', 'mp4', 'image', 'jpg', 'png', 'doc', 'docx'];
    return viewableTypes.includes(material.type) && material.fileUrl;
  };

  const canDownload = (material: StudyMaterial) => {
    return material.fileUrl && material.type !== 'video' && material.type !== 'mp4';
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'doc':
      case 'docx':
        return 'destructive';
      case 'video':
      case 'mp4':
        return 'default';
      case 'ppt':
      case 'pptx':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-slate-600 mt-2">Loading study materials...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9 text-sm"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm h-9 flex-1 sm:flex-none"
          >
            <option value="all">All Categories</option>
            <option value="lecture">Lecture Notes</option>
            <option value="assignment">Assignments</option>
            <option value="reference">Reference Materials</option>
            <option value="practice">Practice Tests</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm h-9 flex-1 sm:flex-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name A-Z</option>
            <option value="size">Size</option>
          </select>
        </div>
      </div>

      {/* Materials by Type */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="all" className="text-xs sm:text-sm">All ({filteredMaterials.length})</TabsTrigger>
          <TabsTrigger value="documents" className="text-xs sm:text-sm">Docs ({materialsByType.documents.length})</TabsTrigger>
          <TabsTrigger value="videos" className="text-xs sm:text-sm">Videos ({materialsByType.videos.length})</TabsTrigger>
          <TabsTrigger value="presentations" className="text-xs sm:text-sm">PPT ({materialsByType.presentations.length})</TabsTrigger>
          <TabsTrigger value="images" className="text-xs sm:text-sm">Images ({materialsByType.images.length})</TabsTrigger>
          <TabsTrigger value="other" className="text-xs sm:text-sm">Other ({materialsByType.other.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {filteredMaterials.length === 0 ? (
            <div className="text-center py-8">
              <Folder className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Materials Found</h3>
              <p className="text-slate-600 mb-4">No study materials match your search criteria.</p>
              <Button
                onClick={() => {/* TODO: Open add material popup */}}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Add Material
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMaterials.map((material) => (
                <div key={material.id} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  {getFileIcon(material.type)}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 truncate">{material.title}</h3>
                    <p className="text-sm text-slate-600 truncate">{material.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getTypeBadgeVariant(material.type)} className="text-xs">
                      {material.type.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {formatFileSize(material.fileSize)}
                    </span>
                    {canView(material) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewMaterial(material)}
                        title="View/Read"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {canDownload(material) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadMaterial(material)}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {Object.entries(materialsByType).map(([type, materials]) => (
          <TabsContent key={type} value={type} className="space-y-4">
            {materials.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Folder className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No {type} Found</h3>
                  <p className="text-slate-600">No {type} materials available yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {materials.map((material) => (
                  <Card key={material.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        {getFileIcon(material.type)}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-slate-900 truncate">{material.title}</h3>
                          <p className="text-sm text-slate-600 mt-1 line-clamp-2">{material.description}</p>
                          <div className="flex items-center justify-between mt-3">
                            <Badge variant={getTypeBadgeVariant(material.type)} className="text-xs">
                              {material.type.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {formatFileSize(material.fileSize)}
                            </span>
                          </div>
                          <div className="mt-3 flex flex-col sm:flex-row gap-2">
                            {canView(material) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewMaterial(material)}
                                className="flex-1 text-xs sm:text-sm"
                              >
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">
                                  {material.type === 'video' || material.type === 'mp4' ? 'Play' : 'Read'}
                                </span>
                                <span className="sm:hidden">
                                  {material.type === 'video' || material.type === 'mp4' ? '▶' : '👁'}
                                </span>
                              </Button>
                            )}
                            {canDownload(material) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadMaterial(material)}
                                className="flex-1 text-xs sm:text-sm"
                              >
                                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Download</span>
                                <span className="sm:hidden">↓</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* File Viewer Modal */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center space-x-2">
              {selectedMaterial && getFileIcon(selectedMaterial.type)}
              <span>{selectedMaterial?.title}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 p-6 pt-0 overflow-hidden">
            {selectedMaterial && (
              <div className="h-full">
                {selectedMaterial.type === 'pdf' && (
                  <PDFViewer
                    pdfUrl={selectedMaterial.fileUrl!}
                    title={selectedMaterial.title}
                    description={selectedMaterial.description}
                  />
                )}
                {selectedMaterial.type === 'ppt' && (
                  <PPTViewer
                    isOpen={viewerOpen}
                    onClose={() => setViewerOpen(false)}
                    slides={[{
                      id: '1',
                      title: selectedMaterial.title,
                      content: selectedMaterial.description || 'No content available',
                      imageUrl: selectedMaterial.fileUrl
                    }]}
                  />
                )}
                {(selectedMaterial.type === 'video' || selectedMaterial.type === 'mp4') && (
                  <ContentViewer
                    content={{
                      id: selectedMaterial.id,
                      title: selectedMaterial.title,
                      description: selectedMaterial.description,
                      type: 'video',
                      fileUrl: selectedMaterial.fileUrl,
                      fileName: selectedMaterial.fileName,
                      fileSize: selectedMaterial.fileSize
                    }}
                    showProgress={false}
                  />
                )}
                {(selectedMaterial.type === 'image' || selectedMaterial.type === 'jpg' || selectedMaterial.type === 'png') && (
                  <ContentViewer
                    content={{
                      id: selectedMaterial.id,
                      title: selectedMaterial.title,
                      description: selectedMaterial.description,
                      type: 'image',
                      fileUrl: selectedMaterial.fileUrl,
                      fileName: selectedMaterial.fileName,
                      fileSize: selectedMaterial.fileSize
                    }}
                    showProgress={false}
                  />
                )}
                {(selectedMaterial.type === 'doc' || selectedMaterial.type === 'docx') && (
                  <ContentViewer
                    content={{
                      id: selectedMaterial.id,
                      title: selectedMaterial.title,
                      description: selectedMaterial.description,
                      type: 'document',
                      fileUrl: selectedMaterial.fileUrl,
                      fileName: selectedMaterial.fileName,
                      fileSize: selectedMaterial.fileSize
                    }}
                    showProgress={false}
                  />
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
