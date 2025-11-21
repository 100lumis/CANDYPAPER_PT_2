// Detect local/offline mode
const isLocal = window.location.protocol === "file:";

let auth = null;
let db = null;

// Only initialize Firebase if not local
if (!isLocal) {
  const firebaseConfig = {
    apiKey: "AIzaSyBH9Eb9mRWeSx4ySuyasPf0cQ0I0JZdm2s",
    authDomain: "candypaperdb-69758.firebaseapp.com",
    projectId: "candypaperdb-69758",
    storageBucket: "candypaperdb-69758.appspot.com",
    messagingSenderId: "805331025403",
    appId: "1:805331025403:web:6bf883ad174a1886f49f5e"
  };

  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
}

// ----- Shared SAVE & LOAD for all pages -----
async function saveUserData(userId, data) {
  localStorage.setItem("playerData_" + userId, JSON.stringify(data));

  if (!isLocal && db) {
    try {
      await db.collection("players").doc(userId).set(data, { merge: true });
    } catch (err) {
      console.warn("Could not save to Firebase:", err);
    }
  }
}

async function loadUserData(userId) {
  const localBackup = localStorage.getItem("playerData_" + userId);
  if (isLocal || !db) return localBackup ? JSON.parse(localBackup) : null;

  try {
    const docSnap = await db.collection("players").doc(userId).get();
    if (docSnap.exists) return docSnap.data();
  } catch {
    console.warn("Could not fetch from Firebase, using local data");
  }

  return localBackup ? JSON.parse(localBackup) : null;
}

// ----- LOGIN FORM HANDLER -----
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) return alert("Syötä käyttäjänimi ja salasana.");

    // ----- LOCAL MODE -----
    if (isLocal) {
      let users = JSON.parse(localStorage.getItem("localUsers") || "{}");
      let user = users[username];

      if (!user) {
        user = { password, userId: "user_" + Math.random().toString(36).slice(2) };
        users[username] = user;
        localStorage.setItem("localUsers", JSON.stringify(users));
        alert("Uusi käyttäjä luotu (local)!");
      } else if (user.password !== password) {
        return alert("Virheellinen salasana");
      }

      let userData = await loadUserData(user.userId);
      if (!userData) {
        userData = { username, scores: [] };
        await saveUserData(user.userId, userData);
      }

      alert("Kirjautuminen onnistui (local)!");
      window.location.href = "Candypaper3.html";
      return;
    }

    // ----- ONLINE MODE -----
    const fakeEmail = username + "@mygame.com";

    try {
      // Try sign in
      const userCredential = await auth.signInWithEmailAndPassword(fakeEmail, password);
      const user = userCredential.user;

      // Ensure displayName is set for game
      if (!user.displayName) {
        await user.updateProfile({ displayName: username });
      }

      let userData = await loadUserData(user.uid);
      if (!userData) {
        userData = { username, scores: [] };
        await saveUserData(user.uid, userData);
      }

      alert("Kirjautuminen onnistui!");
      window.location.href = "Candypaper3.html";

    } catch (err) {
      // If sign in fails, create new account
      try {
        const userCredential = await auth.createUserWithEmailAndPassword(fakeEmail, password);
        const user = userCredential.user;

        await user.updateProfile({ displayName: username });

        const userData = { username, scores: [] };
        await saveUserData(user.uid, userData);

        alert("Uusi käyttäjä luotu ja kirjautunut!");
        window.location.href = "Candypaper3.html";

      } catch (err2) {
        console.error("Login/Register failed:", err2);
        alert("Virhe: " + err2.message);
      }
    }
  });
}

