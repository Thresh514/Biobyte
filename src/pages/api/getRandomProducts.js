import { pool } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const connection = await pool.getConnection();
    const [products] = await connection.query(
      'SELECT id, title, price, image FROM study_resources ORDER BY RAND() LIMIT 3'
    );
    connection.release();

    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching random products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 