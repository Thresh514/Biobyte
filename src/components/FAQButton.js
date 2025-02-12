import Link from "next/link";
import { SlQuestion } from "react-icons/sl";

export default function FAQButton() {
    return (
        <Link href="/faq">
        <button 
            className="bg-gray-100 text-black p-4 rounded-full shadow-lg hover:scale-110 transition duration-300 ease-out"
            title="FAQ"
        >
            <SlQuestion size={24} />
        </button>
        </Link>
    );
}
