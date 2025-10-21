import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Favorite from '../models/Favorite.js';
import Venue from '../models/Venue.js';
import User from '../models/User.js';

const router = Router();

// Get user's favorite venues
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const favs = await Favorite.find({ user_id: userId }).sort({ created_at: -1 }).lean();
    const venueIds = favs.map(f => f.venue_id);
    const venues = await Venue.find({ _id: { $in: venueIds }, status: 'active' }).lean();

    const venueMap = new Map(venues.map(v => [v._id.toString(), v]));
    const result = venueIds
      .map(id => venueMap.get(id.toString()))
      .filter(Boolean)
      .map(v => ({
        ...v,
        images: (v.images || []).map(i => i.url),
        facilities: v.facilities || [],
        price: v.price_per_day,
        priceMin: v.price_min ?? null,
        priceMax: v.price_max ?? null,
        isFavorite: true
      }));

    res.json(result);
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

    const venue = await Venue.findOne({ _id: venueId, status: 'active' }).lean();
    if (!venue) return res.status(404).json({ error: 'Venue not found' });

    await Favorite.updateOne({ user_id: userId, venue_id: venueId }, { $set: { user_id: userId, venue_id: venueId } }, { upsert: true });
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
    await Favorite.deleteOne({ user_id: userId, venue_id: venueId });
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
    const exists = await Favorite.exists({ user_id: userId, venue_id: venueId });
    res.json({ isFavorite: Boolean(exists) });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    res.status(500).json({ error: 'Failed to check favorite status' });
  }
});

// Get favorite venue IDs for user (lightweight endpoint)
router.get('/ids', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const favs = await Favorite.find({ user_id: userId }, { venue_id: 1 }).lean();
    res.json(favs.map(f => f.venue_id.toString()));
  } catch (error) {
    console.error('Error fetching favorite IDs:', error);
    res.status(500).json({ error: 'Failed to fetch favorite IDs' });
  }
});

export default router;
