import { initializeApp, getApps, getApp } from 'firebase/app';
import {
    getAuth,
    initializeAuth,
    // @ts-ignore
    getReactNativePersistence,
    type Auth,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyBu5SpmHc33wGHdwCGEqpdflCvqZL2NKj8",
    authDomain: "exponotify-dc9a7.firebaseapp.com",
    projectId: "exponotify-dc9a7",
    storageBucket: "exponotify-dc9a7.firebasestorage.app",
    messagingSenderId: "165589836657",
    appId: "1:165589836657:web:a3c830d162e7745d8c8cd0",
    measurementId: "G-RPEBK8BPX8"
};

let app;
let authInstance: Auth;

if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    // @ts-ignore
    authInstance = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
    });
} else {
    app = getApp();
    authInstance = getAuth(app);
}

export const auth = authInstance;
export { app };