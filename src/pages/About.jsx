import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { TorusKnot } from "@react-three/drei";
import * as THREE from "three";

const AnimatedTorusKnot = () => {
  const mesh = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const { clock } = state;
    mesh.current.rotation.x = Math.sin(clock.getElapsedTime()) * 0.3;
    mesh.current.rotation.y += 0.01;
  });

  return (
    <TorusKnot
      ref={mesh}
      args={[1, 0.3, 128, 32]}
      scale={hovered ? 1.2 : 1}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshPhongMaterial
        color={new THREE.Color("#4f46e5")}
        emissive={new THREE.Color("#818cf8")}
        shininess={50}
      />
    </TorusKnot>
  );
};

function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-gray-800 dark:to-gray-900">
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

        .feature-card {
          backdrop-filter: blur(12px);
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>

      <div className="container mx-auto px-4 py-24">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 text-white mb-8 md:mb-0 mt-20">
            <motion.h1
              className="text-6xl font-bold mb-8 flex items-end"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="ahkio-font">About  Lately</span>
            </motion.h1>

            <motion.div
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-xl font-semibold">
                Lately is your modern companion for attendance tracking, designed to make academic life simpler and more organized.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    title: "Schedule Setup",
                    description: "Create and manage your weekly class schedule with ease"
                  },
                  {
                    title: "Attendance Tracking",
                    description: "Mark and monitor your attendance for each class"
                  },
                  {
                    title: "Performance Insights",
                    description: "Get detailed analytics about your attendance patterns"
                  },
                  {
                    title: "Bunk Guides",
                    description: "Never miss a chance to bunk a class with our bunking guides"
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="feature-card p-4 rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                    <p className="text-sm opacity-90">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="md:w-1/2 h-64 md:h-96">
            <Canvas>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <pointLight position={[-10, -10, -10]} color="#818cf8" />
              <AnimatedTorusKnot />
            </Canvas>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;