export class Bombe {
    constructor(
        x,
        y,
        explosionCtx,
        map,
        tile_size = 40,
        timer = 2000,
        range = 1,
        playerPosition = [0, 0],
        owner = null
    ) {
        this.x = x;
        this.y = y;
        this.explosionCtx = explosionCtx; // canvas dédié explosions
        this.map = map;
        this.tile_size = tile_size;
        this.timer = timer;
        this.range = range;
        this.active = true;
        this.playerPosition = playerPosition;
        this.owner = owner; // joueur qui a posé la bombe
        this.exploded = false;
        this.onPlayerHit = null;
        this.startTimer();
    }

    startTimer() {
        setTimeout(() => this.explode(), this.timer);
    }

    isPlayerInRange(playerPosition) {
        const [playerX, playerY] = playerPosition;
        // Vérifie seulement les 4 directions cardinales (pas les diagonales)
        return (
            (Math.abs(this.x - playerX) <= this.range && this.y === playerY) ||
            (Math.abs(this.y - playerY) <= this.range && this.x === playerX)
        );
    }

    explode(allPlayers = null) {
        this.exploded = true;

        if (typeof this.redrawGame === "function") this.redrawGame();

        this.drawExplosion();
        this.destroyWalls();

        // Vérifier tous les joueurs passés en paramètre, ou juste playerPosition par défaut
        if (allPlayers && Array.isArray(allPlayers)) {
            allPlayers.forEach((player) => {
                if (this.isPlayerInRange(player.position)) {
                    console.log(`Player at ${player.position} is in the explosion range! Damage applied.`);
                    if (typeof player.hit === "function") {
                        player.hit();
                    }
                }
            });
        } else if (this.isPlayerInRange(this.playerPosition)) {
            console.log("Player is in the explosion range! Damage applied.");
            if (typeof this.onPlayerHit === "function") {
                this.onPlayerHit();
            }
        }

        if (typeof this.redrawMap === "function") this.redrawMap();
        if (typeof this.redrawGame === "function") this.redrawGame();

        setTimeout(() => {
            this.active = false;
            this.clearExplosion();
            if (typeof this.redrawGame === "function") this.redrawGame();
        }, 200);
    }

    clearBombe(ctx) {
        const px = this.x * this.tile_size;
        const py = this.y * this.tile_size;
        ctx.clearRect(px, py, this.tile_size, this.tile_size); // Clear the bomb area
    }

    drawBombe(ctx) {
        if (!this.active) {
            this.clearBombe(ctx); // Clear the bomb if it's not active
            return;
        }

        const px = this.x * this.tile_size;
        const py = this.y * this.tile_size;

        // Corps de la bombe
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(
            px + this.tile_size / 2,
            py + this.tile_size / 2,
            this.tile_size / 3,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Mèche
        ctx.strokeStyle = "orange";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(
            px + this.tile_size / 2,
            py + this.tile_size / 2 - this.tile_size / 3
        );
        ctx.lineTo(
            px + this.tile_size / 2,
            py + this.tile_size / 4 - this.tile_size / 3
        );
        ctx.stroke();
    }

    drawExplosion() {
        this.explosionCtx.fillStyle = "orange";
        this.drawExplosionTile(this.x, this.y);

        const dirs = [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
        ];

        dirs.forEach(([dx, dy]) => this.drawExplosionDir(dx, dy));
    }

    drawExplosionTile(x, y) {
        this.explosionCtx.fillRect(
            x * this.tile_size,
            y * this.tile_size,
            this.tile_size,
            this.tile_size
        );
    }

    drawExplosionDir(dx, dy) {
        for (let i = 1; i <= this.range; i++) {
            const nx = this.x + dx * i;
            const ny = this.y + dy * i;
            if (this.map[ny][nx] === 1) break; // mur fixe
            this.drawExplosionTile(nx, ny);
            if (this.map[ny][nx] === 2) break; // mur destructible
        }
    }

    destroyWalls() {
        const dirs = [
            [0, 0],
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
        ];

        dirs.forEach(([dx, dy]) => {
            for (let i = 0; i <= this.range; i++) {
                const nx = this.x + dx * i;
                const ny = this.y + dy * i;
                if (this.map[ny][nx] === 1) break;
                if (this.map[ny][nx] === 2) {
                    this.map[ny][nx] = 0; // met à jour la map
                    break;
                }
            }
        });
    }

    clearExplosion() {
        this.explosionCtx.clearRect(
            (this.x - this.range) * this.tile_size,
            (this.y - this.range) * this.tile_size,
            (this.range * 2 + 1) * this.tile_size,
            (this.range * 2 + 1) * this.tile_size
        );
    }
}
