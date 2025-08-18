// src/components/LandingPage.jsx
import React from 'react';
import HeroSection from './HeroSection';
import TestimonialsSection from './TestimonialsSection';
import BenefitsSection from './BenefitsSection';
import StatsSection from './StatsSection';
import EmailSubscription from './EmailSubscription';


const LandingPage = () => {
  return (
    <div>
      <HeroSection />
      <TestimonialsSection />
      <BenefitsSection />
      <StatsSection />
      <EmailSubscription/>
    </div>
  );
};

export default LandingPage;
