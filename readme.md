# 🎮 Bomber

Un jeu Bomberman multijoueur en JavaScript vanilla avec Canvas.

## 📋 Table des matières

-   [Installation](#installation)
-   [Modes de jeu](#modes-de-jeu)
-   [Contrôles](#contrôles)
-   [Mécanique](#mécanique)
-   [Powerups](#powerups)
-   [Structure du projet](#structure-du-projet)

## 🚀 Installation

1. Clonez le repository
2. Ouvrez `html/index.html` dans votre navigateur

Aucune dépendance externe requise.

## 🎮 Modes de jeu

### Solo

-   **Objectif** : Survivre et explorer la carte
-   **Ennemis** : Aucun, juste de l'exploration
-   **Vies** : 3 (perdues par les explosions)

### Multijoueur (2 joueurs)

-   **Objectif** : Éliminer le joueur adverse
-   **Vies** : 3 (le premier à 0 vies perd)
-   **Collision** : Les joueurs se bloquent mutuellement

## ⌨️ Contrôles

### Joueur 1 (Solo & Multi)

| Action      | Touche        |
| ----------- | ------------- |
| Haut        | ↑ Arrow Up    |
| Bas         | ↓ Arrow Down  |
| Gauche      | ← Arrow Left  |
| Droite      | → Arrow Right |
| Poser bombe | Spacebar      |

### Joueur 2 (Multi uniquement)

| Action      | Touche |
| ----------- | ------ |
| Haut        | W      |
| Bas         | S      |
| Gauche      | A      |
| Droite      | D      |
| Poser bombe | E      |

**Personnalisable** via le menu Options.

## 🎯 Mécanique

### Placement de bombe

1. Appuyez sur la touche **Bombe**
2. Une bombe apparaît sous le joueur
3. Après **2 secondes** (par défaut), elle explose
4. L'explosion :
    - Détruit les murs destructibles (bleus)
    - Blesse les joueurs dans la zone d'effet
    - S'étend jusqu'à la **portée** (1 par défaut, extensible)

### Zone d'explosion

```
      [Centre]
   [Gauche] [Droite]
      [Bas]
```

L'explosion s'étend en croix jusqu'au bout de la **portée**, bloquée par les murs fixes.

### Système de vies

-   Chaque joueur commence avec **3 vies**
-   Touché par une explosion = -1 vie
-   0 vies = Défaite / Game Over

## 💎 Powerups

Les powerups apparaissent aléatoirement sur les cases vides (après destruction de murs).

| Powerup          | Couleur   | Effet                                          |
| ---------------- | --------- | ---------------------------------------------- |
| **Life** ♥       | 🟢 Vert   | +1 vie                                         |
| **Range** R      | 🟠 Orange | +1 portée (permanent)                          |
| **Range Temp** R | 🟠 Orange | +1 portée (10s puis revient)                   |
| **Timer** T      | 🔵 Cyan   | Réduit le timer à 1800ms (bombes plus rapides) |

**Collecte** : Passez simplement sur le powerup.

## 📁 Structure du projet

```
bomber/
├── html/
│   ├── index.html          # Menu principal
│   ├── solo.html           # Page jeu solo
│   ├── multi.html          # Page jeu multijoueur
│   └── options.html        # Configuration contrôles
├── css/
│   ├── index.css           # Style menu
│   ├── solo.css            # Style solo
│   ├── multi.css           # Style multi
│   └── options.css         # Style options
├── js/
│   ├── index.js            # Navigation menu
│   ├── solo.js             # Logique jeu solo
│   ├── multi.js            # Logique jeu multi
│   ├── options.js          # Gestion contrôles
│   └── class/
│       ├── player.js       # Classe joueur
│       ├── bombe.js        # Classe bombe & explosion
│       └── powerup.js      # Classe powerups
```

## 🛠️ Classes principales

### `Player`

Gère le joueur : mouvement, placement de bombe, collision, vies.

**Propriétés** :

-   `position` : `[x, y]`
-   `lives` : nombre de vies
-   `bombTimer` : délai avant explosion
-   `bombRange` : portée d'explosion

### `Bombe`

Gère la bombe : timer, explosion, détection de joueurs.

**Propriétés** :

-   `x, y` : position
-   `timer` : délai avant explosion (ms)
-   `range` : portée (cases)
-   `active` : si la bombe est active
-   `owner` : joueur qui l'a posée

### `PowerUp`

Gère les powerups : affichage, collecte, effets temporaires.

**Propriétés** :

-   `type` : 'life' | 'range' | 'timer' | 'range_temp'
-   `x, y` : position
-   `active` : si collecté ou non

## 💡 Astuces de jeu

-   **Solo** : Explorez pour trouver les powerups avant qu'un adversaire n'apparaisse
-   **Multi** : Utilisez les murs pour vous défendre et piéger votre adversaire
-   **Range** : Avec une grande portée, vous avez plus de contrôle mais moins de sécurité
-   **Timer réduit** : Les bombes plus rapides permettent un jeu plus agressif

## 📝 Personnalisation

Modifiez dans le code :

-   `TILE_SIZE` : Taille des cases (défaut: 40px)
-   `POURCENTAGE_DEST` : Densité des murs destructibles (défaut: 50%)
-   `bombTimer` : Délai explosion par défaut (défaut: 2000ms)
-   `range` : Portée de l'explosion (défaut: 1)

Ou via le menu **Options** pour les contrôles.

## Méthode des Canvas

Dans le code il existe 3 canvas :

-   `Canvas Map` :
    -   Contient : Murs fixes + murs destructibles
    -   Rédessiné : Rarement (seulement quand un mur est détruit)
    -   Raison : Statique, pas besoin de redessiner chaque frame
-   `Canvas Joueurs/Bombes` :
    -   Contient : Joueurs + bombes
    -   Rédessiné : Chaque frame (60fps environ)
    -   Raison : En constant mouvement
-   `Canvas Explosions`:
    -   Contient : Les oranges d'explosion uniquement
    -   Rédessiné : Lors d'une explosion, puis effacé après 200ms
    -   Raison : Séparation des effets visuels, plus facile à gérer

---

**Développé en JavaScript vanilla avec HTML5 Canvas** 🎨
