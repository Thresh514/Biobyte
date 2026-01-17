#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
思维导图数据格式升级脚本
将"笔记格式"JSON升级为"程序可消费格式"，统一添加 id、label、side 字段
"""

import json
import re
import os
import sys
from typing import Dict, List, Any, Optional, Tuple


def slugify(text: str) -> str:
    """
    将文本转换为 URL 友好的 slug ID
    
    例如：
    "Golgi body" → "golgi-body"
    "10- 100um" → "10-100um"
    "DNA> ribosome" → "dna-ribosome"
    """
    if not text:
        return ''
    
    # 移除特殊字符，保留字母数字、空格和连字符
    text = re.sub(r'[^\w\s-]', '', text)
    # 转小写，替换多个空格为单个空格
    text = re.sub(r'\s+', ' ', text)
    # 替换空格为连字符
    text = text.lower().strip().replace(' ', '-')
    # 移除多个连续连字符
    text = re.sub(r'-+', '-', text)
    
    return text


def detect_split_nodes(siblings: List[Dict[str, Any]]) -> List[Tuple[int, int]]:
    """
    检测明显断行的节点对（应该合并）
    
    返回：[(start_index, end_index), ...] 需要合并的节点范围列表
    """
    merges = []
    i = 0
    
    while i < len(siblings):
        # 查找连续的、无children的节点
        if not siblings[i].get('children') and siblings[i].get('title', '').strip():
            # 检查下一个节点是否也是无children
            j = i + 1
            while j < len(siblings):
                if siblings[j].get('children'):
                    break
                
                # 判断是否可能是断行：
                # 1. 前一个节点以 "form"、"("、">" 结尾
                # 2. 后一个节点以 ")>"、")" 开头
                prev_title = siblings[i].get('title', '')
                curr_title = siblings[j].get('title', '')
                
                # 检测断行模式
                if (prev_title and curr_title and
                    (prev_title.rstrip().endswith(('form', '(')) or
                     curr_title.lstrip().startswith((')>', 'Polypeptide')))):
                    j += 1
                    continue
                break
            
            # 如果找到多个连续的疑似断行节点，标记为需要合并
            if j > i + 1:
                merges.append((i, j - 1))
                i = j
                continue
        
        i += 1
    
    return merges


def merge_split_nodes(siblings: List[Dict[str, Any]], start: int, end: int) -> Dict[str, Any]:
    """
    合并断行的节点
    """
    titles = []
    side = None
    
    for idx in range(start, end + 1):
        node = siblings[idx]
        title = node.get('title', '').strip()
        if title:
            titles.append(title)
        # 保留第一个节点的 side（如果有）
        if side is None and node.get('side'):
            side = node.get('side')
    
    merged_title = ' '.join(titles)
    
    return {
        'title': merged_title,
        'children': [],
        'side': side
    }


def upgrade_node(
    node: Dict[str, Any],
    parent_side: Optional[str] = None,
    parent_id: Optional[str] = None,
    index: int = 0,
    siblings_count: int = 1,
    level: int = 0,
    used_ids: Optional[set] = None
) -> Dict[str, Any]:
    """
    升级单个节点：
    - title → label
    - 生成 id（确保唯一性）
    - 分配 side
    
    Args:
        node: 原始节点
        parent_side: 父节点的 side
        parent_id: 父节点的 id（用于生成唯一 ID）
        index: 当前节点在兄弟节点中的索引
        siblings_count: 兄弟节点总数
        level: 节点层级（0=根节点）
        used_ids: 已使用的 ID 集合（用于确保唯一性）
    """
    if used_ids is None:
        used_ids = set()
    
    # 1. title → label（原样保留）
    label = node.get('title') or node.get('label') or ''
    
    # 2. 生成唯一的 id
    node_id = node.get('id')
    if not node_id:
        base_id = slugify(label)
        if not base_id:
            base_id = f'node-{level}-{index}'
        
        # 尝试生成 ID：先尝试 base_id，如果有父节点则加上前缀
        candidate_ids = []
        if parent_id:
            candidate_ids.append(f"{parent_id}-{base_id}")
        candidate_ids.append(base_id)
        
        # 找到第一个未使用的 ID
        node_id = None
        for candidate in candidate_ids:
            if candidate not in used_ids:
                node_id = candidate
                break
        
        # 如果所有候选 ID 都已被使用，添加索引后缀
        if not node_id:
            original_id = candidate_ids[0]
            suffix = 1
            while node_id is None or node_id in used_ids:
                node_id = f"{original_id}-{suffix}"
                suffix += 1
        
        used_ids.add(node_id)
    
    # 3. 分配 side
    side = node.get('side')
    if not side:
        if level == 0:
            # 根节点：center
            side = 'center'
        elif parent_side == 'center' or parent_side is None:
            # 一级节点（父节点是 center）：按索引平分
            side = 'left' if index < siblings_count / 2 else 'right'
        else:
            # 二级及以后：继承父节点
            side = parent_side
    
    # 4. 处理 children（递归升级）
    children = node.get('children', [])
    upgraded_children = []
    
    if children:
        # 先检测并修复断行
        merges = detect_split_nodes(children)
        
        # 从后往前合并，避免索引变化问题
        for start, end in reversed(merges):
            merged = merge_split_nodes(children, start, end)
            # 删除被合并的节点，插入合并后的节点
            del children[start:end+1]
            children.insert(start, merged)
        
        # 升级所有子节点
        for idx, child in enumerate(children):
            upgraded_child = upgrade_node(
                child,
                parent_side=side,
                parent_id=node_id,
                index=idx,
                siblings_count=len(children),
                level=level + 1,
                used_ids=used_ids
            )
            upgraded_children.append(upgraded_child)
    
    # 构建升级后的节点
    upgraded_node = {
        'id': node_id,
        'label': label,
        'side': side,
        'children': upgraded_children
    }
    
    return upgraded_node


def upgrade_mindmap_data(data: Any) -> Any:
    """
    升级思维导图数据
    
    支持：
    - 单个对象
    - 对象数组
    """
    if isinstance(data, list):
        if len(data) == 0:
            return []
        
        # 处理数组：每个元素是根节点
        upgraded = []
        used_ids = set()
        for idx, node in enumerate(data):
            upgraded_node = upgrade_node(
                node,
                parent_side=None,
                parent_id=None,
                index=idx,
                siblings_count=len(data),
                level=0,
                used_ids=used_ids
            )
            upgraded.append(upgraded_node)
        
        return upgraded
    elif isinstance(data, dict):
        # 单个对象：作为根节点
        used_ids = set()
        return upgrade_node(data, parent_side=None, parent_id=None, index=0, siblings_count=1, level=0, used_ids=used_ids)
    else:
        raise ValueError(f"不支持的数据类型: {type(data)}")


def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("用法: python upgrade_mindmap_data.py <输入文件> [输出文件]")
        print("示例: python upgrade_mindmap_data.py cell_mindmap.json cell_mindmap_v2.json")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    if not os.path.exists(input_file):
        print(f"错误: 找不到输入文件 {input_file}")
        sys.exit(1)
    
    # 如果没有指定输出文件，生成默认名称
    if not output_file:
        base_name = os.path.splitext(input_file)[0]
        output_file = f"{base_name}_upgraded.json"
    
    print(f"正在读取: {input_file}")
    
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"读取 JSON 文件时出错: {e}")
        sys.exit(1)
    
    print(f"正在升级数据格式...")
    
    try:
        upgraded_data = upgrade_mindmap_data(data)
    except Exception as e:
        print(f"升级数据时出错: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    
    print(f"正在保存到: {output_file}")
    
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(upgraded_data, f, ensure_ascii=False, indent=2)
        print(f"✅ 升级完成！")
        print(f"   输入文件: {input_file}")
        print(f"   输出文件: {output_file}")
    except Exception as e:
        print(f"保存文件时出错: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
