/* ============================================
   CHAN PALACE VIRTUAL TOUR - TOUR JS
   ============================================ */

/* Schematic layout of the six sites for the "Getting there" mini-map.
   x/y are positions in a 300x285 SVG canvas (not real coordinates); the
   Nan River runs down the middle, Wat Phra Si Rattana Mahathat (nodes
   1, 2, 6) sits on the east bank, the Chan Palace group (3, 4, 5) on
   the west. Edge weights are approximate walking distances in metres. */
// Bump when any file in audio/ is replaced (see audioPathFor)
const AUDIO_VERSION = 5;

const SITE_MAP = {
    viewBox: '0 0 300 285',
    nodes: {
        national_museum:           { x: 88,  y: 45  },
        wat_pra_attharos:          { x: 250, y: 55  },
        chan_palace_site:          { x: 65,  y: 135 },
        wat_phra_buddha_chinnarat: { x: 210, y: 130 },
        folk_museum:               { x: 255, y: 190 },
        naresuan_shrine:           { x: 85,  y: 235 }   // อาคารขุนพิเรนทรเทพ, inside Chan Palace
    },
    edges: [
        ['wat_phra_buddha_chinnarat', 'wat_pra_attharos', 70],
        ['wat_phra_buddha_chinnarat', 'folk_museum', 90],
        ['wat_pra_attharos', 'folk_museum', 120],
        ['wat_phra_buddha_chinnarat', 'chan_palace_site', 1300],
        ['chan_palace_site', 'national_museum', 400],
        ['chan_palace_site', 'naresuan_shrine', 150]
    ],
    // Nan River band, in the same 300x285 canvas
    river: 'M150 -5 C 165 70, 138 150, 156 210 L 170 290 L 190 290 C 172 205, 196 125, 172 60 L 165 -5 Z'
};

/* Approximate high-attendance windows (month/day) used only to nudge the
   "usually busy right now" estimate. Buddhist holy days follow the lunar
   calendar, so the dates below are rough 2026 placeholders — the panel
   always labels this as an estimate, never live data. */
const PEAK_WINDOWS = [
    { from: [1, 24], to: [2, 3],  ids: ['chan_palace_site', 'naresuan_shrine'] },   // งานแผ่นดินสมเด็จพระนเรศวรมหาราช
    { from: [2, 20], to: [3, 6],  ids: ['wat_phra_buddha_chinnarat', 'folk_museum', 'wat_pra_attharos'] }, // งานสมโภชพระพุทธชินราช
    { from: [3, 2],  to: [3, 4],  ids: ['wat_phra_buddha_chinnarat', 'folk_museum', 'wat_pra_attharos'] }, // มาฆบูชา
    { from: [5, 30], to: [6, 1],  ids: ['wat_phra_buddha_chinnarat', 'folk_museum', 'wat_pra_attharos'] }, // วิสาขบูชา
    { from: [7, 28], to: [7, 31], ids: ['wat_phra_buddha_chinnarat', 'folk_museum', 'wat_pra_attharos'] }, // อาสาฬหบูชา / เข้าพรรษา
    { from: [10, 25], to: [10, 27], ids: ['wat_phra_buddha_chinnarat', 'folk_museum', 'wat_pra_attharos'] } // ออกพรรษา
];

class TourController {
    constructor() {
        this.currentLang = 'th';
        this.currentLocationId = null;
        this.currentLayer = 'overview';
        this.content = null;
        this.synth = window.speechSynthesis;
        this.currentUtterance = null;
        this.currentAudio = null;
        this.isSpeaking = false;
        // Identifies which location/layer/language the loaded audio or
        // paused utterance belongs to, so pressing play after stop resumes
        // that same clip instead of restarting it from the beginning.
        this.speechKey = null;
        this.routeDest = null;
        this.init();
    }

    async init() {
        this.getUrlParams();
        await this.loadContent();
        this.renderSceneSelector();
        this.setupSitePanel();
        this.setupUI();
        this.setupSpeech();
        if (window.ElephantGuide) this.guide = new ElephantGuide(this);
        this.loadLocation(this.currentLocationId);
    }

    // Build the right-side scene thumbnail list from all locations in content.json
    renderSceneSelector() {
        const selector = document.querySelector('.scene-selector');
        if (!selector || !this.content) return;

        const data = this.content[this.currentLang];
        if (!data) return;

        selector.innerHTML = data.locations.map(loc => `
            <div class="scene-thumb${loc.id === this.currentLocationId ? ' active' : ''}" data-location="${loc.id}" title="${loc.short_name}">
                <img src="${loc.thumbnail}" alt="${loc.short_name}">
            </div>
        `).join('');

        selector.querySelectorAll('.scene-thumb').forEach(thumb => {
            thumb.addEventListener('click', (e) => {
                const location = e.currentTarget.dataset.location;
                this.loadLocation(location);
            });
        });
    }

    getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        this.currentLocationId = params.get('id') || 'wat_phra_buddha_chinnarat';
        this.currentLang = params.get('lang') || 'th';
    }

    async loadContent() {
        try {
            const response = await fetch('assets/data/content.json?v=' + Date.now(), { cache: 'no-store' });
            this.content = await response.json();
        } catch (error) {
            console.error('Error loading content:', error);
        }
    }

    hideLoadingScreen() {
        document.querySelector('.loading-screen')?.classList.add('hidden');
    }

    setupUI() {
        // Back button
        const backBtn = document.querySelector('a.tour-back');
        if (backBtn) {
            backBtn.href = `index.html?lang=${this.currentLang}`;
        }

        // Tab switching
        document.querySelectorAll('.info-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const layer = e.target.dataset.layer;
                this.switchLayer(layer);

                document.querySelectorAll('.info-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Speak button
        const speakBtn = document.querySelector('.btn-speak');
        if (speakBtn) {
            speakBtn.addEventListener('click', () => this.toggleSpeech());
        }

        // Scene thumbnails
        document.querySelectorAll('.scene-thumb').forEach(thumb => {
            thumb.addEventListener('click', (e) => {
                const location = e.currentTarget.dataset.location;
                this.loadLocation(location);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === '1') this.switchLayer('overview');
            if (e.key === '2') this.switchLayer('deep_dive');
            if (e.key === ' ') {
                e.preventDefault();
                this.toggleSpeech();
            }
            if (e.key === 'Escape') {
                window.location.href = `index.html?lang=${this.currentLang}`;
            }
        });
    }

    setupSpeech() {
        if (!this.synth) {
            console.warn('Web Speech API not supported');
            return;
        }

        this.synth.cancel();

        // Preload the voice list — getVoices() is populated asynchronously and
        // is usually empty on the first call, so cache it now and refresh when
        // the browser signals it is ready.
        this._voices = this.synth.getVoices() || [];
        this.synth.addEventListener('voiceschanged', () => {
            this._voices = this.synth.getVoices() || [];
        });
        let tries = 0;
        const poll = setInterval(() => {
            const v = this.synth.getVoices() || [];
            if (v.length) this._voices = v;
            if (v.length || ++tries > 20) clearInterval(poll);
        }, 150);

        // Some browsers require speech to be primed by a user gesture — fire a
        // silent utterance on the first interaction so real playback works.
        const unlock = () => {
            try {
                const u = new SpeechSynthesisUtterance(' ');
                u.volume = 0;
                this.synth.speak(u);
                this.synth.cancel();
            } catch (e) { /* ignore */ }
        };
        document.addEventListener('pointerdown', unlock, { once: true });
    }

    pickVoice(langPrefix) {
        const voices = this._voices || this.synth.getVoices() || [];
        const norm = s => (s || '').toLowerCase().replace('_', '-');
        return voices.find(v => norm(v.lang).startsWith(langPrefix))
            || voices.find(v => /thai|ไทย/i.test(v.name) && langPrefix === 'th')
            || null;
    }

    setSpeakingUI(on) {
        this.isSpeaking = on;
        this.guide?.setTalking(on);
        const btn = document.querySelector('.btn-speak');
        if (!btn) return;
        btn.classList.toggle('speaking', on);
        const span = btn.querySelector('span');
        if (span) span.textContent = this.getUIText(on ? 'stop' : 'play');
    }

    showSpeechNotice(msg) {
        let el = document.querySelector('.speak-note');
        if (!el) {
            el = document.createElement('p');
            el.className = 'speak-note';
            document.querySelector('.info-panel')?.appendChild(el);
        }
        el.textContent = msg;
        el.hidden = false;
        clearTimeout(this._noteTimer);
        this._noteTimer = setTimeout(() => { el.hidden = true; }, 10000);
    }

    loadLocation(locationId) {
        if (!this.content || !locationId) return;

        const data = this.content[this.currentLang];
        const location = data.locations.find(l => l.id === locationId);
        if (!location) return;

        this.currentLocationId = locationId;

        // Decide how to show the image. A wide image (roughly panoramic, ratio
        // >= 1.7) is wrapped on the sky sphere for a look-around view; anything
        // else is shown as a framed photo pinned in front of the camera, over a
        // plain dark sky.
        const sky = document.querySelector('#vr-sky');
        const flat = document.querySelector('#flat-photo');
        // Desktop GPUs get the full-resolution panorama from img/pano_hd/;
        // phones keep the 4096px version (many can't load wider textures).
        const sdSrc = location.image_360;
        const hdSrc = sdSrc && sdSrc.includes('/pano/') ? sdSrc.replace('/pano/', '/pano_hd/') : null;
        let src = (hdSrc && this.canUseHD()) ? hdSrc : sdSrc;
        if (sky) sky.removeAttribute('animation');

        const probe = new Image();
        probe.onload = () => {
            const ratio = probe.naturalWidth / probe.naturalHeight;
            // A real 360 panorama is both wide (≈ 2:1) and large; a small wide
            // thumbnail is not a panorama and would just smear on the sphere.
            const isPano = ratio >= 1.7 && probe.naturalWidth >= 2000;

            if (sky) {
                sky.setAttribute('material', 'opacity', 1);
                // Optional per-scene turn so the visitor starts facing the
                // main subject (degrees; content.json "sky_rotation")
                sky.setAttribute('rotation', `0 ${location.sky_rotation || 0} 0`);
                if (isPano) {
                    sky.setAttribute('material', 'src', src);
                    sky.setAttribute('material', 'color', '#ffffff');
                } else {
                    sky.setAttribute('material', 'src', '');
                    sky.setAttribute('material', 'color', '#0b0b10');
                }
            }
            if (flat) {
                if (isPano) {
                    flat.setAttribute('visible', 'false');
                } else {
                    const h = 3.6, w = +(h * ratio).toFixed(2);
                    flat.setAttribute('width', w);
                    flat.setAttribute('height', h);
                    flat.setAttribute('src', src);
                    flat.setAttribute('visible', 'true');
                }
            }
            this.hideLoadingScreen();
        };
        probe.onerror = () => {
            // No HD file for this scene: fall back to the regular panorama
            if (src === hdSrc && sdSrc) {
                src = sdSrc;
                probe.src = src;
                return;
            }
            if (sky) sky.setAttribute('material', 'src', src);
            this.hideLoadingScreen();
        };
        probe.src = src;

        // Safety net: never leave the loading screen stuck even if the image is slow/fails
        setTimeout(() => this.hideLoadingScreen(), 4000);

        // Update title
        const title = document.querySelector('.tour-title');
        if (title) title.textContent = location.name.replace(/\n/g, ' ');

        // Arriving at a place always starts on the brief "overview" layer —
        // the in-depth layer is something a visitor chooses on their own.
        this.currentLayer = 'overview';
        document.querySelectorAll('.info-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.layer === 'overview');
        });

        // Update info panel
        this.updateInfoPanel(location);

        // Update active thumbnail
        document.querySelectorAll('.scene-thumb').forEach(t => {
            t.classList.toggle('active', t.dataset.location === locationId);
        });

        // Refresh the left-hand site info panel (hours, sacred days, route map)
        this.routeDest = null;
        this.busyDay = null;
        this.renderSitePanel(location);
        this.guide?.arrive(location);

        // Auto-play the brief overview narration on arrival. This is not a
        // direct user click, so browsers may block it (no prior interaction
        // on this page) — startSpeech()/startBrowserSpeech() already fail
        // silently in that case, and the visitor can still press "play" or
        // switch to "เจาะลึก" (deep dive) themselves at any time.
        this.startSpeech();

        // Update URL
        const url = new URL(window.location);
        url.searchParams.set('id', locationId);
        window.history.replaceState({}, '', url);
    }

    /* ---------- Left-hand Site Info panel ---------- */

    setupSitePanel() {
        const panel = document.querySelector('#sitePanel');
        if (!panel) return;

        // On phones there isn't room for the panel and the bottom info
        // panel to be open at once, so start collapsed; the visitor can
        // still tap the tab to expand it.
        if (window.innerWidth <= 480) panel.classList.add('collapsed');

        // Collapse / expand the whole panel
        panel.querySelector('.site-panel-toggle')?.addEventListener('click', () => {
            panel.classList.toggle('collapsed');
        });

        // Accordion sections
        panel.querySelectorAll('.acc-head').forEach(head => {
            head.addEventListener('click', () => {
                head.closest('.acc-item')?.classList.toggle('open');
            });
        });

        // Clicks on a map marker -> show the route to that site
        panel.querySelector('.route-map')?.addEventListener('click', (e) => {
            const node = e.target.closest('[data-id]');
            if (node) this.selectRoute(node.dataset.id);
        });

        // Weekday tabs on the popular-times chart
        panel.addEventListener('click', (e) => {
            const tab = e.target.closest('.pt-day');
            if (!tab) return;
            this.busyDay = Number(tab.dataset.day);
            this.refreshBusy();
        });

        // Keep the "usually busy" estimate fresh as time passes
        if (!this._busyTimer) {
            this._busyTimer = setInterval(() => this.refreshBusy(), 60000);
        }
    }

    placeInfo(location) {
        return (this.content.site_info && this.content.site_info.places[location.id]) || {};
    }

    // Hours shown on the popular-times chart: the opening hours, or
    // 06–23 for a site that never closes (as Google Maps does)
    chartHours(location) {
        const o = this.placeInfo(location).open || { from: 8, to: 18 };
        const from = o.to - o.from >= 24 ? 6 : o.from;
        const to = o.to - o.from >= 24 ? 24 : o.to;
        const hours = [];
        for (let h = from; h < to; h++) hours.push(h);
        return hours;
    }

    // Typical busyness 0–100 for one weekday/hour. Uses Google Maps
    // "popular times" values copied into content.json when we have them
    // for that weekday; otherwise falls back to a rough model.
    popularAt(location, day, hour) {
        const P = this.placeInfo(location);
        const g = P.popular && P.popular[day];
        if (g) {
            const v = g.values[hour - g.from];
            return { value: typeof v === 'number' ? v : 0, google: true };
        }
        const o = P.open || {};
        const crowd = typeof o.crowd === 'number' ? o.crowd : 0.5;
        const dayF = (day === 0 || day === 6) ? 1.35 : (day === 5 ? 1.1 : 1);
        const shape = 0.2 + 0.8 * Math.max(
            Math.exp(-(((hour - 10.5) / 2.4) ** 2)),
            0.85 * Math.exp(-(((hour - 16) / 1.8) ** 2)));
        const night = (hour < 6 || hour >= 20) ? 0.25 : 1;
        return { value: Math.round(Math.min(100, crowd * dayF * shape * night * 75)), google: false };
    }

    isPeakToday(location, now) {
        const md = (now.getMonth() + 1) * 100 + now.getDate();
        return PEAK_WINDOWS.some(w => {
            if (!w.ids.includes(location.id)) return false;
            const from = w.from[0] * 100 + w.from[1];
            const to = w.to[0] * 100 + w.to[1];
            return from <= to ? (md >= from && md <= to) : (md >= from || md <= to);
        });
    }

    // "How busy is it usually right now" (never live data)
    estimateBusyness(location) {
        const o = this.placeInfo(location).open;
        const now = new Date();
        const day = now.getDay();
        const hour = now.getHours() + now.getMinutes() / 60;

        if (o) {
            const openToday = (o.days || [0, 1, 2, 3, 4, 5, 6]).includes(day);
            if (!openToday || hour < o.from || hour >= o.to) return { closed: true };
        }

        const { value } = this.popularAt(location, day, now.getHours());
        let level;
        if (this.isPeakToday(location, now)) level = 3;
        else if (value >= 55) level = 2;
        else if (value >= 30) level = 1;
        else level = 0;
        return { closed: false, level };
    }

    busyHTML(location) {
        const L = this.siteLabels();
        const b = this.estimateBusyness(location);
        const names = L.busy_levels || [];
        const pill = b.closed
            ? `<span class="busy-pill closed">${L.busy_closed || ''}</span>`
            : `<span class="busy-pill lvl-${b.level}">${names[b.level] || ''}</span>`;

        const now = new Date();
        const today = now.getDay();
        const day = (this.busyDay ?? today);
        const dayNames = L.day_short || [];

        // Real calendar dates for this week (Mon–Sun); Thai shows the
        // Buddhist-era year (พ.ศ.), which th-TH formats by default
        const locale = { th: 'th-TH', en: 'en-GB', zh: 'zh-CN' }[this.currentLang] || 'th-TH';
        const dateOf = (d) => {
            const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            dt.setDate(dt.getDate() - ((today + 6) % 7) + ((d + 6) % 7));
            return dt;
        };
        const fullDate = dateOf(day).toLocaleDateString(locale, {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            ...(locale === 'th-TH' ? { era: 'short' } : {})
        });

        const tabs = [1, 2, 3, 4, 5, 6, 0].map(d =>
            `<button type="button" class="pt-day${d === day ? ' on' : ''}${d === today ? ' today' : ''}" data-day="${d}">
                <span>${dayNames[d] || d}</span><span class="pt-date">${dateOf(d).getDate()}</span>
            </button>`
        ).join('');

        // Selected weekday is a closing day (e.g. Mondays): no bars
        const openDays = (this.placeInfo(location).open || {}).days;
        const closedDay = Array.isArray(openDays) && !openDays.includes(day);

        let google = false;
        const bars = closedDay ? `<p class="pt-closed">${L.closed_day || ''}</p>` : this.chartHours(location).map(h => {
            const p = this.popularAt(location, day, h);
            google = google || p.google;
            const isNow = day === today && h === now.getHours();
            const height = Math.max(4, p.value);
            return `<div class="pt-col${isNow ? ' now' : ''}" title="${String(h).padStart(2, '0')}:00">
                ${isNow ? `<span class="pt-now">${L.now || ''}</span>` : ''}
                <span class="pt-bar" style="height:${height}%"></span>
                <span class="pt-hour">${h % 3 === 0 ? String(h).padStart(2, '0') : ''}</span>
            </div>`;
        }).join('');

        return `<div class="busy">
            <div class="busy-row">
                <span class="busy-label">${L.busy_title || ''}</span>
                ${pill}
            </div>
            <p class="pt-title">${L.popular_title || ''}</p>
            <div class="pt-days">${tabs}</div>
            <p class="pt-full">${fullDate}</p>
            <div class="pt-chart">${bars}</div>
            <p class="busy-note muted">${google ? (L.busy_note_google || '') : (L.busy_note || '')}</p>
        </div>`;
    }

    renderHoursBody(location) {
        const hoursBody = document.querySelector('#sitePanel [data-body="hours"]');
        if (!hoursBody || !this.content.site_info) return;
        const lang = this.currentLang;
        const P = this.content.site_info.places[location.id] || {};
        const L = this.siteLabels();
        const hours = P.hours ? P.hours[lang] : '';
        const closed = P.closed ? P.closed[lang] : '';
        hoursBody.innerHTML =
            `<p class="kv"><strong>${hours}</strong></p>` +
            (closed ? `<p class="kv muted">${L.closed_prefix || ''}${closed}</p>` : '') +
            this.busyHTML(location);
    }

    refreshBusy() {
        const loc = this.getCurrentLocation();
        if (loc && document.querySelector('#sitePanel')) this.renderHoursBody(loc);
    }

    siteLabels() {
        return (this.content.site_info && this.content.site_info.labels[this.currentLang]) || {};
    }

    nodeNumber(id) {
        const data = this.content[this.currentLang];
        return data.locations.findIndex(l => l.id === id) + 1;
    }

    renderSitePanel(location) {
        const panel = document.querySelector('#sitePanel');
        const info = this.content.site_info;
        if (!panel || !info) return;

        const L = this.siteLabels();
        const P = info.places[location.id] || {};
        const lang = this.currentLang;

        panel.querySelector('.site-panel-title').textContent = L.panel_title || '';
        const setLabel = (acc, text) => {
            const el = panel.querySelector(`.acc-item[data-acc="${acc}"] .acc-label`);
            if (el) el.textContent = text || '';
        };
        setLabel('hours', L.hours);
        setLabel('events', L.events);
        setLabel('route', L.route);
        panel.querySelector('.site-note').textContent = L.verify_note || '';

        // Hours + "usually busy right now" estimate
        this.renderHoursBody(location);

        // Sacred days / festivals
        const evBody = panel.querySelector('[data-body="events"]');
        if (evBody) {
            const items = (P.events || []).map(ev => {
                const name = ev.name ? ev.name[lang] : '';
                const when = ev.when ? ev.when[lang] : '';
                const nameHtml = name && name !== '—' ? `<span class="ev-name">${name}</span>` : '';
                return `<li>${nameHtml}<span class="ev-when">${when}</span></li>`;
            }).join('');
            evBody.innerHTML = `<ul class="ev-list">${items}</ul>`;
        }

        // Route map
        this.drawRouteMap();
        this.renderRouteInfo();
    }

    drawRouteMap() {
        const wrap = document.querySelector('#sitePanel .route-map');
        if (!wrap || !this.content) return;

        const cur = this.currentLocationId;
        const dest = this.routeDest;
        const path = dest ? this.shortestPath(cur, dest) : [];
        const inPath = new Set(path);
        const edgeOn = (a, b) => {
            for (let i = 0; i < path.length - 1; i++) {
                if ((path[i] === a && path[i + 1] === b) || (path[i] === b && path[i + 1] === a)) return true;
            }
            return false;
        };

        const L = this.siteLabels();
        const locs = this.content[this.currentLang].locations;
        const N = SITE_MAP.nodes;
        const fmtDist = (m) => m >= 1000 ? (m / 1000).toFixed(1) + ' km' : m + ' m';

        // Roads, plus the highlighted route and its distance chips
        let roads = '', route = '', chips = '', bridge = '';
        SITE_MAP.edges.forEach(([a, b, w]) => {
            const p = N[a], q = N[b];
            const d = `M${p.x} ${p.y} L${q.x} ${q.y}`;
            roads += `<path d="${d}" class="rm-road"/>`;
            if (a === 'wat_phra_buddha_chinnarat' && b === 'chan_palace_site') {
                // Bridge deck where this road crosses the river
                const t = (p.x - 163) / (p.x - q.x);
                const by = p.y + (q.y - p.y) * t;
                const ang = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI;
                bridge = `<g transform="translate(163 ${by.toFixed(1)}) rotate(${ang.toFixed(1)})">
                    <rect x="-17" y="-5.5" width="34" height="11" rx="2.5" class="rm-bridge"/>
                    <line x1="-15" y1="-5.5" x2="15" y2="-5.5" class="rm-rail"/>
                    <line x1="-15" y1="5.5" x2="15" y2="5.5" class="rm-rail"/>
                </g>`;
            }
            if (edgeOn(a, b)) {
                route += `<path d="${d}" class="rm-route-glow"/><path d="${d}" class="rm-route"/>`;
                const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2;
                const txt = fmtDist(w);
                const cw = txt.length * 5.6 + 10;
                chips += `<g class="rm-chip" transform="translate(${mx.toFixed(1)} ${my.toFixed(1)})">
                    <rect x="${-cw / 2}" y="-8" width="${cw}" height="16" rx="8"/>
                    <text y="3.5">${txt}</text>
                </g>`;
            }
        });

        // Pins; the current and destination sites also get a name label
        let names = '';
        const nodes = Object.entries(N).map(([id, p]) => {
            const cls = ['rm-node'];
            if (id === cur) cls.push('cur');
            else if (id === dest) cls.push('dest');
            else if (inPath.has(id)) cls.push('on');
            const pulse = id === cur
                ? `<circle cx="${p.x}" cy="${p.y}" r="13" class="rm-pulse">
                       <animate attributeName="r" values="13;24" dur="1.8s" repeatCount="indefinite"/>
                       <animate attributeName="opacity" values="0.7;0" dur="1.8s" repeatCount="indefinite"/>
                   </circle>`
                : '';
            if (id === cur || id === dest) {
                const loc = locs.find(l => l.id === id);
                if (loc) names += `<text x="${p.x}" y="${p.y + 28}" class="rm-name${id === dest ? ' dest' : ''}">${loc.short_name}</text>`;
            }
            return `<g class="${cls.join(' ')}" data-id="${id}">
                ${pulse}
                <circle cx="${p.x}" cy="${p.y}" r="17" class="rm-hit"/>
                <circle cx="${p.x}" cy="${p.y}" r="12.5" class="rm-dot"/>
                <text x="${p.x}" y="${p.y + 4.2}">${this.nodeNumber(id)}</text>
            </g>`;
        }).join('');

        wrap.innerHTML =
            `<svg viewBox="${SITE_MAP.viewBox}" class="route-svg" role="img" aria-label="${L.route || ''}">
                <defs>
                    <pattern id="rmDots" width="12" height="12" patternUnits="userSpaceOnUse">
                        <circle cx="1.5" cy="1.5" r="0.8" fill="rgba(244,228,188,0.10)"/>
                    </pattern>
                    <linearGradient id="rmWater" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0" stop-color="#2f6f99" stop-opacity="0.55"/>
                        <stop offset="0.5" stop-color="#4f9fcf" stop-opacity="0.75"/>
                        <stop offset="1" stop-color="#2f6f99" stop-opacity="0.55"/>
                    </linearGradient>
                    <radialGradient id="rmZone">
                        <stop offset="0" stop-color="#d4af37" stop-opacity="0.16"/>
                        <stop offset="1" stop-color="#d4af37" stop-opacity="0"/>
                    </radialGradient>
                </defs>
                <rect width="300" height="285" fill="url(#rmDots)"/>
                <ellipse cx="78" cy="148" rx="72" ry="138" fill="url(#rmZone)"/>
                <ellipse cx="238" cy="122" rx="68" ry="110" fill="url(#rmZone)"/>
                <text x="18" y="18" class="rm-zone">${L.map_west || ''}</text>
                <text x="282" y="18" class="rm-zone end">${L.map_east || ''}</text>
                <path d="${SITE_MAP.river}" class="rm-river"/>
                <path d="M157 -5 C 172 70, 145 150, 163 210 L 179 290" class="rm-wave"/>
                <text transform="translate(172 244) rotate(-80)" class="rm-river-label">${L.map_river || ''}</text>
                ${roads}${bridge}${route}${nodes}${chips}${names}
                <g class="rm-compass" transform="translate(283 262)">
                    <circle r="11"/>
                    <path d="M0 -8 L3.2 1 L0 -0.8 L-3.2 1 Z" class="n"/>
                    <path d="M0 8 L3.2 -1 L0 0.8 L-3.2 -1 Z"/>
                    <text y="-13.5">N</text>
                </g>
            </svg>`;
    }

    renderRouteInfo() {
        const box = document.querySelector('#sitePanel .route-info');
        if (!box) return;
        const L = this.siteLabels();

        if (!this.routeDest || this.routeDest === this.currentLocationId) {
            box.innerHTML = `<p class="muted">${L.pick_dest || ''}</p>`;
            return;
        }

        const data = this.content[this.currentLang];
        const from = data.locations.find(l => l.id === this.currentLocationId);
        const to = data.locations.find(l => l.id === this.routeDest);
        const metres = this.pathDistance(this.currentLocationId, this.routeDest);
        const mins = Math.max(1, Math.round(metres / 75));
        const dist = metres >= 1000 ? (metres / 1000).toFixed(1) + ' km' : metres + ' m';

        box.innerHTML =
            `<p class="route-od"><span class="rm-badge">${this.nodeNumber(from.id)}</span> ${from.short_name}
                <span class="route-arrow">→</span>
                <span class="rm-badge dest">${this.nodeNumber(to.id)}</span> ${to.short_name}</p>
            <p class="route-stat">${L.approx || ''} ${dist} &nbsp;•&nbsp; ${L.walk || ''} ~${mins} ${L.min || ''}</p>
            <button class="route-go" type="button">${L.enter_scene || ''} →</button>`;

        box.querySelector('.route-go')?.addEventListener('click', () => this.loadLocation(this.routeDest));
    }

    selectRoute(destId) {
        this.routeDest = (destId === this.currentLocationId) ? null : destId;
        this.drawRouteMap();
        this.renderRouteInfo();
    }

    // Dijkstra over SITE_MAP.edges
    shortestPath(from, to) {
        const adj = {};
        SITE_MAP.edges.forEach(([a, b, w]) => {
            (adj[a] = adj[a] || []).push([b, w]);
            (adj[b] = adj[b] || []).push([a, w]);
        });
        const dist = {}, prev = {}, queue = new Set(Object.keys(SITE_MAP.nodes));
        queue.forEach(n => dist[n] = Infinity);
        dist[from] = 0;
        while (queue.size) {
            let u = null;
            queue.forEach(n => { if (u === null || dist[n] < dist[u]) u = n; });
            queue.delete(u);
            if (u === to || dist[u] === Infinity) break;
            (adj[u] || []).forEach(([v, w]) => {
                if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; prev[v] = u; }
            });
        }
        const path = [];
        for (let n = to; n != null; n = prev[n]) path.unshift(n);
        return path[0] === from ? path : [];
    }

    pathDistance(from, to) {
        const path = this.shortestPath(from, to);
        let total = 0;
        for (let i = 0; i < path.length - 1; i++) {
            const e = SITE_MAP.edges.find(([a, b]) =>
                (a === path[i] && b === path[i + 1]) || (b === path[i] && a === path[i + 1]));
            if (e) total += e[2];
        }
        return total;
    }

    updateInfoPanel(location) {
        const layer = this.currentLayer === 'overview' ? location.overview : location.deep_dive;

        const content = document.querySelector('.info-content');
        if (content) {
            content.style.opacity = '0';
            setTimeout(() => {
                content.textContent = layer.text;
                content.style.opacity = '1';
            }, 200);
        }

        const duration = document.querySelector('.duration-badge span');
        if (duration) duration.textContent = layer.duration;

        // Replace the hand-typed duration with the narration file's real
        // length, so the badge stays right whenever the audio is re-recorded
        const audioPath = this.audioPathFor(location, this.currentLayer);
        this._durationKey = audioPath;
        const probe = new Audio();
        probe.preload = 'metadata';
        probe.addEventListener('loadedmetadata', () => {
            if (this._durationKey !== audioPath || !isFinite(probe.duration) || !duration) return;
            duration.textContent = this.formatDuration(probe.duration);
        });
        probe.src = audioPath;

        // Update tab labels
        const data = this.content[this.currentLang];
        const tabs = document.querySelectorAll('.info-tab');
        if (tabs[0]) tabs[0].textContent = data.ui.overview;
        if (tabs[1]) tabs[1].textContent = data.ui.deep_dive;
    }

    // Full-resolution panoramas only on desktop-class GPUs (texture limit
    // of 8192px or more); phones and tablets stay on the 4096px version.
    canUseHD() {
        if (this._canUseHD !== undefined) return this._canUseHD;
        let ok = false;
        try {
            if (!/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
                const gl = document.createElement('canvas').getContext('webgl');
                ok = !!gl && gl.getParameter(gl.MAX_TEXTURE_SIZE) >= 8192;
            }
        } catch (e) { ok = false; }
        this._canUseHD = ok;
        return ok;
    }

    // Narration file for a location/layer. A location may name its own files
    // in content.json ("audio": { "overview": "...", "deep_dive": "..." },
    // relative to audio/<lang>/); otherwise the default <id>_<layer>.mp3.
    // AUDIO_VERSION is appended so browsers fetch a replaced mp3 instead of
    // replaying the old cached copy — bump it whenever a narration file changes.
    audioPathFor(location, layer) {
        const file = (location.audio && location.audio[layer]) || `${location.id}_${layer}.mp3`;
        return `audio/${this.currentLang}/${file}?v=${AUDIO_VERSION}`;
    }

    formatDuration(seconds) {
        const s = Math.max(1, Math.round(seconds));
        const m = Math.floor(s / 60), r = s % 60;
        const f = {
            th: [`${r} วินาที`, `${m} นาที`, `${m} นาที ${r} วินาที`],
            en: [`${r} sec`, `${m} min`, `${m} min ${r} sec`],
            zh: [`${r}秒`, `${m}分钟`, `${m}分${r}秒`]
        }[this.currentLang] || [];
        return m === 0 ? f[0] : (r === 0 ? f[1] : f[2]);
    }

    switchLayer(layer) {
        this.currentLayer = layer;
        const location = this.getCurrentLocation();
        if (location) {
            this.updateInfoPanel(location);
            this.stopSpeech();
        }
    }

    getCurrentLocation() {
        if (!this.content) return null;
        const data = this.content[this.currentLang];
        return data.locations.find(l => l.id === this.currentLocationId);
    }

    toggleSpeech() {
        if (this.isSpeaking) {
            this.pauseSpeech();
        } else {
            this.startSpeech();
        }
    }

    startSpeech() {
        const location = this.getCurrentLocation();
        if (!location) return;

        // Try the pre-generated narration file first, for every language:
        //   audio/<lang>/<locationId>_<layer>.mp3
        // (th = Microsoft Edge "Premwadee" neural voice; en/zh = Sia AI.)
        // If the file is missing, we fall back to the browser's speech engine.
        const audioPath = this.audioPathFor(location, this.currentLayer);

        // Resume exactly where the visitor left off if they paused this same
        // clip, instead of restarting it from the beginning.
        if (this.speechKey === audioPath) {
            if (this.currentAudio && !this.currentAudio.ended) {
                this.currentAudio.play().catch(e => this.onPlayRejected(e, this.currentAudio, location));
                return;
            }
            if (this.synth && this.synth.paused) {
                this.synth.resume();
                this.setSpeakingUI(true);
                clearInterval(this._resumeTimer);
                this._resumeTimer = setInterval(() => {
                    if (this.synth.speaking) this.synth.resume();
                    else clearInterval(this._resumeTimer);
                }, 6000);
                return;
            }
        }

        // Different clip (or nothing to resume) — stop whatever's playing
        // and start this one from the beginning.
        this.stopSpeech();
        this.speechKey = audioPath;

        const audio = this.currentAudio = new Audio(audioPath);

        this.currentAudio.addEventListener('playing', () => {
            this.isSpeaking = true;
            const btn = document.querySelector('.btn-speak');
            if (btn) {
                btn.classList.add('speaking');
                const span = btn.querySelector('span');
                if (span) span.textContent = this.getUIText('stop');
            }
        });

        this.currentAudio.addEventListener('ended', () => {
            this.isSpeaking = false;
            const btn = document.querySelector('.btn-speak');
            if (btn) {
                btn.classList.remove('speaking');
                const span = btn.querySelector('span');
                if (span) span.textContent = this.getUIText('play');
            }
        });

        // If the mp3 file doesn't exist yet (e.g. not generated for this
        // location/layer/language), fall back to the browser's built-in voice
        // so playback never silently fails.
        // Only for this clip while it is still the current one — a clip that
        // was stopped or replaced must never start the (male) browser voice.
        audio.addEventListener('error', () => {
            if (this.currentAudio !== audio) return;
            console.warn(`ไม่พบไฟล์เสียง ${audioPath} — ใช้เสียงเบราว์เซอร์แทนชั่วคราว`);
            this.startBrowserSpeech(location);
        });

        audio.play().catch(e => this.onPlayRejected(e, audio, location));
    }

    // play() rejects when the clip is paused/replaced before it starts
    // (AbortError) or when autoplay is blocked (NotAllowedError). Neither
    // means the file is missing, so don't fall back to the browser voice —
    // a genuinely missing file is handled by the 'error' listener.
    onPlayRejected(e, audio, location) {
        if (this.currentAudio !== audio) return;
        if (e && (e.name === 'AbortError' || e.name === 'NotAllowedError')) {
            this.setSpeakingUI(false);
            return;
        }
        if (audio.error) return; // the 'error' listener already handled it
        this.startBrowserSpeech(location);
    }

    // Browser's built-in Web Speech API. Fallback for any language when the
    // pre-generated narration file for that location/layer is missing.
    startBrowserSpeech(location) {
        if (!this.synth) return;

        const layer = this.currentLayer === 'overview' ? location.overview : location.deep_dive;
        // Read exactly what is shown on screen so audio and caption match
        const text = layer.text || layer.audio_text;
        const langFull = { th: 'th-TH', en: 'en-US', zh: 'zh-CN' }[this.currentLang] || 'th-TH';
        const langPrefix = langFull.slice(0, 2);

        // Hard stop, then wait a beat: Chrome silently drops speak() when it is
        // called in the same tick as cancel().
        this.synth.cancel();
        clearInterval(this._resumeTimer);

        setTimeout(() => {
            const voice = this.pickVoice(langPrefix);

            if (this.currentLang === 'th' && !voice) {
                this.showSpeechNotice('เบราว์เซอร์นี้ยังไม่มีเสียงพากย์ภาษาไทย — ติดตั้งภาษาไทยใน Windows (Settings ▸ Time & language ▸ Language ▸ เพิ่มไทย ▸ Speech) แล้วรีสตาร์ตเบราว์เซอร์ หรือลองใช้ Microsoft Edge');
                this.setSpeakingUI(false);
                return;
            }

            const u = new SpeechSynthesisUtterance(text);
            u.lang = voice ? voice.lang : langFull;
            if (voice) u.voice = voice;
            u.rate = 0.95;
            u.pitch = 1;
            u.volume = 1;
            u.onstart = () => this.setSpeakingUI(true);
            u.onend = () => { this.setSpeakingUI(false); clearInterval(this._resumeTimer); };
            u.onerror = (e) => {
                clearInterval(this._resumeTimer);
                this.setSpeakingUI(false);
                if (e.error && e.error !== 'interrupted' && e.error !== 'canceled') {
                    console.warn('speech error:', e.error);
                }
            };
            this.currentUtterance = u;
            this.synth.speak(u);

            // Chrome cuts utterances longer than ~15s unless nudged.
            this._resumeTimer = setInterval(() => {
                if (this.synth.speaking) this.synth.resume();
                else clearInterval(this._resumeTimer);
            }, 6000);
        }, 130);
    }

    // Pauses playback in place (from the "stop" button) so pressing play
    // again resumes from this exact position, via the speechKey check in
    // startSpeech().
    pauseSpeech() {
        clearInterval(this._resumeTimer);
        if (this.currentAudio) {
            this.currentAudio.pause();
        }
        if (this.synth && this.synth.speaking) {
            this.synth.pause();
        }
        this.setSpeakingUI(false);
    }

    // Fully stops and discards playback — used when switching location or
    // layer (a different clip should never "resume" as if it were this one)
    // and on page unload.
    stopSpeech() {
        clearInterval(this._resumeTimer);
        this.speechKey = null;
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
        }
        if (this.synth) {
            this.synth.cancel();
        }
        this.setSpeakingUI(false);
    }

    getUIText(key) {
        const map = {
            'th': { play: '▶ ฟังเสียงบรรยาย', stop: '⏹ หยุดเล่น' },
            'en': { play: '▶ Play Audio', stop: '⏹ Stop' },
            'zh': { play: '▶ 播放讲解', stop: '⏹ 停止' }
        };
        return (map[this.currentLang] || map['th'])[key];
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.tourController = new TourController();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.tourController) {
        window.tourController.stopSpeech();
    }
});