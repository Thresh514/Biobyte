import Head from 'next/head';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import ResourcePage from '../components/ResourcePage';
import Footer from '../components/Footer';

export default function Home() {

    return (
        <div>
        <Head>
            <title>Browse Resource</title>
            <meta name="description" content="Catagory" />
        </Head>
        <Header/>
        <Navbar/>
        <main className="pt-48 flex flex-col space-y-8 min-h-screen">
            <h1 className="ml-48 text-4xl text-darker font-bold">Explore All Resources...</h1>
            <div className='mb-24 flex-1'><ResourcePage/></div>
        </main>
        <Footer/>
        </div>
        )}