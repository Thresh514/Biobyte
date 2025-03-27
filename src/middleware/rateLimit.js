import { NextApiRequest, NextApiResponse } from 'next';

// 简单的内存存储，用于记录请求次数
const ipRequestCounts = new Map();

// 创建适用于 Next.js 的速率限制器
export const createRateLimiter = (options) => {
  const { windowMs, max, message } = options;

  return async (req, res) => {
    // 获取客户端 IP
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    
    // 获取当前时间
    const now = Date.now();
    
    // 清理过期的记录
    for (const [key, data] of ipRequestCounts.entries()) {
      if (now - data.startTime > windowMs) {
        ipRequestCounts.delete(key);
      }
    }
    
    // 获取或创建 IP 记录
    if (!ipRequestCounts.has(ip)) {
      ipRequestCounts.set(ip, {
        count: 0,
        startTime: now,
      });
    }
    
    const record = ipRequestCounts.get(ip);
    record.count += 1;
    
    // 检查是否超过限制
    if (record.count > max) {
      throw new Error(message.error || '请求过于频繁，请稍后重试。');
    }
  };
};

// 登录尝试限制
export const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15分钟窗口
  max: 5, // 限制每个IP在窗口期内最多5次尝试
  message: {
    error: '登录尝试次数过多，请15分钟后重试。'
  }
});

// API请求限制
export const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1分钟窗口
  max: 100, // 限制每个IP每分钟最多100个请求
  message: {
    error: '请求过于频繁，请稍后重试。'
  }
});

// 验证码错误限制
export const captchaLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1小时窗口
  max: 10, // 限制每个IP验证码错误次数
  message: {
    error: '验证码错误次数过多，请1小时后重试。'
  }
}); 