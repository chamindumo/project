import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-128px)]">
      <AlertCircle className="h-24 w-24 text-red-500 mb-8" />
      <h1 className="text-4xl font-bold mb-4 text-center">404 - Page Not Found</h1>
      <p className="text-xl text-gray-400 mb-8 text-center max-w-2xl">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="space-x-4">
        <button
          onClick={() => navigate('/')}
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
        >
          Go to Home
        </button>
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}