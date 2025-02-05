import Head from 'next/head';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroSection from '../components/index/Herosection';
import ResourceCard from '../components/index/ResourceCard';
import MembershipBenefits from '../components/index/MembershipBenefits';
import SuccessStories from '../components/index/SuccessStories';
import MembershipPlans from '../components/index/MembershipPlans';
import ResourceCategories from '../components/index/ResourceCategories';

export default function Home() {

  return (
    <div>
      <Head>
        <title>Biomind Homepage</title>
        <meta name="description" content="A platform for educational resources." />
      </Head>
      <div><Navbar/></div>
      <main className="pt-16 flex flex-col items-center justify-center space-y-8">
        <div data-aos="fade-up"><HeroSection /></div>
        <div data-aos="fade-up"><ResourceCategories/></div>
        <div data-aos="fade-up"><SuccessStories/></div>
      </main>
      <Footer/>
    </div>
  );
}