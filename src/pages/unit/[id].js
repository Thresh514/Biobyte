import { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";
import Head from "next/head";
import Navbar from "../../components/Navbar";
import Unit from "../../components/Unit";
import Footer from "../../components/Footer";

export default function ChapterDetail() {
    const router = useRouter();
    const { id } = router.query;
    const [course, setCourse] = useState(null);
    const [currentPath, setCurrentPath] = useState("");

    // 获取资源类型的辅助函数
    const getResourceType = (path) => {
        if (path.includes('syllabus-analysis')) return 'Syllabus Analysis';
        if (path.includes('mindmap')) return 'Mindmap';
        return null;
    };

    useEffect(() => {
        if (!router.isReady) return;

        const title = decodeURIComponent(id || "");
        console.log("🔍 当前 URL:", title);
        console.log("🔄 当前路径:", router.asPath);

        // 检查资源类型是否改变
        const currentType = getResourceType(currentPath);
        const newType = getResourceType(router.asPath);

        // 如果类型改变，强制刷新页面
        if (currentType && newType && currentType !== newType) {
            console.log("🔄 资源类型改变，强制刷新页面");
            window.location.href = router.asPath;
            return;
        }

        // 检查路径是否改变
        if (currentPath === router.asPath) {
            console.log("🔄 路径未改变，跳过数据获取");
            return;
        }

        // 更新当前路径
        setCurrentPath(router.asPath);
        
        // 处理 URL 格式
        let queryTitle = title;
        if (title === 'as-syllabus-analysis') {
            queryTitle = 'AS Syllabus Analysis';
        } else if (title === 'a2-syllabus-analysis') {
            queryTitle = 'A2 Syllabus Analysis';
        } else if (title === 'as-mindmap') {
            queryTitle = 'AS Mindmap';
        } else if (title === 'a2-mindmap') {
            queryTitle = 'A2 Mindmap';
        }

        console.log("🔍 处理后的资源标题:", queryTitle);

        fetch(`/api/getResource?title=${encodeURIComponent(queryTitle)}`)
            .then(async (res) => {
                if (!res.ok) {
                    const errorData = await res.json();
                    console.error("❌ API 错误:", errorData);
                    throw new Error(errorData.error || "获取资源失败");
                }
                return res.json();
            })
            .then((data) => {
                console.log("✅ 获取数据成功:", data);
                setCourse(data);
            })
            .catch((error) => {
                console.error("❌ 错误:", error);
                // 错误处理：可以设置一个错误状态或显示错误消息
            });
    }, [router.isReady, id, router.asPath]);

    // 使用 useMemo 缓存渲染内容
    const content = useMemo(() => {
        return (
            <div>
                <Head>
                    <title>{course?.title || "课程详情"}</title>
                    <meta name="description" content={course?.description || ""} />
                </Head>
                <Navbar />
                <main className="pt-48 min-h-screen">
                    {course && (
                        <Unit 
                            {...course}
                            currentUrl={router.asPath}
                            key={router.asPath} // 添加 key 属性以强制组件重新渲染
                        />
                    )}
                </main>
                <Footer />
            </div>
        );
    }, [course, router.asPath]);

    return content;
}
