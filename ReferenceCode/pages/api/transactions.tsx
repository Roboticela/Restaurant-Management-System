import { NextApiRequest, NextApiResponse } from 'next';
import { initializeDatabase } from '../../utils/database';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let db = null;

  try {
    db = await initializeDatabase();

    if (req.method === 'GET') {
      const sales = await db.all(`
        SELECT 
          s.id,
          s.total_amount,
          s.currency,
          s.date,
          json_group_array(
            json_object(
              'name', si.product_name,
              'price', si.price,
              'quantity', si.quantity,
              'unit', si.unit,
              'subtotal', (si.price * si.quantity)
            )
          ) as items
        FROM sales s
        LEFT JOIN sale_items si ON s.id = si.sale_id
        GROUP BY s.id
        ORDER BY s.date DESC
      `);

      const formattedSales = sales.map(sale => ({
        ...sale,
        items: JSON.parse(sale.items || '[]'),
        date: new Date(sale.date).toISOString().split('T')[0],
        time: new Date(sale.date).toLocaleTimeString()
      }));

      res.status(200).json(formattedSales);
      return;
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await db.run('DELETE FROM sale_items WHERE sale_id = ?', [id]);
      await db.run('DELETE FROM sales WHERE id = ?', [id]);
      res.status(200).json({ message: 'Transaction deleted successfully' });
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