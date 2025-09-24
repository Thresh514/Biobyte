// 暂时注释掉高亮功能API
// import { pool } from '../../lib/db';

export default async function handler(req, res) {
    // 暂时禁用高亮API，返回404
    return res.status(404).json({ 
        success: false, 
        message: '高亮功能暂时禁用' 
    });
    
    /*
    if (req.method === 'POST') {
        try {
            const { 
                sectionId, 
                itemId, 
                userId,
                serializedData,
                timestamp 
            } = req.body;
            
            // 验证必需参数
            if (!sectionId || !itemId || !serializedData) {
                return res.status(400).json({ 
                    success: false, 
                    message: '缺少必需参数' 
                });
            }
            
            // 保存高亮数据到数据库，只存储序列化数据
            const result = await pool.query(
                `INSERT INTO highlights (
                    section_id, item_id, user_id, 
                    serialized_data, created_at
                ) VALUES (?, ?, ?, ?, ?)`,
                [
                    sectionId, 
                    itemId, 
                    userId || 1, // 默认用户ID
                    JSON.stringify(serializedData), // 存储序列化数据
                    timestamp || new Date().toISOString()
                ]
            );
            
            // 设置缓存控制头
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            
            res.status(200).json({ 
                success: true, 
                id: result.insertId,
                message: '高亮保存成功' 
            });
        } catch (error) {
            console.error('保存高亮失败:', error);
            res.status(500).json({ 
                success: false, 
                message: '保存高亮失败' 
            });
        }
    } else if (req.method === 'GET') {
        try {
            const { sectionId, itemId, userId } = req.query;
            
            let query = 'SELECT * FROM highlights WHERE 1=1';
            const params = [];
            
            if (sectionId) {
                query += ' AND section_id = ?';
                params.push(sectionId);
            }
            if (itemId) {
                query += ' AND item_id = ?';
                params.push(itemId);
            }
            if (userId) {
                query += ' AND user_id = ?';
                params.push(userId);
            }
            
            query += ' ORDER BY created_at DESC LIMIT 1'; // 获取最新的高亮数据
            
            const highlights = await pool.query(query, params);
            
            // 解析序列化数据
            const processedHighlights = highlights[0].map(highlight => ({
                id: highlight.id,
                sectionId: highlight.section_id,
                itemId: highlight.item_id,
                userId: highlight.user_id,
                serializedData: highlight.serialized_data ? (() => {
                    try {
                        return JSON.parse(highlight.serialized_data);
                    } catch (e) {
                        console.error('JSON解析错误:', e);
                        return null;
                    }
                })() : null,
                createdAt: highlight.created_at
            }));
            
            // 设置缓存控制头，防止 304 问题
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            
            res.status(200).json({ 
                success: true, 
                highlights: processedHighlights 
            });
        } catch (error) {
            console.error('获取高亮失败:', error);
            res.status(500).json({ 
                success: false, 
                message: '获取高亮失败' 
            });
        }
    } else if (req.method === 'DELETE') {
        try {
            const { id, userId } = req.body;
            
            await pool.query(
                'DELETE FROM highlights WHERE id = ? AND user_id = ?',
                [id, userId]
            );
            
            // 设置缓存控制头
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            
            res.status(200).json({ 
                success: true, 
                message: '高亮删除成功' 
            });
        } catch (error) {
            console.error('删除高亮失败:', error);
            res.status(500).json({ 
                success: false, 
                message: '删除高亮失败' 
            });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
    */
}
