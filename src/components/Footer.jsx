import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Instagram, Github, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative mt-16">
      <div className="wave-container absolute inset-0 pointer-events-none">
        <svg className="waves" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
          <defs>
            <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
          </defs>
          <g className="parallax">
            <use xlinkHref="#gentle-wave" x="48" y="0" fill="rgba(59, 130, 246, 0.1)" />
            <use xlinkHref="#gentle-wave" x="48" y="3" fill="rgba(59, 130, 246, 0.07)" />
            <use xlinkHref="#gentle-wave" x="48" y="5" fill="rgba(59, 130, 246, 0.05)" />
            <use xlinkHref="#gentle-wave" x="48" y="7" fill="rgba(59, 130, 246, 0.03)" />
          </g>
        </svg>
      </div>

      <div className="content relative z-10 bg-transparent text-white dark:text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Lately</h3>
              <p className="mb-4">Making attendance tracking a breeze.</p>
              <div className="flex space-x-4">
                <a href="https://x.com/sarkar7522" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  <Twitter size={24} />
                </a>
                <a href="https://www.instagram.com/sankalpa.fr/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  <Instagram size={24} />
                </a>
                <a href="https://github.com/sanks011" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  <Github size={24} />
                </a>
                <a href="https://www.linkedin.com/in/sankalpacodes/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  <Linkedin size={24} />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
                <li><Link to="/about" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link to="/check-attendance" className="hover:text-primary transition-colors">Check Attendance</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">Contact Me</h4>
              <p className="mb-2">Sankalpa Sarkar</p>
              <p className="mb-2">CSE, Adamas University'27</p>
              <p className="mb-2">Email: sankalpacodes.auhotmail@gmail.com</p>
              <p>Kolkata, West Bengal</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-300 dark:border-gray-700 text-center">
            <p>&copy; {new Date().getFullYear()} Lately. All rights reserved.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .wave-container {
          overflow: hidden;
          line-height: 0;
        }

        .waves {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }

        .parallax > use {
          animation: move-forever 25s cubic-bezier(.55,.5,.45,.5) infinite;
        }
        .parallax > use:nth-child(1) {
          animation-delay: -2s;
          animation-duration: 7s;
        }
        .parallax > use:nth-child(2) {
          animation-delay: -3s;
          animation-duration: 10s;
        }
        .parallax > use:nth-child(3) {
          animation-delay: -4s;
          animation-duration: 13s;
        }
        .parallax > use:nth-child(4) {
          animation-delay: -5s;
          animation-duration: 20s;
        }

        @keyframes move-forever {
          0% {
            transform: translate3d(-90px,0,0);
          }
          100% { 
            transform: translate3d(85px,0,0);
          }
        }

        @media (max-width: 768px) {
          .waves {
            height: 40px;
            min-height: 40px;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;