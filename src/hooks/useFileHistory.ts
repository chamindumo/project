import { useState, useEffect } from 'react';

export interface HistoryItem {
  id: string;
  fileName: string;
  fileSize: number;
  timestamp: Date;
  status: 'analyzed' | 'pending';
  preview?: string;
  analysis?: string;
}

const STORAGE_KEY = 'file-analysis-history';

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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const addToHistory = (item: HistoryItem) => {
    setHistory(prev => [item, ...prev]);
  };

  const updateHistoryItem = (id: string, updates: Partial<HistoryItem>) => {
    setHistory(prev => 
      prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const removeFromHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return {
    history,
    addToHistory,
    updateHistoryItem,
    removeFromHistory,
    clearHistory
  };
}