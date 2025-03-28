import { useState, useEffect, useCallback } from 'react';
import { db } from '../hooks/firebaseConfig';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

export interface HistoryItem {
  id: string;
  fileName: string;
  fileSize: number;
  timestamp: Date;
  status: 'analyzed' | 'pending';
  preview?: string;
  analysis?: object | null;
  report?: string; 
}

const COLLECTION_NAME = 'file-analysis-history';

export function useFileHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        const items: HistoryItem[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: new Date(doc.data().timestamp),
        }) as HistoryItem);
        setHistory(items);
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };

    fetchHistory();
  }, []);

 
  const addToHistory = useCallback(async (item: HistoryItem) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, item.id);
      await setDoc(docRef, {
        fileName: item.fileName,
        fileSize: item.fileSize,
        timestamp: item.timestamp.toISOString(),
        status: item.status,
        preview: item.preview || null,
        analysis: item.analysis || null,
        report: item.report || null, 
      });

      setHistory(prev => [item, ...prev]);
    } catch (error) {
      console.error('Error adding history item:', error);
    }
  }, []);

  const updateHistoryItem = useCallback(async (id: string, updates: Partial<HistoryItem>) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, updates);

      setHistory(prev => prev.map(item => (item.id === id ? { ...item, ...updates } : item)));
    } catch (error) {
      console.error('Error updating history item:', error);
    }
  }, []);

  
  const removeFromHistory = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting history item:', error);
    }
  }, []);

  
  const clearHistory = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      querySnapshot.forEach(async docSnap => {
        await deleteDoc(doc(db, COLLECTION_NAME, docSnap.id));
      });

      setHistory([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }, []);

  // Fetch a specific report from Firestore
  const fetchReportFromDatabase = useCallback(async (id: string) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log('Fetched report:', docSnap.data());
        // Return the report data
        return docSnap.data();
      } else {
        console.warn('No such document!');
        return null;
      }
    } catch (error) {
      console.error('Error fetching report from Firestore:', error);
      return null;
    }
  }, []);

  // Save the report to Firestore
  const saveReportToDatabase = useCallback(async (item: HistoryItem) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, item.id);
      await updateDoc(docRef, {
        report: item.report || null, // Save the report to Firestore
        status: 'analyzed', // Update the status to 'analyzed'\\
        analysis: item.analysis || null, // Save the analysis to Firestore        
      });
      console.log('Report saved to Firestore:', item);

      // Update the history locally as well
      setHistory(prev =>
        prev.map((historyItem) =>
          historyItem.id === item.id ? { ...historyItem, report: item.report, status:'analyzed' } : historyItem
        )
      );
    } catch (error) {
      console.error('Error saving report to Firestore:', error);
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