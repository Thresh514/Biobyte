import { useState, useRef, useEffect } from 'react';
import { Menu, Highlighter, Edit3, MessageCircle } from 'lucide-react';

// 思维导图节点树组件
const MindmapNodeTree = ({ node, level, onNodeClick }) => {
    if (!node) return null;
    
    // 只显示一级和二级节点
    if (level > 1) return null;
    
    const hasChildren = node.children && node.children.length > 0;
    const isLevel1 = level === 0;
    const isLevel2 = level === 1;
    
    return (
        <div className={isLevel1 ? 'mb-2' : 'ml-4 mb-1'}>
            <button
                onClick={() => {
                    if (onNodeClick && node.id) {
                        onNodeClick(node.id);
                    }
                }}
                className={`w-full text-left p-2 rounded-lg transition-colors ${
                    isLevel1 
                        ? 'bg-gray-100 text-gray-900 font-semibold hover:bg-gray-200' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
                <div className={`text-sm ${isLevel1 ? 'font-medium' : ''}`}>
                    {node.label || node.title || node.id}
                </div>
            </button>
            {hasChildren && isLevel1 && (
                <div className="mt-1 space-y-1">
                    {node.children.map((child, index) => (
                        <MindmapNodeTree 
                            key={child.id || index} 
                            node={child} 
                            level={level + 1}
                            onNodeClick={onNodeClick}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const LeftSidebar = ({ availableUnits, selectedUnitId, onUnitChange, onInteractiveModeChange, mindmapNodeTree, isMindmap }) => {
    const [interactiveMode, setInteractiveMode] = useState('none');
    const [showChapterMenu, setShowChapterMenu] = useState(false);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    const handleModeChange = (mode) => {
        const newMode = interactiveMode === mode ? 'none' : mode;
        setInteractiveMode(newMode);
        onInteractiveModeChange && onInteractiveModeChange(newMode);
    };

    // 点击外部区域关闭菜单
    useEffect(() => {
        const handleClickOutside = (event) => {
            // 如果菜单未打开，不需要处理
            if (!showChapterMenu) return;
            
            // 检查点击是否在菜单或按钮外部
            if (
                menuRef.current && 
                buttonRef.current &&
                !menuRef.current.contains(event.target) &&
                !buttonRef.current.contains(event.target)
            ) {
                setShowChapterMenu(false);
            }
        };

        // 添加事件监听器
        if (showChapterMenu) {
            // 使用 setTimeout 确保事件在下一个事件循环中注册，避免立即触发
            setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
            }, 0);
        }

        // 清理函数
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showChapterMenu]);

    return (        
        <div className="flex flex-col items-center bg-white p-2 rounded-md shadow-sm">
            <button
                ref={buttonRef}
                onClick={() => setShowChapterMenu(!showChapterMenu)}
                className={`p-2 rounded transition-colors ${
                    showChapterMenu ? 'bg-blue-100' : 'hover:bg-white'
                }`}
                title="Chapters"
            >
                <Menu className="w-6 h-6 text-gray-600" />
            </button>
                    
            <button
                // onClick={() => handleModeChange('highlight')}
                className={`p-2 rounded transition-colors cursor-not-allowed ${
                    interactiveMode === 'highlight' ? 'bg-yellow-100' : 'hover:bg-gray-50'
                }`}
                title="高亮模式"
            >
                <Highlighter className={`w-6 h-6 ${interactiveMode === 'highlight' ? 'text-yellow-600' : 'text-gray-600'}`} />
            </button>
                        
            <button
                // onClick={() => handleModeChange('note')}
                className={`p-2 rounded transition-colors cursor-not-allowed ${
                    interactiveMode === 'note' ? 'bg-green-100' : 'hover:bg-gray-50'
                }`}
                title="注释模式"
            >
                <Edit3 className={`w-6 h-6 ${interactiveMode === 'note' ? 'text-green-600' : 'text-gray-600'}`} />
            </button>
                        
            <button
                // onClick={() => handleModeChange('tutor')}
                className={`p-2 rounded transition-colors cursor-not-allowed ${
                    interactiveMode === 'tutor' ? 'bg-purple-100' : 'hover:bg-gray-50'
                }`}
                title="AI 导师模式"
            >
                <MessageCircle className={`w-6 h-6 ${interactiveMode === 'tutor' ? 'text-purple-600' : 'text-gray-600'}`} />
            </button>
                

                {/* 目录菜单弹出层 */}
            {showChapterMenu && (
                    <div 
                        ref={menuRef}
                        className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-96 bg-white border border-gray-100 rounded-md shadow-sm z-30 max-h-[80vh] overflow-hidden flex flex-col"
                    >
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="text-md font-medium text-gray-700">Table of Contents</h3>
                        </div>
                        <div className="overflow-y-auto flex-1 p-4">
                            {isMindmap && mindmapNodeTree ? (
                                <MindmapNodeTree 
                                    node={mindmapNodeTree} 
                                    level={0}
                                    onNodeClick={(nodeId) => {
                                        if (window.focusMindmapNode) {
                                            window.focusMindmapNode(nodeId);
                                        }
                                    }}
                                />
                            ) : (
                                <div className="space-y-2">
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
                            )}
                        </div>
                    </div>
            )}
        </div>
    );
};

export default LeftSidebar;
