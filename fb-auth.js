import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

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

// domdomdomdom
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // firebase vaatii spostin niin tämä on workaround? saatan muuttaa.
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const fakeEmail = username + "@mygame.com";

    try {
      const userCredential = await signInWithEmailAndPassword(auth, fakeEmail, password);
      const user = userCredential.user;
      console.log("Kirjautunut:", user.uid);

      const userDocRef = doc(db, "players", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      // tarkista firebase LK....
      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          username: username,
          score: 0
        });
        console.log("Rekisteröinti onnistunut!");
      } else {
        console.log("Hei taas,", userDocSnap.data().username);
      }

      alert("Kirjautuminen onnistui!");
      window.location.href = "candy2.html";
      return;

    } catch (error) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, fakeEmail, password);
        const user = userCredential.user;

        // muuta tämä LK
        await setDoc(doc(db, "players", user.uid), {
          username: username,
          score: 0
        });

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
