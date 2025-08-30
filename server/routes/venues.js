import { Router } from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Get filter options based on uploaded venue data (public)
router.get('/filter-options', async (req, res) => {
  try {
    console.log('Fetching filter options from uploaded venues...');

    // Get unique venue types
    const [venueTypes] = await pool.execute(`
      SELECT DISTINCT type
      FROM venues
      WHERE status = 'active' AND type IS NOT NULL AND type != ''
      ORDER BY type
    `);

    // Get unique locations (case-insensitive)
    const [locations] = await pool.execute(`
      SELECT DISTINCT location
      FROM venues
      WHERE status = 'active' AND location IS NOT NULL AND location != ''
      ORDER BY location
    `);

    // Get price range
    const [priceRange] = await pool.execute(`
      SELECT
        MIN(COALESCE(price_min, price_per_day)) as min_price,
        MAX(COALESCE(price_max, price_per_day)) as max_price
      FROM venues
      WHERE status = 'active'
    `);

    // Get capacity range
    const [capacityRange] = await pool.execute(`
      SELECT
        MIN(capacity) as min_capacity,
        MAX(capacity) as max_capacity
      FROM venues
      WHERE status = 'active'
    `);

    const filterOptions = {
      venueTypes: venueTypes.map(row => row.type).filter(type => type && type.trim()),
      locations: locations.map(row => row.location).filter(location => location && location.trim()),
      priceRange: {
        min: priceRange[0]?.min_price || 0,
        max: priceRange[0]?.max_price || 500000
      },
      capacityRange: {
        min: capacityRange[0]?.min_capacity || 0,
        max: capacityRange[0]?.max_capacity || 5000
      }
    };

    console.log('Filter options:', filterOptions);
    res.json(filterOptions);
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ error: 'Failed to fetch filter options' });
  }
});

// Get all venues (public)
router.get('/', async (req, res) => {
  try {
    const { location, search, type, limit = 20, offset = 0, page = 1 } = req.query;
    const limitInt = parseInt(limit);
    const offsetInt = page ? (parseInt(page) - 1) * limitInt : parseInt(offset);

    console.log('Venues API called with params:', { location, search, type, limit: limitInt, offset: offsetInt, page });

    // Build the WHERE clause conditions for both count and data queries
    let whereConditions = 'v.status = \'active\'';
    const params = [];
    const countParams = [];

    // Case-insensitive location filtering
    if (location && location.trim() !== '') {
      whereConditions += ' AND LOWER(v.location) LIKE LOWER(?)';
      params.push(`%${location}%`);
      countParams.push(`%${location}%`);
    }

    // Case-insensitive venue type filtering
    if (type && type.trim() !== '') {
      whereConditions += ' AND LOWER(v.type) LIKE LOWER(?)';
      params.push(`%${type}%`);
      countParams.push(`%${type}%`);
    }

    // General search in name and description
    if (search && search.trim() !== '') {
      whereConditions += ' AND (LOWER(v.name) LIKE LOWER(?) OR LOWER(v.description) LIKE LOWER(?))';
      params.push(`%${search}%`, `%${search}%`);
      countParams.push(`%${search}%`, `%${search}%`);
    }

    let totalCount = 0;
    let venues = [];

    try {
      // First get the total count for pagination
      const countQuery = `
        SELECT COUNT(DISTINCT v.id) as total
        FROM venues v
        LEFT JOIN users u ON v.owner_id = u.id
        WHERE ${whereConditions}
      `;

      console.log('Executing count query:', countQuery);
      console.log('With count params:', countParams);
      const [countResult] = await pool.execute(countQuery, countParams);
      totalCount = countResult[0].total;
      console.log('Total venues count:', totalCount);

      // Then get the paginated venues data
      const dataQuery = `
        SELECT v.*, u.name as owner_name, u.mobile_number as owner_phone,
               GROUP_CONCAT(DISTINCT vi.image_url) as images,
               GROUP_CONCAT(DISTINCT vf.facility_name) as facilities
        FROM venues v
        LEFT JOIN users u ON v.owner_id = u.id
        LEFT JOIN venue_images vi ON v.id = vi.venue_id
        LEFT JOIN venue_facilities vf ON v.id = vf.venue_id
        WHERE ${whereConditions}
        GROUP BY v.id
        ORDER BY v.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const dataParams = [...params, limitInt, offsetInt];
      console.log('Executing data query:', dataQuery);
      console.log('With data params:', dataParams);
      [venues] = await pool.execute(dataQuery, dataParams);
      console.log('Query returned venues count:', venues.length);

    } catch (tableError) {
      console.log('Using fallback venues query due to missing tables');

      // Fallback count query
      const fallbackCountQuery = `
        SELECT COUNT(*) as total
        FROM venues v
        LEFT JOIN users u ON v.owner_id = u.id
        WHERE ${whereConditions}
      `;

      try {
        console.log('Executing fallback count query:', fallbackCountQuery);
        const [fallbackCountResult] = await pool.execute(fallbackCountQuery, countParams);
        totalCount = fallbackCountResult[0].total;
        console.log('Fallback total count:', totalCount);
      } catch (countError) {
        console.log('Count query failed, setting total to 0:', countError.message);
        totalCount = 0;
      }

      // Fallback data query
      const fallbackDataQuery = `
        SELECT v.*, u.name as owner_name, u.mobile_number as owner_phone
        FROM venues v
        LEFT JOIN users u ON v.owner_id = u.id
        WHERE ${whereConditions}
        ORDER BY v.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const fallbackDataParams = [...params, limitInt, offsetInt];

      try {
        console.log('Executing fallback data query:', fallbackDataQuery);
        console.log('With fallback data params:', fallbackDataParams);
        [venues] = await pool.execute(fallbackDataQuery, fallbackDataParams);
        console.log('Fallback query returned venues count:', venues.length);
      } catch (fallbackError) {
        console.log('No venues table found, returning empty response. Error:', fallbackError.message);
        return res.json({
          venues: [],
          pagination: {
            currentPage: parseInt(page),
            totalPages: 0,
            totalCount: 0,
            limit: limitInt,
            hasNextPage: false,
            hasPrevPage: false
          }
        });
      }
    }

    // Format the response
    const formattedVenues = venues.map(venue => ({
      ...venue,
      images: venue.images ? venue.images.split(',') : [],
      facilities: venue.facilities ? venue.facilities.split(',') : [],
      price: parseFloat(venue.price_per_day),
      priceMin: venue.price_min ? parseFloat(venue.price_min) : null,
      priceMax: venue.price_max ? parseFloat(venue.price_max) : null
    }));

    // Calculate pagination metadata
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(totalCount / limitInt);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    const response = {
      venues: formattedVenues,
      pagination: {
        currentPage,
        totalPages,
        totalCount,
        limit: limitInt,
        hasNextPage,
        hasPrevPage
      }
    };

    console.log('Sending paginated response:', {
      venuesCount: formattedVenues.length,
      currentPage,
      totalPages,
      totalCount
    });

    res.json(response);
  } catch (error) {
    console.error('Error fetching venues:', error);
    res.status(500).json({ error: 'Failed to fetch venues' });
  }
});

// Get venue by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [venues] = await pool.execute(`
      SELECT v.*, u.name as owner_name, u.mobile_number as owner_phone, u.email as owner_email
      FROM venues v
      LEFT JOIN users u ON v.owner_id = u.id
      WHERE v.id = ? AND v.status = 'active'
    `, [id]);
    
    if (venues.length === 0) {
      return res.status(404).json({ error: 'Venue not found' });
    }
    
    const venue = venues[0];
    
    // Get images
    const [images] = await pool.execute(
      'SELECT image_url, is_primary FROM venue_images WHERE venue_id = ? ORDER BY is_primary DESC',
      [id]
    );
    
    // Get facilities
    const [facilities] = await pool.execute(
      'SELECT facility_name FROM venue_facilities WHERE venue_id = ?',
      [id]
    );
    
    res.json({
      ...venue,
      price: parseFloat(venue.price_per_day),
      priceMin: venue.price_min ? parseFloat(venue.price_min) : null,
      priceMax: venue.price_max ? parseFloat(venue.price_max) : null,
      images: images.map(img => img.image_url),
      facilities: facilities.map(f => f.facility_name)
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
    
    const [venues] = await pool.execute(`
      SELECT v.*, 
             GROUP_CONCAT(DISTINCT vi.image_url) as images,
             GROUP_CONCAT(DISTINCT vf.facility_name) as facilities,
             COUNT(DISTINCT b.id) as booking_count,
             COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.amount ELSE 0 END), 0) as total_revenue
      FROM venues v
      LEFT JOIN venue_images vi ON v.id = vi.venue_id
      LEFT JOIN venue_facilities vf ON v.id = vf.venue_id
      LEFT JOIN bookings b ON v.id = b.venue_id
      WHERE v.owner_id = ?
      GROUP BY v.id
      ORDER BY v.created_at DESC
    `, [ownerId]);
    
    const formattedVenues = venues.map(venue => ({
      ...venue,
      images: venue.images ? venue.images.split(',') : [],
      facilities: venue.facilities ? venue.facilities.split(',') : [],
      price: parseFloat(venue.price_per_day),
      priceMin: venue.price_min ? parseFloat(venue.price_min) : null,
      priceMax: venue.price_max ? parseFloat(venue.price_max) : null,
      total_revenue: parseFloat(venue.total_revenue)
    }));
    
    res.json(formattedVenues);
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

    // Handle both single price and price range formats
    let finalPriceMin, finalPriceMax;
    if (price !== undefined) {
      // Single price format
      finalPriceMin = parseInt(price);
      finalPriceMax = parseInt(price);
    } else if (priceMin !== undefined && priceMax !== undefined) {
      // Price range format
      finalPriceMin = parseInt(priceMin);
      finalPriceMax = parseInt(priceMax);
    } else {
      return res.status(400).json({ error: 'Required fields: venueName, description, location, footfall, price (or priceMin/priceMax)' });
    }

    console.log('Received venue creation request:', {
      ownerId,
      venueName,
      description,
      location,
      footfall,
      price,
      priceMin,
      priceMax,
      finalPriceMin,
      finalPriceMax,
      imageCount: Array.isArray(images) ? images.length : 0,
      facilityCount: Array.isArray(facilities) ? facilities.length : 0
    });

    // Validation
    if (!venueName || !description || !location || !footfall) {
      return res.status(400).json({ error: 'Required fields: venueName, description, location, footfall, price' });
    }

    if (parseInt(footfall) <= 0) {
      return res.status(400).json({ error: 'Footfall capacity must be greater than 0' });
    }

    if (finalPriceMin <= 0 || finalPriceMax <= 0) {
      return res.status(400).json({ error: 'Price must be greater than 0' });
    }

    if (finalPriceMin > finalPriceMax) {
      return res.status(400).json({ error: 'Maximum price must be greater than or equal to minimum price' });
    }

    // Images are optional - if provided, validate them
    const imageUrls = Array.isArray(images) ? images.filter(img => img && img.trim()) : [];

    // Facilities are optional - if provided, validate them
    const facilityList = Array.isArray(facilities) ? facilities.filter(f => f && f.trim()) : [];

    // Check database connection
    try {
      await pool.execute('SELECT 1');
    } catch (dbError) {
      console.error('Database connection failed:', dbError.message);
      return res.status(503).json({
        error: 'Database service unavailable. Please connect to a database service like Neon or set up MySQL.'
      });
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert venue with price range and type
      const averagePrice = (finalPriceMin + finalPriceMax) / 2;
      const venueTypeValue = venueType && venueType.trim() ? venueType : 'Venue';
      const [venueResult] = await connection.execute(`
        INSERT INTO venues (owner_id, name, description, type, location, capacity, price_per_day, price_min, price_max)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [ownerId, venueName, description, venueTypeValue, location, parseInt(footfall), averagePrice, finalPriceMin, finalPriceMax]);

      const venueId = venueResult.insertId;

      // Insert images if provided
      if (imageUrls.length > 0) {
        for (let i = 0; i < imageUrls.length; i++) {
          await connection.execute(`
            INSERT INTO venue_images (venue_id, image_url, is_primary)
            VALUES (?, ?, ?)
          `, [venueId, imageUrls[i], i === 0]);
        }
      }

      // Insert facilities if provided
      if (facilityList.length > 0) {
        for (const facility of facilityList) {
          await connection.execute(`
            INSERT INTO venue_facilities (venue_id, facility_name)
            VALUES (?, ?)
          `, [venueId, facility]);
        }
      }

      await connection.commit();

      console.log('Venue created successfully with ID:', venueId);
      res.status(201).json({
        message: 'Venue created successfully',
        venueId: venueId
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating venue:', error);

    // Provide specific error messages based on error type
    if (error.code === 'ECONNREFUSED' || error.code === 'ER_ACCESS_DENIED_ERROR') {
      return res.status(503).json({
        error: 'Database connection failed. Please ensure database is running and credentials are correct.'
      });
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(503).json({
        error: 'Database tables not found. Please initialize the database.'
      });
    } else {
      return res.status(500).json({
        error: `Failed to create venue: ${error.message}`
      });
    }
  }
});

// Update venue (protected)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;
    const { venueName, description, location, footfall, price, priceMin, priceMax, images, facilities, venueType } = req.body;

    // Handle both single price and price range formats
    let finalPriceMin, finalPriceMax;
    if (price !== undefined) {
      // Single price format
      finalPriceMin = parseInt(price);
      finalPriceMax = parseInt(price);
    } else if (priceMin !== undefined && priceMax !== undefined) {
      // Price range format
      finalPriceMin = parseInt(priceMin);
      finalPriceMax = parseInt(priceMax);
    } else {
      // Keep existing values if no price update is provided
      finalPriceMin = null;
      finalPriceMax = null;
    }
    
    // Check if venue belongs to the owner
    const [venues] = await pool.execute(
      'SELECT * FROM venues WHERE id = ? AND owner_id = ?',
      [id, ownerId]
    );
    
    if (venues.length === 0) {
      return res.status(404).json({ error: 'Venue not found or access denied' });
    }
    
    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Update venue
      const averagePrice = finalPriceMin && finalPriceMax ? (finalPriceMin + finalPriceMax) / 2 : null;
      const venueTypeValue = venueType && venueType.trim() ? venueType : null;
      await connection.execute(`
        UPDATE venues
        SET name = ?, description = ?, type = COALESCE(?, type), location = ?, capacity = ?, price_per_day = ?, price_min = ?, price_max = ?
        WHERE id = ?
      `, [venueName, description, venueTypeValue, location, footfall, averagePrice, finalPriceMin, finalPriceMax, id]);
      
      // Delete old images and facilities
      await connection.execute('DELETE FROM venue_images WHERE venue_id = ?', [id]);
      await connection.execute('DELETE FROM venue_facilities WHERE venue_id = ?', [id]);
      
      // Insert new images
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          await connection.execute(`
            INSERT INTO venue_images (venue_id, image_url, is_primary)
            VALUES (?, ?, ?)
          `, [id, images[i], i === 0]);
        }
      }
      
      // Insert new facilities
      if (facilities && facilities.length > 0) {
        for (const facility of facilities) {
          if (facility.trim()) {
            await connection.execute(`
              INSERT INTO venue_facilities (venue_id, facility_name)
              VALUES (?, ?)
            `, [id, facility.trim()]);
          }
        }
      }
      
      await connection.commit();
      
      res.json({ message: 'Venue updated successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
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

    // Check if venue belongs to the owner
    const [venues] = await pool.execute(
      'SELECT * FROM venues WHERE id = ? AND owner_id = ?',
      [id, ownerId]
    );

    if (venues.length === 0) {
      return res.status(404).json({ error: 'Venue not found or access denied' });
    }

    // Delete venue (cascade will handle related records)
    await pool.execute('DELETE FROM venues WHERE id = ?', [id]);

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
    
    // Get venue count
    const [venueCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM venues WHERE owner_id = ?',
      [ownerId]
    );
    
    // Get booking count and revenue
    const [bookingStats] = await pool.execute(`
      SELECT 
        COUNT(b.id) as total_bookings,
        COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.amount ELSE 0 END), 0) as total_revenue,
        COUNT(CASE WHEN b.status = 'pending' THEN 1 END) as pending_bookings
      FROM venues v
      LEFT JOIN bookings b ON v.id = b.venue_id
      WHERE v.owner_id = ?
    `, [ownerId]);
    
    // Get active venues count
    const [activeVenues] = await pool.execute(
      'SELECT COUNT(*) as count FROM venues WHERE owner_id = ? AND status = "active"',
      [ownerId]
    );
    
    res.json({
      totalVenues: venueCount[0].count,
      activeVenues: activeVenues[0].count,
      totalBookings: bookingStats[0].total_bookings,
      pendingBookings: bookingStats[0].pending_bookings,
      totalRevenue: parseFloat(bookingStats[0].total_revenue)
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

export default router;
