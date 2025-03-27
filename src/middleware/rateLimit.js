import rateLimit from 'express-rate-limit';

// 登录尝试限制
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟窗口
    max: 5, // 限制每个IP在窗口期内最多5次尝试
    message: {
        error: '登录尝试次数过多，请15分钟后重试。'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// API请求限制
export const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1分钟窗口
    max: 100, // 限制每个IP每分钟最多100个请求
    message: {
        error: '请求过于频繁，请稍后重试。'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// 验证码错误限制
export const captchaLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1小时窗口
    max: 10, // 限制每个IP验证码错误次数
    message: {
        error: '验证码错误次数过多，请1小时后重试。'
    },
    standardHeaders: true,
    legacyHeaders: false,
}); 