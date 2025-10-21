import mongoose from 'mongoose';

const RefreshTokenSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  token: { type: String, required: true, unique: true },
  expires_at: { type: Date, required: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const RefreshToken = mongoose.models.RefreshToken || mongoose.model('RefreshToken', RefreshTokenSchema);
export default RefreshToken;
