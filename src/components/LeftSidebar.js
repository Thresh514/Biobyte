import { useState } from 'react';

const LeftSidebar = ({ availableUnits, selectedUnitId, onUnitChange, onHighlightChange }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [highlightMode, setHighlightMode] = useState('none');
    const [highlightColor, setHighlightColor] = useState('#ffeb3b');
    const [showChapterMenu, setShowChapterMenu] = useState(false);

    const handleHighlightModeChange = (mode) => {
        setHighlightMode(mode);
        onHighlightChange && onHighlightChange({ mode, color: highlightColor });
    };

    const handleHighlightColorChange = (color) => {
        setHighlightColor(color);
        onHighlightChange && onHighlightChange({ mode: highlightMode, color });
    };

    const highlightColors = [
        { name: 'Yellow', value: '#ffeb3b' },
        { name: 'Green', value: '#4caf50' },
        { name: 'Blue', value: '#2196f3' },
        { name: 'Pink', value: '#e91e63' },
        { name: 'Orange', value: '#ff9800' },
        { name: 'Purple', value: '#9c27b0' }
    ];

    return (
        <div className={`fixed left-4 top-20 z-20 pointer-events-auto transition-all duration-300 ${
            isCollapsed ? 'w-12' : 'w-80'
        }`}>
            <div className="bg-gray-100 rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                {/* 折叠/展开按钮 */}
                <div className="flex items-center justify-between p-3 border-b border-gray-200">
                    {!isCollapsed && (
                        <h2 className="text-lg font-semibold text-gray-800">Tools</h2>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                        <svg
                            className={`w-5 h-5 text-gray-600 transition-transform ${
                                isCollapsed ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>
                </div>

                {!isCollapsed && (
                    <div className="p-4 space-y-6">
                        {/* 章节切换菜单 */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-gray-700">Chapters</h3>
                                <button
                                    onClick={() => setShowChapterMenu(!showChapterMenu)}
                                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                                >
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                            </div>
                            
                            {showChapterMenu && (
                                <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                                    {availableUnits?.map((unit) => (
                                        <button
                                            key={unit.id}
                                            onClick={() => {
                                                onUnitChange && onUnitChange(unit);
                                                setShowChapterMenu(false);
                                            }}
                                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                                                selectedUnitId === unit.id
                                                    ? 'bg-gray-800 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            <div className="font-medium text-sm">
                                                Unit {unit.id}
                                            </div>
                                            <div className="text-xs mt-1 opacity-80">
                                                {unit.name}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Highlight工具 */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Highlighter</h3>
                            
                            {/* Highlight模式选择 */}
                            <div className="space-y-2 mb-4">
                                <button
                                    onClick={() => handleHighlightModeChange('none')}
                                    className={`w-full text-left p-2 rounded-lg transition-colors ${
                                        highlightMode === 'none'
                                            ? 'bg-gray-800 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border border-gray-400 rounded"></div>
                                        <span className="text-sm">None</span>
                                    </div>
                                </button>
                                
                                <button
                                    onClick={() => handleHighlightModeChange('text')}
                                    className={`w-full text-left p-2 rounded-lg transition-colors ${
                                        highlightMode === 'text'
                                            ? 'bg-gray-800 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                        </svg>
                                        <span className="text-sm">Text Highlighter</span>
                                    </div>
                                </button>
                                
                                <button
                                    onClick={() => handleHighlightModeChange('section')}
                                    className={`w-full text-left p-2 rounded-lg transition-colors ${
                                        highlightMode === 'section'
                                            ? 'bg-gray-800 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M3 4h18v2H3V4zm0 5h18v2H3V9zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
                                        </svg>
                                        <span className="text-sm">Section Highlighter</span>
                                    </div>
                                </button>
                            </div>

                            {/* 颜色选择器 */}
                            {highlightMode !== 'none' && (
                                <div>
                                    <h4 className="text-xs font-medium text-gray-600 mb-2">Color</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        {highlightColors.map((color) => (
                                            <button
                                                key={color.value}
                                                onClick={() => handleHighlightColorChange(color.value)}
                                                className={`w-8 h-8 rounded-lg border-2 transition-all ${
                                                    highlightColor === color.value
                                                        ? 'border-gray-800 scale-110'
                                                        : 'border-gray-300 hover:border-gray-400'
                                                }`}
                                                style={{ backgroundColor: color.value }}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 折叠状态下的图标 */}
                {isCollapsed && (
                    <div className="p-2 space-y-1">
                        {/* 指针工具 */}
                        <button
                            onClick={() => setIsCollapsed(false)}
                            className={`w-full p-2 rounded transition-colors ${
                                true ? 'bg-purple-100' : 'hover:bg-white'
                            }`}
                            title="Pointer"
                        >
                            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M13.64 21.97c-.2.03-.4.03-.6 0-1.9-.3-3.7-1.1-5.1-2.3L2.5 12.5c-.8-.8-.8-2.1 0-2.9s2.1-.8 2.9 0l5.44 7.14c.6.8 1.5 1.4 2.5 1.6.2.03.4.03.6 0z"/>
                            </svg>
                        </button>
                        
                        {/* 文本工具 */}
                        <button
                            className="w-full p-2 hover:bg-white rounded transition-colors"
                            title="Text Tool"
                        >
                            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        
                        {/* 形状工具 */}
                        <button
                            className="w-full p-2 hover:bg-white rounded transition-colors"
                            title="Shapes"
                        >
                            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </button>
                        
                        {/* 箭头工具 */}
                        <button
                            className="w-full p-2 hover:bg-white rounded transition-colors"
                            title="Arrow"
                        >
                            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                            </svg>
                        </button>
                        
                        {/* 高光笔 */}
                        <button
                            onClick={() => handleHighlightModeChange(highlightMode === 'text' ? 'none' : 'text')}
                            className={`w-full p-2 rounded transition-colors ${
                                highlightMode === 'text' ? 'bg-yellow-100' : 'hover:bg-white'
                            }`}
                            title="Highlighter"
                        >
                            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                            </svg>
                        </button>
                        
                        {/* 绘图工具 */}
                        <button
                            className="w-full p-2 hover:bg-white rounded transition-colors"
                            title="Draw"
                        >
                            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>
                        
                        {/* 特效工具 */}
                        <button
                            className="w-full p-2 hover:bg-white rounded transition-colors"
                            title="Effects"
                        >
                            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </button>
                        
                        {/* 自定义工具 */}
                        <button
                            className="w-full p-2 hover:bg-white rounded transition-colors"
                            title="Custom Tool"
                        >
                            <div className="w-5 h-5 bg-blue-500 rounded-sm"></div>
                        </button>
                    </div>
                )}

                {/* 章节菜单弹出层 */}
                {showChapterMenu && isCollapsed && (
                    <div className="absolute left-full top-0 ml-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-30">
                        <div className="p-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Chapters</h3>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {availableUnits?.map((unit) => (
                                    <button
                                        key={unit.id}
                                        onClick={() => {
                                            onUnitChange && onUnitChange(unit);
                                            setShowChapterMenu(false);
                                        }}
                                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                                            selectedUnitId === unit.id
                                                ? 'bg-gray-800 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        <div className="font-medium text-sm">
                                            Unit {unit.id}
                                        </div>
                                        <div className="text-xs mt-1 opacity-80">
                                            {unit.name}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeftSidebar;
