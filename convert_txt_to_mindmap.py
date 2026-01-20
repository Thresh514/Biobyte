#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
将 A2 级别的 txt 思维导图文件转换为 JSON 格式
格式与 AS 级别的 JSON 文件一致
"""

import json
import os
import re
from pathlib import Path


def calculate_indent_level(line):
    """计算行的缩进级别（空格数）"""
    stripped = line.lstrip(' ')
    indent = len(line) - len(stripped)
    # 将缩进转换为级别（每2个空格为一级，或者每1个空格为一级）
    # 根据实际文件，看起来是每1个空格为一级
    return indent


def parse_txt_hierarchy(file_path):
    """解析 txt 文件的层级关系，构建树形结构"""
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    if not lines:
        return []
    
    nodes = []  # 用于维护当前路径的节点栈
    root_nodes = []
    root_index = 0
    
    for line in lines:
        # 计算缩进级别
        indent_level = calculate_indent_level(line)
        content = line.strip()
        
        if not content:
            continue
        
        # 移除可能的项目符号
        content = re.sub(r'^[•\-\*]\s*', '', content)
        content = content.strip()
        
        if not content:
            continue
        
        # 弹出栈中所有级别大于等于当前级别的节点
        while nodes and nodes[-1]["level"] >= indent_level:
            nodes.pop()
        
        # 生成节点 ID
        if not nodes:
            # 根节点
            node_id = f"root_{root_index}"
            root_index += 1
        else:
            # 子节点
            parent = nodes[-1]["node"]
            parent_id = parent.get("id", "")
            child_index = len(parent.get("children", []))
            node_id = f"{parent_id}_child_{child_index}"
        
        # 创建节点
        node = {
            "id": node_id,
            "title": content,
            "children": []
        }
        
        # 添加到树中
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
        
        # 使用已有的 ID
        node_id = data.get('id')
        if node_id:
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


def convert_txt_to_json(txt_path, output_path):
    """将 txt 文件转换为 JSON 格式"""
    try:
        print(f"  📄 读取文件: {txt_path}")
        
        # 解析层级关系
        print(f"  🔄 解析层级关系...")
        root_nodes = parse_txt_hierarchy(txt_path)
        print(f"  ✅ 解析完成，找到 {len(root_nodes)} 个根节点")
        
        # 升级为思维导图格式
        print(f"  🔄 升级为思维导图格式...")
        upgraded_data = upgrade_to_mindmap_format(root_nodes)
        print(f"  ✅ 格式升级完成")
        
        # 写入输出文件
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(upgraded_data, f, ensure_ascii=False, indent=2)
        
        print(f"  ✅ 成功保存: {output_path}")
        return True, None
    except Exception as e:
        import traceback
        return False, f"{str(e)}\n{traceback.format_exc()}"


# A2 级别 txt 文件到章节的映射
TXT_TO_CHAPTER = {
    'Energy and Respiration.txt': '12_Energy_and_respiration.json',
    'Photosynthesis.txt': '13_Photosynthesis.json',
    'Homeostasis.txt': '14_Homeostasis.json',
    'Nervous System.txt': '15_Control_and_coordination.json',
    'Inheritance.txt': '16_Inheritance.json',
    'Selection & Evolution.txt': '17_Selection_and_evolution.json',
    'Classification, Biodiversity and Conservation.txt': '18_Classification_biodiversity_and_conservation.json',
    'Genetic Technology.txt': '19_Genetic_technology.json',
}


def main():
    # 配置路径
    mindmap_raw_dir = Path('mindmap_raw')
    public_mindmaps_dir = Path('public/mindmaps')
    
    # 创建输出目录
    public_mindmaps_dir.mkdir(parents=True, exist_ok=True)
    
    # 获取所有 txt 文件
    txt_files = list(mindmap_raw_dir.glob('*.txt'))
    
    if not txt_files:
        print("❌ 在 mindmap_raw/ 目录下没有找到 txt 文件")
        return
    
    print(f"📁 找到 {len(txt_files)} 个 txt 文件")
    print(f"📂 输出目录: {public_mindmaps_dir}")
    print("-" * 60)
    
    success_count = 0
    error_count = 0
    skipped_count = 0
    
    # 处理每个文件
    for txt_file in sorted(txt_files):
        filename = txt_file.name
        
        # 查找对应的输出文件名
        output_filename = TXT_TO_CHAPTER.get(filename)
        
        if not output_filename:
            print(f"⏭️  跳过: {filename} (未找到对应的章节映射)")
            skipped_count += 1
            continue
        
        output_path = public_mindmaps_dir / output_filename
        
        print(f"🔄 处理: {filename} -> {output_filename}")
        
        success, error = convert_txt_to_json(txt_file, output_path)
        
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
