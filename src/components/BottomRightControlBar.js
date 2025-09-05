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
                <h3 className="font-semibold mb-2 text-gray-900">使用指南</h3>
                <div className="space-y-2">
                    <div className="flex items-start">
                        <span className="text-gray-500 mr-2">•</span>
                        <span>使用缩放按钮调整内容大小</span>
                    </div>
                    <div className="flex items-start">
                        <span className="text-gray-500 mr-2">•</span>
                        <span>点击全屏按钮隐藏所有工具栏</span>
                    </div>
                    <div className="flex items-start">
                        <span className="text-gray-500 mr-2">•</span>
                        <span>左侧面板可以切换不同章节</span>
                    </div>
                    <div className="flex items-start">
                        <span className="text-gray-500 mr-2">•</span>
                        <span>点击章节标题展开/收起内容</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="relative">
            {/* 控制栏 */}
            <div className="absolute bottom-4 right-4 bg-white rounded-md shadow-sm border border-gray-100 flex items-center space-x-3 px-5 py-2 z-20">
                {/* 非全屏模式下显示缩放和指南按钮 */}
                {!isFullscreen && (
                    <>
                        {/* 缩放出按钮 */}
                        <button
                            onClick={handleZoomOut}
                            disabled={zoomLevel <= 50}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                            title="缩小"
                        >
                            <Minus className="w-4 h-4" />
                        </button>

                        {/* 缩放级别显示 */}
                        <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-center">
                            {zoomLevel}%
                        </span>

                        {/* 缩放入按钮 */}
                        <button
                            onClick={handleZoomIn}
                            disabled={zoomLevel >= 200}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                            title="放大"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </>
                )}

                {/* 全屏按钮 - 始终显示 */}
                <button
                    onClick={handleFullscreenToggle}
                    className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-all duration-200 ease-in-out hover:scale-105"
                    title={isFullscreen ? "退出全屏" : "全屏"}
                >
                    {isFullscreen ? (
                        <Minimize className="w-6 h-6" />
                    ) : (
                        <Maximize className="w-6 h-6" />
                    )}
                </button>

                {/* 非全屏模式下显示指南按钮 */}
                {!isFullscreen && (
                    <>
                        {/* 指南按钮 */}
                        <button
                            onClick={handleGuideToggle}
                            className="p-2 flex items-center justify-center text-gray-600 hover:text-gray-800 duration-200"
                            title="使用指南"
                        >
                            <HelpCircle className="w-6 h-6" />
                        </button>
                    </>
                )}
            </div>

            {/* 指南弹窗 */}
            {showGuide && guideContent}
        </div>
    );
};

export default BottomRightControlBar;
