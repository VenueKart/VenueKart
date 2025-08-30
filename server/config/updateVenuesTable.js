import pool from './database.js';

export async function addVenueTypeColumn() {
  try {
    console.log('Adding venue type column to venues table...');
    
    // Check if type column already exists
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'venues' 
      AND COLUMN_NAME = 'type'
    `);
    
    if (columns.length === 0) {
      // Add the type column
      await pool.execute(`
        ALTER TABLE venues 
        ADD COLUMN type VARCHAR(100) DEFAULT 'Venue' AFTER description
      `);
      
      console.log('Successfully added type column to venues table');
      
      // Update existing venues with default types based on name/description
      await pool.execute(`
        UPDATE venues 
        SET type = CASE 
          WHEN LOWER(name) LIKE '%banquet%' OR LOWER(description) LIKE '%banquet%' THEN 'Banquet halls'
          WHEN LOWER(name) LIKE '%hotel%' OR LOWER(name) LIKE '%resort%' OR LOWER(description) LIKE '%hotel%' OR LOWER(description) LIKE '%resort%' THEN 'Hotels & resorts'
          WHEN LOWER(name) LIKE '%lawn%' OR LOWER(name) LIKE '%garden%' OR LOWER(description) LIKE '%lawn%' OR LOWER(description) LIKE '%garden%' THEN 'Lawns/gardens'
          WHEN LOWER(name) LIKE '%farmhouse%' OR LOWER(description) LIKE '%farmhouse%' THEN 'Farmhouses'
          WHEN LOWER(name) LIKE '%restaurant%' OR LOWER(name) LIKE '%cafe%' OR LOWER(description) LIKE '%restaurant%' OR LOWER(description) LIKE '%cafe%' THEN 'Restaurants & cafes'
          WHEN LOWER(name) LIKE '%lounge%' OR LOWER(name) LIKE '%rooftop%' OR LOWER(description) LIKE '%lounge%' OR LOWER(description) LIKE '%rooftop%' THEN 'Lounges & rooftops'
          WHEN LOWER(name) LIKE '%stadium%' OR LOWER(name) LIKE '%arena%' OR LOWER(description) LIKE '%stadium%' OR LOWER(description) LIKE '%arena%' THEN 'Stadiums & arenas'
          WHEN LOWER(name) LIKE '%ground%' OR LOWER(description) LIKE '%ground%' THEN 'Open grounds'
          WHEN LOWER(name) LIKE '%auditorium%' OR LOWER(description) LIKE '%auditorium%' THEN 'Auditoriums'
          ELSE 'Venue'
        END 
        WHERE type = 'Venue' OR type IS NULL
      `);
      
      console.log('Updated existing venues with default types');
    } else {
      console.log('Type column already exists in venues table');
    }
  } catch (error) {
    console.error('Error adding venue type column:', error);
  }
}
