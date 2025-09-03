import { useState } from 'react';

const ViewContent = ({ data }) => {
    const [expandedSections, setExpandedSections] = useState(new Set());
    const [expandedItems, setExpandedItems] = useState(new Set());

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
            <div className="p-8 text-center text-gray-500">
                <div>No content available</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* 标题 */}
            <div className="mb-8 border-b border-gray-200 pb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Unit {data.unit}: {data.title}
                </h1>
                <div className="text-sm text-gray-600">
                    {data.content?.length || 0} sections available
                </div>
            </div>

            {/* 内容列表 */}
            <div className="space-y-6">
                {data.content?.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* 章节标题 */}
                        <button
                            onClick={() => toggleSection(sectionIndex)}
                            className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-800">
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
                            <div className="p-6 bg-white">
                                <div className="space-y-4">
                                    {section.items?.map((item, itemIndex) => (
                                        <div key={itemIndex} className="border border-gray-100 rounded-lg">
                                            {/* 项目标题 */}
                                            <button
                                                onClick={() => toggleItem(sectionIndex, itemIndex)}
                                                className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 transition-colors text-left"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-sm font-medium text-blue-800 pr-4">
                                                        {item.title}
                                                    </h3>
                                                    <svg
                                                        className={`w-4 h-4 text-blue-600 transition-transform flex-shrink-0 ${
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
                                                    <div className="space-y-2">
                                                        {item.content?.map((contentItem, contentIndex) => (
                                                            <div
                                                                key={contentIndex}
                                                                className="text-sm text-gray-700 leading-relaxed"
                                                            >
                                                                {contentItem}
                                                            </div>
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

            {/* 底部信息 */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
                <div>Content loaded from: {data.title}</div>
                <div className="mt-1">
                    Total sections: {data.content?.length || 0} | 
                    Total items: {data.content?.reduce((sum, section) => sum + (section.items?.length || 0), 0) || 0}
                </div>
            </div>
        </div>
    );
};

export default ViewContent;
