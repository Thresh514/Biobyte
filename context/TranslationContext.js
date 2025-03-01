import { createContext, useState, useContext, useEffect } from "react";
import en from "../public/locales/en.json";
import zh from "../public/locales/zh.json";

const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
    const [language, setLanguage] = useState("en");

    // 读取本地存储的语言设置
    useEffect(() => {
        const savedLanguage = localStorage.getItem("language");
        if (savedLanguage) {
            setLanguage(savedLanguage);
        }
    }, []);

    // 语言字典
    const translations = { en, zh };

    // 翻译函数
    const t = (key) => translations[language][key] || key;

    // 切换语言
    const changeLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem("language", lang); // 记住用户选择
    };

    return (
        <TranslationContext.Provider value={{ t, language, changeLanguage }}>
            {children}
        </TranslationContext.Provider>
    );
};

// 让组件可以使用 `useTranslation`
export const useTranslation = () => useContext(TranslationContext);
