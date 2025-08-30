import pool from './database.js';

// Update existing bookings table to add payment columns
export async function addPaymentColumns() {
  try {
    console.log('Adding payment columns to bookings table...');

    // Add payment_status column
    await pool.execute(`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS payment_status ENUM('not_required', 'pending', 'completed', 'failed') DEFAULT 'not_required'
    `).catch(err => {
      if (!err.message.includes('Duplicate column name')) {
        throw err;
      }
    });

    // Add razorpay_order_id column
    await pool.execute(`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255)
    `).catch(err => {
      if (!err.message.includes('Duplicate column name')) {
        throw err;
      }
    });

    // Add razorpay_payment_id column
    await pool.execute(`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255)
    `).catch(err => {
      if (!err.message.includes('Duplicate column name')) {
        throw err;
      }
    });

    // Add payment_completed_at column
    await pool.execute(`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS payment_completed_at TIMESTAMP NULL
    `).catch(err => {
      if (!err.message.includes('Duplicate column name')) {
        throw err;
      }
    });

    // Add payment_error_description column
    await pool.execute(`
      ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS payment_error_description TEXT
    `).catch(err => {
      if (!err.message.includes('Duplicate column name')) {
        throw err;
      }
    });

    // Add payment_amount column (actual amount customer pays)
    await pool.execute(`
      ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2) DEFAULT NULL
    `).catch(err => {
      if (!err.message.includes('Duplicate column name')) {
        throw err;
      }
    });

    // For existing records without payment_amount, calculate it from venue base price
    // This will be updated properly when bookings are created with the new logic
    await pool.execute(`
      UPDATE bookings b
      JOIN venues v ON b.venue_id = v.id
      SET b.payment_amount = v.price_per_day
      WHERE b.payment_amount IS NULL
    `).catch(err => {
      console.log('Note: Could not update existing payment_amount values:', err.message);
    });

    // Add indexes if they don't exist
    await pool.execute(`
      ALTER TABLE bookings 
      ADD INDEX IF NOT EXISTS idx_payment_status (payment_status)
    `).catch(err => {
      if (!err.message.includes('Duplicate key name')) {
        throw err;
      }
    });

    await pool.execute(`
      ALTER TABLE bookings 
      ADD INDEX IF NOT EXISTS idx_razorpay_order (razorpay_order_id)
    `).catch(err => {
      if (!err.message.includes('Duplicate key name')) {
        throw err;
      }
    });

    console.log('Payment columns added successfully to bookings table');
  } catch (error) {
    console.error('Error adding payment columns:', error);
  }
}
