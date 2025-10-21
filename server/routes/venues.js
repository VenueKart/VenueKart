import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Venue from '../models/Venue.js';
import Booking from '../models/Booking.js';

const router = Router();

// Get filter options based on uploaded venue data (public)
router.get('/filter-options', async (_req, res) => {
  try {
    const [typesAgg, locationsAgg, priceAgg, capacityAgg] = await Promise.all([
      Venue.aggregate([{ $match: { status: 'active', type: { $exists: true, $ne: '' } } }, { $group: { _id: '$type' } }, { $sort: { _id: 1 } }]),
      Venue.aggregate([{ $match: { status: 'active', location: { $exists: true, $ne: '' } } }, { $group: { _id: '$location' } }, { $sort: { _id: 1 } }]),
      Venue.aggregate([
        { $match: { status: 'active' } },
        { $project: { price: { $ifNull: ['$price_min', '$price_per_day'] }, priceMax: { $ifNull: ['$price_max', '$price_per_day'] } } },
        { $group: { _id: null, min_price: { $min: '$price' }, max_price: { $max: '$priceMax' } } }
      ]),
      Venue.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: null, min_capacity: { $min: '$capacity' }, max_capacity: { $max: '$capacity' } } }
      ])
    ]);

    const filterOptions = {
      venueTypes: typesAgg.map(t => t._id).filter(Boolean),
      locations: locationsAgg.map(l => l._id).filter(Boolean),
      priceRange: {
        min: priceAgg[0]?.min_price ?? 0,
        max: priceAgg[0]?.max_price ?? 500000,
      },
      capacityRange: {
        min: capacityAgg[0]?.min_capacity ?? 0,
        max: capacityAgg[0]?.max_capacity ?? 5000,
      }
    };

    res.json(filterOptions);
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ error: 'Failed to fetch filter options' });
  }
});

// Get all venues (public)
router.get('/', async (req, res) => {
  try {
    const { location, search, type, limit = 20, offset, page } = req.query;
    const limitInt = parseInt(limit);
    const offsetInt = page ? (parseInt(page) - 1) * limitInt : parseInt(offset || '0');

    const filters = { status: 'active' };
    if (location && location.trim()) filters.location = { $regex: new RegExp(location, 'i') };
    if (type && type.trim()) filters.type = { $regex: new RegExp(type, 'i') };
    if (search && search.trim()) {
      filters.$or = [
        { name: { $regex: new RegExp(search, 'i') } },
        { description: { $regex: new RegExp(search, 'i') } }
      ];
    }

    const [totalCount, venues] = await Promise.all([
      Venue.countDocuments(filters),
      Venue.find(filters)
        .sort({ created_at: -1, _id: -1 })
        .skip(offsetInt)
        .limit(limitInt)
        .lean()
    ]);

    const formattedVenues = venues.map(v => ({
      ...v,
      images: (v.images || []).map(i => i.url),
      facilities: v.facilities || [],
      price: v.price_per_day,
      priceMin: v.price_min ?? null,
      priceMax: v.price_max ?? null,
    }));

    const currentPage = page ? parseInt(page) : (Math.floor(offsetInt / limitInt) + 1);
    const totalPages = Math.ceil(totalCount / limitInt);

    res.json({
      venues: formattedVenues,
      pagination: {
        currentPage,
        totalPages,
        totalCount,
        limit: limitInt,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1
      }
    });
  } catch (error) {
    console.error('Error fetching venues:', error);
    res.status(500).json({ error: 'Failed to fetch venues' });
  }
});

// Get venue by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const venue = await Venue.findById(id).lean();
    if (!venue || venue.status !== 'active') return res.status(404).json({ error: 'Venue not found' });

    res.json({
      ...venue,
      price: venue.price_per_day,
      priceMin: venue.price_min ?? null,
      priceMax: venue.price_max ?? null,
      images: (venue.images || []).map(i => i.url),
      facilities: venue.facilities || []
    });
  } catch (error) {
    console.error('Error fetching venue:', error);
    res.status(500).json({ error: 'Failed to fetch venue' });
  }
});

// Get venues by owner (protected)
router.get('/owner/my-venues', authenticateToken, async (req, res) => {
  try {
    const ownerId = req.user.id;
    const venues = await Venue.find({ owner_id: ownerId }).sort({ created_at: -1 }).lean();
    const formatted = venues.map(v => ({
      ...v,
      images: (v.images || []).map(i => i.url),
      facilities: v.facilities || [],
      price: v.price_per_day,
      priceMin: v.price_min ?? null,
      priceMax: v.price_max ?? null,
      total_revenue: 0
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching owner venues:', error);
    res.status(500).json({ error: 'Failed to fetch venues' });
  }
});

// Create new venue (protected)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { venueName, description, location, footfall, price, priceMin, priceMax, images, facilities, venueType } = req.body;

    let finalPriceMin, finalPriceMax;
    if (price !== undefined) {
      finalPriceMin = parseInt(price);
      finalPriceMax = parseInt(price);
    } else if (priceMin !== undefined && priceMax !== undefined) {
      finalPriceMin = parseInt(priceMin);
      finalPriceMax = parseInt(priceMax);
    } else {
      return res.status(400).json({ error: 'Required fields: venueName, description, location, footfall, price (or priceMin/priceMax)' });
    }

    if (!venueName || !description || !location || !footfall) {
      return res.status(400).json({ error: 'Required fields: venueName, description, location, footfall, price' });
    }
    if (parseInt(footfall) <= 0) return res.status(400).json({ error: 'Footfall capacity must be greater than 0' });
    if (finalPriceMin <= 0 || finalPriceMax <= 0) return res.status(400).json({ error: 'Price must be greater than 0' });
    if (finalPriceMin > finalPriceMax) return res.status(400).json({ error: 'Maximum price must be greater than or equal to minimum price' });

    const averagePrice = Math.round((finalPriceMin + finalPriceMax) / 2);
    const venueTypeValue = venueType && venueType.trim() ? venueType : 'Venue';

    const doc = await Venue.create({
      owner_id: ownerId,
      name: venueName,
      description,
      type: venueTypeValue,
      location,
      capacity: parseInt(footfall),
      price_per_day: averagePrice,
      price_min: finalPriceMin,
      price_max: finalPriceMax,
      images: Array.isArray(images) ? images.filter(Boolean).map((url, i) => ({ url, is_primary: i === 0 })) : [],
      facilities: Array.isArray(facilities) ? facilities.filter(f => f && f.trim()) : []
    });

    res.status(201).json({ message: 'Venue created successfully', venueId: doc._id.toString() });
  } catch (error) {
    console.error('Error creating venue:', error);
    res.status(500).json({ error: 'Failed to create venue' });
  }
});

// Update venue (protected)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;
    const { venueName, description, location, footfall, price, priceMin, priceMax, images, facilities, venueType } = req.body;

    const venue = await Venue.findOne({ _id: id, owner_id: ownerId });
    if (!venue) return res.status(404).json({ error: 'Venue not found or access denied' });

    let finalPriceMin = null, finalPriceMax = null, averagePrice = null;
    if (price !== undefined) {
      finalPriceMin = parseInt(price);
      finalPriceMax = parseInt(price);
      averagePrice = Math.round((finalPriceMin + finalPriceMax) / 2);
    } else if (priceMin !== undefined && priceMax !== undefined) {
      finalPriceMin = parseInt(priceMin);
      finalPriceMax = parseInt(priceMax);
      averagePrice = Math.round((finalPriceMin + finalPriceMax) / 2);
    }

    venue.name = venueName;
    venue.description = description;
    venue.type = venueType && venueType.trim() ? venueType : venue.type;
    venue.location = location;
    venue.capacity = footfall;
    if (averagePrice !== null) venue.price_per_day = averagePrice;
    if (finalPriceMin !== null) venue.price_min = finalPriceMin;
    if (finalPriceMax !== null) venue.price_max = finalPriceMax;
    venue.images = Array.isArray(images) ? images.filter(Boolean).map((url, i) => ({ url, is_primary: i === 0 })) : venue.images;
    venue.facilities = Array.isArray(facilities) ? facilities.filter(f => f && f.trim()) : venue.facilities;

    await venue.save();
    res.json({ message: 'Venue updated successfully' });
  } catch (error) {
    console.error('Error updating venue:', error);
    res.status(500).json({ error: 'Failed to update venue' });
  }
});

// Delete venue (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;

    const venue = await Venue.findOne({ _id: id, owner_id: ownerId });
    if (!venue) return res.status(404).json({ error: 'Venue not found or access denied' });

    await Venue.deleteOne({ _id: id });
    res.json({ message: 'Venue deleted successfully' });
  } catch (error) {
    console.error('Error deleting venue:', error);
    res.status(500).json({ error: 'Failed to delete venue' });
  }
});

// Get owner dashboard statistics (protected)
router.get('/owner/dashboard-stats', authenticateToken, async (req, res) => {
  try {
    const ownerId = req.user.id;

    const [venueCount, activeVenues, bookingStats] = await Promise.all([
      Venue.countDocuments({ owner_id: ownerId }),
      Venue.countDocuments({ owner_id: ownerId, status: 'active' }),
      Booking.aggregate([
        { $lookup: { from: 'venues', localField: 'venue_id', foreignField: '_id', as: 'venue' } },
        { $unwind: '$venue' },
        { $match: { 'venue.owner_id': new (await import('mongoose')).default.Types.ObjectId(ownerId) } },
        { $group: {
          _id: null,
          total_bookings: { $sum: 1 },
          total_revenue: { $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, '$amount', 0] } },
          pending_bookings: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } }
        } }
      ])
    ]);

    const agg = bookingStats[0] || { total_bookings: 0, pending_bookings: 0, total_revenue: 0 };
    res.json({
      totalVenues: venueCount,
      activeVenues,
      totalBookings: agg.total_bookings,
      pendingBookings: agg.pending_bookings,
      totalRevenue: agg.total_revenue
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

export default router;
