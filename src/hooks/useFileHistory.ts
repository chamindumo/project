import { useState, useEffect, useCallback } from 'react';

export interface HistoryItem {
  id: string;
  fileName: string;
  fileSize: number;
  timestamp: Date;
  status: 'analyzed' | 'pending';
  preview?: string;
  analysis?: string;
  report?: string; // Add a field for the report
}

const STORAGE_KEY = 'file-analysis-history';

// Create a custom event for history updates
const HISTORY_UPDATE_EVENT = 'fileHistoryUpdate';

export function useFileHistory() {
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
    }
    return [];
  });

  // Handle history updates from other components
  useEffect(() => {
    const handleHistoryUpdate = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      }
    };

    // Listen for history updates
    window.addEventListener(HISTORY_UPDATE_EVENT, handleHistoryUpdate);

    return () => {
      window.removeEventListener(HISTORY_UPDATE_EVENT, handleHistoryUpdate);
    };
  }, []);

  // Update localStorage and dispatch event
  const updateStorageAndNotify = useCallback((newHistory: HistoryItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    window.dispatchEvent(new Event(HISTORY_UPDATE_EVENT));
  }, []);

  const addToHistory = useCallback((item: HistoryItem) => {
    setHistory(prev => {
      const newHistory = [item, ...prev];
      updateStorageAndNotify(newHistory);
      return newHistory;
    });
  }, [updateStorageAndNotify]);

  const updateHistoryItem = useCallback((id: string, updates: Partial<HistoryItem>) => {
    setHistory(prev => {
      const newHistory = prev.map(item =>
        item.id === id ? { ...item, ...updates } : item
      );
      updateStorageAndNotify(newHistory);
      return newHistory;
    });
  }, [updateStorageAndNotify]);

  const removeFromHistory = useCallback((id: string) => {
    setHistory(prev => {
      const newHistory = prev.filter(item => item.id !== id);
      updateStorageAndNotify(newHistory);
      return newHistory;
    });
  }, [updateStorageAndNotify]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    updateStorageAndNotify([]);
  }, [updateStorageAndNotify]);

  const saveReportToDatabase = useCallback(async (item: HistoryItem) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        throw new Error('Failed to save report to the database');
      }
    } catch (error) {
      console.error('Error saving report to the database:', error);
    }
  }, []);

  const fetchReportFromDatabase = useCallback(async (id: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/reports/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch report from the database');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching report from the database:', error);
      return null;
    }
  }, []);

  return {
    history,
    addToHistory,
    updateHistoryItem,
    removeFromHistory,
    clearHistory,
    saveReportToDatabase,
    fetchReportFromDatabase,
  };
}