import React, { useEffect } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroSection from '../components/index/Herosection';
import SuccessStories from '../components/index/SuccessStories';
import ResourceCategories from '../components/index/ResourceCategories';
import SEO from '../components/SEO';
import { Analytics } from "@vercel/analytics/next"

// 使用纯客户端渲染
export default function Home() {
  useEffect(() => {
    document.body.classList.add('fade-in');
    return () => {
      document.body.classList.remove('fade-in');
    };
  }, []);

  return (
    <div>
      <Analytics />
      <SEO 
        title="BioByte - A-Level Biology Study Resources"
        description="Download professional A-Level Biology study materials and mind maps."
        image="/indexbg-compress.jpeg"
        type="website"
      />
      <div><Navbar/></div>
      <main className="flex flex-col items-center justify-center space-y-24">
        <div><HeroSection/></div>
        <div><ResourceCategories/></div>
        <div className="hidden sm:block"><SuccessStories/></div>
      </main>
      <Footer/>
    </div>
  );
}