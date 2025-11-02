import { NextApiRequest, NextApiResponse } from 'next';
import { initializeDatabase } from '../../utils/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let db = null;

  try {
    db = await initializeDatabase();

    if (req.method === 'POST') {
      const { products, totalAmount, currency } = req.body;
      
      const result = await db.run(
        'INSERT INTO sales (total_amount, currency, date) VALUES (?, ?, CURRENT_TIMESTAMP)',
        [totalAmount, currency]
      );
      
      const saleId = result.lastID;
      
      for (const item of products) {
        await db.run(
          'INSERT INTO sale_items (sale_id, product_name, price, quantity, unit, receipt_number) VALUES (?, ?, ?, ?, ?, ?)',
          [saleId, item.name, item.price, item.quantity, item.unit || 'item', item.receiptNumber]
        );

      }

      res.status(200).json({ id: saleId });
      return;
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error: unknown) {
    console.error('API Error:', error);
    const err = error as Error;
    res.status(500).json({ 
      message: 'Internal server error',
      error: err.message 
    });
  } finally {
    try {
      if (db) {
        await db.close();
      }
    } catch (error) {
      console.error('Error closing database:', error);
    }
  }

} 