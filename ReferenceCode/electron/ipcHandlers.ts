import { ipcMain } from 'electron';
import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

// Initialize database
const dbPath = path.join(app.getPath('userData'), 'restaurant.db');
const db = new Database(dbPath);

// Settings handlers
ipcMain.handle('get-settings', () => {
  const stmt = db.prepare('SELECT * FROM settings LIMIT 1');
  return stmt.get();
});

ipcMain.handle('save-settings', (_, settings) => {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO settings (
      restaurantName, address, phone, email, taxRate, 
      currency, openingTime, closingTime, receiptFooter, logo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    settings.restaurantName,
    settings.address,
    settings.phone,
    settings.email,
    settings.taxRate,
    settings.currency,
    settings.openingTime,
    settings.closingTime,
    settings.receiptFooter,
    settings.logo
  );
  
  return true;
});

// Products handlers
ipcMain.handle('get-products', () => {
  const stmt = db.prepare('SELECT * FROM products ORDER BY name');
  return stmt.all();
});

ipcMain.handle('add-product', (_, product) => {
  const stmt = db.prepare(`
    INSERT INTO products (name, price, category, unit) 
    VALUES (?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    product.name,
    product.price,
    product.category,
    product.unit
  );
  
  return result.lastInsertRowid;
});

// Add other database handlers as needed...

export const setupDatabaseHandlers = () => {
  // Initialize tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY,
      restaurantName TEXT,
      address TEXT,
      phone TEXT,
      email TEXT,
      taxRate TEXT,
      currency TEXT,
      openingTime TEXT,
      closingTime TEXT,
      receiptFooter TEXT,
      logo TEXT
    );
    
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT,
      unit TEXT
    );
  `);
}; 