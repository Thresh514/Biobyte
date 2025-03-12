import { pool } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const connection = await pool.getConnection();
    const [products] = await connection.query(
      'SELECT id, title, price, image, type, level, chapter FROM study_resources ORDER BY RAND() LIMIT 3'
    );
    connection.release();

    // 处理返回的数据
    const formattedProducts = products.map(product => ({
      ...product,
      // 确保chapter字段存在，如果为null则设为'All'
      chapter: product.chapter || 'All'
    }));

    res.status(200).json(formattedProducts);
  } catch (error) {
    console.error('Error fetching random products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 