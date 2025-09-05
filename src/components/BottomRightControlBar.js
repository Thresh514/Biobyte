import { useState, useEffect } from 'react';
import { Minus, Plus, Maximize, Minimize, HelpCircle } from 'lucide-react';

const BottomRightControlBar = ({ onFullscreenToggle, isFullscreen }) => {
    const [zoomLevel, setZoomLevel] = useState(100);
    const [showGuide, setShowGuide] = useState(false);

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
        const contentElement = document.querySelector('.zoom-target');
        if (contentElement) {
            contentElement.style.transform = `scale(${zoom / 100})`;
            contentElement.style.transformOrigin = 'top left';
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
                <div className="bg-white rounded-md shadow-sm border border-gray-100 flex items-center space-x-3 px-2 py-2 z-20">
                    <button
                        onClick={handleZoomOut}
                        disabled={zoomLevel <= 50}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                        title="Zoom Out"
                    >
                        <Minus className="w-4 h-4" />
                    </button>

                    <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-center">
                        {zoomLevel}%
                    </span>

                    <button
                        onClick={handleZoomIn}
                        disabled={zoomLevel >= 200}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                        title="Zoom In"
                    >
                        <Plus className="w-4 h-4" />
                    </button>

                    <button
                        onClick={handleFullscreenToggle}
                        className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-all duration-200 ease-in-out hover:scale-105"
                        title="Fullscreen"
                    >
                        <Maximize className="w-6 h-6" />
                    </button>

                    <button
                        onClick={handleGuideToggle}
                        className="p-2 flex items-center justify-center text-gray-600 hover:text-gray-800 duration-200"
                        title="Guide"
                    >
                        <HelpCircle className="w-6 h-6" />
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-md shadow-sm border border-gray-100 flex items-center px-4 py-4 z-20">
                    <button
                        onClick={handleFullscreenToggle}
                        className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-all duration-200 ease-in-out hover:scale-105"
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
