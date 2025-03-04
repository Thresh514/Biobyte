import React, { useEffect } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroSection from '../components/index/Herosection';
import SuccessStories from '../components/index/SuccessStories';
import ResourceCategories from '../components/index/ResourceCategories';


export default function Home() {
  useEffect(() => {
          document.body.classList.add('fade-in');
          return () => {
              document.body.classList.remove('fade-in');
          };
      }, []);

  return (
    <div>
      <Head>
        <title>BioByte Homepage</title>
        <meta name="description" content="A platform for educational resources." />
      </Head>
      <div><Navbar/></div>
      <main className="pt-16 flex flex-col items-center justify-center space-y-8">
        <div><HeroSection /></div>
        <div><ResourceCategories/></div>
        <div className="hidden sm:block"><SuccessStories/></div>
      </main>
      <Footer/>
    </div>
  );
}