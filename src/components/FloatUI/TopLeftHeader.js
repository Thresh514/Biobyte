import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, Undo, Redo } from 'lucide-react';

const TopLeftHeader = ({ currentUnit, onUndo, onRedo, mindmapTitle, isMindmap }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchResults, setSearchResults] = useState({
        total: 0,
        current: 0,
        matches: []
    });
    const [isSearching, setIsSearching] = useState(false);
    const searchInputRef = useRef(null);
    const searchTimeoutRef = useRef(null);
    const markInstanceRef = useRef(null);

    // 搜索功能实现
    const performSearch = async (query) => {
        if (!query.trim()) {
            clearSearch();
            return;
        }

        setIsSearching(true);
        
        try {
            // 获取页面中所有可搜索的文本内容
            const searchableElements = document.querySelectorAll('.searchable-content, .interactive-text');
            let totalMatches = 0;
            const matches = [];

            // 清除之前的高亮
            if (markInstanceRef.current) {
                markInstanceRef.current.unmark();
            }

            // 在每个可搜索元素中查找匹配项
            searchableElements.forEach((element, elementIndex) => {
                const text = element.textContent || element.innerText;
                const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                const elementMatches = [...text.matchAll(regex)];
                
                // 使用 Mark.js 高亮匹配项
                if (elementMatches.length > 0 && window.Mark) {
                    const markInstance = new window.Mark(element);
                    markInstance.mark(query, {
                        className: 'search-highlight',
                        element: 'mark',
                        done: (counter) => {
                            console.log(`在元素 ${elementIndex} 中找到 ${counter} 个匹配项`);
                            
                            // 在Mark.js完成后，重新获取高亮元素并创建匹配项
                            const highlights = element.querySelectorAll('.search-highlight');
                            highlights.forEach((highlight, highlightIndex) => {
                                const globalIndex = totalMatches + highlightIndex;
                                matches.push({
                                    element: highlight,
                                    parentElement: element,
                                    elementIndex,
                                    matchIndex: globalIndex,
                                    text: highlight.textContent,
                                    index: highlight.textContent.length > 0 ? text.indexOf(highlight.textContent) : -1
                                });
                            });
                            
                            totalMatches += highlights.length;
                        }
                    });
                }
            });

            // 等待所有Mark.js完成后再设置结果
            setTimeout(() => {
                setSearchResults({
                    total: totalMatches,
                    current: totalMatches > 0 ? 1 : 0,
                    matches
                });

                // 滚动到第一个匹配项
                if (matches.length > 0) {
                    scrollToMatch(matches[0]);
                }
            }, 100);

        } catch (error) {
            console.error('搜索出错:', error);
        } finally {
            setIsSearching(false);
        }
    };

    // 清除搜索
    const clearSearch = () => {
        // 清除所有搜索高亮
        const allHighlights = document.querySelectorAll('.search-highlight');
        allHighlights.forEach(highlight => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize();
        });
        
        setSearchResults({
            total: 0,
            current: 0,
            matches: []
        });
    };

    // 滚动到指定匹配项
    const scrollToMatch = (match) => {
        if (match && match.element) {
            // 先清除所有当前高亮
            const allHighlights = document.querySelectorAll('.search-highlight');
            allHighlights.forEach(highlight => {
                highlight.classList.remove('current-search-highlight');
            });
            
            // 找到当前匹配项并高亮
            const currentHighlight = Array.from(allHighlights).find(highlight => {
                const text = highlight.textContent;
                const parentText = highlight.parentElement.textContent;
                const index = parentText.indexOf(text);
                return index === match.index;
            });
            
            if (currentHighlight) {
                currentHighlight.classList.add('current-search-highlight');
                
                // 滚动到当前高亮元素
                currentHighlight.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center',
                    inline: 'center'
                });
            } else {
                // 如果找不到对应的highlight，直接滚动到元素
                match.element.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center',
                    inline: 'center'
                });
            }
        }
    };

    // 导航到上一个匹配项
    const goToPreviousMatch = () => {
        if (searchResults.total === 0) return;
        
        const newCurrent = searchResults.current > 1 
            ? searchResults.current - 1 
            : searchResults.total;
        
        setSearchResults(prev => {
            const match = prev.matches[newCurrent - 1];
            if (match) {
                scrollToMatch(match);
            }
            return { ...prev, current: newCurrent };
        });
    };

    // 导航到下一个匹配项
    const goToNextMatch = () => {
        if (searchResults.total === 0) return;
        
        const newCurrent = searchResults.current < searchResults.total 
            ? searchResults.current + 1 
            : 1;
        
        setSearchResults(prev => {
            const match = prev.matches[newCurrent - 1];
            if (match) {
                scrollToMatch(match);
            }
            return { ...prev, current: newCurrent };
        });
    };

    // 处理搜索输入变化
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        // 防抖搜索
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => {
            performSearch(query);
        }, 300);
    };

    // 处理搜索框关闭
    const handleSearchClose = () => {
        setIsSearchOpen(false);
        clearSearch();
        setSearchQuery('');
    };

    // 键盘事件处理
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            handleSearchClose();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (e.shiftKey) {
                goToPreviousMatch();
            } else {
                goToNextMatch();
            }
        }
    };

    // 当搜索框打开时聚焦输入框
    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            // 使用setTimeout确保DOM已渲染
            setTimeout(() => {
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                }
            }, 100);
        }
    }, [isSearchOpen]);

    return (
        <>
            <style jsx>{`
                .search-highlight {
                    background-color: #fef3c7 !important;
                    padding: 0 !important;
                    border-radius: 3px !important;
                    display: inline !important;
                    color: #000 !important;
                    font-weight: 500 !important;
                }
                
                .current-search-highlight {
                    background-color: #f59e0b !important;
                    padding: 0 !important;
                    border-radius: 3px !important;
                    display: inline !important;
                    color: #fff !important;
                    font-weight: 600 !important;
                }
            `}</style>
            <div className="flex items-center space-x-3 bg-white py-1 px-3 rounded-md shadow-sm">
                <Link href="/" className="flex items-center">
                    <div className="w-12 h-12 bg-white flex items-center justify-center">
                        <Image src="/whiteicon.svg" alt="logo" width={64} height={64} />
                    </div>
                </Link>
                
                {(currentUnit || (isMindmap && mindmapTitle)) && (
                    <div className="p-2 bg-white flex-shrink-0 max-w-xs">
                        <span className="font-semibold text-gray-800 text-md whitespace-nowrap">
                            {isMindmap && mindmapTitle 
                                ? mindmapTitle
                                : currentUnit 
                                    ? `Unit ${currentUnit.id}: ${currentUnit.name}`
                                    : ''
                            }
                        </span>
                    </div>
                )}

                <div className="relative">
                    {/* 搜索按钮 */}
                    <button
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="搜索"
                    >
                        <Search className="w-6 h-6 text-gray-600" />
                    </button>

                    {/* 下拉搜索框 */}
                    <div className={`absolute top-12 left-1/2 transform -translate-x-1/2 mt-2 w-96 bg-white rounded-md shadow-sm border border-gray-100 z-30 transition-all duration-300 ease-in-out ${
                        isSearchOpen 
                            ? 'opacity-100 translate-y-0' 
                            : 'opacity-0 -translate-y-2 pointer-events-none'
                    }`}>
                        <div className="px-3 py-2">
                            <div className="relative p-2 flex items-center justify-center space-x-2">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Find in document"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    onKeyDown={handleKeyDown}
                                    className="w-full px-3 py-2 bg-white rounded-lg border-2 border-gray-300 focus:outline-none focus:border-purple-500 transition-colors"
                                    autoFocus={isSearchOpen}
                                />
                                
                                {/* 搜索结果计数和导航 */}
                                {searchQuery && searchResults.total > 0 && (
                                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 px-2">
                                        <span className="text-sm text-gray-600 font-medium">
                                            {searchResults.current} of {searchResults.total}
                                        </span>
                                        <div className="flex items-center space-x-1 ml-2">
                                            <button 
                                                onClick={goToPreviousMatch}
                                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                title="Previous match (Shift+Enter)"
                                            >
                                                <ChevronLeft className="w-4 h-4 text-gray-500" />
                                            </button>
                                            <button 
                                                onClick={goToNextMatch}
                                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                title="Next match (Enter)"
                                            >
                                                <ChevronRight className="w-4 h-4 text-gray-500" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                                
                                {/* 搜索状态指示器 */}
                                {isSearching && (
                                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-purple-500"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center bg-white overflow-hidden space-x-2">
                    <button
                        onClick={onUndo}
                        className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                        title="Undo"
                    >
                        <Undo className="w-6 h-6 text-gray-600" />
                    </button>
                    <button
                        onClick={onRedo}
                        className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                        title="Redo"
                    >
                        <Redo className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
            </div>
        </>
    );
};

export default TopLeftHeader;
