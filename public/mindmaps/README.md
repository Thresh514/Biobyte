# Mindmaps 目录

这个目录包含所有处理好的思维导图 JSON 文件。

## 文件来源

所有文件通过 `process_mindmaps_pipeline.py` 脚本处理生成：
- 从 `mindmap_raw/` 目录读取 PDF 文件
- 使用 `pdfplumber` 提取 PDF 文本和层级信息
- 解析层级关系，构建树形结构
- 统一转换为思维导图格式（包含 id, label, side, children）
- 输出到 `public/mindmaps/` 目录

## 文件格式

所有文件都遵循统一的思维导图格式：

```json
[
  {
    "id": "node-id",
    "label": "节点标签",
    "side": "left|right|center",
    "children": [...]
  }
]
```

## 使用方法

运行 pipeline 脚本（需要使用虚拟环境）：

```bash
source venv/bin/activate
python process_mindmaps_pipeline.py
```

或者：

```bash
venv/bin/python process_mindmaps_pipeline.py
```

脚本会自动：
1. 读取 `mindmap_raw/` 目录下的所有 PDF 文件
2. 提取 PDF 文本和缩进信息
3. 解析层级关系
4. 转换为统一格式（添加 id, label, side）
5. 输出到 `public/mindmaps/` 目录

## PDF 到章节映射

- `cell.pdf` → `1_Cell_structure.json`
- `biomolecule.pdf` → `2_Biological_molecules.json`
- `enzyme.pdf` → `3_Enzymes.json`
- `membrane structure and transport.pdf` → `4_Cell_membranes_and_transport.json`
- `mitosis.pdf` → `5_The_mitotic_cell_cycle.json`
- `Nucleic acids and protein synthesis.pdf` → `6_Nucleic_acids_and_protein_synthesis.json`
- `Transport in Plant.pdf` → `7_Transport_of_Plant.json`
- `Transport in mammal.pdf` → `8_Transport_in_mammals.json`
- `Gas exchange system.pdf` → `9_Gas_exchange.json`
- `infectious disease.pdf` → `10_Infectious_diseases.json`
- `Immunity.pdf` → `11_Immunity.json`

## API 使用

前端通过 `/api/getMindmapData?level=AS&chapter=1` 访问这些文件。

API 会从 `public/mindmaps/` 目录读取对应的文件。
