#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
统一的思维导图处理 Pipeline
处理 mindmap_raw/ 目录下的所有 PDF 文件，转换为统一的 mindmap 格式
并输出到 public/mindmaps/ 目录
"""

import json
import os
import re
import sys
from pathlib import Path

# 添加 scripts 目录到路径，以便导入升级脚本
sys.path.insert(0, str(Path(__file__).parent / 'scripts'))

try:
    from upgrade_mindmap_data import upgrade_node, slugify
except ImportError:
    print("警告: 无法导入升级脚本，将使用简化版本")
    def slugify(text):
        if not text:
            return ''
        text = re.sub(r'[^\w\s-]', '', text)
        text = re.sub(r'[-\s]+', '-', text)
        return text.lower().strip('-')

# PDF 文件名到章节编号的映射（支持带空格的文件名）
PDF_TO_CHAPTER = {
    'cell.pdf': '1',
    ' cell.pdf': '1',  # 带前导空格
    'biomolecule.pdf': '2',
    'enzyme.pdf': '3',
    'membrane structure and transport.pdf': '4',
    'mitosis.pdf': '5',
    'Nucleic acids and protein synthesis.pdf': '6',
    'Transport in Plant.pdf': '7',
    'Transport in mammal.pdf': '8',
    'Gas exchange system.pdf': '9',
    ' Gas exchange system.pdf': '9',  # 带前导空格
    'infectious disease.pdf': '10',
    'Immunity.pdf': '11',
}

# 章节编号到输出文件名的映射
CHAPTER_TO_FILENAME = {
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
}

try:
    import pdfplumber
except ImportError:
    print("错误: 需要安装 pdfplumber 库")
    print("请运行: pip install pdfplumber")
    sys.exit(1)


def extract_text_from_pdf(pdf_path):
    """从 PDF 中提取文本，保留缩进信息"""
    lines_with_position = []
    
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            chars = page.chars
            
            if not chars:
                text = page.extract_text()
                if text:
                    page_lines = text.split('\n')
                    for line in page_lines:
                        lines_with_position.append((0, line))
                continue
            
            y_groups = {}
            for char in chars:
                y_key = round(char['y0'], 1)
                if y_key not in y_groups:
                    y_groups[y_key] = []
                y_groups[y_key].append(char)
            
            for y_key in sorted(y_groups.keys(), reverse=True):
                chars_in_line = sorted(y_groups[y_key], key=lambda c: c['x0'])
                
                if not chars_in_line:
                    continue
                
                first_char_x = chars_in_line[0]['x0']
                line_text = ''.join([char['text'] for char in chars_in_line])
                
                if line_text.strip():
                    lines_with_position.append((first_char_x, line_text))
    
    return lines_with_position


def calculate_indent_level(x_pos, x_positions):
    """根据 x 坐标计算缩进级别"""
    if not x_positions:
        return 0
    
    unique_x = sorted(set(x_positions))
    
    if x_pos in unique_x:
        return unique_x.index(x_pos)
    
    closest_x = min(unique_x, key=lambda x: abs(x - x_pos))
    
    if abs(x_pos - closest_x) > 10:
        insert_pos = 0
        for i, x in enumerate(unique_x):
            if x_pos > x:
                insert_pos = i + 1
            else:
                break
        return insert_pos
    
    return unique_x.index(closest_x)


def parse_hierarchy(lines_with_position):
    """解析层级关系，构建树形结构"""
    if not lines_with_position:
        return []
    
    x_positions = [x for x, _ in lines_with_position if x > 0]
    nodes = []
    root_nodes = []
    root_index = 0
    
    for x_pos, line_text in lines_with_position:
        indent_level = calculate_indent_level(x_pos, x_positions)
        content = line_text.strip()
        
        if not content:
            continue
        
        content = re.sub(r'^[•\-\*]\s*', '', content)
        content = content.strip()
        
        if not content:
            continue
        
        while nodes and nodes[-1]["level"] >= indent_level:
            nodes.pop()
        
        if not nodes:
            node_id = f"root_{root_index}"
            root_index += 1
        else:
            parent = nodes[-1]["node"]
            parent_id = parent.get("id", "")
            child_index = len(parent.get("children", []))
            
            if parent_id.startswith("root_"):
                node_id = f"{parent_id}_child_{child_index}"
            else:
                node_id = f"{parent_id}_child_{child_index}"
        
        node = {
            "id": node_id,
            "title": content,
            "children": []
        }
        
        if not nodes:
            root_nodes.append(node)
            nodes.append({"level": indent_level, "node": node})
        else:
            parent = nodes[-1]["node"]
            parent["children"].append(node)
            nodes.append({"level": indent_level, "node": node})
    
    return root_nodes


def upgrade_to_mindmap_format(data, level=0, parent_side=None, parent_id=None, index=0, siblings_count=1, used_ids=None):
    """将 title 格式升级为 label 格式（添加 id, label, side）"""
    if used_ids is None:
        used_ids = set()
    
    # 如果已经是新格式（有 label），直接返回
    if isinstance(data, dict) and 'label' in data:
        return data
    
    # 旧格式（有 title），需要转换
    if isinstance(data, dict) and 'title' in data:
        title = data.get('title', '')
        
        # 生成 ID
        node_id = data.get('id')
        if not node_id:
            base_id = slugify(title)
            if not base_id:
                base_id = f'node-{level}-{index}'
            
            candidate_ids = []
            if parent_id:
                candidate_ids.append(f"{parent_id}-{base_id}")
            candidate_ids.append(base_id)
            
            node_id = None
            for candidate in candidate_ids:
                if candidate not in used_ids:
                    node_id = candidate
                    break
            
            if not node_id:
                original_id = candidate_ids[0]
                suffix = 1
                while node_id is None or node_id in used_ids:
                    node_id = f"{original_id}-{suffix}"
                    suffix += 1
            
            used_ids.add(node_id)
        
        # 分配 side
        side = data.get('side')
        if not side:
            if level == 0:
                side = 'center'
            elif parent_side == 'center':
                # 一级节点：平分左右
                side = 'left' if index < siblings_count / 2 else 'right'
            else:
                # 继承父节点方向
                side = parent_side
        
        # 处理子节点
        children = []
        child_siblings_count = len(data.get('children', []))
        for child_index, child in enumerate(data.get('children', [])):
            upgraded_child = upgrade_to_mindmap_format(
                child, 
                level + 1, 
                side, 
                node_id, 
                child_index, 
                child_siblings_count,
                used_ids
            )
            children.append(upgraded_child)
        
        return {
            "id": node_id,
            "label": title,
            "side": side,
            "children": children
        }
    
    # 如果是列表，递归处理
    if isinstance(data, list):
        return [upgrade_to_mindmap_format(item, level, parent_side, parent_id, idx, len(data), used_ids) 
                for idx, item in enumerate(data)]
    
    return data


def process_pdf_file(pdf_path, output_path):
    """处理单个 PDF 文件"""
    try:
        print(f"  📄 提取 PDF 文本...")
        lines_with_position = extract_text_from_pdf(pdf_path)
        print(f"  ✅ 提取了 {len(lines_with_position)} 行文本")
        
        print(f"  🔄 解析层级关系...")
        root_nodes = parse_hierarchy(lines_with_position)
        print(f"  ✅ 解析完成，找到 {len(root_nodes)} 个根节点")
        
        print(f"  🔄 升级为思维导图格式...")
        upgraded_data = upgrade_to_mindmap_format(root_nodes)
        print(f"  ✅ 格式升级完成")
        
        # 写入输出文件
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(upgraded_data, f, ensure_ascii=False, indent=2)
        
        return True, None
    except Exception as e:
        import traceback
        return False, f"{str(e)}\n{traceback.format_exc()}"


def main():
    # 配置路径
    mindmap_raw_dir = Path('mindmap_raw')
    public_mindmaps_dir = Path('public/mindmaps')
    
    # 创建输出目录
    public_mindmaps_dir.mkdir(parents=True, exist_ok=True)
    
    # 获取所有 PDF 文件
    pdf_files = list(mindmap_raw_dir.glob('*.pdf'))
    
    if not pdf_files:
        print("❌ 在 mindmap_raw/ 目录下没有找到 PDF 文件")
        return
    
    print(f"📁 找到 {len(pdf_files)} 个 PDF 文件")
    print(f"📂 输出目录: {public_mindmaps_dir}")
    print("-" * 60)
    
    success_count = 0
    error_count = 0
    skipped_count = 0
    
    # 处理每个文件
    for pdf_file in sorted(pdf_files):
        filename = pdf_file.name
        
        # 查找对应的章节编号（处理文件名中的空格）
        chapter = None
        filename_normalized = filename.strip()  # 去除前后空格
        for pdf_name, chapter_num in PDF_TO_CHAPTER.items():
            pdf_name_normalized = pdf_name.strip()
            if filename_normalized.lower() == pdf_name_normalized.lower():
                chapter = chapter_num
                break
        
        if not chapter:
            print(f"⏭️  跳过: {filename} (未找到对应的章节映射)")
            skipped_count += 1
            continue
        
        # 获取输出文件名
        output_filename = CHAPTER_TO_FILENAME.get(chapter)
        if not output_filename:
            print(f"⏭️  跳过: {filename} (未找到对应的输出文件名)")
            skipped_count += 1
            continue
        
        output_path = public_mindmaps_dir / output_filename
        
        print(f"🔄 处理: {filename} -> {output_filename}")
        print(f"   章节: {chapter}")
        
        success, error = process_pdf_file(pdf_file, output_path)
        
        if success:
            print(f"✅ 成功: {output_path}")
            success_count += 1
        else:
            print(f"❌ 失败: {filename}")
            print(f"   错误: {error}")
            error_count += 1
        print()
    
    print("-" * 60)
    print(f"📊 处理完成:")
    print(f"   ✅ 成功: {success_count} 个文件")
    print(f"   ❌ 失败: {error_count} 个文件")
    print(f"   ⏭️  跳过: {skipped_count} 个文件")
    print(f"   📂 输出目录: {public_mindmaps_dir.absolute()}")

if __name__ == "__main__":
    main()
