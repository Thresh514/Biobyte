import Head from 'next/head';
import Header from '../components/Header';
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
        <Header/>
        <Navbar/>
        <main className="pt-32 min-h-screen">
        <AboutPage/>
        </main>
        <Footer />
    </div>
    );
}
