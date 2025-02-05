import "../styles/globals.css"; // 引入 TailwindCSS 的全局样式
import { useEffect } from "react";

export default function MyApp({ Component, pageProps }) {
    useEffect(() => {
    // 这里可以添加一些初始化逻辑，例如:
    console.log("应用已加载");
    }, []);

    return <Component {...pageProps} />;
}
