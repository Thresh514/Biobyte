import Head from 'next/head';
import Header from '../../../../../components/Header';
import Navbar from '../../../../../components/Navbar';
import Unit from '../../../../../components/Unit'
import Footer from '../../../../../components/Footer';


export default function ChapterDetail() {
    return (
    <div>
        <Head>
            <title>AS Biology Chapter 1</title>
            <meta name="description" content="AS Biology Chapter 1" />
        </Head>
        <Header/>
        <Navbar/>
        <main className="pt-48 min-h-screen">
            <Unit/>
        </main>
        <Footer />
    </div>
    );
}