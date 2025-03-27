import { loginLimiter, captchaLimiter } from '../../middleware/rateLimit';
import { pool } from '../../lib/db'; // 引入数据库连接池
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// 输入验证
const validateLoginInput = (email, password, captcha) => {
    const errors = {};
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
        errors.email = '请输入有效的邮箱地址';
    }
    
    if (!password || password.length < 8) {
        errors.password = '密码长度必须至少为8个字符';
    }
    
    if (!captcha || captcha.length !== 6) {
        errors.captcha = '请输入6位验证码';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: '方法不允许' });
    }

    // 应用速率限制中间件
    try {
        await loginLimiter(req, res);
        await captchaLimiter(req, res);
    } catch (error) {
        return res.status(429).json({ message: error.message });
    }

    const { email, password, captcha } = req.body;

    // 验证输入
    const { isValid, errors } = validateLoginInput(email, password, captcha);
    if (!isValid) {
        return res.status(400).json({ errors });
    }

    try {
        // 验证验证码
        const captchaValid = await verifyCaptcha(captcha);
        if (!captchaValid) {
            return res.status(400).json({ message: '验证码错误' });
        }

        // 查询用户
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: '邮箱或密码错误' });
        }

        const user = users[0];
        const passwordValid = await bcrypt.compare(password, user.password);
        if (!passwordValid) {
            return res.status(401).json({ message: '邮箱或密码错误' });
        }

        // 生成JWT令牌
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 设置安全相关的响应头
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');

        return res.status(200).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: '服务器错误' });
    }
}
