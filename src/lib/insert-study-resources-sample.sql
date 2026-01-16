-- =====================================================
-- Study Resources 示例数据插入脚本
-- 基于实际的图片文件命名规则生成
-- =====================================================
-- 说明：
-- 1. price = 0.00 表示免费商品
-- 2. price > 0.00 表示付费商品
-- 3. price = -1.00 表示会员专享商品
-- 4. chapter = 'All' 表示主页面/所有章节
-- 5. chapter = '1', '2', ... 表示具体章节
-- 6. 图片路径：主图(.jpg), 复图1(-1.png), 复图2(-2.png)
-- =====================================================

-- =====================================================
-- AS Level Mindmap 资源
-- =====================================================

-- AS Mindmap 主页面（All chapters）
INSERT INTO study_resources (
    title, description, type, level, chapter, file_path, format, price, 
    image, image1, image2, is_active
) VALUES (
    'AS Mindmap', 
    'Complete AS Level Biology Mindmap covering all topics. Visual representation of key concepts and connections for AS Level Biology.',
    'Mindmap', 
    'AS', 
    'All', 
    '',
    'pdf',
    9.99,
    '/product/asmindmapmain.jpg',
    '/product/asmindmapmain.jpg',
    '/product/asmindmapmain.jpg',
    TRUE
);

-- AS Mindmap Chapter 1: Cell structure
INSERT INTO study_resources (
    title, description, type, level, chapter, file_path, format, price,
    image, image1, image2, is_active
) VALUES (
    'AS Mindmap Chapter 1',
    'Mindmap for Chapter 1: Cell structure. Topics include microscope studies, cell organelles, prokaryotic vs eukaryotic cells, and cell functions.',
    'Mindmap',
    'AS',
    '1',
    '',
    'pdf',
    2.99,
    '/product/as-1.jpg',
    '/product/as-1-1.png',
    '/product/as-1-2.png',
    TRUE
);

-- AS Mindmap Chapter 2: Biological molecules
INSERT INTO study_resources (
    title, description, type, level, chapter, file_path, format, price,
    image, image1, image2, is_active
) VALUES (
    'AS Mindmap Chapter 2',
    'Mindmap for Chapter 2: Biological molecules. Covers carbohydrates, proteins, lipids, nucleic acids, and biological testing methods.',
    'Mindmap',
    'AS',
    '2',
    '',
    'pdf',
    2.99,
    '/product/as-2.jpg',
    '/product/as-2-1.png',
    '/product/as-2-2.png',
    TRUE
);

-- AS Mindmap Chapter 3: Enzymes
INSERT INTO study_resources (
    title, description, type, level, chapter, file_path, format, price,
    image, image1, image2, is_active
) VALUES (
    'AS Mindmap Chapter 3',
    'Mindmap for Chapter 3: Enzymes. Enzyme structure, function, factors affecting enzyme activity, enzyme kinetics, and inhibition.',
    'Mindmap',
    'AS',
    '3',
    '',
    'pdf',
    2.99,
    '/product/as-3.jpg',
    '/product/as-3-1.png',
    '/product/as-3-2.png',
    TRUE
);

-- AS Mindmap Chapter 4: Cell membranes and transport
INSERT INTO study_resources (
    title, description, type, level, chapter, file_path, format, price,
    image, image1, image2, is_active
) VALUES (
    'AS Mindmap Chapter 4',
    'Mindmap for Chapter 4: Cell membranes and transport. Membrane structure (fluid mosaic model), diffusion, osmosis, active transport, and cell signaling.',
    'Mindmap',
    'AS',
    '4',
    '',
    'pdf',
    2.99,
    '/product/as-4.jpg',
    '/product/as-4-1.png',
    '/product/as-4-2.png',
    TRUE
);

-- AS Mindmap Chapter 5: The mitotic cell cycle
INSERT INTO study_resources (
    title, description, type, level, chapter, file_path, format, price,
    image, image1, image2, is_active
) VALUES (
    'AS Mindmap Chapter 5',
    'Mindmap for Chapter 5: The mitotic cell cycle. Cell cycle phases (G1, S, G2, M), mitosis stages, and cell division processes.',
    'Mindmap',
    'AS',
    '5',
    '',
    'pdf',
    2.99,
    '/product/as-5.jpg',
    '/product/as-5-1.png',
    '/product/as-5-2.png',
    TRUE
);

-- AS Mindmap Chapter 6: Nucleic acids and protein synthesis
INSERT INTO study_resources (
    title, description, type, level, chapter, file_path, format, price,
    image, image1, image2, is_active
) VALUES (
    'AS Mindmap Chapter 6',
    'Mindmap for Chapter 6: Nucleic acids and protein synthesis. DNA structure, RNA types, transcription, translation, and genetic code.',
    'Mindmap',
    'AS',
    '6',
    '',
    'pdf',
    2.99,
    '/product/as-6.jpg',
    '/product/as-6-1.png',
    '/product/as-6-2.png',
    TRUE
);

-- AS Mindmap Chapter 7: Transport of Plant
INSERT INTO study_resources (
    title, description, type, level, chapter, file_path, format, price,
    image, image1, image2, is_active
) VALUES (
    'AS Mindmap Chapter 7',
    'Mindmap for Chapter 7: Transport of Plant. Xylem and phloem structure, transpiration, translocation, and plant transport mechanisms.',
    'Mindmap',
    'AS',
    '7',
    '',
    'pdf',
    2.99,
    '/product/as-7.jpg',
    '/product/as-7-1.png',
    '/product/as-7-2.png',
    TRUE
);

-- AS Mindmap Chapter 8: Transport in mammals
INSERT INTO study_resources (
    title, description, type, level, chapter, file_path, format, price,
    image, image1, image2, is_active
) VALUES (
    'AS Mindmap Chapter 8',
    'Mindmap for Chapter 8: Transport in mammals. Circulatory system, heart structure, blood vessels, blood composition, and transport mechanisms.',
    'Mindmap',
    'AS',
    '8',
    '',
    'pdf',
    2.99,
    '/product/as-8.jpg',
    '/product/as-8-1.png',
    '/product/as-8-2.png',
    TRUE
);

-- AS Mindmap Chapter 9: Gas exchange
INSERT INTO study_resources (
    title, description, type, level, chapter, file_path, format, price,
    image, image1, image2, is_active
) VALUES (
    'AS Mindmap Chapter 9',
    'Mindmap for Chapter 9: Gas exchange. Respiratory system structure, ventilation, gas exchange surfaces, and gas transport.',
    'Mindmap',
    'AS',
    '9',
    '',
    'pdf',
    2.99,
    '/product/as-9.jpg',
    '/product/as-9-1.png',
    '/product/as-9-2.png',
    TRUE
);

-- AS Mindmap Chapter 10: Infectious diseases
INSERT INTO study_resources (
    title, description, type, level, chapter, file_path, format, price,
    image, image1, image2, is_active
) VALUES (
    'AS Mindmap Chapter 10',
    'Mindmap for Chapter 10: Infectious diseases. Pathogens, disease transmission, immune responses, and disease prevention.',
    'Mindmap',
    'AS',
    '10',
    '',
    'pdf',
    2.99,
    '/product/as-10.jpg',
    '/product/as-10-1.png',
    '/product/as-10-2.png',
    TRUE
);

-- AS Mindmap Chapter 11: Immunity
INSERT INTO study_resources (
    title, description, type, level, chapter, file_path, format, price,
    image, image1, image2, is_active
) VALUES (
    'AS Mindmap Chapter 11',
    'Mindmap for Chapter 11: Immunity. Immune system, antibodies, antigens, immune responses (primary and secondary), and vaccination.',
    'Mindmap',
    'AS',
    '11',
    '',
    'pdf',
    2.99,
    '/product/as-11.jpg',
    '/product/as-11-1.png',
    '/product/as-11-2.png',
    TRUE
);

-- =====================================================
-- A2 Level Mindmap 资源
-- =====================================================

-- A2 Mindmap 主页面（All chapters）
INSERT INTO study_resources (
    title, description, type, level, chapter, file_path, format, price,
    image, image1, image2, is_active
) VALUES (
    'A2 Mindmap',
    'Complete A2 Level Biology Mindmap covering all advanced topics. Comprehensive visual guide for A2 Level Biology exam preparation.',
    'Mindmap',
    'A2',
    'All',
    '',
    'pdf',
    12.99,
    '/product/a2mindmapmain.jpg',
    '/product/a2mindmapmain.jpg',
    '/product/a2mindmapmain.jpg',
    TRUE
);

-- A2 Mindmap Chapter 1: Energy and respiration (对应 Unit 12)
INSERT INTO study_resources (
    title, description, type, level, chapter, file_path, format, price,
    image, image1, image2, is_active
) VALUES (
    'A2 Mindmap Chapter 1',
    'Mindmap for Chapter 1: Energy and respiration. ATP synthesis, glycolysis, Krebs cycle, oxidative phosphorylation, and anaerobic respiration.',
    'Mindmap',
    'A2',
    '1',
    '',
    'pdf',
    3.99,
    '/product/a2-1.jpg',
    '/product/a2-1-1.png',
    '/product/a2-1-2.png',
    TRUE
);

-- A2 Mindmap Chapter 2: Photosynthesis (对应 Unit 13)
INSERT INTO study_resources (
    title, description, type, level, chapter, file_path, format, price,
    image, image1, image2, is_active
) VALUES (
    'A2 Mindmap Chapter 2',
    'Mindmap for Chapter 2: Photosynthesis. Light-dependent and light-independent reactions, chloroplast structure, Calvin cycle, and limiting factors.',
    'Mindmap',
    'A2',
    '2',
    '',
    'pdf',
    3.99,
    '/product/a2-2.jpg',
    '/product/a2-2-1.png',
    '/product/a2-2-2.png',
    TRUE
);

-- A2 Mindmap Chapter 3: Homeostasis (对应 Unit 14)
INSERT INTO study_resources (
    title, description, type, level, chapter, file_path, format, price,
    image, image1, image2, is_active
) VALUES (
    'A2 Mindmap Chapter 3',
    'Mindmap for Chapter 3: Homeostasis. Temperature regulation, blood glucose control, osmoregulation, and negative feedback mechanisms.',
    'Mindmap',
    'A2',
    '3',
    '',
    'pdf',
    3.99,
    '/product/a2-3.jpg',
    '/product/a2-3-1.png',
    '/product/a2-3-2.png',
    TRUE
);

-- A2 Mindmap Chapter 4: Control and coordination (对应 Unit 15)
INSERT INTO study_resources (
    title, description, type, level, chapter, file_path, format, price,
    image, image1, image2, is_active
) VALUES (
    'A2 Mindmap Chapter 4',
    'Mindmap for Chapter 4: Control and coordination. Nervous system, endocrine system, hormones, nerve impulses, and coordination mechanisms.',
    'Mindmap',
    'A2',
    '4',
    '',
    'pdf',
    3.99,
    '/product/a2-4.jpg',
    '/product/a2-4-1.png',
    '/product/a2-4-2.png',
    TRUE
);

-- A2 Mindmap Chapter 5: Inheritance (对应 Unit 16)
INSERT INTO study_resources (
    title, description, type, level, chapter, file_path, format, price,
    image, image1, image2, is_active
) VALUES (
    'A2 Mindmap Chapter 5',
    'Mindmap for Chapter 5: Inheritance. Mendelian genetics, monohybrid and dihybrid crosses, linkage, genetic diseases, and inheritance patterns.',
    'Mindmap',
    'A2',
    '5',
    '',
    'pdf',
    3.99,
    '/product/a2-5.jpg',
    '/product/a2-5-1.png',
    '/product/a2-5-2.png',
    TRUE
);

-- A2 Mindmap Chapter 6: Selection and evolution (对应 Unit 17)
INSERT INTO study_resources (
    title, description, type, level, chapter, file_path, format, price,
    image, image1, image2, is_active
) VALUES (
    'A2 Mindmap Chapter 6',
    'Mindmap for Chapter 6: Selection and evolution. Natural selection, variation, speciation, evolutionary mechanisms, and evidence for evolution.',
    'Mindmap',
    'A2',
    '6',
    '',
    'pdf',
    3.99,
    '/product/a2-6.jpg',
    '/product/a2-6-1.png',
    '/product/a2-6-2.png',
    TRUE
);

-- A2 Mindmap Chapter 7: Classification, biodiversity and conservation (对应 Unit 18)
INSERT INTO study_resources (
    title, description, type, level, chapter, file_path, format, price,
    image, image1, image2, is_active
) VALUES (
    'A2 Mindmap Chapter 7',
    'Mindmap for Chapter 7: Classification, biodiversity and conservation. Taxonomy, species classification, biodiversity measures, and conservation strategies.',
    'Mindmap',
    'A2',
    '7',
    '',
    'pdf',
    3.99,
    '/product/a2-7.jpg',
    '/product/a2-7-1.png',
    '/product/a2-7-2.png',
    TRUE
);

-- A2 Mindmap Chapter 8: Genetic technology (对应 Unit 19)
INSERT INTO study_resources (
    title, description, type, level, chapter, file_path, format, price,
    image, image1, image2, is_active
) VALUES (
    'A2 Mindmap Chapter 8',
    'Mindmap for Chapter 8: Genetic technology. DNA cloning, PCR, genetic engineering, recombinant DNA technology, and biotechnology applications.',
    'Mindmap',
    'A2',
    '8',
    '',
    'pdf',
    3.99,
    '/product/a2-8.jpg',
    '/product/a2-8-1.png',
    '/product/a2-8-2.png',
    TRUE
);

-- =====================================================
-- AS Level Syllabus Analysis 资源
-- =====================================================

-- AS Syllabus Analysis
INSERT INTO study_resources (
    title, description, type, level, chapter, file_path, format, price,
    image, image1, image2, is_active
) VALUES (
    'AS Syllabus Analysis',
    'Comprehensive AS Level Biology Syllabus Analysis. Detailed breakdown of syllabus requirements, learning objectives, exam focus areas, and study strategies for AS Level Biology.',
    'Syllabus Analysis',
    'AS',
    'All',
    '',
    'pdf',
    -1.00,  -- 会员专享
    '/product/assyllabusmain.jpg',
    '/product/assyllabusmain-1.jpg',
    '/product/assyllabusmain-2.jpg',
    TRUE
);

-- =====================================================
-- A2 Level Syllabus Analysis 资源
-- =====================================================

-- A2 Syllabus Analysis
INSERT INTO study_resources (
    title, description, type, level, chapter, file_path, format, price,
    image, image1, image2, is_active
) VALUES (
    'A2 Syllabus Analysis',
    'Comprehensive A2 Level Biology Syllabus Analysis. Advanced syllabus breakdown with detailed learning outcomes, exam preparation strategies, and topic prioritization for A2 Level Biology.',
    'Syllabus Analysis',
    'A2',
    'All',
    '',
    'pdf',
    -1.00,  -- 会员专享
    '/product/a2syllabusmain.jpg',
    '/product/a2syllabusmain-1.jpg',
    '/product/a2syllabusmain-2.jpg',
    TRUE
);

-- =====================================================
-- 验证插入结果
-- =====================================================

-- 查看所有插入的资源
-- SELECT id, title, type, level, chapter, price, is_active 
-- FROM study_resources 
-- ORDER BY type, level, 
--   CASE WHEN chapter = 'All' THEN 0 ELSE CAST(chapter AS INTEGER) END;

-- 统计各类型的资源数量
-- SELECT type, level, COUNT(*) as count 
-- FROM study_resources 
-- GROUP BY type, level 
-- ORDER BY type, level;

-- 查看图片路径是否正确
-- SELECT id, title, image, image1, image2 
-- FROM study_resources 
-- WHERE type = 'Mindmap' 
-- ORDER BY level, 
--   CASE WHEN chapter = 'All' THEN 0 ELSE CAST(chapter AS INTEGER) END;
