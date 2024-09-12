import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
    apiKey: "AIzaSyDODDQjBj3d2yi2CxmAg0Q_oppLVpoNmOQ",
    authDomain: "algo-marketprofile.firebaseapp.com",
    projectId: "algo-marketprofile",
    storageBucket: "algo-marketprofile.appspot.com",
    messagingSenderId: "468036056127",
    appId: "1:468036056127:web:7ed902d435ad5c9f6db48a"
  };  

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
