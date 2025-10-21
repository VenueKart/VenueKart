import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  venue_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customer_name: { type: String, required: true },
  customer_email: { type: String, required: true },
  customer_phone: { type: String },
  event_date: { type: Date, required: true },
  event_type: { type: String },
  guest_count: { type: Number, required: true },
  amount: { type: Number, required: true },
  payment_amount: { type: Number },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  payment_status: { type: String, enum: ['not_required', 'pending', 'completed', 'failed'], default: 'not_required' },
  razorpay_order_id: { type: String },
  razorpay_payment_id: { type: String },
  payment_completed_at: { type: Date },
  payment_error_description: { type: String },
  special_requirements: { type: String },
  booking_date: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

BookingSchema.virtual('id').get(function () { return this._id.toString(); });
BookingSchema.set('toJSON', { virtuals: true });
BookingSchema.set('toObject', { virtuals: true });

const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
export default Booking;
