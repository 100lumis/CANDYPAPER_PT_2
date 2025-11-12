
// localhost check....
const isLocal = location.hostname === "localhost" || location.protocol === "file:";

// firebase
let auth = null;
let db = null;

if (!isLocal) {
  // fb import
  import("https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js")
    .then(async ({ initializeApp }) => {
      const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js");
      const { getFirestore, doc, setDoc, getDoc, enableIndexedDbPersistence } = await import("https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js");

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
      auth = getAuth(app);
      db = getFirestore(app);

      enableIndexedDbPersistence(db).catch((err) => {
        console.warn("Offline persistence not available:", err.code);
      });
    });
} else {
  console.log("Käytössä paikallisesti.");
}

async function saveUserData(userId, data) {
  localStorage.setItem("playerData_" + userId, JSON.stringify(data));

  if (!isLocal && db) {
    const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js");
    await setDoc(doc(db, "players", userId), data, { merge: true });
  }
}

async function loadUserData(userId) {
  const localBackup = localStorage.getItem("playerData_" + userId);

  if (isLocal || !db) {
    return localBackup ? JSON.parse(localBackup) : null;
  }

  const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js");
  try {
    const snap = await getDoc(doc(db, "players", userId));
    if (snap.exists()) return snap.data();
  } catch {
    console.warn("Could not fetch from Firebase, using local data");
  }
  return localBackup ? JSON.parse(localBackup) : null;
}

// --- Auth / login logic ---
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const fakeEmail = username + "@mygame.com";

    if (isLocal) {
      // local setup
      const key = "userAuth_" + username;
      let user = JSON.parse(localStorage.getItem(key));

      if (user && user.password === password) {
        console.log("Kirjautunut (local):", user.userId);
      } else if (!user) {
        user = { userId: "user_" + Math.random().toString(36).slice(2), username, password };
        localStorage.setItem(key, JSON.stringify(user));
        console.log("Uusi käyttäjä luotu (local):", user.userId);
      } else {
        alert("Virheellinen salasana");
        return;
      }

      let userData = loadUserData(user.userId);
      if (!userData) {
        userData = { username, score: 0 };
        saveUserData(user.userId, userData);
      }

      alert("Kirjautuminen onnistui (local)!");
      window.location.href = "candy2.html";
      return;
    }

    // firebase setup
    try {
      const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js");
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
    } catch (error) {
      try {
        const { createUserWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js");
        const userCredential = await createUserWithEmailAndPassword(auth, fakeEmail, password);
        const user = userCredential.user;
        const userData = { username, score: 0 };
        await saveUserData(user.uid, userData);

        alert("Uusi käyttäjä luotu ja kirjautunut!");
        window.location.href = "candy2.html";
      } catch (error) {
        console.error("Login/Register failed:", error);
        alert("Virhe: " + error.message);
      }
    }
  });
}

// testailua varten
window.addEventListener("online", () => console.log("🔁 Online"));
window.addEventListener("offline", () => console.log("📴 Offline"));
