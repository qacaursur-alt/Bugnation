import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useToast } from "../hooks/use-toast";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  amount: number;
  onSuccess: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function PaymentModal({ isOpen, onClose, groupId, groupName, amount, onSuccess }: PaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      // Create checkout session
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId,
          amount,
          provider: 'razorpay'
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create payment');
      }

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => openRazorpay(data);
        document.body.appendChild(script);
      } else {
        openRazorpay(data);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openRazorpay = (paymentData: any) => {
    const options = {
      key: paymentData.key,
      amount: paymentData.amount,
      currency: paymentData.currency,
      name: 'Debug Nation',
      description: `Payment for ${groupName}`,
      order_id: paymentData.orderId,
      handler: async (response: any) => {
        try {
          // Verify payment on server
          const verifyResponse = await fetch('/api/payments/success', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId: paymentData.paymentId,
            }),
          });

          const result = await verifyResponse.json();
          
          if (verifyResponse.ok) {
            toast({
              title: "Payment Successful",
              description: "You have been enrolled in the course!",
            });
            onSuccess();
            onClose();
          } else {
            throw new Error(result.message || 'Payment verification failed');
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          toast({
            title: "Payment Verification Failed",
            description: error instanceof Error ? error.message : "Failed to verify payment",
            variant: "destructive",
          });
        }
      },
      prefill: {
        name: '',
        email: '',
        contact: '',
      },
      notes: {
        address: 'Debug Nation',
      },
      theme: {
        color: '#0066CC',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold">{groupName}</h3>
            <p className="text-2xl font-bold text-green-600">₹{amount}</p>
          </div>
          <div className="space-y-2">
            <Button 
              onClick={handlePayment} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Processing..." : "Pay with Razorpay"}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
