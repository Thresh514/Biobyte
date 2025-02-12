import "../styles/globals.css"; // 引入 TailwindCSS 的全局样式
import { useEffect } from "react";
import FloatingFeedbackButton from "../components/FloatingFeedbackButton";
import FAQButton from "../components/FAQButton";

export default function MyApp({ Component, pageProps }) {
    useEffect(() => {
    // 这里可以添加一些初始化逻辑，例如:
    console.log("应用已加载");
    }, []);

    return (
        <>
            <Component {...pageProps} />
            <div className="fixed bottom-16 right-16 flex flex-col items-end space-y-4">
                <FAQButton />
                <FloatingFeedbackButton />
            </div>
        </>
    );
}

