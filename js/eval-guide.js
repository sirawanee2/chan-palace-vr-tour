/* ============================================
   น้องคชา ON THE EVALUATION PAGE
   Starts big in the hero, flies down to dock in the corner as the
   visitor scrolls, tracks questionnaire progress and celebrates the
   submission. Reactions never depend on the score given, so the
   mascot can't nudge respondents towards higher ratings.
   Texts live in content.json under "guide_eval".
   ============================================ */

class EvalGuide {
    constructor(sys) {
        this.sys = sys;
        this.hero = document.querySelector('.hero-compact');
        this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        this.kacha = new ElephantGuide(sys, { key: 'guide_eval', mode: 'free', mount: document.body });
        this.root = this.kacha.root;
        this.root.classList.add('kacha-eval');

        const rays = document.createElement('div');
        rays.className = 'kacha-rays';
        rays.setAttribute('aria-hidden', 'true');
        this.root.prepend(rays);

        this.badge = document.createElement('div');
        this.badge.className = 'kacha-progress';
        this.badge.innerHTML = '<span class="kp-text"></span><span class="kp-bar"><i></i></span>';
        this.root.appendChild(this.badge);

        this.docked = null;
        this.doneDims = new Set();
        this.allDoneSaid = false;
        this.updateDock(false);

        window.addEventListener('scroll', () => this.updateDock(true), { passive: true });
        window.addEventListener('resize', () => this.updateDock(false));
        document.addEventListener('change', (e) => {
            if (e.target.matches('#evalForm input[type="radio"]')) this.onAnswer();
        });
        // Native "required" validation fires 'invalid' on each unanswered field
        document.addEventListener('invalid', (e) => {
            if (e.target.closest && e.target.closest('#evalForm')) this.onInvalid();
        }, true);

        // Grand entrance
        setTimeout(() => {
            this.kacha.play('enter', 1100);
            setTimeout(() => this.kacha.burst(20, ['✦', '✧', '•']), 650);
            setTimeout(() => {
                this.kacha.happy(1500);
                this.kacha.say(this.t.greet || '', 8000);
            }, 900);
        }, 350);
    }

    get t() { return this.kacha.t; }

    fill(str, vars) {
        return (str || '').replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
    }

    /* ---------- hero <-> corner ---------- */

    updateDock(animate) {
        // On narrow screens the hero has no room beside the title, so he
        // starts in the corner straight away
        const dock = !this.hero || window.innerWidth <= 768 ||
            this.hero.getBoundingClientRect().bottom < 170;
        if (dock === this.docked) return;

        const first = this.root.getBoundingClientRect();
        this.docked = dock;
        (dock ? document.body : this.hero).appendChild(this.root);
        this.root.classList.toggle('docked', dock);
        this.root.classList.toggle('in-hero', !dock);

        // FLIP: fly from the old spot/size to the new one
        if (animate && !this.reduceMotion && first.width) {
            const last = this.root.getBoundingClientRect();
            const s = first.width / last.width;
            this.root.animate([
                { transform: `translate(${first.left - last.left}px, ${first.top - last.top}px) scale(${s})` },
                { transform: 'none' }
            ], { duration: 700, easing: 'cubic-bezier(0.3, 0.8, 0.3, 1.12)' });
        }
        this.updateProgress();
    }

    /* ---------- questionnaire progress ---------- */

    progress() {
        const form = document.getElementById('evalForm');
        if (!form) return null;
        const names = (scope) => [...new Set([...scope.querySelectorAll('input[type="radio"]')].map(i => i.name))];
        const isDone = (n) => !!form.querySelector(`input[name="${n}"]:checked`);
        const all = names(form);
        if (!all.length) return null;
        const dims = [...form.querySelectorAll('.dimension-block')].map(b => names(b).every(isDone));
        return { total: all.length, answered: all.filter(isDone).length, dims };
    }

    updateProgress() {
        const p = this.progress();
        this.badge.hidden = !p;
        if (!p) return;
        this.badge.querySelector('.kp-text').textContent =
            this.fill(this.t.progress, { n: p.answered, total: p.total });
        this.badge.querySelector('i').style.width = `${(p.answered / p.total) * 100}%`;
        this.badge.classList.toggle('complete', p.answered === p.total);
    }

    onAnswer() {
        const p = this.progress();
        if (!p) return;
        this.updateProgress();

        // Same small acknowledgement for every answer, whatever the score
        this.kacha.play('nod', 500);
        this.kacha.burst(5, ['✦', '•']);

        let newlyDone = -1;
        p.dims.forEach((done, i) => {
            if (done && !this.doneDims.has(i)) { this.doneDims.add(i); newlyDone = i; }
        });

        if (p.answered === p.total && !this.allDoneSaid) {
            this.allDoneSaid = true;
            this.kacha.play('trumpet', 1000);
            this.kacha.burst(16, ['✦', '✧', '•']);
            this.kacha.happy(2000);
            this.kacha.say(this.t.all_done || '', 7000);
            document.querySelector('#evalForm .submit-btn')?.classList.add('kacha-pulse');
        } else if (newlyDone >= 0) {
            const left = p.dims.filter(d => !d).length;
            this.kacha.cheer();
            this.kacha.happy(1400);
            this.kacha.say(this.fill(this.t.dim_done, { d: newlyDone + 1, left }), 5000);
        }
    }

    onInvalid() {
        clearTimeout(this._invalid);
        this._invalid = setTimeout(() => {
            const p = this.progress();
            const missing = p ? p.total - p.answered : 0;
            if (missing <= 0) return;
            this.kacha.play('jump', 700);
            this.kacha.say(this.fill(this.t.missing, { n: missing }), 5000);
        }, 60);
    }

    /* ---------- called by evaluation.js ---------- */

    onRender(tab) {
        this.kacha.applyLabels();
        const p = this.progress();
        this.doneDims = new Set(p ? p.dims.map((d, i) => (d ? i : -1)).filter(i => i >= 0) : []);
        this.allDoneSaid = !!p && p.answered === p.total;
        this.updateProgress();

        if (tab === 'results' && this.lastTab !== 'results' && this.lastTab !== undefined) {
            this.kacha.cheer();
            this.kacha.say(this.t.results || '', 5000);
        }
        this.lastTab = tab;
    }

    celebrate() {
        this.updateProgress();
        this.confetti();
        this.kacha.play('trumpet', 1000);
        this.kacha.burst(24, ['♥', '✦', '✧']);
        this.kacha.happy(3000);
        this.kacha.say(this.t.thanks || '', 9000);
    }

    confetti() {
        if (this.reduceMotion) return;
        const colors = ['#d4af37', '#f4e4bc', '#c8313a', '#fff3c4', '#8b0000', '#e8c55c'];
        const box = document.createElement('div');
        box.className = 'kacha-confetti';
        box.setAttribute('aria-hidden', 'true');
        for (let i = 0; i < 150; i++) {
            const c = document.createElement('i');
            const w = 6 + Math.random() * 6;
            c.style.left = `${Math.random() * 100}%`;
            c.style.width = `${w}px`;
            c.style.height = `${Math.random() < 0.3 ? w : w * 1.7}px`;
            c.style.background = colors[i % colors.length];
            if (Math.random() < 0.3) c.style.borderRadius = '50%';
            c.style.setProperty('--dur', `${2.6 + Math.random() * 2}s`);
            c.style.setProperty('--delay', `${Math.random() * 0.7}s`);
            c.style.setProperty('--drift', `${Math.random() * 160 - 80}px`);
            c.style.setProperty('--spin', `${360 + Math.random() * 720}deg`);
            box.appendChild(c);
        }
        document.body.appendChild(box);
        setTimeout(() => box.remove(), 5600);
    }
}

window.EvalGuide = EvalGuide;
