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
    },
    {
      img: storybookcopy,
      title: "Storybook",
      desc: "Organize and present your ideas, design user interfaces, and share interactive stories with your team.",
      float: { rotate: [0, 2, -2, 1, 0], y: [0, -8, 4, -4, 0] },
    },
    {
      img: blogs,
      title: "Blogs",
      desc: "Create and manage blogs, engage with your audience, and share insightful content in an easy-to-use platform.",
      float: { y: [0, -12, 6, -3, 0], x: [0, -4, 4, -2, 0] },
    },
  ];

  return (
    <div className="w-full flex flex-col items-center py-10 bg-white">
      <h1 className="text-3xl font-bold mb-5 text-purple">
        What does the Copilot provide?
      </h1>
      <div className="w-full flex justify-evenly items-center text-white">
        {features.map((feature, i) => {
          const [ref, inView] = useInView({ triggerOnce: false, threshold: 0.3 });

          return (
            <motion.div
              key={i}
              ref={ref}
              className="bg-darkblue w-[27%] flex flex-col items-center gap-5 rounded-xl p-10"
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
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              />
              <h2 className="font-bold text-3xl">{feature.title}</h2>
              <p className="w-full text-center">{feature.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturesSection;
