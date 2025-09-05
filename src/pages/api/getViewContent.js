import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { file } = req.query;

    if (!file) {
        return res.status(400).json({ error: 'File parameter is required' });
    }

    try {
        // 构建文件路径
        const filePath = path.join(process.cwd(), 'output', file);
        
        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        // 读取文件内容
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        // 解析JSON
        const jsonData = JSON.parse(fileContent);
        
        // 返回数据
        res.status(200).json(jsonData);
    } catch (error) {
        console.error('Error reading file:', error);
        res.status(500).json({ error: 'Failed to read file' });
    }
}
