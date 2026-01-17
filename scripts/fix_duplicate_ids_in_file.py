#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复 JSON 文件中的重复 ID
"""

import json
import sys

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
        print(f"修复重复 ID: {current_path} -> {new_id}")
    
    used_ids.add(current_id)
    
    # 递归处理子节点
    for child in node.get('children', []):
        fix_node_ids(child, current_id, used_ids, current_path)

def main():
    if len(sys.argv) < 2:
        print("用法: python fix_duplicate_ids_in_file.py <json文件>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    print(f"正在读取: {file_path}")
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("正在修复重复 ID...")
    used_ids = set()
    
    if isinstance(data, list):
        for node in data:
            fix_node_ids(node, None, used_ids)
    else:
        fix_node_ids(data, None, used_ids)
    
    print(f"正在保存到: {file_path}")
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print("✅ 完成！")

if __name__ == "__main__":
    main()
