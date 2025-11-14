async function saveDifficultyScore(difficulty, score) {
  const userId = firebase.auth().currentUser?.uid || currentLocalUserId;

  let userData = await loadUserData(userId);
  if (!userData.highScores) userData.highScores = {};

  // Save only if new score is higher
  if (!userData.highScores[difficulty] || score > userData.highScores[difficulty]) {
    userData.highScores[difficulty] = score;
    await saveUserData(userId, userData);
  }
}
