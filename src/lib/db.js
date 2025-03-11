import mysql from 'mysql2/promise';

// 创建连接池，配置数据库连接信息
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000, // 设置连接超时为10秒
  acquireTimeout: 10000, // 设置获取连接的超时为10秒
  queueLimit: 10
});