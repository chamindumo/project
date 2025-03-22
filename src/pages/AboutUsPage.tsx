import React from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaLightbulb, FaUsers } from 'react-icons/fa'; // Import icons from react-icons

export function AboutUsPage() {
  // Sample data for "Our Values" section
  const values = [
    {
      icon: <FaShieldAlt className="text-4xl text-cyan-400 mb-4" />,
      title: 'Security',
      description: 'We prioritize your data safety with state-of-the-art encryption and analysis tools.',
    },
    {
      icon: <FaLightbulb className="text-4xl text-cyan-400 mb-4" />,
      title: 'Innovation',
      description: 'Our team is dedicated to leveraging cutting-edge technology to stay ahead of threats.',
    },
    {
      icon: <FaUsers className="text-4xl text-cyan-400 mb-4" />,
      title: 'User Empowerment',
      description: 'We provide actionable insights to help you make informed decisions about your data.',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-128px)] bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center py-12 px-4">
      {/* Hero Section */}
      <div className="text-center max-w-4xl animate-slideIn">
        <h1 className="text-5xl font-extrabold text-white mb-6 tracking-tight">
          About CyberVeli
        </h1>
        <p className="text-xl text-gray-300 mb-8 leading-relaxed">
          Welcome to CyberVeli, your trusted platform for secure file analysis. Our mission is to empower users with advanced tools to analyze files, ensuring data safety and uncovering hidden vulnerabilities.
        </p>
        <Link
          to="/help"
          className="inline-block bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          Learn More
        </Link>
      </div>

      {/* Mission Statement Section */}
      <div className="w-full max-w-4xl bg-gray-800 rounded-lg shadow-xl p-8 my-12 animate-slideIn">
        <h2 className="text-3xl font-semibold text-cyan-400 mb-6 text-center">
          Our Mission
        </h2>
        <p className="text-lg text-gray-300 leading-relaxed text-center">
          At CyberVeli, we aim to provide a user-friendly interface combined with cutting-edge technology to deliver actionable insights for better security. Whether you're an individual or a business, our platform helps you stay one step ahead of cyber threats.
        </p>
      </div>

      {/* Our Values Section */}
      <div className="w-full max-w-5xl my-12 animate-slideIn">
        <h2 className="text-3xl font-semibold text-cyan-400 mb-8 text-center">
          Our Values
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-lg p-6 text-center shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              {value.icon}
              <h3 className="text-xl font-semibold text-white mb-3">{value.title}</h3>
              <p className="text-gray-300">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="w-full max-w-4xl bg-gray-800 rounded-lg shadow-xl p-8 my-12 animate-slideIn text-center">
        <h2 className="text-3xl font-semibold text-cyan-400 mb-6">
          Ready to Secure Your Data?
        </h2>
        <p className="text-lg text-gray-300 mb-6">
          Start analyzing your files with CyberVeli today and take control of your digital security.
        </p>
        <Link
          to="/analyze"
          className="inline-block bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          Get Started
        </Link>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-gray-400 text-sm">
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

// CSS Animation for Slide-In Effect
const styles = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-slideIn {
    animation: slideIn 0.8s ease-out forwards;
  }
`;

// Inject the styles into the document
const styleSheet = document.createElement('style');
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);