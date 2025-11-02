import { NextApiRequest, NextApiResponse } from 'next';
import { initializeDatabase } from '../../utils/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let db = null;

  try {

    db = await initializeDatabase();

    if (req.method === 'GET') {
      const dailyRevenue = await db.all(`
        SELECT 
          DATE(date) as date,
          SUM(total_amount) as revenue,
          COUNT(DISTINCT id) as orders
        FROM sales
        WHERE date >= date('now', '-7 days')
        GROUP BY DATE(date)
        ORDER BY date ASC
      `);

      const topProducts = await db.all(`
        SELECT 
          product_name as name,
          SUM(quantity) as sales,
          SUM(price * quantity) as revenue
        FROM sale_items
        GROUP BY product_name
        ORDER BY sales DESC
        LIMIT 5
      `);

      const productDistribution = await db.all(`
        SELECT 
          product_name as name,
          SUM(quantity) as value
        FROM sale_items
        GROUP BY product_name
        ORDER BY value DESC
      `);

      const summary = await db.get(`
        SELECT 
          COUNT(DISTINCT s.id) as totalOrders,
          SUM(s.total_amount) as totalRevenue,
          AVG(s.total_amount) as averageOrderValue
        FROM sales s
      `);

      res.status(200).json({
        dailyRevenue,
        topProducts,
        productDistribution,
        summary
      });
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
    try {
      if (db) {
        await db.close();
      }
    } catch (error) {
      console.error('Error closing database:', error);
    }

  }
} 