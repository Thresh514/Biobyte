import Head from 'next/head';
import Header from '../components/Header';
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
        <Header/>
        <Navbar/>
        <main className="pt-32 min-h-screen">
            <FAQPage/>
        </main>
        <Footer/>
        </div>
        )}