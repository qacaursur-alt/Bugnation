import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, XCircle, Eye, Mail, Phone, Calendar, User, MessageCircle, ExternalLink } from "lucide-react";

// Enquiry Status Badge
function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    pending: { color: "bg-yellow-100 text-yellow-800", icon: "⏳" },
    approved: { color: "bg-green-100 text-green-800", icon: "✅" },
    rejected: { color: "bg-red-100 text-red-800", icon: "❌" },
    contacted: { color: "bg-blue-100 text-blue-800", icon: "📞" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <Badge className={`${config.color} border-0`}>
      <span className="mr-1">{config.icon}</span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

// Enquiry Detail Dialog
function EnquiryDetailDialog({ enquiry, isOpen, onClose, onStatusUpdate }: {
  enquiry: any;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (id: string, status: string, notes?: string) => void;
}) {
  const [status, setStatus] = useState(enquiry?.status || "pending");
  const [notes, setNotes] = useState(enquiry?.adminNotes || "");

  const handleStatusUpdate = () => {
    onStatusUpdate(enquiry.id, status, notes);
    onClose();
  };

  const handleWhatsAppContact = () => {
    if (enquiry.phoneNumber) {
      const message = `Hi ${enquiry.name}, thank you for your interest in our courses. I'm reaching out regarding your enquiry about ${enquiry.courseInterest || 'our courses'}. How can I help you today?`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${enquiry.phoneNumber.replace(/\D/g, '')}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleEmailContact = () => {
    if (enquiry.email) {
      const subject = `Re: Your enquiry about ${enquiry.courseInterest || 'our courses'}`;
      const body = `Hi ${enquiry.name},\n\nThank you for your interest in our courses. I'm reaching out regarding your enquiry.\n\nBest regards,\nTest Academy Team`;
      const mailtoUrl = `mailto:${enquiry.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
    }
  };

  if (!enquiry) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Enquiry Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Enquiry Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-lg">{enquiry.fullName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-lg">{enquiry.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <p className="text-lg">{enquiry.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Course Interest</label>
              <p className="text-lg">{enquiry.courseInterest}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Submitted</label>
              <p className="text-lg">{new Date(enquiry.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Current Status</label>
              <StatusBadge status={enquiry.status} />
            </div>
          </div>

          {/* Course Interest */}
          {(() => {
            const additionalData = enquiry.paymentInstructions ? JSON.parse(enquiry.paymentInstructions) : {};
            return additionalData.courseInterest && (
              <div>
                <label className="text-sm font-medium text-gray-500">Course Interest</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p className="text-gray-900">{additionalData.courseInterest}</p>
                </div>
              </div>
            );
          })()}

          {/* Message */}
          <div>
            <label className="text-sm font-medium text-gray-500">Message</label>
            <div className="mt-1 p-3 bg-gray-50 rounded-md">
              <p className="text-gray-900 whitespace-pre-wrap">
                {(() => {
                  const additionalData = enquiry.paymentInstructions ? JSON.parse(enquiry.paymentInstructions) : {};
                  return additionalData.message || 'No message provided';
                })()}
              </p>
            </div>
          </div>

          {/* Admin Notes */}
          <div>
            <label className="text-sm font-medium text-gray-500">Admin Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this enquiry..."
              rows={3}
            />
          </div>

          {/* Status Update */}
          <div>
            <label className="text-sm font-medium text-gray-500">Update Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contact Actions */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Contact Student</label>
              <div className="flex space-x-2 mt-2">
                {enquiry.phoneNumber && (
                  <Button
                    variant="outline"
                    onClick={handleWhatsAppContact}
                    className="flex items-center space-x-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
                {enquiry.email && (
                  <Button
                    variant="outline"
                    onClick={handleEmailContact}
                    className="flex items-center space-x-2"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={handleStatusUpdate}>
              Update Status
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Enquiry Manager Component
export default function EnquiryManager() {
  const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: enquiries = [], isLoading } = useQuery({
    queryKey: ["/api/enquiries"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/enquiries");
      return response.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      apiRequest("PUT", `/api/enquiries/${id}`, { status, adminNotes: notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enquiries"] });
    },
  });

  const handleStatusUpdate = (id: string, status: string, notes?: string) => {
    updateStatusMutation.mutate({ id, status, notes });
  };

  const filteredEnquiries = enquiries.filter((enquiry: any) => 
    statusFilter === "all" || enquiry.status === statusFilter
  );

  const statusCounts = enquiries.reduce((acc: any, enquiry: any) => {
    acc[enquiry.status] = (acc[enquiry.status] || 0) + 1;
    return acc;
  }, {});

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading enquiries...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Enquiry Management</h2>
          <p className="text-gray-600">Manage student enquiries and applications</p>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{enquiries.length}</p>
              </div>
              <Mail className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending || 0}</p>
              </div>
              <XCircle className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.approved || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Contacted</p>
                <p className="text-2xl font-bold text-blue-600">{statusCounts.contacted || 0}</p>
              </div>
              <Phone className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium">Filter by status:</label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Enquiries</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Enquiries List */}
      <div className="grid gap-4">
        {filteredEnquiries.map((enquiry: any) => (
          <Card key={enquiry.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{enquiry.fullName}</CardTitle>
                  <CardDescription className="mt-1">
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {enquiry.email}
                      </span>
                      <span className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {enquiry.phone}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(enquiry.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <StatusBadge status={enquiry.status} />
                  {enquiry.phone && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const message = `Hi ${enquiry.fullName}, thank you for your interest in our courses. How can I help you today?`;
                        const encodedMessage = encodeURIComponent(message);
                        const whatsappUrl = `https://wa.me/${enquiry.phone.replace(/\D/g, '')}?text=${encodedMessage}`;
                        window.open(whatsappUrl, '_blank');
                      }}
                      className="text-green-600 hover:text-green-700"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedEnquiry(enquiry)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-500">Course Interest:</span>
                  <span className="ml-2">{enquiry.courseInterest}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Message:</span>
                  <p className="mt-1 text-gray-700 line-clamp-2">{enquiry.message}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEnquiries.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No enquiries found</h3>
            <p className="text-gray-600">
              {statusFilter === "all" 
                ? "No enquiries have been submitted yet." 
                : `No ${statusFilter} enquiries found.`
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Enquiry Detail Dialog */}
      <EnquiryDetailDialog
        enquiry={selectedEnquiry}
        isOpen={!!selectedEnquiry}
        onClose={() => setSelectedEnquiry(null)}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}
