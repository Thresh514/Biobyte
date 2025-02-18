import "../styles/globals.css"; // 引入 TailwindCSS 的全局样式
import { useEffect, useState } from "react";
import FloatingFeedbackButton from "../components/FloatingFeedbackButton";
import FAQButton from "../components/FAQButton";
import Chatbot from "../components/Chatbot";
import Scrolldown from "../components/Scrolldown";

export default function MyApp({ Component, pageProps }) {
    const [activeComponent, setActiveComponent] = useState(null); // 用于管理当前打开的组件

    useEffect(() => {
    // 这里可以添加一些初始化逻辑，例如:
    console.log("应用已加载");
    }, []);

    return (
        <>
            <Component {...pageProps} />
            <div className="fixed bottom-16 right-16 z-50 flex flex-col items-end space-y-4">
                <Chatbot activeComponent={activeComponent} setActiveComponent={setActiveComponent} />
                <FloatingFeedbackButton activeComponent={activeComponent} setActiveComponent={setActiveComponent}/>
                <FAQButton />
            </div>
            <Scrolldown />
        </>
    );
}

