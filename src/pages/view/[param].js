import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import FloatUI from '../../components/FloatUI';
import ViewContent from '../../components/ViewContent';

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
    const [interactiveMode, setInteractiveMode] = useState('none');
    const [isFullscreen, setIsFullscreen] = useState(false);

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
            // 首先检查用户登录状态和权限
            const authCheck = await fetch('/api/auth/check', {
                method: 'GET',
                credentials: 'include'
            });
            const authData = await authCheck.json();
            
            if (!authData.isAuthenticated) {
                // 未登录用户显示权限错误
                setError("View Content Not Available");
                setLoading(false);
                return;
            }
            
            // 检查具体权限（syllabus vs mindmap）
            if (resourceInfo.type === 'syllabus-analysis') {
                // Syllabus Analysis: 登录用户可以访问
                // 继续加载内容
            } else {
                // 其他资源类型的权限检查可以在这里添加
            }
            
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
        // 如果传入的是 unit ID，需要找到对应的 unit 对象
        if (typeof unit === 'string') {
            const foundUnit = availableFiles.find(u => u.id === unit);
            if (foundUnit) {
                setSelectedFile(foundUnit);
                setSelectedUnitId(foundUnit.id);
                loadContent(foundUnit.file);
            }
        } else if (unit && unit.id && unit.file) {
            // 如果传入的是完整的 unit 对象
            setSelectedFile(unit);
            setSelectedUnitId(unit.id);
            loadContent(unit.file);
        }
    };

    const handleInteractiveModeChange = (mode) => {
        setInteractiveMode(mode);
    };

    const handleUndo = () => {
        // TODO: 实现撤销功能
        console.log('Undo clicked');
    };

    const handleRedo = () => {
        // TODO: 实现重做功能
        console.log('Redo clicked');
    };

    const handleFullscreenToggle = () => {
        setIsFullscreen(!isFullscreen);
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
                    <meta name="robots" content="noindex, nofollow" />
                    <link rel="canonical" href={`https://www.biobyte.shop${cleanPath}`} />
                </Head>
                
                <FloatUI
                    availableUnits={[]}
                    selectedUnitId={null}
                    onUnitChange={() => {}}
                    onInteractiveModeChange={() => {}}
                    onFullscreenToggle={() => {}}
                    isFullscreen={false}
                    onUndo={() => {}}
                    onRedo={() => {}}
                    currentUnit={null}
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
                    <meta name="robots" content="noindex, nofollow" />
                    <link rel="canonical" href={`https://www.biobyte.shop${cleanPath}`} />
                </Head>
                
                <FloatUI
                    availableUnits={[]}
                    selectedUnitId={null}
                    onUnitChange={() => {}}
                    onInteractiveModeChange={() => {}}
                    onFullscreenToggle={() => {}}
                    isFullscreen={false}
                    onUndo={() => {}}
                    onRedo={() => {}}
                    currentUnit={null}
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
        <div className="relative w-full h-screen overflow-hidden">
            <Head>
                <title>BioByte - {resourceInfo.type?.toUpperCase()} {resourceInfo.level?.toUpperCase()} View</title>
                <meta name="description" content={`View ${resourceInfo.type} content for ${resourceInfo.level} level`} />
                <meta name="robots" content="noindex, nofollow" />
                <link rel="canonical" href={`https://www.biobyte.shop${cleanPath}`} />
            </Head>
            
            {/* 画布层 - 全屏内容区域 */}
            <div className="absolute inset-0 bg-gray-100 overflow-auto">
                {loading && (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                    </div>
                )}
                
                {error && (
                    <div className="flex items-center justify-center h-full">
                        <div className="max-w-lg mx-auto px-6 py-12 text-center">
                            <div className="bg-white border border-gray-200 rounded-lg shadow-md p-8">
                                <div className="mb-6">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h1 className="text-2xl font-bold text-darker mb-2">
                                        {error === "View Content Not Available" ? "View Content Not Available" : "Error"}
                                    </h1>
                                    <p className="text-gray-700 mb-6">
                                        {error === "View Content Not Available" 
                                            ? "Please log in to access this content." 
                                            : error
                                        }
                                    </p>
                                </div>
                                
                                <div className="space-y-4">
                                    <button
                                        onClick={() => router.back()}
                                        className="bg-white text-black border border-black px-6 py-3 hover:bg-black hover:text-white transition duration-300"
                                    >
                                        Go Back
                                    </button>
                                    {error === "View Content Not Available" && (
                                        <div className="text-sm text-gray-500">
                                            Please log in to your account to access the content
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {content && !loading && !error && (
                    <div>
                        <ViewContent 
                            data={content}
                            availableUnits={availableFiles}
                            onUnitChange={handleUnitChange}
                            selectedUnitId={selectedUnitId}
                            interactiveMode={interactiveMode}
                        />
                    </div>
                )}
            </div>

            {/* 悬浮UI层 */}
            <FloatUI
                availableUnits={availableFiles}
                selectedUnitId={selectedUnitId}
                onUnitChange={handleUnitChange}
                onInteractiveModeChange={handleInteractiveModeChange}
                onFullscreenToggle={handleFullscreenToggle}
                isFullscreen={isFullscreen}
                onUndo={handleUndo}
                onRedo={handleRedo}
                currentUnit={selectedFile}
            />
        </div>
    );
}
