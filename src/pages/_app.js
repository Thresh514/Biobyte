import '../styles/globals.css'; // 导入全局样式
import "aos/dist/aos.css"; // 导入 AOS 样式
import { useEffect } from "react";
import AOS from "aos";

function MyApp({ Component, pageProps }) {
    useEffect(() => {
        AOS.init({ 
            duration: 700, 
            once: false, 
            mirror: true,
        }); // 初始化 AOS
    }, []);

    return <Component {...pageProps} />;
}

export default MyApp;