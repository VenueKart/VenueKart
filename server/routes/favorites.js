import { Router } from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Get user's favorite venues
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    let favorites;
    try {
      [favorites] = await pool.execute(`
        SELECT v.*, u.name as owner_name, u.mobile_number as owner_phone,
               GROUP_CONCAT(DISTINCT vi.image_url) as images,
               GROUP_CONCAT(DISTINCT vf.facility_name) as facilities
        FROM favorites f
        JOIN venues v ON f.venue_id = v.id
        LEFT JOIN users u ON v.owner_id = u.id
        LEFT JOIN venue_images vi ON v.id = vi.venue_id
        LEFT JOIN venue_facilities vf ON v.id = vf.venue_id
        WHERE f.user_id = ? AND v.status = 'active'
        GROUP BY v.id
        ORDER BY f.created_at DESC
      `, [userId]);
    } catch (tableError) {
      // If tables don't exist, return empty array
      console.log('Favorites tables not ready, returning empty array');
      return res.json([]);
    }

    const formattedFavorites = favorites.map(venue => ({
      ...venue,
      images: venue.images ? venue.images.split(',') : [],
      facilities: venue.facilities ? venue.facilities.split(',') : [],
      price: parseFloat(venue.price_per_day),
      priceMin: venue.price_min ? parseFloat(venue.price_min) : null,
      priceMax: venue.price_max ? parseFloat(venue.price_max) : null,
      isFavorite: true // Since these are from favorites table
    }));

    res.json(formattedFavorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Add venue to favorites
router.post('/:venueId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { venueId } = req.params;

    // Check if venue exists
    const [venues] = await pool.execute(
      'SELECT id FROM venues WHERE id = ? AND status = "active"',
      [venueId]
    );

    if (venues.length === 0) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    // Add to favorites (ON DUPLICATE KEY UPDATE handles if already exists)
    await pool.execute(`
      INSERT INTO favorites (user_id, venue_id) 
      VALUES (?, ?) 
      ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP
    `, [userId, venueId]);

    res.json({ message: 'Venue added to favorites', isFavorite: true });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ error: 'Failed to add to favorites' });
  }
});

// Remove venue from favorites
router.delete('/:venueId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { venueId } = req.params;

    await pool.execute(
      'DELETE FROM favorites WHERE user_id = ? AND venue_id = ?',
      [userId, venueId]
    );

    res.json({ message: 'Venue removed from favorites', isFavorite: false });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
});

// Check if venue is favorite
router.get('/check/:venueId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { venueId } = req.params;

    const [favorites] = await pool.execute(
      'SELECT id FROM favorites WHERE user_id = ? AND venue_id = ?',
      [userId, venueId]
    );

    res.json({ isFavorite: favorites.length > 0 });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    res.status(500).json({ error: 'Failed to check favorite status' });
  }
});

// Get favorite venue IDs for user (lightweight endpoint)
router.get('/ids', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    let favorites;
    try {
      [favorites] = await pool.execute(
        'SELECT venue_id FROM favorites WHERE user_id = ?',
        [userId]
      );
    } catch (tableError) {
      // If favorites table doesn't exist, return empty array
      console.log('Favorites table not ready, returning empty array');
      return res.json([]);
    }

    const favoriteIds = favorites.map(f => f.venue_id);
    res.json(favoriteIds);
  } catch (error) {
    console.error('Error fetching favorite IDs:', error);
    res.status(500).json({ error: 'Failed to fetch favorite IDs' });
  }
});

export default router;
