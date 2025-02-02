import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-128px)]">
      <Shield className="h-24 w-24 text-cyan-500 mb-8" />
      <h1 className="text-4xl font-bold mb-4 text-center">
        Secure File Analysis Platform
      </h1>
      <p className="text-xl text-gray-400 mb-8 text-center max-w-2xl">
        Upload and analyze your files with advanced security measures. 
        Get detailed reports and ensure your data's safety.
      </p>
      <button
        onClick={() => navigate('/analyze')}
        className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
      >
        Start Analysis
      </button>
    </div>
  );
}