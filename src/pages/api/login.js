import bcrypt from 'bcryptjs';
import { pool } from '../../lib/db'; // 引入数据库连接池

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    // 查询数据库，查找用户
    const query = 'SELECT * FROM users WHERE username = ?';
    const values = [username];

    try {
      const [rows] = await pool.query(query, values);
      
      if (rows.length === 0) {
        return res.status(400).json({ message: 'User not found' });
      }

      const user = rows[0]; // 获取第一个匹配的用户

      // 比较密码
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid password' });
      }

      // 登录成功，返回用户信息
      return res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
      console.error('Database error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // 如果是其他请求方式
  res.status(405).json({ message: 'Method Not Allowed' });
}
