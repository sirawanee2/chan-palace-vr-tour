/* ============================================
   HOME PAGE v2 — renders chapters, timeline and stats from
   content.json, plus the intro doors, 360 panning, reveal and tilt.
   ============================================ */

const T = {
    th: {
        nav_sites: 'สถานที่', nav_timeline: 'เส้นทางประวัติศาสตร์', nav_eval: 'ประเมินผล',
        eyebrow: 'VIRTUAL HERITAGE · 360°',
        hero_title: 'มรดกโบราณสถาน พิษณุโลก',
        hero_sub: 'ก้าวเข้าสู่ดินแดนสองแคว เมืองพระพุทธชินราชและแผ่นดินเกิดสมเด็จพระนเรศวรมหาราช ผ่านภาพเสมือนจริง 360 องศา พร้อมเสียงบรรยายสามภาษา',
        start: 'เริ่มการนำชม', explore: 'สำรวจทั้ง 6 สถานที่', turning: 'ของดีอยู่ข้างล่าง เลื่อนเลย',
        sites_kicker: 'SIX SACRED PLACES', sites_title: 'หกสถานที่ หนึ่งการเดินทาง',
        sites_desc: 'จากวิหารพระพุทธชินราชริมแม่น้ำน่าน ข้ามฝั่งสู่พระราชวังจันทน์ ดินแดนที่สมเด็จพระนเรศวรทรงประสูติ',
        chapter: 'บทที่', enter: 'เข้าชมแบบ 360°', langs3: 'บรรยาย 3 ภาษา',
        tl_kicker: '670 YEARS OF HISTORY', tl_title: 'เส้นทางแห่งกาลเวลา',
        stats: ['สถานที่สำคัญ', 'องศา มองได้รอบทิศ', 'ภาษาบรรยาย', 'คลิปเสียงบรรยาย'],
        fin_title: 'พร้อมออกเดินทางแล้วหรือยัง',
        fin_text: 'ให้น้องคชา ช้างศึกน้อยแห่งพิษณุโลก พาคุณเที่ยวครบทั้งหกสถานที่ ได้ทุกที่ ทุกเวลา',
        footer: 'ระบบนำชมเสมือนจริงมรดกโบราณสถานเมืองพิษณุโลก · มหาวิทยาลัยราชภัฏพิบูลสงคราม',
        ribbon: ['พิษณุโลก', 'สองแคว', 'พระพุทธชินราช', 'พระราชวังจันทน์', 'สมเด็จพระนเรศวรมหาราช', 'วัดใหญ่', 'แม่น้ำน่าน'],
        year: (be) => `พ.ศ. ${be}`,
        timeline: [
            [1900, 'หล่อพระพุทธชินราช', 'ในรัชสมัยพระมหาธรรมราชาที่ 1 (พระยาลิไท) แห่งกรุงสุโขทัย'],
            [2098, 'สมเด็จพระนเรศวรประสูติ', 'ณ พระราชวังจันทน์ เมืองพิษณุโลก'],
            [2127, 'ประกาศอิสรภาพ', 'ที่เมืองแครง ไม่ขึ้นต่อกรุงหงสาวดีอีกต่อไป'],
            [2368, 'อัญเชิญพระอัฏฐารส', 'จากวัดวิหารทองสู่วัดสระเกศ กรุงเทพฯ ในรัชกาลที่ 3'],
            [2467, 'สร้างอาคารขุนพิเรนทรเทพ', 'ที่ทำการสำนักงานป่าไม้ภาคพิษณุโลก ในเขตพระราชวังจันทน์'],
            [2569, 'เยือนได้ทุกที่ ทุกเวลา', 'ระบบนำชมเสมือนจริง 360° พร้อมเสียงบรรยายสามภาษา']
        ]
    },
    en: {
        nav_sites: 'Sites', nav_timeline: 'Timeline', nav_eval: 'Evaluation',
        eyebrow: 'VIRTUAL HERITAGE · 360°',
        hero_title: 'Phitsanulok Heritage',
        hero_sub: 'Step into Song Khwae, home of Phra Buddha Chinnarat and birthplace of King Naresuan the Great, through immersive 360° views with narration in three languages.',
        start: 'Start the tour', explore: 'Explore all 6 sites', turning: 'The good stuff is down here',
        sites_kicker: 'SIX SACRED PLACES', sites_title: 'Six places, one journey',
        sites_desc: 'From the Chinnarat hall beside the Nan River to Chan Palace, where King Naresuan was born.',
        chapter: 'Chapter', enter: 'Enter in 360°', langs3: 'Narrated in 3 languages',
        tl_kicker: '670 YEARS OF HISTORY', tl_title: 'A journey through time',
        stats: ['Heritage sites', 'Degrees of view', 'Languages', 'Narration clips'],
        fin_title: 'Ready to begin?',
        fin_text: 'Let Kacha, the little war elephant of Phitsanulok, guide you through all six sites, anytime, anywhere.',
        footer: 'Phitsanulok Heritage Sites Virtual Tour · Pibulsongkram Rajabhat University',
        ribbon: ['Phitsanulok', 'Song Khwae', 'Phra Buddha Chinnarat', 'Chan Palace', 'King Naresuan the Great', 'Wat Yai', 'Nan River'],
        year: (be) => `${be - 543} CE`,
        timeline: [
            [1900, 'Phra Buddha Chinnarat is cast', 'In the reign of King Maha Thammaracha I (Li Thai) of Sukhothai'],
            [2098, 'King Naresuan is born', 'At Chan Palace, Phitsanulok'],
            [2127, 'Declaration of independence', 'At Muang Khraeng, ending allegiance to Hongsawadi'],
            [2368, 'Phra Attharos moves to Bangkok', 'From Wat Wihan Thong to Wat Saket, in the reign of King Rama III'],
            [2467, 'Khun Phiren Thep Building built', 'As the regional forestry office, in the Chan Palace grounds'],
            [2569, 'Visit anytime, anywhere', 'A 360° virtual tour with narration in three languages']
        ]
    },
    zh: {
        nav_sites: '景点', nav_timeline: '历史长河', nav_eval: '评估',
        eyebrow: 'VIRTUAL HERITAGE · 360°',
        hero_title: '彭世洛 文化遗产',
        hero_sub: '走进“双河之地”彭世洛——成功佛之城、纳黎萱大帝的诞生地。以360°沉浸实景与三语讲解，开启一段穿越时光的旅程。',
        start: '开始导览', explore: '探索全部6处景点', turning: '好东西在下面，快滑',
        sites_kicker: 'SIX SACRED PLACES', sites_title: '六处圣地，一段旅程',
        sites_desc: '从难河畔的成功佛殿，到纳黎萱大帝诞生的占王宫。',
        chapter: '第', enter: '进入360°实景', langs3: '三语讲解',
        tl_kicker: '670 YEARS OF HISTORY', tl_title: '时光之旅',
        stats: ['处遗产景点', '度全景视角', '种讲解语言', '段讲解音频'],
        fin_title: '准备好出发了吗？',
        fin_text: '让彭世洛的小战象卡查，带你随时随地游遍六处景点。',
        footer: '彭世洛文化遗产虚拟导览 · 披汶颂堪皇家大学',
        ribbon: ['彭世洛', '双河之地', '成功佛', '占王宫', '纳黎萱大帝', '大寺', '难河'],
        year: (be) => `公元${be - 543}年`,
        timeline: [
            [1900, '铸造成功佛', '素可泰王朝摩诃达摩罗阇一世（立泰王）在位期间'],
            [2098, '纳黎萱大帝诞生', '于彭世洛占王宫'],
            [2127, '宣布独立', '于克朗城，不再臣属于勃固'],
            [2368, '迎请阿他罗立佛', '自金殿寺迎至曼谷沙吉寺，时为拉玛三世'],
            [2467, '坤披伦贴楼落成', '作为彭世洛区域林业办公室，位于占王宫范围内'],
            [2569, '随时随地参观', '360°虚拟导览与三语讲解']
        ]
    }
};

const THAI_DIGITS = '๐๑๒๓๔๕๖๗๘๙';
const thaiNum = (n) => String(n).padStart(2, '0').replace(/\d/g, d => THAI_DIGITS[d]);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

class HomeV2 {
    constructor() {
        const p = new URLSearchParams(location.search);
        this.lang = ['th', 'en', 'zh'].includes(p.get('lang')) ? p.get('lang') : 'th';
        // Greeting on the seal while the doors are closed
        const seal = document.getElementById('sealText');
        if (seal) seal.textContent = { th: 'ยินดีต้อนรับ', en: 'Welcome', zh: '欢迎' }[this.lang];
        this.init();
    }

    async init() {
        try {
            const r = await fetch('assets/data/content.json?v=' + Date.now(), { cache: 'no-store' });
            this.content = await r.json();
        } catch (e) { this.content = null; }

        this.render();
        this.bindLanguage();
        this.setupPans();
        this.setupReveal();
        this.setupPointer();
        this.setupScroll();
        this.setupDust();
        this.mountKacha();
        this.openDoors();
    }

    /* ---------- rendering ---------- */

    render() {
        const t = T[this.lang];
        document.documentElement.lang = this.lang;
        document.querySelectorAll('[data-t]').forEach(el => {
            const v = t[el.dataset.t];
            if (typeof v === 'string') el.textContent = v;
        });
        document.querySelectorAll('.langs button').forEach(b => b.classList.toggle('on', b.dataset.lang === this.lang));
        document.querySelectorAll('[data-lang-link]').forEach(a => { a.href = `evaluation.html?lang=${this.lang}`; });
        ['startBtn', 'startBtn2'].forEach(id => {
            const a = document.getElementById(id);
            if (a) a.href = `tour.html?id=wat_phra_buddha_chinnarat&lang=${this.lang}`;
        });

        // hero title, one animated span per word
        const title = document.getElementById('heroTitle');
        title.innerHTML = t.hero_title.split(' ').map((w, i) =>
            `<span class="word foil" style="animation-delay:${0.15 + i * 0.18}s">${w}</span>`).join(' ');

        // ribbon (doubled so the marquee loops seamlessly)
        const words = t.ribbon.map(w => `<span>${w}</span>`).join('');
        document.getElementById('ribbon').innerHTML = words + words;

        this.renderChapters();
        this.renderTimeline();
        this.renderStats();
        if (this._revealObserver) this.observeReveals();
        if (this._panObserver) this.observePans();
    }

    renderChapters() {
        const wrap = document.getElementById('chapters');
        const data = this.content && this.content[this.lang];
        if (!wrap || !data) return;
        const t = T[this.lang];
        const places = (this.content.site_info && this.content.site_info.places) || {};

        wrap.innerHTML = data.locations.map((loc, i) => {
            const n = i + 1;
            const hours = places[loc.id] && places[loc.id].hours ? places[loc.id].hours[this.lang] : '';
            const kicker = this.lang === 'zh' ? `第 ${String(n).padStart(2, '0')} 章` : `${t.chapter} ${this.lang === 'th' ? thaiNum(n) : String(n).padStart(2, '0')}`;
            return `
            <section class="chapter${i % 2 ? ' flip' : ''}">
                <div class="photo-bg" data-img="${loc.thumbnail}"></div>
                <div class="numeral" aria-hidden="true">${thaiNum(n)}</div>
                <div class="chapter-grid">
                    <div>
                        <div class="ch-kicker reveal">${kicker}</div>
                        <h3 class="ch-title reveal d1">${loc.name.replace(/\n/g, ' ')}</h3>
                        <p class="ch-summary reveal d2">${loc.summary || loc.overview.text}</p>
                        <div class="ch-meta reveal d2">
                            ${hours ? `<span><i></i>${hours}</span>` : ''}
                            <span><i></i>${t.langs3}</span>
                        </div>
                        <a class="btn btn-gold reveal d3" href="tour.html?id=${loc.id}&lang=${this.lang}">
                            <span>${t.enter}</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M13 5l7 7-7 7"/></svg>
                        </a>
                    </div>
                    <a class="arch reveal d1" href="tour.html?id=${loc.id}&lang=${this.lang}" aria-label="${loc.short_name}">
                        <div class="arch-inner">
                            <div class="arch-img" style="background-image:url('${loc.thumbnail}')"></div>
                            <div class="arch-glare"></div>
                            <svg class="arch-svg" viewBox="0 0 100 125" preserveAspectRatio="none" aria-hidden="true">
                                <g fill="none" stroke="url(#goldLine)" vector-effect="non-scaling-stroke">
                                    <path d="M0,125 L0,45 C0,25 20,12.5 38,7.5 C45,5.6 48,2.5 50,0 C52,2.5 55,5.6 62,7.5 C80,12.5 100,25 100,45 L100,125 Z" stroke-width="3" vector-effect="non-scaling-stroke"/>
                                    <path d="M-3,125 L-3,44 C-3,23 18,10 37,4.8 C44,2.8 47,-0.5 50,-3.5 C53,-0.5 56,2.8 63,4.8 C82,10 103,23 103,44 L103,125" stroke-width="1" opacity=".6" vector-effect="non-scaling-stroke"/>
                                </g>
                            </svg>
                            <div class="badge-360">360°</div>
                        </div>
                    </a>
                </div>
            </section>`;
        }).join('');
        this.setupTilt();
    }

    renderTimeline() {
        const t = T[this.lang];
        document.getElementById('tl').innerHTML = t.timeline.map(([be, title, text], i) => `
            <div class="tl-item reveal${i % 2 ? ' d1' : ''}">
                <div class="tl-year foil">${t.year(be)}</div>
                <div class="tl-title">${title}</div>
                <div class="tl-text">${text}</div>
            </div>`).join('');
    }

    renderStats() {
        const t = T[this.lang];
        const nums = [6, 360, 3, 36];
        document.getElementById('stats').innerHTML = nums.map((n, i) => `
            <div class="stat"><b class="foil" data-count="${n}">0</b><span>${t.stats[i]}</span></div>`).join('');
        this._counted = false;
        if (document.getElementById('stats').classList.contains('in')) this.countUp();
    }

    bindLanguage() {
        document.querySelectorAll('.langs button').forEach(b => b.addEventListener('click', () => {
            if (b.dataset.lang === this.lang) return;
            this.lang = b.dataset.lang;
            const u = new URL(location); u.searchParams.set('lang', this.lang); history.replaceState({}, '', u);
            this.render();
            document.body.classList.remove('ready'); void document.body.offsetWidth; document.body.classList.add('ready');
        }));
    }

    /* ---------- intro doors ---------- */

    openDoors() {
        const doors = document.getElementById('doors');
        const first = this.heroImages()[0];
        let opened = false;
        const open = () => {
            if (opened) return; opened = true;
            doors.classList.add('open');
            document.body.classList.remove('locked');
            setTimeout(() => document.body.classList.add('ready'), 350);
            setTimeout(() => doors.classList.add('gone'), 1700);
            this.startRunner();
        };
        if (reduceMotion) { open(); return; }
        const img = new Image();
        img.onload = () => setTimeout(open, 500);
        img.onerror = open;
        if (first) img.src = first; else open();
        setTimeout(open, 3200);   // never wait longer than this
    }

    /* ---------- pre-visit photos (the 360 views are only inside the tour) ---------- */

    // Hero slideshow photos, in order
    heroImages() {
        return ['img/thumbs/09.jpg', 'img/113.jpg', 'img/114.jpg', 'img/thumbs/08.jpg'];
    }

    // Hero: slow cross-fading slideshow of the pre-visit photos. Small
    // photos (under 900px wide) are skipped so the full-screen hero stays sharp.
    setupHeroSlides() {
        const wrap = document.getElementById('heroSlides');
        const all = this.heroImages();
        if (!wrap || !all.length) return;
        wrap.innerHTML = '<div class="slide"></div><div class="slide"></div>';
        const slides = wrap.querySelectorAll('.slide');
        const sizes = all.map(src => new Promise(res => {
            const im = new Image();
            im.onload = () => res(im.naturalWidth >= 900 ? src : null);
            im.onerror = () => res(null);
            im.src = src;
        }));
        let list = [all[0]], i = 0, cur = 0;
        const show = () => {
            const s = slides[cur];
            s.style.backgroundImage = `url('${list[i % list.length]}')`;
            s.classList.remove('on'); void s.offsetWidth; s.classList.add('on');
            slides[1 - cur].classList.remove('on');
            cur = 1 - cur; i++;
        };
        show();
        Promise.all(sizes).then(r => {
            const ok = r.filter(Boolean);
            if (ok.length) list = ok;
            if (!reduceMotion && list.length > 1) setInterval(show, 7000);
        });
    }

    setupPans() {
        this.setupHeroSlides();
        this._panObserver = new IntersectionObserver(entries => entries.forEach(e => {
            if (!e.isIntersecting) return;
            const bg = e.target.querySelector('.photo-bg');
            if (bg && !bg.style.backgroundImage) bg.style.backgroundImage = `url('${bg.dataset.img}')`;
            e.target.classList.add('inview');
        }), { rootMargin: '300px 0px' });
        this.observePans();
    }

    observePans() {
        document.querySelectorAll('.chapter').forEach(el => this._panObserver.observe(el));
    }

    /* ---------- reveal, counters, timeline progress ---------- */

    setupReveal() {
        this._revealObserver = new IntersectionObserver(entries => entries.forEach(e => {
            if (!e.isIntersecting) return;
            e.target.classList.add('in');
            this._revealObserver.unobserve(e.target);
            if (e.target.id === 'stats') this.countUp();
        }), { threshold: 0.18 });
        this.observeReveals();
    }

    observeReveals() {
        document.querySelectorAll('.reveal:not(.in)').forEach(el => this._revealObserver.observe(el));
    }

    countUp() {
        if (this._counted) return;
        this._counted = true;
        document.querySelectorAll('[data-count]').forEach(el => {
            const target = +el.dataset.count, t0 = performance.now(), dur = 1600;
            const step = (now) => {
                const k = Math.min(1, (now - t0) / dur);
                el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
                if (k < 1) requestAnimationFrame(step);
            };
            reduceMotion ? (el.textContent = target) : requestAnimationFrame(step);
        });
    }

    setupScroll() {
        const nav = document.getElementById('nav');
        const tl = document.getElementById('tl');
        const onScroll = () => {
            nav.classList.toggle('scrolled', scrollY > 40);
            const r = tl.getBoundingClientRect();
            const p = Math.max(0, Math.min(1, (innerHeight * 0.75 - r.top) / r.height));
            tl.style.setProperty('--progress', p.toFixed(3));
        };
        addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* ---------- pointer: glow, hero parallax, arch tilt ---------- */

    setupPointer() {
        if (reduceMotion || matchMedia('(hover: none)').matches) return;
        const glow = document.getElementById('glow');
        const hero = document.getElementById('heroInner');
        let x = 0, y = 0, queued = false;
        addEventListener('pointermove', (e) => {
            x = e.clientX; y = e.clientY;
            if (queued) return; queued = true;
            requestAnimationFrame(() => {
                queued = false;
                glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
                const dx = (x / innerWidth - 0.5), dy = (y / innerHeight - 0.5);
                hero.style.setProperty('--mx', `${dx * -18}px`);
                hero.style.setProperty('--my', `${dy * -12}px`);
            });
        });
    }

    setupTilt() {
        if (reduceMotion || matchMedia('(hover: none)').matches) return;
        document.querySelectorAll('.arch').forEach(arch => {
            const inner = arch.querySelector('.arch-inner');
            arch.addEventListener('pointermove', (e) => {
                const r = arch.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
                inner.style.setProperty('--ry', `${(px - 0.5) * 16}deg`);
                inner.style.setProperty('--rx', `${(0.5 - py) * 12}deg`);
                inner.style.setProperty('--gx', `${px * 100}%`);
                inner.style.setProperty('--gy', `${py * 100}%`);
            });
            arch.addEventListener('pointerleave', () => {
                inner.style.setProperty('--ry', '0deg');
                inner.style.setProperty('--rx', '0deg');
            });
        });
    }

    /* ---------- floating gold dust ---------- */

    setupDust() {
        if (reduceMotion) return;
        const c = document.getElementById('dust'), ctx = c.getContext('2d');
        let w, h, dpr = Math.min(2, devicePixelRatio || 1);
        const resize = () => { w = c.width = innerWidth * dpr; h = c.height = innerHeight * dpr; };
        resize(); addEventListener('resize', resize);
        const count = innerWidth < 700 ? 28 : 60;
        const ps = Array.from({ length: count }, () => ({
            x: Math.random() * w, y: Math.random() * h, r: (Math.random() * 1.6 + 0.4) * dpr,
            vy: -(Math.random() * 0.25 + 0.05) * dpr, vx: (Math.random() - 0.5) * 0.15 * dpr,
            a: Math.random() * 0.6 + 0.2, t: Math.random() * Math.PI * 2
        }));
        const tick = () => {
            ctx.clearRect(0, 0, w, h);
            for (const p of ps) {
                p.x += p.vx; p.y += p.vy; p.t += 0.02;
                if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
                const a = p.a * (0.6 + 0.4 * Math.sin(p.t));
                ctx.beginPath();
                ctx.fillStyle = `rgba(246, 227, 161, ${a})`;
                ctx.shadowColor = 'rgba(212, 165, 60, 0.9)';
                ctx.shadowBlur = 8 * dpr;
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            }
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    /* ---------- น้องคชา in the finale ---------- */

    mountKacha() {
        const stage = document.getElementById('kachaStage');
        if (!stage || typeof KACHA_SVG !== 'string') return;
        stage.innerHTML = KACHA_SVG;
        // Just for fun: a tap makes him jump and float a few hearts
        stage.addEventListener('click', () => {
            stage.classList.remove('hop'); void stage.offsetWidth; stage.classList.add('hop');
            this.hearts(stage.getBoundingClientRect());
        });
    }

    // Little hearts floating up from a box on screen
    hearts(r) {
        for (let i = 0; i < 6; i++) {
            const h = document.createElement('span');
            h.className = 'runner-heart';
            h.textContent = i % 2 ? '✦' : '♥';
            h.style.left = `${r.left + r.width * (0.25 + Math.random() * 0.5)}px`;
            h.style.top = `${r.top + r.height * 0.3}px`;
            h.style.setProperty('--dx', `${(Math.random() - 0.5) * 60}px`);
            h.style.animationDelay = `${i * 0.06}s`;
            document.body.appendChild(h);
            h.addEventListener('animationend', () => h.remove());
        }
    }

    /* ---------- น้องคชา runs across the page every 10 seconds ---------- */

    startRunner() {
        if (reduceMotion || typeof KACHA_SVG !== 'string' || this._runnerTimer) return;
        const el = document.createElement('div');
        el.className = 'runner';
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');
        el.innerHTML = `<div class="runner-bubble"></div><div class="runner-body">${KACHA_SVG}</div>`;
        document.body.appendChild(el);
        this.runner = el;
        this.runDir = 1;

        // Tapped: he stops, jumps, says something cheeky, then keeps running.
        // (No navigation; the tour is started with the buttons.)
        const play = () => {
            if (this._tapped || !this._running) return;
            this._tapped = true;
            if (this._anim) this._anim.pause();
            const bubble = el.querySelector('.runner-bubble');
            const lines = {
                th: ['จั๊กจี้นะ! 😆', 'อุ๊ย! ตกใจหมดเลย', 'ฮิ ๆ ชอบจัง', 'ตู้ดดด~ 🎺', 'อย่าแกล้งช้างน้อยสิ!', 'ตู้ดดด~ ไปกัน!'],
                en: ['That tickles! 😆', 'Whoa! You scared me', 'Hehe, I like you', 'Toot-toot! 🎺', "Don't tease the little elephant!", "Toot-toot! Let's go!"],
                zh: ['好痒呀！😆', '哎呀！吓我一跳', '嘻嘻，好喜欢', '嘟嘟～ 🎺', '别逗小象啦！', '嘟嘟～走吧！']
            }[this.lang];
            bubble.textContent = lines[Math.floor(Math.random() * lines.length)];
            bubble.classList.add('show');
            el.classList.add('tapped');
            this.hearts(el.getBoundingClientRect());
            setTimeout(() => {
                el.classList.remove('tapped');
                bubble.classList.remove('show');
                this._tapped = false;
                if (this._anim) this._anim.play();
            }, 1400);
        };
        el.addEventListener('click', play);
        el.addEventListener('keydown', (e) => { if (e.key === 'Enter') play(); });

        // first run 10s after arriving; each next run 10s after the previous one ends
        this._runnerTimer = setTimeout(() => this.runOnce(), 10000);
    }

    runOnce() {
        const el = this.runner;
        if (!el || this._running) return;
        if (document.hidden) { this._runnerTimer = setTimeout(() => this.runOnce(), 10000); return; }
        this._running = true;

        const dir = this.runDir; this.runDir *= -1;          // alternate sides
        const w = el.offsetWidth || 110;
        const from = dir > 0 ? -w - 20 : innerWidth + 20;
        const to = dir > 0 ? innerWidth + 20 : -w - 20;
        const dur = Math.max(8000, Math.min(13000, innerWidth * 8));   // slow, relaxed stroll
        el.style.setProperty('--dir', dir);
        el.classList.add('on');

        const lines = {
            th: ['ตามผมมาเลย!', 'มาเที่ยวกันเถอะ!', 'จิ้มผมเล่นได้นะ 😆', 'ตู้ดดด~ ไปกัน!', 'เที่ยวครบ 6 ที่หรือยัง?'],
            en: ['Follow me!', "Let's explore!", 'Go on, poke me! 😆', 'Toot-toot! Come on!', 'Seen all 6 sites yet?'],
            zh: ['跟我来！', '一起出发吧！', '戳戳我呀 😆', '嘟嘟～走吧！', '六个景点都逛了吗？']
        }[this.lang];
        const bubble = el.querySelector('.runner-bubble');
        bubble.textContent = lines[Math.floor(Math.random() * lines.length)];
        setTimeout(() => bubble.classList.add('show'), dur * 0.25);
        setTimeout(() => bubble.classList.remove('show'), dur * 0.75);

        // dust puffs left behind the feet
        const puffs = this._puffs = setInterval(() => {
            if (this._tapped) return;
            const r = el.getBoundingClientRect();
            const p = document.createElement('span');
            p.className = 'runner-puff';
            p.style.left = `${r.left + r.width / 2 - dir * r.width * 0.3}px`;
            p.style.top = `${r.bottom - 14}px`;
            p.style.setProperty('--dx', `${-dir * (14 + Math.random() * 16)}px`);
            document.body.appendChild(p);
            p.addEventListener('animationend', () => p.remove());
        }, 260);

        const anim = this._anim = el.animate(
            [{ transform: `translateX(${from}px)` }, { transform: `translateX(${to}px)` }],
            { duration: dur, easing: 'linear' });
        anim.onfinish = () => {
            clearInterval(puffs);
            el.classList.remove('on');
            bubble.classList.remove('show');
            this._running = false;
            this._runnerTimer = setTimeout(() => this.runOnce(), 10000);
        };
    }
}

document.addEventListener('DOMContentLoaded', () => { window.homeV2 = new HomeV2(); });
