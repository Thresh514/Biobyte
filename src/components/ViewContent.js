import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import InteractiveText from './InteractiveText';

const ViewContent = ({ data, availableUnits, onUnitChange, selectedUnitId, interactiveMode = 'none' }) => {
    const [expandedSections, setExpandedSections] = useState(new Set());
    const [expandedItems, setExpandedItems] = useState(new Set());

    // 默认展开所有sections和items
    useEffect(() => {
        if (data?.content) {
            const allSections = new Set();
            const allItems = new Set();
            
            data.content.forEach((section, sectionIndex) => {
                allSections.add(sectionIndex);
                section.items?.forEach((item, itemIndex) => {
                    allItems.add(`${sectionIndex}-${itemIndex}`);
                });
            });
            
            setExpandedSections(allSections);
            setExpandedItems(allItems);
        }
    }, [data]);

    // 简化的处理函数 - 只保留UI交互
    const handleHighlightSave = (highlightData) => {
        console.log('高亮保存:', highlightData);
        // 这里可以集成你选择的轮子
    };

    const handleAnnotationSave = (annotationData) => {
        console.log('注释保存:', annotationData);
        // 这里可以集成你选择的轮子
    };

    const handleAITutorAsk = (text) => {
        console.log('AI Tutor 询问:', text);
        return '这是AI导师的回答示例。';
    };

    // 格式化文本函数
    const formatText = (text) => {
        if (typeof text !== 'string') return text;
        
        let formatted = text;
        
        // 处理粗体 **text**
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
        
        // 处理斜体 *text*
        formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic text-gray-800">$1</em>');
        
        // 处理项目符号 • 或 -
        formatted = formatted.replace(/^[\s]*[•\-]\s*(.+)$/gm, '<div class="flex items-start mb-2"><span class="text-gray-500 mr-3 mt-1 flex-shrink-0 text-base">•</span><span class="flex-1 text-gray-700 leading-relaxed">$1</span></div>');
        
        // 处理数字列表 1. 2. 3.
        formatted = formatted.replace(/^[\s]*(\d+)\.\s*(.+)$/gm, '<div class="flex items-start mb-2"><span class="text-gray-600 mr-3 mt-1 flex-shrink-0 font-medium text-base">$1.</span><span class="flex-1 text-gray-700 leading-relaxed">$2</span></div>');
        
        // 处理字母列表 a. b. c.
        formatted = formatted.replace(/^[\s]*([a-z])\.\s*(.+)$/gm, '<div class="flex items-start mb-2 ml-4"><span class="text-gray-500 mr-3 mt-1 flex-shrink-0 text-base">$1.</span><span class="flex-1 text-gray-700 leading-relaxed">$2</span></div>');
        
        // 处理缩进（以2个或更多空格开头）
        formatted = formatted.replace(/^(\s{2,})(.+)$/gm, '<div class="ml-6 mb-2 text-gray-600 leading-relaxed">$2</div>');
        
        // 处理空行
        formatted = formatted.replace(/\n\s*\n/g, '<div class="mb-3"></div>');
        
        // 处理普通换行
        formatted = formatted.replace(/\n/g, '<br>');
        
        return formatted;
    };

    const toggleSection = (sectionIndex) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(sectionIndex)) {
            newExpanded.delete(sectionIndex);
        } else {
            newExpanded.add(sectionIndex);
        }
        setExpandedSections(newExpanded);
    };

    const toggleItem = (sectionIndex, itemIndex) => {
        const key = `${sectionIndex}-${itemIndex}`;
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(key)) {
            newExpanded.delete(key);
        } else {
            newExpanded.add(key);
        }
        setExpandedItems(newExpanded);
    };

    if (!data) {
        return (
            <div className="flex h-screen">
                <div className="w-full p-8 text-center text-gray-500">
                    <div className="text-lg">请选择一个章节查看内容</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full pt-24 pl-24">
            {/* 右侧内容区 */}
            <div className="overflow-y-auto zoom-target">
                <div className="p-6">
                    {/* 标题 */}
                    <div className="mb-8 border-b border-gray-200 pb-6">
                        <h1 className="text-3xl font-bold text-darker mb-2">
                            Unit {data.unit}: {data.title}
                        </h1>
                        <div className="text-base text-gray-600">
                            {data.content?.length || 0} sections available
                        </div>
                    </div>

                    {/* 内容列表 */}
                    <div className="space-y-6">
                        {data.content?.map((section, sectionIndex) => (
                            <div key={sectionIndex} className="overflow-hidden">
                                {/* 章节标题 */}
                                <button
                                    onClick={() => toggleSection(sectionIndex)}
                                    className="w-full px-6 py-4 rounded-md hover:bg-gray-50 transition-colors text-left border-b border-gray-100"
                                >
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-semibold text-darker">
                                            {section.section}
                                        </h2>
                                        <div className="flex items-center space-x-2">
                                            <ChevronDown
                                                className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                                                    expandedSections.has(sectionIndex) ? 'rotate-180' : ''
                                                }`}
                                            />
                                        </div>
                                    </div>
                                </button>

                                {/* 章节内容 */}
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                    expandedSections.has(sectionIndex) 
                                        ? 'opacity-100' 
                                        : 'max-h-0 opacity-0'
                                }`}>
                                    <div className="p-6">
                                        <div className="space-y-4">
                                            {section.items?.map((item, itemIndex) => (
                                                <div key={itemIndex}>
                                                    {/* 项目标题 */}
                                                    <button
                                                        onClick={() => toggleItem(sectionIndex, itemIndex)}
                                                        className="w-full px-4 py-3 rounded-md hover:bg-gray-50 transition-colors text-left"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <h3 className="text-base font-medium text-darker pr-4">
                                                                {item.title}
                                                            </h3>
                                                            <ChevronDown
                                                                className={`w-4 h-4 text-gray-600 transition-transform duration-200 flex-shrink-0 ${
                                                                    expandedItems.has(`${sectionIndex}-${itemIndex}`) ? 'rotate-180' : ''
                                                                }`}
                                                            />
                                                        </div>
                                                    </button>

                                                    {/* 项目内容 */}
                                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                                        expandedItems.has(`${sectionIndex}-${itemIndex}`) 
                                                            ? 'opacity-100' 
                                                            : 'max-h-0 opacity-0'
                                                    }`}>
                                                        <div className="p-4">
                                                            <div className="space-y-3">
                                                                {item.content?.map((contentItem, contentIndex) => (
                                                                    <InteractiveText
                                                                        key={contentIndex}
                                                                        content={formatText(contentItem)}
                                                                        mode={interactiveMode}
                                                                        onHighlightSave={handleHighlightSave}
                                                                        onAnnotationSave={handleAnnotationSave}
                                                                        onAITutorAsk={handleAITutorAsk}
                                                                        sectionId={section.section_id || null}
                                                                        itemId={item.item_id || null}
                                                                        className="text-base text-gray-700"
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewContent;
