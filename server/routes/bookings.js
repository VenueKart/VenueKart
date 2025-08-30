import { Router } from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  sendVenueInquiryEmail,
  sendInquiryNotificationToVenueKart,
  sendBookingConfirmationEmail,
  sendBookingRejectionEmail,
  sendInquiryAcceptedToAdmin,
  sendInquiryAcceptedToCustomer,
  sendInquiryRejectedToAdmin,
  sendInquiryRejectedToCustomer
} from '../services/emailService.js';

const router = Router();

// Get bookings for venue owner (protected)
router.get('/owner', authenticateToken, async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { status, limit = 20, offset = 0 } = req.query;
    
    let query = `
      SELECT b.*, v.name as venue_name, v.location as venue_location
      FROM bookings b
      JOIN venues v ON b.venue_id = v.id
      WHERE v.owner_id = ?
    `;
    
    const params = [ownerId];
    
    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [bookings] = await pool.execute(query, params);

    const formattedBookings = bookings.map(booking => ({
      ...booking,
      amount: parseFloat(booking.amount),
      payment_amount: parseFloat(booking.payment_amount || booking.amount)
    }));

    res.json(formattedBookings);
  } catch (error) {
    console.error('Error fetching owner bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get customer bookings (protected)
router.get('/customer', authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;
    
    const [bookings] = await pool.execute(`
      SELECT b.*, v.name as venue_name, v.location as venue_location,
             u.name as owner_name, u.mobile_number as owner_phone
      FROM bookings b
      JOIN venues v ON b.venue_id = v.id
      JOIN users u ON v.owner_id = u.id
      WHERE b.customer_id = ?
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
    `, [customerId, parseInt(limit), parseInt(offset)]);

    const formattedBookings = bookings.map(booking => ({
      ...booking,
      amount: parseFloat(booking.amount),
      payment_amount: parseFloat(booking.payment_amount || booking.amount)
    }));

    res.json(formattedBookings);
  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Create new booking (protected)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { 
      venueId, 
      eventDate, 
      eventType, 
      guestCount, 
      amount,
      customerName,
      customerEmail,
      customerPhone,
      specialRequirements
    } = req.body;
    
    // Validation
    if (!venueId || !eventDate || !guestCount || !amount || !customerName || !customerEmail) {
      return res.status(400).json({ error: 'Required fields missing' });
    }
    
    // Check if venue exists and is active
    const [venues] = await pool.execute(
      'SELECT * FROM venues WHERE id = ? AND status = "active"',
      [venueId]
    );
    
    if (venues.length === 0) {
      return res.status(404).json({ error: 'Venue not found or inactive' });
    }
    
    const venue = venues[0];
    
    // Check venue capacity
    if (guestCount > venue.capacity) {
      return res.status(400).json({ 
        error: `Guest count exceeds venue capacity (${venue.capacity})` 
      });
    }
    
    // Check if date is available (no confirmed bookings on same date)
    const [existingBookings] = await pool.execute(`
      SELECT * FROM bookings 
      WHERE venue_id = ? AND event_date = ? AND status = 'confirmed'
    `, [venueId, eventDate]);
    
    if (existingBookings.length > 0) {
      return res.status(400).json({ error: 'Venue is not available on this date' });
    }
    
    // Calculate payment amount (base price + 18% GST) - customer pays base price including GST
    const GST_RATE = 0.18; // 18%
    const payment_amount = Math.round(venue.price_per_day * (1 + GST_RATE));

    // Create booking
    const [result] = await pool.execute(`
      INSERT INTO bookings (
        venue_id, customer_id, customer_name, customer_email, customer_phone,
        event_date, event_type, guest_count, amount, payment_amount, special_requirements
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      venueId, customerId, customerName, customerEmail, customerPhone,
      eventDate, eventType, guestCount, amount, payment_amount, specialRequirements
    ]);
    
    res.status(201).json({ 
      message: 'Booking created successfully',
      bookingId: result.insertId
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Update booking status (protected - venue owner only)
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const ownerId = req.user.id;

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if booking belongs to owner's venue and get full booking details
    const [bookings] = await pool.execute(`
      SELECT b.*, v.owner_id, v.name as venue_name, v.location as venue_location
      FROM bookings b
      JOIN venues v ON b.venue_id = v.id
      WHERE b.id = ? AND v.owner_id = ?
    `, [id, ownerId]);

    if (bookings.length === 0) {
      return res.status(404).json({ error: 'Booking not found or access denied' });
    }

    const booking = bookings[0];
    const previousStatus = booking.status;

    // Update booking status and payment status
    let paymentStatus = 'not_required';
    if (status === 'confirmed') {
      paymentStatus = 'pending'; // When confirmed, payment becomes required
    }

    await pool.execute(
      'UPDATE bookings SET status = ?, payment_status = ? WHERE id = ?',
      [status, paymentStatus, id]
    );

    // If confirmed, increment venue booking count
    if (status === 'confirmed') {
      await pool.execute(
        'UPDATE venues SET total_bookings = total_bookings + 1 WHERE id = ?',
        [booking.venue_id]
      );
    }

    // Send email notifications for inquiry status changes (pending -> confirmed/cancelled)
    if (previousStatus === 'pending' && (status === 'confirmed' || status === 'cancelled')) {
      // Get venue owner details for inquiry acceptance emails
      const [ownerDetails] = await pool.execute(
        'SELECT name, email, mobile_number FROM users WHERE id = (SELECT owner_id FROM venues WHERE id = ?)',
        [booking.venue_id]
      );

      const owner = ownerDetails[0] || {};

      // Prepare base inquiry data
      const baseInquiryData = {
        venue: {
          id: booking.venue_id,
          name: booking.venue_name,
          location: booking.venue_location,
          price: booking.amount // Using the booking amount as price reference
        },
        event: {
          date: booking.event_date,
          type: booking.event_type,
          guestCount: booking.guest_count,
          specialRequests: booking.special_requirements || 'None'
        },
        owner: {
          name: owner.name || 'Venue Owner',
          email: owner.email || 'Not provided',
          phone: owner.mobile_number || 'Not provided'
        }
      };

      // Send appropriate email notifications based on status
      if (status === 'confirmed') {
        // Venue owner ACCEPTED the inquiry
        try {
          // 1. Email to VenueKart Admin about acceptance (with FULL customer details)
          const adminInquiryData = {
            ...baseInquiryData,
            customer: {
              name: booking.customer_name,
              email: booking.customer_email,
              phone: booking.customer_phone
            }
          };
          await sendInquiryAcceptedToAdmin(adminInquiryData);
          console.log(`Inquiry acceptance notification sent to admin for booking ${id} (full customer details)`);

          // 2. Email to Customer about acceptance (with venue owner contact details)
          const customerInquiryData = {
            ...baseInquiryData,
            customer: {
              name: booking.customer_name,
              email: booking.customer_email,
              phone: booking.customer_phone
            }
          };
          await sendInquiryAcceptedToCustomer(booking.customer_email, customerInquiryData);
          console.log(`Inquiry acceptance email sent to ${booking.customer_email} for booking ${id}`);
        } catch (emailError) {
          console.error('Error sending inquiry acceptance emails:', emailError);
          // Don't fail the request if email fails
        }
      } else if (status === 'cancelled') {
        // Venue owner REJECTED the inquiry
        try {
          // 1. Email to VenueKart Admin about rejection (with FULL customer details)
          const adminInquiryData = {
            ...baseInquiryData,
            customer: {
              name: booking.customer_name,
              email: booking.customer_email,
              phone: booking.customer_phone
            }
          };
          await sendInquiryRejectedToAdmin(adminInquiryData);
          console.log(`Inquiry rejection notification sent to admin for booking ${id} (full customer details)`);

          // 2. Email to Customer about rejection (NO venue owner contact details - handled in template)
          const customerInquiryData = {
            ...baseInquiryData,
            customer: {
              name: booking.customer_name,
              email: booking.customer_email,
              phone: booking.customer_phone
            }
          };
          await sendInquiryRejectedToCustomer(booking.customer_email, customerInquiryData);
          console.log(`Inquiry rejection email sent to ${booking.customer_email} for booking ${id}`);
        } catch (emailError) {
          console.error('Error sending inquiry rejection emails:', emailError);
          // Don't fail the request if email fails
        }
      }
    }

    res.json({
      message: 'Booking status updated successfully',
      emailSent: previousStatus === 'pending' && (status === 'confirmed' || status === 'cancelled')
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Get recent bookings for dashboard (protected)
router.get('/owner/recent', authenticateToken, async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { limit = 5 } = req.query;

    const [bookings] = await pool.execute(`
      SELECT b.*, v.name as venue_name
      FROM bookings b
      JOIN venues v ON b.venue_id = v.id
      WHERE v.owner_id = ?
      ORDER BY b.created_at DESC
      LIMIT ?
    `, [ownerId, parseInt(limit)]);

    const formattedBookings = bookings.map(booking => ({
      ...booking,
      amount: parseFloat(booking.amount),
      payment_amount: parseFloat(booking.payment_amount || booking.amount)
    }));

    res.json(formattedBookings);
  } catch (error) {
    console.error('Error fetching recent bookings:', error);
    res.status(500).json({ error: 'Failed to fetch recent bookings' });
  }
});

// Get inquiry count for notifications (protected)
router.get('/owner/inquiry-count', authenticateToken, async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Count pending bookings as inquiries since that's what represents customer interest
    const [pendingBookings] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM bookings b
      JOIN venues v ON b.venue_id = v.id
      WHERE v.owner_id = ? AND b.status = 'pending'
    `, [ownerId]);

    res.json({
      inquiryCount: pendingBookings[0].count || 0,
      pendingBookings: pendingBookings[0].count || 0
    });
  } catch (error) {
    console.error('Error fetching inquiry count:', error);
    res.status(500).json({ error: 'Failed to fetch inquiry count' });
  }
});

// Get all inquiries/pending bookings (protected)
router.get('/owner/inquiries', authenticateToken, async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { limit = 20 } = req.query;

    const [inquiries] = await pool.execute(`
      SELECT b.*, v.name as venue_name, v.location as venue_location
      FROM bookings b
      JOIN venues v ON b.venue_id = v.id
      WHERE v.owner_id = ? AND b.status = 'pending'
      ORDER BY b.created_at DESC
      LIMIT ?
    `, [ownerId, parseInt(limit)]);

    const formattedInquiries = inquiries.map(inquiry => ({
      ...inquiry,
      amount: parseFloat(inquiry.amount),
      payment_amount: parseFloat(inquiry.payment_amount || inquiry.amount)
    }));

    res.json(formattedInquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

// Send venue inquiry (protected)
router.post('/inquiry', authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.id;
    const {
      venue_id,
      venue_name,
      user_details,
      event_date,
      venue_owner
    } = req.body;

    // Validation
    if (!venue_id || !venue_name || !user_details || !event_date) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Validate user_details structure
    const { fullName, email, phone, eventType, guestCount } = user_details;
    if (!fullName || !email || !phone || !eventType || !guestCount) {
      return res.status(400).json({ error: 'User details incomplete' });
    }

    // Check if venue exists
    const [venues] = await pool.execute(
      'SELECT * FROM venues WHERE id = ?',
      [venue_id]
    );

    if (venues.length === 0) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    const venue = venues[0];

    // Create booking record (which serves as an inquiry until accepted/rejected)
    // Calculate estimated amount based on venue price (for display)
    const estimatedAmount = venue.price_per_day || venue.price_min || 50000; // Default fallback

    // Payment amount includes base price + 18% GST (what customer actually pays)
    const GST_RATE = 0.18; // 18%
    const basePrice = venue.price_per_day || venue.price_min || 50000;
    const payment_amount = Math.round(basePrice * (1 + GST_RATE));

    try {
      const [bookingResult] = await pool.execute(`
        INSERT INTO bookings (
          venue_id, customer_id, customer_name, customer_email, customer_phone,
          event_date, event_type, guest_count, amount, payment_amount, special_requirements, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `, [
        venue_id, customerId, fullName, email, phone,
        event_date, eventType, guestCount, estimatedAmount, payment_amount, user_details.specialRequests || null
      ]);

      console.log('Booking/inquiry record created with ID:', bookingResult.insertId);
    } catch (dbError) {
      console.error('Error creating booking record:', dbError);
      // Continue with email notifications even if DB insert fails
    }

    // Prepare inquiry data for emails
    const baseInquiryData = {
      venue: {
        id: venue_id,
        name: venue_name,
        location: venue.location || 'Location not specified',
        price: venue.price_per_day || venue.price || 'Price not specified'
      },
      event: {
        type: eventType,
        date: event_date,
        guestCount: guestCount,
        specialRequests: user_details.specialRequests || 'None'
      },
      owner: venue_owner || {
        name: 'Venue Owner',
        email: 'owner@venue.com'
      }
    };

    // Send emails according to requirements
    try {
      // 1. EMAIL TO VENUE OWNER (with LIMITED customer details - NO email/phone)
      if (venue_owner && venue_owner.email) {
        const venueOwnerInquiryData = {
          ...baseInquiryData,
          customer: {
            name: fullName
            // NO email and phone for venue owner
          }
        };
        await sendVenueInquiryEmail(venue_owner.email, venueOwnerInquiryData);
        console.log(`Venue owner inquiry email sent to ${venue_owner.email} (customer contact hidden)`);
      } else {
        console.warn('Venue owner email not provided - skipping venue owner notification');
      }

      // 2. EMAIL TO VENUEKART ADMIN (with FULL customer details including email/phone)
      const adminInquiryData = {
        ...baseInquiryData,
        customer: {
          name: fullName,
          email: email,
          phone: phone
        }
      };
      await sendInquiryNotificationToVenueKart(adminInquiryData);
      console.log('VenueKart admin inquiry notification sent (full customer details included)');

    } catch (emailError) {
      console.error('Error sending inquiry emails:', emailError);
      // Don't fail the request if emails fail
    }

    res.status(201).json({
      message: 'Inquiry sent successfully! The venue owner and our team have been notified.',
      inquiryId: Date.now() // Use timestamp as fallback ID
    });
  } catch (error) {
    console.error('Error processing venue inquiry:', error);
    res.status(500).json({ error: 'Failed to process inquiry' });
  }
});

// Get customer notifications for inquiry updates
router.get('/customer/notifications', authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.id;

    // Get inquiry status updates for the customer
    const [notifications] = await pool.execute(`
      SELECT
        b.id,
        b.venue_id,
        v.name as venue_name,
        b.event_date,
        b.guest_count,
        b.amount,
        b.status,
        b.updated_at,
        'inquiry_status' as notification_type,
        CASE
          WHEN b.status = 'confirmed' THEN CONCAT('Your inquiry for ', v.name, ' has been accepted!')
          WHEN b.status = 'cancelled' THEN CONCAT('Your inquiry for ', v.name, ' has been declined.')
          ELSE CONCAT('Your inquiry for ', v.name, ' is pending review.')
        END as message
      FROM bookings b
      JOIN venues v ON b.venue_id = v.id
      WHERE b.customer_id = ?
        AND b.updated_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
      ORDER BY b.updated_at DESC
      LIMIT 10
    `, [customerId]);

    // Mark notifications as read (add a read_at timestamp if needed)
    // For now, we'll just return the notifications

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching customer notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get unread notification count for customer
router.get('/customer/notification-count', authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.id;

    // Count recent status updates (last 7 days) that user might not have seen
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as unread_count
      FROM bookings
      WHERE customer_id = ?
        AND status IN ('confirmed', 'cancelled')
        AND updated_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
    `, [customerId]);

    res.json({ unreadCount: countResult[0].unread_count });
  } catch (error) {
    console.error('Error fetching notification count:', error);
    res.status(500).json({ error: 'Failed to fetch notification count' });
  }
});

export default router;
