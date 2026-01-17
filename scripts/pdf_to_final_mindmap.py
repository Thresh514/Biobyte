#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
完整的思维导图生成 Pipeline
从 PDF → 最终格式化的 JSON（包含 id、label、side，且 ID 唯一）

流程：
1. 从 PDF 提取文本和层级结构
2. 生成初始 JSON（title 格式）
3. 升级数据格式（title → label，添加 id、side）
4. 修复重复 ID
5. 验证最终数据
"""

import json
import os
import re
import sys
from pathlib import Path

# 添加 scripts 目录到路径，以便导入其他模块
script_dir = Path(__file__).parent
project_root = script_dir.parent
sys.path.insert(0, str(script_dir))

try:
    import pdfplumber
except ImportError:
    print("错误: 需要安装 pdfplumber 库")
    print("请运行: pip install pdfplumber")
    sys.exit(1)

# 导入升级模块
from upgrade_mindmap_data import upgrade_mindmap_data, slugify

# 修复重复 ID 的函数（内联，避免导入问题）
def fix_node_ids(node, parent_id=None, used_ids=None, path=""):
    """递归修复节点 ID，确保唯一性"""
    if used_ids is None:
        used_ids = set()
    
    current_id = node.get('id', '')
    current_path = f"{path}/{current_id}" if path else current_id
    
    # 如果 ID 已存在，添加父节点前缀使其唯一
    if current_id in used_ids:
        if parent_id:
            new_id = f"{parent_id}-{current_id}"
        else:
            # 根节点冲突，使用路径
            new_id = f"{current_id}-{hash(current_path) % 10000}"
        
        # 确保新 ID 也是唯一的
        suffix = 1
        original_new_id = new_id
        while new_id in used_ids:
            new_id = f"{original_new_id}-{suffix}"
            suffix += 1
        
        node['id'] = new_id
        current_id = new_id
    
    used_ids.add(current_id)
    
    # 递归处理子节点
    for child in node.get('children', []):
        fix_node_ids(child, current_id, used_ids, current_path)


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


def validate_final_data(data):
    """验证最终数据格式"""
    issues = []
    all_ids = set()
    
    def check_node(node, path=""):
        node_id = node.get('id')
        path_str = f"{path}/{node_id}" if path else node_id
        
        if not node_id:
            issues.append(f"{path_str}: 缺少 id")
        elif node_id in all_ids:
            issues.append(f"{path_str}: ID 重复")
        else:
            all_ids.add(node_id)
        
        if 'label' not in node:
            issues.append(f"{path_str}: 缺少 label")
        if 'side' not in node:
            issues.append(f"{path_str}: 缺少 side")
        
        for child in node.get('children', []):
            check_node(child, path_str)
    
    nodes = data if isinstance(data, list) else [data]
    for node in nodes:
        check_node(node)
    
    return issues, len(all_ids)


def main():
    """主函数：执行完整 pipeline"""
    if len(sys.argv) < 2:
        print("用法: python pdf_to_final_mindmap.py <PDF文件> [输出JSON文件]")
        print("示例: python pdf_to_final_mindmap.py cell.pdf cell_mindmap.json")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    if not os.path.exists(pdf_path):
        print(f"错误: 找不到 PDF 文件 {pdf_path}")
        sys.exit(1)
    
    if not output_file:
        base_name = os.path.splitext(os.path.basename(pdf_path))[0]
        output_file = f"{base_name}_mindmap.json"
    
    print("=" * 60)
    print("思维导图生成 Pipeline")
    print("=" * 60)
    
    # Step 1: 从 PDF 提取文本
    print(f"\n[1/5] 正在从 PDF 提取文本: {pdf_path}")
    try:
        lines_with_position = extract_text_from_pdf(pdf_path)
        print(f"      ✅ 提取了 {len(lines_with_position)} 行文本")
    except Exception as e:
        print(f"      ❌ 提取失败: {e}")
        sys.exit(1)
    
    # Step 2: 解析层级结构
    print(f"\n[2/5] 正在解析层级结构...")
    try:
        root_nodes = parse_hierarchy(lines_with_position)
        print(f"      ✅ 解析完成，找到 {len(root_nodes)} 个根节点")
    except Exception as e:
        print(f"      ❌ 解析失败: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    
    # Step 3: 升级数据格式
    print(f"\n[3/5] 正在升级数据格式（添加 id、label、side）...")
    try:
        upgraded_data = upgrade_mindmap_data(root_nodes)
        print(f"      ✅ 格式升级完成")
    except Exception as e:
        print(f"      ❌ 升级失败: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    
    # Step 4: 修复重复 ID
    print(f"\n[4/5] 正在修复重复 ID...")
    try:
        used_ids = set()
        if isinstance(upgraded_data, list):
            for node in upgraded_data:
                fix_node_ids(node, None, used_ids)
        else:
            fix_node_ids(upgraded_data, None, used_ids)
        print(f"      ✅ ID 修复完成")
    except Exception as e:
        print(f"      ❌ 修复失败: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    
    # Step 5: 验证并保存
    print(f"\n[5/5] 正在验证并保存数据...")
    try:
        issues, node_count = validate_final_data(upgraded_data)
        if issues:
            print(f"      ⚠️  发现 {len(issues)} 个问题:")
            for issue in issues[:5]:
                print(f"         - {issue}")
            if len(issues) > 5:
                print(f"         ... 还有 {len(issues) - 5} 个问题")
        else:
            print(f"      ✅ 验证通过，共 {node_count} 个节点")
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(upgraded_data, f, ensure_ascii=False, indent=2)
        print(f"      ✅ 已保存到: {output_file}")
    except Exception as e:
        print(f"      ❌ 保存失败: {e}")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("✅ Pipeline 完成！")
    print(f"   输出文件: {output_file}")
    print("=" * 60)


if __name__ == "__main__":
    main()
