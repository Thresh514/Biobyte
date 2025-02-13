import Head from 'next/head';
import Navbar from '../components/Navbar';
import FAQPage from '../components/FAQPage';
import Footer from '../components/Footer';

export default function Home() {

    return (
        <div>
        <Head>
            <title>FAQ Page</title>
            <meta name="description" content="faq" />
        </Head>
        <Navbar/>
        <main className="pt-32 min-h-screen">
            <FAQPage/>
        </main>
        <Footer/>
        </div>
        )}