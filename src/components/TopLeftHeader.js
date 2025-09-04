import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Undo, Redo } from 'lucide-react';

const TopLeftHeader = ({ currentUnit, onUndo, onRedo }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <div className="fixed top-4 left-4 z-20 pointer-events-auto">
            <div className="flex items-center space-x-3 bg-white py-1 px-3 rounded-md shadow-sm">
                <Link href="/" className="flex items-center">
                    <div className="w-12 h-12 bg-white flex items-center justify-center">
                        <Image src="/whiteicon.svg" alt="logo" width={64} height={64} />
                    </div>
                </Link>
                
                {currentUnit && (
                    <div className="p-2 bg-white">
                        <span className="font-semibold text-gray-800 text-md">
                            Unit {currentUnit.id}: {currentUnit.name}
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
                    <div className={`absolute top-12 left-1/2 transform -translate-x-1/2 mt-2 w-80 bg-white rounded-md shadow-sm border border-gray-100 z-30 transition-all duration-300 ease-in-out ${
                        isSearchOpen 
                            ? 'opacity-100 translate-y-0' 
                            : 'opacity-0 -translate-y-2 pointer-events-none'
                    }`}>
                        <div className="px-3 py-2">
                            <div className="relative p-2 flex items-center justify-center space-x-2">
                                <input
                                    type="text"
                                    placeholder="Find in document"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-3 py-1 bg-white rounded-lg border-2 border-gray-300 focus:outline-none focus:border-gray-200"
                                    autoFocus={isSearchOpen}
                                />
                                {searchQuery && (
                                    <div className="relative flex items-center space-x-1" style={{ right: 0, top: 0 }}>
                                        <button className="p-2 hover:bg-gray-100 rounded">
                                            <ChevronLeft className="w-4 h-4 text-gray-500" />
                                        </button>
                                        <button className="p-2 hover:bg-gray-100 rounded">
                                            <ChevronRight className="w-4 h-4 text-gray-500" />
                                        </button>
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
        </div>
    );
};

export default TopLeftHeader;
