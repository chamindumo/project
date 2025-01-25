import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

interface PageHeaderProps {
  title: string;
}

export function PageHeader({ title }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-3xl font-bold">{title}</h1>
      <button
        onClick={() => navigate('/')}
        className="flex items-center bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        <Home className="h-5 w-5 mr-2" />
        Return Home
      </button>
    </div>
  );
}