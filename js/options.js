// Récupère les contrôles existants ou valeurs par défaut
const controls_p1 = JSON.parse(localStorage.getItem("controls_p1")) || {
    up: "ArrowUp",
    down: "ArrowDown",
    left: "ArrowLeft",
    right: "ArrowRight",
    bomb: "Space"
};

const controls_p2 = JSON.parse(localStorage.getItem("controls_p2")) || {
    up: "KeyW",
    down: "KeyS",
    left: "KeyA",
    right: "KeyD",
    bomb: "KeyE"
};

document.addEventListener("DOMContentLoaded", () => {
    // Affiche les valeurs actuelles pour Player 1
    for (const [key, value] of Object.entries(controls_p1)) {
        const input = document.getElementById(`key-${key}-p1`);
        if (input) input.value = value;
    }

    // Affiche les valeurs actuelles pour Player 2
    for (const [key, value] of Object.entries(controls_p2)) {
        const input = document.getElementById(`key-${key}-p2`);
        if (input) input.value = value;
    }

    // Gère les inputs Player 1
    document.querySelectorAll("input[id*='-p1']").forEach((input) => {
        input.addEventListener("click", () => {
            input.value = "Appuyez sur une touche...";
            const keyName = input.id.replace("key-", "").replace("-p1", "");

            const keyListener = (e) => {
                e.preventDefault();
                controls_p1[keyName] = e.code;
                input.value = e.code;
                localStorage.setItem("controls_p1", JSON.stringify(controls_p1));
                console.log(`Nouvelle touche Player 1 ${keyName}: ${e.code}`);
                window.removeEventListener("keydown", keyListener);
            };

            window.addEventListener("keydown", keyListener);
        });
    });

    // Gère les inputs Player 2
    document.querySelectorAll("input[id*='-p2']").forEach((input) => {
        input.addEventListener("click", () => {
            input.value = "Appuyez sur une touche...";
            const keyName = input.id.replace("key-", "").replace("-p2", "");

            const keyListener = (e) => {
                e.preventDefault();
                controls_p2[keyName] = e.code;
                input.value = e.code;
                localStorage.setItem("controls_p2", JSON.stringify(controls_p2));
                console.log(`Nouvelle touche Player 2 ${keyName}: ${e.code}`);
                window.removeEventListener("keydown", keyListener);
            };

            window.addEventListener("keydown", keyListener);
        });
    });
});

// Export pour utilisation dans d'autres fichiers
export { controls_p1, controls_p2 };
