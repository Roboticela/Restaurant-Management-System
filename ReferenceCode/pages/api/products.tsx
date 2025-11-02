import { NextApiRequest, NextApiResponse } from 'next';
import { initializeDatabase } from '../../utils/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let db = null;

  try {
    db = await initializeDatabase();

    if (req.method === 'GET') {
      const products = await db.all('SELECT * FROM products ORDER BY id DESC');
      res.status(200).json(products);
      return;
    }

    if (req.method === 'POST') {
      const { name, price, unit } = req.body;
      const result = await db.run(
        'INSERT INTO products (name, price, unit) VALUES (?, ?, ?)',
        [name, price, unit]
      );

      const newProduct = await db.get(
        'SELECT * FROM products WHERE id = ?',
        result.lastID
      );
      res.status(200).json(newProduct);
      return;
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await db.run('DELETE FROM products WHERE id = ?', [id]);
      res.status(200).json({ message: 'Product deleted successfully' });
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