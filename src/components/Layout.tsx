import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FileHistory } from './FileHistory';
import { useFileHistory } from '../hooks/useFileHistory';
import { useLocation } from 'react-router-dom';
import logo from '../logo/logo.png';

export function Layout() {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const location = useLocation();
  const {
    history,
    removeFromHistory,
    clearHistory
  } = useFileHistory();

  const outletRef = React.useRef<any>();
  const setOutletRef = (ref: any) => {
    if (ref) {
      outletRef.current = ref;
    }
  };

  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);

  const handleSelectFile = (item: any) => {
    setSelectedHistoryItem(item); // Set the selected history item
    if (location.pathname !== '/analyze') {
      return;
    }
    if (outletRef.current?.handleHistoryItemSelect) {
      outletRef.current.handleHistoryItemSelect(item);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 border-b border-gray-700 fixed w-full z-10">
        <div className="max-w-7xl mx-1 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <img src={logo} alt="Logo" className="h-16 w-16" />
              <span className="ml-2 text-xl font-bold">CyberVeli</span>
            </div>
            <div className="flex justify-end space-x-7">
              <Link to="/" className="hover:text-cyan-500">Home</Link>
              <Link to="/about" className="hover:text-cyan-500">About Us</Link>
              <Link to="/help" className="hover:text-cyan-500">Help</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-screen pt-16">
        {/* Main Content */}
        <div 
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isPanelOpen ? 'mr-80' : 'mr-0'
          }`}
        >
          <main className="p-8 bg-gray-900">
            <Outlet context={{ ref: setOutletRef, selectedHistoryItem }} />
          </main>
        </div>

        {/* Side Panel */}
        <div 
          className={`bg-gray-800 border-l border-gray-700 fixed h-[calc(100vh-64px)] overflow-y-auto transition-all duration-300 ease-in-out ${
            isPanelOpen ? 'w-80 right-0' : 'w-0 right-0'
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
          className={`fixed z-20 top-1/2 transform -translate-y-1/2 bg-gray-800 text-gray-300 hover:text-white p-2 rounded-l-lg transition-all duration-300 ease-in-out ${
            isPanelOpen ? 'right-80' : 'right-0'
          }`}
        >
          {isPanelOpen ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}