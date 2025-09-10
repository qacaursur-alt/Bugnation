import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Phone, 
  Calendar, 
  BookOpen, 
  MessageSquare,
  Eye,
  Check,
  X,
  CreditCard,
  Image,
  FileText,
  DollarSign,
  Trash2
} from "lucide-react";

// Enrollment Details Modal
function EnrollmentDetailsModal({ enrollment, isOpen, onClose }: {
  enrollment: any;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [adminNotes, setAdminNotes] = useState("");
  const [localEnrollment, setLocalEnrollment] = useState(enrollment);

  // Update local enrollment when prop changes
  useEffect(() => {
    setLocalEnrollment(enrollment);
  }, [enrollment]);

  const approveMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("PUT", `/api/admin/enrollments/${enrollment.id}/approve`, {
        adminNotes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/enrollments"] });
      toast({ title: "Enrollment approved successfully" });
      onClose();
    },
    onError: (error: any) => {
      console.error("Enrollment approval error:", error);
      toast({ 
        title: "Failed to approve enrollment", 
        description: error?.message || "Unknown error occurred",
        variant: "destructive" 
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("PUT", `/api/admin/enrollments/${enrollment.id}/reject`, {
        adminNotes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/enrollments"] });
      toast({ title: "Enrollment rejected" });
      onClose();
    },
    onError: (error: any) => {
      console.error("Enrollment rejection error:", error);
      toast({ 
        title: "Failed to reject enrollment", 
        description: error?.message || "Unknown error occurred",
        variant: "destructive" 
      });
    },
  });

  const activateMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("PUT", `/api/admin/enrollments/${enrollment.id}/activate`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/enrollments"] });
      toast({ title: "Enrollment activated successfully" });
      onClose();
    },
    onError: (error: any) => {
      console.error("Enrollment activation error:", error);
      toast({ 
        title: "Failed to activate enrollment", 
        description: error?.message || "Unknown error occurred",
        variant: "destructive" 
      });
    },
  });

  const updatePaymentStatusMutation = useMutation({
    mutationFn: async (data: { paymentStatus: string; transactionId?: string; paymentNotes?: string }) => {
      return await apiRequest("PUT", `/api/admin/enrollments/${enrollment.id}/payment-status`, data);
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/enrollments"] });
      // Update the local enrollment state with the new data
      if (response?.enrollment) {
        setLocalEnrollment(response.enrollment);
      }
      toast({ title: "Payment status updated successfully" });
    },
    onError: (error: any) => {
      console.error("Payment status update error:", error);
      toast({ 
        title: "Failed to update payment status", 
        description: error?.message || "Unknown error occurred",
        variant: "destructive" 
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs"><XCircle className="h-3 w-3 mr-1" />Expired</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  console.log("EnrollmentDetailsModal: isOpen:", isOpen);
  console.log("EnrollmentDetailsModal: enrollment:", enrollment);
  console.log("EnrollmentDetailsModal: localEnrollment:", localEnrollment);
  
  if (!enrollment || !localEnrollment) {
    console.log("EnrollmentDetailsModal: No enrollment data, returning null");
    return null; // Don't render anything if no enrollment data
  }

  console.log("EnrollmentDetailsModal: Rendering with enrollment:", enrollment);
  console.log("EnrollmentDetailsModal: User data:", enrollment?.user);
  console.log("EnrollmentDetailsModal: User is null?", enrollment?.user === null);
  console.log("EnrollmentDetailsModal: User is undefined?", enrollment?.user === undefined);

  // Safety check for missing user data
  if (!enrollment.user) {
    console.warn("EnrollmentDetailsModal: User data is missing, showing fallback UI");
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Student Information
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 overflow-y-auto flex-1 pr-2">
          {/* Student Information */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="font-semibold text-slate-900 mb-3">Student Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-slate-600">Name</Label>
                <p className="font-medium">
                  {(() => {
                    if (!localEnrollment?.user) return 'N/A';
                    const firstName = localEnrollment?.user?.firstName || '';
                    const lastName = localEnrollment?.user?.lastName || '';
                    return firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || 'N/A';
                  })()}
                </p>
              </div>
              <div>
                <Label className="text-sm text-slate-600">Email</Label>
                <p className="font-medium">{localEnrollment?.user?.email || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-slate-600">Phone</Label>
                <p className="font-medium flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  {localEnrollment?.phoneNumber || 'N/A'}
                </p>
              </div>
              <div>
                <Label className="text-sm text-slate-600">Study Path</Label>
                <p className="font-medium">
                  {localEnrollment?.studyPath === 'premium-live' ? 'Premium Live Classes' : 'Self-Paced Learning'}
                </p>
              </div>
            </div>
          </div>

          {/* Course Information */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="font-semibold text-slate-900 mb-3">Course Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-slate-600">Course</Label>
                <p className="font-medium flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  {localEnrollment?.courseGroup?.name || 'N/A'}
                </p>
              </div>
              <div>
                <Label className="text-sm text-slate-600">Price</Label>
                <p className="font-medium">₹{localEnrollment?.courseGroup?.price || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-slate-600">Enrolled</Label>
                <p className="font-medium flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {localEnrollment?.enrolledAt ? new Date(localEnrollment.enrolledAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <Label className="text-sm text-slate-600">Status</Label>
                <div className="mt-1">
                  {getStatusBadge(localEnrollment?.status || 'unknown')}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-slate-600">Amount</Label>
                <p className="font-medium text-lg">
                  ₹{localEnrollment?.courseGroup?.price || 'N/A'}
                </p>
              </div>
              <div>
                <Label className="text-sm text-slate-600">Payment Status</Label>
                <div className="mt-1">
                  {localEnrollment?.paymentStatus === 'paid' ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Paid
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Payment Screenshot */}
            {localEnrollment?.paymentScreenshot && (
              <div className="mt-4">
                <Label className="text-sm text-slate-600">Payment Screenshot</Label>
                <div className="mt-2">
                  <img 
                    src={localEnrollment?.paymentScreenshot} 
                    alt="Payment Screenshot" 
                    className="max-w-full h-48 object-contain border rounded-lg bg-white"
                    onClick={() => window.open(localEnrollment?.paymentScreenshot, '_blank')}
                  />
                </div>
              </div>
            )}

            {/* Payment Status Management */}
            <div className="mt-4 p-3 bg-white border rounded-lg">
              <h4 className="font-medium text-slate-900 mb-2 text-sm">Update Payment Status</h4>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={localEnrollment?.paymentStatus === 'paid' ? 'default' : 'outline'}
                  onClick={() => updatePaymentStatusMutation.mutate({ 
                    paymentStatus: 'paid',
                    transactionId: `TXN-${Date.now()}`,
                    paymentNotes: 'Payment confirmed by admin'
                  })}
                  disabled={updatePaymentStatusMutation.isPending}
                  className="text-xs px-3 py-1 h-8"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Mark as Paid
                </Button>
                <Button
                  size="sm"
                  variant={localEnrollment?.paymentStatus === 'pending' ? 'default' : 'outline'}
                  onClick={() => updatePaymentStatusMutation.mutate({ 
                    paymentStatus: 'pending',
                    paymentNotes: 'Payment status reset to pending'
                  })}
                  disabled={updatePaymentStatusMutation.isPending}
                  className="text-xs px-3 py-1 h-8"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Mark as Pending
                </Button>
                <Button
                  size="sm"
                  variant={localEnrollment?.paymentStatus === 'failed' ? 'default' : 'outline'}
                  onClick={() => updatePaymentStatusMutation.mutate({ 
                    paymentStatus: 'failed',
                    paymentNotes: 'Payment failed or rejected'
                  })}
                  disabled={updatePaymentStatusMutation.isPending}
                  className="text-xs px-3 py-1 h-8"
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Mark as Failed
                </Button>
              </div>
            </div>
            
            {/* Transaction ID */}
            {localEnrollment?.transactionId && (
              <div className="mt-4">
                <Label className="text-sm text-slate-600">Transaction ID</Label>
                <p className="font-mono text-sm bg-white p-2 rounded border">
                  {localEnrollment?.transactionId}
                </p>
              </div>
            )}
            
            {/* Payment Notes */}
            {localEnrollment?.paymentNotes && (
              <div className="mt-4">
                <Label className="text-sm text-slate-600">Payment Notes</Label>
                <p className="text-sm bg-white p-2 rounded border">
                  {localEnrollment?.paymentNotes}
                </p>
              </div>
            )}
          </div>

          {/* Admin Notes */}
          <div className="space-y-2">
            <Label htmlFor="adminNotes" className="text-sm">Admin Notes</Label>
            <Textarea 
              id="adminNotes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add notes about this enrollment..."
              rows={2}
              className="text-sm"
            />
          </div>

        </div>
        
        {/* Actions - Fixed at bottom */}
        <div className="flex-shrink-0 border-t pt-4 mt-4">
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            
            {localEnrollment?.status === 'pending' && (
              <>
                <Button 
                  onClick={() => rejectMutation.mutate()}
                  disabled={rejectMutation.isPending}
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                </Button>
                <Button 
                  onClick={() => approveMutation.mutate()}
                  disabled={approveMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {approveMutation.isPending ? 'Approving...' : 'Approve Payment'}
                </Button>
              </>
            )}
            
            {localEnrollment?.status === 'approved' && (
              <Button 
                onClick={() => activateMutation.mutate()}
                disabled={activateMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {activateMutation.isPending ? 'Activating...' : 'Activate Course'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Enrollments Manager
export default function EnrollmentsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const { data: enrollments = [], isLoading, error } = useQuery({
    queryKey: ["/api/admin/enrollments"],
  });

  const enrollmentsArray = enrollments as any[];

  console.log("EnrollmentsManager: isLoading:", isLoading);
  console.log("EnrollmentsManager: error:", error);
  console.log("EnrollmentsManager: enrollments:", enrollments);
  console.log("EnrollmentsManager: enrollmentsArray length:", enrollmentsArray.length);

  // Debug state changes
  useEffect(() => {
    console.log("EnrollmentsManager: selectedEnrollment changed:", selectedEnrollment);
  }, [selectedEnrollment]);

  useEffect(() => {
    console.log("EnrollmentsManager: isDetailsModalOpen changed:", isDetailsModalOpen);
  }, [isDetailsModalOpen]);

  const deleteMutation = useMutation({
    mutationFn: async (enrollmentId: string) => {
      return await apiRequest("DELETE", `/api/admin/enrollments/${enrollmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/enrollments"] });
      toast({ title: "Enrollment deleted successfully" });
    },
    onError: (error: any) => {
      console.error("Enrollment deletion error:", error);
      toast({ 
        title: "Failed to delete enrollment", 
        description: error?.message || "Unknown error occurred",
        variant: "destructive" 
      });
    },
  });

  const handleViewDetails = (enrollment: any) => {
    console.log("Viewing enrollment details:", enrollment);
    console.log("Current selectedEnrollment:", selectedEnrollment);
    console.log("Current isDetailsModalOpen:", isDetailsModalOpen);
    if (enrollment) {
      setSelectedEnrollment(enrollment);
      setIsDetailsModalOpen(true);
      console.log("Set selectedEnrollment to:", enrollment);
      console.log("Set isDetailsModalOpen to true");
    } else {
      console.error("No enrollment data provided to handleViewDetails");
    }
  };

  const handleDeleteEnrollment = (enrollmentId: string) => {
    if (window.confirm("Are you sure you want to delete this enrollment? This action cannot be undone.")) {
      deleteMutation.mutate(enrollmentId);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs"><XCircle className="h-3 w-3 mr-1" />Expired</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const pendingCount = enrollmentsArray.filter((e: any) => e.status === 'pending').length;
  const approvedCount = enrollmentsArray.filter((e: any) => e.status === 'approved').length;
  const activeCount = enrollmentsArray.filter((e: any) => e.status === 'active').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Enrollment Management</h2>
        <p className="text-slate-600">Manage student enrollments and payment approvals</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Pending Approval</p>
                <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Approved</p>
                <p className="text-2xl font-bold text-slate-900">{approvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Active</p>
                <p className="text-2xl font-bold text-slate-900">{activeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enrollments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Enrollments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase w-48">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase w-40">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase w-24">Study Path</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase w-32">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase w-24">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase w-24">Enrolled</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {enrollmentsArray.map((enrollment: any) => (
                  <tr key={enrollment.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 whitespace-nowrap w-48">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                          <span className="text-xs font-medium text-slate-600">
                            {enrollment.user?.firstName?.[0] || 'U'}{enrollment.user?.lastName?.[0] || ''}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-slate-900 truncate">
                            {enrollment.user ? `${enrollment.user.firstName || ''} ${enrollment.user.lastName || ''}`.trim() : 'Unknown User'}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {enrollment.user?.email || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap w-40">
                      <div className="flex items-center">
                        <BookOpen className="h-3 w-3 mr-2 text-slate-400" />
                        <div>
                          <div className="text-sm font-medium text-slate-900 truncate">
                            {enrollment.courseGroup?.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            ₹{enrollment.courseGroup?.price}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap w-24">
                      <Badge variant="outline" className="text-xs">
                        {enrollment.studyPath === 'premium-live' ? 'Premium Live' : 'Self-Paced'}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap w-32">
                      <div className="flex items-center text-xs text-slate-500">
                        <Phone className="h-3 w-3 mr-1" />
                        {enrollment.phoneNumber}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap w-24">
                      {getStatusBadge(enrollment.status)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-500 w-24">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium w-32">
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(enrollment)}
                          className="text-xs px-2 py-1 h-7"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteEnrollment(enrollment.id)}
                          disabled={deleteMutation.isPending}
                          className="text-xs px-2 py-1 h-7"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Enrollment Details Modal */}
      <EnrollmentDetailsModal
        enrollment={selectedEnrollment}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedEnrollment(null);
        }}
      />

    </div>
  );
}
