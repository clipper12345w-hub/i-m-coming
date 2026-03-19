import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import DailyVerse from '@/components/DailyVerse';
import DevotionalPreview from '@/components/DevotionalPreview';
import ShopPreview from '@/components/ShopPreview';
import FreeResources from '@/components/FreeResources';
import PrayerTeaser from '@/components/PrayerTeaser';
import FinalCTA from '@/components/FinalCTA';
import ChurchWebsiteTeaser from '@/components/ChurchWebsiteTeaser';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <DailyVerse />
      <DevotionalPreview />
      <ShopPreview />
      <FreeResources />
      <PrayerTeaser />
      <ChurchWebsiteTeaser />
      <FinalCTA />
      <Footer />
    </>
  );
};

export default Index;
