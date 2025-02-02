import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { FileHistory } from './FileHistory';
import { useFileHistory } from '../hooks/useFileHistory';
import { useLocation } from 'react-router-dom';

export function Layout() {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const location = useLocation();
  const {
    history,
    removeFromHistory,
    clearHistory
  } = useFileHistory();

  // Get the current page component's handleHistoryItemSelect function
  const outletRef = React.useRef<any>();
  const setOutletRef = (ref: any) => {
    if (ref) {
      outletRef.current = ref;
    }
  };

  const handleSelectFile = (item: any) => {
    if (location.pathname !== '/analyze') {
      // If not on analyze page, ignore the selection
      return;
    }
    
    if (outletRef.current?.handleHistoryItemSelect) {
      outletRef.current.handleHistoryItemSelect(item);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 border-b border-gray-700 fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-cyan-500" />
              <span className="ml-2 text-xl font-bold">CyberVel Analyzer</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-screen pt-16">
        {/* Side Panel */}
        <div 
          className={`bg-gray-800 border-r border-gray-700 fixed h-[calc(100vh-64px)] overflow-y-auto transition-all duration-300 ease-in-out ${
            isPanelOpen ? 'w-80' : 'w-0'
          }`}
        >
          <div className="p-4">
            <FileHistory 
              history={history}
              onSelectFile={handleSelectFile}
              onRemoveFile={removeFromHistory}
              onClearHistory={clearHistory}
            />
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className={`fixed z-20 top-1/2 transform -translate-y-1/2 bg-gray-800 text-gray-300 hover:text-white p-2 rounded-r-lg transition-all duration-300 ease-in-out ${
            isPanelOpen ? 'left-80' : 'left-0'
          }`}
        >
          {isPanelOpen ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>

        {/* Main Content */}
        <div 
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isPanelOpen ? 'ml-80' : 'ml-0'
          }`}
        >
          <main className="p-8">
            <Outlet context={{ ref: setOutletRef }} />
          </main>
        </div>
      </div>
    </div>
  );
}