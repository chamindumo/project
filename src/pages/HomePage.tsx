import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Clock, BarChart } from 'lucide-react'; // Import additional icons from lucide-react
import { Link } from 'react-router-dom';

export function HomePage() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0); // State to trigger re-rendering

  // Sample data for "Why Choose Us" section
  const features = [
    {
      icon: <Lock className="text-4xl text-cyan-400 mb-4" />,
      title: 'Advanced Security',
      description: 'Protect your data with state-of-the-art encryption and analysis tools.',
    },
    {
      icon: <Clock className="text-4xl text-cyan-400 mb-4" />,
      title: 'Fast Analysis',
      description: 'Get detailed reports in seconds with our optimized algorithms.',
    },
    {
      icon: <BarChart className="text-4xl text-cyan-400 mb-4" />,
      title: 'Actionable Insights',
      description: 'Uncover hidden vulnerabilities with clear, actionable reports.',
    },
  ];

  // Sample data for Class Probabilities (mock data for preview)
  const classProbabilities = {
    JMiPOD: 0.99, // Highest probability
    UERD: 0.80,
    clean: 0.70,
  };

  // Find the class with the highest probability
  const highestProbabilityClass = Object.entries(classProbabilities).reduce(
    (max, [className, prob]) => (prob > max.prob ? { className, prob } : max),
    { className: '', prob: -Infinity }
  ).className;

  // Function to handle smooth "refresh"
  const handleStartAnalysis = () => {
    // Use the key change to trigger a smooth refresh
    setRefreshKey((prevKey) => prevKey + 1); 
    // Optionally navigate or do something after refresh
    navigate('/analyze');
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center" key={refreshKey}>
      {/* Hero Section */}
      <div className="relative w-full min-h-[calc(100vh-128px)] flex flex-col items-center justify-center text-center px-4 py-16">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 to-gray-800/80 z-0"></div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl animate-fadeIn">
          <Shield className="h-24 w-24 text-cyan-500 mb-8 mx-auto animate-pulse" />
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-6 tracking-tight">
            Secure File Analysis Platform
          </h1>
          <p className="text-xl text-gray-300 mb-10 leading-relaxed animate-fadeIn">
            Upload and analyze your files with advanced security measures. Get detailed reports and ensure your data's safety.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleStartAnalysis} // Use the smooth refresh function here
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Start Analysis
            </button>
            <Link
              to="/about"
              className="bg-transparent border border-cyan-500 hover:bg-cyan-500/20 text-cyan-400 font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Preview of Class Probabilities */}
      <div className="w-full max-w-4xl bg-gray-800 rounded-lg shadow-xl p-8 my-12 animate-slideIn">
        <h2 className="text-3xl font-semibold text-cyan-400 mb-6 text-center">
          What You'll See
        </h2>
        <p className="text-lg text-gray-300 mb-6 text-center">
          After analyzing your file, you'll receive a detailed report with class probabilities, like this:
        </p>
        <div className="mt-2">
          <p className="text-gray-400 text-sm mb-2">Class Probabilities:</p>
          <div className="flex justify-center gap-8">
            {Object.entries(classProbabilities).map(([className, prob]) => {
              const percentage = prob * 100;
              const circumference = 2 * Math.PI * 45; // Radius = 45
              const isHighest = className === highestProbabilityClass;
              const isLowProbability = percentage < 1; // Threshold for showing a dot
              const strokeDashoffset = isHighest
                ? 0 // Full circle for highest probability
                : isLowProbability
                ? circumference - (5 / 100) * circumference // Small dot for low probabilities
                : circumference - (percentage / 100) * circumference;

              return (
                <div key={className} className="text-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        className="text-gray-600"
                        strokeWidth="10"
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className={isHighest ? 'text-green-500' : 'text-red-500'}
                        strokeWidth="10"
                        strokeDasharray={isLowProbability ? `${circumference / 50} ${circumference}` : circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap={isLowProbability ? 'round' : 'butt'}
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                  </div>
                  <p className="mt-2 text-gray-400 text-sm">{className}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="w-full max-w-5xl my-12 animate-slideIn">
        <h2 className="text-3xl font-semibold text-cyan-400 mb-8 text-center">
          Why Choose CyberVeli?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-lg p-6 text-center shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              {feature.icon}
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-gray-400 text-sm py-8">
        <p>
          © {new Date().getFullYear()} CyberVeli. All rights reserved.{' '}
          <Link to="/help" className="text-cyan-400 hover:underline">
            Contact Us
          </Link>
        </p>
      </footer>
    </div>
  );
}
