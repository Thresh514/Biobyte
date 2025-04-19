import Head from 'next/head';
import Navbar from '../components/Navbar';
import FAQPage from '../components/FAQPage';
import Footer from '../components/Footer';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

export default function Home() {
    const router = useRouter();
    
    // 获取干净的规范URL路径
    const cleanPath = useMemo(() => {
        if (!router.asPath) return "";
        return router.asPath.split(/[?#]/)[0];
    }, [router.asPath]);

    return (
        <div>
        <Head>
            <title>FAQ Page</title>
            <meta name="description" content="faq" />
            {/* Canonical URL */}
            <link rel="canonical" href={`https://www.biobyte.shop${cleanPath}`} />
        </Head>
        <Navbar/>
        <main className="pt-32 min-h-screen">
            <FAQPage/>
        </main>
        <Footer/>
        </div>
        )}