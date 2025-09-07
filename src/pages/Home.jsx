import React from "react";
import HeroSection from "../components/home/HeroSection";
import BrandTicker from "../components/home/BrandTicker";
import ProgressiveCompaniesCarousel from "../components/home/ProgressiveCompaniesCarousel";

export default function Home() {
  return (
    <div className="min-h-screen">
      <BrandTicker />
      <HeroSection />
      <ProgressiveCompaniesCarousel />
    </div>
  );
}