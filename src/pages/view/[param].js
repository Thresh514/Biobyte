import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ViewContent from '../../components/ViewContent';

export default function ViewPage() {
    const router = useRouter();
    const { param } = router.query;
    const [selectedFile, setSelectedFile] = useState(null);
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 等待路由准备就绪
    if (!router.isReady) {
        return <div>Loading...</div>;
    }

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

    const resourceInfo = getResourceInfo(param);
    const availableFiles = getAvailableFiles(resourceInfo.type, resourceInfo.level);

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
        loadContent(file.file);
    };

    // 如果类型是mindmap，显示不支持view的提示
    if (resourceInfo.type === 'mindmap') {
        return (
            <div>
                <Head>
                    <title>BioByte - View Not Available</title>
                    <meta name="description" content="View content not available for mindmap resources" />
                </Head>
                
                <Navbar />
                
                <main className="pt-32 md:pt-48 min-h-screen bg-gray-50">
                    <div className="max-w-4xl mx-auto p-4 md:p-8">
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                            <div className="mb-6">
                                <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    View Content Not Available
                                </h1>
                                <p className="text-gray-600 mb-6">
                                    Mindmap resources do not have viewable content. Please download the PDF files to view the mindmaps.
                                </p>
                                <div className="text-sm text-gray-500 mb-6">
                                    Resource: {decodeURIComponent(param || '')}
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <button
                                    onClick={() => router.back()}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
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
                
                <Footer />
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
                </Head>
                
                <Navbar />
                
                <main className="pt-32 md:pt-48 min-h-screen bg-gray-50">
                    <div className="max-w-4xl mx-auto p-4 md:p-8">
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                            <div className="mb-6">
                                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    No Content Available
                                </h1>
                                <p className="text-gray-600 mb-6">
                                    No viewable content is available for this resource.
                                </p>
                                <div className="text-sm text-gray-500 mb-6">
                                    Resource: {decodeURIComponent(param || '')}
                                </div>
                            </div>
                            
                            <button
                                onClick={() => router.back()}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </main>
                
                <Footer />
            </div>
        );
    }

    return (
        <div>
            <Head>
                <title>BioByte - {resourceInfo.type?.toUpperCase()} {resourceInfo.level?.toUpperCase()} View</title>
                <meta name="description" content={`View ${resourceInfo.type} content for ${resourceInfo.level} level`} />
            </Head>
            
            <Navbar />
            
            <main className="pt-32 md:pt-48 min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto p-4 md:p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {resourceInfo.type?.toUpperCase()} {resourceInfo.level?.toUpperCase()} View
                        </h1>
                        <p className="text-gray-600">
                            Select a topic to view detailed {resourceInfo.type} content
                        </p>
                        <div className="text-sm text-gray-500 mt-2">
                            From: {decodeURIComponent(param || '')}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* 左侧文件选择器 */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-md p-6 sticky top-32">
                                <h2 className="text-lg font-semibold mb-4 text-gray-800">Topics</h2>
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {availableFiles.map((file) => (
                                        <button
                                            key={file.id}
                                            onClick={() => handleFileSelect(file)}
                                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                                                selectedFile?.id === file.id
                                                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                                            }`}
                                        >
                                            <div className="font-medium text-sm">
                                                Unit {file.id}
                                            </div>
                                            <div className="text-xs text-gray-600 mt-1">
                                                {file.name}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 右侧内容显示区域 */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-lg shadow-md min-h-96">
                                {loading && (
                                    <div className="flex items-center justify-center h-64">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                    </div>
                                )}
                                
                                {error && (
                                    <div className="p-8 text-center">
                                        <div className="text-red-600 mb-2">Error loading content</div>
                                        <div className="text-gray-600 text-sm">{error}</div>
                                    </div>
                                )}
                                
                                {!loading && !error && !content && (
                                    <div className="p-8 text-center text-gray-500">
                                        <div className="text-lg mb-2">Welcome to BioByte View</div>
                                        <div className="text-sm">Select a topic from the left to view its content</div>
                                    </div>
                                )}
                                
                                {!loading && !error && content && (
                                    <ViewContent data={content} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
            <Footer />
        </div>
    );
}
