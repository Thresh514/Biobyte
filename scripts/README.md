# 思维导图生成脚本

## 完整 Pipeline

使用 `pdf_to_final_mindmap.py` 从 PDF 直接生成最终格式的思维导图 JSON。

### 使用方法

```bash
python scripts/pdf_to_final_mindmap.py <PDF文件> [输出JSON文件]
```

### 示例

```bash
# 从 cell.pdf 生成 cell_mindmap.json
python scripts/pdf_to_final_mindmap.py cell.pdf cell_mindmap.json
```

### Pipeline 流程

1. **PDF 文本提取** - 从 PDF 提取文本和缩进信息
2. **层级解析** - 根据缩进构建树形结构
3. **格式升级** - 添加 `id`、`label`、`side` 字段
4. **ID 去重** - 确保所有节点 ID 唯一
5. **验证保存** - 验证数据格式并保存

### 输出格式

生成的 JSON 文件包含：
- `id`: 唯一标识符（基于 label 生成）
- `label`: 显示文本（原 title）
- `side`: 布局方向（left/right/center）
- `children`: 子节点数组

## 其他工具脚本

### upgrade_mindmap_data.py
单独升级已有 JSON 文件格式（从 title 格式升级到新格式）

```bash
python scripts/upgrade_mindmap_data.py <输入文件> [输出文件]
```

### fix_duplicate_ids_in_file.py
修复 JSON 文件中的重复 ID

```bash
python scripts/fix_duplicate_ids_in_file.py <JSON文件>
```

## 依赖

```bash
pip install pdfplumber
```
