import { Pool } from 'pg';

// 创建 PostgreSQL 连接池
// 支持两种配置方式：
// 1. 使用 DATABASE_URL 环境变量（推荐，Neon 提供的完整连接字符串）
// 2. 使用单独的配置项（DB_HOST, DB_USER, DB_PASSWORD, DB_NAME）

export const pool = new Pool({
  // 方式1：直接使用连接字符串（推荐）
  connectionString: process.env.DATABASE_URL,
  
  // 方式2：如果 DATABASE_URL 不存在，使用单独配置
  ...(process.env.DATABASE_URL ? {} : {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  }),
  
  // 连接池配置
  max: 10, // 最大连接数
  idleTimeoutMillis: 30000, // 空闲连接超时时间（30秒）
  connectionTimeoutMillis: 10000, // 连接超时时间（10秒）
});

// 处理连接错误
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// 为了兼容 mysql2 的查询方式，包装 query 方法
// PostgreSQL 返回格式：{ rows: [...], rowCount: n }
// MySQL 返回格式：[[...], [...]]
const originalQuery = pool.query.bind(pool);
pool.query = async function(text, params) {
  const result = await originalQuery(text, params);
  // 返回格式兼容 mysql2：[rows, fields]
  // fields 在 PostgreSQL 中不太需要，返回空数组
  return [result.rows, []];
};