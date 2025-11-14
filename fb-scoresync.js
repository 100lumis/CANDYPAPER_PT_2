const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("uid");

// jos ei kirjautunut/dataa ei löydetty
window.addEventListener("load", () => {
    if (!userId) {
        console.warn("Ei kirjautunut.");
        return;
    }

    if (typeof saveUserData !== "function") {
        console.warn("saveUserData() not found");
        return;
    }

    const originalUpdateScore = window.updateScore;

    window.updateScore = function() {
        originalUpdateScore.apply(this, arguments);

        // tallentaa pisteet myös firebaseen
        saveUserData(userId, {
            username: window.playerName || "Unknown",
            score: window.playerEntry?.score || 0,
            time: window.playerEntry?.time || 0
        });
    };

    console.log("Pisteet synkronoitu firebaseen :", userId);
});
