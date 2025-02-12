import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import Unit from "../../components/Unit";
import Footer from "../../components/Footer";

export default function ChapterDetail() {
    const router = useRouter();
    const { id } = router.query;
    const [finalId, setFinalId] = useState(null);
    
    useEffect(() => {
        if (id) {
            console.log("当前 id:", id);
            setFinalId(id);
        }
    }, [id]);

    const file_name = {
        "mindmaps-as-biology": { 
            title: "AS 生物思维导图", 
            description: "这是一门关于 AS 生物的课程" ,
            image: "/images/mindmaps-as-biology.jpg",
            price: 9.99,
            options: ["Chapter 1", "Chapter 2", "Chapter 3", "Chapter 4", "Chapter 5", "Chapter 6", "Chapter 7", "Chapter 8", "Chapter 9", "Chapter 10", "Chapter 11", "Chapter 12"], },

        "mindmaps-a2-biology": { 
            title: "A2 生物思维导图", 
            description: "这是一门关于 A2 生物的课程",
            image: "/images/mindmaps-as-biology.jpg",
            price: 12.99,
            options: ["Chapter 1", "Chapter 2", "Chapter 3", "Chapter 4", "Chapter 5", "Chapter 6", "Chapter 7", "Chapter 8"]},

        "syllabus-analysis-as-biology": { 
            title: "AS 生物考纲解析", 
            description: "这是一门关于AS生物的课程",
            image: "/images/mindmaps-as-biology.jpg",
            price: 10.99,
            options: ["PDF"]},

        "syllabus-analysis-a2-biology": { 
            title: "A2 生物考纲解析", 
            description: "这是一门关于A2生物的课程",
            image: "/images/mindmaps-as-biology.jpg",
            price: 13.99,
            options: ["PDF"]},
    };

    if (!finalId) {
        return <div>加载中...</div>;
    }

    const course = file_name[finalId];

    if (!course) return <div>找不到该课程:{finalId}</div>;

    return (
        <div>
            <Head>
                <title>{course.title}</title>
                <meta name="description" content={course.description} />
            </Head>
            <Header />
            <Navbar />
            <main className="pt-48 min-h-screen">
                <Unit 
                title={course.title} 
                description={course.description}
                image={course.image}
                price={course.price}
                options={course.options}
                />
            </main>
            <Footer />
        </div>
    );
}
