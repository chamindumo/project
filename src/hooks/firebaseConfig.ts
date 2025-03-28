import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
    apiKey: "AIzaSyDXj1bUtm1JkmEDGJTJsSM32EVM_5UPgDs",
    authDomain: "final-year-project-250b5.firebaseapp.com",
    projectId: "final-year-project-250b5",
    storageBucket: "final-year-project-250b5.firebasestorage.app",
    messagingSenderId: "945588571898",
    appId: "1:945588571898:web:04048f189b92ec41778343"
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);



