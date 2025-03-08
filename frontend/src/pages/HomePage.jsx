import React from "react";
import {Navbar} from "../components/Navbar";
import hero from "../assets/Hero-copy.png";
import Footer from "../components/Footer";
import BentoGrid from "../components/BentoGrid";
import FeaturesSection from "../components/FeaturesSection";

const HomePage = () => {
  return (
    <div>
    <div className="relative">
       <Navbar /> 
      {/* Background section with text aligned left */}
      <div className=" w-full bg-blue relative flex items-center px-10">
        <div className="py-5 w-2/3 text-white">
          <h1 className="text-5xl font-bold mb-4">
            Your Creative Companion Crafting Stories, Shaping Ideas.
          </h1>
          <p className="text-lg mb-6">
            Copilot equips creators with the tools to streamline their process and bring ideas to life.
          </p>
          <button className="px-6 py-3 bg-orange text-whie font-semibold rounded-4xl shadow-md hover:bg-orange-600 transition">
            Get Started
          </button>
        </div>
      </div>

      {/* Hero image */}
      <img className=" w-full mix-blend-multiply bg-blue" src={hero} alt="Descriptive Alt Text" />
    </div>
    <FeaturesSection/>
    <BentoGrid/>
    <Footer/>
    </div>
  );
};

export default HomePage;
