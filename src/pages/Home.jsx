import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, shaderMaterial } from "@react-three/drei";
import { Link } from "react-router-dom";
import { User, BarChart2, Globe } from "lucide-react";
import * as THREE from 'three';

const WaterMaterial = shaderMaterial(
  {
    time: 0,
    colorStart: new THREE.Color('skyblue'),
    colorEnd: new THREE.Color('aqua'),
  },
  // Vertex shader
  `
    varying vec2 vUv;
    varying float vDistortion;
    uniform float time;
    void main() {
      vUv = uv;
      vec3 pos = position;
      pos.x += sin(pos.y * 10.0 + time) * 0.1;
      pos.y += sin(pos.x * 10.0 + time) * 0.1;
      pos.z += sin(pos.y * 10.0 + time) * 0.1;
      vDistortion = sin(pos.x * 10.0 + pos.y * 10.0 + time) * 0.1;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform vec3 colorStart;
    uniform vec3 colorEnd;
    varying vec2 vUv;
    varying float vDistortion;
    void main() {
      vec3 color = mix(colorStart, colorEnd, vUv.y + vDistortion);
      gl_FragColor = vec4(color, 0.6);
    }
  `
);

extend({ WaterMaterial });

const AnimatedSphere = () => {
  const mesh = useRef();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const material = useRef();

  useFrame((state) => {
    const { clock } = state;
    if (material.current) {
      material.current.time = clock.getElapsedTime();
    }
    // Rotate the sphere based on mouse movement
    const { x, y } = state.mouse;
    mesh.current.rotation.x = y * Math.PI * 0.1;
    mesh.current.rotation.y = x * Math.PI * 0.1;
  });

  const handlePointerMove = (event) => {
    if (material.current) {
      const { uv } = event;
      material.current.colorStart = new THREE.Color(
        `hsl(${200 + uv.x * 60}, 100%, ${50 + uv.y * 20}%)`
      );
      material.current.colorEnd = new THREE.Color(
        `hsl(${220 + uv.y * 60}, 100%, ${60 + uv.x * 20}%)`
      );
    }
  };

  const handleClick = (event) => {
    setClicked(!clicked);
    if (material.current) {
      material.current.time = 0; // Reset time to create a "splash" effect
    }
  };

  return (
    <Sphere
      ref={mesh}
      args={[1, 64, 64]}
      scale={hovered ? 2.2 : 2}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
      onPointerMove={handlePointerMove}
    >
      <waterMaterial ref={material} transparent />
    </Sphere>
  );
};

const FeatureCard = ({ title, description, icon: Icon }) => (
  <motion.div
    className="bg-white bg-opacity-20 dark:bg-gray-800 dark:bg-opacity-30 p-6 rounded-xl backdrop-blur-lg transition-all duration-300 hover:shadow-xl"
    whileHover={{ scale: 1.05, y: -5 }}
    whileTap={{ scale: 0.95 }}
  >
    <div className="flex items-center mb-4">
      <div className="bg-purple-500 p-3 rounded-full mr-4">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
    </div>
    <p className="text-sm text-gray-200 dark:text-gray-300">{description}</p>
  </motion.div>
);

const Testimonial = ({ quote, author, role }) => (
  <motion.div
    className="bg-white bg-opacity-10 dark:bg-gray-800 dark:bg-opacity-20 p-6 rounded-xl backdrop-blur-sm mb-20"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <p className="text-lg italic mb-4">"{quote}"</p>
    <p className="font-semibold">{author}</p>
    <p className="text-sm text-gray-300">{role}</p>
  </motion.div>
);

const Home = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDarkMode);
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, []);

  return (
    <div
      className={`${
        darkMode ? "dark" : ""
      } bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-gray-800 dark:to-gray-900 text-white`}
    >
      <style jsx>{`
        @font-face {
          font-family: "Ahkio";
          src: url("/fonts/Ahkio-W00-Bold.woff2") format("woff2"),
            url("/fonts/Ahkio-W00-Bold.woff") format("woff");
          font-weight: bold;
          font-style: normal;
          font-display: swap;
        }

        .ahkio-font {
          font-family: "Ahkio", sans-serif;
          font-weight: bold;
        }

        .welcome-text {
          font-size: 3rem;
          white-space: nowrap;
        }

        .lately-text {
          font-size: 5rem;
          display: inline-block;
          vertical-align: bottom;
          margin-left: 1.5rem;
          line-height: 0.8;
        }
      `}</style>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between min-h-screen py-24">
          <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0">
            <motion.h1
              className="font-bold mb-6 flex items-end flex-wrap"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="welcome-text">Welcome to</span>
              <span className="lately-text ahkio-font">Lately</span>
            </motion.h1>
            <motion.p
              className="text-xl mb-8"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Keep track of your attendance with ease!
            </motion.p>
            <Link to="/login">
              <motion.button
                className="bg-white text-purple-600 dark:bg-gray-800 dark:text-white py-3 px-8 rounded-full text-lg font-semibold hover:bg-opacity-90 transition duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
              >
                Get Started
              </motion.button>
            </Link>
          </div>
          <div className="md:w-1/2 h-64 md:h-96">
            <Canvas>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <AnimatedSphere />
            </Canvas>
          </div>
        </div>
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-3xl font-semibold mb-8 text-center">Features</h2>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 my-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <FeatureCard
            title="Easy Tracking"
            description="Record your attendance with just a click, simplifying your daily routine."
            icon={User}
          />
          <FeatureCard
            title="Insightful Reports"
            description="Get detailed attendance reports and analytics to improve your productivity."
            icon={BarChart2}
          />
          <FeatureCard
            title="Accessible Anywhere"
            description="Check your attendance from any device, anytime, anywhere."
            icon={Globe}
          />
        </motion.div>
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-3xl font-semibold mb-8 text-center">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Testimonial
              quote="Lately has revolutionized how I manage my attendance. I can Bunk easily without the fear of what if my attendance is below 75%! 😂"
              author="Sankalpa Sarkar"
              role="Student"
            />
            <Testimonial
              quote="As a teacher, Lately has made tracking my & student attendance so easy. No more problem regarding my schedules!"
              author="Dr. Sam Ray"
              role="Professor"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
