
/* ============================================
   CHAN PALACE VIRTUAL TOUR - EVALUATION JS
   ============================================ */

class EvaluationSystem {
    constructor() {
        this.currentLang = 'th';
        this.content = null;
        this.responses = JSON.parse(localStorage.getItem('chan_palace_evaluations') || '[]');
        this.currentTab = 'questionnaire';
        this.init();
    }

    async init() {
        await this.loadContent();
        this.setupLanguage();
        this.renderTabs();
        this.renderContent();
        this.setupNavigation();
        this.generateMockData(); // Generate sample data for demo
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
        this.renderContent();
        this.renderTabs();
    }

    setupNavigation() {
        const nav = document.querySelector('.main-nav');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) nav?.classList.add('scrolled');
            else nav?.classList.remove('scrolled');
        });
    }

    generateMockData() {
        // Generate 30 sample responses based on the research document
        if (this.responses.length === 0) {
            const mockData = [];
            const roles = ['นักท่องเที่ยว', 'นักเรียน/นักศึกษา', 'ประชาชนทั่วไป'];

            for (let i = 0; i < 30; i++) {
                const scores = {};
                ['accessibility', 'content', 'narrative'].forEach(dim => {
                    scores[dim] = [];
                    for (let q = 0; q < 5; q++) {
                        // Generate realistic scores: mostly 4-5 (High satisfaction)
                        const r = Math.random();
                        let score;
                        if (r < 0.05) score = 3;
                        else if (r < 0.20) score = 4;
                        else score = 5;
                        scores[dim].push(score);
                    }
                });

                mockData.push({
                    id: i + 1,
                    name: `ผู้ตอบแบบสอบถาม ${i + 1}`,
                    role: roles[Math.floor(Math.random() * roles.length)],
                    timestamp: new Date(2026, 0, 15 + Math.floor(Math.random() * 90)).toISOString(),
                    scores: scores
                });
            }

            this.responses = mockData;
            this.saveData();
        }
    }

    saveData() {
        localStorage.setItem('chan_palace_evaluations', JSON.stringify(this.responses));
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
            case 'expert':
                this.renderExpert(container);
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
                html += `
                    <div class="question-item">
                        <div class="question-text">
                            <span class="q-number">${dimIndex + 1}.${qIndex + 1}</span>
                            <span>${q}</span>
                        </div>
                        <div class="likert-scale">
                            ${data.scale_values.map((val, i) => `
                                <label class="likert-option">
                                    <input type="radio" name="${dim.id}_q${qIndex}" value="${val}" required>
                                    <span class="likert-circle">${val}</span>
                                    <span class="likert-label">${data.scale_labels[i]}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                `;
            });

            html += `</div></div>`;
        });

        html += `
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

    handleSubmit(form) {
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
            id: this.responses.length + 1,
            name: formData.get('name') || `ผู้ตอบแบบสอบถาม ${this.responses.length + 1}`,
            role: formData.get('role'),
            timestamp: new Date().toISOString(),
            scores: scores
        };

        this.responses.push(response);
        this.saveData();

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
                        <div class="stat-icon">📈</div>
                        <div class="stat-value">${stats.overallSD.toFixed(2)}</div>
                        <div class="stat-label">${data.results.overall_sd}</div>
                    </div>
                </div>

                <div class="chart-section">
                    <h4>${data.results.chart_title}</h4>
                    <canvas id="resultsChart" width="700" height="400"></canvas>
                </div>

                <div class="dimensions-detail">
                    <h4>${data.results.dimension_mean}</h4>
                    <div class="dimension-bars">
                        ${stats.dimensions.map((dim, i) => {
                            const pct = (dim.mean / 5) * 100;
                            const interp = this.getInterpretation(dim.mean);
                            return `
                                <div class="dim-bar-item">
                                    <div class="dim-bar-header">
                                        <span class="dim-bar-name">${dim.title}</span>
                                        <span class="dim-bar-score">${dim.mean.toFixed(2)} (${interp})</span>
                                    </div>
                                    <div class="dim-bar-track">
                                        <div class="dim-bar-fill" style="width: ${pct}%"></div>
                                    </div>
                                    <div class="dim-bar-meta">SD = ${dim.sd.toFixed(2)} | n = ${dim.count}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <div class="criteria-table">
                    <h4>เกณฑ์การตีความ</h4>
                    <table>
                        <thead>
                            <tr>
                                <th>ช่วงคะแนน</th>
                                <th>ระดับความพึงพอใจ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(data.results.criteria).map(([range, label]) => `
                                <tr class="${this.isInRange(stats.overallMean, range) ? 'active-row' : ''}">
                                    <td>${range}</td>
                                    <td>${label}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        container.innerHTML = html;
        this.drawChart(stats);
    }

    calculateStatistics() {
        const dims = ['accessibility', 'content', 'narrative'];
        const dimTitles = {
            'th': ['ความง่ายในการเข้าถึง', 'คุณภาพเนื้อหา', 'การเล่าเรื่องลำดับชั้น'],
            'en': ['Accessibility', 'Content Quality', 'Hierarchical Narrative'],
            'zh': ['可访问性', '内容质量', '分层叙事']
        };

        let allScores = [];
        const dimStats = dims.map((dim, i) => {
            let scores = [];
            this.responses.forEach(r => {
                if (r.scores[dim]) scores.push(...r.scores[dim]);
            });

            const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
            const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
            const sd = Math.sqrt(variance);

            allScores.push(...scores);

            return {
                id: dim,
                title: dimTitles[this.currentLang][i],
                mean: mean,
                sd: sd,
                count: scores.length
            };
        });

        const overallMean = allScores.reduce((a, b) => a + b, 0) / allScores.length;
        const overallVariance = allScores.reduce((sum, s) => sum + Math.pow(s - overallMean, 2), 0) / allScores.length;
        const overallSD = Math.sqrt(overallVariance);

        return {
            total: this.responses.length,
            overallMean,
            overallSD,
            dimensions: dimStats
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

    isInRange(mean, rangeStr) {
        const [min, max] = rangeStr.split('-').map(s => parseFloat(s.trim()));
        return mean >= min && mean <= max;
    }

    drawChart(stats) {
        const canvas = document.getElementById('resultsChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        canvas.width = 700 * dpr;
        canvas.height = 400 * dpr;
        ctx.scale(dpr, dpr);

        const w = 700, h = 400;
        const padding = { top: 40, right: 40, bottom: 80, left: 60 };
        const chartW = w - padding.left - padding.right;
        const chartH = h - padding.top - padding.bottom;

        // Clear
        ctx.clearRect(0, 0, w, h);

        // Background
        ctx.fillStyle = 'rgba(20, 20, 40, 0.5)';
        ctx.fillRect(padding.left, padding.top, chartW, chartH);

        // Grid lines
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding.top + chartH - (i / 5) * chartH;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(padding.left + chartW, y);
            ctx.stroke();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(i.toString(), padding.left - 10, y + 4);
        }

        // Bars
        const barWidth = 80;
        const gap = (chartW - barWidth * 3) / 4;
        const colors = ['#D4AF37', '#8B0000', '#4A90D9'];
        const gradients = colors.map(c => {
            const g = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
            g.addColorStop(0, c);
            g.addColorStop(1, c + '66');
            return g;
        });

        stats.dimensions.forEach((dim, i) => {
            const x = padding.left + gap + i * (barWidth + gap);
            const barH = (dim.mean / 5) * chartH;
            const y = padding.top + chartH - barH;

            // Bar
            ctx.fillStyle = gradients[i];
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barH, [8, 8, 0, 0]);
            ctx.fill();

            // Value on top
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(dim.mean.toFixed(2), x + barWidth / 2, y - 10);

            // Label
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = '13px sans-serif';
            const label = dim.title;
            const maxWidth = barWidth + 20;
            const words = label.split('');
            let line = '';
            let lines = [];
            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n];
                const metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && n > 0) {
                    lines.push(line);
                    line = words[n];
                } else {
                    line = testLine;
                }
            }
            lines.push(line);

            lines.forEach((l, li) => {
                ctx.fillText(l, x + barWidth / 2, padding.top + chartH + 25 + li * 18);
            });
        });

        // Title
        ctx.fillStyle = '#D4AF37';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ค่าเฉลี่ยแต่ละด้าน (Mean)', w / 2, 25);
    }

    renderExpert(container) {
        const data = this.content.evaluation[this.currentLang];

        const html = `
            <div class="expert-container">
                <div class="expert-header">
                    <h3>${data.expert.title}</h3>
                    <p>การประเมินตามระเบียบวิธีวิจัยและพัฒนา (R&D)</p>
                </div>

                <div class="expert-grid">
                    <div class="expert-card">
                        <div class="expert-icon">🎓</div>
                        <h4>${data.expert.media_experts}</h4>
                        <p>${data.expert.media_desc}</p>
                        <div class="expert-list">
                            ${[1, 2, 3].map(i => `
                                <div class="expert-item">
                                    <span class="expert-dot completed"></span>
                                    <span>ผู้เชี่ยวชาญด้านสื่อการเรียนรู้ ท่านที่ ${i}</span>
                                    <span class="expert-status completed">${data.expert.completed}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="expert-score">
                            <span class="score-label">ค่าเฉลี่ยการประเมิน</span>
                            <span class="score-value">4.72 / 5.00</span>
                        </div>
                    </div>

                    <div class="expert-card">
                        <div class="expert-icon">📜</div>
                        <h4>${data.expert.content_experts}</h4>
                        <p>${data.expert.content_desc}</p>
                        <div class="expert-list">
                            ${[1, 2, 3].map(i => `
                                <div class="expert-item">
                                    <span class="expert-dot completed"></span>
                                    <span>ผู้เชี่ยวชาญด้านเนื้อหา ท่านที่ ${i}</span>
                                    <span class="expert-status completed">${data.expert.completed}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="expert-score">
                            <span class="score-label">ค่าเฉลี่ยการประเมิน</span>
                            <span class="score-value">4.85 / 5.00</span>
                        </div>
                    </div>
                </div>

                <div class="expert-summary">
                    <h4>สรุปผลการประเมินโดยผู้เชี่ยวชาญ</h4>
                    <div class="summary-stats">
                        <div class="summary-item">
                            <span class="summary-label">UI/UX Design</span>
                            <div class="summary-bar">
                                <div class="summary-fill" style="width: 94%"></div>
                            </div>
                            <span class="summary-value">4.72</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Content Accuracy</span>
                            <div class="summary-bar">
                                <div class="summary-fill" style="width: 97%"></div>
                            </div>
                            <span class="summary-value">4.85</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Hierarchical Narrative</span>
                            <div class="summary-bar">
                                <div class="summary-fill" style="width: 96%"></div>
                            </div>
                            <span class="summary-value">4.80</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Accessibility</span>
                            <div class="summary-bar">
                                <div class="summary-fill" style="width: 95%"></div>
                            </div>
                            <span class="summary-value">4.75</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.evaluationSystem = new EvaluationSystem();
});
