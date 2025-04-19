import Head from 'next/head';
import Navbar from '../components/Navbar';
import AboutPage from '../components/AboutPage';
import Footer from '../components/Footer';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import SEO from '../components/SEO';

export default function About() {
    const router = useRouter();
    
    // 获取干净的规范URL路径
    const cleanPath = useMemo(() => {
        if (!router.asPath) return "";
        return router.asPath.split(/[?#]/)[0];
    }, [router.asPath]);
    
    return (
    <div>
        <SEO 
            title="About Us - Meet the BioByte Team"
            description="Meet the passionate team behind BioByte. We're dedicated to making A-Level Biology learning more accessible and effective through innovative digital resources."
            image="/aboutbg-compress.jpg"
            type="website"
            canonicalPath={cleanPath} // 如果SEO组件支持这个prop
        />
        <Navbar/>
        <main className="pt-28 min-h-screen">
        <AboutPage/>
        </main>
        <Footer />
    </div>
    );
}
