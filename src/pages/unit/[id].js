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

    useEffect(() => {
        if (!router.isReady) return;

        // 如果是通过 shallow routing 切换章节，不重新获取数据
        if (router._shallow) {
            console.log("🔄 Shallow routing, 跳过数据获取");
            return;
        }
        
        const title = decodeURIComponent(id || "");
        console.log("🔍 原始 URL:", title);

        // 处理 URL 格式
        let queryTitle = title;
        if (title === 'as-syllabus-analysis') {
            queryTitle = 'AS Syllabus Analysis';
        } else if (title === 'a2-syllabus-analysis') {
            queryTitle = 'A2 Syllabus Analysis';
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
            });
    }, [router.isReady, id]);

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
                        />
                    )}
                </main>
                <Footer />
            </div>
        );
    }, [course, router.asPath]);

    return content;
}
