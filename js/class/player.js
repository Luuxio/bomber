import { Bombe } from "./bombe.js";

export class Player {
    constructor({
        position = [1, 1],
        map,
        tile_size = 40,
        gameCtx,
        explosionCtx,
        bombes = [],
        controls = { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", bomb: "Space" },
        lives = 3,
        redrawMap = null,
        redrawGame = null,
        bombTimer = 2000,
        bombRange = 1,
        otherPlayers = [],
    } = {}) {
        this.position = position;
        this.map = map;
        this.tile_size = tile_size;
        this.gameCtx = gameCtx;
        this.explosionCtx = explosionCtx;
        this.bombes = bombes;
        this.controls = controls;
        this.lives = lives;
        this.redrawMap = redrawMap;
        this.redrawGame = redrawGame;
        this.bombTimer = bombTimer;
        this.bombRange = bombRange;
        this.otherPlayers = otherPlayers;
    }

    draw(color = "#090") {
        if (!this.gameCtx) return;
        const [x, y] = this.position;
        this.gameCtx.fillStyle = color;
        this.gameCtx.fillRect(x * this.tile_size, y * this.tile_size, this.tile_size, this.tile_size);
    }

    checkPos(x, y) {
        // Le joueur ne peux pas rentrer dans les murs, ne peux pas rentrer dans un bombe et dans un autre joueur
        if (y < 0 || x < 0 || y >= this.map.length || x >= this.map[0].length) return false;
        if (this.map[y][x] === 1 || this.map[y][x] === 2) return false;
        if (this.bombes.some((b) => b.active && b.x === x && b.y === y)) return false;
        // Vérifier collision avec les autres joueurs
        if (this.otherPlayers.some((player) => player.position[0] === x && player.position[1] === y)) return false;
        return true;
    }

    moveUp() {
        const newY = this.position[1] - 1;
        if (this.checkPos(this.position[0], newY)) {
            this.position[1] = newY;
            if (typeof this.redrawGame === "function") this.redrawGame();
        }
    }
    moveDown() {
        const newY = this.position[1] + 1;
        if (this.checkPos(this.position[0], newY)) {
            this.position[1] = newY;
            if (typeof this.redrawGame === "function") this.redrawGame();
        }
    }
    moveLeft() {
        const newX = this.position[0] - 1;
        if (this.checkPos(newX, this.position[1])) {
            this.position[0] = newX;
            if (typeof this.redrawGame === "function") this.redrawGame();
        }
    }
    moveRight() {
        const newX = this.position[0] + 1;
        if (this.checkPos(newX, this.position[1])) {
            this.position[0] = newX;
            if (typeof this.redrawGame === "function") this.redrawGame();
        }
    }

    canPlaceBomb() {
        // Vérifie s'il y a une bombe active posée par ce joueur
        return !this.bombes.some((b) => b.active && b.owner === this);
    }

    placeBomb() {
        if (!this.canPlaceBomb()) return null;
        const [x, y] = this.position;
        const bombe = new Bombe(
            x,
            y,
            this.explosionCtx,
            this.map,
            this.tile_size,
            this.bombTimer,
            this.bombRange,
            this.position,
            this
        );
        bombe.redrawMap = this.redrawMap;
        bombe.redrawGame = this.redrawGame;
        // Ne pas définir onPlayerHit : explode() appellera directement player.hit()
        this.bombes.push(bombe);
        if (typeof this.redrawGame === "function") this.redrawGame();
        return bombe;
    }

    hit() {
        this.lives = Math.max(0, this.lives - 1);
        if (this.lives === 0) {
            this.reset();
        }
        if (typeof this.redrawGame === "function") this.redrawGame();
    }

    reset(position = [1, 1], lives = 3) {
        this.position = position;
        this.lives = lives;
        // clear bombs array references (bomb instances keep running unless cleared elsewhere)
        this.bombes.length = 0;
        if (typeof this.redrawMap === "function") this.redrawMap();
        if (typeof this.redrawGame === "function") this.redrawGame();
    }

    // Optionnel : lier les touches du player au clavier (utile pour migration depuis solo.js)
    bindKeyboard() {
        window.addEventListener("keydown", (e) => {
            switch (e.code) {
                case this.controls.up:
                    this.moveUp();
                    break;
                case this.controls.down:
                    this.moveDown();
                    break;
                case this.controls.left:
                    this.moveLeft();
                    break;
                case this.controls.right:
                    this.moveRight();
                    break;
                case this.controls.bomb:
                    this.placeBomb();
                    break;
            }
        });
    }
}
