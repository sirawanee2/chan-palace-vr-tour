
/* ============================================
   CHAN PALACE VIRTUAL TOUR - EVALUATION JS
   ============================================ */

// Google Sheet (via Apps Script Web App) that stores every submitted
// evaluation, so all visitors see the same shared set of reviews instead of
// each browser only seeing what it submitted itself.
const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbyVuEn38cIUhEyrztiSiEcu7fki_ot9n78vMJUg4TwXSB3mjgoGSOciYjjK0LksVOaH/exec';

class EvaluationSystem {
    constructor() {
        this.currentLang = 'th';
        this.content = null;
        this.responses = [];
        this.currentTab = 'questionnaire';
        this.init();
    }

    async init() {
        await this.loadContent();
        this.setupLanguage();
        this.renderHero();
        this.renderTabs();
        this.renderContent();
        this.setupNavigation();
        // Don't block the page on the Sheets fetch — it can be slow or
        // blocked entirely (network policy, ad blocker), and the
        // questionnaire tab doesn't need it. Re-render only if the visitor
        // is already looking at the results tab once it resolves.
        this.loadResponses().then(() => {
            if (this.currentTab === 'results') this.renderContent();
        });
    }

    // Fetches every response from the shared Google Sheet. The header row's
    // column names are trimmed defensively in case the sheet has stray
    // trailing spaces (e.g. "name " instead of "name"). Aborts after 8s per
    // attempt so a stuck request never leaves the results tab loading
    // forever, and retries a couple of times since Apps Script's Web App
    // redirect intermittently returns an unrelated error page instead of
    // the actual JSON, even when the underlying data is fine.
    async loadResponses() {
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 8000);
                const res = await fetch(SHEET_API_URL, { signal: controller.signal });
                clearTimeout(timeout);
                const rows = await res.json();
                this.responses = rows.map(row => {
                    const norm = {};
                    Object.keys(row).forEach(key => { norm[key.trim()] = row[key]; });
                    let scores = {};
                    try { scores = JSON.parse(norm.scores || '{}'); } catch (e) { scores = {}; }
                    return {
                        name: norm.name,
                        role: norm.role,
                        timestamp: norm.timestamp,
                        scores,
                        feedback: norm.feedback,
                        source: 'user'
                    };
                });
                return;
            } catch (error) {
                console.error(`Error loading shared reviews (attempt ${attempt}/3):`, error);
                if (attempt < 3) await new Promise(r => setTimeout(r, 800));
            }
        }
        this.responses = [];
    }

    async loadContent() {
        try {
            const response = await fetch('assets/data/content.json');
            this.content = await response.json();
        } catch (error) {
            console.error('Error loading content:', error);
        }
    }

    setupLanguage() {
        const params = new URLSearchParams(window.location.search);
        this.currentLang = params.get('lang') || 'th';

        // Update nav language buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
            btn.addEventListener('click', (e) => {
                const lang = e.target.dataset.lang;
                this.switchLanguage(lang);
            });
        });
    }

    switchLanguage(lang) {
        this.currentLang = lang;
        const url = new URL(window.location);
        url.searchParams.set('lang', lang);
        window.history.replaceState({}, '', url);
        // main.js also listens on .lang-btn clicks and overwrites .hero-title/
        // .hero-subtitle with the homepage's own text; defer so this runs after
        // every same-tick click handler, regardless of listener attach order.
        setTimeout(() => this.renderHero(), 0);
        this.renderContent();
        this.renderTabs();
    }

    renderHero() {
        const data = this.content?.evaluation?.[this.currentLang];
        if (!data) return;
        const titleEl = document.querySelector('.hero-title');
        const subtitleEl = document.querySelector('.hero-subtitle');
        if (titleEl) titleEl.textContent = data.hero_title;
        if (subtitleEl) subtitleEl.textContent = data.hero_subtitle;
    }

    setupNavigation() {
        const nav = document.querySelector('.main-nav');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) nav?.classList.add('scrolled');
            else nav?.classList.remove('scrolled');
        });
    }

    renderTabs() {
        const data = this.content?.evaluation?.[this.currentLang];
        if (!data) return;

        const tabsContainer = document.querySelector('.eval-tabs');
        if (!tabsContainer) return;

        tabsContainer.innerHTML = Object.entries(data.tabs).map(([key, label]) => `
            <button class="eval-tab ${this.currentTab === key ? 'active' : ''}" data-tab="${key}">
                ${label}
            </button>
        `).join('');

        tabsContainer.querySelectorAll('.eval-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.currentTab = e.target.dataset.tab;
                this.renderTabs();
                this.renderContent();
            });
        });
    }

    renderContent() {
        const container = document.querySelector('.eval-content');
        if (!container || !this.content) return;

        container.innerHTML = '';

        switch (this.currentTab) {
            case 'questionnaire':
                this.renderQuestionnaire(container);
                break;
            case 'results':
                this.renderResults(container);
                break;
        }
    }

    renderQuestionnaire(container) {
        const data = this.content.evaluation[this.currentLang];
        const ui = this.content[this.currentLang].ui;

        let html = `
            <div class="questionnaire-container">
                <div class="eval-form-header">
                    <h3>${data.section_title}</h3>
                    <p>${data.section_desc}</p>
                </div>
                <form class="eval-form" id="evalForm">
                    <div class="form-group">
                        <label>${data.form.name_label}</label>
                        <input type="text" name="name" class="form-input" placeholder="${data.form.name_label}">
                    </div>
                    <div class="form-group">
                        <label>${data.form.role_label}</label>
                        <select name="role" class="form-select" required>
                            ${data.form.roles.map(r => `<option value="${r}">${r}</option>`).join('')}
                        </select>
                    </div>
        `;

        data.dimensions.forEach((dim, dimIndex) => {
            html += `
                <div class="dimension-block">
                    <div class="dimension-header">
                        <h4>${dim.title}</h4>
                        <span class="dimension-en">${dim.title_en}</span>
                    </div>
                    <div class="questions-list">
            `;

            dim.questions.forEach((q, qIndex) => {
                const name = `${dim.id}_q${qIndex}`;
                html += `
                    <div class="question-item">
                        <div class="question-text">
                            <span class="q-number">${dimIndex + 1}.${qIndex + 1}</span>
                            <span>${q}</span>
                        </div>
                        <div class="star-rating">
                            ${data.scale_values.slice().reverse().map(val => `
                                <input type="radio" id="${name}_${val}" name="${name}" value="${val}" required>
                                <label for="${name}_${val}" title="${data.scale_labels[val - 1]}">★</label>
                            `).join('')}
                        </div>
                    </div>
                `;
            });

            html += `</div></div>`;
        });

        html += `
                    <div class="form-group">
                        <label>${data.form.feedback_label}</label>
                        <textarea name="feedback" class="form-input feedback-textarea" placeholder="${data.form.feedback_placeholder}" rows="4"></textarea>
                    </div>
                    <button type="submit" class="submit-btn">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        ${data.form.submit}
                    </button>
                </form>
            </div>
        `;

        container.innerHTML = html;

        // Form submission
        document.getElementById('evalForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit(e.target);
        });
    }

    async handleSubmit(form) {
        const formData = new FormData(form);
        const data = this.content.evaluation[this.currentLang];

        const scores = {};
        data.dimensions.forEach(dim => {
            scores[dim.id] = [];
            for (let i = 0; i < dim.questions.length; i++) {
                const val = parseInt(formData.get(`${dim.id}_q${i}`));
                scores[dim.id].push(val);
            }
        });

        const response = {
            name: formData.get('name') || `ผู้ตอบแบบสอบถาม ${this.responses.length + 1}`,
            role: formData.get('role'),
            feedback: (formData.get('feedback') || '').trim(),
            timestamp: new Date().toISOString(),
            scores: scores
        };

        const submitBtn = form.querySelector('.submit-btn');
        if (submitBtn) submitBtn.disabled = true;

        // Show the new response immediately in this browser rather than
        // re-fetching the sheet right away — Apps Script's Web App redirect
        // can return an unrelated error page on rapid consecutive calls even
        // though the row was written fine. Other visitors pick it up the
        // next time they load the page, via loadResponses() in init().
        this.responses.push({ ...response, source: 'user' });

        try {
            await fetch(SHEET_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(response)
            });
        } catch (error) {
            console.error('Error submitting to shared sheet:', error);
        }

        // Show success
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.innerHTML = `
            <div class="success-icon">✓</div>
            <h4>${data.form.success}</h4>
            <p>ค่าเฉลี่ยของคุณ: ${this.calculatePersonalMean(scores).toFixed(2)}</p>
            <button class="view-results-btn" onclick="window.evaluationSystem.currentTab='results'; window.evaluationSystem.renderTabs(); window.evaluationSystem.renderContent(); window.scrollTo(0,0);">
                ดูผลการประเมินรวม
            </button>
        `;
        form.innerHTML = '';
        form.appendChild(successMsg);
    }

    calculatePersonalMean(scores) {
        let total = 0, count = 0;
        Object.values(scores).forEach(arr => {
            arr.forEach(s => { total += s; count++; });
        });
        return total / count;
    }

    renderResults(container) {
        const data = this.content.evaluation[this.currentLang];
        const stats = this.calculateStatistics();

        if (stats.total === 0) {
            container.innerHTML = `
                <div class="results-container">
                    <div class="reviews-section">
                        <h4>${data.results.reviews_title}</h4>
                        <p class="reviews-empty">${data.results.reviews_empty}</p>
                    </div>
                </div>
            `;
            return;
        }

        const interpretation = this.getInterpretation(stats.overallMean);

        let html = `
            <div class="results-container">
                <div class="results-header">
                    <h3>${data.results.interpretation}</h3>
                    <div class="overall-score">
                        <div class="score-circle">
                            <span class="score-value">${stats.overallMean.toFixed(2)}</span>
                            <span class="score-max">/5.00</span>
                        </div>
                        <div class="score-label">${interpretation}</div>
                    </div>
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">👥</div>
                        <div class="stat-value">${stats.total}</div>
                        <div class="stat-label">${data.results.total_samples}</div>
                    </div>
                    <div class="stat-card highlight">
                        <div class="stat-icon">📊</div>
                        <div class="stat-value">${stats.overallMean.toFixed(2)}</div>
                        <div class="stat-label">${data.results.overall_mean}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">💬</div>
                        <div class="stat-value">${stats.feedbackCount}</div>
                        <div class="stat-label">${data.results.feedback_count}</div>
                    </div>
                </div>

                <div class="reviews-section">
                    <h4>${data.results.reviews_title}</h4>
                    <div class="reviews-list">
                        ${this.responses.slice().reverse().map(r => this.renderReviewCard(r)).join('')}
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    renderReviewCard(r) {
        const mean = this.calculatePersonalMean(r.scores);
        const roundedStars = Math.max(1, Math.min(5, Math.round(mean)));
        const stars = '★'.repeat(roundedStars) + '☆'.repeat(5 - roundedStars);
        const locale = this.currentLang === 'th' ? 'th-TH' : this.currentLang === 'zh' ? 'zh-CN' : 'en-US';
        const date = new Date(r.timestamp).toLocaleDateString(locale);

        return `
            <div class="review-card">
                <div class="review-header">
                    <span class="review-name">${this.escapeHtml(r.name)}</span>
                    <span class="review-role">${this.escapeHtml(r.role || '')}</span>
                    <span class="review-date">${date}</span>
                </div>
                <div class="review-stars" title="${mean.toFixed(2)} / 5.00">${stars}</div>
                ${r.feedback ? `<p class="review-feedback">${this.escapeHtml(r.feedback)}</p>` : ''}
            </div>
        `;
    }

    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    calculateStatistics() {
        let allScores = [];
        this.responses.forEach(r => {
            Object.values(r.scores).forEach(arr => allScores.push(...arr));
        });

        const overallMean = allScores.length ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0;
        const feedbackCount = this.responses.filter(r => r.feedback && r.feedback.trim().length > 0).length;

        return {
            total: this.responses.length,
            overallMean,
            feedbackCount
        };
    }

    getInterpretation(mean) {
        const data = this.content.evaluation[this.currentLang];
        if (mean >= 4.51) return data.results.criteria["4.51-5.00"];
        if (mean >= 3.51) return data.results.criteria["3.51-4.50"];
        if (mean >= 2.51) return data.results.criteria["2.51-3.50"];
        if (mean >= 1.51) return data.results.criteria["1.51-2.50"];
        return data.results.criteria["1.00-1.50"];
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.evaluationSystem = new EvaluationSystem();
});
