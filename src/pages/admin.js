import AdminPortalComponent from "../components/AdminPortal";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Head from 'next/head';
import { useEffect } from 'react';

export default function Admin() {
    useEffect(() => {
        document.body.classList.add('fade-in');
        return () => {
            document.body.classList.remove('fade-in');
        };
    }, []);

    return (
        <div>
            <Head>
                <title>Admin Portal | BioByte</title>
                <meta name="description" content="Admin portal for managing users and resources" />
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <Navbar />
            <div className="min-h-screen pb-24">
                <AdminPortalComponent />
            </div>
            <Footer />
        </div>
    );
}