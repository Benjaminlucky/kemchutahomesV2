import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-customBlack-50 via-customPurple-50 to-customBlack-100 flex items-center justify-center px-4 py-16">
      <div className="max-w-4xl w-full">
        <div className="text-center">
          {/* Animated 404 */}
          <div className="relative mb-8">
            <h1 className="text-[150px] sm:text-[200px] lg:text-[280px] font-black leading-none">
              <span className="inline-block animate-bounce404-1 bg-gradient-to-br from-customPurple-400 to-customPurple-600 bg-clip-text text-transparent">
                4
              </span>
              <span className="inline-block animate-bounce404-2 bg-gradient-to-br from-customPurple-500 to-customPurple-700 bg-clip-text text-transparent">
                0
              </span>
              <span className="inline-block animate-bounce404-3 bg-gradient-to-br from-customPurple-600 to-customPurple-800 bg-clip-text text-transparent">
                4
              </span>
            </h1>

            {/* Floating elements */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 animate-float">
              <div className="w-16 h-16 bg-customPurple-200 rounded-full opacity-50 blur-xl"></div>
            </div>
            <div className="absolute top-1/3 right-1/4 animate-float-delayed">
              <div className="w-20 h-20 bg-customPurple-300 rounded-full opacity-40 blur-2xl"></div>
            </div>
          </div>

          {/* Error Message */}
          <div
            className="mb-8 animate-fadeInUp"
            style={{ animationDelay: "200ms" }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-customBlack-800 mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-lg sm:text-xl text-customBlack-600 max-w-2xl mx-auto">
              The page you're looking for seems to have wandered off. Don't
              worry, even the best explorers get lost sometimes!
            </p>
          </div>

          {/* Illustration */}
          <div
            className="mb-10 animate-fadeInUp"
            style={{ animationDelay: "400ms" }}
          >
            <div className="relative inline-block">
              <svg
                className="w-64 h-64 sm:w-80 sm:h-80 mx-auto"
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* House with question mark */}
                <g className="animate-wiggle">
                  {/* House base */}
                  <rect
                    x="60"
                    y="100"
                    width="80"
                    height="70"
                    fill="#700CEB"
                    opacity="0.2"
                    rx="4"
                  />
                  <path
                    d="M100 60 L150 95 L140 95 L140 170 L60 170 L60 95 L50 95 Z"
                    fill="#700CEB"
                    opacity="0.8"
                  />

                  {/* Door */}
                  <rect
                    x="85"
                    y="130"
                    width="30"
                    height="40"
                    fill="#fff"
                    opacity="0.9"
                    rx="2"
                  />
                  <circle cx="108" cy="150" r="2" fill="#700CEB" />

                  {/* Windows */}
                  <rect
                    x="70"
                    y="110"
                    width="20"
                    height="20"
                    fill="#fff"
                    opacity="0.9"
                    rx="2"
                  />
                  <rect
                    x="110"
                    y="110"
                    width="20"
                    height="20"
                    fill="#fff"
                    opacity="0.9"
                    rx="2"
                  />

                  {/* Question mark on roof */}
                  <text
                    x="95"
                    y="90"
                    fontSize="30"
                    fontWeight="bold"
                    fill="#fff"
                  >
                    ?
                  </text>
                </g>

                {/* Floating magnifying glass */}
                <g className="animate-float">
                  <circle
                    cx="150"
                    cy="50"
                    r="15"
                    stroke="#700CEB"
                    strokeWidth="3"
                    fill="none"
                  />
                  <line
                    x1="160"
                    y1="60"
                    x2="170"
                    y2="70"
                    stroke="#700CEB"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </g>

                {/* Stars */}
                <g className="animate-twinkle">
                  <circle cx="30" cy="40" r="2" fill="#700CEB" />
                  <circle cx="170" cy="120" r="2" fill="#700CEB" />
                  <circle cx="40" cy="160" r="2" fill="#700CEB" />
                </g>
              </svg>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fadeInUp"
            style={{ animationDelay: "600ms" }}
          >
            <Link
              to="/"
              className="group relative px-8 py-4 bg-gradient-to-r from-customPurple-500 to-customPurple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Back to Home
              </span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
            </Link>

            <button
              onClick={() => navigate(-1)}
              className="group relative px-8 py-4 bg-white text-customPurple-600 font-semibold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-customPurple-200 hover:border-customPurple-400"
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Go Back
              </span>
            </button>
          </div>

          {/* Quick Links */}
          <div
            className="mt-12 animate-fadeInUp"
            style={{ animationDelay: "800ms" }}
          >
            <p className="text-customBlack-500 mb-4 font-medium">
              Or explore these pages:
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { name: "Developments", path: "/developments" },
                { name: "Company", path: "/company" },
                { name: "Contact", path: "/contact" },
                { name: "Login", path: "/login" },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="px-4 py-2 text-customPurple-600 hover:text-customPurple-700 font-medium hover:bg-customPurple-50 rounded-lg transition-all duration-200"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce404-1 {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes bounce404-2 {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-30px);
          }
        }

        @keyframes bounce404-3 {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes wiggle {
          0%,
          100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-2deg);
          }
          75% {
            transform: rotate(2deg);
          }
        }

        @keyframes twinkle {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(0.8);
          }
        }

        .animate-bounce404-1 {
          animation: bounce404-1 2s ease-in-out infinite;
        }

        .animate-bounce404-2 {
          animation: bounce404-2 2s ease-in-out infinite 0.2s;
        }

        .animate-bounce404-3 {
          animation: bounce404-3 2s ease-in-out infinite 0.4s;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-wiggle {
          animation: wiggle 3s ease-in-out infinite;
        }

        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
