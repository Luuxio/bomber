import { Player } from "./class/player.js";
import { controls_p1, controls_p2 } from "./options.js";
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
const initialPosition1 = [1, 1];
const initialPosition2 = [NUM_COLS - 2, NUM_ROWS - 2];
const initialLives = 3;
const bombes = [];
const map = [];
const powerups = []; // <-- tableau des powerups

console.log("Loaded controls P1:", controls_p1);
console.log("Loaded controls P2:", controls_p2);

// Fonction pour mettre à jour l'affichage des lives des deux joueurs
const updateLivesDisplay = (player1, player2) => {
    document.getElementById("lives").textContent = `P1: ${player1.lives} | P2: ${player2.lives}`;
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
                    (y === 2 && x === 1) ||
                    (y === NUM_ROWS - 2 && x === NUM_COLS - 2) ||
                    (y === NUM_ROWS - 2 && x === NUM_COLS - 3) ||
                    (y === NUM_ROWS - 3 && x === NUM_COLS - 2)
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
spawnPowerups(); // <-- appelera la fonction définie plus bas

// ----------------- Instanciation des deux Players -----------------
const player1 = new Player({
    position: initialPosition1.slice(),
    map,
    tile_size: TILE_SIZE,
    gameCtx,
    explosionCtx,
    bombes,
    controls: controls_p1,
    lives: initialLives,
    redrawMap: drawMap,
    bombTimer: 2000,
    bombRange: 1,
    otherPlayers: [], // sera défini après
});

const player2 = new Player({
    position: initialPosition2.slice(),
    map,
    tile_size: TILE_SIZE,
    gameCtx,
    explosionCtx,
    bombes,
    controls: controls_p2,
    lives: initialLives,
    redrawMap: drawMap,
    bombTimer: 2000,
    bombRange: 1,
    otherPlayers: [], // sera défini après
});

// Lier les joueurs l'un à l'autre pour les collisions
player1.otherPlayers = [player2];
player2.otherPlayers = [player1];

// Custom hit handler pour P1
player1.hit = function () {
    this.lives = Math.max(0, this.lives - 1);
    updateLivesDisplay(player1, player2);
    if (this.lives === 0) {
        alert("Player 2 Wins!");
        resetGame();
    } else {
        if (typeof this.redrawGame === "function") this.redrawGame();
    }
};

// Custom hit handler pour P2
player2.hit = function () {
    this.lives = Math.max(0, this.lives - 1);
    updateLivesDisplay(player1, player2);
    if (this.lives === 0) {
        alert("Player 1 Wins!");
        resetGame();
    } else {
        if (typeof this.redrawGame === "function") this.redrawGame();
    }
};

// Ajout de la fonction spawnPowerups (place quelques powerups sur cases vides)
function spawnPowerups(count = 4) {
    powerups.length = 0;
    const types = ["life", "range", "timer", "range_temp"];
    let attempts = 0;
    while (powerups.length < count && attempts < 200) {
        attempts++;
        const x = Math.floor(Math.random() * NUM_COLS);
        const y = Math.floor(Math.random() * NUM_ROWS);
        // case vide, pas mur et pas position de départ des joueurs
        if (
            map[y] && map[y][x] === 0 &&
            !(x === initialPosition1[0] && y === initialPosition1[1]) &&
            !(x === initialPosition2[0] && y === initialPosition2[1]) &&
            !powerups.some(p => p.x === x && p.y === y)
        ) {
            const type = types[Math.floor(Math.random() * types.length)];
            powerups.push(new PowerUp({ x, y, type, tile_size: TILE_SIZE }));
        }
    }
}

// ----------------- Dessin des deux joueurs et bombes -----------------
const redrawMapAndPlayer = () => {
    gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    // Redessine les bombes actives
    bombes.forEach((b) => {
        if (b.active && !b.exploded && b.drawBombe) {
            b.drawBombe(gameCtx);
        }
    });

    // Dessiner powerups (avant joueurs) et vérifier pick-up
    powerups.forEach((p) => {
        p.draw(gameCtx);
        if (p.isPickedBy(player1)) {
            p.applyTo(player1);
            updateLivesDisplay(player1, player2);
        } else if (p.isPickedBy(player2)) {
            p.applyTo(player2);
            updateLivesDisplay(player1, player2);
        }
    });

    // Redessine le joueur 1 (vert)
    gameCtx.fillStyle = "#090";
    gameCtx.fillRect(
        player1.position[0] * TILE_SIZE,
        player1.position[1] * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
    );

    // Redessine le joueur 2 (rouge)
    gameCtx.fillStyle = "#f00";
    gameCtx.fillRect(
        player2.position[0] * TILE_SIZE,
        player2.position[1] * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
    );
};
player1.redrawGame = redrawMapAndPlayer;
player2.redrawGame = redrawMapAndPlayer;

// Wrapper les bombes pour passer allPlayers à explode
const originalBombesProxy = (playerRef) => {
    const origPushMethod = playerRef.bombes.push;
    playerRef.bombes.push = function (bombe) {
        const originalExplode = bombe.explode.bind(bombe);
        bombe.explode = function () {
            // Passer les deux joueurs pour que les dégâts s'appliquent à tous
            originalExplode([player1, player2]);
        };
        return origPushMethod.call(this, bombe);
    };
};
originalBombesProxy(player1);
originalBombesProxy(player2);

updateLivesDisplay(player1, player2);
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
    player1.reset(initialPosition1.slice(), initialLives);
    player2.reset(initialPosition2.slice(), initialLives);
    player1.redrawMap = drawMap;
    player1.redrawGame = redrawMapAndPlayer;
    player2.redrawMap = drawMap;
    player2.redrawGame = redrawMapAndPlayer;
    updateLivesDisplay(player1, player2);
};

// ----------------- Événements clavier (pour les deux joueurs) -----------------
window.addEventListener("keydown", (e) => {
    // Contrôles Player 1
    switch (e.code) {
        case controls_p1.up:
            player1.moveUp();
            break;
        case controls_p1.down:
            player1.moveDown();
            break;
        case controls_p1.left:
            player1.moveLeft();
            break;
        case controls_p1.right:
            player1.moveRight();
            break;
        case controls_p1.bomb:
            player1.placeBomb();
            break;
    }

    // Contrôles Player 2
    switch (e.code) {
        case controls_p2.up:
            player2.moveUp();
            break;
        case controls_p2.down:
            player2.moveDown();
            break;
        case controls_p2.left:
            player2.moveLeft();
            break;
        case controls_p2.right:
            player2.moveRight();
            break;
        case controls_p2.bomb:
            player2.placeBomb();
            break;
    }
});
// Redéfinir la méthode explode des bombes après création
const bombesProxy = new Proxy(bombes, {
    set(target, prop, value) {
        if (prop === 'length' || typeof prop === 'symbol') {
            return Reflect.set(target, prop, value);
        }
        if (typeof value === 'object' && value !== null && value.explode) {
            const originalExplode = value.explode.bind(value);
            value.explode = function () {
                originalExplode([player1, player2]);
            };
        }
        return Reflect.set(target, prop, value);
    }
});

player1.bombes = bombesProxy;
player2.bombes = bombesProxy;
