# 🍯 Milky Honey Soft Cheats

A unified Tampermonkey / Violentmonkey userscript that provides an external cheat menu and trainer overlay for all 7 HTML5 games created by **Milky Honey Software** on itch.io (*Wanna Peek?* series).

The cheat menu is injected **outside** the game viewport directly onto the itch.io page, keeping the gameplay canvas completely unobstructed and character artwork unclipped.

## ❗ Important!
MilkyCheats is ONLY available in [GitHub](https://github.com/syrupderg/milkycheats) and [GreasyFork](https://greasyfork.org/en/scripts/604378), made by syrupderg, do NOT install from other sources!

## 🎮 Supported Games

| # | Game Title | Theme | Supported Levels | itch.io Page |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **Wanna Peek? Trick or Peek** | Halloween / Scarecrow | 🍂 Autumn Leaves (*Some, Lots*) | [Play](https://milkyhoneysoft.itch.io/wanna-peek-trick-or-peek) |
| **2** | **Wanna Peek? Fish Princess** | Mermaid / Ocean | 🪸 Coral Cover (*Some, Lots*) | [Play](https://milkyhoneysoft.itch.io/wanna-peek-fish-princess) |
| **3** | **Dirty Girls** | Outdoor Mud & Clean | 🌸 Flower Level (*None, Some, Lots*) | [Play](https://milkyhoneysoft.itch.io/dirty-girls) |
| **4** | **Wanna Peek? Candy Bunnies** | Easter / Pastel Bunnies | 🌿 Easter Grass (*None, Some, Lots*) | [Play](https://milkyhoneysoft.itch.io/wanna-peek-candy-bunnies) |
| **5** | **Wanna Peek? Milky & Honey** | Bears & Honey | 🍯 Comfort Level (*Bare, Barely, Beary*) | [Play](https://milkyhoneysoft.itch.io/wanna-peek-milky-and-honey) |
| **6** | **Wanna Peek? Year of the Bunny** | Kimono / Sakura | 🌸 Flower Level (*None, Cherry, Very Cherry*) | [Play](https://milkyhoneysoft.itch.io/wanna-peek-bunny) |
| **7** | **Wanna Peek? Christmas** | Holiday Cheer | 🎄 Cheer Level (*Humbug, Merry, Very Merry*) | [Play](https://milkyhoneysoft.itch.io/wanna-peek-christmas) |

## ✨ Features

### 🏆 Instant Win Stage
- Completes the current stage immediately.
- Auto-collects required stage keys, unlocks round locks (1, 2, 3), sets candies to 15, and fires Stencyl's internal win event.
- Scene-guarded to prevent errors when used outside active gameplay.

### 🛡️ Invincible Shield
- Locks player health to `999`.
- Permanently locks internal `_shielded` state to `1`.
- Protects cursor visibility by preventing alpha reduction to `0`.
- Intercepts Stencyl's death handler so line cutting continues uninterrupted without interruption or restarts.

### ❄️ Freeze Enemies
- Dispatches freeze events (`_customEvent_freeze`) to all active enemy actors.
- Zeroes out enemy velocities ($X=0, Y=0$) so hazards and creatures stay frozen in place.
- Re-enables normal enemy movement when toggled off.

### ⏱️ Freeze Timer (9999s)
- Locks stage countdown timer to `9999` seconds (~166 minutes).
- Disables low-time warning beeps, screen flashes, and urgency alarms.
- Countdown resumes normally when toggled off.

### 🚀 Turbo Speed
- **2.5× Line Cutting Speed**: Reduces cut delay (`_cursorspeed = 0.008`).
- **2× Perimeter Hop Speed**: Doubles border movement rate (`_hoplength = 4`).
- **Web / Mud Immunity**: Zeroes webbed timer (`_webbedtimer = 0`) to walk through traps freely.

### 🌸 Game-Specific Bush / Cover Level
- Features interactive `[ ◀ ]` (previous) and `[ ▶ ]` (next) arrow buttons to step through cover levels in both directions.
- Automatically detects the active game and displays exact in-game feature names (e.g., *Cheer Level*, *Easter Grass*, *Coral Cover*, *Autumn Leaves*).
- **Instant Live Refresh**: Changing the level while viewing an image in the gallery immediately reloads the artwork with the chosen cover level.

### 🔍 Free Gallery Pan & Zoom
- **Mouse Drag-to-Pan**: Left-click and drag anywhere on the canvas to inspect character artwork smoothly (`grab` / `grabbing` cursor).
- **Smooth Mouse Wheel Zoom**: Zoom in up to **8×** magnification or zoom out to inspect high-resolution detail.
- **Scene Transition Guard**: Fully zooming out back to `1×` resets offsets and state so native left/right scene-switching arrows remain functional.

### ✨ Max Collectibles & Powerups
- Sets all collectible counts to maximum (15 Candies, 3 Locks / Eggs / Gems / Pearls).
- Maxes luck and clover probability attributes (`lucky = 999`, `yotsuba = 100`).
- Spawns helpful powerup items directly into the game queue.

### 🔓 Unlock All CGs & Bonuses
- Unlocks stages 1 through 30 across all 7 games.
- Unlocks all base characters and hidden bonus CGs (including Angie [12], Zelly [13], and Oonie [14] in Fish Princess).
- Sets story mode progress to 10 and satisfies all round completion requirements without overriding custom bush settings.

### 🖥️ Windowed Fullscreen
- Expands the game to fill the viewport height while preserving a crisp 1:1 square aspect ratio (`min(100vw, 100vh)`).
- Centered on a pure black background.
- Cleanly restores itch.io styles without leaving black background residue when toggled off.

## ⌨️ Keyboard Shortcuts

| Key | Action |
| :-: | :--- |
| **`F2`** | Toggle / minimize cheat menu into compact `🍯 Cheats (F2)` pill |
| **`F4`** | Toggle Windowed Fullscreen mode |

*Keyboard shortcuts work from both the outer page and inside the game canvas.*

## 📦 Installation
### Option 1: Greasy Fork (Recommended)

1. Install a userscript manager extension for your browser:
   - [Tampermonkey](https://www.tampermonkey.net/) (Chrome, Firefox, Edge, Opera, Brave)
   - [Violentmonkey](https://violentmonkey.github.io/) (Chrome, Firefox, Edge)
2. Visit the script page on Greasy Fork:
   [**Milky Honey Soft Cheats on Greasy Fork**](https://greasyfork.org/en/scripts/604378-milky-honey-soft-cheats)
3. Click the green **"Install this script"** button, then confirm the installation in your userscript manager.

### Option 2: Manual Installation

1. Install a userscript manager extension ([Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/)).
2. Open your userscript manager dashboard and create a new script.
3. Copy the entire code from [`script.js`](./script.js) and paste it into the editor.
4. Save the script (`Ctrl + S`).

## 📜 License

This project is licensed under the GNU General Public License v3.0 or later.
