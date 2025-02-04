import mysql from 'mysql2/promise';

// 创建连接池，配置数据库连接信息
export const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '20252025',
  database: 'file',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
