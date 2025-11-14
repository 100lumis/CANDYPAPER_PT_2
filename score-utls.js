async function saveHighScore(score) {
  const user = firebase.auth().currentUser;
  if (!user) return; // ei kirjautunut return function. bleeh

  const userRef = firebase.firestore().collection("players").doc(user.uid);
  const doc = await userRef.get();

  // tallentaa high scoren
  if (!doc.exists || score > (doc.data().highScore || 0)) {
    await userRef.set({
      username: user.displayName || "Anonymous",
      highScore: score
    }, { merge: true });
  }
}
