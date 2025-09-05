import { useState } from 'react';

const LeftSidebar = ({ availableUnits, selectedUnitId, onUnitChange, onHighlightChange, onAnnotationModeChange, onAITutorToggle }) => {
    const [highlightMode, setHighlightMode] = useState('none');
    const [highlightColor, setHighlightColor] = useState('#ffeb3b');
    const [showChapterMenu, setShowChapterMenu] = useState(false);
    const [annotationMode, setAnnotationMode] = useState(false);
    const [aiTutorActive, setAiTutorActive] = useState(false);

    const handleHighlightModeChange = (mode) => {
        setHighlightMode(mode);
        onHighlightChange && onHighlightChange({ mode, color: highlightColor });
    };

    const handleHighlightColorChange = (color) => {
        setHighlightColor(color);
        onHighlightChange && onHighlightChange({ mode: highlightMode, color });
    };

    const handleAnnotationModeChange = () => {
        const newMode = !annotationMode;
        setAnnotationMode(newMode);
        onAnnotationModeChange && onAnnotationModeChange(newMode);
    };

    const handleAITutorToggle = () => {
        const newState = !aiTutorActive;
        setAiTutorActive(newState);
        onAITutorToggle && onAITutorToggle(newState);
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
        <div className="fixed top-1/2 left-4 z-20 pointer-events-auto">
            <div className="bg-gray-100 rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                {/* 工具图标 */}
                <div className="p-2 space-y-1">
                    {/* 目录按钮 */}
                    <button
                        onClick={() => setShowChapterMenu(!showChapterMenu)}
                        className={`w-full p-2 rounded transition-colors ${
                            showChapterMenu ? 'bg-blue-100' : 'hover:bg-white'
                        }`}
                        title="Chapters"
                    >
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    
                    {/* 高光模式按钮 */}
                        <button
                            onClick={() => handleHighlightModeChange(highlightMode === 'text' ? 'none' : 'text')}
                            className={`w-full p-2 rounded transition-colors ${
                                highlightMode === 'text' ? 'bg-yellow-100' : 'hover:bg-white'
                            }`}
                        title="Highlight Mode"
                        >
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                            </svg>
                        </button>
                        
                    {/* 注释模式按钮 */}
                        <button
                        onClick={handleAnnotationModeChange}
                        className={`w-full p-2 rounded transition-colors ${
                            annotationMode ? 'bg-green-100' : 'hover:bg-white'
                        }`}
                        title="Annotation Mode"
                    >
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>
                        
                    {/* AI Tutor按钮 */}
                        <button
                        onClick={handleAITutorToggle}
                        className={`w-full p-2 rounded transition-colors ${
                            aiTutorActive ? 'bg-purple-100' : 'hover:bg-white'
                        }`}
                        title="AI Tutor Mode"
                    >
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </button>
                    </div>

                {/* 目录菜单弹出层 */}
                {showChapterMenu && (
                    <div className="absolute left-full top-0 ml-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-30">
                        <div className="p-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Table of Contents</h3>
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
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        <div className="font-medium text-sm">
                                            Chapters {unit.id}: {unit.name}
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
