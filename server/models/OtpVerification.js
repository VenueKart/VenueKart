import mongoose from 'mongoose';

const OtpVerificationSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  expires_at: { type: Date, required: true },
  pending_data: { type: String }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const OtpVerification = mongoose.models.OtpVerification || mongoose.model('OtpVerification', OtpVerificationSchema);
export default OtpVerification;
