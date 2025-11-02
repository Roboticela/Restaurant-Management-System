import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import fs from 'fs';
import path from 'path';

export async function initializeDatabase() {
  const dbPath = path.join(process.cwd(), 'restaurant.db');
  
  // Ensure the database file exists
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, '');
  }

  const dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });


  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY,
      restaurantName TEXT,
      address TEXT,
      phone TEXT,
      email TEXT,
      taxRate REAL,
      currency TEXT,
      openingTime TEXT,
      closingTime TEXT,
      receiptFooter TEXT,
      logo BLOB
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      unit TEXT NOT NULL DEFAULT 'item',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total_amount REAL NOT NULL,
      currency TEXT NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      unit TEXT NOT NULL,
      receipt_number TEXT NOT NULL,
      FOREIGN KEY (sale_id) REFERENCES sales (id)
    );

    -- Insert default settings if not exists
    INSERT OR IGNORE INTO settings (
      id, 
      restaurantName, 
      currency, 
      receiptFooter
    ) VALUES (
      1, 
      'Restaurant Management System',
      'PKR',
      'Thank you for your business!'
    );
  `);

  return dbInstance;
}
