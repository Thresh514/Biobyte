import { useState, useEffect } from 'react';

const ViewContent = ({ data, availableUnits, onUnitChange, selectedUnitId }) => {
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

    // 格式化文本函数
    const formatText = (text) => {
        if (typeof text !== 'string') return text;
        
        let formatted = text;
        
        // 处理粗体 **text**
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
        
        // 处理斜体 *text*
        formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic text-gray-800">$1</em>');
        
        // 处理项目符号 • 或 -
        formatted = formatted.replace(/^[\s]*[•\-]\s*(.+)$/gm, '<div class="flex items-start mb-2"><span class="text-gray-500 mr-3 mt-1 flex-shrink-0 text-sm">•</span><span class="flex-1 text-gray-700 leading-relaxed">$1</span></div>');
        
        // 处理数字列表 1. 2. 3.
        formatted = formatted.replace(/^[\s]*(\d+)\.\s*(.+)$/gm, '<div class="flex items-start mb-2"><span class="text-gray-600 mr-3 mt-1 flex-shrink-0 font-medium text-sm">$1.</span><span class="flex-1 text-gray-700 leading-relaxed">$2</span></div>');
        
        // 处理字母列表 a. b. c.
        formatted = formatted.replace(/^[\s]*([a-z])\.\s*(.+)$/gm, '<div class="flex items-start mb-2 ml-4"><span class="text-gray-500 mr-3 mt-1 flex-shrink-0 text-sm">$1.</span><span class="flex-1 text-gray-700 leading-relaxed">$2</span></div>');
        
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
                {/* 左侧导航栏 */}
                <div className="w-64 bg-gray-100 border-r border-gray-200 flex flex-col">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-darker">学习大纲</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        {availableUnits?.map((unit) => (
                            <button
                                key={unit.id}
                                onClick={() => onUnitChange && onUnitChange(unit)}
                                className={`w-full text-left p-3 mb-2 rounded-lg transition-colors ${
                                    selectedUnitId === unit.id
                                        ? 'bg-gray-800 text-white font-semibold'
                                        : 'bg-white text-gray-700 hover:bg-gray-200'
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

                {/* 右侧内容区 */}
                <div className="flex-1 p-8 text-center text-gray-500">
                    <div>请选择一个章节查看内容</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen">
            {/* 左侧导航栏 */}
            <div className="w-64 bg-gray-100 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-darker">学习大纲</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    {availableUnits?.map((unit) => (
                        <button
                            key={unit.id}
                            onClick={() => onUnitChange && onUnitChange(unit)}
                            className={`w-full text-left p-3 mb-2 rounded-lg transition-colors ${
                                selectedUnitId === unit.id
                                    ? 'bg-gray-800 text-white font-semibold'
                                    : 'bg-white text-gray-700 hover:bg-gray-200'
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

            {/* 右侧内容区 */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                    {/* 标题 */}
                    <div className="mb-8 border-b border-gray-200 pb-6">
                        <h1 className="text-2xl font-bold text-darker mb-2">
                            Unit {data.unit}: {data.title}
                        </h1>
                        <div className="text-sm text-gray-600">
                            {data.content?.length || 0} sections available
                        </div>
                    </div>

                    {/* 内容列表 */}
                    <div className="space-y-6">
                        {data.content?.map((section, sectionIndex) => (
                            <div key={sectionIndex} className="border border-gray-200 rounded-lg overflow-hidden shadow-md">
                                {/* 章节标题 */}
                                <button
                                    onClick={() => toggleSection(sectionIndex)}
                                    className="w-full px-6 py-4 bg-white hover:bg-gray-50 transition-colors text-left border-b border-gray-100"
                                >
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-semibold text-darker">
                                            {section.section}
                                        </h2>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-500">
                                                {section.items?.length || 0} items
                                            </span>
                                            <svg
                                                className={`w-5 h-5 text-gray-500 transition-transform ${
                                                    expandedSections.has(sectionIndex) ? 'rotate-180' : ''
                                                }`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </button>

                                {/* 章节内容 */}
                                {expandedSections.has(sectionIndex) && (
                                    <div className="p-6 bg-gray-50">
                                        <div className="space-y-4">
                                            {section.items?.map((item, itemIndex) => (
                                                <div key={itemIndex} className="border border-gray-200 rounded-lg bg-white shadow-sm">
                                                    {/* 项目标题 */}
                                                    <button
                                                        onClick={() => toggleItem(sectionIndex, itemIndex)}
                                                        className="w-full px-4 py-3 bg-white hover:bg-gray-50 transition-colors text-left border-b border-gray-100"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <h3 className="text-sm font-medium text-darker pr-4">
                                                                {item.title}
                                                            </h3>
                                                            <svg
                                                                className={`w-4 h-4 text-gray-600 transition-transform flex-shrink-0 ${
                                                                    expandedItems.has(`${sectionIndex}-${itemIndex}`) ? 'rotate-180' : ''
                                                                }`}
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M19 9l-7 7-7-7"
                                                                />
                                                            </svg>
                                                        </div>
                                                    </button>

                                                    {/* 项目内容 */}
                                                    {expandedItems.has(`${sectionIndex}-${itemIndex}`) && (
                                                        <div className="p-4 bg-white">
                                                            <div className="space-y-3">
                                                                {item.content?.map((contentItem, contentIndex) => (
                                                                    <div
                                                                        key={contentIndex}
                                                                        className="text-sm text-gray-700"
                                                                        dangerouslySetInnerHTML={{ __html: formatText(contentItem) }}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewContent;
