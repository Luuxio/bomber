export class PowerUp {
    constructor({
        x,
        y,
        type = "life", // 'life' | 'range' | 'timer' (réduit timer) | 'range_temp'
        tile_size = 40,
        duration = 10000, // durée pour les powerups temporaires (ms)
    } = {}) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.tile_size = tile_size;
        this.duration = duration;
        this.active = true;
        this._revertTimeout = null;
    }

    getColor() {
        switch (this.type) {
            case "life":
                return "#10b981"; // vert
            case "range":
            case "range_temp":
                return "#f59e0b"; // orange
            case "timer":
                return "#06b6d4"; // cyan
            default:
                return "#ffffff";
        }
    }

    draw(ctx) {
        if (!this.active) return;
        const px = this.x * this.tile_size + this.tile_size / 2;
        const py = this.y * this.tile_size + this.tile_size / 2;
        const r = this.tile_size * 0.28;

        // improved visibility: shadow + white stroke + bright label
        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        ctx.shadowColor = "rgba(0,0,0,0.45)";
        ctx.shadowBlur = 8;
        ctx.fillStyle = this.getColor();
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();

        // white outline for contrast
        ctx.lineWidth = Math.max(2, Math.floor(this.tile_size * 0.06));
        ctx.strokeStyle = "rgba(255,255,255,0.95)";
        ctx.stroke();

        // small letter hint (bright)
        ctx.fillStyle = "#fff";
        ctx.font = `${Math.floor(this.tile_size * 0.32)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const label = this.type === "life" ? "♥" : (this.type.startsWith("range") ? "R" : "T");
        // add slight black stroke behind text for readability
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(0,0,0,0.6)";
        ctx.strokeText(label, px, py + 1);
        ctx.fillText(label, px, py + 1);
        ctx.restore();
    }

    isPickedBy(player) {
        if (!this.active) return false;
        return player.position[0] === this.x && player.position[1] === this.y;
    }

    applyTo(player) {
        if (!this.active) return;
        // Effets simples et sûrs (ne crée pas de propriétés inconnues)
        switch (this.type) {
            case "life":
                player.lives = (player.lives || 0) + 1;
                break;
            case "range":
                player.bombRange = (player.bombRange || 1) + 1;
                break;
            case "range_temp":
                player.bombRange = (player.bombRange || 1) + 1;
                // revert après duration
                if (this._revertTimeout) clearTimeout(this._revertTimeout);
                this._revertTimeout = setTimeout(() => {
                    player.bombRange = Math.max(1, (player.bombRange || 1) - 1);
                }, this.duration);
                break;
            case "timer":
                // reduce bomb timer (faster explosion) but keep a floor
                player.bombTimer = Math.max(200, (player.bombTimer || 2000) - 200);
                break;
            default:
                break;
        }

        this.active = false;
    }

    // utility to cancel timeouts when resetting level
    clear() {
        this.active = false;
        if (this._revertTimeout) {
            clearTimeout(this._revertTimeout);
            this._revertTimeout = null;
        }
    }
}
