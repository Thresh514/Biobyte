import { getUserByEmail } from '../../lib/db-helpers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// 输入验证
const validateLoginInput = (email, password) => {
    const errors = {};
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
        errors.email = '请输入有效的邮箱地址';
    }
    
    if (!password || password.length < 8) {
        errors.password = '密码长度必须至少为8个字符';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export default async function handler(req, res) {
    console.log('🔄 登录请求开始处理', req.method);
    
    if (req.method !== 'POST') {
        return res.status(405).json({ message: '方法不允许' });
    }


    const { email, password } = req.body;
    console.log('📧 收到的邮箱:', email);

    // 验证输入
    const { isValid, errors } = validateLoginInput(email, password);
    if (!isValid) {
        console.error('❌ 输入验证失败:', errors);
        return res.status(400).json({ errors });
    }

    try {
        console.log('🔍 查询用户信息...');
        // 查询用户
        const user = await getUserByEmail(email);
        if (!user) {
            console.error('❌ 用户不存在:', email);
            return res.status(401).json({ message: '邮箱或密码错误' });
        }
        console.log('✅ 找到用户:', user.id);
        console.log('🔑 检查密码字段:', Object.keys(user));
        
        if (!user.password_hash) {
            console.error('❌ 用户密码哈希不存在');
            return res.status(401).json({ message: '账户数据错误，请联系管理员' });
        }
        
        const passwordValid = await bcrypt.compare(password, user.password_hash);
        if (!passwordValid) {
            console.error('❌ 密码验证失败');
            return res.status(401).json({ message: '邮箱或密码错误' });
        }

        console.log('✅ 密码验证成功');

        // 生成JWT令牌（包含role信息，用于middleware验证）
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 计算令牌过期时间
        const token_exp = Date.now() + 24 * 60 * 60 * 1000; // 24小时后的时间戳

        // 设置安全相关的响应头
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');

        // 将token设置为httpOnly cookie（更安全，防止XSS攻击）
        const isProduction = process.env.NODE_ENV === 'production';
        const maxAge = 24 * 60 * 60; // 24小时（秒）
        
        // 设置token cookie - 使用正确的格式
        // 注意：在开发环境中不使用Secure，SameSite使用Lax以确保正常工作
        const tokenCookieOptions = [
            `token=${token}`,
            'HttpOnly',
            'Path=/',
            `Max-Age=${maxAge}`,
            'SameSite=Lax',
            ...(isProduction ? ['Secure'] : [])
        ].join('; ');
        
        // 设置token_exp cookie（非httpOnly，前端可能需要检查过期时间）
        const tokenExpCookieOptions = [
            `token_exp=${token_exp}`,
            'Path=/',
            `Max-Age=${maxAge}`,
            'SameSite=Lax',
            ...(isProduction ? ['Secure'] : [])
        ].join('; ');
        
        // 在Next.js API路由中，使用数组设置多个cookie
        res.setHeader('Set-Cookie', [tokenCookieOptions, tokenExpCookieOptions]);
        
        console.log('✅ Cookie设置完成:', {
            tokenLength: token.length,
            tokenCookieSet: true,
            isProduction: isProduction,
            cookieOptions: tokenCookieOptions.substring(0, 100) + '...'
        });

        console.log('✅ 登录成功，token已设置为cookie');
        return res.status(200).json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('❌ 登录错误:', error);
        return res.status(500).json({ message: '服务器错误: ' + error.message });
    }
}
