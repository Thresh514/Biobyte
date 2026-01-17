import Head from 'next/head';
import Navbar from '../components/Navbar';
import MembershipPage from '../components/MembershipPage';
import Footer from '../components/Footer';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import SEO from '../components/SEO';

export default function Membership() {
    const router = useRouter();
    
    // 获取干净的规范URL路径
    const cleanPath = useMemo(() => {
        if (!router.asPath) return "";
        return router.asPath.split(/[?#]/)[0];
    }, [router.asPath]);
    
    return (
    <div>
        <SEO 
            title="Membership - Unlock Unlimited Access | BioByte"
            description="Get unlimited access to all study resources and AI tutor features with BioByte membership. Free access to mindmaps, syllabus analysis, and 24/7 AI tutoring support."
            image="/indexbg-compress.jpeg"
            type="website"
            canonicalPath={cleanPath}
        />
        <Navbar/>
        <main className="pt-28 min-h-screen">
        <MembershipPage/>
        </main>
        <Footer />
    </div>
    );
}
