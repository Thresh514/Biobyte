import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { chapter, level } = req.query;

    if (!chapter || !level) {
        return res.status(400).json({ error: 'Chapter and level parameters are required' });
    }

    try {
        const levelLower = level.toLowerCase();
        const chapterNum = chapter === 'All' ? '1' : chapter;
        
        // 根据 level 定义可用的章节映射
        const asFileNameMap = {
            '1': '1_Cell_structure.json',
            '2': '2_Biological_molecules.json',
            '3': '3_Enzymes.json',
            '4': '4_Cell_membranes_and_transport.json',
            '5': '5_The_mitotic_cell_cycle.json',
            '6': '6_Nucleic_acids_and_protein_synthesis.json',
            '7': '7_Transport_of_Plant.json',
            '8': '8_Transport_in_mammals.json',
            '9': '9_Gas_exchange.json',
            '10': '10_Infectious_diseases.json',
            '11': '11_Immunity.json',
        };
        
        const a2FileNameMap = {
            '12': '12_Energy_and_respiration.json',
            '13': '13_Photosynthesis.json',
            '14': '14_Homeostasis.json',
            '15': '15_Control_and_coordination.json',
            '16': '16_Inheritance.json',
            '17': '17_Selection_and_evolution.json',
            '18': '18_Classification_biodiversity_and_conservation.json',
            '19': '19_Genetic_technology.json',
        };
        
        // 根据 level 选择正确的文件映射
        let fileNameMap;
        if (levelLower === 'as') {
            fileNameMap = asFileNameMap;
        } else if (levelLower === 'a2') {
            fileNameMap = a2FileNameMap;
        } else {
            return res.status(400).json({ error: `Invalid level: ${level}. Must be 'as' or 'a2'` });
        }
        
        const fileName = fileNameMap[chapterNum];
        if (!fileName) {
            const validChapters = Object.keys(fileNameMap).join(', ');
            return res.status(404).json({ 
                error: `Chapter ${chapter} not found for ${level.toUpperCase()} level`,
                message: `Valid chapters for ${level.toUpperCase()}: ${validChapters}`
            });
        }
        
        // 从 public/mindmaps/ 目录读取
        const filePath = path.join(process.cwd(), 'public', 'mindmaps', fileName);
        
        // 如果文件不存在，尝试从旧路径读取（向后兼容）
        let fileContent;
        if (fs.existsSync(filePath)) {
            fileContent = fs.readFileSync(filePath, 'utf8');
        } else {
            // 向后兼容：尝试从 output/ 目录读取
            const fallbackPath = path.join(process.cwd(), 'output', fileName);
            if (fs.existsSync(fallbackPath)) {
                fileContent = fs.readFileSync(fallbackPath, 'utf8');
            } else {
                // 如果是 AS Chapter 1，尝试从根目录读取 cell_mindmap.json
                if (levelLower === 'as' && chapter === '1') {
                    const cellMindmapPath = path.join(process.cwd(), 'cell_mindmap.json');
                    if (fs.existsSync(cellMindmapPath)) {
                        fileContent = fs.readFileSync(cellMindmapPath, 'utf8');
                    } else {
                        console.error(`File not found: ${filePath}, ${fallbackPath}, ${cellMindmapPath}`);
                        return res.status(404).json({ 
                            error: 'Mindmap file not found',
                            details: `The file ${fileName} does not exist for ${level.toUpperCase()} level chapter ${chapter}`
                        });
                    }
                } else {
                    // A2 级别的思维导图文件尚未完成
                    if (levelLower === 'a2') {
                        console.error(`A2 mindmap file not yet created: ${filePath}`);
                        return res.status(404).json({ 
                            error: 'Mindmap not available',
                            message: `A2 Level Chapter ${chapter} mindmap is not yet available. Please check back later.`,
                            details: `The file ${fileName} does not exist for A2 level chapter ${chapter}`
                        });
                    } else {
                        console.error(`File not found: ${filePath}, ${fallbackPath}`);
                        return res.status(404).json({ 
                            error: 'Mindmap file not found',
                            details: `The file ${fileName} does not exist for ${level.toUpperCase()} level chapter ${chapter}`
                        });
                    }
                }
            }
        }

        // 解析JSON
        const jsonData = JSON.parse(fileContent);
        
        // 返回数据
        res.status(200).json(jsonData);
    } catch (error) {
        console.error('Error reading mindmap file:', error);
        res.status(500).json({ error: 'Failed to read mindmap file', details: error.message });
    }
}