import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Download, 
  Award, 
  Calendar, 
  User, 
  BookOpen,
  CheckCircle,
  Share2,
  Printer
} from "lucide-react";

interface CertificateViewerProps {
  userId: string;
  groupId: string;
}

interface Certificate {
  id: string;
  certificateNumber: string;
  studentName: string;
  courseName: string;
  completionDate: string;
  certificateUrl?: string;
  status: string;
  issuedAt?: string;
}

export function CertificateViewer({ userId, groupId }: CertificateViewerProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const { data: certificates = [], isLoading } = useQuery<Certificate[]>({
    queryKey: ["/api/certificates", userId, groupId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/certificates?userId=${userId}&groupId=${groupId}`);
      return response;
    },
    enabled: !!userId && !!groupId,
  });

  const generateCertificate = async () => {
    setIsGenerating(true);
    try {
      const response = await apiRequest("POST", "/api/certificates/generate", {
        userId,
        groupId,
      });
      
      if (response.success) {
        // Refresh certificates list
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to generate certificate:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCertificate = async (certificate: Certificate) => {
    try {
      if (certificate.certificateUrl) {
        // Download existing certificate
        const link = document.createElement('a');
        link.href = certificate.certificateUrl;
        link.download = `certificate-${certificate.certificateNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Generate and download new certificate
        const response = await fetch(`/api/certificates/${certificate.id}/download`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `certificate-${certificate.certificateNumber}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      console.error("Failed to download certificate:", error);
    }
  };

  const printCertificate = (certificate: Certificate) => {
    if (certificateRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Certificate - ${certificate.studentName}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                .certificate { border: 3px solid #018763; padding: 40px; text-align: center; }
                .header { color: #018763; font-size: 28px; font-weight: bold; margin-bottom: 20px; }
                .subtitle { color: #666; font-size: 16px; margin-bottom: 30px; }
                .student-name { font-size: 24px; font-weight: bold; margin: 20px 0; }
                .course-name { font-size: 20px; color: #333; margin: 20px 0; }
                .completion-date { font-size: 16px; color: #666; margin: 20px 0; }
                .certificate-number { font-size: 14px; color: #999; margin-top: 30px; }
              </style>
            </head>
            <body>
              ${certificateRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-slate-600 mt-2">Loading certificates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Certificates</h2>
        <p className="text-slate-600">Download and share your course completion certificates</p>
      </div>

      {certificates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Award className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Certificates Yet</h3>
            <p className="text-slate-600 mb-4">Complete your course to earn a certificate</p>
            <Button onClick={generateCertificate} disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate Certificate"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {certificates.map((certificate) => (
            <Card key={certificate.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{certificate.courseName}</CardTitle>
                      <p className="text-sm text-slate-600">Certificate of Completion</p>
                    </div>
                  </div>
                  <Badge 
                    variant={certificate.status === 'issued' ? 'default' : 'secondary'}
                    className={certificate.status === 'issued' ? 'bg-green-500' : ''}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {certificate.status === 'issued' ? 'Issued' : 'Pending'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Certificate Preview */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900">Certificate Preview</h3>
                    <div 
                      ref={certificateRef}
                      className="border-2 border-slate-200 rounded-lg p-6 bg-white"
                    >
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 mb-4">
                          Certificate of Completion
                        </div>
                        <div className="text-sm text-slate-600 mb-6">
                          This is to certify that
                        </div>
                        <div className="text-xl font-bold text-slate-900 mb-6">
                          {certificate.studentName}
                        </div>
                        <div className="text-sm text-slate-600 mb-4">
                          has successfully completed the course
                        </div>
                        <div className="text-lg font-semibold text-slate-800 mb-6">
                          {certificate.courseName}
                        </div>
                        <div className="text-sm text-slate-600 mb-4">
                          Completed on {new Date(certificate.completionDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-slate-500 mt-6">
                          Certificate Number: {certificate.certificateNumber}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Certificate Details & Actions */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900">Certificate Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <User className="h-4 w-4 text-slate-500" />
                        <span className="text-sm text-slate-600">Student:</span>
                        <span className="text-sm font-medium">{certificate.studentName}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <BookOpen className="h-4 w-4 text-slate-500" />
                        <span className="text-sm text-slate-600">Course:</span>
                        <span className="text-sm font-medium">{certificate.courseName}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        <span className="text-sm text-slate-600">Completed:</span>
                        <span className="text-sm font-medium">
                          {new Date(certificate.completionDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Award className="h-4 w-4 text-slate-500" />
                        <span className="text-sm text-slate-600">Certificate #:</span>
                        <span className="text-sm font-medium">{certificate.certificateNumber}</span>
                      </div>
                    </div>

                    <div className="pt-4 space-y-2">
                      <Button 
                        onClick={() => downloadCertificate(certificate)}
                        className="w-full"
                        disabled={certificate.status !== 'issued'}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => printCertificate(certificate)}
                        className="w-full"
                        disabled={certificate.status !== 'issued'}
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print Certificate
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          // Share functionality
                          if (navigator.share) {
                            navigator.share({
                              title: 'My Course Certificate',
                              text: `I completed ${certificate.courseName} and earned a certificate!`,
                              url: window.location.href,
                            });
                          } else {
                            // Fallback: copy to clipboard
                            navigator.clipboard.writeText(
                              `I completed ${certificate.courseName} and earned a certificate! Check it out: ${window.location.href}`
                            );
                          }
                        }}
                        className="w-full"
                        disabled={certificate.status !== 'issued'}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Achievement
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
