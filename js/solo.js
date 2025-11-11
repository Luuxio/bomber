import { Player } from "./class/player.js";
import { PowerUp } from "./class/powerup.js"; // <-- ajouté

const TILE_SIZE = 40;
const NUM_ROWS = 13;
const NUM_COLS = 15;
const POURCENTAGE_DEST = 0.5;

// Canvas
const mapCanvas = document.getElementById("map");
const mapCtx = mapCanvas.getContext("2d");

const gameCanvas = document.getElementById("game");
const gameCtx = gameCanvas.getContext("2d");

const explosionCanvas = document.getElementById("explosion");
const explosionCtx = explosionCanvas.getContext("2d");

// Valeurs initiales
const initialPosition = [1, 1];
const initialLives = 3;
const bombes = [];
const map = [];
const powerups = []; // <-- tableau des powerups

// Récupère les controles
const controls = JSON.parse(localStorage.getItem("controls_p1")) || {
    up: "ArrowUp",
    down: "ArrowDown",
    left: "ArrowLeft",
    right: "ArrowRight",
    bomb: "Space",
};

console.log("Loaded controls:", controls);

// Fonction pour mettre à jour l'affichage des lives (utilise player.lives)
const updateLivesDisplay = (player) => {
    document.getElementById("lives").textContent = `Lives: ${player.lives}`;
};

// ----------------- Création de la map -----------------
const pourcentage_destructibles = () => {
    for (let y = 0; y < NUM_ROWS; y++) {
        for (let x = 0; x < NUM_COLS; x++) {
            if (
                map[y][x] === 0 &&
                !(
                    (y === 1 && x === 1) ||
                    (y === 1 && x === 2) ||
                    (y === 2 && x === 1)
                ) &&
                Math.random() < POURCENTAGE_DEST
            ) {
                map[y][x] = 2;
            }
        }
    }
};

for (let y = 0; y < NUM_ROWS; y++) {
    const row = [];
    for (let x = 0; x < NUM_COLS; x++) {
        let tile = 0;
        if (x === 0 || y === 0 || x === NUM_COLS - 1 || y === NUM_ROWS - 1) tile = 1;
        else if (x % 2 === 0 && y % 2 === 0) tile = 1;
        row.push(tile);
    }
    map.push(row);
}
pourcentage_destructibles();

// ----------------- Dessin de la map -----------------
const drawMap = () => {
    for (let y = 0; y < NUM_ROWS; y++) {
        for (let x = 0; x < NUM_COLS; x++) {
            if (map[y][x] === 0) mapCtx.fillStyle = "#ddd";
            else if (map[y][x] === 1) mapCtx.fillStyle = "#444";
            else if (map[y][x] === 2) mapCtx.fillStyle = "#009";
            mapCtx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
};
drawMap();
spawnPowerups(); // <-- ensure powerups are created at start

// ----------------- Instanciation du Player -----------------
const player = new Player({
    position: initialPosition.slice(),
    map,
    tile_size: TILE_SIZE,
    gameCtx,
    explosionCtx,
    bombes,
    controls,
    lives: initialLives,
    redrawMap: drawMap,
    bombTimer: 2000,
    bombRange: 1,
});

// afficher lives et conserver comportement custom lors du hit
player.hit = function () {
    this.lives = Math.max(0, this.lives - 1);
    updateLivesDisplay(this);
    if (this.lives === 0) {
        alert("Game Over!");
        resetGame();
    } else {
        if (typeof this.redrawGame === "function") this.redrawGame();
    }
};

// ----------------- Dessin du joueur et bombes -----------------
const redrawMapAndPlayer = () => {
    gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    // Redessine les bombes actives
    bombes.forEach((b) => {
        if (b.active && !b.exploded && b.drawBombe) {
            b.drawBombe(gameCtx);
        }
    });

    // Dessiner powerups et vérifier pick-up pour le joueur solo
    powerups.forEach((p) => {
        p.draw(gameCtx);
        if (p.isPickedBy(player)) {
            p.applyTo(player);
            updateLivesDisplay(player);
        }
    });

    // Redessine le joueur
    gameCtx.fillStyle = "#090";
    gameCtx.fillRect(
        player.position[0] * TILE_SIZE,
        player.position[1] * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
    );
};
player.redrawGame = redrawMapAndPlayer; // lier la méthode de redraw au player

// Wrapper les bombes pour passer le joueur à explode
const origPushMethod = bombes.push;
bombes.push = function (bombe) {
    const originalExplode = bombe.explode.bind(bombe);
    bombe.explode = function () {
        // Passer le joueur pour les dégâts
        originalExplode([player]);
    };
    return origPushMethod.call(this, bombe);
};

updateLivesDisplay(player);
redrawMapAndPlayer();

// ----------------- Réinitialisation du jeu -----------------
const resetGame = () => {
    // Réinitialiser la map
    map.length = 0;
    for (let y = 0; y < NUM_ROWS; y++) {
        const row = [];
        for (let x = 0; x < NUM_COLS; x++) {
            let tile = 0;
            if (x === 0 || y === 0 || x === NUM_COLS - 1 || y === NUM_ROWS - 1) tile = 1;
            else if (x % 2 === 0 && y % 2 === 0) tile = 1;
            row.push(tile);
        }
        map.push(row);
    }
    pourcentage_destructibles();

    // Vider et réinitialiser bombes
    bombes.length = 0;

    // Nettoyer les canvas et redessiner
    mapCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
    gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    explosionCtx.clearRect(0, 0, explosionCanvas.width, explosionCanvas.height);

    drawMap();
    powerups.forEach(p => p.clear());
    spawnPowerups(); // respawn
    player.reset(initialPosition.slice(), initialLives);
    player.redrawMap = drawMap;
    player.redrawGame = redrawMapAndPlayer;
    updateLivesDisplay(player);
};

// ----------------- Événements clavier (délégués au player) -----------------
window.addEventListener("keydown", (e) => {
    switch (e.code) {
        case controls.up:
            player.moveUp();
            break;
        case controls.down:
            player.moveDown();
            break;
        case controls.left:
            player.moveLeft();
            break;
        case controls.right:
            player.moveRight();
            break;
        case controls.bomb:
            player.placeBomb();
            break;
    }
});

// Fonction pour faire apparaître les power-ups
const spawnPowerups = (count = 3) => {
    powerups.length = 0;
    const types = ["life", "range", "timer"];
    let attempts = 0;
    while (powerups.length < count && attempts < 200) {
        attempts++;
        const x = Math.floor(Math.random() * NUM_COLS);
        const y = Math.floor(Math.random() * NUM_ROWS);
        if (
            map[y] && map[y][x] === 0 &&
            !(x === initialPosition[0] && y === initialPosition[1]) &&
            !powerups.some(p => p.x === x && p.y === y)
        ) {
            const type = types[Math.floor(Math.random() * types.length)];
            powerups.push(new PowerUp({ x, y, type, tile_size: TILE_SIZE }));
        }
    }
}
