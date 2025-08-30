import { Router } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

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
    // Check if Razorpay is configured
    if (!razorpay) {
      return res.status(503).json({
        error: 'Payment gateway not configured. Please contact support.'
      });
    }

    const { bookingId } = req.body;
    const customerId = req.user.id;

    // Verify booking belongs to user and is confirmed
    const [bookings] = await pool.execute(`
      SELECT b.*, v.name as venue_name 
      FROM bookings b 
      JOIN venues v ON b.venue_id = v.id
      WHERE b.id = ? AND b.customer_id = ? AND b.status = 'confirmed'
    `, [bookingId, customerId]);

    if (bookings.length === 0) {
      return res.status(404).json({ error: 'Booking not found or not confirmed' });
    }

    const booking = bookings[0];

    // Check if payment order already exists
    if (booking.razorpay_order_id) {
      return res.status(400).json({ error: 'Payment order already exists for this booking' });
    }

    // Create Razorpay order using payment_amount (base price) instead of total amount
    const paymentAmount = booking.payment_amount || booking.amount; // Fallback to amount if payment_amount not set
    const orderOptions = {
      amount: Math.round(paymentAmount * 100), // Convert to paisa
      currency: 'INR',
      receipt: `booking_${bookingId}_${Date.now()}`,
      notes: {
        booking_id: bookingId,
        venue_name: booking.venue_name,
        customer_id: customerId,
        event_date: booking.event_date,
        display_amount: booking.amount, // Keep track of display amount
        payment_amount: paymentAmount // Actual payment amount
      }
    };

    const order = await razorpay.orders.create(orderOptions);

    // Update booking with Razorpay order ID
    await pool.execute(
      'UPDATE bookings SET razorpay_order_id = ?, payment_status = ? WHERE id = ?',
      [order.id, 'pending', bookingId]
    );

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        booking_id: bookingId,
        venue_name: booking.venue_name
      },
      key_id: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// Verify Razorpay payment
router.post('/verify-payment', authenticateToken, async (req, res) => {
  try {
    // Check if Razorpay is configured
    if (!razorpay) {
      return res.status(503).json({
        error: 'Payment gateway not configured. Please contact support.'
      });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      booking_id
    } = req.body;

    const customerId = req.user.id;

    // Verify booking belongs to user
    const [bookings] = await pool.execute(
      'SELECT * FROM bookings WHERE id = ? AND customer_id = ? AND razorpay_order_id = ?',
      [booking_id, customerId, razorpay_order_id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verify Razorpay signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Payment verified successfully - update booking
    await pool.execute(`
      UPDATE bookings 
      SET payment_status = 'completed', 
          razorpay_payment_id = ?,
          payment_completed_at = NOW()
      WHERE id = ?
    `, [razorpay_payment_id, booking_id]);

    res.json({
      success: true,
      message: 'Payment verified successfully',
      payment_id: razorpay_payment_id
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Get payment status for booking
router.get('/status/:bookingId', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const customerId = req.user.id;

    const [bookings] = await pool.execute(`
      SELECT payment_status, razorpay_order_id, razorpay_payment_id, amount, payment_completed_at
      FROM bookings 
      WHERE id = ? AND customer_id = ?
    `, [bookingId, customerId]);

    if (bookings.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(bookings[0]);
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

    // Update booking payment status to failed
    await pool.execute(`
      UPDATE bookings 
      SET payment_status = 'failed',
          payment_error_description = ?
      WHERE id = ? AND customer_id = ?
    `, [error_description, booking_id, customerId]);

    res.json({ success: true, message: 'Payment failure recorded' });
  } catch (error) {
    console.error('Error recording payment failure:', error);
    res.status(500).json({ error: 'Failed to record payment failure' });
  }
});

export default router;
