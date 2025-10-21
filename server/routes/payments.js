import { Router } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { authenticateToken } from '../middleware/auth.js';
import Booking from '../models/Booking.js';
import Venue from '../models/Venue.js';

const router = Router();

// Initialize Razorpay only if credentials are available
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// Create Razorpay order for booking payment
router.post('/create-order', authenticateToken, async (req, res) => {
  try {
    if (!razorpay) return res.status(503).json({ error: 'Payment gateway not configured. Please contact support.' });

    const { bookingId } = req.body;
    const customerId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ error: 'Invalid booking id' });
    }

    const booking = await Booking.findOne({ _id: bookingId, customer_id: customerId, status: 'confirmed' }).lean();
    if (!booking) return res.status(404).json({ error: 'Booking not found or not confirmed' });

    if (booking.razorpay_order_id) return res.status(400).json({ error: 'Payment order already exists for this booking' });

    let vName = undefined;
    if (booking.venue_id && mongoose.Types.ObjectId.isValid(booking.venue_id)) {
      const v = await Venue.findById(booking.venue_id, { name: 1 }).lean();
      vName = v?.name;
    }

    const paymentAmount = Number(booking.payment_amount || booking.amount);
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount for booking' });
    }
    const amountPaise = Math.round(paymentAmount * 100);
    if (!Number.isInteger(amountPaise) || amountPaise < 100) {
      return res.status(400).json({ error: 'Payment amount must be at least ₹1.00' });
    }

    const shortId = String(bookingId).slice(-8);
    const ts = Date.now().toString().slice(-8);
    const safeReceipt = `b_${shortId}_${ts}`; // <= 40 chars

    const orderOptions = {
      amount: amountPaise,
      currency: 'INR',
      receipt: safeReceipt,
      notes: {
        booking_id: String(bookingId),
        venue_name: vName ? String(vName).slice(0, 60) : undefined,
        customer_id: String(customerId),
        event_date: booking.event_date ? new Date(booking.event_date).toISOString() : undefined,
        display_amount: String(booking.amount),
        payment_amount: String(paymentAmount)
      }
    };

    let order;
    try {
      order = await razorpay.orders.create(orderOptions);
    } catch (rzpErr) {
      const gatewayMsg = rzpErr?.error?.description || rzpErr?.message || 'Payment gateway order creation failed';
      console.error('Razorpay order create error:', rzpErr);
      return res.status(502).json({ error: gatewayMsg });
    }

    await Booking.updateOne({ _id: bookingId }, { $set: { razorpay_order_id: order.id, payment_status: 'pending' } });

    res.json({ success: true, order: { id: order.id, amount: order.amount, currency: order.currency, booking_id: bookingId, venue_name: vName }, key_id: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    const safeMessage = typeof error?.message === 'string' && error.message.length < 300 ? error.message : 'Failed to create payment order';
    res.status(500).json({ error: safeMessage });
  }
});

// Verify Razorpay payment
router.post('/verify-payment', authenticateToken, async (req, res) => {
  try {
    if (!razorpay) return res.status(503).json({ error: 'Payment gateway not configured. Please contact support.' });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = req.body;
    const customerId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(booking_id)) {
      return res.status(400).json({ error: 'Invalid booking id' });
    }

    const booking = await Booking.findOne({ _id: booking_id, customer_id: customerId, razorpay_order_id }).lean();
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body.toString()).digest('hex');
    if (expectedSignature !== razorpay_signature) return res.status(400).json({ error: 'Invalid payment signature' });

    await Booking.updateOne({ _id: booking_id }, { $set: { payment_status: 'completed', razorpay_payment_id, payment_completed_at: new Date() } });

    res.json({ success: true, message: 'Payment verified successfully', payment_id: razorpay_payment_id });
  } catch (error) {
    console.error('Error verifying payment:', error);
    const safeMessage = typeof error?.message === 'string' && error.message.length < 300 ? error.message : 'Payment verification failed';
    res.status(500).json({ error: safeMessage });
  }
});

// Get payment status for booking
router.get('/status/:bookingId', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const customerId = req.user.id;
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ error: 'Invalid booking id' });
    }
    const booking = await Booking.findOne({ _id: bookingId, customer_id: customerId }, { payment_status: 1, razorpay_order_id: 1, razorpay_payment_id: 1, amount: 1, payment_completed_at: 1 }).lean();
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ error: 'Failed to fetch payment status' });
  }
});

// Handle payment failure
router.post('/payment-failed', authenticateToken, async (req, res) => {
  try {
    const { booking_id, error_description } = req.body;
    const customerId = req.user.id;
    if (!mongoose.Types.ObjectId.isValid(booking_id)) {
      return res.status(400).json({ error: 'Invalid booking id' });
    }
    await Booking.updateOne({ _id: booking_id, customer_id: customerId }, { $set: { payment_status: 'failed', payment_error_description: error_description } });
    res.json({ success: true, message: 'Payment failure recorded' });
  } catch (error) {
    console.error('Error recording payment failure:', error);
    res.status(500).json({ error: 'Failed to record payment failure' });
  }
});

export default router;
