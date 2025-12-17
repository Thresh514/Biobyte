import DashboardComponent from "../components/Dashboard";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Head from 'next/head';
import { useEffect } from 'react';

export default function Dashboard() {
    useEffect(() => {
            document.body.classList.add('fade-in');
            return () => {
                document.body.classList.remove('fade-in');
            };
        }, []);
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