import { getRandomResources } from '../../lib/db-helpers';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const products = await getRandomResources(3);

    // 确保 products 是数组
    if (!Array.isArray(products)) {
      console.error('Database query did not return an array:', products);
      return res.status(500).json({ message: 'Database query error' });
    }

    // 处理返回的数据
    const formattedProducts = products.map(product => ({
      ...product,
      // 确保chapter字段存在，如果为null则设为'All'
      chapter: product.chapter || 'All'
    }));

    res.status(200).json(formattedProducts);
  } catch (error) {
    console.error('Error fetching random products:', error);
    
    // 根据错误类型返回不同的状态码
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      res.status(503).json({ message: 'Database connection failed' });
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      res.status(503).json({ message: 'Database access denied' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
} 