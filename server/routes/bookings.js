import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Booking from '../models/Booking.js';
import Venue from '../models/Venue.js';
import User from '../models/User.js';
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

    const venueIds = await Venue.find({ owner_id: ownerId }, { _id: 1 }).lean();
    const filter = { venue_id: { $in: venueIds.map(v => v._id) } };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .sort({ created_at: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .lean();

    const withVenue = await Promise.all(bookings.map(async b => {
      const v = await Venue.findById(b.venue_id, { name: 1, location: 1 }).lean();
      return {
        ...b,
        venue_name: v?.name,
        venue_location: v?.location,
        amount: Number(b.amount),
        payment_amount: Number(b.payment_amount || b.amount)
      };
    }));

    res.json(withVenue);
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

    const bookings = await Booking.find({ customer_id: customerId })
      .sort({ created_at: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .lean();

    const withVenueOwner = await Promise.all(bookings.map(async b => {
      const v = await Venue.findById(b.venue_id, { name: 1, location: 1, owner_id: 1 }).lean();
      const u = v ? await User.findById(v.owner_id, { name: 1, mobile_number: 1 }).lean() : null;
      return {
        ...b,
        venue_name: v?.name,
        venue_location: v?.location,
        owner_name: u?.name,
        owner_phone: u?.mobile_number,
        amount: Number(b.amount),
        payment_amount: Number(b.payment_amount || b.amount)
      };
    }));

    res.json(withVenueOwner);
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
      venueId, eventDate, eventType, guestCount, amount,
      customerName, customerEmail, customerPhone, specialRequirements
    } = req.body;

    if (!venueId || !eventDate || !guestCount || !amount || !customerName || !customerEmail) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const venue = await Venue.findById(venueId).lean();
    if (!venue || venue.status !== 'active') return res.status(404).json({ error: 'Venue not found or inactive' });

    if (guestCount > venue.capacity) {
      return res.status(400).json({ error: `Guest count exceeds venue capacity (${venue.capacity})` });
    }

    const sameDate = await Booking.findOne({ venue_id: venueId, event_date: new Date(eventDate), status: 'confirmed' }).lean();
    if (sameDate) return res.status(400).json({ error: 'Venue is not available on this date' });

    const GST_RATE = 0.18;
    const payment_amount = Math.round((venue.price_per_day || amount) * (1 + GST_RATE));

    const doc = await Booking.create({
      venue_id: venueId,
      customer_id: customerId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      event_date: new Date(eventDate),
      event_type: eventType,
      guest_count: guestCount,
      amount: amount,
      payment_amount,
      special_requirements: specialRequirements
    });

    res.status(201).json({ message: 'Booking created successfully', bookingId: doc._id.toString() });
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

    const booking = await Booking.findById(id).lean();
    if (!booking) return res.status(404).json({ error: 'Booking not found or access denied' });

    const venue = await Venue.findById(booking.venue_id).lean();
    if (!venue || venue.owner_id.toString() !== ownerId) {
      return res.status(404).json({ error: 'Booking not found or access denied' });
    }

    const previousStatus = booking.status;
    let paymentStatus = 'not_required';
    if (status === 'confirmed') paymentStatus = 'pending';

    await Booking.updateOne({ _id: id }, { $set: { status, payment_status: paymentStatus } });

    if (status === 'confirmed') {
      await Venue.updateOne({ _id: booking.venue_id }, { $inc: { total_bookings: 1 } });
    }

    if (previousStatus === 'pending' && (status === 'confirmed' || status === 'cancelled')) {
      const owner = await User.findById(venue.owner_id, { name: 1, email: 1, mobile_number: 1 }).lean();

      const baseInquiryData = {
        venue: { id: venue._id.toString(), name: venue.name, location: venue.location, price: booking.amount },
        event: { date: booking.event_date, type: booking.event_type, guestCount: booking.guest_count, specialRequests: booking.special_requirements || 'None' },
        owner: { name: owner?.name || 'Venue Owner', email: owner?.email || 'Not provided', phone: owner?.mobile_number || 'Not provided' }
      };

      if (status === 'confirmed') {
        try {
          const adminInquiryData = { ...baseInquiryData, customer: { name: booking.customer_name, email: booking.customer_email, phone: booking.customer_phone } };
          await sendInquiryAcceptedToAdmin(adminInquiryData);
          const customerInquiryData = { ...baseInquiryData, customer: { name: booking.customer_name, email: booking.customer_email, phone: booking.customer_phone } };
          await sendInquiryAcceptedToCustomer(booking.customer_email, customerInquiryData);
        } catch (emailError) { console.error('Error sending inquiry acceptance emails:', emailError); }
      } else if (status === 'cancelled') {
        try {
          const adminInquiryData = { ...baseInquiryData, customer: { name: booking.customer_name, email: booking.customer_email, phone: booking.customer_phone } };
          await sendInquiryRejectedToAdmin(adminInquiryData);
          const customerInquiryData = { ...baseInquiryData, customer: { name: booking.customer_name, email: booking.customer_email, phone: booking.customer_phone } };
          await sendInquiryRejectedToCustomer(booking.customer_email, customerInquiryData);
        } catch (emailError) { console.error('Error sending inquiry rejection emails:', emailError); }
      }
    }

    res.json({ message: 'Booking status updated successfully', emailSent: previousStatus === 'pending' && (status === 'confirmed' || status === 'cancelled') });
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

    const venueIds = await Venue.find({ owner_id: ownerId }, { _id: 1 }).lean();
    const bookings = await Booking.find({ venue_id: { $in: venueIds.map(v => v._id) } })
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .lean();

    const withVenue = await Promise.all(bookings.map(async b => {
      const v = await Venue.findById(b.venue_id, { name: 1 }).lean();
      return { ...b, venue_name: v?.name, amount: Number(b.amount), payment_amount: Number(b.payment_amount || b.amount) };
    }));

    res.json(withVenue);
  } catch (error) {
    console.error('Error fetching recent bookings:', error);
    res.status(500).json({ error: 'Failed to fetch recent bookings' });
  }
});

// Get inquiry count for notifications (protected)
router.get('/owner/inquiry-count', authenticateToken, async (req, res) => {
  try {
    const ownerId = req.user.id;
    const venueIds = await Venue.find({ owner_id: ownerId }, { _id: 1 }).lean();
    const count = await Booking.countDocuments({ venue_id: { $in: venueIds.map(v => v._id) }, status: 'pending' });
    res.json({ inquiryCount: count, pendingBookings: count });
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
    const venueIds = await Venue.find({ owner_id: ownerId }, { _id: 1 }).lean();
    const inquiries = await Booking.find({ venue_id: { $in: venueIds.map(v => v._id) }, status: 'pending' })
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .lean();

    const mapped = await Promise.all(inquiries.map(async i => {
      const v = await Venue.findById(i.venue_id, { name: 1, location: 1 }).lean();
      return { ...i, venue_name: v?.name, venue_location: v?.location, amount: Number(i.amount), payment_amount: Number(i.payment_amount || i.amount) };
    }));

    res.json(mapped);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

// Send venue inquiry (protected)
router.post('/inquiry', authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { venue_id, venue_name, user_details, event_date, venue_owner } = req.body;

    if (!venue_id || !venue_name || !user_details || !event_date) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const { fullName, email, phone, eventType, guestCount } = user_details;
    if (!fullName || !email || !phone || !eventType || !guestCount) {
      return res.status(400).json({ error: 'User details incomplete' });
    }

    const venue = await Venue.findById(venue_id).lean();
    if (!venue) return res.status(404).json({ error: 'Venue not found' });

    const estimatedAmount = venue.price_per_day || venue.price_min || 50000;
    const GST_RATE = 0.18;
    const basePrice = venue.price_per_day || venue.price_min || 50000;
    const payment_amount = Math.round(basePrice * (1 + GST_RATE));

    try {
      await Booking.create({
        venue_id, customer_id: customerId,
        customer_name: fullName, customer_email: email, customer_phone: phone,
        event_date: new Date(event_date), event_type: eventType, guest_count: guestCount,
        amount: estimatedAmount, payment_amount, special_requirements: user_details.specialRequests || null,
        status: 'pending'
      });
    } catch (dbError) {
      console.error('Error creating booking record:', dbError);
    }

    // Resolve owner details from DB to ensure reliability even if client omits them
    const dbOwner = await User.findById(venue.owner_id, { name: 1, email: 1, mobile_number: 1 }).lean();
    const ownerInfo = {
      name: dbOwner?.name || venue_owner?.name || 'Venue Owner',
      email: dbOwner?.email || venue_owner?.email || null,
      phone: dbOwner?.mobile_number || venue_owner?.phone || null
    };

    const baseInquiryData = {
      venue: { id: venue_id, name: venue_name, location: venue.location || 'Location not specified', price: venue.price_per_day || venue.price || 'Price not specified' },
      event: { type: eventType, date: event_date, guestCount, specialRequests: user_details.specialRequests || 'None' },
      owner: ownerInfo
    };

    try {
      if (ownerInfo.email) {
        const venueOwnerInquiryData = { ...baseInquiryData, customer: { name: fullName } };
        await sendVenueInquiryEmail(ownerInfo.email, venueOwnerInquiryData);
      }
      const adminInquiryData = { ...baseInquiryData, customer: { name: fullName, email, phone } };
      await sendInquiryNotificationToVenueKart(adminInquiryData);
    } catch (emailError) {
      console.error('Error sending inquiry emails:', emailError);
    }

    res.status(201).json({ message: 'Inquiry sent successfully! The venue owner and our team have been notified.', inquiryId: Date.now() });
  } catch (error) {
    console.error('Error processing venue inquiry:', error);
    res.status(500).json({ error: 'Failed to process inquiry' });
  }
});

// Get customer notifications for inquiry updates
router.get('/customer/notifications', authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.id;
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const bookings = await Booking.find({ customer_id: customerId, updated_at: { $gt: since } })
      .sort({ updated_at: -1 })
      .limit(10)
      .lean();

    const withMsg = await Promise.all(bookings.map(async b => {
      const v = await Venue.findById(b.venue_id, { name: 1 }).lean();
      const message = b.status === 'confirmed' ? `Your inquiry for ${v?.name} has been accepted!` : b.status === 'cancelled' ? `Your inquiry for ${v?.name} has been declined.` : `Your inquiry for ${v?.name} is pending review.`;
      return { id: b._id.toString(), venue_id: b.venue_id.toString(), venue_name: v?.name, event_date: b.event_date, guest_count: b.guest_count, amount: b.amount, status: b.status, updated_at: b.updated_at, notification_type: 'inquiry_status', message };
    }));

    res.json(withMsg);
  } catch (error) {
    console.error('Error fetching customer notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get unread notification count for customer
router.get('/customer/notification-count', authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.id;
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const unread = await Booking.countDocuments({ customer_id: customerId, status: { $in: ['confirmed', 'cancelled'] }, updated_at: { $gt: since } });
    res.json({ unreadCount: unread });
  } catch (error) {
    console.error('Error fetching notification count:', error);
    res.status(500).json({ error: 'Failed to fetch notification count' });
  }
});

export default router;
