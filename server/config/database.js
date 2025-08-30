import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
});

// Import update functions
import { addPaymentColumns } from './updateBookingsTable.js';
import { addVenueTypeColumn } from './updateVenuesTable.js';

// Initialize database tables
export async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');

    // Users table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        google_id VARCHAR(255) UNIQUE,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255),
        profile_picture VARCHAR(500),
        mobile_number VARCHAR(20),
        business_name VARCHAR(255),
        location VARCHAR(255),
        user_type ENUM('customer', 'venue-owner') DEFAULT 'customer',
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Venues table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS venues (
        id INT AUTO_INCREMENT PRIMARY KEY,
        owner_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        location VARCHAR(255) NOT NULL,
        capacity INT NOT NULL,
        price_per_day DECIMAL(10,2) NOT NULL,
        price_min DECIMAL(10,2),
        price_max DECIMAL(10,2),
        status ENUM('active', 'inactive') DEFAULT 'active',
        rating DECIMAL(3,2) DEFAULT 0.00,
        total_bookings INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_owner (owner_id),
        INDEX idx_location (location),
        INDEX idx_status (status)
      )
    `);

    // Venue images table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS venue_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        venue_id INT NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        is_primary BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE
      )
    `);

    // Venue facilities table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS venue_facilities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        venue_id INT NOT NULL,
        facility_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE
      )
    `);

    // Bookings table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        venue_id INT NOT NULL,
        customer_id INT NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20),
        event_date DATE NOT NULL,
        event_type VARCHAR(100),
        guest_count INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
        payment_status ENUM('not_required', 'pending', 'completed', 'failed') DEFAULT 'not_required',
        razorpay_order_id VARCHAR(255),
        razorpay_payment_id VARCHAR(255),
        payment_completed_at TIMESTAMP NULL,
        payment_error_description TEXT,
        special_requirements TEXT,
        booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_venue (venue_id),
        INDEX idx_customer (customer_id),
        INDEX idx_event_date (event_date),
        INDEX idx_status (status),
        INDEX idx_payment_status (payment_status),
        INDEX idx_razorpay_order (razorpay_order_id)
      )
    `);

    // OTP verification table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS otp_verifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        pending_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email_otp (email, otp)
      )
    `);

    // Refresh tokens table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(500) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Favorites table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        venue_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_venue (user_id, venue_id)
      )
    `);

    console.log('Database tables verified/created successfully');

    // Update existing bookings table with payment columns
    await addPaymentColumns();

    // Add venue type column to venues table
    await addVenueTypeColumn();
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

export default pool;
