import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  enableIndexedDbPersistence 
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBH9Eb9mRWeSx4ySuyasPf0cQ0I0JZdm2s",
  authDomain: "candypaperdb-69758.firebaseapp.com",
  projectId: "candypaperdb-69758",
  storageBucket: "candypaperdb-69758.appspot.com",
  messagingSenderId: "805331025403",
  appId: "1:805331025403:web:6bf883ad174a1886f49f5e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  console.warn("Offline persistence not available:", err.code);
});

// --- Utility functions ---
async function saveUserData(userId, data) {
  localStorage.setItem("playerData_" + userId, JSON.stringify(data));
  await setDoc(doc(db, "players", userId), data, { merge: true });
}

async function loadUserData(userId) {
  try {
    const snap = await getDoc(doc(db, "players", userId));
    if (snap.exists()) return snap.data();
    const localBackup = localStorage.getItem("playerData_" + userId);
    return localBackup ? JSON.parse(localBackup) : null;
  } catch {
    const localBackup = localStorage.getItem("playerData_" + userId);
    return localBackup ? JSON.parse(localBackup) : null;
  }
}

// DOM login logic
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const fakeEmail = username + "@mygame.com";

    try {
      const userCredential = await signInWithEmailAndPassword(auth, fakeEmail, password);
      const user = userCredential.user;
      console.log("Kirjautunut:", user.uid);

      let userData = await loadUserData(user.uid);
      if (!userData) {
        userData = { username, score: 0 };
        await saveUserData(user.uid, userData);
      }

      alert("Kirjautuminen onnistui!");
      window.location.href = "candy2.html";
      return;

    } catch (error) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, fakeEmail, password);
        const user = userCredential.user;

        const userData = { username, score: 0 };
        await saveUserData(user.uid, userData);

        alert("Uusi käyttäjä luotu ja kirjautunut!");
        window.location.href = "candy2.html";
        return;

      } catch (error) {
        console.error("Login/Register failed:", error);
        alert("Virhe: " + error.message);
      }
    }
  });
}

// Listen for connectivity
window.addEventListener("online", () => console.log("🔁 Back online"));
window.addEventListener("offline", () => console.log("📴 Offline mode"));
