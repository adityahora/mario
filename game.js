// =============================================
// KRIPA'S JOURNEY TO AADITYA - Main Game Engine
// A Mario-style platformer with 3 levels
// =============================================

// ===== CONSTANTS =====
const TILE = 40;           // tile size in game units
const GRAVITY = 0.55;
const MAX_FALL = 12;
const PLAYER_SPEED = 4.2;
const PLAYER_JUMP = -11;
const ENEMY_SPEED = 1.1;
const TOTAL_LIVES = 3;
const INVINCIBLE_TIME = 90; // frames

// ===== GAME STATE =====
let canvas, ctxG;
let gameState = 'title'; // title, tutorial, playing, paused, levelIntro, levelComplete, gameover, victory
let currentLevel = 0;
let lives = TOTAL_LIVES;
let score = 0;
let levelStartTime = 0;
let frameCount = 0;

// Camera
let camera = { x: 0, y: 0 };

// Input
const keys = {};
const mobileInput = { left: false, right: false, jump: false };

// Images
let kripaImg = new Image();
let aadityaImg = new Image();
let kripaLoaded = false;
let aadityaLoaded = false;
kripaImg.onload = () => { kripaLoaded = true; };
aadityaImg.onload = () => { aadityaLoaded = true; };
kripaImg.src = 'kripa.png';
aadityaImg.src = 'aaditya.png';

// ===== PLAYER =====
let player = {
    x: 0, y: 0,
    w: 36, h: 44,
    vx: 0, vy: 0,
    onGround: false,
    facing: 1,
    invincible: 0,
    dead: false,
    won: false,
    frame: 0,
    animTimer: 0,
    hurtCooldown: 0,
    ridingPlatform: null
};

// ===== LEVEL DATA =====
// Tile types:
// 0 = air, 1 = ground, 2 = brick, 3 = platform (top-only),
// 4 = rose (collectible), 5 = heart (1-up), 6 = spike,
// P = player start, G = goal (aaditya), E = enemy

const LEVEL_DATA = [
    // ===== LEVEL 1: The Garden of Love =====
    {
        name: "The Garden of Love",
        hint: "Ride the moving platforms & survive the garden gauntlet! 🌸",
        bgGradient: ['#1a0533', '#2d1b4e', '#4a2860'],
        bgStars: true,
        groundColor: '#3d6b35',
        groundTopColor: '#5a9e4e',
        brickColor: '#8B6914',
        brickTopColor: '#c49b26',
        message: "Through every flower and every path, Kripa's heart leads her closer to Aaditya. 🌸",
        map: [
            '                                                                                                                                                          ',
            '                                                                                                                                                          ',
            '              4                                                                                   4                                                       ',
            '           3333333                                                                             3333333                                4                   ',
            '        333       333                                       4                               333   E  333                           3333333                ',
            '                                   4        5            3333333                          333                             4      333   E  333              ',
            '     33333              E        333333   33333       333   E   333       33333              333            E           33333  333            333  333      ',
            '  P     E          E                        E     E                  E          E       E       E       E            E                           E     G   ',
            '11111111111   11111111111   1111111111  11111111  111111111    1111111111111   111111  11111111111111   111111  111111111111   11111   11   111   1111111111111',
            '11111111111   11111111111   1111111111  11111111  111111111    1111111111111   111111  11111111111111   111111  111111111111   11111   11   111   1111111111111',
            '11111111111   11111111111   1111111111  11111111  111111111    1111111111111   111111  11111111111111   111111  111111111111   11111   11   111   1111111111111',
        ],
        movingPlatforms: [
            // MP0: Bridge over first 3-wide gap at cols 11-13
            { x: 11*40, y: 7*40, w: 120, startX: 10*40, endX: 14*40, speed: 0.9 },
            // MP1: Vertical lift to reach the high rose (col ~39)
            { x: 39*40, y: 6*40, w: 100, startY: 6*40, endY: 3*40, speed: 0.55, startX: 39*40, endX: 39*40 },
            // MP2: Bridge over 4-wide gap at cols 59-62
            { x: 59*40, y: 7*40, w: 100, startX: 57*40, endX: 64*40, speed: 1.0 },
            // MP3: Vertical lift to high rose near col 82
            { x: 82*40, y: 6*40, w: 100, startY: 6*40, endY: 3*40, speed: 0.6, startX: 82*40, endX: 82*40 },
            // === END GAUNTLET ===
            // MP4: Fast bridge over gauntlet gap at cols 124-126
            { x: 124*40, y: 7*40, w: 80, startX: 122*40, endX: 128*40, speed: 1.4 },
            // MP5: Elevated bridge in gauntlet at cols 132-134
            { x: 132*40, y: 6*40, w: 80, startX: 130*40, endX: 136*40, speed: 1.2 },
        ],
        platformEnemies: [
            { x: 39*40 + 20, y: 5*40, platformIndex: 1 },
            { x: 132*40 + 10, y: 5*40, platformIndex: 5 },
        ],
        enemies: [],
        items: [],
        platforms: []
    },
    // ===== LEVEL 2: The Moonlit Bridge =====
    {
        name: "The Moonlit Bridge",
        hint: "The bridges are treacherous — time every jump! 🌙",
        bgGradient: ['#0a0020', '#15003a', '#2a0055'],
        bgStars: true,
        groundColor: '#4a3860',
        groundTopColor: '#6a5080',
        brickColor: '#6B3A5E',
        brickTopColor: '#9a5888',
        message: "Even across the darkest bridges, love lights the way forward. 🌙💫",
        map: [
            '                                                                                                                                                                                    ',
            '                                                                                                                                                                                    ',
            '                                                    4                                                        4                                                                      ',
            '                    4                             3333333                                                  3333333                                          4                        ',
            '                 3333333                       333   E  333                             4                                               4                3333333                      ',
            '          4   333       333        4        333               5          33333       3333333             333       333        4       333   E  333      333       333                  ',
            '       3333333             333  3333333  333       E        33333     333     333                     333             333  3333333  333            333       E       333  33333         ',
            '  P       E                        E          E          E                      E            E     E                         E                              E              E     G    ',
            '1111111111111   111   1111111111  111111111  11111111  11111111   11  11111111111   111111  111111111111   11  1111111111111   1111   1111111111   111   111   11111   11   111111111111 ',
            '1111111111111   111   1111111111  111111111  11111111  11111111   11  11111111111   111111  111111111111   11  1111111111111   1111   1111111111   111   111   11111   11   111111111111 ',
            '1111111111111   111   1111111111  111111111  11111111  11111111   11  11111111111   111111  111111111111   11  1111111111111   1111   1111111111   111   111   11111   11   111111111111 ',
        ],
        movingPlatforms: [
            // MP0: Bridge over 3-wide gap near start
            { x: 14*40, y: 7*40, w: 80, startX: 13*40, endX: 17*40, speed: 1.1 },
            // MP1: Vertical lift to high rose
            { x: 42*40, y: 6*40, w: 100, startY: 6*40, endY: 3*40, speed: 0.5, startX: 42*40, endX: 42*40 },
            // MP2: Horizontal over gap cols 62-63
            { x: 62*40, y: 6*40, w: 80, startX: 60*40, endX: 65*40, speed: 1.2 },
            // MP3: Vertical lift to high rose near col 80
            { x: 80*40, y: 6*40, w: 100, startY: 6*40, endY: 3*40, speed: 0.65, startX: 80*40, endX: 80*40 },
            // === END GAUNTLET ===
            // MP4: Fast bridge in gauntlet zone
            { x: 136*40, y: 7*40, w: 80, startX: 134*40, endX: 139*40, speed: 1.5 },
            // MP5: Second gauntlet bridge
            { x: 142*40, y: 6*40, w: 80, startX: 140*40, endX: 145*40, speed: 1.3 },
            // MP6: Third gauntlet bridge (fast)
            { x: 150*40, y: 7*40, w: 80, startX: 148*40, endX: 153*40, speed: 1.6 },
        ],
        platformEnemies: [
            { x: 42*40 + 20, y: 5*40, platformIndex: 1 },
            { x: 62*40 + 10, y: 5*40, platformIndex: 2 },
            { x: 142*40 + 10, y: 5*40, platformIndex: 5 },
        ],
        enemies: [],
        items: [],
        platforms: []
    },
    // ===== LEVEL 3: The Sky of Forever =====
    {
        name: "The Sky of Forever",
        hint: "The ultimate test! Survive the sky gauntlet to reach Aaditya! ☁️",
        bgGradient: ['#1a0030', '#350055', '#5a0080'],
        bgStars: true,
        groundColor: '#5a3075',
        groundTopColor: '#7a4895',
        brickColor: '#884488',
        brickTopColor: '#aa66aa',
        message: "Against all odds, through every challenge, your love conquered it all. 💖✨",
        map: [
            '                                                                                                                                                                                                                ',
            '                                                                                                                                                                                                                ',
            '                                             4                                                                      4                                                                                           ',
            '                4                         3333333                        4                                        3333333                                               4                                        ',
            '             3333333                   333   E  333                   3333333                                  333   E  333                               4           3333333                                    ',
            '      4   333       333      4      333               4      5     333       333                33333       333             333        4               333   E  333  333   E  333                                 ',
            '   3333333             333  33333        E          33333  33333                 333  33333  333     333  333                  333   3333333    E     333            333            333   333     333   333          ',
            '   P  E                        E                E                      E                        E                                     E          E                                      E       E       E    G    ',
            '11111111   11   1111111111  111111111  111111  111111   11  11111111111   11  111111111111   111  1111111111111   11   111111111   1111  1111111111   111   1111   111   111111   11   111   11111   11   111111111111',
            '11111111   11   1111111111  111111111  111111  111111   11  11111111111   11  111111111111   111  1111111111111   11   111111111   1111  1111111111   111   1111   111   111111   11   111   11111   11   111111111111',
            '11111111   11   1111111111  111111111  111111  111111   11  11111111111   11  111111111111   111  1111111111111   11   111111111   1111  1111111111   111   1111   111   111111   11   111   11111   11   111111111111',
        ],
        movingPlatforms: [
            // MP0: Bridge over gap cols 8-10
            { x: 8*40, y: 7*40, w: 80, startX: 7*40, endX: 12*40, speed: 1.1 },
            // MP1: Vertical lift to high rose near col 37
            { x: 37*40, y: 6*40, w: 100, startY: 6*40, endY: 3*40, speed: 0.5, startX: 37*40, endX: 37*40 },
            // MP2: Bridge over gap cols 55-56
            { x: 55*40, y: 7*40, w: 80, startX: 53*40, endX: 58*40, speed: 1.3 },
            // MP3: Vertical to high rose near col 70
            { x: 70*40, y: 6*40, w: 100, startY: 6*40, endY: 2*40, speed: 0.6, startX: 70*40, endX: 70*40 },
            // MP4: Bridge over gap cols 91-92
            { x: 91*40, y: 7*40, w: 80, startX: 89*40, endX: 94*40, speed: 1.2 },
            // === END GAUNTLET — 5 moving platforms in rapid succession ===
            // MP5: Gauntlet bridge 1
            { x: 132*40, y: 7*40, w: 80, startX: 130*40, endX: 135*40, speed: 1.5 },
            // MP6: Gauntlet bridge 2 (elevated)
            { x: 139*40, y: 6*40, w: 80, startX: 137*40, endX: 142*40, speed: 1.4 },
            // MP7: Gauntlet bridge 3
            { x: 147*40, y: 7*40, w: 80, startX: 145*40, endX: 150*40, speed: 1.6 },
            // MP8: Gauntlet bridge 4 (elevated)
            { x: 155*40, y: 6*40, w: 80, startX: 153*40, endX: 158*40, speed: 1.3 },
            // MP9: Final bridge to goal
            { x: 163*40, y: 7*40, w: 80, startX: 161*40, endX: 166*40, speed: 1.7 },
        ],
        platformEnemies: [
            { x: 37*40 + 20, y: 5*40, platformIndex: 1 },
            { x: 55*40 + 10, y: 6*40, platformIndex: 2 },
            { x: 70*40 + 20, y: 5*40, platformIndex: 3 },
            { x: 139*40 + 10, y: 5*40, platformIndex: 6 },
            { x: 155*40 + 10, y: 5*40, platformIndex: 8 },
        ],
        enemies: [],
        items: [],
        platforms: []
    }
];

// ===== ENTITY CLASSES =====
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = 32;
        this.h = 32;
        this.vx = ENEMY_SPEED * (Math.random() > 0.5 ? 1 : -1);
        this.vy = 0;
        this.onGround = false;
        this.alive = true;
        this.deathTimer = 0;
        this.frame = 0;
        this.animTimer = 0;
    }

    update(tiles, mPlatforms) {
        if (!this.alive) {
            this.deathTimer--;
            return this.deathTimer > 0;
        }

        this.animTimer++;
        if (this.animTimer % 15 === 0) this.frame = 1 - this.frame;

        // If enemy is assigned to a moving platform, ride it
        if (this.onMovingPlatform !== undefined && mPlatforms && mPlatforms[this.onMovingPlatform]) {
            const mp = mPlatforms[this.onMovingPlatform];
            this.x += mp.dx;
            this.y = mp.y - this.h; // sit on top

            // Patrol on the moving platform surface
            this.x += this.vx;
            // Clamp to platform edges
            if (this.x < mp.x + 2) {
                this.x = mp.x + 2;
                this.vx *= -1;
            }
            if (this.x + this.w > mp.x + mp.w - 2) {
                this.x = mp.x + mp.w - this.w - 2;
                this.vx *= -1;
            }
            this.onGround = true;
            this.vy = 0;
            return true;
        }

        // Apply gravity to enemies just like the player
        this.vy += GRAVITY;
        if (this.vy > MAX_FALL) this.vy = MAX_FALL;

        // Horizontal movement
        this.x += this.vx;

        // Check walls
        const nextX = this.vx > 0 ? this.x + this.w : this.x;
        const tileX = Math.floor(nextX / TILE);
        const tileY = Math.floor((this.y + this.h - 2) / TILE);
        if (getTile(tiles, tileX, tileY) >= 1 && getTile(tiles, tileX, tileY) <= 2) {
            this.vx *= -1;
            // Push out of wall
            if (this.vx > 0) {
                this.x = tileX * TILE;
            } else {
                this.x = (tileX + 1) * TILE - this.w;
            }
        }

        // Check edge (don't walk off platforms) — only when on ground
        if (this.onGround) {
            const edgeX = Math.floor((this.vx > 0 ? this.x + this.w + 2 : this.x - 2) / TILE);
            const edgeY = Math.floor((this.y + this.h + 4) / TILE);
            const groundBelow = getTile(tiles, edgeX, edgeY);
            if (groundBelow === 0) {
                this.vx *= -1;
            }
        }

        // Vertical movement (gravity)
        this.onGround = false;
        this.y += this.vy;

        // Ground collision
        const bottomRow = Math.floor((this.y + this.h - 1) / TILE);
        const leftCol = Math.floor(this.x / TILE);
        const rightCol = Math.floor((this.x + this.w - 1) / TILE);
        for (let col = leftCol; col <= rightCol; col++) {
            const t = getTile(tiles, col, bottomRow);
            if (t === 1 || t === 2) {
                this.y = bottomRow * TILE - this.h;
                this.vy = 0;
                this.onGround = true;
            }
            // Also land on platforms (one-way)
            if (t === 3 && this.vy >= 0) {
                const platTop = bottomRow * TILE;
                if (this.y + this.h - this.vy <= platTop + 4) {
                    this.y = platTop - this.h;
                    this.vy = 0;
                    this.onGround = true;
                }
            }
        }

        // Fall off map — remove enemy
        if (this.y > levelHeight * TILE + 200) {
            return false;
        }

        return true;
    }

    draw(ctx) {
        const dx = this.x - camera.x;
        const dy = this.y - camera.y;
        if (!this.alive) {
            ctx.globalAlpha = this.deathTimer / 15;
            ctx.save();
            ctx.translate(dx + this.w / 2, dy + this.h / 2);
            ctx.scale(1, this.deathTimer / 15);
            ctx.fillStyle = '#e74c3c';
            drawCrab(ctx, -this.w / 2, -this.h / 2, this.w, this.h, this.frame);
            ctx.restore();
            ctx.globalAlpha = 1;
            return;
        }
        drawCrab(ctx, dx, dy, this.w, this.h, this.frame, this.vx < 0);
    }
}

class Item {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.w = 28;
        this.h = 28;
        this.type = type; // 'rose' or 'heart'
        this.collected = false;
        this.bobOffset = Math.random() * Math.PI * 2;
        this.sparkleTimer = 0;
    }

    update() {
        this.bobOffset += 0.05;
        this.sparkleTimer++;
        return !this.collected;
    }

    draw(ctx) {
        if (this.collected) return;
        const bob = Math.sin(this.bobOffset) * 4;
        const dx = this.x - camera.x;
        const dy = this.y + bob - camera.y;
        const glow = Math.sin(this.sparkleTimer * 0.08) * 0.3 + 0.7;

        if (this.type === 'rose') {
            ctx.font = '24px serif';
            ctx.globalAlpha = glow;
            ctx.fillText('🌹', dx, dy + 22);
            ctx.globalAlpha = 1;
        } else if (this.type === 'heart') {
            ctx.font = '26px serif';
            ctx.globalAlpha = glow;
            ctx.fillText('💖', dx, dy + 24);
            ctx.globalAlpha = 1;
        }
    }
}

class Particle {
    constructor(x, y, color, vx, vy, life, size) {
        this.x = x; this.y = y;
        this.color = color;
        this.vx = vx; this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.size = size || 4;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1;
        this.life--;
        return this.life > 0;
    }
    draw(ctx) {
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - camera.x, this.y - camera.y, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

// ===== MOVING PLATFORM CLASS =====
class MovingPlatform {
    constructor(x, y, w, startX, endX, speed, startY, endY) {
        this.x = x;
        this.y = y;
        this.w = w;         // width in pixels
        this.h = 10;        // thin platform
        this.startX = startX !== undefined ? startX : x;
        this.endX = endX !== undefined ? endX : x;
        this.startY = startY !== undefined ? startY : y;
        this.endY = endY !== undefined ? endY : y;
        this.speed = speed || 1;
        this.dx = 0;        // frame delta x (for carrying entities)
        this.dy = 0;        // frame delta y (for carrying entities)
        this.t = 0;         // interpolation parameter 0..1
        this.direction = 1; // 1 = forward, -1 = backward
    }

    update() {
        const prevX = this.x;
        const prevY = this.y;

        this.t += this.speed * 0.008 * this.direction;
        if (this.t >= 1) { this.t = 1; this.direction = -1; }
        if (this.t <= 0) { this.t = 0; this.direction = 1; }

        // Smooth easing for natural movement
        const ease = this.t; // linear for predictable gameplay
        this.x = this.startX + (this.endX - this.startX) * ease;
        this.y = this.startY + (this.endY - this.startY) * ease;

        this.dx = this.x - prevX;
        this.dy = this.y - prevY;
    }

    draw(ctx) {
        const dx = this.x - camera.x;
        const dy = this.y - camera.y;

        // Platform body - glowing pink
        ctx.fillStyle = 'rgba(255, 107, 157, 0.35)';
        ctx.fillRect(dx, dy, this.w, this.h);
        ctx.fillStyle = '#ff6b9d';
        ctx.fillRect(dx, dy, this.w, 3);

        // Moving indicator arrows
        ctx.fillStyle = 'rgba(255,200,220,0.5)';
        const arrowPhase = Math.sin(Date.now() * 0.005) * 0.5 + 0.5;
        if (this.startX !== this.endX) {
            // Horizontal arrows
            const ax = dx + this.w / 2 - 6 + arrowPhase * 4;
            ctx.beginPath();
            ctx.moveTo(ax, dy + 5);
            ctx.lineTo(ax + 5, dy + 2);
            ctx.lineTo(ax + 5, dy + 8);
            ctx.fill();
            const ax2 = dx + this.w / 2 + 2 - arrowPhase * 4;
            ctx.beginPath();
            ctx.moveTo(ax2 + 5, dy + 5);
            ctx.lineTo(ax2, dy + 2);
            ctx.lineTo(ax2, dy + 8);
            ctx.fill();
        }
        if (this.startY !== this.endY) {
            // Vertical arrows
            const ay = dy + 3 + arrowPhase * 2;
            ctx.beginPath();
            ctx.moveTo(dx + this.w / 2, ay - 3);
            ctx.lineTo(dx + this.w / 2 - 4, ay + 2);
            ctx.lineTo(dx + this.w / 2 + 4, ay + 2);
            ctx.fill();
        }

        // Glow effect underneath
        ctx.fillStyle = 'rgba(255, 107, 157, 0.08)';
        ctx.fillRect(dx, dy + this.h, this.w, 6);

        // Edge dots
        ctx.fillStyle = '#ffb8d0';
        ctx.fillRect(dx + 2, dy + 4, 3, 3);
        ctx.fillRect(dx + this.w - 5, dy + 4, 3, 3);
    }
}

// ===== PARSED LEVEL RUNTIME =====
let tiles = [];
let enemies = [];
let items = [];
let particles = [];
let movingPlatforms = [];
let goalPos = { x: 0, y: 0 };
let levelWidth = 0;
let levelHeight = 0;
let totalRoses = 0;
let collectedRoses = 0;
let goalUnlocked = false;

// ===== PARSE LEVEL FROM MAP =====
function parseLevel(levelIndex) {
    const data = LEVEL_DATA[levelIndex];
    const map = data.map;
    enemies = [];
    items = [];
    particles = [];
    tiles = [];
    movingPlatforms = [];
    totalRoses = 0;
    collectedRoses = 0;
    player.hurtCooldown = 0;
    goalUnlocked = false;

    levelHeight = map.length;
    levelWidth = 0;

    for (let row = 0; row < map.length; row++) {
        tiles[row] = [];
        if (map[row].length > levelWidth) levelWidth = map[row].length;
        for (let col = 0; col < map[row].length; col++) {
            const ch = map[row][col];
            let tile = 0;
            switch (ch) {
                case '1': tile = 1; break; // ground
                case '2': tile = 2; break; // brick
                case '3': tile = 3; break; // platform
                case '6': tile = 6; break; // spike
                case '4': // rose
                    items.push(new Item(col * TILE + 6, row * TILE + 6, 'rose'));
                    totalRoses++;
                    break;
                case '5': // heart
                    items.push(new Item(col * TILE + 6, row * TILE + 6, 'heart'));
                    break;
                case 'P': // player start
                    player.x = col * TILE;
                    player.y = row * TILE - player.h;
                    player.vx = 0;
                    player.vy = 0;
                    player.onGround = false;
                    player.facing = 1;
                    player.invincible = 0;
                    player.dead = false;
                    player.won = false;
                    break;
                case 'G': // goal
                    goalPos = { x: col * TILE, y: row * TILE - 40 };
                    break;
                case 'E': // enemy — spawn at tile position, gravity will drop them to ground
                    enemies.push(new Enemy(col * TILE, row * TILE - 32));
                    break;
                default:
                    break;
            }
            tiles[row][col] = tile;
        }
    }
    // Pad rows
    for (let row = 0; row < tiles.length; row++) {
        while (tiles[row].length < levelWidth) tiles[row].push(0);
    }

    // Create moving platforms from level data
    if (data.movingPlatforms) {
        for (const mp of data.movingPlatforms) {
            movingPlatforms.push(new MovingPlatform(
                mp.x, mp.y, mp.w,
                mp.startX, mp.endX, mp.speed,
                mp.startY, mp.endY
            ));
        }
    }

    // Create enemies on moving platforms
    if (data.platformEnemies) {
        for (const pe of data.platformEnemies) {
            const e = new Enemy(pe.x, pe.y);
            e.onMovingPlatform = pe.platformIndex;
            enemies.push(e);
        }
    }
}

function getTile(t, col, row) {
    if (row < 0 || row >= t.length || col < 0 || col >= (t[0]?.length || 0)) return 0;
    return t[row][col];
}

function isSolid(col, row) {
    const t = getTile(tiles, col, row);
    return t === 1 || t === 2;
}

function isPlatform(col, row) {
    return getTile(tiles, col, row) === 3;
}

// ===== PLAYER PHYSICS =====
function updatePlayer() {
    if (player.dead || player.won) return;

    const left = keys['KeyS'] || mobileInput.left;
    const right = keys['KeyW'] || mobileInput.right;
    const jump = keys['Space'] || mobileInput.jump;

    // Horizontal movement
    if (left) {
        player.vx = -PLAYER_SPEED;
        player.facing = -1;
    } else if (right) {
        player.vx = PLAYER_SPEED;
        player.facing = 1;
    } else {
        player.vx *= 0.7;
        if (Math.abs(player.vx) < 0.3) player.vx = 0;
    }

    // Jump
    if (jump && player.onGround) {
        player.vy = PLAYER_JUMP;
        player.onGround = false;
        SFX.jump();
    }

    // Gravity
    player.vy += GRAVITY;
    if (player.vy > MAX_FALL) player.vy = MAX_FALL;

    // Animation
    player.animTimer++;
    if (Math.abs(player.vx) > 0.5 && player.onGround) {
        if (player.animTimer % 8 === 0) player.frame = (player.frame + 1) % 4;
    } else if (!player.onGround) {
        player.frame = 2; // jump frame
    } else {
        player.frame = 0;
    }

    // Invincibility
    if (player.invincible > 0) player.invincible--;
    if (player.hurtCooldown > 0) player.hurtCooldown--;

    // Horizontal collision
    player.x += player.vx;
    resolveHorizontal();

    // Vertical collision
    const wasOnGround = player.onGround;
    player.onGround = false;
    player.y += player.vy;
    resolveVertical();

    // Moving platform check — after normal collision
    player.ridingPlatform = null;
    if (player.vy >= 0 || player.onGround) {
        for (let mp of movingPlatforms) {
            const playerBottom = player.y + player.h;
            const playerRight = player.x + player.w;
            // Check if player is on top of this moving platform
            if (playerRight > mp.x + 4 && player.x < mp.x + mp.w - 4 &&
                playerBottom >= mp.y && playerBottom <= mp.y + mp.h + 6) {
                player.y = mp.y - player.h;
                player.vy = 0;
                player.onGround = true;
                player.ridingPlatform = mp;
                break;
            }
        }
    }

    // Fell off the map?
    if (player.y > levelHeight * TILE + 100) {
        playerDie(true);
    }

    // Clamp left boundary
    if (player.x < 0) player.x = 0;
}

function resolveHorizontal() {
    const left = Math.floor(player.x / TILE);
    const right = Math.floor((player.x + player.w - 1) / TILE);
    const top = Math.floor(player.y / TILE);
    const bottom = Math.floor((player.y + player.h - 1) / TILE);

    for (let row = top; row <= bottom; row++) {
        // Right side
        if (isSolid(right, row)) {
            player.x = right * TILE - player.w;
            player.vx = 0;
        }
        // Left side
        if (isSolid(left, row)) {
            player.x = (left + 1) * TILE;
            player.vx = 0;
        }
    }
}

function resolveVertical() {
    const left = Math.floor(player.x / TILE);
    const right = Math.floor((player.x + player.w - 1) / TILE);
    const top = Math.floor(player.y / TILE);
    const bottom = Math.floor((player.y + player.h - 1) / TILE);

    for (let col = left; col <= right; col++) {
        // Falling down
        if (player.vy >= 0) {
            if (isSolid(col, bottom)) {
                player.y = bottom * TILE - player.h;
                player.vy = 0;
                player.onGround = true;
            }
            // Platform (one-way) — land on it if player was above it last frame
            if (isPlatform(col, bottom)) {
                const platTop = bottom * TILE;
                const playerBottom = player.y + player.h;
                const prevBottom = playerBottom - player.vy;
                if (prevBottom <= platTop + 10) {
                    player.y = platTop - player.h;
                    player.vy = 0;
                    player.onGround = true;
                }
            }
        }
        // Going up — only solid blocks stop you
        if (player.vy < 0 && isSolid(col, top)) {
            player.y = (top + 1) * TILE;
            player.vy = 0;
        }
    }
}

// ===== COLLISIONS =====
function checkCollisions() {
    if (player.dead || player.won) return;

    // Enemies — clear stomp vs side-hit logic
    for (let e of enemies) {
        if (!e.alive) continue;
        // Shrunken hitboxes matching visible crab body
        const ex = e.x + 6, ey = e.y + 4, ew = e.w - 12, eh = e.h - 6;
        const px = player.x + 5, py = player.y + 2, pw = player.w - 10, ph = player.h - 4;

        // Check overlap
        if (px < ex + ew && px + pw > ex && py < ey + eh && py + ph > ey) {
            // Player is falling AND player's feet are in the top 60% of the enemy
            const playerFeet = player.y + player.h;
            if (player.hurtCooldown <= 0 && player.vy > 0 && playerFeet <= e.y + e.h * 0.65) {
                // STOMP — kill the enemy (only if NOT in hurt cooldown)
                e.alive = false;
                e.deathTimer = 15;
                player.vy = PLAYER_JUMP * 0.55;
                score += 100;
                SFX.stomp();
                spawnParticles(e.x + e.w / 2, e.y + e.h / 2, '#e74c3c', 8);
            } else if (player.invincible <= 0) {
                // SIDE HIT — only if player is NOT above the enemy (prevents random top damage)
                if (playerFeet > e.y + e.h * 0.35) {
                    playerHurt();
                    // Knockback away from enemy
                    player.vy = -6;
                    player.vx = (player.x < e.x) ? -6 : 6;
                    player.hurtCooldown = 30; // prevent auto-stomp for 30 frames
                }
            }
        }
    }

    // Items
    for (let item of items) {
        if (item.collected) continue;
        if (rectOverlap(player, item)) {
            item.collected = true;
            if (item.type === 'rose') {
                score += 50;
                collectedRoses++;
                SFX.collect();
                spawnParticles(item.x + item.w / 2, item.y + item.h / 2, '#ff6b9d', 6);
                updateRoseHUD();
                // Check if all roses collected
                if (collectedRoses >= totalRoses && !goalUnlocked) {
                    goalUnlocked = true;
                    SFX.oneUp();
                }
            } else if (item.type === 'heart') {
                if (lives < TOTAL_LIVES) {
                    lives++;
                    updateLivesHUD();
                }
                SFX.oneUp();
                spawnParticles(item.x + item.w / 2, item.y + item.h / 2, '#ff4444', 10);
            }
            updateScoreHUD();
        }
    }

    // Goal (Aaditya) — only reachable after all roses collected
    if (goalUnlocked) {
        const goalRect = { x: goalPos.x - 4, y: goalPos.y - 4, w: 48, h: 56 };
        if (rectOverlap(player, goalRect)) {
            player.won = true;
            SFX.levelComplete();
            setTimeout(() => showLevelComplete(), 800);
        }
    }
}

function rectOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
}

function playerHurt() {
    lives--;
    player.invincible = INVINCIBLE_TIME;
    updateLivesHUD();
    SFX.hurt();
    spawnParticles(player.x + player.w / 2, player.y + player.h / 2, '#ff6b9d', 8);

    if (lives <= 0) {
        playerDie(false);
    }
}

function playerDie(fell) {
    player.dead = true;
    if (fell) {
        SFX.fall();
        lives--;
        updateLivesHUD();
    }
    if (lives <= 0) {
        SFX.die();
        setTimeout(() => showGameOver(), 1200);
    } else {
        SFX.hurt();
        setTimeout(() => respawnPlayer(), 1000);
    }
}

function respawnPlayer() {
    parseLevel(currentLevel);
    updateLivesHUD();
    updateScoreHUD();
    updateRoseHUD();
}

// ===== PARTICLES =====
function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(
            x, y, color,
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 6 - 2,
            20 + Math.random() * 20,
            3 + Math.random() * 3
        ));
    }
}

// ===== CAMERA =====
function updateCamera() {
    const cw = canvas.width;
    const ch = canvas.height;
    const targetX = player.x + player.w / 2 - cw / 2;
    const targetY = player.y + player.h / 2 - ch / 2;

    camera.x += (targetX - camera.x) * 0.1;
    camera.y += (targetY - camera.y) * 0.1;

    // Clamp
    camera.x = Math.max(0, Math.min(camera.x, levelWidth * TILE - cw));
    camera.y = Math.max(0, Math.min(camera.y, levelHeight * TILE - ch));
}

// ===== DRAWING =====
function drawBackground() {
    const data = LEVEL_DATA[currentLevel];
    const grad = ctxG.createLinearGradient(0, 0, 0, canvas.height);
    data.bgGradient.forEach((c, i) => {
        grad.addColorStop(i / (data.bgGradient.length - 1), c);
    });
    ctxG.fillStyle = grad;
    ctxG.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    if (data.bgStars) {
        drawStars();
    }
}

let stars = [];
function generateStars() {
    stars = [];
    for (let i = 0; i < 80; i++) {
        stars.push({
            x: Math.random() * 2000,
            y: Math.random() * 600,
            size: Math.random() * 2 + 0.5,
            twinkle: Math.random() * Math.PI * 2
        });
    }
}

function drawStars() {
    for (let s of stars) {
        const sx = s.x - camera.x * 0.1;
        const sy = s.y - camera.y * 0.05;
        const alpha = 0.4 + Math.sin(frameCount * 0.03 + s.twinkle) * 0.3;
        ctxG.globalAlpha = alpha;
        ctxG.fillStyle = '#ffffff';
        ctxG.fillRect(sx % canvas.width, sy, s.size, s.size);
    }
    ctxG.globalAlpha = 1;
}

function drawTiles() {
    const data = LEVEL_DATA[currentLevel];
    const startCol = Math.max(0, Math.floor(camera.x / TILE));
    const endCol = Math.min(levelWidth, Math.ceil((camera.x + canvas.width) / TILE) + 1);
    const startRow = Math.max(0, Math.floor(camera.y / TILE));
    const endRow = Math.min(levelHeight, Math.ceil((camera.y + canvas.height) / TILE) + 1);

    for (let row = startRow; row < endRow; row++) {
        for (let col = startCol; col < endCol; col++) {
            const t = getTile(tiles, col, row);
            const x = col * TILE - camera.x;
            const y = row * TILE - camera.y;

            if (t === 1) {
                // Ground
                ctxG.fillStyle = data.groundColor;
                ctxG.fillRect(x, y, TILE, TILE);
                // Top grass
                if (getTile(tiles, col, row - 1) !== 1) {
                    ctxG.fillStyle = data.groundTopColor;
                    ctxG.fillRect(x, y, TILE, 6);
                    // Grass blades
                    ctxG.fillStyle = data.groundTopColor;
                    for (let g = 0; g < 3; g++) {
                        ctxG.fillRect(x + g * 14 + 3, y - 3, 3, 5);
                    }
                }
                // Texture
                ctxG.fillStyle = 'rgba(0,0,0,0.08)';
                ctxG.fillRect(x + 4, y + 12, 8, 8);
                ctxG.fillRect(x + 24, y + 20, 8, 8);
            } else if (t === 2) {
                // Brick
                ctxG.fillStyle = data.brickColor;
                ctxG.fillRect(x, y, TILE, TILE);
                ctxG.fillStyle = data.brickTopColor;
                ctxG.fillRect(x, y, TILE, 4);
                // Brick pattern
                ctxG.strokeStyle = 'rgba(0,0,0,0.15)';
                ctxG.lineWidth = 1;
                ctxG.strokeRect(x + 1, y + 1, TILE - 2, TILE - 2);
                ctxG.beginPath();
                ctxG.moveTo(x, y + TILE / 2);
                ctxG.lineTo(x + TILE, y + TILE / 2);
                ctxG.moveTo(x + TILE / 2, y);
                ctxG.lineTo(x + TILE / 2, y + TILE / 2);
                ctxG.stroke();
            } else if (t === 3) {
                // Platform
                ctxG.fillStyle = 'rgba(255, 107, 157, 0.25)';
                ctxG.fillRect(x, y, TILE, 8);
                ctxG.fillStyle = '#ff6b9d';
                ctxG.fillRect(x, y, TILE, 3);
                // Dots
                ctxG.fillStyle = 'rgba(255,107,157,0.15)';
                ctxG.fillRect(x + 4, y + 4, 4, 2);
                ctxG.fillRect(x + 18, y + 4, 4, 2);
                ctxG.fillRect(x + 32, y + 4, 4, 2);
            } else if (t === 6) {
                // Spike
                ctxG.fillStyle = '#ff4444';
                ctxG.beginPath();
                ctxG.moveTo(x, y + TILE);
                ctxG.lineTo(x + TILE / 2, y + 4);
                ctxG.lineTo(x + TILE, y + TILE);
                ctxG.fill();
            }
        }
    }
}

function drawPlayer() {
    if (player.dead) return;
    if (player.invincible > 0 && Math.floor(player.invincible / 4) % 2 === 0) return; // blink

    const x = player.x - camera.x;
    const y = player.y - camera.y;

    ctxG.save();
    // Flip for facing
    if (player.facing === -1) {
        ctxG.translate(x + player.w, y);
        ctxG.scale(-1, 1);
    } else {
        ctxG.translate(x, y);
    }

    if (kripaLoaded) {
        // Draw kripa.png
        ctxG.drawImage(kripaImg, 0, 0, player.w, player.h);
    } else {
        // Fallback: draw a cute character
        drawFallbackPlayer(0, 0, player.w, player.h, player.frame, player.onGround);
    }

    ctxG.restore();
}

function drawFallbackPlayer(x, y, w, h, frame, onGround) {
    // Body
    ctxG.fillStyle = '#ff6b9d';
    ctxG.fillRect(x + 4, y + 10, w - 8, h - 18);

    // Head
    ctxG.fillStyle = '#ffcc99';
    ctxG.beginPath();
    ctxG.arc(x + w / 2, y + 10, 10, 0, Math.PI * 2);
    ctxG.fill();

    // Hair
    ctxG.fillStyle = '#333';
    ctxG.beginPath();
    ctxG.arc(x + w / 2, y + 7, 10, Math.PI, 0);
    ctxG.fill();

    // Eyes
    ctxG.fillStyle = '#333';
    ctxG.fillRect(x + 11, y + 8, 3, 3);
    ctxG.fillRect(x + 19, y + 8, 3, 3);

    // Smile
    ctxG.strokeStyle = '#333';
    ctxG.lineWidth = 1;
    ctxG.beginPath();
    ctxG.arc(x + w / 2, y + 12, 4, 0, Math.PI);
    ctxG.stroke();

    // Legs (animated)
    const legOffset = onGround ? Math.sin(frame * 1.5) * 4 : 0;
    ctxG.fillStyle = '#4a90d9';
    ctxG.fillRect(x + 6, y + h - 10, 8, 10);
    ctxG.fillRect(x + w - 14, y + h - 10, 8, 10);

    // Heart on shirt
    ctxG.font = '10px serif';
    ctxG.fillText('❤', x + 10, y + 26);
}

function drawGoal() {
    const x = goalPos.x - camera.x;
    const y = goalPos.y - camera.y;

    if (goalUnlocked) {
        // Bright glow when unlocked
        const glow = Math.sin(frameCount * 0.06) * 0.3 + 0.7;
        ctxG.globalAlpha = glow * 0.4;
        ctxG.fillStyle = '#5eff5e';
        ctxG.beginPath();
        ctxG.arc(x + 20, y + 24, 40, 0, Math.PI * 2);
        ctxG.fill();
        ctxG.globalAlpha = 1;
    } else {
        // Dim glow when locked
        ctxG.globalAlpha = 0.12;
        ctxG.fillStyle = '#ff6b9d';
        ctxG.beginPath();
        ctxG.arc(x + 20, y + 24, 30, 0, Math.PI * 2);
        ctxG.fill();
        ctxG.globalAlpha = 1;
    }

    // Draw character (slightly dimmed if locked)
    if (!goalUnlocked) ctxG.globalAlpha = 0.5;
    if (aadityaLoaded) {
        ctxG.drawImage(aadityaImg, x - 4, y - 4, 48, 56);
    } else {
        drawFallbackGoal(x, y);
    }
    ctxG.globalAlpha = 1;

    // Floating icon above
    const heartY = y - 18 + Math.sin(frameCount * 0.05) * 6;
    ctxG.font = '14px serif';
    if (goalUnlocked) {
        ctxG.fillText('💕', x + 8, heartY);
    } else {
        ctxG.fillText('🔒', x + 10, heartY);
    }
}

function drawFallbackGoal(x, y) {
    // Body
    ctxG.fillStyle = '#4a90d9';
    ctxG.fillRect(x + 6, y + 14, 28, 24);

    // Head
    ctxG.fillStyle = '#ffcc99';
    ctxG.beginPath();
    ctxG.arc(x + 20, y + 12, 11, 0, Math.PI * 2);
    ctxG.fill();

    // Hair
    ctxG.fillStyle = '#222';
    ctxG.beginPath();
    ctxG.arc(x + 20, y + 9, 11, Math.PI, 0);
    ctxG.fill();

    // Eyes
    ctxG.fillStyle = '#333';
    ctxG.fillRect(x + 14, y + 10, 3, 3);
    ctxG.fillRect(x + 23, y + 10, 3, 3);

    // Big smile
    ctxG.strokeStyle = '#333';
    ctxG.lineWidth = 1.5;
    ctxG.beginPath();
    ctxG.arc(x + 20, y + 15, 5, 0, Math.PI);
    ctxG.stroke();

    // Arms open
    ctxG.fillStyle = '#ffcc99';
    ctxG.fillRect(x - 2, y + 18, 8, 4);
    ctxG.fillRect(x + 34, y + 18, 8, 4);

    // Legs
    ctxG.fillStyle = '#333';
    ctxG.fillRect(x + 10, y + 38, 8, 10);
    ctxG.fillRect(x + 22, y + 38, 8, 10);

    // Heart
    ctxG.font = '12px serif';
    ctxG.fillText('❤', x + 13, y + 32);
}

function drawCrab(ctx, x, y, w, h, frame, flipped) {
    ctx.save();
    if (flipped) {
        ctx.translate(x + w, y);
        ctx.scale(-1, 1);
        x = 0; y = 0;
    }

    // Body
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h * 0.6, w * 0.4, h * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x + w * 0.35, y + h * 0.35, 5, 0, Math.PI * 2);
    ctx.arc(x + w * 0.65, y + h * 0.35, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x + w * 0.35, y + h * 0.35, 2, 0, Math.PI * 2);
    ctx.arc(x + w * 0.65, y + h * 0.35, 2, 0, Math.PI * 2);
    ctx.fill();

    // Claws
    const clawY = frame === 0 ? y + h * 0.5 : y + h * 0.45;
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.ellipse(x + 2, clawY, 6, 4, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + w - 2, clawY, 6, 4, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 2;
    const legAnim = frame === 0 ? 0 : 3;
    ctx.beginPath();
    ctx.moveTo(x + 6, y + h * 0.7);
    ctx.lineTo(x + 2, y + h - legAnim);
    ctx.moveTo(x + w - 6, y + h * 0.7);
    ctx.lineTo(x + w - 2, y + h + legAnim);
    ctx.stroke();

    ctx.restore();
}

function drawEntities() {
    for (let mp of movingPlatforms) mp.draw(ctxG);
    for (let item of items) item.draw(ctxG);
    for (let e of enemies) e.draw(ctxG);
    for (let p of particles) p.draw(ctxG);
}

// ===== MAIN GAME LOOP =====
let loopRAF = null;

function gameLoop() {
    // Only update physics when actively playing
    if (gameState === 'playing') {
        frameCount++;

        // Update moving platforms FIRST so dx/dy are ready
        for (let mp of movingPlatforms) mp.update();

        updatePlayer();

        // Carry player with moving platform AFTER updatePlayer detects riding
        if (player.ridingPlatform) {
            player.x += player.ridingPlatform.dx;
            player.y += player.ridingPlatform.dy;
        }

        // Update enemies — pass movingPlatforms for riding
        enemies = enemies.filter(e => e.update(tiles, movingPlatforms));
        items = items.filter(i => i.update());
        particles = particles.filter(p => p.update());
        checkCollisions();
        updateCamera();
    }

    // Render during any active game state (not title/tutorial/victory/gameover)
    const renderStates = ['playing', 'levelIntro', 'paused', 'levelComplete'];
    if (renderStates.includes(gameState) && canvas && ctxG) {
        resizeCanvas();
        drawBackground();
        ctxG.save();
        drawTiles();
        drawGoal();
        drawEntities();
        drawPlayer();
        ctxG.restore();
    }

    loopRAF = requestAnimationFrame(gameLoop);
}

function ensureLoopRunning() {
    // Always (re)start the loop
    if (loopRAF) cancelAnimationFrame(loopRAF);
    loopRAF = requestAnimationFrame(gameLoop);
}

// ===== CANVAS RESIZE =====
function resizeCanvas() {
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }
}

// ===== HUD UPDATES =====
function updateLivesHUD() {
    const container = document.getElementById('hud-lives');
    container.innerHTML = '';
    for (let i = 0; i < TOTAL_LIVES; i++) {
        const span = document.createElement('span');
        span.textContent = '❤️';
        if (i >= lives) span.classList.add('lost');
        container.appendChild(span);
    }
}

function updateScoreHUD() {
    const el = document.getElementById('hud-score');
    if (el) el.textContent = score;
}

function updateRoseHUD() {
    document.getElementById('hud-roses').textContent = `${collectedRoses} / ${totalRoses}`;
    // Show unlocked indicator
    const indicator = document.getElementById('hud-goal-status');
    if (goalUnlocked) {
        indicator.textContent = '🔓 Goal Open!';
        indicator.style.color = '#5eff5e';
    } else {
        indicator.textContent = '🔒 Collect all roses';
        indicator.style.color = '#ff9ab8';
    }
}

function updateLevelHUD() {
    const data = LEVEL_DATA[currentLevel];
    document.getElementById('hud-level').textContent = `Level ${currentLevel + 1}`;
    document.getElementById('hud-level-name').textContent = data.name;
}

// ===== SCREEN TRANSITIONS =====
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function showOverlay(id) {
    document.getElementById(id).classList.add('active');
}

function hideOverlay(id) {
    document.getElementById(id).classList.remove('active');
}

function showTutorial() {
    SFX.click();
    showScreen('tutorial-screen');
    gameState = 'tutorial';
}

function startGame() {
    SFX.click();
    currentLevel = 0;
    lives = TOTAL_LIVES;
    score = 0;

    showScreen('game-screen');
    canvas = document.getElementById('game-canvas');
    ctxG = canvas.getContext('2d');
    resizeCanvas();

    generateStars();
    parseLevel(currentLevel);
    updateLivesHUD();
    updateScoreHUD();
    updateRoseHUD();
    updateLevelHUD();

    // Start the single game loop
    ensureLoopRunning();

    // Show level intro
    showLevelIntro();
}

function showLevelIntro() {
    gameState = 'levelIntro';
    const data = LEVEL_DATA[currentLevel];
    document.getElementById('level-intro-title').textContent = `Level ${currentLevel + 1}`;
    document.getElementById('level-intro-name').textContent = data.name;
    document.getElementById('level-intro-hint').textContent = data.hint;
    document.getElementById('level-intro').classList.add('active');

    // Reset camera to player position immediately
    if (canvas) {
        const cw = canvas.width || window.innerWidth;
        const ch = canvas.height || window.innerHeight;
        camera.x = Math.max(0, player.x + player.w / 2 - cw / 2);
        camera.y = Math.max(0, player.y + player.h / 2 - ch / 2);
    }

    setTimeout(() => {
        document.getElementById('level-intro').classList.remove('active');
        gameState = 'playing';
        levelStartTime = Date.now();
    }, 2200);
}

function showLevelComplete() {
    gameState = 'levelComplete';
    const data = LEVEL_DATA[currentLevel];
    const time = Math.floor((Date.now() - levelStartTime) / 1000);

    document.getElementById('lc-title').textContent =
        currentLevel === LEVEL_DATA.length - 1 ? "You Reached Aaditya! 💖🎉" : "Level Complete! 💖";
    document.getElementById('lc-message').textContent = data.message;
    document.getElementById('lc-score').textContent = score;
    document.getElementById('lc-time').textContent = time + 's';
    document.getElementById('lc-next-btn').textContent =
        currentLevel === LEVEL_DATA.length - 1 ? "See Your Surprise! 🎁" : "Next Level →";

    showOverlay('level-complete-overlay');
}

function nextLevel() {
    hideOverlay('level-complete-overlay');
    currentLevel++;

    if (currentLevel >= LEVEL_DATA.length) {
        showVictory();
    } else {
        parseLevel(currentLevel);
        updateLevelHUD();
        updateRoseHUD();
        generateStars();
        showLevelIntro();
    }
}

function showGameOver() {
    gameState = 'gameover';
    SFX.gameOver();
    showOverlay('gameover-overlay');
}

function retryGame() {
    hideOverlay('gameover-overlay');
    lives = TOTAL_LIVES;
    // Checkpoint: keep the current level, only reset score for this level
    parseLevel(currentLevel);
    updateLivesHUD();
    updateScoreHUD();
    updateRoseHUD();
    updateLevelHUD();
    generateStars();
    showLevelIntro();
}

function restartLevel() {
    hideOverlay('pause-overlay');
    parseLevel(currentLevel);
    updateLivesHUD();
    updateRoseHUD();
    gameState = 'playing';
}

function togglePause() {
    if (gameState === 'playing') {
        gameState = 'paused';
        showOverlay('pause-overlay');
    } else if (gameState === 'paused') {
        gameState = 'playing';
        hideOverlay('pause-overlay');
    }
}

function quitToTitle() {
    hideOverlay('pause-overlay');
    hideOverlay('gameover-overlay');
    gameState = 'title';
    if (window._victoryRAF) cancelAnimationFrame(window._victoryRAF);
    if (window._victoryConfetti) clearInterval(window._victoryConfetti);
    showScreen('title-screen');
}

// ===== VICTORY SCREEN =====
function showVictory() {
    gameState = 'victory';
    showScreen('victory-screen');
    SFX.victory();

    const msg = document.getElementById('victory-message');
    msg.innerHTML = `Congratulations on completing the game kripu!!\n` +
        `You never gave up. Because at the end of every journey,\n` +
        `I was waiting with open arms. 💕\n\n` +
        `Just like that, nothing in the world can keep\n` +
        `us apart because we truly belong together.\n\n` +
        `<strong style="color:#ffd700;font-size:1.3rem;">Happy Valentine's Day Babyy!💖</strong>`;

    document.getElementById('v-score').textContent = score;
    document.getElementById('v-lives').textContent = lives;

    // Fireworks!
    startVictoryFireworks();

    // Confetti
    victoryConfettiBurst(80);
    window._victoryConfetti = setInterval(() => victoryConfettiBurst(30), 3000);
}

function victoryConfettiBurst(count) {
    const screen = document.getElementById('victory-screen');
    const colors = ['#ff6b9d', '#ffd700', '#ff4081', '#ff9ab8', '#fff', '#c44569', '#e91e63'];
    const shapes = ['❤️', '💖', '✨', '🌟', '💕', '⭐', '🌹'];

    for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.style.position = 'absolute';
        el.style.zIndex = '3';
        el.style.pointerEvents = 'none';
        el.style.left = Math.random() * 100 + 'vw';
        el.style.top = '-20px';

        if (Math.random() > 0.5) {
            el.textContent = shapes[Math.floor(Math.random() * shapes.length)];
            el.style.fontSize = (Math.random() * 16 + 10) + 'px';
        } else {
            el.style.width = (Math.random() * 10 + 5) + 'px';
            el.style.height = (Math.random() * 10 + 5) + 'px';
            el.style.background = colors[Math.floor(Math.random() * colors.length)];
            el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        }

        const duration = (Math.random() * 2 + 2);
        el.style.animation = `confetti-fall ${duration}s linear forwards`;
        el.style.animationDelay = Math.random() * 1 + 's';

        // Add confetti-fall keyframes if not present
        screen.appendChild(el);
        setTimeout(() => el.remove(), (duration + 1) * 1000);
    }
}

function startVictoryFireworks() {
    const canvas = document.getElementById('victory-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    const vParticles = [];
    const vFireworks = [];
    const colors = ['#ff6b9d', '#ff9ab8', '#ffd700', '#c44569', '#ff4081', '#e91e63', '#ff69b4', '#fad0c4'];
    let fTimer = 0;

    class VParticle {
        constructor(x, y, color, vx, vy) {
            this.x = x; this.y = y; this.color = color;
            this.vx = vx; this.vy = vy; this.alpha = 1;
            this.decay = Math.random() * 0.015 + 0.008;
            this.size = Math.random() * 3 + 1;
        }
        update() {
            this.vx *= 0.98; this.vy *= 0.98; this.vy += 0.02;
            this.x += this.vx; this.y += this.vy; this.alpha -= this.decay;
            return this.alpha > 0;
        }
        draw() {
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    class VFirework {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height;
            this.targetY = Math.random() * canvas.height * 0.45 + 40;
            this.speed = Math.random() * 3 + 4;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.alive = true;
        }
        update() {
            this.y -= this.speed;
            if (this.y <= this.targetY) {
                this.explode(); this.alive = false;
            }
            return this.alive;
        }
        explode() {
            if (Math.random() > 0.4) {
                // Heart explosion
                for (let i = 0; i < 70; i++) {
                    const t = (i / 70) * Math.PI * 2;
                    const hx = 16 * Math.pow(Math.sin(t), 3);
                    const hy = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
                    const s = 0.22;
                    vParticles.push(new VParticle(this.x, this.y, this.color,
                        hx * s * (0.85 + Math.random() * 0.3),
                        hy * s * (0.85 + Math.random() * 0.3)));
                }
            } else {
                for (let i = 0; i < 50; i++) {
                    const ang = (Math.PI * 2 / 50) * i;
                    const spd = Math.random() * 4 + 1;
                    vParticles.push(new VParticle(this.x, this.y, this.color,
                        Math.cos(ang) * spd, Math.sin(ang) * spd));
                }
            }
        }
        draw() {
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function animate() {
        ctx.fillStyle = 'rgba(10, 0, 20, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        fTimer++;
        if (fTimer % 25 === 0) vFireworks.push(new VFirework());

        for (let i = vFireworks.length - 1; i >= 0; i--) {
            if (!vFireworks[i].update()) vFireworks.splice(i, 1);
            else vFireworks[i].draw();
        }
        for (let i = vParticles.length - 1; i >= 0; i--) {
            if (!vParticles[i].update()) vParticles.splice(i, 1);
            else vParticles[i].draw();
        }

        window._victoryRAF = requestAnimationFrame(animate);
    }
    animate();
}

// ===== INPUT: KEYBOARD =====
window.addEventListener('keydown', (e) => {
    keys[e.code] = true;

    if (e.code === 'Escape') {
        if (gameState === 'playing' || gameState === 'paused') togglePause();
    }
    if (e.code === 'Space') {
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// ===== INPUT: MOBILE TOUCH =====
function setupMobileControls() {
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    const btnJump = document.getElementById('btn-jump');

    function addTouchEvents(btn, input) {
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            mobileInput[input] = true;
            btn.classList.add('pressed');
        }, { passive: false });

        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            mobileInput[input] = false;
            btn.classList.remove('pressed');
        }, { passive: false });

        btn.addEventListener('touchcancel', (e) => {
            mobileInput[input] = false;
            btn.classList.remove('pressed');
        });

        // Mouse fallback for testing
        btn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            mobileInput[input] = true;
            btn.classList.add('pressed');
        });
        btn.addEventListener('mouseup', (e) => {
            mobileInput[input] = false;
            btn.classList.remove('pressed');
        });
        btn.addEventListener('mouseleave', (e) => {
            mobileInput[input] = false;
            btn.classList.remove('pressed');
        });
    }

    addTouchEvents(btnLeft, 'left');
    addTouchEvents(btnRight, 'right');
    addTouchEvents(btnJump, 'jump');
}

// ===== INIT TITLE CLOUDS =====
function initTitleClouds() {
    const container = document.getElementById('title-clouds');
    for (let i = 0; i < 12; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        cloud.style.width = (Math.random() * 120 + 60) + 'px';
        cloud.style.height = (Math.random() * 40 + 20) + 'px';
        cloud.style.left = Math.random() * 100 + '%';
        cloud.style.top = Math.random() * 50 + '%';
        container.appendChild(cloud);
    }
}

// ===== CONFETTI KEYFRAME INJECTION =====
function injectConfettiKeyframes() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes confetti-fall {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0.3; }
        }
    `;
    document.head.appendChild(style);
}

// ===== BOOT =====
window.addEventListener('DOMContentLoaded', () => {
    injectConfettiKeyframes();
    initTitleClouds();
    setupMobileControls();

    // Pre-init audio context on first user interaction
    document.addEventListener('click', () => SFX.click(), { once: true });
    document.addEventListener('touchstart', () => SFX.click(), { once: true });
});

// Handle window resize
window.addEventListener('resize', () => {
    if (canvas) resizeCanvas();
});

// Prevent scrolling on mobile
document.addEventListener('touchmove', (e) => {
    if (gameState === 'playing') e.preventDefault();
}, { passive: false });
