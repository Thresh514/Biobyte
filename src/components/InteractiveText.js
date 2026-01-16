import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Edit3, X } from 'lucide-react';
// import Mark from 'mark.js'; // 暂时注释掉高亮功能

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
    // const markInstanceRef = useRef(null); // 暂时注释掉高亮功能
    // const highlightsLoadedRef = useRef(false); // 暂时注释掉高亮功能

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
        const selectedText = selection.toString().trim();
        
        console.log('文本选择事件触发，选中文本:', selectedText);
        
        if (selectedText) {
            const range = selection.getRangeAt(0);
            const textOffsets = getTextOffset(range, contentRef.current);
            
            setSelectedText(selectedText);
            setSelectionRange({
                ...range.cloneRange(),
                startOffset: textOffsets.startOffset,
                endOffset: textOffsets.endOffset
            });
            
            // 暂时注释掉高亮功能
            // if (mode === 'highlight') {
            //     console.log('高亮模式，直接创建高亮');
            //     // 直接使用选中的文本，不依赖状态
            //     handleHighlightSaveDirect(selectedText, {
            //         ...range.cloneRange(),
            //         startOffset: textOffsets.startOffset,
            //         endOffset: textOffsets.endOffset
            //     });
            // } else {
            if (mode !== 'highlight') {
                // 其他模式显示工具提示
                const rect = range.getBoundingClientRect();
            setTooltipPosition({
                x: rect.left + rect.width / 2,
                y: rect.top - 10
            });
            setShowTooltip(true);
            }
        } else {
            setShowTooltip(false);
        }
    };

    // 暂时注释掉高亮功能
    // const handleHighlightSaveDirect = async (text, range) => {
    //     console.log('handleHighlightSaveDirect 被调用，文本:', text);
    //     console.log('markInstanceRef.current:', markInstanceRef.current);
        
    //     // 如果 Mark.js 未初始化，尝试重新初始化
    //     if (!markInstanceRef.current && text && contentRef.current) {
    //         console.log('Mark.js 未初始化，尝试重新初始化...');
    //         await initializeMark();
    //     }
        
    //     if (markInstanceRef.current && text) {
    //         try {
    //             console.log('开始创建高亮，选中文本:', text);
                
    //             // 使用 Mark.js 创建高亮
    //             markInstanceRef.current.mark(text, {
    //                 className: 'highlight',
    //                 element: 'mark',
    //                 done: (counter) => {
    //                     console.log(`高亮创建完成，标记了 ${counter} 个匹配项`);
                        
    //                     // 检查高亮元素是否真的存在
    //                     const highlightElements = document.querySelectorAll('.highlight');
    //                     console.log('页面中的高亮元素数量:', highlightElements.length);
    //                     highlightElements.forEach((el, index) => {
    //                         console.log(`高亮元素 ${index}:`, el.textContent, el.className);
    //                     });
                        
    //                     // 序列化高亮数据
    //                     const serializedData = serializeHighlights();
    //                     console.log('序列化数据:', serializedData);
                        
    //                     // 简化的数据结构，只存储必要信息
    //                     const highlightData = {
    //                         sectionId: sectionId,
    //                         itemId: itemId,
    //                         serializedData: serializedData,
    //                         timestamp: new Date().toISOString()
    //                     };
                        
    //                     onHighlightSave(highlightData);
                        
    //                     // 自动保存到数据库
    //                     saveHighlightsToDatabase(highlightData);
    //                 }
    //             });
    //         } catch (error) {
    //             console.error('创建高亮失败:', error);
    //             // 即使出错也要清除选择
    //             window.getSelection().removeAllRanges();
    //         }
    //     } else {
    //         console.log('Mark.js 仍未初始化或没有文本');
    //         console.log('markInstanceRef.current 存在:', !!markInstanceRef.current);
    //         console.log('text 存在:', !!text);
    //     }
        
    //     // 清除选择
    //     window.getSelection().removeAllRanges();
    // };

    // 暂时注释掉 Rangy 高亮保存函数
    // const handleHighlightSave = () => {
    //     console.log('handleHighlightSave 被调用');
    //     console.log('rangyRef.current:', rangyRef.current);
    //     console.log('selectedText:', selectedText);
    //     console.log('mode:', mode);
        
    //     if (rangyRef.current && selectedText) {
    //         try {
    //             console.log('开始创建高亮，选中文本:', selectedText);
                
    //             // 使用 Rangy 创建高亮
    //             const selection = rangyRef.current.getSelection();
    //             const ranges = selection.getAllRanges();
                
    //             ranges.forEach(range => {
    //                 const span = document.createElement('mark');
    //                 span.className = 'highlight';
    //                 span.style.backgroundColor = '#fef3c7';
    //                 span.style.padding = '0px 4px';
    //                 span.style.borderRadius = '4px';
    //                 span.style.display = 'inline';
    //                 try {
    //                     range.surroundContents(span);
    //                 } catch (e) {
    //                     // 如果无法包围内容，尝试其他方法
    //                     const contents = range.extractContents();
    //                     span.appendChild(contents);
    //                     range.insertNode(span);
    //                 }
    //             });
                
    //             console.log('高亮创建完成');
                
    //             // 使用 Rangy 序列化高亮数据
    //             const serializedData = serializeHighlights();
    //             console.log('序列化数据:', serializedData);
                
    //         const highlightData = {
    //             sectionId: sectionId,
    //             itemId: itemId,
    //                 serializedData: serializedData,
    //             timestamp: new Date().toISOString()
    //         };
            
    //             onHighlightSave(highlightData);
                
    //             // 自动保存到数据库
    //             saveHighlightsToDatabase(highlightData);
    //         } catch (error) {
    //             console.error('创建高亮失败:', error);
    //         }
    //     } else {
    //         console.log('Rangy 未初始化或没有选中文本');
    //         console.log('rangyRef.current 存在:', !!rangyRef.current);
    //         console.log('selectedText 存在:', !!selectedText);
    //     }
        
    //     // 清除选择，但不显示工具提示
    //     clearSelection();
    // };

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

    // 暂时注释掉高亮功能相关的方法
    // const removeAllHighlights = () => {
    //     if (markInstanceRef.current) {
    //         try {
    //             // 使用 Mark.js 清除所有高亮
    //             markInstanceRef.current.unmark();
    //             console.log('已清除所有高亮');
    //         } catch (error) {
    //             console.error('清除高亮失败:', error);
    //         }
    //     }
    // };

    // const getHighlights = () => {
    //     try {
    //         // 获取所有高亮元素
    //         const highlightElements = document.querySelectorAll('.highlight');
    //         return Array.from(highlightElements);
    //     } catch (error) {
    //         console.error('获取高亮失败:', error);
    //         return [];
    //     }
    // };

    // const serializeHighlights = () => {
    //     try {
    //         // 简化的序列化：只存储高亮文本内容
    //         const highlightElements = document.querySelectorAll('.highlight');
    //         const highlights = Array.from(highlightElements).map(element => ({
    //             text: element.textContent,
    //             className: element.className
    //         }));
    //         return highlights;
    //     } catch (error) {
    //         console.error('序列化高亮失败:', error);
    //         return null;
    //     }
    // };

    // const deserializeHighlights = (data) => {
    //     if (data && Array.isArray(data) && markInstanceRef.current) {
    //         try {
    //             console.log('开始反序列化高亮数据:', data);
                
    //             // 使用 Mark.js 重新高亮文本
    //             data.forEach((highlight, index) => {
    //                 console.log(`处理高亮 ${index}:`, highlight);
    //                 if (highlight.text) {
    //                     markInstanceRef.current.mark(highlight.text, {
    //                         className: 'highlight',
    //                         element: 'mark',
    //                         done: (counter) => {
    //                             console.log(`反序列化高亮 ${index} 完成，标记了 ${counter} 个匹配项`);
    //                         }
    //                     });
    //                 }
    //             });
                
    //             console.log('反序列化完成');
    //         } catch (error) {
    //             console.error('反序列化高亮失败:', error);
    //         }
    //     }
    // };

    // 获取所有文本节点的辅助函数
    const getTextNodes = (element) => {
        const textNodes = [];
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }
        return textNodes;
    };

    // 暂时注释掉高亮数据库相关功能
    // const loadHighlightsFromDatabase = async (sectionId, itemId) => {
    //     // 防止重复加载
    //     if (highlightsLoadedRef.current) {
    //         return;
    //     }
        
    //     try {
    //         const response = await fetch(`/api/highlights?sectionId=${sectionId}&itemId=${itemId}`);
    //         const result = await response.json();
            
    //         if (result.success && result.highlights.length > 0) {
    //             const latestHighlight = result.highlights[0];
    //             if (latestHighlight.serializedData) {
    //                 setTimeout(() => {
    //                     deserializeHighlights(latestHighlight.serializedData);
    //                     highlightsLoadedRef.current = true; // 标记为已加载
    //                 }, 100);
    //             }
    //         } else {
    //             highlightsLoadedRef.current = true; // 即使没有数据也标记为已加载
    //         }
    //     } catch (error) {
    //         console.error('加载高亮数据失败:', error);
    //         highlightsLoadedRef.current = true; // 出错时也标记为已加载
    //     }
    // };

    // const saveHighlightsToDatabase = async (highlightData) => {
    //     try {
    //         const response = await fetch('/api/highlights', {
    //             method: 'POST',
    //             cache: 'no-cache',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Cache-Control': 'no-cache'
    //             },
    //             body: JSON.stringify(highlightData)
    //         });
            
    //         const result = await response.json();
    //         if (result.success) {
    //             console.log('高亮数据保存成功');
    //         }
    //     } catch (error) {
    //         console.error('保存高亮数据失败:', error);
    //     }
    // };

    // 简化的内容渲染 - 只保留基本文本显示
    const renderContent = () => {
        return content;
    };

    // 暂时注释掉 Mark.js 初始化函数
    // const initializeMark = async () => {
    //     if (!contentRef.current) {
    //         console.log('contentRef.current 不存在，无法初始化 Mark.js');
    //         return false;
    //     }

    //     try {
    //         if (typeof window !== 'undefined') {
    //             // 创建 Mark.js 实例
    //             markInstanceRef.current = new Mark(contentRef.current);
    //             console.log('Mark.js 初始化成功:', markInstanceRef.current);
    //             return true;
    //         } else {
    //             console.log('非浏览器环境，跳过 Mark.js 初始化');
    //             return false;
    //         }
    //     } catch (error) {
    //         console.error('Mark.js 初始化失败:', error);
    //         return false;
    //     }
    // };

    // 暂时注释掉 Mark.js 相关的 useEffect
    // useEffect(() => {
    //     console.log('useEffect 触发 - mode:', mode, 'contentRef.current:', !!contentRef.current);
        
    //     if (contentRef.current && mode === 'highlight') {
    //         console.log('开始初始化 Mark.js，目标元素:', contentRef.current);
            
    //         // 清理之前的实例
    //         if (markInstanceRef.current) {
    //             markInstanceRef.current = null;
    //         }
            
    //         // 使用独立的初始化函数
    //         initializeMark().then(success => {
    //             if (success) {
    //                 console.log('Mark.js 初始化完成');
    //             }
    //         });
    //     } else {
    //         console.log('跳过 Mark.js 初始化 - contentRef.current:', !!contentRef.current, 'mode:', mode);
    //     }
        
    //     return () => {
    //         if (markInstanceRef.current) {
    //             markInstanceRef.current = null;
    //         }
    //     };
    // }, [mode, content, sectionId, itemId]);

    // 暂时注释掉自动加载高亮数据
    // useEffect(() => {
    //     if (sectionId && itemId && contentRef.current) {
    //         loadHighlightsFromDatabase(sectionId, itemId);
    //     }
    // }, []); // 空依赖数组，只在组件挂载时执行一次

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

    // 暂时注释掉全局清除高亮事件监听
    // useEffect(() => {
    //     const handleClearAllHighlights = () => {
    //         if (mode === 'highlight') {
    //             removeAllHighlights();
    //         }
    //     };

    //     window.addEventListener('clearAllHighlights', handleClearAllHighlights);
        
    //     return () => {
    //         window.removeEventListener('clearAllHighlights', handleClearAllHighlights);
    //     };
    // }, [mode]);

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

            {/* 暂时注释掉高亮模式工具提示 */}
            {/* {mode === 'highlight' && showTooltip && selectedText && (
                <div
                    className="fixed z-50 bg-gray-800 text-white px-3 py-2 rounded shadow-lg"
                    style={{
                        left: tooltipPosition.x,
                        top: tooltipPosition.y,
                        transform: 'translateX(-50%)'
                    }}
                >
                    <button
                        onClick={removeAllHighlights}
                        className="text-sm hover:text-red-300 transition-colors px-2 py-1 rounded bg-red-600 hover:bg-red-700"
                    >
                        清除所有高亮
                    </button>
                </div>
            )} */}

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
