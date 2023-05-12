import { initializeApp } from 'firebase/app'; // basico
import {getAuth} from 'firebase/auth'; // para poder se conectar com authentication
import {getFirestore} from 'firebase/firestore'; // para poder se conectar com o firestore database
import {getStorage} from 'firebase/storage'; // para poder se conectar com o storage

const firebaseConfig = {
    apiKey: "AIzaSyBMsJKC2Cgn9KFa1xUSk3to1H92xWlGW_s",
    authDomain: "sistema-de-chamados-169a5.firebaseapp.com",
    projectId: "sistema-de-chamados-169a5",
    storageBucket: "sistema-de-chamados-169a5.appspot.com",
    messagingSenderId: "408714327591",
    appId: "1:408714327591:web:3798775c807cc1c5d50002",
    measurementId: "G-CPNPQD1GYF"
};

const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp); // conexão com o authentication (login)
const db = getFirestore(firebaseApp); // conexão com o firestore database (armazenamento)
const storage = getStorage(firebaseApp); // conexão com o storage (arquivos)

export { auth, db, storage }; // exportando as conexões