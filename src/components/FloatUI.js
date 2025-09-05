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
        leftSidebar: { x: 20, y: '50%' },        // 左侧边栏位置 - 屏幕左侧中间
        topLeftHeader: { x: 20, y: 20 },         // 左上角头部位置
        topRightHeader: { x: -20, y: 20 },       // 右上角头部位置 (负数表示从右边开始)
        bottomRightControlBar: { x: -20, y: -20 } // 右下角控制栏位置 (负数表示从右边和底部开始)
    };

    // 获取全屏模式下的消失变换 - 向四周消失
    const getFullscreenTransform = (component) => {
        switch (component) {
            case 'leftSidebar':
                // 左侧边栏向左消失
                return 'translateX(-100%)';
            case 'topLeftHeader':
                // 左上角头部向左上角消失
                return 'translate(-100%, -100%)';
            case 'topRightHeader':
                // 右上角头部向右上角消失
                return 'translate(100%, -100%)';
            case 'bottomRightControlBar':
                // 右下角控制栏保持原位置，不消失
                return 'translate(0, 0) scale(1)';
            default:
                return 'translate(0, 0) scale(1)';
        }
    };

    // 获取正常模式下的变换
    const getNormalTransform = (component) => {
        switch (component) {
            case 'leftSidebar':
                // 左侧边栏正常位置，垂直居中
                return 'translateY(-50%) scale(1)';
            case 'topLeftHeader':
                // 左上角头部正常位置
                return 'translate(0, 0) scale(1)';
            case 'topRightHeader':
                // 右上角头部正常位置
                return 'translate(0, 0) scale(1)';
            case 'bottomRightControlBar':
                // 右下角控制栏正常位置
                return 'translate(0, 0) scale(1)';
            default:
                return 'translate(0, 0) scale(1)';
        }
    };

    // 计算位置样式
    const getPositionStyle = (component) => {
        const pos = positions[component];
        const isControlBar = component === 'bottomRightControlBar';
        const isLeftSidebar = component === 'leftSidebar';
        
        // 处理百分比值
        const topValue = typeof pos.y === 'string' && pos.y.includes('%') ? pos.y : (pos.y >= 0 ? `${pos.y}px` : 'auto');
        
        // 根据全屏状态选择变换
        const transform = isFullscreen && !isControlBar 
            ? getFullscreenTransform(component)
            : getNormalTransform(component);
        
        // 全屏模式下，除了控制栏外的组件都向四周消失
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
            transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
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
