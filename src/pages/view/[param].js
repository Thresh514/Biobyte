import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import TopLeftHeader from '../../components/TopLeftHeader';
import TopRightHeader from '../../components/TopRightHeader';
import LeftSidebar from '../../components/LeftSidebar';

export default function ViewPage() {
    const router = useRouter();
    const { param } = router.query;
    const [selectedFile, setSelectedFile] = useState(null);
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedUnitId, setSelectedUnitId] = useState(null);
    const [expandedSections, setExpandedSections] = useState(new Set());
    const [expandedItems, setExpandedItems] = useState(new Set());
    const [highlightSettings, setHighlightSettings] = useState({ mode: 'none', color: '#ffeb3b' });

    // 添加页面淡入动画效果
    useEffect(() => {
        document.body.classList.add('fade-in');
        return () => {
            document.body.classList.remove('fade-in');
        };
    }, []);

    // 获取干净的规范URL路径
    const cleanPath = useMemo(() => {
        if (!router.asPath) return "";
        return router.asPath.split(/[?#]/)[0];
    }, [router.asPath]);

    // 根据URL参数确定类型和级别
    const getResourceInfo = (param) => {
        if (!param) return { type: null, level: null, hasViewContent: false };
        
        const decodedParam = decodeURIComponent(param);
        console.log('🔍 解析参数:', decodedParam);
        
        // 判断是否为syllabus analysis
        if (decodedParam.toLowerCase().includes('syllabus')) {
            const level = decodedParam.toLowerCase().includes('a2') ? 'a2' : 'as';
            console.log('✅ 识别为syllabus-analysis:', level);
            return { type: 'syllabus-analysis', level, hasViewContent: true };
        }
        
        // 判断是否为mindmap
        if (decodedParam.toLowerCase().includes('mindmap')) {
            const level = decodedParam.toLowerCase().includes('a2') ? 'a2' : 'as';
            console.log('✅ 识别为mindmap:', level);
            return { type: 'mindmap', level, hasViewContent: false };
        }
        
        console.log('❌ 无法识别资源类型');
        return { type: null, level: null, hasViewContent: false };
    };

    // 根据类型和级别定义可用的JSON文件
    const getAvailableFiles = (type, level) => {
        if (type === 'syllabus-analysis') {
            if (level === 'as') {
                return [
                    { id: '1', name: 'Cell structure', file: '1_Cell_structure.json' },
                    { id: '2', name: 'Biological molecules', file: '2_Biological_molecules.json' },
                    { id: '3', name: 'Enzymes', file: '3_Enzymes.json' },
                    { id: '4', name: 'Cell membranes and transport', file: '4_Cell_membranes_and_transport.json' },
                    { id: '5', name: 'The mitotic cell cycle', file: '5_The_mitotic_cell_cycle.json' },
                    { id: '6', name: 'Nucleic acids and protein synthesis', file: '6_Nucleic_acids_and_protein_synthesis.json' },
                    { id: '7', name: 'Transport of Plant', file: '7_Transport_of_Plant.json' },
                    { id: '8', name: 'Transport in mammals', file: '8_Transport_in_mammals.json' },
                    { id: '9', name: 'Gas exchange', file: '9_Gas_exchange.json' },
                    { id: '10', name: 'Infectious diseases', file: '10_Infectious_diseases.json' },
                    { id: '11', name: 'Immunity', file: '11_Immunity.json' }
                ];
            } else if (level === 'a2') {
                return [
                    { id: '12', name: 'Energy and respiration', file: '12_Energy_and_respiration.json' },
                    { id: '13', name: 'Photosynthesis', file: '13_Photosynthesis.json' },
                    { id: '14', name: 'Homeostasis', file: '14_Homeostasis.json' },
                    { id: '15', name: 'Control and coordination', file: '15_Control_and_coordination.json' },
                    { id: '16', name: 'Inheritance', file: '16_Inheritance.json' },
                    { id: '17', name: 'Selection and evolution', file: '17_Selection_and_evolution.json' },
                    { id: '18', name: 'Classification biodiversity and conservation', file: '18_Classification_biodiversity_and_conservation.json' },
                    { id: '19', name: 'Genetic technology', file: '19_Genetic_technology.json' }
                ];
            }
        }
        return [];
    };

    const resourceInfo = router.isReady ? getResourceInfo(param) : { type: null, level: null, hasViewContent: false };
    const availableFiles = router.isReady ? getAvailableFiles(resourceInfo.type, resourceInfo.level) : [];

    const loadContent = async (fileName) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`/api/getViewContent?file=${encodeURIComponent(fileName)}`);
            if (!response.ok) {
                throw new Error('Failed to load content');
            }
            const data = await response.json();
            setContent(data);
        } catch (err) {
            setError(err.message);
            console.error('Error loading content:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (file) => {
        setSelectedFile(file);
        setSelectedUnitId(file.id);
        loadContent(file.file);
    };

    const handleUnitChange = (unit) => {
        setSelectedFile(unit);
        setSelectedUnitId(unit.id);
        loadContent(unit.file);
    };

    const handleHighlightChange = (settings) => {
        setHighlightSettings(settings);
    };

    const handleUndo = () => {
        // TODO: 实现撤销功能
        console.log('Undo clicked');
    };

    const handleRedo = () => {
        // TODO: 实现重做功能
        console.log('Redo clicked');
    };

    // 默认加载第一个Unit
    useEffect(() => {
        if (router.isReady && availableFiles.length > 0 && !selectedFile) {
            const firstUnit = availableFiles[0];
            setSelectedFile(firstUnit);
            setSelectedUnitId(firstUnit.id);
            loadContent(firstUnit.file);
        }
    }, [router.isReady, availableFiles, selectedFile]);

    // 默认展开所有sections和items
    useEffect(() => {
        if (content?.content) {
            const allSections = new Set();
            const allItems = new Set();
            
            content.content.forEach((section, sectionIndex) => {
                allSections.add(sectionIndex);
                section.items?.forEach((item, itemIndex) => {
                    allItems.add(`${sectionIndex}-${itemIndex}`);
                });
            });
            
            setExpandedSections(allSections);
            setExpandedItems(allItems);
        }
    }, [content]);

    // 格式化文本函数
    const formatText = (text) => {
        if (typeof text !== 'string') return text;
        
        let formatted = text;
        
        // 处理粗体 **text**
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
        
        // 处理斜体 *text*
        formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic text-gray-800">$1</em>');
        
        // 处理项目符号 • 或 -
        formatted = formatted.replace(/^[\s]*[•\-]\s*(.+)$/gm, '<div class="flex items-start mb-2"><span class="text-gray-500 mr-3 mt-1 flex-shrink-0 text-sm">•</span><span class="flex-1 text-gray-700 leading-relaxed">$1</span></div>');
        
        // 处理数字列表 1. 2. 3.
        formatted = formatted.replace(/^[\s]*(\d+)\.\s*(.+)$/gm, '<div class="flex items-start mb-2"><span class="text-gray-600 mr-3 mt-1 flex-shrink-0 font-medium text-sm">$1.</span><span class="flex-1 text-gray-700 leading-relaxed">$2</span></div>');
        
        // 处理字母列表 a. b. c.
        formatted = formatted.replace(/^[\s]*([a-z])\.\s*(.+)$/gm, '<div class="flex items-start mb-2 ml-4"><span class="text-gray-500 mr-3 mt-1 flex-shrink-0 text-sm">$1.</span><span class="flex-1 text-gray-700 leading-relaxed">$2</span></div>');
        
        // 处理缩进（以2个或更多空格开头）
        formatted = formatted.replace(/^(\s{2,})(.+)$/gm, '<div class="ml-6 mb-2 text-gray-600 leading-relaxed">$2</div>');
        
        // 处理空行
        formatted = formatted.replace(/\n\s*\n/g, '<div class="mb-3"></div>');
        
        // 处理普通换行
        formatted = formatted.replace(/\n/g, '<br>');
        
        return formatted;
    };

    const toggleSection = (sectionIndex) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(sectionIndex)) {
            newExpanded.delete(sectionIndex);
        } else {
            newExpanded.add(sectionIndex);
        }
        setExpandedSections(newExpanded);
    };

    const toggleItem = (sectionIndex, itemIndex) => {
        const key = `${sectionIndex}-${itemIndex}`;
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(key)) {
            newExpanded.delete(key);
        } else {
            newExpanded.add(key);
        }
        setExpandedItems(newExpanded);
    };

    // 等待路由准备就绪
    if (!router.isReady) {
        return <div>Loading...</div>;
    }

    // 如果类型是mindmap，显示不支持view的提示
    if (resourceInfo.type === 'mindmap') {
        return (
            <div>
                <Head>
                    <title>BioByte - View Not Available</title>
                    <meta name="description" content="View content not available for mindmap resources" />
                    <link rel="canonical" href={`https://www.biobyte.shop${cleanPath}`} />
                </Head>
                
                <TopLeftHeader 
                    currentUnit={null}
                    onUndo={() => {}}
                    onRedo={() => {}}
                />
                <TopRightHeader />
                <LeftSidebar 
                    availableUnits={[]}
                    selectedUnitId={null}
                    onUnitChange={() => {}}
                    onHighlightChange={() => {}}
                />
                
                <main className="pt-16 min-h-screen">
                    <div className="max-w-5xl mx-auto px-6 py-12">
                        <div className="bg-white border border-gray-200 rounded-lg shadow-md p-8 text-center">
                            <div className="mb-6">
                                <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <h1 className="text-2xl font-bold text-darker mb-2">
                                    View Content Not Available
                                </h1>
                                <p className="text-gray-700 mb-6">
                                    Mindmap resources do not have viewable content. Please download the PDF files to view the mindmaps.
                                </p>
                                <div className="text-sm text-gray-500 mb-6">
                                    Resource: {decodeURIComponent(param || '')}
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <button
                                    onClick={() => router.back()}
                                    className="bg-white text-black border border-black px-6 py-3 hover:bg-black hover:text-white transition duration-300"
                                >
                                    Go Back
                                </button>
                                <div className="text-sm text-gray-500">
                                    Mindmap resources are available as downloadable PDF files
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // 如果没有可用的文件，显示错误
    if (!resourceInfo.hasViewContent || availableFiles.length === 0) {
        return (
            <div>
                <Head>
                    <title>BioByte - No Content Available</title>
                    <meta name="description" content="No content available for this resource" />
                    <link rel="canonical" href={`https://www.biobyte.shop${cleanPath}`} />
                </Head>
                
                <TopLeftHeader 
                    currentUnit={null}
                    onUndo={() => {}}
                    onRedo={() => {}}
                />
                <TopRightHeader />
                <LeftSidebar 
                    availableUnits={[]}
                    selectedUnitId={null}
                    onUnitChange={() => {}}
                    onHighlightChange={() => {}}
                />
                
                <main className="pt-16 min-h-screen">
                    <div className="max-w-5xl mx-auto px-6 py-12">
                        <div className="bg-white border border-gray-200 rounded-lg shadow-md p-8 text-center">
                            <div className="mb-6">
                                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h1 className="text-2xl font-bold text-darker mb-2">
                                    No Content Available
                                </h1>
                                <p className="text-gray-700 mb-6">
                                    No viewable content is available for this resource.
                                </p>
                                <div className="text-sm text-gray-500 mb-6">
                                    Resource: {decodeURIComponent(param || '')}
                                </div>
                            </div>
                            
                            <button
                                onClick={() => router.back()}
                                className="bg-white text-black border border-black px-6 py-3 hover:bg-black hover:text-white transition duration-300"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gray-100">
            <Head>
                <title>BioByte - {resourceInfo.type?.toUpperCase()} {resourceInfo.level?.toUpperCase()} View</title>
                <meta name="description" content={`View ${resourceInfo.type} content for ${resourceInfo.level} level`} />
                <link rel="canonical" href={`https://www.biobyte.shop${cleanPath}`} />
            </Head>
            
            {/* 悬浮工具栏 */}
            <TopLeftHeader 
                currentUnit={selectedFile}
                onUndo={handleUndo}
                onRedo={handleRedo}
            />
            <TopRightHeader />
            <LeftSidebar 
                availableUnits={availableFiles}
                selectedUnitId={selectedUnitId}
                onUnitChange={handleUnitChange}
                onHighlightChange={handleHighlightChange}
            />
            
            {/* 主要内容区域 */}
            <div className="flex-1 flex overflow-hidden pt-16 pl-80">
                {loading && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                    </div>
                )}
                
                {error && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-red-600 mb-2">Error loading content</div>
                            <div className="text-gray-600 text-sm">{error}</div>
                        </div>
                    </div>
                )}
                
                {!loading && !error && (
                    <>
                        

                        {/* 右侧内容区 */}
                        <div className="flex overflow-y-auto">
                            {content ? (
                                <div className="p-6">
                                    {/* 标题 */}
                                    <div className="mb-8 border-b border-gray-200 pb-6">
                                        <h1 className="text-2xl font-bold text-darker mb-2">
                                            Unit {content.unit}: {content.title}
                                        </h1>
                                        <div className="text-sm text-gray-600">
                                            {content.content?.length || 0} sections available
                                        </div>
                                    </div>

                                    {/* 内容列表 */}
                                    <div className="space-y-6">
                                        {content.content?.map((section, sectionIndex) => (
                                            <div key={sectionIndex} className="border border-gray-200 rounded-lg overflow-hidden shadow-md">
                                                {/* 章节标题 */}
                                                <button
                                                    onClick={() => toggleSection(sectionIndex)}
                                                    className="w-full px-6 py-4 bg-white hover:bg-gray-50 transition-colors text-left border-b border-gray-100"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <h2 className="text-lg font-semibold text-darker">
                                                            {section.section}
                                                        </h2>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-sm text-gray-500">
                                                                {section.items?.length || 0} items
                                                            </span>
                                                            <svg
                                                                className={`w-5 h-5 text-gray-500 transition-transform ${
                                                                    expandedSections.has(sectionIndex) ? 'rotate-180' : ''
                                                                }`}
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M19 9l-7 7-7-7"
                                                                />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </button>

                                                {/* 章节内容 */}
                                                {expandedSections.has(sectionIndex) && (
                                                    <div className="p-6 bg-gray-50">
                                                        <div className="space-y-4">
                                                            {section.items?.map((item, itemIndex) => (
                                                                <div key={itemIndex} className="border border-gray-200 rounded-lg bg-white shadow-sm">
                                                                    {/* 项目标题 */}
                                                                    <button
                                                                        onClick={() => toggleItem(sectionIndex, itemIndex)}
                                                                        className="w-full px-4 py-3 bg-white hover:bg-gray-50 transition-colors text-left border-b border-gray-100"
                                                                    >
                                                                        <div className="flex items-center justify-between">
                                                                            <h3 className="text-sm font-medium text-darker pr-4">
                                                                                {item.title}
                                                                            </h3>
                                                                            <svg
                                                                                className={`w-4 h-4 text-gray-600 transition-transform flex-shrink-0 ${
                                                                                    expandedItems.has(`${sectionIndex}-${itemIndex}`) ? 'rotate-180' : ''
                                                                                }`}
                                                                                fill="none"
                                                                                stroke="currentColor"
                                                                                viewBox="0 0 24 24"
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth={2}
                                                                                    d="M19 9l-7 7-7-7"
                                                                                />
                                                                            </svg>
                                                                        </div>
                                                                    </button>

                                                                    {/* 项目内容 */}
                                                                    {expandedItems.has(`${sectionIndex}-${itemIndex}`) && (
                                                                        <div className="p-4 bg-white">
                                                                            <div className="space-y-3">
                                                                                {item.content?.map((contentItem, contentIndex) => (
                                                                                    <div
                                                                                        key={contentIndex}
                                                                                        className="text-sm text-gray-700"
                                                                                        dangerouslySetInnerHTML={{ __html: formatText(contentItem) }}
                                                                                    />
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <div className="text-lg mb-2">请选择一个章节查看内容</div>
                                        <div className="text-sm">从左侧导航栏选择Unit</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
