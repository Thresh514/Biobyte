import "../styles/globals.css"; // 引入 TailwindCSS 的全局样式
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Chatbot from "../components/Chatbot";
import Scrolldown from "../components/Scrolldown";
import { TranslationProvider } from "../../context/TranslationContext";
import TranslatorButton from "../components/TranslatorButton";
import Head from "next/head";

// 确保使用纯客户端渲染，不要添加 getStaticProps 或 getServerSideProps
function MyApp({ Component, pageProps }) {
    const [activeComponent, setActiveComponent] = useState(null); // 用于管理当前打开的组件
    const [currentUser, setCurrentUser] = useState(null);
    const [userOrders, setUserOrders] = useState([]);
    const router = useRouter();
    const isHomePage = router.pathname === "/";

    // 获取用户数据的函数
    const fetchUserData = async () => {
        // 确保所有数据获取都在客户端进行
        if (typeof window === 'undefined') return;

        try {
            // 使用cookie的auth check来获取登录态与用户信息
            const authResponse = await fetch("/api/auth/check", {
                method: "GET",
                credentials: "include",
            });

            const authData = await authResponse.json();

            if (!authData?.isAuthenticated || !authData?.user) {
                setCurrentUser(null);
                setUserOrders([]);
                return;
            }

            setCurrentUser(authData.user);

            // 获取订单历史（cookie会自动携带token）
            const ordersResponse = await fetch("/api/orders", {
                method: "GET",
                credentials: "include",
            });

            if (ordersResponse.ok) {
                const ordersData = await ordersResponse.json();

                // 格式化订单数据（兼容不同字段命名）
                const formattedOrders = Array.isArray(ordersData)
                    ? ordersData.map((order) => ({
                        id: order.study_resource_id ?? order.studyResourceId ?? order.id,
                        date: order.purchase_date ?? order.purchaseDate ?? order.created_at ?? order.createdAt,
                        products: order.title ? [order.title] : (order.products ?? []),
                        type: order.type,
                        level: order.level,
                        chapter: order.chapter,
                        price: order.price,
                    }))
                    : [];

                setUserOrders(formattedOrders);
            } else {
                setUserOrders([]);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            setCurrentUser(null);
            setUserOrders([]);
        }
    };

    useEffect(() => {
        // 初始化时获取数据
        fetchUserData();
        
        // 定期刷新数据（每5分钟）
        const refreshInterval = setInterval(fetchUserData, 300000);

        return () => {
            clearInterval(refreshInterval);
        };
    }, []);
    return (
        <>
            <Head>
                <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
            </Head>
            <TranslationProvider>
                <Component {...pageProps} />
                <div className="fixed bottom-8 lg:bottom-16 right-4 lg:right-16 z-50 flex flex-col items-end space-y-4">
                    <Chatbot 
                        activeComponent={activeComponent} 
                        setActiveComponent={setActiveComponent}
                        user={currentUser}
                        orderHistory={userOrders}
                    />
                    <TranslatorButton />
                </div>
                {isHomePage && <Scrolldown />}
            </TranslationProvider>
        </>
    );
}

export default MyApp;

