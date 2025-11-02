import { NextApiRequest, NextApiResponse } from 'next';
import { initializeDatabase } from '../../utils/database';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let db;
  try {
    db = await initializeDatabase();

    if (req.method === 'GET' && !req.query.action) {
      const settings = await db.get('SELECT * FROM settings WHERE id = 1');
      if (settings?.logo) {
        settings.logo = `data:image/png;base64,${settings.logo}`;
      }
      res.status(200).json(settings || {});
      return;
    }

    if (req.method === 'GET' && req.query.action === 'export') {
      const dbPath = path.join(process.cwd(), 'restaurant.db');
      const database = fs.readFileSync(dbPath).toString('base64');
      res.status(200).json({ database });
      return;
    }

    if (req.method === 'POST') {
      const data = req.body;
      
      try {
        await db.run(`
          INSERT OR REPLACE INTO settings (
            id, restaurantName, address, phone, email, 
            taxRate, currency, openingTime, closingTime, receiptFooter, logo
          ) VALUES (
            1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
          )
        `, [
          data.restaurantName,
          data.address,
          data.phone,
          data.email,
          data.taxRate,
          data.currency,
          data.openingTime,
          data.closingTime,
          data.receiptFooter,
          data.logo
        ]);

        res.status(200).json({ message: 'Settings saved successfully' });
      } catch (error: unknown) {
        console.error('Database operation error:', error);
        res.status(500).json({ 
          message: 'Failed to save settings',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        return;
      }
      return;
    }

    if (req.method === 'PUT' && req.query.action === 'import') {
      const { database } = req.body;
      const dbPath = path.join(process.cwd(), 'restaurant.db');
      
      const backupPath = path.join(process.cwd(), `restaurant_backup_${Date.now()}.db`);
      fs.copyFileSync(dbPath, backupPath);

      try {
        fs.writeFileSync(dbPath, Buffer.from(database, 'base64'));
        res.status(200).json({ message: 'Database imported successfully' });
      } catch (error) {
        fs.copyFileSync(backupPath, dbPath);
        throw error;
      } finally {
        fs.unlinkSync(backupPath);
      }
      return;
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    if (db) {
      await db.close();
    }
  }
} 