import { useEffect, useRef } from "react";
import { useRouter } from "next/router";

const products = [
    {
        id: "mindmaps-as-biology",
        titles: ["Chapter 1", "Chapter 2", "Chapter 3", "Chapter 4", "Chapter 5", "Chapter 6", "Chapter 7", "Chapter 8", "Chapter 9", "Chapter 10", "Chapter 11", "Chapter 12"],
    },
    {
        id: "mindmaps-a2-biology",
        titles: ["Chapter 13", "Chapter 14", "Chapter 15", "Chapter 16", "Chapter 17", "Chapter 18", "Chapter 19"],
    },
];

export default function Products() {
    const router = useRouter();
    const productRefs = useRef({}); // 存储章节的 ref

    // 页面加载时，检查 URL 是否有 #id 并滚动
    useEffect(() => {
        if (router.asPath.includes("#")) {
            const productId = router.asPath.split("#")[1];
            if (productRefs.current[productId]) {
                productRefs.current[productId].scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [router.asPath]);

    return (
        <div className="max-w-5xl mx-auto py-10">
            <h1 className="text-3xl font-bold text-center mb-8">Mindmaps Product List</h1>

            <div className="space-y-10">
                {products.map((product) => (
                    <div
                        key={product.id}
                        id={product.id} // 确保 ID 正确
                        ref={(el) => (productRefs.current[product.id] = el)}
                        className="border p-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
                    >
                        {/* 章节列表标题 */}
                        <h2 className="text-2xl font-semibold text-darkest mb-4">{product.id.replace("-", " ").toUpperCase()}</h2>

                        {/* 章节列表 */}
                        <ul className="space-y-2 text-gray-700">
                            {product.titles.map((chapter, index) => (
                                <li key={index} className="border-b pb-2">
                                    {chapter}
                                </li>
                            ))}
                        </ul>

                        {/* 详情跳转按钮 */}
                        <a
                            href={`#${product.id}`}
                            className="block mt-4 text-blue-600 hover:underline"
                            onClick={(e) => {
                                e.preventDefault();
                                router.push(`#${product.id}`, undefined, { shallow: true });
                                productRefs.current[product.id]?.scrollIntoView({ behavior: "smooth" });
                            }}
                        >
                            Scroll to Details
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}
