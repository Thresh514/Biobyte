#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
转换A2生物考纲章节到JSON格式
"""

import json
import os
import re

# A2章节信息（基于文件分析）
A2_CHAPTERS = [
    {"unit": "12", "title": "Energy and respiration", "start": 3, "end": 414},
    {"unit": "13", "title": "Photosynthesis", "start": 415, "end": 681},
    {"unit": "14", "title": "Homeostasis", "start": 682, "end": 1016},
    {"unit": "15", "title": "Control and coordination", "start": 1017, "end": 1378},
    {"unit": "16", "title": "Inheritance", "start": 1379, "end": 1869},
    {"unit": "17", "title": "Selection and evolution", "start": 1870, "end": 2135},
    {"unit": "18", "title": "Classification, biodiversity and conservation", "start": 2136, "end": 2560},
    {"unit": "19", "title": "Genetic technology", "start": 2561, "end": 3016}
]

def read_chapter_content(file_path, start_line, end_line):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # 提取指定行范围（注意行号从1开始）
    chapter_lines = lines[start_line-1:end_line]
    return ''.join(chapter_lines)

def extract_sections_and_items(content, unit):
    lines = content.strip().split('\n')
    
    # A2格式：子章节 + 学习目标（与AS格式相同）
    sections = []
    current_section = None
    current_item = None
    current_content = []
    
    for line in lines:
        line = line.strip()
        if not line or line.startswith('A Level') or line.startswith('subject'):
            continue
            
        # 检查是否是章节标题
        if re.match(rf'^{unit}\s+[A-Za-z]', line):
            continue
        
        # 检查是否是子章节 (如 "12.1 Energy")
        section_match = re.match(rf'^{unit}\.(\d+)\s+(.+)', line)
        if section_match:
            # 保存之前的item
            if current_item and current_content:
                if current_section:
                    current_section["items"].append({
                        "title": current_item,
                        "content": current_content.copy()
                    })
            
            # 保存之前的section
            if current_section:
                sections.append(current_section)
            
            # 开始新的section
            current_section = {
                "section": line,
                "items": []
            }
            current_item = None
            current_content = []
            continue
        
        # 检查是否是学习目标 (数字开头，但不是子项目)
        if re.match(r'^\d+\s+[a-z]', line):  # 如 "1 outline..." 或 "2 describe..."
            # 保存之前的item
            if current_item and current_content:
                if current_section:
                    current_section["items"].append({
                        "title": current_item,
                        "content": current_content.copy()
                    })
            
            # 开始新的item
            current_item = line
            current_content = []
            continue
        
        # 检查是否是内容行
        if current_item and line:
            if line.startswith('•'):
                line = line[1:].strip()
            elif re.match(r'^[a-z]\.\s+', line):
                line = line[2:].strip()  # 去掉 "o "
            
            if line:
                current_content.append(line)
    
    # 保存最后的item和section
    if current_item and current_content:
        if current_section:
            current_section["items"].append({
                "title": current_item,
                "content": current_content.copy()
            })
    
    if current_section:
        sections.append(current_section)
    
    return sections

def convert_chapter_to_json(chapter_info, source_file):
    content = read_chapter_content(source_file, chapter_info["start"], chapter_info["end"])
    sections = extract_sections_and_items(content, chapter_info["unit"])
    
    json_data = {
        "unit": chapter_info["unit"],
        "title": chapter_info["title"],
        "content": sections
    }
    
    return json_data

def main():
    source_file = "docs/A2 syallbus analysis.txt"
    output_dir = "output"
    
    os.makedirs(output_dir, exist_ok=True)
    
    for chapter in A2_CHAPTERS:
        try:
            print(f"正在转换第{chapter['unit']}章: {chapter['title']} (行 {chapter['start']}-{chapter['end']})")
            
            json_data = convert_chapter_to_json(chapter, source_file)
            
            filename = f"{chapter['unit']}_{chapter['title'].replace(' ', '_').replace(',', '').replace('and', 'and')}.json"
            filepath = os.path.join(output_dir, filename)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(json_data, f, ensure_ascii=False, indent=2)
            
            print(f"✅ 成功保存: {filepath}")
            
        except Exception as e:
            print(f"❌ 转换第{chapter['unit']}章时出错: {e}")

if __name__ == "__main__":
    main()
