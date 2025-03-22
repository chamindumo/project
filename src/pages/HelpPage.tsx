import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaChevronDown, FaChevronUp } from 'react-icons/fa'; // Import icons from react-icons

export function HelpPage() {

  // State to manage which FAQ item is expanded
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // FAQ data
  const faqs = [
    {
      question: 'How to upload and analyze files?',
      answer:
        'To upload and analyze files, navigate to the "File Analysis" page from the navigation menu. Drag and drop your .jpg file into the designated area or click to browse and select a file. Once uploaded, click the "Analyze File" button to start the analysis process. The results will be displayed on the same page.',
    },
    {
      question: 'What file formats are supported?',
      answer:
        'Currently, the platform supports only .jpg file formats for analysis. Ensure your file is in the correct format before uploading. Support for additional formats may be added in future updates.',
    },
    {
      question: 'How to interpret the analysis results?',
      answer:
        'The analysis results include several sections: File Details, Analysis Results, Filtered Images, and Detailed Analysis. The "Analysis Results" section shows the payload classification, class probabilities (visualized as circular progress bars), and the Image Quality Assessment (IQA) score. The highest probability class is highlighted in green. Review the "Detailed Analysis" section for a comprehensive report, including recommendations and potential risks.',
    },
  ];

  // Toggle FAQ item expansion
  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-[calc(100vh-128px)] bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center py-12 px-4">
      {/* Header Section */}
      <div className="text-center max-w-3xl animate-fadeIn">
        <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">
          Help & Support
        </h1>
        <p className="text-xl text-gray-300 mb-12 leading-relaxed">
          Need assistance? Explore our frequently asked questions or reach out to our support team for personalized help.
        </p>
      </div>

      {/* FAQ Section */}
      <div className="w-full max-w-3xl bg-gray-800 rounded-lg shadow-xl p-8 mb-8 animate-fadeIn">
        <h2 className="text-3xl font-semibold text-cyan-400 mb-6 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border-b border-gray-700 last:border-b-0"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex justify-between items-center py-4 text-left text-lg font-medium text-gray-200 hover:text-cyan-400 transition-colors duration-200 focus:outline-none"
              >
                <span>{faq.question}</span>
                {openFaq === index ? (
                  <FaChevronUp className="text-cyan-400" />
                ) : (
                  <FaChevronDown className="text-gray-400" />
                )}
              </button>
              {openFaq === index && (
                <div className="pb-4 text-gray-300 text-base leading-relaxed animate-fadeIn">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Support Contact Section */}
      <div className="w-full max-w-3xl bg-gray-800 rounded-lg shadow-xl p-8 mb-12 animate-fadeIn">
        <h2 className="text-3xl font-semibold text-cyan-400 mb-6 text-center">
          Get in Touch
        </h2>
        <div className="flex items-center justify-center space-x-4">
          <FaEnvelope className="text-cyan-400 text-3xl" />
          <p className="text-lg text-gray-300">
            For further assistance, contact our support team at{' '}
            <a
              href="mailto:janithramoramudali@gmail.com"
              className="text-cyan-400 font-semibold hover:underline transition-colors duration-200"
            >
              janithramoramudali@gmail.com
            </a>
          </p>
        </div>
      </div>

      {/* Back to Home Button */}
      <Link
        to="/"
        className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
      >
        Back to Home
      </Link>

      {/* Optional Footer */}
      <footer className="mt-12 text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Cyberveli. All rights reserved.</p>
      </footer>
    </div>
  );
}

// CSS Animation for Fade-In Effect
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.6s ease-out forwards;
  }
`;

// Inject the styles into the document
const styleSheet = document.createElement('style');
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);