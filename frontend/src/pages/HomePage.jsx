import React from "react";
import { motion } from "framer-motion";
import { Navbar } from "../components/Navbar";
import hero from "../assets/Hero4.png";
import Footer from "../components/Footer";
import BentoGrid from "../components/BentoGrid";
import FeaturesSection from "../components/FeaturesSection";
import ScrollingTestimonials from "../components/ScrollingTestimonials";

const HomePage = () => {
  return (
    <div>
      <div className="relative">
        <Navbar />
        {/* Hero section */}
        <div className="w-full bg-blue flex flex-row items-center relative overflow-hidden pl-20">
          {/* Text content on the left */}
          <div className="p-10 text-white z-10">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="w-[63%] text-5xl font-bold mb-4"
            >
              Your Creative Companion Crafting Stories, Shaping Ideas.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
              viewport={{ once: true }}
              className="w-[40%] text-lg font-bold text-white/90 mb-6"
            >
              Copilot equips creators with the tools to streamline their process
              and bring ideas to life.
            </motion.p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-orange text-white font-semibold rounded-full shadow-md hover:bg-orange-600 transition"
            >
              Get Started
            </motion.button>
          </div>

          {/* Animated Image */}
          <div className="absolute right-10 top-[-20px] h-[120%] w-1/2">
            <motion.img
              initial={{ opacity: 0, x: 100 }} // Start off-screen to the right
              whileInView={{ opacity: 1, x: 0 }} // Slide in when it comes into view
              animate={{ y: [0, -10, 0] }} // Floating effect
              transition={{
                opacity: { duration: 1, ease: "easeOut" }, // Transition for fade-in
                x: { duration: 1, ease: "easeOut" }, // Transition for sliding in
                y: { duration: 3, repeat: Infinity, ease: "easeInOut" }, // Transition for floating
              }}
              viewport={{ once: true }}
              className="w-full h-full object-contain object-right"
              src={hero}
              alt="Creative companion illustration"
            />
          </div>
        </div>
        
        {/* Static Wave SVG with pronounced curves */}
        <div className="relative w-full overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="w-full"
          >
            <svg
              className="w-full h-24 md:h-32"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1440 120"
              preserveAspectRatio="none"
            >
              <path
                className="fill-blue"
                d="M0,0L0,65C40,85,80,100,120,96C160,90,200,65,240,53C280,40,320,40,360,43C400,45,440,50,480,58C520,65,560,75,600,70C640,65,680,45,720,40C760,35,800,45,840,58C880,70,920,85,960,90C1000,95,1040,90,1080,75C1120,60,1160,35,1200,30C1240,25,1280,40,1320,50C1360,60,1400,65,1420,67L1440,70L1440,0L1420,0C1400,0,1360,0,1320,0C1280,0,1240,0,1200,0C1160,0,1120,0,1080,0C1040,0,1000,0,960,0C920,0,880,0,840,0C800,0,760,0,720,0C680,0,640,0,600,0C560,0,520,0,480,0C440,0,400,0,360,0C320,0,280,0,240,0C200,0,160,0,120,0C80,0,40,0,20,0L0,0Z"
              ></path>
            </svg>
          </motion.div>
        </div>
      </div>

      <FeaturesSection />
      <ScrollingTestimonials />
      <BentoGrid />
      <Footer />
    </div>
  );
};

export default HomePage;