import Head from 'next/head';
import Navbar from '../components/Navbar';
import AboutPage from '../components/AboutPage';
import Footer from '../components/Footer';

export default function About() {
    return (
    <div>
        <Head>
            <title>About Page</title>
            <meta name="description" content="about us" />
        </Head>
        <Navbar/>
        <main className="pt-28 min-h-screen">
        <AboutPage/>
        </main>
        <Footer />
    </div>
    );
}
