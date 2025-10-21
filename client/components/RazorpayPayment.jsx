import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Loader2, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';
import apiClient from '../lib/apiClient';
import { formatPrice } from '@/lib/priceUtils';

const RazorpayPayment = ({ booking, onPaymentSuccess, onPaymentFailure }) => {
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initatePayment = async () => {
    try {
      setLoading(true);
      console.log('Payment initiation started for booking:', booking.id);

      // Load Razorpay script
      console.log('Loading Razorpay script...');
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      // Create Razorpay order
      console.log('Creating Razorpay order for booking ID:', booking.id);
      const orderResponse = await apiClient.callJson('/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ bookingId: booking.id })
      });

      console.log('Order creation response:', orderResponse);

      if (!orderResponse.success) {
        console.error('Payment order creation failed:', orderResponse);
        if (orderResponse.error?.includes('Payment gateway not configured')) {
          throw new Error('Payment gateway is currently not available. Please contact support.');
        }
        throw new Error(orderResponse.error || 'Failed to create payment order');
      }

      const { order, key_id } = orderResponse;
      console.log('Payment order created successfully:', order);

      // Razorpay options
      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'VenueKart',
        description: `Payment for ${order.venue_name}`,
        order_id: order.id,
        prefill: {
          name: booking.customer_name,
          email: booking.customer_email,
          contact: booking.customer_phone,
        },
        theme: {
          color: '#3C3B6E', // venue-indigo
        },
        method: {
          netbanking: true,
          card: true,
          upi: true,
          wallet: false,
          emi: false,
          paylater: false
        },
        config: {
          display: {
            blocks: {
              banks: {
                name: 'Pay using Net Banking',
                instruments: [
                  {
                    method: 'netbanking'
                  }
                ]
              },
              other: {
                name: 'Other Payment Methods',
                instruments: [
                  {
                    method: 'card'
                  },
                  {
                    method: 'upi'
                  }
                ]
              }
            },
            sequence: ['block.banks', 'block.other'],
            preferences: {
              show_default_blocks: false
            }
          }
        },
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await apiClient.callJson('/api/payments/verify-payment', {
              method: 'POST',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                booking_id: booking.id
              })
            });

            if (verifyResponse.success) {
              setPaymentStatus('success');
              toast({
                title: "Payment Successful!",
                description: "Your payment has been processed successfully.",
                variant: "default",
              });
              if (onPaymentSuccess) {
                onPaymentSuccess(response.razorpay_payment_id);
              }
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setPaymentStatus('failed');
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support for assistance.",
              variant: "destructive",
            });
            if (onPaymentFailure) {
              onPaymentFailure(error.message);
            }
          }
        },
        modal: {
          ondismiss: function() {
            // Handle payment cancellation
            setPaymentStatus('cancelled');
            toast({
              title: "Payment Cancelled",
              description: "You can retry payment anytime from your dashboard.",
              variant: "default",
            });
          }
        }
      };

      // Check if Razorpay is available
      if (!window.Razorpay) {
        throw new Error('Razorpay payment gateway failed to load. Please refresh the page and try again.');
      }

      console.log('Creating Razorpay checkout with options:', options);
      const rzp = new window.Razorpay(options);
      console.log('Opening Razorpay payment gateway...');
      rzp.open();

    } catch (error) {
      console.error('Payment initiation error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
      
      // Record payment failure
      try {
        await apiClient.callJson('/api/payments/payment-failed', {
          method: 'POST',
          body: JSON.stringify({
            booking_id: booking.id,
            error_description: error.message
          })
        });
      } catch (recordError) {
        console.error('Failed to record payment failure:', recordError);
      }

      if (onPaymentFailure) {
        onPaymentFailure(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Payment Pending
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-green-500 hover:bg-green-600">
            <CheckCircle className="h-3 w-3" />
            Payment Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Payment Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  // Don't show payment button if not confirmed or already paid
  if (booking.status !== 'confirmed' || booking.payment_status === 'completed') {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {getPaymentStatusBadge(booking.payment_status)}
        
        {booking.payment_status === 'pending' && (
          <Button
            onClick={initatePayment}
            disabled={loading}
            className="bg-venue-indigo hover:bg-venue-purple"
            size="sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay Now
              </>
            )}
          </Button>
        )}
      </div>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-venue-purple" />
              Complete Payment
            </DialogTitle>
            <DialogDescription>
              Secure payment powered by Razorpay
            </DialogDescription>
          </DialogHeader>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{booking.venue_name}</CardTitle>
              <CardDescription>
                Event Date: {new Date(booking.event_date).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Guest Count:</span>
                  <p className="font-medium">{booking.guest_count}</p>
                </div>
                <div>
                  <span className="text-gray-600">Event Type:</span>
                  <p className="font-medium">{booking.event_type}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Amount to Pay:</span>
                  <span className="text-venue-purple">{formatPrice(booking.payment_amount || booking.amount)}</span>
                </div>
                {booking.payment_amount && booking.amount !== booking.payment_amount && (
                  <div className="text-xs text-gray-500 mt-1">
                    Display price: {formatPrice(booking.amount)} (includes taxes & fees)
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Available Payment Methods:</h4>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    <span>Cards</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>UPI</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21 18V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H19C20.1 3 21 3.9 21 5V6H12C10.9 6 10 6.9 10 8V16C10 17.1 10.9 18 12 18H21ZM12 16V8H22V16H12ZM16 13.5C16.8 13.5 17.5 12.8 17.5 12S16.8 10.5 16 10.5 14.5 11.2 14.5 12 15.2 13.5 16 13.5Z"/>
                    </svg>
                    <span>Net Banking</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={initatePayment}
                  disabled={loading}
                  className="flex-1 bg-venue-indigo hover:bg-venue-purple"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay {formatPrice(booking.payment_amount || booking.amount)}
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentDialog(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>

              <div className="text-xs text-gray-500 text-center">
                🔒 Secure payment via Cards, UPI & Net Banking • Powered by Razorpay
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RazorpayPayment;
