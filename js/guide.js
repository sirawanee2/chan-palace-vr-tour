/* ============================================
   "น้องคชา" — LITTLE ROYAL WAR-ELEPHANT GUIDE
   Perches on the narration panel, talks along with the narration,
   cheers on each new scene and tells a fun fact when tapped.
   Texts live in content.json under "guide".
   ============================================ */

const KACHA_SVG = `
<svg class="kacha-svg" viewBox="0 0 200 210" aria-hidden="true">
    <defs>
        <radialGradient id="kgSkin" cx="40%" cy="32%" r="78%">
            <stop offset="0" stop-color="#d3dbe6"/>
            <stop offset="0.55" stop-color="#9ea9bb"/>
            <stop offset="1" stop-color="#6c788d"/>
        </radialGradient>
        <linearGradient id="kgGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#fff3c4"/>
            <stop offset="0.45" stop-color="#e8c55c"/>
            <stop offset="1" stop-color="#a5822a"/>
        </linearGradient>
        <linearGradient id="kgCloth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#c8313a"/>
            <stop offset="1" stop-color="#76101a"/>
        </linearGradient>
        <radialGradient id="kgGlow">
            <stop offset="0" stop-color="#ffd86b" stop-opacity="0.5"/>
            <stop offset="1" stop-color="#ffd86b" stop-opacity="0"/>
        </radialGradient>
    </defs>

    <circle class="k-aura" cx="100" cy="112" r="96" fill="url(#kgGlow)"/>
    <ellipse class="k-shadow" cx="100" cy="201" rx="46" ry="6"/>

    <g class="k-bob">
        <!-- back legs + tail -->
        <rect x="56" y="160" width="20" height="30" rx="9" fill="#6c788d"/>
        <rect x="124" y="160" width="20" height="30" rx="9" fill="#6c788d"/>
        <g class="k-tail">
            <path d="M144 150 q16 4 15 20" stroke="#6c788d" stroke-width="4" fill="none" stroke-linecap="round"/>
            <path d="M159 169 l-3 7 l5 -2 l2 5 l1 -8 z" fill="#4a5466"/>
        </g>

        <!-- body + royal saddle cloth -->
        <ellipse cx="100" cy="157" rx="48" ry="34" fill="url(#kgSkin)"/>
        <path d="M56 147 Q100 124 144 147 L138 179 Q100 191 62 179 Z"
              fill="url(#kgCloth)" stroke="url(#kgGold)" stroke-width="3" stroke-linejoin="round"/>
        <path d="M64 153 Q100 135 136 153 L132 173 Q100 183 68 173 Z"
              fill="none" stroke="#f4e4bc" stroke-opacity="0.6" stroke-width="1" stroke-dasharray="3 3"/>
        <path d="M100 151 l7 10 l-7 10 l-7 -10 z" fill="url(#kgGold)"/>
        <circle cx="100" cy="161" r="2.4" fill="#c8313a"/>
        <g class="k-tassel k-tassel-l">
            <line x1="64" y1="179" x2="62" y2="190" stroke="#e8c55c" stroke-width="2"/>
            <circle cx="62" cy="192" r="3.2" fill="url(#kgGold)"/>
        </g>
        <g class="k-tassel k-tassel-r">
            <line x1="136" y1="179" x2="138" y2="190" stroke="#e8c55c" stroke-width="2"/>
            <circle cx="138" cy="192" r="3.2" fill="url(#kgGold)"/>
        </g>

        <!-- front legs with gold anklets -->
        <rect x="72" y="167" width="22" height="31" rx="10" fill="url(#kgSkin)"/>
        <rect x="106" y="167" width="22" height="31" rx="10" fill="url(#kgSkin)"/>
        <rect x="71" y="183" width="24" height="5" rx="2.5" fill="url(#kgGold)"/>
        <rect x="105" y="183" width="24" height="5" rx="2.5" fill="url(#kgGold)"/>
        <g fill="#f3ead8">
            <circle cx="77" cy="195" r="2.3"/><circle cx="83" cy="196" r="2.3"/><circle cx="89" cy="195" r="2.3"/>
            <circle cx="111" cy="195" r="2.3"/><circle cx="117" cy="196" r="2.3"/><circle cx="123" cy="195" r="2.3"/>
        </g>

        <!-- head -->
        <g class="k-head">
            <g class="k-ear k-ear-l">
                <ellipse cx="50" cy="93" rx="32" ry="38" fill="url(#kgSkin)"/>
                <ellipse cx="53" cy="95" rx="21" ry="27" fill="#eab8c2"/>
                <circle cx="44" cy="131" r="3.4" fill="url(#kgGold)"/>
            </g>
            <g class="k-ear k-ear-r">
                <ellipse cx="150" cy="93" rx="32" ry="38" fill="url(#kgSkin)"/>
                <ellipse cx="147" cy="95" rx="21" ry="27" fill="#eab8c2"/>
                <circle cx="156" cy="131" r="3.4" fill="url(#kgGold)"/>
            </g>

            <circle cx="100" cy="91" r="44" fill="url(#kgSkin)"/>

            <!-- Thai-style crown and forehead ornament -->
            <g class="k-crown">
                <path d="M86 62 C89 46 96 32 100 14 C104 32 111 46 114 62 Z"
                      fill="url(#kgGold)" stroke="#8a6a1c" stroke-width="1"/>
                <path d="M89 52 Q100 45 111 52 M92 42 Q100 36 108 42 M95 32 Q100 28 105 32"
                      stroke="#8a6a1c" fill="none" stroke-width="1"/>
                <path d="M71 66 Q100 47 129 66 L125 73 Q100 58 75 73 Z"
                      fill="url(#kgGold)" stroke="#8a6a1c" stroke-width="1"/>
                <circle cx="100" cy="60" r="4.6" fill="#c8313a" stroke="#fff3c4" stroke-width="1"/>
                <circle cx="84" cy="66" r="2" fill="#c8313a"/>
                <circle cx="116" cy="66" r="2" fill="#c8313a"/>
                <path d="M95 68 L100 80 L105 68 Z" fill="url(#kgGold)"/>
                <circle class="k-gem" cx="100" cy="14" r="3.6" fill="#fff6d0"/>
            </g>

            <!-- eyes (pupils follow the pointer) -->
            <g class="k-eye">
                <ellipse cx="80" cy="89" rx="9.5" ry="11" fill="#fff"/>
                <g class="k-pupil">
                    <circle cx="80" cy="90" r="6" fill="#1d1b2c"/>
                    <circle cx="82.5" cy="86.5" r="2.2" fill="#fff"/>
                </g>
            </g>
            <g class="k-eye">
                <ellipse cx="120" cy="89" rx="9.5" ry="11" fill="#fff"/>
                <g class="k-pupil">
                    <circle cx="120" cy="90" r="6" fill="#1d1b2c"/>
                    <circle cx="122.5" cy="86.5" r="2.2" fill="#fff"/>
                </g>
            </g>
            <!-- closed "^ ^" eyes, shown while .kacha.happy -->
            <g class="k-happy" fill="none" stroke="#1d1b2c" stroke-width="3.2" stroke-linecap="round">
                <path d="M71 91 Q80 80 89 91"/>
                <path d="M111 91 Q120 80 129 91"/>
            </g>
            <ellipse cx="65" cy="107" rx="8" ry="5" fill="#f39aae" opacity="0.55"/>
            <ellipse cx="135" cy="107" rx="8" ry="5" fill="#f39aae" opacity="0.55"/>

            <!-- tusks, mouth, trunk -->
            <path d="M84 113 Q73 122 77 131" stroke="#fff8e7" stroke-width="5" fill="none" stroke-linecap="round"/>
            <path d="M116 113 Q127 122 123 131" stroke="#fff8e7" stroke-width="5" fill="none" stroke-linecap="round"/>
            <ellipse class="k-mouth" cx="89" cy="121" rx="5.5" ry="4.5" fill="#7a3346"/>
            <g class="k-trunk">
                <path d="M100 99 C100 115 97 127 103 135 C109 142 121 138 119 129"
                      stroke="#9ea9bb" stroke-width="16" fill="none" stroke-linecap="round"/>
                <path d="M96 101 C96 115 94 125 99 132"
                      stroke="#d3dbe6" stroke-opacity="0.55" stroke-width="3" fill="none" stroke-linecap="round"/>
                <g stroke="#7b879b" stroke-width="1.5" stroke-linecap="round">
                    <path d="M94 110 h12"/><path d="M94 117 h11"/><path d="M96 124 h10"/>
                </g>
            </g>
        </g>
    </g>
</svg>`;

class ElephantGuide {
    // host: any object with .content and .currentLang (tour or evaluation)
    // opts.key:   which content.json section holds the texts
    // opts.mode:  'panel' perches on .info-panel; 'free' is positioned by CSS
    // opts.mount: element to append to
    constructor(tour, opts = {}) {
        this.opts = Object.assign({ key: 'guide', mode: 'panel', mount: null }, opts);
        this.tour = tour;
        this.greeted = false;
        this.talking = false;
        this.tipIndex = -1;
        this.hidden = false;
        try { this.hidden = localStorage.getItem('kacha-hidden') === '1'; } catch (e) { /* storage blocked */ }
        this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.build();
        this.bind();
        this.place();
    }

    get t() {
        const g = this.tour.content && this.tour.content[this.opts.key];
        return (g && (g[this.tour.currentLang] || g.th)) || {};
    }

    build() {
        const ui = this.opts.mount || document.querySelector('.tour-ui') || document.body;

        this.root = document.createElement('div');
        this.root.className = 'kacha';
        this.root.innerHTML = `
            <div class="kacha-bubble" role="status" aria-live="polite">
                <strong class="kacha-name"></strong>
                <span class="kacha-text"></span>
            </div>
            <button class="kacha-close" type="button">×</button>
            <button class="kacha-body" type="button">${KACHA_SVG}</button>
            <div class="kacha-fx" aria-hidden="true"></div>`;
        ui.appendChild(this.root);

        this.restoreBtn = document.createElement('button');
        this.restoreBtn.type = 'button';
        this.restoreBtn.className = 'kacha-restore' + (this.opts.mode === 'panel' ? '' : ' free');
        this.restoreBtn.textContent = '🐘';
        ui.appendChild(this.restoreBtn);

        this.bubble = this.root.querySelector('.kacha-bubble');
        this.textEl = this.root.querySelector('.kacha-text');
        this.fx = this.root.querySelector('.kacha-fx');
        this.pupils = [...this.root.querySelectorAll('.k-pupil')];
        this.eyes = [...this.root.querySelectorAll('.k-eye ellipse')];

        this.applyLabels();
        this.setHidden(this.hidden, false);
    }

    applyLabels() {
        const t = this.t;
        this.root.querySelector('.kacha-name').textContent = t.name || '';
        this.root.querySelector('.kacha-body').setAttribute('aria-label', t.hint || t.name || '');
        this.root.querySelector('.kacha-close').setAttribute('aria-label', t.hide || '');
        this.root.querySelector('.kacha-close').title = t.hide || '';
        this.restoreBtn.setAttribute('aria-label', t.show || '');
        this.restoreBtn.title = t.show || '';
    }

    bind() {
        this.root.querySelector('.kacha-body').addEventListener('click', () => this.poke());
        this.root.querySelector('.kacha-close').addEventListener('click', () => this.setHidden(true));
        this.restoreBtn.addEventListener('click', () => {
            this.setHidden(false);
            this.cheer();
            this.say(this.pick(this.t.back) || this.t.greet_short || '');
        });

        // Stay perched on the narration panel whatever its size
        if (this.opts.mode === 'panel') {
            const panel = document.querySelector('.info-panel');
            if (panel && window.ResizeObserver) new ResizeObserver(() => this.place()).observe(panel);
            window.addEventListener('resize', () => this.place());
        }

        // Eyes follow the pointer
        if (!this.reduceMotion) {
            let queued = false, px = 0, py = 0;
            document.addEventListener('pointermove', (e) => {
                px = e.clientX; py = e.clientY;
                if (queued) return;
                queued = true;
                requestAnimationFrame(() => { queued = false; this.look(px, py); });
            });
        }
    }

    place() {
        if (this.opts.mode !== 'panel') return;
        const panel = document.querySelector('.info-panel');
        if (!panel) return;
        const r = panel.getBoundingClientRect();
        const w = this.root.offsetWidth || 150;
        const h = this.root.offsetHeight || 158;
        const left = Math.max(4, Math.min(window.innerWidth - w - 4, r.right - w - 10));
        const top = r.top - h + h * 0.07;
        this.root.style.left = `${left}px`;
        this.root.style.top = `${top}px`;
        this.restoreBtn.style.left = `${left + w - 52}px`;
        this.restoreBtn.style.top = `${r.top - 52}px`;
    }

    look(x, y) {
        this.eyes.forEach((eye, i) => {
            const b = eye.getBoundingClientRect();
            const dx = x - (b.left + b.width / 2);
            const dy = y - (b.top + b.height / 2);
            const d = Math.hypot(dx, dy) || 1;
            const k = Math.min(1, d / 160) * 3;
            this.pupils[i].style.transform = `translate(${(dx / d) * k}px, ${(dy / d) * k}px)`;
        });
    }

    setHidden(on, save = true) {
        this.hidden = on;
        this.root.classList.toggle('is-hidden', on);
        this.restoreBtn.classList.toggle('show', on);
        if (on) this.hideBubble();
        if (save) {
            try { localStorage.setItem('kacha-hidden', on ? '1' : '0'); } catch (e) { /* storage blocked */ }
        }
    }

    /* ---------- reactions ---------- */

    // A new scene has loaded
    arrive(location) {
        this.applyLabels();
        requestAnimationFrame(() => this.place());
        if (this.hidden) return;
        const name = (location && location.short_name) || '';
        clearTimeout(this._tipTimer);

        if (!this.greeted) {
            this.greeted = true;
            this.play('enter', 1100);
            setTimeout(() => this.burst(18, ['✦', '✧', '•']), 650);
            setTimeout(() => this.say((this.t.greet || '').replace('{name}', name), 7500), 900);
        } else {
            this.play('trumpet', 1000);
            this.burst(14, ['✦', '✧', '•']);
            this.say((this.pick(this.t.arrive) || '').replace('{name}', name), 5500);
        }

        // One friendly tip a little later, if nothing else is going on
        this._tipTimer = setTimeout(() => {
            if (!this.talking && !this.hidden && !this.bubble.classList.contains('show')) {
                this.say(this.nextTip(), 6500);
            }
        }, 22000);
    }

    setTalking(on) {
        if (this.talking === on) return;
        this.talking = on;
        this.root.classList.toggle('is-talking', on);
        clearInterval(this._noteTimer);
        if (on && !this.hidden) {
            if (!this.bubble.classList.contains('show')) this.say(this.t.talking || '', 3000);
            if (!this.reduceMotion) {
                this._noteTimer = setInterval(() => this.note(), 900);
            }
        }
    }

    poke() {
        this.play('jump', 700);
        this.burst(9, ['♥', '✦', '♥']);
        this.say(this.nextTip(), 7000);
    }

    cheer() {
        this.play('jump', 700);
        this.burst(12, ['✦', '✧', '•']);
    }

    // Closed smiling eyes for a moment
    happy(ms = 1600) {
        this.root.classList.add('happy');
        clearTimeout(this._happy);
        this._happy = setTimeout(() => this.root.classList.remove('happy'), ms);
    }

    /* ---------- helpers ---------- */

    pick(list) {
        return Array.isArray(list) && list.length ? list[Math.floor(Math.random() * list.length)] : '';
    }

    nextTip() {
        const tips = this.t.tips || [];
        if (!tips.length) return '';
        this.tipIndex = (this.tipIndex + 1 + Math.floor(Math.random() * Math.max(1, tips.length - 1))) % tips.length;
        return tips[this.tipIndex];
    }

    play(cls, ms) {
        if (this.reduceMotion) return;
        this.root.classList.remove(cls);
        void this.root.offsetWidth; // restart the animation
        this.root.classList.add(cls);
        clearTimeout(this['_' + cls]);
        this['_' + cls] = setTimeout(() => this.root.classList.remove(cls), ms);
    }

    // Speech bubble with a typewriter effect (grapheme-safe for Thai)
    say(text, ms = 6000) {
        if (!text || this.hidden) return;
        clearInterval(this._typeTimer);
        clearTimeout(this._hideTimer);
        this.bubble.classList.add('show');

        const parts = window.Intl && Intl.Segmenter
            ? [...new Intl.Segmenter(this.tour.currentLang, { granularity: 'grapheme' }).segment(text)].map(s => s.segment)
            : Array.from(text);

        if (this.reduceMotion) {
            this.textEl.textContent = text;
        } else {
            let i = 0;
            this.textEl.textContent = '';
            this._typeTimer = setInterval(() => {
                i = Math.min(parts.length, i + 2);
                this.textEl.textContent = parts.slice(0, i).join('');
                if (i >= parts.length) clearInterval(this._typeTimer);
            }, 32);
        }
        this._hideTimer = setTimeout(() => this.hideBubble(), ms + parts.length * 16);
    }

    hideBubble() {
        clearInterval(this._typeTimer);
        this.bubble.classList.remove('show');
    }

    burst(n, glyphs) {
        if (this.reduceMotion || this.hidden) return;
        for (let i = 0; i < n; i++) {
            const s = document.createElement('span');
            s.className = 'kacha-spark';
            s.textContent = glyphs[i % glyphs.length];
            const ang = (Math.PI * 2 * i) / n + Math.random() * 0.4;
            const dist = 55 + Math.random() * 45;
            s.style.setProperty('--dx', `${Math.cos(ang) * dist}px`);
            s.style.setProperty('--dy', `${Math.sin(ang) * dist - 20}px`);
            s.style.setProperty('--rot', `${Math.random() * 180 - 90}deg`);
            s.style.fontSize = `${10 + Math.random() * 10}px`;
            s.style.animationDelay = `${Math.random() * 0.12}s`;
            s.addEventListener('animationend', () => s.remove());
            this.fx.appendChild(s);
        }
    }

    note() {
        if (this.hidden) return;
        const s = document.createElement('span');
        s.className = 'kacha-note';
        s.textContent = Math.random() < 0.5 ? '♪' : '♫';
        s.style.setProperty('--drift', `${20 + Math.random() * 30}px`);
        s.addEventListener('animationend', () => s.remove());
        this.fx.appendChild(s);
    }
}

window.ElephantGuide = ElephantGuide;
