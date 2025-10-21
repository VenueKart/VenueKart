import mongoose from 'mongoose';

const FavoriteSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  venue_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

FavoriteSchema.index({ user_id: 1, venue_id: 1 }, { unique: true });

const Favorite = mongoose.models.Favorite || mongoose.model('Favorite', FavoriteSchema);
export default Favorite;
