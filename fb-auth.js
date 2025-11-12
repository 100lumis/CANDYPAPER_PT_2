<script>
// --- Local / Firebase check ---
const isLocal = location.protocol === "file:";

let auth = null;
let db = null;

if (!isLocal) {
  // Firebase config
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

  console.log("Firebase initialized ✅");
} else {
  console.log("🧩 Running locally");
}

// --- LocalStorage backup functions ---
async function saveUserData(userId, data) {
  localStorage.setItem("playerData_" + userId, JSON.stringify(data));

  if (!isLocal && db) {
    await db.collection("players").doc(userId).set(data, { merge: true });
  }
}

async function loadUserData(userId) {
  const localBackup = localStorage.getItem("playerData_" + userId);

  if (isLocal || !db) {
    return localBackup ? JSON.parse(localBackup) : null;
  }

  try {
    const doc = await db.collection("players").doc(userId).get();
    if (doc.exists) return doc.data();
  } catch {
    console.warn("Could not fetch from Firebase, using local data");
  }

  return localBackup ? JSON.parse(localBackup) : null;
}

// --- Login / Register logic ---
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    if (!usernameInput || !passwordInput) {
      alert("Form inputs not found");
      return;
    }

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      alert("Syötä käyttäjänimi ja salasana.");
      return;
    }

    const fakeEmail = username + "@mygame.com";

    // --- LOCAL MODE ---
    if (isLocal) {
      const key = "userAuth_" + username;
      let user = JSON.parse(localStorage.getItem(key));

      if (user && user.password === password) {
        console.log("Logged in locally:", user.userId);
      } else if (!user) {
        user = { userId: "user_" + Math.random().toString(36).slice(2), username, password };
        localStorage.setItem(key, JSON.stringify(user));
        console.log("New local user created:", user.userId);
      } else {
        alert("Virheellinen salasana");
        return;
      }

      let userData = await loadUserData(user.userId);
      if (!userData) {
        userData = { username, score: 0 };
        await saveUserData(user.userId, userData);
      }

      alert("Kirjautuminen onnistui (local)!");
      window.location.href = "candy2.html";
      return;
    }

    // --- FIREBASE MODE ---
    if (!auth) {
      alert("Firebase ei ole vielä valmis.");
      return;
    }

    try {
      const userCredential = await auth.signInWithEmailAndPassword(fakeEmail, password);
      const user = userCredential.user;
      console.log("Logged in:", user.uid);

      let userData = await loadUserData(user.uid);
      if (!userData) {
        userData = { username, score: 0 };
        await saveUserData(user.uid, userData);
      }

      alert("Kirjautuminen onnistui!");
      window.location.href = "Candypaper2.html";
    } catch (error) {
      try {
        const userCredential = await auth.createUserWithEmailAndPassword(fakeEmail, password);
        const user = userCredential.user;

        const userData = { username, score: 0 };
        await saveUserData(user.uid, userData);

        alert("Uusi käyttäjä luotu ja kirjautunut!");
        window.location.href = "Candypaper2.html";
      } catch (regError) {
        console.error("Login/Register failed:", regError);
        alert("Virhe: " + regError.message);
      }
    }
  });
}

// --- Network events ---
window.addEventListener("online", () => console.log("🔁 Online"));
window.addEventListener("offline", () => console.log("📴 Offline"));
</script>


