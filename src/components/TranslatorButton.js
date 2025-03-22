import { AiOutlineTranslation } from "react-icons/ai";
import { useTranslation } from "../../context/TranslationContext";


const TranslatorButton = () => {
    const { language, changeLanguage } = useTranslation();
    return (
        <button 
            className="hidden bg-gray-400 text-white p-4 rounded-full hover:scale-110 transition duration-300 ease-out" 
            onClick={() => changeLanguage(language === "en" ? "zh" : "en")}>
                <AiOutlineTranslation size={24} />
        </button>
    );
};

export default TranslatorButton;