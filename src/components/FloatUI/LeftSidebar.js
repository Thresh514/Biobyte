import { useState } from 'react';
import { Menu, Highlighter, Edit3, MessageCircle } from 'lucide-react';

const LeftSidebar = ({ availableUnits, selectedUnitId, onUnitChange, onInteractiveModeChange }) => {
    const [interactiveMode, setInteractiveMode] = useState('none');
    const [showChapterMenu, setShowChapterMenu] = useState(false);

    const handleModeChange = (mode) => {
        const newMode = interactiveMode === mode ? 'none' : mode;
        setInteractiveMode(newMode);
        onInteractiveModeChange && onInteractiveModeChange(newMode);
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
                onClick={() => handleModeChange('highlight')}
                className={`p-2 rounded transition-colors ${
                    interactiveMode === 'highlight' ? 'bg-yellow-100' : 'hover:bg-gray-50'
                }`}
                title="高亮模式"
            >
                <Highlighter className={`w-6 h-6 ${interactiveMode === 'highlight' ? 'text-yellow-600' : 'text-gray-600'}`} />
            </button>
                        
            <button
                onClick={() => handleModeChange('note')}
                className={`p-2 rounded transition-colors ${
                    interactiveMode === 'note' ? 'bg-green-100' : 'hover:bg-gray-50'
                }`}
                title="注释模式"
            >
                <Edit3 className={`w-6 h-6 ${interactiveMode === 'note' ? 'text-green-600' : 'text-gray-600'}`} />
            </button>
                        
            <button
                onClick={() => handleModeChange('tutor')}
                className={`p-2 rounded transition-colors ${
                    interactiveMode === 'tutor' ? 'bg-purple-100' : 'hover:bg-gray-50'
                }`}
                title="AI 导师模式"
            >
                <MessageCircle className={`w-6 h-6 ${interactiveMode === 'tutor' ? 'text-purple-600' : 'text-gray-600'}`} />
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
