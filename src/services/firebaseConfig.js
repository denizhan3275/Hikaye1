// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyACiiUDQxbklfaTuHiJdxiTDkIjA18qSa0",
    authDomain: "hikaye-a725b.firebaseapp.com",
    projectId: "hikaye-a725b",
    storageBucket: "hikaye-a725b.firebasestorage.app",
    messagingSenderId: "359989764283",
    appId: "1:359989764283:web:134cf4d05a37fdf21e099e",
    measurementId: "G-0G78NHKL0S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Authentication functions
export const registerUser = async (email, password, kullaniciAdi) => {
    try {
        // Önce kullanıcıyı oluştur
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Kullanıcı profilini güncelle
        await updateProfile(user, {
            displayName: kullaniciAdi
        });

        // Firestore'a kullanıcı bilgilerini kaydet
        await setDoc(doc(db, "kullanicilar", user.uid), {
            kullaniciAdi: kullaniciAdi,
            email: email,
            kayitTarihi: new Date().toISOString(),
            sonGirisTarihi: new Date().toISOString()
        });

        return { user: userCredential.user, error: null };
    } catch (error) {
        let errorMessage = "Üye olma işlemi başarısız oldu.";
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = "Bu e-posta adresi zaten kullanımda.";
        } else if (error.code === 'auth/weak-password') {
            errorMessage = "Şifre en az 6 karakter olmalıdır.";
        }
        return { user: null, error: errorMessage };
    }
};

export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Kullanıcının son giriş tarihini güncelle
        await setDoc(doc(db, "kullanicilar", user.uid), {
            sonGirisTarihi: new Date().toISOString()
        }, { merge: true });

        return { user: userCredential.user, error: null };
    } catch (error) {
        let errorMessage = "Giriş işlemi başarısız oldu.";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            errorMessage = "E-posta veya şifre hatalı.";
        }
        return { user: null, error: errorMessage };
    }
};

// Kullanıcı bilgilerini getir
export const getKullaniciBilgileri = async (userId) => {
    try {
        const docRef = doc(db, "kullanicilar", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { data: docSnap.data(), error: null };
        } else {
            return { data: null, error: "Kullanıcı bilgileri bulunamadı." };
        }
    } catch (error) {
        return { data: null, error: "Kullanıcı bilgileri alınamadı." };
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
        return { error: null };
    } catch (error) {
        return { error: "Çıkış işlemi başarısız oldu." };
    }
};

export { auth, analytics, db };