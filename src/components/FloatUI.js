import LeftSidebar from './FloatUI/LeftSidebar';
import BottomRightControlBar from './FloatUI/BottomRightControlBar';
import TopLeftHeader from './FloatUI/TopLeftHeader';
import TopRightHeader from './FloatUI/TopRightHeader';

const FloatUI = ({ 
    availableUnits, 
    selectedUnitId, 
    onUnitChange, 
    onInteractiveModeChange,
    onFullscreenToggle,
    isFullscreen,
    onUndo,
    onRedo,
    currentUnit,
    mindmapNodeTree,
    mindmapTitle,
    isMindmap
}) => {
    // 位置配置 - 在这里调整各个组件的位置
    const positions = {
        leftSidebar: { x: 20, y: '40%' },        // 左侧边栏位置 - 屏幕左侧中间
        topLeftHeader: { x: 20, y: 20 },         // 左上角头部位置
        topRightHeader: { x: -20, y: 20 },       // 右上角头部位置 (负数表示从右边开始)
        bottomRightControlBar: { x: -30, y: -30 } // 右下角控制栏位置 (负数表示从右边和底部开始)
    };

    // 获取全屏模式下的消失变换
    const getFullscreenTransform = (component) => {
        switch (component) {
            case 'leftSidebar':
                return 'translateX(-100%)';
            case 'topLeftHeader':
                return 'translate(-100%, -100%)';
            case 'topRightHeader':
                return 'translate(100%, -100%)';
            case 'bottomRightControlBar':
                return 'translate(0, 0) scale(1)';
            default:
                return 'translate(0, 0) scale(1)';
        }
    };


    // 计算位置样式
    const getPositionStyle = (component) => {
        const pos = positions[component];
        const isControlBar = component === 'bottomRightControlBar';

        const topValue = typeof pos.y === 'string' && pos.y.includes('%') ? pos.y : (pos.y >= 0 ? `${pos.y}px` : 'auto');
        
        const transform = isFullscreen && !isControlBar 
            ? getFullscreenTransform(component)
            : 'translate(0, 0) scale(1)';
        
        const shouldHide = isFullscreen && !isControlBar;
        
        return {
            position: 'fixed',
            left: pos.x >= 0 ? `${pos.x}px` : 'auto',
            right: pos.x < 0 ? `${Math.abs(pos.x)}px` : 'auto',
            top: topValue,
            bottom: pos.y < 0 ? `${Math.abs(pos.y)}px` : 'auto',
            zIndex: 1000,
            opacity: shouldHide ? 0 : 1,
            transform: transform,
            transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: shouldHide ? 'none' : 'auto',
            transformOrigin: 'center center'
        };
    };

    return (
        <>
            <div style={getPositionStyle('leftSidebar')}>
                <LeftSidebar
                    availableUnits={availableUnits}
                    selectedUnitId={selectedUnitId}
                    onUnitChange={onUnitChange}
                    onInteractiveModeChange={onInteractiveModeChange}
                    mindmapNodeTree={mindmapNodeTree}
                    isMindmap={isMindmap}
                />
            </div>

            <div style={getPositionStyle('topLeftHeader')}>
                <TopLeftHeader
                    currentUnit={currentUnit}
                    onUndo={onUndo}
                    onRedo={onRedo}
                    mindmapTitle={mindmapTitle}
                    isMindmap={isMindmap}
                />
            </div>

            <div style={getPositionStyle('topRightHeader')}>
                <TopRightHeader />
            </div>

            <div style={getPositionStyle('bottomRightControlBar')}>
                <BottomRightControlBar
                    onFullscreenToggle={onFullscreenToggle}
                    isFullscreen={isFullscreen}
                    isMindmap={isMindmap}
                />
            </div>
        </>
    );
};

export default FloatUI;
