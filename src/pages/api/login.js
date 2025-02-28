import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../../lib/db'; // 引入数据库连接池

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    console.log("Received requst body:",req.body);

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
      // 查询数据库，查找用户
      const query = 'SELECT * FROM users WHERE email = ?';
      const values = [email];

      const [rows] = await pool.query(query, values);

      console.log("User lookup result:",rows);
      
      if (rows.length === 0) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      const user = rows[0]; // 获取第一个匹配的用户

      console.log("User found:", user);

      // 比较密码
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      console.log("Password validation result:", isPasswordValid);

      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // Token 1小时后过期
      );

      // 登录成功，返回用户信息
      return res.status(200).json({ message: 'Login successful', token, username: user.username });
    } catch (error) {
      console.error('Database error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // 如果是其他请求方式
  res.status(405).json({ message: 'Method Not Allowed' });
}
