// ==UserScript==
// @name         Milky Honey Soft Cheats
// @namespace    https://tampermonkey.net/
// @version      1.0
// @description  Cheat menu for milkyhoneysoft HTML5 games on itch.io (Wanna Peek? series)
// @author       syrupderg
// @license      GPL-3.0-or-later
// @match        https://milkyhoneysoft.itch.io/wanna-peek-trick-or-peek*
// @match        https://milkyhoneysoft.itch.io/wanna-peek-fish-princess*
// @match        https://milkyhoneysoft.itch.io/dirty-girls*
// @match        https://milkyhoneysoft.itch.io/wanna-peek-candy-bunnies*
// @match        https://milkyhoneysoft.itch.io/wanna-peek-milky-and-honey*
// @match        https://milkyhoneysoft.itch.io/wanna-peek-bunny*
// @match        https://milkyhoneysoft.itch.io/wanna-peek-christmas*
// @match        https://*.itch.zone/html/19845021/*
// @match        https://*.itch.zone/html/18821041/*
// @match        https://*.itch.zone/html/10683342/*
// @match        https://*.itch.zone/html/10683440/*
// @match        https://*.itch.zone/html/10683454/*
// @match        https://*.itch.zone/html/10683459/*
// @match        https://*.itch.zone/html/10683450/*
// @match        https://*.ssl.hwcdn.net/html/19845021/*
// @match        https://*.ssl.hwcdn.net/html/18821041/*
// @match        https://*.ssl.hwcdn.net/html/10683342/*
// @match        https://*.ssl.hwcdn.net/html/10683440/*
// @match        https://*.ssl.hwcdn.net/html/10683454/*
// @match        https://*.ssl.hwcdn.net/html/10683459/*
// @match        https://*.ssl.hwcdn.net/html/10683450/*
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
    const isTopItchPage = window === window.top && location.hostname.includes('itch.io');
    const isStandaloneGame = window === window.top && !location.hostname.includes('itch.io');
    let currentGameKey = null;

    // Bush / Comfort Level configs per game (as named in-game)
    const GAME_CONFIGS = {
        'wanna-peek-candy-bunnies': {
            name: 'Candy Bunnies',
            id: '10683440',
            icon: '🌿',
            feature: 'Easter Grass',
            levels: [
                { code: 'x', label: 'None' },
                { code: 'y', label: 'Some' },
                { code: 'z', label: 'Lots' }
            ]
        },
        'wanna-peek-bunny': {
            name: 'Year of the Bunny',
            id: '10683459',
            icon: '🌸',
            feature: 'Flower Level',
            levels: [
                { code: 'x', label: 'None' },
                { code: 'y', label: 'Cherry' },
                { code: 'z', label: 'Very Cherry' }
            ]
        },
        'wanna-peek-christmas': {
            name: 'Christmas',
            id: '10683450',
            icon: '🎄',
            feature: 'Cheer Level',
            levels: [
                { code: 'x', label: 'Humbug' },
                { code: 'y', label: 'Merry' },
                { code: 'z', label: 'Very Merry' }
            ]
        },
        'wanna-peek-milky-and-honey': {
            name: 'Milky & Honey',
            id: '10683454',
            icon: '🍯',
            feature: 'Comfort Level',
            levels: [
                { code: 'x', label: 'Bare' },
                { code: 'y', label: 'Barely' },
                { code: 'z', label: 'Beary' }
            ]
        },
        'dirty-girls': {
            name: 'Dirty Girls',
            id: '10683342',
            icon: '🌸',
            feature: 'Flower Level',
            levels: [
                { code: 'x', label: 'None' },
                { code: 'y', label: 'Some' },
                { code: 'z', label: 'Lots' }
            ]
        },
        'wanna-peek-fish-princess': {
            name: 'Fish Princess',
            id: '18821041',
            icon: '🪸',
            feature: 'Coral Cover',
            levels: [
                { code: 'y', label: 'Some' },
                { code: 'z', label: 'Lots' }
            ]
        },
        'wanna-peek-trick-or-peek': {
            name: 'Trick or Peek',
 id: '19845021',
 icon: '🍂',
 feature: 'Autumn Leaves',
 levels: [
     { code: 'y', label: 'Some' },
 { code: 'z', label: 'Lots' }
 ]
        }
    };

    function getGameKey() {
        if (typeof currentGameKey !== 'undefined' && currentGameKey) return currentGameKey;
        const info = (
            window.location.href + ' ' +
            (document.referrer || '') + ' ' +
            (window.document.title || '')
        ).toLowerCase();

        for (const [key, cfg] of Object.entries(GAME_CONFIGS)) {
            if (info.includes(key)) return key;
            if (cfg.id && info.includes(cfg.id)) return key;
            if (cfg.name && info.includes(cfg.name.toLowerCase())) return key;
        }
        return null;
    }

    function getGameConfig(gameKey) {
        const key = gameKey || getGameKey() || 'wanna-peek-trick-or-peek';
        return GAME_CONFIGS[key] || GAME_CONFIGS['wanna-peek-trick-or-peek'];
    }

    // Verify that the current page or frame belongs to one of the 7 supported games
    const activeGameKey = getGameKey();
    if (!activeGameKey) {
        return; // Silently exit on any other page or unrelated iframe
    }
    currentGameKey = activeGameKey;

    // Helper: Button styling
    function btnStyle(bg, flex = 'initial') {
        return `
        background: ${bg};
        color: #fff;
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        flex: ${flex};
        outline: none;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        user-select: none;
        transition: filter 0.15s, background 0.15s, transform 0.1s;
        `;
    }

    // Helper: Draggable element support with failsafe button release
    function makeDraggable(el, handle) {
        let isDragging = false;
        let startX = 0, startY = 0;
        let initialLeft = 0, initialTop = 0;

        const dragHandle = handle || el;

        dragHandle.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;

            const rect = el.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;

            // Switch to absolute/fixed pixel values so dragging doesn't jump
            el.style.right = 'auto';
            el.style.bottom = 'auto';
            el.style.left = `${initialLeft}px`;
            el.style.top = `${initialTop}px`;
            e.preventDefault();
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            if ((e.buttons & 1) === 0) {
                isDragging = false;
                return;
            }
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            el.style.left = `${initialLeft + dx}px`;
            el.style.top = `${initialTop + dy}px`;
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    // Shared Menu Template
    function buildMenuHTML(cfg) {
        return `
        <div id="mhs-menu-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid #444; padding-bottom:6px; cursor:move;">
        <b style="color:#fff; font-size:13px; display:flex; align-items:center; gap:6px;">🍯 MilkyCheats <span style="font-size:11px; color:#aaa; font-weight:normal;">(F2)</span></b>
        <button id="mhs-btn-close" tabindex="-1" style="background:none; border:none; color:#aaa; cursor:pointer; font-size:16px; font-weight:bold; line-height:1; padding:0 4px; outline:none;" title="Minimize (F2)">✕</button>
        </div>
        <div id="mhs-status" style="font-size:11px; color:#aaa; margin-bottom:10px; min-height:14px; transition:color 0.2s;">
        Waiting for game...
        </div>
        <div style="display:flex; flex-direction:column; gap:7px;">
        <button id="mhs-win-btn" class="mhs-btn" tabindex="-1" style="${btnStyle('#28a745')}">🏆 Instant Win Stage</button>
        <button id="mhs-shield-btn" class="mhs-btn" tabindex="-1" style="${btnStyle('#dc3545')}">🛡️ Invincible Shield: OFF</button>
        <button id="mhs-freeze-btn" class="mhs-btn" tabindex="-1" style="${btnStyle('#6c757d')}">❄️ Freeze Enemies: OFF</button>
        <button id="mhs-timer-btn" class="mhs-btn" tabindex="-1" style="${btnStyle('#6c757d')}">⏱️ Freeze Timer: OFF</button>
        <button id="mhs-turbo-btn" class="mhs-btn" tabindex="-1" style="${btnStyle('#6c757d')}">🚀 Turbo Speed: OFF</button>
        <div style="display:flex; align-items:center; gap:5px;">
        <button id="mhs-comfort-prev" class="mhs-btn" tabindex="-1" title="Previous Level" style="${btnStyle('#9c27b0', '0 0 34px')}; padding:8px 0; text-align:center;">◀</button>
        <button id="mhs-comfort-btn" class="mhs-btn" tabindex="-1" title="Cycle Next Level" style="${btnStyle('#9c27b0', '1')};">${cfg.icon} ${cfg.feature}: ${cfg.levels[0].label}</button>
        <button id="mhs-comfort-next" class="mhs-btn" tabindex="-1" title="Next Level" style="${btnStyle('#9c27b0', '0 0 34px')}; padding:8px 0; text-align:center;">▶</button>
        </div>
        <button id="mhs-gallery-btn" class="mhs-btn" tabindex="-1" style="${btnStyle('#6c757d')}">🔍 Free Gallery: OFF</button>
        <button id="mhs-items-btn" class="mhs-btn" tabindex="-1" style="${btnStyle('#e83e8c')}">✨ Max Collectibles & Powerups</button>
        <button id="mhs-unlock-btn" class="mhs-btn" tabindex="-1" style="${btnStyle('#fd7e14')}">🔓 Unlock All CGs & Bonuses</button>
        <button id="mhs-fullscreen-btn" class="mhs-btn" tabindex="-1" style="${btnStyle('#6c757d')}">🖥️ Windowed Fullscreen: OFF</button>
        </div>
        `;
    }

    // Shared Menu Button Event Wiring
    function bindMenuEvents(container, actionHandler, toggleMenuFn) {
        container.querySelectorAll('button').forEach((btn) => {
            btn.addEventListener('mousedown', (e) => e.preventDefault());
            btn.addEventListener('click', () => btn.blur());
        });

        container.addEventListener('keydown', (e) => {
            if (e.key !== 'F2' && e.key !== 'F4') e.stopPropagation();
        });

            container.querySelector('#mhs-win-btn').onclick = () => actionHandler('instantWin');
            container.querySelector('#mhs-shield-btn').onclick = () => actionHandler('toggleInvincibility');
            container.querySelector('#mhs-freeze-btn').onclick = () => actionHandler('toggleFreeze');
            container.querySelector('#mhs-timer-btn').onclick = () => actionHandler('toggleFreezeTimer');
            container.querySelector('#mhs-turbo-btn').onclick = () => actionHandler('toggleTurboSpeed');
            container.querySelector('#mhs-comfort-prev').onclick = () => actionHandler('prevComfortLevel');
            container.querySelector('#mhs-comfort-next').onclick = () => actionHandler('nextComfortLevel');
            container.querySelector('#mhs-comfort-btn').onclick = () => actionHandler('nextComfortLevel');
            container.querySelector('#mhs-gallery-btn').onclick = () => actionHandler('toggleFreeGallery');
            container.querySelector('#mhs-items-btn').onclick = () => actionHandler('maxCollectiblesAndPowerups');
            container.querySelector('#mhs-unlock-btn').onclick = () => actionHandler('unlockAll');
            container.querySelector('#mhs-fullscreen-btn').onclick = () => actionHandler('toggleWindowedFullscreen');
            container.querySelector('#mhs-btn-close').onclick = toggleMenuFn;
    }

    // =========================================================================
    // 1. TOP ITCH.IO PAGE MODULE (UI mounts outside the game canvas)
    // =========================================================================
    if (isTopItchPage) {
        let currentCheatState = {
            engineConnected: false,
 invincibilityActive: false,
 freezeActive: false,
 timerFreezeActive: false,
 turboActive: false,
 galleryPanActive: false,
 comfortLevel: null,
 isWindowedFullscreen: false
        };
        let statusTimeout = null;

        function sendToGame(action) {
            const iframes = document.querySelectorAll('#game_drop iframe, .game_frame iframe, iframe');
            iframes.forEach((f) => {
                try {
                    f.contentWindow.postMessage({ type: 'MHS_CHEAT_ACTION', action, gameKey: getGameKey() }, '*');
                } catch (e) {}
            });
        }

        function queryGameStatus() {
            const iframes = document.querySelectorAll('#game_drop iframe, .game_frame iframe, iframe');
            iframes.forEach((f) => {
                try {
                    f.contentWindow.postMessage({ type: 'MHS_QUERY_STATE', gameKey: getGameKey() }, '*');
                } catch (e) {}
            });
        }

        function setTopFullscreen(enabled) {
            const styleId = 'mhs-top-fullscreen-style';
            let styleTag = document.getElementById(styleId);

            if (enabled) {
                if (!styleTag) {
                    styleTag = document.createElement('style');
                    styleTag.id = styleId;
                    document.head.appendChild(styleTag);
                }
                styleTag.textContent = `
                #game_drop, .game_frame iframe, iframe[src*="itch.zone"] {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                z-index: 999999 !important;
                border: none !important;
                background: #000 !important;
                margin: 0 !important;
                padding: 0 !important;
                }
                `;
            } else {
                if (styleTag) {
                    styleTag.remove();
                }
            }
        }

        function showStatus(text, duration = 3000) {
            const el = document.getElementById('mhs-status');
            if (el) {
                el.textContent = text;
                el.style.color = '#ff99cc';
                clearTimeout(statusTimeout);
                statusTimeout = setTimeout(() => {
                    el.textContent = currentCheatState.engineConnected
                    ? 'Engine Connected! (F2 to toggle)'
                    : 'Waiting for game...';
                    el.style.color = '#aaa';
                }, duration);
            }
        }

        function updateUIState(state, statusText) {
            if (state) {
                Object.assign(currentCheatState, state);

                const shieldBtn = document.getElementById('mhs-shield-btn');
                if (shieldBtn) {
                    shieldBtn.textContent = currentCheatState.invincibilityActive
                    ? '🛡️ Invincible Shield: ON'
                    : '🛡️ Invincible Shield: OFF';
                    shieldBtn.style.background = currentCheatState.invincibilityActive ? '#28a745' : '#dc3545';
                }

                const freezeBtn = document.getElementById('mhs-freeze-btn');
                if (freezeBtn) {
                    freezeBtn.textContent = currentCheatState.freezeActive
                    ? '❄️ Freeze Enemies: ON'
                    : '❄️ Freeze Enemies: OFF';
                    freezeBtn.style.background = currentCheatState.freezeActive ? '#17a2b8' : '#6c757d';
                }

                const timerBtn = document.getElementById('mhs-timer-btn');
                if (timerBtn) {
                    timerBtn.textContent = currentCheatState.timerFreezeActive
                    ? '⏱️ Freeze Timer: ON'
                    : '⏱️ Freeze Timer: OFF';
                    timerBtn.style.background = currentCheatState.timerFreezeActive ? '#007bff' : '#6c757d';
                }

                const turboBtn = document.getElementById('mhs-turbo-btn');
                if (turboBtn) {
                    turboBtn.textContent = currentCheatState.turboActive
                    ? '🚀 Turbo Speed: ON'
                    : '🚀 Turbo Speed: OFF';
                    turboBtn.style.background = currentCheatState.turboActive ? '#e0a800' : '#6c757d';
                }

                const comfortBtn = document.getElementById('mhs-comfort-btn');
                if (comfortBtn) {
                    const cfg = getGameConfig();
                    const currentCode = currentCheatState.comfortLevel || cfg.levels[0].code;
                    const levelObj = cfg.levels.find((l) => l.code === currentCode) || cfg.levels[0];
                    comfortBtn.textContent = `${cfg.icon} ${cfg.feature}: ${levelObj.label}`;
                }

                const galleryBtn = document.getElementById('mhs-gallery-btn');
                if (galleryBtn) {
                    galleryBtn.textContent = currentCheatState.galleryPanActive
                    ? '🔍 Free Gallery: ON'
                    : '🔍 Free Gallery: OFF';
                    galleryBtn.style.background = currentCheatState.galleryPanActive ? '#6f42c1' : '#6c757d';
                }

                const fsBtn = document.getElementById('mhs-fullscreen-btn');
                if (fsBtn) {
                    fsBtn.textContent = currentCheatState.isWindowedFullscreen
                    ? '🖥️ Windowed Fullscreen: ON'
                    : '🖥️ Windowed Fullscreen: OFF';
                    fsBtn.style.background = currentCheatState.isWindowedFullscreen ? '#20c997' : '#6c757d';
                }

                const statusEl = document.getElementById('mhs-status');
                if (statusEl && !statusText) {
                    statusEl.textContent = currentCheatState.engineConnected
                    ? 'Engine Connected! (F2 to toggle)'
                    : 'Waiting for game...';
                }
            }

            if (statusText) {
                showStatus(statusText);
            }
        }

        function toggleMenu() {
            const menu = document.getElementById('mhs-cheat-menu');
            const pill = document.getElementById('mhs-cheat-pill');
            if (!menu) return;

            if (menu.style.display === 'none') {
                menu.style.display = 'block';
                if (pill) pill.style.display = 'none';
            } else {
                menu.style.display = 'none';
                if (pill) pill.style.display = 'flex';
            }
        }

        function initTopUI() {
            if (!document.body) {
                setTimeout(initTopUI, 50);
                return;
            }
            if (document.getElementById('mhs-cheat-menu')) return;

            // Global Hover style
            const style = document.createElement('style');
            style.textContent = `
            .mhs-btn:hover { filter: brightness(1.12); }
            .mhs-btn:active { transform: translateY(1px); }
            `;
            document.head.appendChild(style);

            // 1. Minimized Toggle Pill
            const pill = document.createElement('div');
            pill.id = 'mhs-cheat-pill';
            pill.tabIndex = -1;
            pill.style.cssText = `
            position: fixed;
            top: 15px;
            right: 15px;
            background: rgba(20, 20, 25, 0.95);
            color: #ff99cc;
            border: 2px solid #ff66b2;
            border-radius: 20px;
            padding: 6px 14px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 12px;
            font-weight: bold;
            cursor: pointer;
            z-index: 10000000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.6);
            display: none;
            user-select: none;
            transition: transform 0.15s, background 0.15s;
            `;
            pill.textContent = '🍯 Cheats (F2)';
            pill.addEventListener('mouseenter', () => (pill.style.transform = 'scale(1.05)'));
            pill.addEventListener('mouseleave', () => (pill.style.transform = 'scale(1)'));
            pill.addEventListener('click', toggleMenu);
            document.body.appendChild(pill);

            // 2. Main Cheat Menu Container (Floats outside game canvas)
            const container = document.createElement('div');
            container.id = 'mhs-cheat-menu';
            container.tabIndex = -1;
            container.style.cssText = `
            position: fixed;
            top: 40px;
            right: 30px;
            background: rgba(20, 20, 25, 0.96);
            color: #ff99cc;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 13px;
            border: 2px solid #ff66b2;
            border-radius: 12px;
            padding: 14px;
            z-index: 10000000;
            box-shadow: 0 6px 25px rgba(0,0,0,0.7);
            min-width: 250px;
            user-select: none;
            outline: none;
            `;

            container.innerHTML = buildMenuHTML(getGameConfig());
            document.body.appendChild(container);

            // Bind Button Actions
            bindMenuEvents(container, sendToGame, toggleMenu);

            // Draggable Menu Logic
            makeDraggable(container, container.querySelector('#mhs-menu-header'));

            // Keyboard Shortcuts on Top Page
            window.addEventListener('keydown', (e) => {
                if (e.key === 'F2') {
                    toggleMenu();
                } else if (e.key === 'F4') {
                    sendToGame('toggleWindowedFullscreen');
                }
            });

            // Poll briefly until the game iframe connects
            const queryTimer = setInterval(() => {
                if (currentCheatState.engineConnected) {
                    clearInterval(queryTimer);
                } else {
                    queryGameStatus();
                }
            }, 1000);
        }

        // PostMessage listener for messages from Game Iframe
        window.addEventListener('message', (e) => {
            if (!e.data || typeof e.data !== 'object') return;

            if (e.data.type === 'MHS_SET_FULLSCREEN') {
                setTopFullscreen(Boolean(e.data.enabled));
            } else if (e.data.type === 'MHS_STATE_UPDATE') {
                updateUIState(e.data.state, e.data.status);
            } else if (e.data.type === 'MHS_STATUS_MSG') {
                showStatus(e.data.text);
            } else if (e.data.type === 'MHS_TOGGLE_MENU') {
                toggleMenu();
            }
        });

        // Initialize UI when page is ready
        function startTopUI() {
            if (document.body) {
                initTopUI();
            } else {
                document.addEventListener('DOMContentLoaded', initTopUI);
            }
        }
        startTopUI();

        return; // Top frame completes here
    }

    // =========================================================================
    // 2. GAME FRAME LOGIC (Inside game iframe or standalone tab)
    // =========================================================================
    let engine = null;
    let invincibilityActive = false;
    let invincibilityInterval = null;
    let freezeActive = false;
    let freezeInterval = null;
    let timerFreezeActive = false;
    let timerFreezeInterval = null;
    let turboActive = false;
    let turboInterval = null;
    let galleryPanActive = false;
    let isWindowedFullscreen = false;

    // --- 1. Hook Engine via Function.prototype.bind ---
    const origBind = win.Function.prototype.bind;
    win.Function.prototype.bind = function (thisArg, ...args) {
        try {
            if (
                thisArg &&
                typeof thisArg === 'object' &&
                typeof thisArg.getGameAttribute === 'function' &&
                !engine
            ) {
                engine = thisArg;
                win.__stencylEngine = engine;
                console.log('[MilkyCheats] Successfully hooked game engine:', engine);
                broadcastState('Engine Connected! (F2 to toggle)');
                setTimeout(() => {
                    broadcastState();
                }, 800);
            }
        } catch (e) {}
        return origBind.apply(this, [thisArg, ...args]);
    };

    // Helper functions
    function getAttr(key) {
        try {
            if (engine && engine.gameAttributes && engine.gameAttributes.h) {
                return engine.getGameAttribute(key);
            }
        } catch (e) {}
        return null;
    }

    function setAttr(key, val) {
        try {
            if (engine && engine.gameAttributes && engine.gameAttributes.h) {
                engine.setGameAttribute(key, val);
            }
        } catch (e) {}
    }

    function shout(event) {
        try {
            if (engine && typeof engine.shout === 'function') {
                engine.shout(event);
            }
        } catch (e) {}
    }

    function getSceneScript() {
        if (!engine || !engine.behaviors || !engine.behaviors.behaviors) return null;
        for (const b of engine.behaviors.behaviors) {
            if (b && b.script && (b.script._cursor !== undefined || b.script._shielded !== undefined)) {
                return b.script;
            }
        }
        return null;
    }

    function getGalleryScript() {
        if (!engine || !engine.behaviors || !engine.behaviors.behaviors) return null;
        for (const b of engine.behaviors.behaviors) {
            if (
                b &&
                b.script &&
                b.script._pictureii !== undefined &&
                b.script._zoomedin !== undefined &&
                b.script._cursor === undefined
            ) {
                return b.script;
            }
        }
        return null;
    }

    function noopDeath() {
        // Blocks death & damage interruption completely, while ensuring cursor visibility
        const script = getSceneScript();
        if (script && script._cursorimage) {
            if (typeof script._cursorimage.set_alpha === 'function') {
                script._cursorimage.set_alpha(1);
            }
            script._cursorimage.__alpha = 1;
        }
    }

    function applyInvincibleState(script) {
        if (!script) return;

        // 1. Lock _shielded property so internal engine timer cannot reset it to 0
        if (!script.__shieldedPropertyPatched) {
            script.__shieldedPropertyPatched = true;
            let _val = 1;
            try {
                Object.defineProperty(script, '_shielded', {
                    get() {
                        return invincibilityActive ? 1 : _val;
                    },
                    set(v) {
                        if (!invincibilityActive) _val = v;
                    },
                    configurable: true
                });
            } catch (e) {
                script._shielded = 1;
            }
        }

        // 2. Protect cursor visibility: hook set_alpha to prevent setting alpha to 0
        if (script._cursorimage) {
            if (!script._cursorimage.__orig_set_alpha && typeof script._cursorimage.set_alpha === 'function') {
                const origSetAlpha = script._cursorimage.set_alpha;
                script._cursorimage.__orig_set_alpha = origSetAlpha;
                script._cursorimage.set_alpha = function (alpha) {
                    if (invincibilityActive && alpha === 0) {
                        return origSetAlpha.call(this, 1);
                    }
                    return origSetAlpha.call(this, alpha);
                };
            }
            if (script._cursorimage.__alpha !== 1) {
                if (typeof script._cursorimage.set_alpha === 'function') {
                    script._cursorimage.set_alpha(1);
                }
                script._cursorimage.__alpha = 1;
            }
        }

        // 3. Mock shield actor if missing or recycled
        if (!script._shield || script._shield.dead || script._shield.recycled) {
            script._shield = {
                shout: () => {},
 moveTo: () => {},
 anchorToScreen: () => {},
 setAnimation: () => {},
 dead: false,
 recycled: false
            };
        }

        // 4. Intercept death handler so cutting lines are uninterrupted
        if (script._customEvent_death && !script.__deathIntercepted) {
            script.__deathIntercepted = true;
            const originalDeath = script._customEvent_death;
            script._customEvent_death = function (...args) {
                if (invincibilityActive) {
                    noopDeath();
                    return;
                }
                return originalDeath.apply(this, args);
            };
        }
    }

    function applyTurboState(script) {
        if (!script) return;
        script._turbotimer = 99999;
        script._cursorspeed = 0.008; // 2.5x faster cutting
        script._hoplength = 4; // 2x faster perimeter move
        script._webbedtimer = 0; // Immune to web traps
        if (script._web && typeof script._web.setAnimation === 'function') {
            script._web.setAnimation('0');
        }
        if (!script._turboflare) {
            script._turboflare = {
                setAngle: () => {},
 setXCenter: () => {},
 setYCenter: () => {}
            };
        }
    }

    // Broadcast current cheat state to parent / self
    function broadcastState(statusMsg) {
        const payload = {
            type: 'MHS_STATE_UPDATE',
            state: {
                engineConnected: Boolean(engine),
 invincibilityActive,
 freezeActive,
 timerFreezeActive,
 turboActive,
 galleryPanActive,
 comfortLevel: getAttr('comfort level'),
 isWindowedFullscreen
            },
            status: statusMsg
        };

        try {
            if (window.parent && window.parent !== window) {
                window.parent.postMessage(payload, '*');
            } else {
                window.postMessage(payload, '*');
            }
        } catch (e) {}
    }

    function showStatus(text) {
        // Direct update for standalone mode
        const el = document.getElementById('mhs-status');
        if (el) {
            el.textContent = text;
            el.style.color = '#ff99cc';
            setTimeout(() => {
                if (el) {
                    el.textContent = engine ? 'Engine Connected! (F2)' : 'Waiting for game...';
                    el.style.color = '#aaa';
                }
            }, 3000);
        }
        broadcastState(text);
    }

    // --- 2. Windowed Fullscreen (Max Height, 1:1 Aspect Ratio) ---
    function toggleWindowedFullscreen() {
        isWindowedFullscreen = !isWindowedFullscreen;
        const styleId = 'mhs-inner-fullscreen-style';
        let styleTag = document.getElementById(styleId);

        // Notify top itch.io page to expand iframe
        try {
            if (window.parent) {
                window.parent.postMessage({ type: 'MHS_SET_FULLSCREEN', enabled: isWindowedFullscreen }, '*');
            }
        } catch (e) {}

        if (isWindowedFullscreen) {
            if (!styleTag) {
                styleTag = document.createElement('style');
                styleTag.id = styleId;
                document.head.appendChild(styleTag);
            }
            styleTag.textContent = `
            html, body {
                margin: 0 !important;
                padding: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                overflow: hidden !important;
                background: #000 !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
            }
            #openfl-content {
            width: 100vw !important;
            height: 100vh !important;
            max-width: 100vw !important;
            max-height: 100vh !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            background: transparent !important;
            }
            canvas {
                width: min(100vw, 100vh) !important;
                height: min(100vw, 100vh) !important;
                max-width: 100vw !important;
                max-height: 100vh !important;
                object-fit: contain !important;
                image-rendering: -webkit-optimize-contrast;
                image-rendering: crisp-edges;
            }
            `;
            showStatus('🖥️ Windowed Fullscreen: ON');
        } else {
            if (styleTag) {
                styleTag.remove();
            }
            showStatus('🖥️ Windowed Fullscreen: OFF');
        }

        return isWindowedFullscreen;
    }

    // --- 3. Cheat Actions ---
    const Cheats = {
        instantWin() {
            if (!engine) return showStatus('Game engine not loaded yet!');

            // Guard: Check if inside an active gameplay scene
            const script = getSceneScript();
            if (!script || !script._cursor) {
                return showStatus('⚠️ Start a level first before using Instant Win!');
            }
            if (script._win === 1) {
                return showStatus('Already won!');
            }

            // Auto-satisfy bonus requirements on round 3 (Locks / Eggs / Gems / Pearls / Candies)
            setAttr('round 1 lock', 1);
            setAttr('round 2 lock', 1);
            setAttr('round 3 lock', 1);
            setAttr('candy amount', 15);
            script._gotkey = 1;
            script._keyisout = 1;

            shout('_customEvent_win');
            showStatus('🏆 Stage cleared!');
        },

        toggleInvincibility() {
            if (!engine) return showStatus('Game engine not loaded yet!');
            invincibilityActive = !invincibilityActive;

            if (invincibilityInterval) {
                clearInterval(invincibilityInterval);
                invincibilityInterval = null;
            }

            if (invincibilityActive) {
                setAttr('player health', 999);
                applyInvincibleState(getSceneScript());

                invincibilityInterval = setInterval(() => {
                    if (!engine) return;
                    setAttr('player health', 999);
                    applyInvincibleState(getSceneScript());
                }, 100);

                showStatus('🛡️ Invincible Shield: ACTIVATED');
            } else {
                const script = getSceneScript();
                if (script) {
                    try {
                        script._shielded = 0;
                    } catch (e) {}
                    if (script._cursorimage) {
                        if (typeof script._cursorimage.set_alpha === 'function') {
                            script._cursorimage.set_alpha(1);
                        }
                        script._cursorimage.__alpha = 1;
                    }
                }
                setAttr('player health', 5);
                showStatus('🛡️ Invincible Shield: DISABLED');
            }
            return invincibilityActive;
        },

        toggleFreeze() {
            if (!engine) return showStatus('Game engine not loaded yet!');
            freezeActive = !freezeActive;

            if (freezeInterval) {
                clearInterval(freezeInterval);
                freezeInterval = null;
            }

            if (freezeActive) {
                const freezeStep = () => {
                    if (!engine) return;

                    const script = getSceneScript();
                    if (script) {
                        script._freezetimer = 99999;
                    }

                    if (engine && engine.allActors) {
                        for (let it = engine.allActors.iterator(); it.hasNext(); ) {
                            let act = it.next();
                            if (act && !act.dead && !act.recycled) {
                                if (typeof act.shout === 'function') {
                                    act.shout('_customEvent_freeze');
                                }
                                if (typeof act.setXVelocity === 'function') {
                                    act.setXVelocity(0);
                                    act.setYVelocity(0);
                                }
                            }
                        }
                    }
                };

                freezeStep();
                freezeInterval = setInterval(freezeStep, 200);
                showStatus('❄️ Enemies: FROZEN');
            } else {
                const script = getSceneScript();
                if (script) {
                    script._freezetimer = 0;
                }
                if (engine && engine.allActors) {
                    for (let it = engine.allActors.iterator(); it.hasNext(); ) {
                        let act = it.next();
                        if (act && !act.dead && !act.recycled && typeof act.shout === 'function') {
                            act.shout('_customEvent_unfreeze');
                        }
                    }
                }
                showStatus('❄️ Enemies: UNFROZEN');
            }
            return freezeActive;
        },

        toggleFreezeTimer() {
            if (!engine) return showStatus('Game engine not loaded yet!');
            timerFreezeActive = !timerFreezeActive;

            if (timerFreezeInterval) {
                clearInterval(timerFreezeInterval);
                timerFreezeInterval = null;
            }

            if (timerFreezeActive) {
                const lockTimer = () => {
                    if (!engine) return;
                    const script = getSceneScript();
                    if (script) {
                        script._timer = 9999;
                        script._timerflash = 0;
                        script._timerflashingdelay = 0;
                    }
                };

                lockTimer();
                timerFreezeInterval = setInterval(lockTimer, 200);
                showStatus('⏱️ Timer Frozen at 9999s!');
            } else {
                showStatus('⏱️ Timer Countdown Resumed');
            }
            return timerFreezeActive;
        },

        toggleTurboSpeed() {
            if (!engine) return showStatus('Game engine not loaded yet!');
            turboActive = !turboActive;

            if (turboInterval) {
                clearInterval(turboInterval);
                turboInterval = null;
            }

            if (turboActive) {
                applyTurboState(getSceneScript());
                turboInterval = setInterval(() => {
                    if (!engine) return;
                    applyTurboState(getSceneScript());
                }, 100);

                showStatus('🚀 Turbo Speed: ACTIVATED (2.5x Speed + Web Immune)');
            } else {
                const script = getSceneScript();
                if (script) {
                    script._turbotimer = 0;
                    script._cursorspeed = 0.02;
                    script._hoplength = 2;
                }
                showStatus('🚀 Turbo Speed: DISABLED');
            }
            return turboActive;
        },

        cycleComfortLevel(direction = 1) {
            if (!engine) return showStatus('Game engine not loaded yet!');
            const cfg = getGameConfig();
            const current = getAttr('comfort level') || cfg.levels[0].code;
            let idx = cfg.levels.findIndex((l) => l.code === current);
            if (idx === -1) idx = 0;
            const nextIdx = (idx + direction + cfg.levels.length) % cfg.levels.length;
            const next = cfg.levels[nextIdx];

            setAttr('comfort level', next.code);

            // If viewing an image in the gallery, instantly reload it with the new cover level!
            const gallery = getGalleryScript();
            if (gallery) {
                shout('_customEvent_changeimage');
            }

            showStatus(`${cfg.icon} ${cfg.feature}: ${next.label}`);
            broadcastState();
            return next;
        },

        prevComfortLevel() {
            return this.cycleComfortLevel(-1);
        },

        nextComfortLevel() {
            return this.cycleComfortLevel(1);
        },

        toggleFreeGallery() {
            galleryPanActive = !galleryPanActive;

            const canvas = document.querySelector('canvas');
            if (galleryPanActive) {
                if (canvas && canvas.style) canvas.style.cursor = 'grab';
                showStatus('🔍 Free Gallery: ON (Drag with mouse & Wheel zoom!)');
            } else {
                stopPanning();
                const script = getGalleryScript();
                if (script && script._pictureii) {
                    if (typeof script._pictureii.set_scaleX === 'function') {
                        script._pictureii.set_scaleX(1);
                        script._pictureii.set_scaleY(1);
                    }
                    script._zoomedin = 0;
                    script._picturexoffset = 0;
                    script._pictureyoffset = 0;
                    if (typeof script._pictureii.set_imgX === 'function') {
                        script._pictureii.set_imgX(Math.round(script._pictureoriginalx || 0));
                        script._pictureii.set_imgY(Math.round(script._pictureoriginaly || 0));
                    }
                }
                if (canvas && canvas.style) canvas.style.cursor = '';
                showStatus('🔍 Free Gallery: OFF');
            }
            return galleryPanActive;
        },

        maxCollectiblesAndPowerups() {
            if (!engine) return showStatus('Game engine not loaded yet!');

            // 1. Collectible counters across all games:
            // - Trick or Peek: 15 Candies
            // - Milky & Honey: 3 Heart Locks
            // - Candy Bunnies: 3 Easter Eggs
            // - Dirty Girls: 3 Gems
            // - Fish Princess: 3 Pearls
            setAttr('candy amount', 15);
            setAttr('round 1 lock', 1);
            setAttr('round 2 lock', 1);
            setAttr('round 3 lock', 1);
            setAttr('key is out', 2);

            // 2. Cross-game luck attributes
            setAttr('lucky', 999);
            setAttr('yotsuba probability', 100);

            // 3. Active stage boosts
            const script = getSceneScript();
            if (script) {
                script._timer = 9999;
                script._turbotimer = 999;
                script._gotkey = 1;
                script._keyisout = 1;
                script._timerflash = 0;
                script._timerflashingdelay = 0;
            }

            // 4. Queue powerups into spawn list
            let spawnList = getAttr('list of items to spawn');
            if (Array.isArray(spawnList)) {
                if (spawnList.length > 20) spawnList.length = 0;
                // 10 = Candy, 1 = Shield, 3 = Clock, 4 = Turbo, 6 = Heart
                spawnList.push(10, 1, 3, 4);
            }

            shout('_customEvent_itemspawn');
            showStatus('✨ Collectibles (3/3 & 15/15) + Speed & Timer (9999s) Set!');
        },

        unlockAll() {
            if (!engine) return showStatus('Game engine not loaded yet!');

            // Stages 1 through 30:
            // Covers all base characters AND all extra/bonus CGs across all 7 games:
            // - Christmas (1-4)
            // - Year of the Bunny (1-5)
            // - Milky & Honey (1-5)
            // - Dirty Girls (1-8: 4 base + 4 bonus)
            // - Trick or Peek (1-8: 4 base + 4 bonus)
            // - Candy Bunnies (1-12: 6 base + 6 bonus)
            // - Fish Princess (1-14: 7 base + 7 bonus, including Angie [12], Zelly [13], and Oonie [14])
            let existing = getAttr('unlocked letters');
            let list = Array.isArray(existing) ? existing.slice() : [];
            for (let i = 1; i <= 30; i++) {
                if (!list.includes(i)) list.push(i);
            }
            setAttr('unlocked letters', list);

            // Set all bonus locks and items
            setAttr('candy amount', 15);
            setAttr('round 1 lock', 1);
            setAttr('round 2 lock', 1);
            setAttr('round 3 lock', 1);
            setAttr('story mode progress', 10);

            // If no bush / cover level set yet, default to first level
            const cfg = getGameConfig();
            if (!getAttr('comfort level')) {
                setAttr('comfort level', cfg.levels[0].code);
            }

            shout('_customEvent_unlock');
            showStatus('🔓 All CGs & Bonus Images Unlocked!');
        }
    };

    // --- Bulletproof Mouse Drag-to-Pan & Wheel Zoom in Gallery ---
    let isPanning = false;
    let lastMouseX = 0, lastMouseY = 0;

    function stopPanning() {
        if (isPanning) {
            isPanning = false;
            const canvas = document.querySelector('canvas');
            if (canvas && canvas.style) {
                canvas.style.cursor = galleryPanActive ? 'grab' : '';
            }
        }
    }

    win.addEventListener('mousedown', (e) => {
        if (!galleryPanActive) return;
        // Only trigger on Left Click
        if (e.button !== 0) return;

        const script = getGalleryScript();
        if (!script || !script._pictureii) return;
        if (e.target && e.target.tagName !== 'CANVAS' && e.target.id !== 'openfl-content') return;

        isPanning = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        if (e.target.style) e.target.style.cursor = 'grabbing';
    });

        win.addEventListener('mousemove', (e) => {
            if (!isPanning || !galleryPanActive) return;

            // Failsafe: If left mouse button is released anywhere, stop immediately!
            if ((e.buttons & 1) === 0) {
                stopPanning();
                return;
            }

            const script = getGalleryScript();
            if (!script || !script._pictureii) {
                stopPanning();
                return;
            }

            const dx = e.clientX - lastMouseX;
            const dy = e.clientY - lastMouseY;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;

            if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
                e.preventDefault();
            }

            script._picturexoffset = (script._picturexoffset || 0) + dx;
            script._pictureyoffset = (script._pictureyoffset || 0) + dy;

            if (typeof script._pictureii.set_imgX === 'function') {
                script._pictureii.set_imgX(Math.round((script._pictureoriginalx || 0) + script._picturexoffset));
            }
            if (typeof script._pictureii.set_imgY === 'function') {
                script._pictureii.set_imgY(Math.round((script._pictureoriginaly || 0) + script._pictureyoffset));
            }
        });

        win.addEventListener('mouseup', stopPanning);
        win.addEventListener('pointerup', stopPanning);
        win.addEventListener('pointercancel', stopPanning);
        win.addEventListener('blur', stopPanning);

        win.addEventListener(
            'wheel',
            (e) => {
                if (!galleryPanActive) return;
                const script = getGalleryScript();
                if (!script || !script._pictureii) return;
                if (e.target && e.target.tagName !== 'CANVAS' && e.target.id !== 'openfl-content') return;

                e.preventDefault();
                let currentScale = 1;
                if (typeof script._pictureii.get_scaleX === 'function') {
                    currentScale = script._pictureii.get_scaleX();
                }

                const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
                let newScale = currentScale * zoomFactor;

                if (newScale <= 1.05) {
                    // Zoomed back to 1x: reset offsets and zoomed-in state so scene arrows work
                    newScale = 1;
                    script._zoomedin = 0;
                    script._picturexoffset = 0;
                    script._pictureyoffset = 0;
                    if (typeof script._pictureii.set_imgX === 'function') {
                        script._pictureii.set_imgX(Math.round(script._pictureoriginalx || 0));
                    }
                    if (typeof script._pictureii.set_imgY === 'function') {
                        script._pictureii.set_imgY(Math.round(script._pictureoriginaly || 0));
                    }
                } else {
                    if (newScale > 8.0) newScale = 8.0;
                    script._zoomedin = 1;
                }

                if (typeof script._pictureii.set_scaleX === 'function') {
                    script._pictureii.set_scaleX(newScale);
                }
                if (typeof script._pictureii.set_scaleY === 'function') {
                    script._pictureii.set_scaleY(newScale);
                }
            },
            { passive: false }
        );

        // --- 4. PostMessage Communication from Top Page ---
        window.addEventListener('message', (e) => {
            if (!e.data || typeof e.data !== 'object') return;

            if (e.data.gameKey) {
                currentGameKey = e.data.gameKey;
            }

            if (e.data.type === 'MHS_QUERY_STATE') {
                broadcastState();
            } else if (e.data.type === 'MHS_CHEAT_ACTION') {
                const action = e.data.action;
                if (action === 'toggleWindowedFullscreen') {
                    toggleWindowedFullscreen();
                } else if (typeof Cheats[action] === 'function') {
                    Cheats[action]();
                }
                broadcastState();
            }
        });

        // Keyboard Shortcuts inside Game Iframe (Relay F2/F4 to Top Page)
        win.addEventListener('keydown', (e) => {
            if (e.key === 'F2') {
                try {
                    if (window.parent) {
                        window.parent.postMessage({ type: 'MHS_TOGGLE_MENU' }, '*');
                    }
                } catch (err) {}
            } else if (e.key === 'F4') {
                toggleWindowedFullscreen();
            }
        });

        // Notify parent immediately that iframe script has loaded
        broadcastState();

        // =========================================================================
        // 3. STANDALONE FALLBACK UI (Only if user opened game URL directly outside itch.io)
        // =========================================================================
        if (isStandaloneGame) {
            function initStandaloneUI() {
                if (!document.getElementById('openfl-content') && !document.querySelector('canvas')) {
                    setTimeout(initStandaloneUI, 800);
                    return;
                }
                if (document.getElementById('mhs-cheat-menu')) return;

                // Global Hover style
                const style = document.createElement('style');
                style.textContent = `
                .mhs-btn:hover { filter: brightness(1.12); }
                .mhs-btn:active { transform: translateY(1px); }
                `;
                document.head.appendChild(style);

                function toggleStandaloneMenu() {
                    const menu = document.getElementById('mhs-cheat-menu');
                    const pill = document.getElementById('mhs-cheat-pill');
                    if (!menu) return;

                    if (menu.style.display === 'none') {
                        menu.style.display = 'block';
                        if (pill) pill.style.display = 'none';
                    } else {
                        menu.style.display = 'none';
                        if (pill) pill.style.display = 'flex';
                    }
                }

                // Minimized Toggle Pill
                const pill = document.createElement('div');
                pill.id = 'mhs-cheat-pill';
                pill.tabIndex = -1;
                pill.style.cssText = `
                position: fixed;
                top: 15px;
                right: 15px;
                background: rgba(20, 20, 25, 0.95);
                color: #ff99cc;
                border: 2px solid #ff66b2;
                border-radius: 20px;
                padding: 6px 14px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                font-size: 12px;
                font-weight: bold;
                cursor: pointer;
                z-index: 10000000;
                box-shadow: 0 4px 15px rgba(0,0,0,0.6);
                display: none;
                user-select: none;
                transition: transform 0.15s, background 0.15s;
                `;
                pill.textContent = '🍯 Cheats (F2)';
                pill.addEventListener('mouseenter', () => (pill.style.transform = 'scale(1.05)'));
                pill.addEventListener('mouseleave', () => (pill.style.transform = 'scale(1)'));
                pill.addEventListener('click', toggleStandaloneMenu);
                document.body.appendChild(pill);

                // Container
                const container = document.createElement('div');
                container.id = 'mhs-cheat-menu';
                container.tabIndex = -1;
                container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(20, 20, 25, 0.95);
                color: #ff99cc;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                font-size: 13px;
                border: 2px solid #ff66b2;
                border-radius: 12px;
                padding: 12px;
                z-index: 10000000;
                box-shadow: 0 4px 20px rgba(0,0,0,0.6);
                min-width: 250px;
                user-select: none;
                outline: none;
                `;

                container.innerHTML = buildMenuHTML(getGameConfig());
                document.body.appendChild(container);

                const handleStandaloneAction = (action) => {
                    if (action === 'toggleWindowedFullscreen') {
                        toggleWindowedFullscreen();
                    } else if (typeof Cheats[action] === 'function') {
                        Cheats[action]();
                    }
                    broadcastState();
                };

                bindMenuEvents(container, handleStandaloneAction, toggleStandaloneMenu);
                makeDraggable(container, container.querySelector('#mhs-menu-header'));

                win.addEventListener('keydown', (e) => {
                    if (e.key === 'F2') {
                        toggleStandaloneMenu();
                    } else if (e.key === 'F4') {
                        toggleWindowedFullscreen();
                    }
                });
            }

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initStandaloneUI);
            } else {
                initStandaloneUI();
            }
        }
})();
