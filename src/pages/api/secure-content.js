import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

export default function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 添加防下载的安全头
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'");

    const { file, token } = req.query;

    if (!file) {
        return res.status(400).json({ error: 'File parameter is required' });
    }

    // 验证用户令牌（可选，用于付费内容）
    let userId = null;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.id;
        } catch (error) {
            return res.status(401).json({ error: 'Invalid token' });
        }
    }

    try {
        // 构建文件路径
        const filePath = path.join(process.cwd(), 'output', file);
        
        // 安全检查：确保文件在允许的目录内
        const normalizedPath = path.normalize(filePath);
        const outputDir = path.join(process.cwd(), 'output');
        if (!normalizedPath.startsWith(outputDir)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Content not found' });
        }

        // 读取文件内容
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(fileContent);
        
        // 添加水印或标识
        const protectedContent = {
            ...jsonData,
            _metadata: {
                accessTime: new Date().toISOString(),
                userId: userId,
                watermark: "© BioByte - For online viewing only",
                terms: "This content is protected by copyright. Downloading, copying, or redistribution is prohibited."
            }
        };

        // 记录访问日志
        console.log(`Content accessed: ${file} by user: ${userId || 'anonymous'} at ${new Date().toISOString()}`);
        
        // 返回保护后的数据
        res.status(200).json(protectedContent);
    } catch (error) {
        console.error('Error reading protected content:', error);
        res.status(500).json({ error: 'Failed to load content' });
    }
}
