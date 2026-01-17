import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import FloatUI from '../../components/FloatUI';
import ViewContent from '../../components/ViewContent';

// 动态导入 MindmapView，禁用 SSR（因为 G6 需要在客户端运行）
const MindmapView = dynamic(() => import('../../components/MindmapView'), {
    ssr: false,
});

export default function ViewPage() {
    const router = useRouter();
    const { param } = router.query;
    const [selectedFile, setSelectedFile] = useState(null);
    const [content, setContent] = useState(null);
    const [mindmapData, setMindmapData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedUnitId, setSelectedUnitId] = useState(null);
    const [expandedSections, setExpandedSections] = useState(new Set());
    const [expandedItems, setExpandedItems] = useState(new Set());
    const [interactiveMode, setInteractiveMode] = useState('none');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [mindmapNodeTree, setMindmapNodeTree] = useState(null);
    const [mindmapTitle, setMindmapTitle] = useState(null);

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
            // 提取章节号 - 支持多种格式：Chapter 1, Chapter1, chapter 1 等
            const chapterMatch = decodedParam.match(/chapter[\s]*(\d+)/i);
            // 如果没找到，尝试直接找数字（可能是章节号）
            let chapter = chapterMatch ? chapterMatch[1] : null;
            if (!chapter) {
                const numberMatch = decodedParam.match(/(?:^|\s)(\d+)(?:\s|$)/);
                chapter = numberMatch ? numberMatch[1] : '1'; // 默认为 Chapter 1
            }
            console.log('✅ 识别为mindmap:', level, '章节:', chapter);
            return { type: 'mindmap', level, chapter, hasViewContent: true };
        }
        
        console.log('❌ 无法识别资源类型');
        return { type: null, level: null, hasViewContent: false };
    };

    // 定义章节数据（避免重复）
    const AS_CHAPTERS = [
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

    const A2_CHAPTERS = [
        { id: '12', name: 'Energy and respiration', file: '12_Energy_and_respiration.json' },
        { id: '13', name: 'Photosynthesis', file: '13_Photosynthesis.json' },
        { id: '14', name: 'Homeostasis', file: '14_Homeostasis.json' },
        { id: '15', name: 'Control and coordination', file: '15_Control_and_coordination.json' },
        { id: '16', name: 'Inheritance', file: '16_Inheritance.json' },
        { id: '17', name: 'Selection and evolution', file: '17_Selection_and_evolution.json' },
        { id: '18', name: 'Classification biodiversity and conservation', file: '18_Classification_biodiversity_and_conservation.json' },
        { id: '19', name: 'Genetic technology', file: '19_Genetic_technology.json' }
    ];

    // 根据类型和级别定义可用的JSON文件
    const getAvailableFiles = (type, level) => {
        if (!type || !level) return [];
        
        // syllabus-analysis 和 mindmap 使用相同的章节列表
        if (type === 'syllabus-analysis' || type === 'mindmap') {
            return level === 'as' ? AS_CHAPTERS : level === 'a2' ? A2_CHAPTERS : [];
        }
        
        return [];
    };

    // 使用 useMemo 优化 resourceInfo 和 availableFiles 的计算
    const resourceInfo = useMemo(() => {
        return router.isReady ? getResourceInfo(param) : { type: null, level: null, hasViewContent: false };
    }, [router.isReady, param]);
    
    const availableFiles = useMemo(() => {
        return router.isReady ? getAvailableFiles(resourceInfo.type, resourceInfo.level) : [];
    }, [router.isReady, resourceInfo.type, resourceInfo.level]);

    // 通用的认证检查函数
    const checkAuth = useCallback(async () => {
        try {
            const authCheck = await fetch('/api/auth/check', {
                method: 'GET',
                credentials: 'include'
            });
            
            if (!authCheck.ok) {
                throw new Error(`Auth check failed with status: ${authCheck.status}`);
            }
            
            const authData = await authCheck.json();
            
            if (!authData.isAuthenticated) {
                return { success: false, error: "View Content Not Available" };
            }
            
            return { success: true, authData };
        } catch (err) {
            console.error('Auth check error:', err);
            if (err.message.includes('Network error') || err.message.includes('fetch')) {
                return { success: false, error: "Network error: Unable to verify authentication" };
            }
            return { success: false, error: "Invalid response from authentication service" };
        }
    }, []);

    // 通用的权限检查函数
    const checkPermission = useCallback(async (resourceType) => {
        try {
            const permissionCheck = await fetch(`/api/check-resource-access?resourceType=${encodeURIComponent(resourceType)}`, {
                method: 'GET',
                credentials: 'include'
            });
            
            if (!permissionCheck.ok) {
                throw new Error(`Permission check failed with status: ${permissionCheck.status}`);
            }
            
            const permissionData = await permissionCheck.json();
            
            if (!permissionData.hasAccess) {
                return { success: false, error: resourceType === 'Mindmap' 
                    ? "Membership required to access mindmap content" 
                    : "Access denied" };
            }
            
            return { success: true, permissionData };
        } catch (err) {
            console.error('Permission check error:', err);
            return { success: false, error: "Network error: Unable to verify permissions" };
        }
    }, []);

    // 通用的 fetch 错误处理函数
    const handleFetchError = useCallback(async (response, defaultMessage) => {
        const errorText = await response.text();
        let errorMessage = `${defaultMessage} (${response.status})`;
        try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.error || errorMessage;
            if (errorJson.details) {
                errorMessage += `: ${errorJson.details}`;
            } else if (errorJson.message) {
                errorMessage += `: ${errorJson.message}`;
            }
        } catch {
            errorMessage = errorText || errorMessage;
        }
        return errorMessage;
    }, []);

    const loadContent = useCallback(async (fileName) => {
        setLoading(true);
        setError(null);
        
        try {
            // 检查认证
            const authResult = await checkAuth();
            if (!authResult.success) {
                setError(authResult.error);
                setLoading(false);
                return;
            }
            
            // 加载内容
            const response = await fetch(`/api/getViewContent?file=${encodeURIComponent(fileName)}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                const errorMessage = await handleFetchError(response, 'Failed to load content');
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            setContent(data);
        } catch (err) {
            const errorMessage = err.message || 'Unknown error occurred';
            setError(errorMessage);
            console.error('Error loading content:', err);
        } finally {
            setLoading(false);
        }
    }, [checkAuth, handleFetchError]);

    // 加载 mindmap 数据
    const loadMindmapData = useCallback(async (level, chapter) => {
        setLoading(true);
        setError(null);
        
        try {
            // 检查认证
            const authResult = await checkAuth();
            if (!authResult.success) {
                setError(authResult.error);
                setLoading(false);
                return;
            }

            // 检查 mindmap 会员权限
            const permissionResult = await checkPermission('Mindmap');
            if (!permissionResult.success) {
                setError(permissionResult.error);
                setLoading(false);
                return;
            }
            
            // 加载 mindmap JSON 数据
            const apiUrl = `/api/getMindmapData?level=${encodeURIComponent(level)}&chapter=${encodeURIComponent(chapter || '1')}`;
            console.log('Fetching mindmap data from:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const errorMessage = await handleFetchError(response, 'Failed to load mindmap data');
                throw new Error(errorMessage);
            }

            const data = await response.json();
            setMindmapData(data);
        } catch (err) {
            const errorMessage = err.message || 'Unknown error occurred';
            setError(errorMessage);
            console.error('Error loading mindmap data:', err);
        } finally {
            setLoading(false);
        }
    }, [checkAuth, checkPermission, handleFetchError]);

    const handleFileSelect = useCallback((file) => {
        setSelectedFile(file);
        setSelectedUnitId(file.id);
        loadContent(file.file);
    }, [loadContent]);

    const handleUnitChange = useCallback((unit) => {
        // 如果是 mindmap 类型，切换章节时重新加载 mindmap 数据
        if (resourceInfo.type === 'mindmap') {
            const chapterId = typeof unit === 'string' ? unit : (unit?.id || '1');
            const foundUnit = availableFiles.find(u => u.id === chapterId);
            if (foundUnit) {
                setSelectedFile(foundUnit);
                setSelectedUnitId(foundUnit.id);
                loadMindmapData(resourceInfo.level, chapterId);
            }
            return;
        }
        
        // 非 mindmap 类型的原有逻辑
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
    }, [resourceInfo.type, resourceInfo.level, availableFiles, loadMindmapData, loadContent]);

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

    // 当识别为 mindmap 类型时，自动加载数据
    useEffect(() => {
        if (router.isReady && resourceInfo.type === 'mindmap' && resourceInfo.level) {
            const chapter = resourceInfo.chapter || '1';
            loadMindmapData(resourceInfo.level, chapter);
            // 设置默认选中的章节
            if (availableFiles.length > 0) {
                const chapterFile = availableFiles.find(f => f.id === chapter);
                if (chapterFile) {
                    setSelectedFile(chapterFile);
                    setSelectedUnitId(chapterFile.id);
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.isReady, resourceInfo.type, resourceInfo.level, resourceInfo.chapter, loadMindmapData]);

    // 默认加载第一个Unit（仅适用于非 mindmap 类型）
    useEffect(() => {
        if (router.isReady && 
            resourceInfo.type !== 'mindmap' && 
            resourceInfo.type !== null &&
            availableFiles.length > 0 && 
            !selectedFile) {
            const firstUnit = availableFiles[0];
            setSelectedFile(firstUnit);
            setSelectedUnitId(firstUnit.id);
            loadContent(firstUnit.file);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.isReady, resourceInfo.type, availableFiles.length, selectedFile, loadContent]);

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

    // 如果类型是mindmap，显示思维导图
    if (resourceInfo.type === 'mindmap') {
        return (
            <div className="relative w-full h-screen overflow-hidden">
                <Head>
                    <title>BioByte - {resourceInfo.level?.toUpperCase()} Mindmap Chapter {resourceInfo.chapter || '1'}</title>
                    <meta name="description" content={`View ${resourceInfo.level} mindmap for chapter ${resourceInfo.chapter || '1'}`} />
                    <meta name="robots" content="noindex, nofollow" />
                    <link rel="canonical" href={`https://www.biobyte.shop${cleanPath}`} />
                </Head>
                
                {/* 全屏思维导图区域 */}
                <div className="absolute inset-0 bg-gray-50">
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
                                            {error === "View Content Not Available" ? "View Content Not Available" : 
                                             error === "Membership required to access mindmap content" ? "Membership Required" : 
                                             error.includes("Mindmap not available") || error.includes("not yet available") ? "Mindmap Not Available" :
                                             "Error"}
                                        </h1>
                                        <p className="text-gray-700 mb-6">
                                            {error === "View Content Not Available" 
                                                ? "Please log in to access this content." 
                                                : error === "Membership required to access mindmap content"
                                                ? "You need a membership to access mindmap content. Please upgrade your account."
                                                : error.includes("not yet available")
                                                ? "This mindmap chapter is currently under development. Please check back later."
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
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {!error && (
                        <MindmapView 
                            data={mindmapData} 
                            loading={loading}
                            onNodeTreeReady={(tree) => {
                                setMindmapNodeTree(tree);
                            }}
                            onFocusNode={true}
                        />
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
                    mindmapNodeTree={mindmapNodeTree}
                    mindmapTitle={mindmapTitle || (resourceInfo.level && resourceInfo.chapter ? `${resourceInfo.level.toUpperCase()} Mindmap Chapter ${resourceInfo.chapter}` : null)}
                    isMindmap={true}
                />
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
                isMindmap={false}
            />
        </div>
    );
}
