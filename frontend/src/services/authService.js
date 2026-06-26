import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, signOut, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";


const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

async function syncUser(token, username = null) {

    const response = await fetch(`${API_URL}/auth/sync`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            username,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data?.detail ?? "No fue posible guardar el usuario",
        );
    }

    return data;
}


export async function registerWithEmail({ username, email, password }) {

    const credential = await createUserWithEmailAndPassword(auth, email, password);


    await updateProfile(credential.user, {
        displayName: username,
    });

    const token = await credential.user.getIdToken();

    const profile = await syncUser(token, username);

    return {
        user: credential.user,
        token,
        profile,
    };
}

export async function loginWithEmail({ email, password }) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const token = await credential.user.getIdToken();
  const profile = await syncUser(token, credential.user.displayName);

  return { user: credential.user, token, profile };
}

export async function continueWithGoogle() {
    const credential = await signInWithPopup(auth, googleProvider);

    const token = await credential.user.getIdToken();

    const profile = await syncUser(
        token,
        credential.user.displayName,
    );

    console.log("Profile:", profile);

    return {
        user: credential.user,
        token,
        profile,
    };
}

export function observeAuthState(callback) {
    return onAuthStateChanged(auth, callback);
}

export async function getCurrentProfile() {
    const currentUser = auth.currentUser;

    if (!currentUser) {
        return null;
    }

    const token = await currentUser.getIdToken();

    const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.detail ?? "No fue posible obtener el perfil");
    }

    return data;
}

export async function logout() {
    await signOut(auth);
}