import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import collaboration from "../assets/collaboration.png";
import storybookcopy from "../assets/storybookcopy.png";
import blogs from "../assets/blogs.png";

const FeaturesSection = () => {
  const features = [
    {
      img: collaboration,
      title: "Collaboration",
      desc: "Seamlessly work together with your team, share ideas, and create the best content with ease.",
      float: { y: [0, -10, 5, -5, 0], x: [0, 5, -5, 3, 0] },
      link: "/collaboration", // Link to the page
    },
    {
      img: storybookcopy,
      title: "Text-to-Image",
      desc: "A modern creative workspace where a diverse team collaborates on organizing ideas, and sharing interactive stories",
      float: { rotate: [0, 2, -2, 1, 0], y: [0, -8, 4, -4, 0] },
      link: "/TextImage", // Link to the page
    },
    {
      img: blogs,
      title: "Speech-to-Text",
      desc: "A glowing soundwave converts into text on a futuristic screen, symbolizing AI-powered speech-to-text technology.",
      float: { y: [0, -12, 6, -3, 0], x: [0, -4, 4, -2, 0] },
      link: "/WhisperSpeech", // Link to the page
    },
  ];

  return (
    <div className="w-full flex flex-col  py-10 bg-white">
      <h1 className="text-5xl font-semibold text-gray-800 mb-6  pl-[4rem] ">
        Features
      </h1>

      <div className="w-full flex justify-evenly items-center text-white">
        {features.map((feature, i) => {
          const [ref, inView] = useInView({
            triggerOnce: false,
            threshold: 0.3,
          });

          return (
            <a key={i} href={feature.link} className="w-[27%]">
              <motion.div
                ref={ref}
                className="bg-darkblue w-full flex flex-col items-center gap-5 rounded-xl p-10 cursor-pointer hover:shadow-lg transition-shadow duration-300"
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ delay: i * 0.2, duration: 0.6, ease: "easeOut" }}
              >
                {/* Floating Image with unique motion */}
                <motion.img
                  src={feature.img}
                  alt={feature.title}
                  className="w-[50%]"
                  animate={feature.float}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut",
                  }}
                />
                <h2 className="font-bold text-3xl">{feature.title}</h2>
                <p className="w-full text-center">{feature.desc}</p>
              </motion.div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturesSection;
