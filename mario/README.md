# 💖 Kripa's Journey to Aaditya

A Mario-style 2D platformer built with pure HTML, CSS & JavaScript — no frameworks, no libraries.

Help **Kripa** navigate through 3 increasingly challenging levels to reach **Aaditya**!

## 🎮 How to Play

| Control | Action |
|---------|--------|
| **W** | Move Right |
| **S** | Move Left |
| **Space** | Jump |

Mobile touch controls are also available.

## 🌹 Objective

- Collect **all roses** 🌹 in each level to unlock the goal
- Reach **Aaditya** at the end of each level
- Grab **hearts** 💖 for an extra life
- **Stomp** on enemies (crabs) by jumping on them — but don't run into them!

## 🗺️ Levels

| Level | Name | Roses | Difficulty |
|-------|------|-------|------------|
| 1 | The Garden of Love 🌸 | 3 | ⭐⭐⭐ |
| 2 | The Moonlit Bridge 🌙 | 4 | ⭐⭐⭐⭐ |
| 3 | The Sky of Forever ☁️ | 5 | ⭐⭐⭐⭐⭐ |

Each level features multi-tier platforming, real death gaps, stepping-stone bridges, and enemies guarding key paths.

## 🏗️ Project Structure

```
mario/
├── index.html    # Game screens, HUD, overlays
├── style.css     # All styling & animations
├── game.js       # Game engine, physics, levels
├── sounds.js     # Web Audio API sound effects
├── kripa.png     # Player character
├── aaditya.png   # Goal character
└── README.md
```

## 🚀 Running the Game

Just open `index.html` in any modern browser, or serve it with a local server:

```
# Using VS Code Live Server, Python, or any static file server
python -m http.server 5500
```

Then open `http://localhost:5500/mario/index.html`.

## 🛠️ Built With

- **Canvas API** — tile-based 2D rendering
- **Web Audio API** — synthesized sound effects (no audio files needed)
- **Vanilla JS** — custom physics engine with gravity, collision detection, and camera system

## 💕

*Through every obstacle, every challenge, every jump... Kripa never gave up. Because at the end of every journey, Aaditya was waiting with open arms.*
