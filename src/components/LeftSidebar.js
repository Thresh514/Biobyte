import { useState } from 'react';
import { Menu, Highlighter, Edit3, MessageCircle } from 'lucide-react';

const LeftSidebar = ({ availableUnits, selectedUnitId, onUnitChange, onHighlightChange, onAnnotationModeChange, onAITutorToggle }) => {
    const [highlightMode, setHighlightMode] = useState('none');
    const [showChapterMenu, setShowChapterMenu] = useState(false);
    const [annotationMode, setAnnotationMode] = useState(false);
    const [aiTutorActive, setAiTutorActive] = useState(false);

    const handleHighlightModeChange = (mode) => {
        setHighlightMode(mode);
        onHighlightChange && onHighlightChange({ mode, color: highlightColor });
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

    return (        
        <div className="flex flex-col items-center bg-white p-2 rounded-md shadow-sm">
            <button
                onClick={() => setShowChapterMenu(!showChapterMenu)}
                className={`p-2 rounded transition-colors ${
                    showChapterMenu ? 'bg-blue-100' : 'hover:bg-white'
                }`}
                title="Chapters"
            >
                <Menu className="w-6 h-6 text-gray-600" />
            </button>
                    
            <button
                onClick={() => handleHighlightModeChange(highlightMode === 'text' ? 'none' : 'text')}
                className={`p-2 rounded transition-colors ${
                    highlightMode === 'text' ? 'bg-yellow-100' : 'hover:bg-white'
                }`}
                title="Highlight Mode"
            >
                <Highlighter className="w-6 h-6 text-yellow-600" />
            </button>
                        
            <button
                onClick={handleAnnotationModeChange}
                className={`p-2 rounded transition-colors ${
                    annotationMode ? 'bg-green-100' : 'hover:bg-white'
                }`}
                title="Annotation Mode"
            >
                <Edit3 className="w-6 h-6 text-green-600" />
            </button>
                        
            <button
                onClick={handleAITutorToggle}
                className={`p-2 rounded transition-colors ${
                    aiTutorActive ? 'bg-purple-100' : 'hover:bg-white'
                }`}
                title="AI Tutor Mode"
            >
                <MessageCircle className="w-6 h-6 text-purple-600" />
            </button>
                

                {/* 目录菜单弹出层 */}
            {showChapterMenu && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-96 bg-white border border-gray-100 rounded-md shadow-sm z-30">
                        <div className="p-4">
                            <h3 className="text-md font-medium text-gray-700 mb-3">Table of Contents</h3>
                            <div className="space-y-2 overflow-y-auto">
                                {availableUnits?.map((unit) => (
                                    <button
                                        key={unit.id}
                                        onClick={() => {
                                            onUnitChange && onUnitChange(unit);
                                            setShowChapterMenu(false);
                                        }}
                                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                                            selectedUnitId === unit.id
                                                ? 'bg-gray-200 text-gray-800'
                                                : 'bg-white text-gray-800 hover:bg-gray-100'
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
    );
};

export default LeftSidebar;
