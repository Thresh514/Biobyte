import DashboardComponent from "../components/Dashboard";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        document.body.classList.add('fade-in');
        return () => {
            document.body.classList.remove('fade-in');
        };
    }, []);

    useEffect(() => {
        // Check if user is admin and redirect to admin portal
        // 使用auth check API来检查登录状态和role（从cookie读取）
        fetch("/api/auth/check", {
            method: "GET",
            credentials: 'include'
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.isAuthenticated && data.user) {
                    if (data.user.role === 'admin') {
                        router.push('/admin');
                        return;
                    }
                }
                setIsChecking(false);
            })
            .catch((error) => {
                console.error('Error checking auth:', error);
                setIsChecking(false);
            });
    }, [router]);

    if (isChecking) {
        return (
            <div className="w-full h-screen flex justify-center items-center">
                <p className="text-lg font-light">Loading...</p>
            </div>
        );
    }

    return(
        <div>
            <Head>
                <title>Dashboard | BioByte</title>
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <Navbar />
            <div className="min-h-screen pb-24">
                <DashboardComponent />
            </div>
            <Footer />
        </div>
    )
}