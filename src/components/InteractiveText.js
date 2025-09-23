import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Edit3, X } from 'lucide-react';

const InteractiveText = ({ 
    content, 
    mode = 'none', 
    onHighlightSave,
    onAnnotationSave,
    onAITutorAsk,
    sectionId = null,
    itemId = null,
    className = ''
}) => {
    const [selectedText, setSelectedText] = useState('');
    const [selectionRange, setSelectionRange] = useState(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [annotationText, setAnnotationText] = useState('');
    const [showAnnotationInput, setShowAnnotationInput] = useState(false);
    const [aiResponse, setAiResponse] = useState('');
    const [showAIResponse, setShowAIResponse] = useState(false);
    
    const contentRef = useRef(null);
    const annotationInputRef = useRef(null);

    // 计算相对于纯文本的偏移量
    const getTextOffset = (range, container) => {
        const textContent = container.textContent || container.innerText || '';
        const selectedText = range.toString();
        
        // 找到选中文本在纯文本中的位置
        const startOffset = textContent.indexOf(selectedText);
        const endOffset = startOffset + selectedText.length;
        
        return { startOffset, endOffset };
    };

    // 处理文本选择
    const handleTextSelection = () => {
        const selection = window.getSelection();
        if (selection.toString().trim()) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            const selectedText = selection.toString().trim();
            const textOffsets = getTextOffset(range, contentRef.current);
            
            setSelectedText(selectedText);
            setSelectionRange({
                ...range.cloneRange(),
                startOffset: textOffsets.startOffset,
                endOffset: textOffsets.endOffset
            });
            setTooltipPosition({
                x: rect.left + rect.width / 2,
                y: rect.top - 10
            });
            setShowTooltip(true);
        } else {
            setShowTooltip(false);
        }
    };

    // 简化的处理函数
    const handleHighlightSave = () => {
        if (selectedText && selectionRange && onHighlightSave) {
            const highlightData = {
                text: selectedText,
                startOffset: selectionRange.startOffset,
                endOffset: selectionRange.endOffset,
                color: 'bg-yellow-200',
                sectionId: sectionId,
                itemId: itemId,
                timestamp: new Date().toISOString()
            };
            
            onHighlightSave(highlightData);
            setShowTooltip(false);
            clearSelection();
        }
    };

    const handleAnnotationSave = () => {
        if (selectedText && annotationText.trim() && onAnnotationSave) {
            const annotationData = {
                text: selectedText,
                startOffset: selectionRange.startOffset,
                endOffset: selectionRange.endOffset,
                annotation: annotationText.trim(),
                sectionId: sectionId,
                itemId: itemId,
                timestamp: new Date().toISOString()
            };
            
            onAnnotationSave(annotationData);
            setShowAnnotationInput(false);
            setAnnotationText('');
            setShowTooltip(false);
            clearSelection();
        }
    };

    const handleAITutorAsk = () => {
        if (selectedText && onAITutorAsk) {
            setShowTooltip(false);
            
            const response = onAITutorAsk(selectedText);
            setAiResponse(response);
            setShowAIResponse(true);
            
            clearSelection();
        }
    };

    // 清除选择
    const clearSelection = () => {
        window.getSelection().removeAllRanges();
        setSelectedText('');
        setSelectionRange(null);
    };

    // 简化的内容渲染 - 只保留基本文本显示
    const renderContent = () => {
        return content;
    };

    // 处理模式切换
    useEffect(() => {
        if (mode === 'none') {
            setShowTooltip(false);
            setShowAnnotationInput(false);
        }
    }, [mode]);

    // 处理注释输入框显示
    useEffect(() => {
        if (showAnnotationInput && annotationInputRef.current) {
            annotationInputRef.current.focus();
        }
    }, [showAnnotationInput]);

    return (
        <div className={`relative ${className}`}>
            {/* 主要内容 */}
            <div
                ref={contentRef}
                className="select-text"
                onMouseUp={handleTextSelection}
                dangerouslySetInnerHTML={{ 
                    __html: renderContent() 
                }}
            />

            {/* 高亮模式工具提示 */}
            {mode === 'highlight' && showTooltip && selectedText && (
                <div
                    className="fixed z-50 bg-gray-800 text-white px-3 py-2 rounded shadow-lg"
                    style={{
                        left: tooltipPosition.x,
                        top: tooltipPosition.y,
                        transform: 'translateX(-50%)'
                    }}
                >
                    <button
                        onClick={handleHighlightSave}
                        className="text-sm hover:text-yellow-300 transition-colors"
                    >
                        高亮选中文本
                    </button>
                </div>
            )}

            {/* 注释模式工具提示 */}
            {mode === 'note' && showTooltip && selectedText && (
                <div
                    className="fixed z-50 bg-gray-800 text-white px-3 py-2 rounded shadow-lg"
                    style={{
                        left: tooltipPosition.x,
                        top: tooltipPosition.y,
                        transform: 'translateX(-50%)'
                    }}
                >
                    <button
                        onClick={() => setShowAnnotationInput(true)}
                        className="text-sm hover:text-blue-300 transition-colors flex items-center gap-1"
                    >
                        <Edit3 className="w-4 h-4" />
                        添加注释
                    </button>
                </div>
            )}

            {/* AI Tutor 模式工具提示 */}
            {mode === 'tutor' && showTooltip && selectedText && (
                <div
                    className="fixed z-50 bg-gray-800 text-white px-3 py-2 rounded shadow-lg"
                    style={{
                        left: tooltipPosition.x,
                        top: tooltipPosition.y,
                        transform: 'translateX(-50%)'
                    }}
                >
                    <button
                        onClick={handleAITutorAsk}
                        className="text-sm hover:text-purple-300 transition-colors flex items-center gap-1"
                    >
                        <MessageCircle className="w-4 h-4" />
                        询问 AI 导师
                    </button>
                </div>
            )}

            {/* 注释输入框 */}
            {showAnnotationInput && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
                        <h3 className="text-lg font-medium mb-4">添加注释</h3>
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">选中文本：</p>
                            <p className="bg-gray-100 p-2 rounded text-sm">"{selectedText}"</p>
                        </div>
                        <textarea
                            ref={annotationInputRef}
                            value={annotationText}
                            onChange={(e) => setAnnotationText(e.target.value)}
                            placeholder="输入注释内容..."
                            className="w-full p-3 border border-gray-300 rounded-md resize-none h-24"
                        />
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => {
                                    setShowAnnotationInput(false);
                                    setAnnotationText('');
                                    setShowTooltip(false);
                                    clearSelection();
                                }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleAnnotationSave}
                                disabled={!annotationText.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                保存
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* AI 响应对话框 */}
            {showAIResponse && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4 max-h-96 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">AI 导师回答</h3>
                            <button
                                onClick={() => setShowAIResponse(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">您的问题：</p>
                            <p className="bg-gray-100 p-2 rounded text-sm">"{selectedText}"</p>
                        </div>
                        <div className="text-gray-700 leading-relaxed">
                            {aiResponse}
                        </div>
                    </div>
                </div>
            )}

            {/* 点击外部关闭工具提示 */}
            {(showTooltip || showAnnotationInput || showAIResponse) && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                        setShowTooltip(false);
                        setShowAnnotationInput(false);
                        setShowAIResponse(false);
                        clearSelection();
                    }}
                />
            )}
        </div>
    );
};

export default InteractiveText;
