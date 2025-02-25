import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import Navbar from "../../components/Navbar";
import Unit from "../../components/Unit";
import Footer from "../../components/Footer";

export default function ChapterDetail() {
    const router = useRouter();
    const { id, chapter } = router.query;
    const [course, setCourse] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    
    useEffect(() => {
        if (id) {
            fetch(`/api/getResource?id=${id}`)
                .then((res) => res.json())
                .then((data) => {
                console.log("Fetched Data:", data);
                if (data.message) {
                    console.error("Error fetching resource:", data.message);
                } else {
                    setCourse(data);

                    if (Array.isArray(data.options) && data.options.length > 0) {
                        // ✅ 如果 URL 里有 `chapter`，找到对应章节
                        const initialOption = data.options.find(opt => opt.chapter === `Chapter ${chapter}`) || data.options[0];
                        setSelectedOption(initialOption);
                    } else {
                        setSelectedOption(null);
                    }
                }
                })
                .catch((error) => console.error("Error:", error));
        }
    }, [id, chapter]);

    if (!course) {
        return <div>加载中...</div>;
    }

    return (
        <div>
            <Head>
                <title>{course.title}</title>
                <meta name="description" content={course.description} />
            </Head>
            <Navbar />
            <main className="pt-48 min-h-screen">
                <Unit 
                title={course.title} 
                description={course.description}
                image={selectedOption ? selectedOption.image : course.image}
                price={selectedOption ? selectedOption.price : course.price}
                options={course.options}
                file_path={selectedOption ? selectedOption.file_path : course.file_path}
                onSelectOption={(option) => {
                    // ✅ 切换章节时，更新 URL（不会刷新页面）
                    router.push(`/unit/${id}?chapter=${option.chapter.split(" ")[1]}`, undefined, { shallow: true });
                    setSelectedOption(option);
                }}
                />
            </main>
            <Footer />
        </div>
    );
}
