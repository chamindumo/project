import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCWYsvSn1AdSsdYIhUPZzi8GJv8vPrQkfA",
    authDomain: "cyber-f9683.firebaseapp.com",
    projectId: "cyber-f9683",
    storageBucket: "cyber-f9683.firebasestorage.app",
    messagingSenderId: "155496684192",
    appId: "1:155496684192:web:94ee07e8b6ac57874587c5",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
