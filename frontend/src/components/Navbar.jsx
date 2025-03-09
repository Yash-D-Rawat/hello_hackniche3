import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <div className="bg-blue py-5">
      <SlideTabs />
    </div>
  );
};

const SlideTabs = () => {
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  return (
    <ul
      onMouseLeave={() => {
        setPosition((pv) => ({
          ...pv,
          opacity: 0,
        }));
      }}
      className="relative mx-auto flex w-fit rounded-full border-2 border-yellow-300 bg-white p-1"
    >
      <Tab setPosition={setPosition}>
        <Link to="/home">Home</Link>
      </Tab>
      <Tab setPosition={setPosition}>
        <Link to="/Collabarotion">Collaboration</Link>
      </Tab>
      <Tab setPosition={setPosition}>
        <Link to="/WhisperSpeech">Speech-AI</Link>
      </Tab>
      <Tab setPosition={setPosition}>
        <Link to="/TextImage">Visualize-AI</Link>
      </Tab>
      <Tab setPosition={setPosition}>
        <Link to="/text">Converse-AI</Link>
      </Tab>
      <Tab setPosition={setPosition}>
        <Link to="/profile">Profile</Link>
      </Tab>

      <Cursor position={position} />
    </ul>
  );
};

const Tab = ({ children, setPosition }) => {
  const ref = useRef(null);

  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (!ref?.current) return;

        const { width } = ref.current.getBoundingClientRect();

        setPosition({
          left: ref.current.offsetLeft,
          width,
          opacity: 1,
        });
      }}
      className="relative z-10 block cursor-pointer px-3 py-1.5 text-xs uppercase text-black hover:text-white md:px-5 md:py-3 md:text-base"
    >
      {children}
    </li>
  );
};

const Cursor = ({ position }) => {
  return (
    <motion.li
      animate={{
        ...position,
      }}
      className="absolute z-0 h-7 rounded-full bg-blue md:h-12"
    />
  );
};