import React, { useState } from 'react';
import { HiOutlineChevronDoubleDown } from "react-icons/hi";

export default function Scrolldown() {
    return (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
            <button 
                className="bg-transparent pointer-events-none rounded-full p-2 animate-bounce"
            >
                <HiOutlineChevronDoubleDown size={40} />
            </button>
        </div>
    );
}
