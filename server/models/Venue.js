import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  is_primary: { type: Boolean, default: false }
}, { _id: false });

const VenueSchema = new mongoose.Schema({
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String },
  location: { type: String, required: true },
  capacity: { type: Number, required: true },
  price_per_day: { type: Number, required: true },
  price_min: { type: Number },
  price_max: { type: Number },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  rating: { type: Number, default: 0 },
  total_bookings: { type: Number, default: 0 },
  images: { type: [ImageSchema], default: [] },
  facilities: { type: [String], default: [] }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

VenueSchema.virtual('id').get(function () { return this._id.toString(); });
VenueSchema.set('toJSON', { virtuals: true });
VenueSchema.set('toObject', { virtuals: true });

const Venue = mongoose.models.Venue || mongoose.model('Venue', VenueSchema);
export default Venue;
