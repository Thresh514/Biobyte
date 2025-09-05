import LeftSidebar from './LeftSidebar';
import BottomRightControlBar from './BottomRightControlBar';
import TopLeftHeader from './TopLeftHeader';
import TopRightHeader from './TopRightHeader';

const FloatUI = ({ 
    availableUnits, 
    selectedUnitId, 
    onUnitChange, 
    onHighlightChange,
    onFullscreenToggle,
    isFullscreen,
    onUndo,
    onRedo,
    currentUnit
}) => {
    // 位置配置 - 在这里调整各个组件的位置
    const positions = {
        leftSidebar: { x: 20, y: '50%' },        // 左侧边栏位置
        topLeftHeader: { x: 20, y: 20 },         // 左上角头部位置
        topRightHeader: { x: -20, y: 20 },       // 右上角头部位置 (负数表示从右边开始)
        bottomRightControlBar: { x: -20, y: -20 } // 右下角控制栏位置 (负数表示从右边和底部开始)
    };

    // 根据组件位置确定消失方向
    const getTransform = (component) => {
        switch (component) {
            case 'leftSidebar':
                return 'translateX(-100%)';
            case 'topLeftHeader':
                return 'translate(0%, -100%)';
            case 'topRightHeader':
                return 'translate(0%, -100%)';
            case 'bottomRightControlBar':
                return 'translate(0, 0)';
            default:
                return 'translateX(-100%)';
        }
    };

    // 计算位置样式
    const getPositionStyle = (component) => {
        const pos = positions[component];
        const isControlBar = component === 'bottomRightControlBar';
        const isLeftSidebar = component === 'leftSidebar';
        
        // 处理百分比值
        const topValue = typeof pos.y === 'string' && pos.y.includes('%') ? pos.y : (pos.y >= 0 ? `${pos.y}px` : 'auto');
        
        return {
            position: 'fixed',
            left: pos.x >= 0 ? `${pos.x}px` : 'auto',
            right: pos.x < 0 ? `${Math.abs(pos.x)}px` : 'auto',
            top: topValue,
            bottom: pos.y < 0 ? `${Math.abs(pos.y)}px` : 'auto',
            zIndex: 1000,
            opacity: isFullscreen && !isControlBar ? 0 : 1,
            transform: isFullscreen && !isControlBar ? getTransform(component) : '',
            transition: 'all 0.5s ease-in-out',
            pointerEvents: isFullscreen && !isControlBar ? 'none' : 'auto'
        };
    };

    return (
        <>
            <div style={getPositionStyle('leftSidebar')}>
                <LeftSidebar
                    availableUnits={availableUnits}
                    selectedUnitId={selectedUnitId}
                    onUnitChange={onUnitChange}
                    onHighlightChange={onHighlightChange}
                />
            </div>

            <div style={getPositionStyle('topLeftHeader')}>
                <TopLeftHeader
                    currentUnit={currentUnit}
                    onUndo={onUndo}
                    onRedo={onRedo}
                />
            </div>

            <div style={getPositionStyle('topRightHeader')}>
                <TopRightHeader />
            </div>

            <div style={getPositionStyle('bottomRightControlBar')}>
                <BottomRightControlBar
                    onFullscreenToggle={onFullscreenToggle}
                    isFullscreen={isFullscreen}
                />
            </div>
        </>
    );
};

export default FloatUI;
