import jwt from 'jsonwebtoken';
import { getUserById } from '../../../lib/db-helpers';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // 从cookie中获取token
        const token = req.cookies?.token;

        if (!token) {
            return res.status(200).json({ 
                isAuthenticated: false,
                user: null 
            });
        }

        // 验证token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 获取用户信息
        const user = await getUserById(decoded.id);
        
        if (!user) {
            return res.status(200).json({ 
                isAuthenticated: false,
                user: null 
            });
        }

        return res.status(200).json({
            isAuthenticated: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name
            }
        });
    } catch (error) {
        // Token无效或过期
        return res.status(200).json({ 
            isAuthenticated: false,
            user: null 
        });
    }
}