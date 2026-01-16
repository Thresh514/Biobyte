import jwt from 'jsonwebtoken';

/**
 * 从请求中获取token（优先从cookie，其次从Authorization header）
 * @param {Object} req - Next.js API请求对象
 * @returns {string|null} - token字符串或null
 */
export function getTokenFromRequest(req) {
    // 优先从cookie获取
    if (req.cookies?.token) {
        return req.cookies.token;
    }
    
    // 其次从Authorization header获取（向后兼容）
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1];
    }
    
    return null;
}

/**
 * 验证token并返回解码后的数据
 * @param {string} token - JWT token
 * @returns {Object|null} - 解码后的token数据或null
 */
export function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
}

/**
 * 从请求中获取用户信息（验证token并返回用户数据）
 * @param {Object} req - Next.js API请求对象
 * @returns {Object|null} - { id, email, role } 或 null
 */
export function getUserFromRequest(req) {
    const token = getTokenFromRequest(req);
    if (!token) {
        return null;
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
        return null;
    }
    
    return {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
    };
}