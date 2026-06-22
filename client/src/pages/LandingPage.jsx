import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import Testimonials from '../components/landing/Testimonials';
import HowItWorks from '../components/landing/HowItWorks';
import PageTransition from '../components/common/PageTransition';

const LandingPage = () => {
  return (
    <PageTransition>
      <div className="min-h-screen">
        <Navbar />
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Footer />
      </div>
    </PageTransition>
  );
};

export default LandingPage;
