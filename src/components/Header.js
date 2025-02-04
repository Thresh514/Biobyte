import { useState } from 'react';

export default function Header() {
    const [searchQuery, setSearchQuery] = useState('');
    

    const handleSearch = (e) => {
        e.preventDefault();
        console.log("Search query:", searchQuery); // 这里可以实现具体的搜索逻辑
    };

    return (
        <header className="flex bg-gradient-to-b from-lighter to-lightest text-darkest p-5 fixed top-0 left-0 right-0 z-50">
            <h1 className="text-4xl font-bold ml-12 mt-1">Biomind Logic</h1>
            <form
                onSubmit={handleSearch}
                className="fixed right-10 top-5 items-center bg-white rounded-full px-4 py-1 shadow-md"
                >
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="border-none outline-none p-2 w-[300px] px-2 text-sm"
                    />
                    <button
                        type="submit"
                        className="text-gray-500 hover:text-black ml-2"
                    >
                        🔍
                    </button>
            </form>
        </header>
    );
}