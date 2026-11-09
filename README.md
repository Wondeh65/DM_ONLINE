# DM Online

A small browser-based dungeon adventure made for the `DM_ONLINE` repository.

## Features

- choose a class: Warrior, Mage, or Rogue
- battle random enemies in a turn-based combat loop
- use attack, skill, heal, and explore actions
- track HP, mana, gold, XP, and level progression
- save progress in the browser with localStorage
- single-page game with no external dependencies

## Run locally

Open `index.html` in a browser.

If you want to serve it through a local web server:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Project files

- `index.html` – game layout
- `styles.css` – dark fantasy styling
- `script.js` – game logic and state

## Goal

Defeat enough enemies to complete the quest and earn the Rusted Crown.
