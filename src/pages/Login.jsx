import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { Sphere, shaderMaterial } from "@react-three/drei";
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { toast } from 'react-toastify';
import { FaGoogle } from 'react-icons/fa';
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

function Login() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDarkMode);
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      toast.success('Logged in successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Error logging in with Google');
    }
  };

  return (
    <div className={`${
      darkMode ? "dark" : ""
    } bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-gray-800 dark:to-gray-900 text-white min-h-screen flex items-center justify-center`}>
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
        <div className="flex flex-col md:flex-row items-center justify-between py-24">
          <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0">
            <motion.h1
              className="font-bold mb-6 flex items-end flex-wrap"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="welcome-text">Sign In to</span>
              <span className="lately-text ahkio-font">Lately</span>
            </motion.h1>
            <motion.p
              className="text-xl mb-8"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Sign in to start tracking your attendance!
            </motion.p>
            <motion.button
              onClick={handleGoogleLogin}
              className="bg-white text-purple-600 dark:bg-gray-800 dark:text-white py-3 px-8 rounded-full text-lg font-semibold hover:bg-opacity-90 transition duration-300 flex items-center justify-center"
              whileHover={{ scale: 1.05, boxShadow: "0px 0px 8px rgb(255,255,255)" }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
            >
              <FaGoogle className={`mr-2 ${isHovered ? 'animate-spin' : ''}`} />
              Login with Google
            </motion.button>
          </div>
          <div className="md:w-1/2 h-64 md:h-96">
            <Canvas>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <AnimatedSphere />
            </Canvas>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

