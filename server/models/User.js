import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  google_id: { type: String, index: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password_hash: { type: String },
  profile_picture: { type: String },
  mobile_number: { type: String },
  business_name: { type: String },
  location: { type: String },
  user_type: { type: String, enum: ['customer', 'venue-owner'], default: 'customer' },
  is_verified: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

UserSchema.virtual('id').get(function () { return this._id.toString(); });
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
