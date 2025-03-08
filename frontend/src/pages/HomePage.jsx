import React from "react";
import {Navbar} from "../components/Navbar";
import hero from "../assets/Hero1.png";
import Footer from "../components/Footer";
import BentoGrid from "../components/BentoGrid";
import FeaturesSection from "../components/FeaturesSection";
import ScrollingTestimonials from "../components/ScrollingTestimonials";

const HomePage = () => {
  return (
    <div>
      <div className="relative">
        <Navbar /> 
        {/* Hero section with text on left, image on right */}
        <div className="w-full bg-blue flex flex-row items-center">
          {/* Text content on the left */}
          <div className="w-1/2 p-10 text-white">
            <h1 className="text-5xl font-bold mb-4">
              Your Creative Companion Crafting Stories, Shaping Ideas.
            </h1>
            <p className="text-lg mb-6">
              Copilot equips creators with the tools to streamline their process and bring ideas to life.
            </p>
            <button className="px-6 py-3 bg-orange text-white font-semibold rounded-full shadow-md hover:bg-orange-600 transition">
              Get Started
            </button>
          </div>
          
          {/* Image on the right */}
          <div className="w-1/2">
            <img 
              className="w-full  object-cover " 
              src={hero} 
              alt="Creative companion illustration" 
            />
          </div>
        </div>
      </div>
      
      <FeaturesSection/>
      <BentoGrid/>
      <ScrollingTestimonials/>
      <Footer/>
    </div>
  );
};

export default HomePage;