import { useState, useEffect } from 'react';
import { Minus, Plus, Maximize, Minimize, HelpCircle } from 'lucide-react';

const BottomRightControlBar = ({ onFullscreenToggle, isFullscreen, isMindmap = false }) => {
    const [zoomLevel, setZoomLevel] = useState(100);
    const [showGuide, setShowGuide] = useState(false);

    // 监听思维导图的缩放变化（当用户通过鼠标滚轮缩放时）
    useEffect(() => {
        if (isMindmap) {
            const handleZoomChange = (event) => {
                setZoomLevel(event.detail.zoom);
            };
            
            window.addEventListener('mindmapZoomChange', handleZoomChange);
            
            // 初始化时获取当前缩放级别
            const initZoom = () => {
                if (window.mindmapGraph) {
                    try {
                        const currentZoom = window.mindmapGraph.getZoom();
                        if (currentZoom !== undefined && currentZoom !== null) {
                            setZoomLevel(Math.round(currentZoom * 100));
                        }
                    } catch (e) {
                        console.debug('Failed to get initial zoom:', e);
                    }
                }
            };
            
            // 立即尝试获取
            initZoom();
            
            // 如果 graph 还没准备好，等待一下再试
            const initTimer = setTimeout(initZoom, 300);
            
            // 轮询机制：定期检查缩放级别（作为事件监听的备选方案）
            const pollInterval = setInterval(() => {
                if (window.mindmapGraph) {
                    try {
                        const currentZoom = window.mindmapGraph.getZoom();
                        if (currentZoom !== undefined && currentZoom !== null) {
                            const zoomPercent = Math.round(currentZoom * 100);
                            // 只有当缩放级别真正改变时才更新，避免不必要的重渲染
                            setZoomLevel(prev => {
                                if (prev !== zoomPercent) {
                                    return zoomPercent;
                                }
                                return prev;
                            });
                        }
                    } catch (e) {
                        // 忽略错误，graph 可能还没准备好
                    }
                }
            }, 200); // 每 200ms 检查一次
            
            return () => {
                window.removeEventListener('mindmapZoomChange', handleZoomChange);
                clearTimeout(initTimer);
                clearInterval(pollInterval);
            };
        }
    }, [isMindmap]);

    // 缩放控制
    const handleZoomIn = () => {
        if (zoomLevel < 200) {
            const newZoom = Math.min(zoomLevel + 25, 200);
            setZoomLevel(newZoom);
            applyZoom(newZoom);
        }
    };

    const handleZoomOut = () => {
        if (zoomLevel > 50) {
            const newZoom = Math.max(zoomLevel - 25, 50);
            setZoomLevel(newZoom);
            applyZoom(newZoom);
        }
    };

    const applyZoom = (zoom) => {
        if (isMindmap) {
            // 对于思维导图，使用 G6 的 API
            // 通过全局变量访问 graph 实例
            if (window.mindmapGraph) {
                const targetZoom = zoom / 100; // G6 使用 0-1 的比例，100% = 1.0
                window.mindmapGraph.zoomTo(targetZoom, {
                    duration: 300,
                    easing: 'ease-in-out'
                });
            }
        } else {
            // 对于普通内容，使用 CSS transform
            const contentElement = document.querySelector('.zoom-target');
            if (contentElement) {
                contentElement.style.transform = `scale(${zoom / 100})`;
                contentElement.style.transformOrigin = 'top left';
            }
        }
    };

    // 全屏切换
    const handleFullscreenToggle = () => {
        onFullscreenToggle();
    };

    // 指南切换
    const handleGuideToggle = () => {
        setShowGuide(!showGuide);
    };

    // 指南内容
    const guideContent = (
        <div className="absolute bottom-16 right-0 bg-white rounded-md shadow-sm p-4 w-80 z-30 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            <div className="text-sm text-gray-700">
                <h3 className="font-semibold mb-2 text-gray-900">Guide</h3>
                <div className="space-y-2">
                    <div className="flex items-start">
                        <span className="text-gray-500 mr-2">•</span>
                        <span>Use the zoom buttons to adjust the content size</span>
                    </div>
                    <div className="flex items-start">
                        <span className="text-gray-500 mr-2">•</span>
                        <span>Click the fullscreen button to hide all toolbars</span>
                    </div>
                    <div className="flex items-start">
                        <span className="text-gray-500 mr-2">•</span>
                        <span>The left sidebar can switch between different chapters</span>
                    </div>
                    <div className="flex items-start">
                        <span className="text-gray-500 mr-2">•</span>
                        <span>Click the chapter title to expand/collapse the content</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {!isFullscreen ? (
                <div className="bg-white rounded-md shadow-sm border border-gray-100 flex items-center space-x-3 p-2 z-20">
                    <button
                        onClick={handleZoomOut}
                        disabled={zoomLevel <= 50}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Zoom Out"
                    >
                        <Minus className="w-6 h-6" />
                    </button>

                    <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-center">
                        {zoomLevel}%
                    </span>

                    <button
                        onClick={handleZoomIn}
                        disabled={zoomLevel >= 200}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Zoom In"
                    >
                        <Plus className="w-6 h-6" />
                    </button>

                    <button
                        onClick={handleFullscreenToggle}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-all duration-200 ease-in-out"
                        title="Fullscreen"
                    >
                        <Maximize className="w-6 h-6" />
                    </button>

                    <button
                        onClick={handleGuideToggle}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-all duration-200 ease-in-out"
                        title="Guide"
                    >
                        <HelpCircle className="w-6 h-6" />
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-md shadow-sm border border-gray-100 flex items-center space-x-3 p-2 z-20">
                    <button
                        onClick={handleZoomOut}
                        disabled={zoomLevel <= 50}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Zoom Out"
                    >
                        <Minus className="w-6 h-6" />
                    </button>

                    <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-center">
                        {zoomLevel}%
                    </span>

                    <button
                        onClick={handleZoomIn}
                        disabled={zoomLevel >= 200}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Zoom In"
                    >
                        <Plus className="w-6 h-6" />
                    </button>

                    <button
                        onClick={handleFullscreenToggle}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-all duration-200 ease-in-out"
                        title="退出全屏"
                    >
                        <Minimize className="w-6 h-6" />
                    </button>
                </div>
            )}

            {showGuide && guideContent}
        </>
    );
};

export default BottomRightControlBar;
