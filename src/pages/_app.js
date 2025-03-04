import "../styles/globals.css"; // 引入 TailwindCSS 的全局样式
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Chatbot from "../components/Chatbot";
import Scrolldown from "../components/Scrolldown";
import { TranslationProvider } from "../../context/TranslationContext";
import TranslatorButton from "../components/TranslatorButton";

function MyApp({ Component, pageProps }) {
    const [activeComponent, setActiveComponent] = useState(null); // 用于管理当前打开的组件
    const router = useRouter();

    useEffect(() => {
    // 这里可以添加一些初始化逻辑，例如:
    console.log("应用已加载");
    }, []);

    return (
        <TranslationProvider>
            <Component {...pageProps} />
            <div className="fixed bottom-8 lg:bottom-16 right-4 lg:right-16 z-50 flex flex-col items-end space-y-4">
                <Chatbot activeComponent={activeComponent} setActiveComponent={setActiveComponent} />
                <TranslatorButton />
            </div>
            {router.pathname === "/" && <Scrolldown />}
        </TranslationProvider>
    );
}
export default (MyApp);

