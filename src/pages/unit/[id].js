import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import Navbar from "../../components/Navbar";
import Unit from "../../components/Unit";
import Footer from "../../components/Footer";

export default function ChapterDetail() {
    const router = useRouter();
    const { id, chapter, type } = router.query;
    const [course, setCourse] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);

    // ✅ 定义 selectedOption 状态
    useEffect(() => {
        if (!router.isReady || !id) return;
    
        console.log("useEffect triggered with id:", id, "chapter:", chapter);
    
        fetch(`/api/getResource?id=${id}`)
            .then((res) => res.json())
            .then((data) => {
                console.log("Fetched Data:", data);
                if (data.message) {
                    console.error("Error fetching resource:", data.message);
                } else {
                    setCourse({ ...data });
                    console.log("Updated Course Title:", data.title);
    
                    if (Array.isArray(data.options) && data.options.length > 0) {
                        const initialOption = data.options.find(opt => opt.chapter === `Chapter ${chapter}`) || data.options[0];
                        setSelectedOption(initialOption);
                    } else {
                        setSelectedOption(null);
                    }
                }
            })
            .catch((error) => console.error("Error:", error));
    }, [id, type, chapter]);
    

    if (!course) {
        return <div>加载中...</div>;
    }

    return (
        <div>
            <Head>
                <title>{course?.title || "加载中..."}</title>
                <meta name="description" content={course.description} />
            </Head>
            <Navbar />
            <main className="pt-48 min-h-screen">
            {course ? (
                <Unit 
                    key={course.title} // 🔥 确保 title 变化时，Unit.js 重新渲染
                    title={course.title} 
                    description={course.description}
                    image={selectedOption ? selectedOption.image : course.image}
                    price={selectedOption ? selectedOption.price : course.price}
                    options={course.options}
                    type={course.type}
                    file_path={selectedOption ? selectedOption.file_path : course.file_path}
                    onSelectOption={(option) => {
                        router.push(`/unit/${id}?chapter=${option.chapter.split(" ")[1]}`, undefined, { shallow: true });
                        setSelectedOption(option);
                    }}
                />
            ) : (
                <div>加载中...</div> // ✅ 先显示 loading，避免渲染旧的 title
            )}
        </main>
            <Footer />
        </div>
    );
}
