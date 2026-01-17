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
        // Syllabus Analysis 文件从 public/syllabus_analysis/ 目录读取
        const filePath = path.join(process.cwd(), 'public', 'syllabus_analysis', file);
        
        // 如果文件不存在，尝试从旧路径读取（向后兼容）
        let fileContent;
        if (fs.existsSync(filePath)) {
            fileContent = fs.readFileSync(filePath, 'utf8');
        } else {
            // 向后兼容：尝试从 output/ 目录读取
            const fallbackPath = path.join(process.cwd(), 'output', file);
            if (fs.existsSync(fallbackPath)) {
                fileContent = fs.readFileSync(fallbackPath, 'utf8');
            } else {
                console.error(`File not found: ${filePath}`);
                return res.status(404).json({ error: 'File not found' });
            }
        }

        // 解析JSON
        const jsonData = JSON.parse(fileContent);
        
        // 返回数据
        res.status(200).json(jsonData);
    } catch (error) {
        console.error('Error reading file:', error);
        res.status(500).json({ error: 'Failed to read file' });
    }
}
