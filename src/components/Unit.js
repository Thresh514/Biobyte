import { useRouter } from 'next/router';
import chapterData from '../lib/SubjectsChapters.json';

const UnitPage = () => {
    const router = useRouter();
    const { category, level, subject, unit } = router.query; // 提取 URL 参数
    console.log("Dynamic Route Parameters:", { category, level, subject, unit });

    // 确保 router.query 已加载
    if (!category || !level || !subject || !unit) {
        return (
            <div className="max-w-7xl mx-auto md:w-2/3 pr-48 p-4">
                <h1 className="text-2xl font-bold mb-4">Loading...</h1>
                <p>Fetching the requested unit details.</p>
            </div>
        );
    }

    // 根据 `category`, `level`, 和 `subject` 找到章节数据
    const key = formatKey(category, level, subject);
    const unitData = chapterData[key]?.find((item) => item.unit === unit);

    // 如果找不到数据，返回 404 页面
    if (!unitData) {
        return (
            <div className="max-w-7xl mx-auto md:w-2/3 pr-48 p-4">
                <h1 className="text-2xl font-bold mb-4">Unit Not Found</h1>
                <p>Sorry, the requested unit does not exist or could not be loaded.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto md:w-2/3 pr-48 p-4">
            <h1 className="text-3xl font-bold mb-4">{unitData.title}</h1>
            <p className="text-lg mb-4">{unitData.description}</p>
            <div className="flex space-x-4">
                <a href={unitData.analysisLink} className="text-blue-500">
                    View Analysis
                </a>
                <a href={unitData.mindmapLink} className="text-blue-500">
                    View Mindmap
                </a>
                <a href={unitData.videoLink} className="text-blue-500">
                    Watch Video
                </a>
            </div>
        </div>
    );
};

export default UnitPage;

const formatKey = (category, level, subject) => {
    // 将 category 从缩写转换为完整格式
    const formattedCategory =
        category === "al" ? "A-Level" :
        category === "ig" ? "IGCSE" :
        category;

    // 将 level 转换为大写
    const formattedLevel = level.toUpperCase();

    // 将 subject 的首字母大写
    const formattedSubject = subject.charAt(0).toUpperCase() + subject.slice(1);

    // 返回格式化后的 key
    return `${formattedCategory} ${formattedLevel} ${formattedSubject}`;
};