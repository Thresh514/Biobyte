import Head from 'next/head';
import { useRouter } from 'next/router';

export default function SEO({ 
    title,
    description,
    image = '/default.jpg',
    type = 'website',
}) {
    const router = useRouter();
    const baseUrl = 'https://www.biobyte.shop';
    const url = `${baseUrl}${router.asPath}`;
    const fullTitle = `${title} | BioByte`;

    return (
        <Head>
            {/* 基础 SEO */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content="A-Level, Biology, Mindmap, Study Notes, Learning Resources" />
            <meta name="robots" content="index, follow" />
            
            {/* Open Graph */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image.startsWith('http') ? image : `${baseUrl}${image}`} />
            <meta property="og:url" content={url} />
            <meta property="og:site_name" content="BioByte" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image.startsWith('http') ? image : `${baseUrl}${image}`} />
            
            {/* 规范链接 */}
            <link rel="canonical" href={url} />
        </Head>
    );
}