/**
 * NephroAI — script.js
 * Main application JavaScript
 * Handles: Navigation, animations, carousel, FAQ, demo API integration, neural net canvas
 */

/* ============================================================
   CONFIG
   ============================================================ */
const CONFIG = {
  API_BASE_URL: '',            // Set to your backend base URL, e.g. 'https://api.cardioairuby.ai'
  API_ENDPOINT: '/api/kidney-analyze',
  REQUEST_TIMEOUT_MS: 15000,   // 15s timeout
  MAX_RETRIES: 2,
  RETRY_DELAY_MS: 1500,
};

/* ============================================================
   DOM READY
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initScrollAnimations();
  initHeroParticles();
  initEnsembleCanvas();
  initFAQ();
  initAnalysisForm();
  initBackToTop();
});

/* ============================================================
   1. NAVBAR — Sticky + scroll state
   ============================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Run on load
}

/* ============================================================
   2. MOBILE MENU — Hamburger toggle with overlay
   ============================================================ */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  const overlay   = document.getElementById('navOverlay');

  if (!hamburger || !navLinks || !overlay) return;

  const openMenu = () => {
    hamburger.classList.add('open');
    navLinks.classList.add('open');
    overlay.classList.add('active');
    overlay.removeAttribute('aria-hidden');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', () => {
    hamburger.getAttribute('aria-expanded') === 'false' ? openMenu() : closeMenu();
  });

  overlay.addEventListener('click', closeMenu);

  // Close on nav link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
}

/* ============================================================
   3. SMOOTH SCROLL — Offset for sticky nav
   ============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navbarHeight = document.getElementById('navbar')?.offsetHeight || 70;
      const targetY = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 16;

      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  });
}

/* ============================================================
   4. SCROLL ANIMATIONS — IntersectionObserver for .fade-in
   ============================================================ */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-in');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          
          // Animate confidence meter if present in this section
          const confBar = entry.target.querySelector('#confBar');
          if (confBar) {
            const confValEl = entry.target.querySelector('#confVal');
            const pct = confValEl ? confValEl.textContent : '98.7%';
            setTimeout(() => {
              confBar.style.width = pct;
            }, 500);
          }

          observer.unobserve(entry.target); // Animate once
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elements.forEach(el => observer.observe(el));
}

/* ============================================================
   5. HERO PARTICLES — Floating background dots
   ============================================================ */
function initHeroParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;

  // Reduce particles on mobile for performance
  const count = window.innerWidth < 768 ? 12 : 25;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    // Random size between 2–6px
    const size = Math.random() * 4 + 2;
    particle.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      animation-duration: ${Math.random() * 12 + 8}s;
      animation-delay: ${Math.random() * -15}s;
      opacity: ${Math.random() * 0.3 + 0.05};
    `;
    container.appendChild(particle);
  }
}

/* ============================================================
   6. ENSEMBLE MAP CANVAS — Interactive node graph for AI model section
   ============================================================ */
function initEnsembleCanvas() {
  const canvas = document.getElementById('ensembleCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth || 520;
  const H = canvas.offsetHeight || 420;

  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.scale(dpr, dpr);

  // Ensemble structure: 4 sub-models voting into a central node
  const centerX = W / 2;
  const centerY = H / 2;
  const orbitRadius = 155;

  const models = [
    { name: 'Random Forest', angle: -Math.PI / 4, color: '29, 112, 184', particles: [] },
    { name: 'XGBoost', angle: Math.PI / 4, color: '46, 196, 182', particles: [] },
    { name: 'Gradient Boosting', angle: 3 * Math.PI / 4, color: '46, 196, 182', particles: [] },
    { name: 'AdaBoost', angle: -3 * Math.PI / 4, color: '224, 123, 57', particles: [] }
  ];

  // Initialize nodes
  models.forEach(m => {
    m.x = centerX + Math.cos(m.angle) * orbitRadius;
    m.y = centerY + Math.sin(m.angle) * orbitRadius;
    for (let i = 0; i < 5; i++) {
      m.particles.push({
        progress: Math.random(),
        speed: 0.005 + Math.random() * 0.01
      });
    }
  });

  const votingNode = { x: centerX, y: centerY, pulse: 0 };

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    frame++;

    // Draw background connections
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    models.forEach(m => {
      ctx.strokeStyle = `rgba(${m.color}, 0.2)`;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(votingNode.x, votingNode.y);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Draw moving particles (data flow)
    models.forEach(m => {
      m.particles.forEach(p => {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;

        const px = m.x + (votingNode.x - m.x) * p.progress;
        const py = m.y + (votingNode.y - m.y) * p.progress;

        ctx.fillStyle = `rgba(${m.color}, ${0.4 + Math.sin(frame * 0.1) * 0.2})`;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    // Draw Model Nodes
    models.forEach(m => {
      const glow = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 45);
      glow.addColorStop(0, `rgba(${m.color}, 0.15)`);
      glow.addColorStop(1, `rgba(${m.color}, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(m.x, m.y, 45, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(${m.color}, 0.6)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(m.x, m.y, 40, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = '800 10px "Sora", sans-serif';
      ctx.textAlign = 'center';
      const words = m.name.split(' ');
      if (words.length > 1) {
        ctx.fillText(words[0], m.x, m.y - 2);
        ctx.fillText(words[1], m.x, m.y + 10);
      } else {
        ctx.fillText(m.name, m.x, m.y + 4);
      }
    });

    // Draw central Voting Node
    votingNode.pulse = Math.sin(frame * 0.05) * 5;
    const vGlow = ctx.createRadialGradient(votingNode.x, votingNode.y, 0, votingNode.x, votingNode.y, 50 + votingNode.pulse);
    vGlow.addColorStop(0, 'rgba(46, 196, 182, 0.2)');
    vGlow.addColorStop(1, 'rgba(46, 196, 182, 0)');
    ctx.fillStyle = vGlow;
    ctx.beginPath();
    ctx.arc(votingNode.x, votingNode.y, 50 + votingNode.pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(46, 196, 182, 0.1)';
    ctx.beginPath();
    ctx.arc(votingNode.x, votingNode.y, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2EC4B6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(votingNode.x, votingNode.y, 40, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = '700 14px "Sora", sans-serif';
    ctx.fillText('VOTING', votingNode.x, votingNode.y + 5);

    // Interaction hint
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '400 10px "DM Sans", sans-serif';
    ctx.fillText('LIVE ENSEMBLE INFERENCE', centerX, H - 20);

    requestAnimationFrame(draw);
  }

  draw();
}





/* ============================================================
   9. FAQ ACCORDION
   ============================================================ */
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer   = item.querySelector('.faq-answer');

    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = question.getAttribute('aria-expanded') === 'true';

      // Close all others
      faqItems.forEach(other => {
        const otherQ = other.querySelector('.faq-question');
        const otherA = other.querySelector('.faq-answer');
        if (other !== item && otherQ && otherA) {
          otherQ.setAttribute('aria-expanded', 'false');
          otherA.hidden = true;
          otherA.style.maxHeight = null;
        }
      });

      // Toggle current
      question.setAttribute('aria-expanded', String(!isOpen));
      if (isOpen) {
        answer.hidden = true;
        answer.style.maxHeight = null;
      } else {
        answer.hidden = false;
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/* ============================================================
   10. ANALYSIS FORM — API Integration
   ============================================================ */

/**
 * Sanitize string to prevent XSS — strip HTML tags
 * @param {string} str
 * @returns {string}
 */
function sanitize(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Validate form fields
 * @returns {boolean} Valid or not
 */
function validateForm() {
  let valid = true;
  let firstInvalidEl = null;

  const fields = [
    {
      id: 'inputAge', errId: 'ageErr',
      validate: (v) => {
        if (!v) return 'Age is required.';
        const n = Number(v);
        if (n < 1 || n > 120) return 'Enter a valid age (1–120).';
        return null;
      },
    },
    {
      id: 'inputBp', errId: 'bpErr',
      validate: (v) => {
        if (!v) return 'Blood pressure is required.';
        const n = Number(v);
        if (n < 50 || n > 180) return 'Enter a valid BP (50–180).';
        return null;
      },
    },
    {
      id: 'inputSg', errId: 'sgErr',
      validate: (v) => {
        if (!v) return 'Specific gravity is required.';
        const n = Number(v);
        if (n < 1.000 || n > 1.030) return 'Enter a valid value (1.000–1.030).';
        return null;
      },
    },
    {
      id: 'inputAl', errId: 'alErr',
      validate: (v) => {
        if (v === '') return 'Albumin is required.';
        const n = Number(v);
        if (n < 0 || n > 5) return 'Enter a value between 0 and 5.';
        return null;
      },
    },
    {
      id: 'inputSu', errId: 'suErr',
      validate: (v) => {
        if (v === '') return 'Sugar is required.';
        const n = Number(v);
        if (n < 0 || n > 5) return 'Enter a value between 0 and 5.';
        return null;
      },
    },
    { id: 'inputRbc',   errId: 'rbcErr',   validate: (v) => null }, // Optional
    { id: 'inputPc',    errId: 'pcErr',    validate: (v) => null }, // Optional
    { id: 'inputPcc',   errId: 'pccErr',   validate: (v) => null }, // Optional
    { id: 'inputBa',    errId: 'baErr',    validate: (v) => null }, // Optional
    {
      id: 'inputBgr', errId: 'bgrErr',
      validate: (v) => {
        if (!v) return 'Blood glucose random is required.';
        const n = Number(v);
        if (n < 22 || n > 490) return 'Enter a valid value (22–490).';
        return null;
      },
    },
    {
      id: 'inputBu', errId: 'buErr',
      validate: (v) => {
        if (!v) return 'Blood urea is required.';
        const n = Number(v);
        if (n < 1 || n > 400) return 'Enter a valid value (1–400).';
        return null;
      },
    },
    {
      id: 'inputSc', errId: 'scErr',
      validate: (v) => {
        if (!v) return 'Serum creatinine is required.';
        const n = Number(v);
        if (n < 0.1 || n > 80) return 'Enter a valid value (0.1–80).';
        return null;
      },
    },
    {
      id: 'inputSod', errId: 'sodErr',
      validate: (v) => {
        if (!v) return 'Sodium is required.';
        const n = Number(v);
        if (n < 4 || n > 165) return 'Enter a valid value (4–165).';
        return null;
      },
    },
    {
      id: 'inputPot', errId: 'potErr',
      validate: (v) => {
        if (!v) return 'Potassium is required.';
        const n = Number(v);
        if (n < 2 || n > 8) return 'Enter a valid value (2–8).';
        return null;
      },
    },
    {
      id: 'inputHemo', errId: 'hemoErr',
      validate: (v) => {
        if (!v) return 'Haemoglobin is required.';
        const n = Number(v);
        if (n < 3 || n > 18) return 'Enter a valid value (3–18).';
        return null;
      },
    },
    {
      id: 'inputPcv', errId: 'pcvErr',
      validate: (v) => {
        if (!v) return 'Packed cell volume is required.';
        const n = Number(v);
        if (n < 9 || n > 55) return 'Enter a valid value (9–55).';
        return null;
      },
    },
    {
      id: 'inputWbcc', errId: 'wbccErr',
      validate: (v) => {
        if (!v) return null; // Optional
        const n = Number(v);
        if (n < 2000 || n > 27000) return 'Enter a valid value (2000–27000).';
        return null;
      },
    },
    {
      id: 'inputRbcc', errId: 'rbccErr',
      validate: (v) => {
        if (!v) return 'Red blood cell count is required.';
        const n = Number(v);
        if (n < 2 || n > 9) return 'Enter a valid value (2–9).';
        return null;
      },
    },
    { id: 'inputHtn',   errId: 'htnErr',   validate: (v) => (!v ? 'Hypertension is required.' : null) },
    { id: 'inputDm',    errId: 'dmErr',    validate: (v) => (!v ? 'Diabetes mellitus is required.' : null) },
    { id: 'inputCad',   errId: 'cadErr',   validate: (v) => null }, // Optional
    { id: 'inputAppet', errId: 'appetErr', validate: (v) => null }, // Optional
    { id: 'inputPe',    errId: 'peErr',    validate: (v) => null }, // Optional
    { id: 'inputAne',   errId: 'aneErr',   validate: (v) => null }, // Optional
  ];

  fields.forEach(({ id, errId, validate }) => {
    const input = document.getElementById(id);
    const errEl = document.getElementById(errId);
    if (!input || !errEl) return;

    const error = validate(input.value);
    if (error) {
      errEl.textContent = error;
      input.classList.add('invalid');
      valid = false;
      if (!firstInvalidEl) firstInvalidEl = input;
    } else {
      errEl.textContent = '';
      input.classList.remove('invalid');
    }
  });

  if (firstInvalidEl) {
    const navbarHeight = document.getElementById('navbar')?.offsetHeight || 70;
    const targetY = firstInvalidEl.getBoundingClientRect().top + window.scrollY - navbarHeight - 40;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
    
    // Briefly focus the element for accessibility
    setTimeout(() => firstInvalidEl.focus({ preventScroll: true }), 300);
  }

  return valid;
}

/**
 * Send patient data to backend API
 * @param {Object} patientData
 * @param {number} [retries=0]
 * @returns {Promise<Object>}
 */
async function analyzeKidneyData(patientData, retries = 0) {
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.API_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest', // CSRF hint
      },
      body: JSON.stringify(patientData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Retry on server errors (5xx)
      if (response.status >= 500 && retries < CONFIG.MAX_RETRIES) {
        await sleep(CONFIG.RETRY_DELAY_MS * (retries + 1));
        return analyzeKidneyData(patientData, retries + 1);
      }
      throw new Error(`Server error: ${response.status}`);
    }

    return await response.json();

  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') throw new Error('Request timed out. Please try again.');

    // Retry on network errors
    if (retries < CONFIG.MAX_RETRIES) {
      await sleep(CONFIG.RETRY_DELAY_MS * (retries + 1));
      return analyzeKidneyData(patientData, retries + 1);
    }

    throw err;
  }
}

/**
 * Utility: sleep for ms milliseconds
 * @param {number} ms
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Map risk level string to CSS class
 * @param {string} level
 * @returns {string}
 */
function getRiskClass(level = '') {
  const l = level.toLowerCase();
  if (l.includes('high'))     return 'risk-high';
  if (l.includes('moderate') || l.includes('medium')) return 'risk-moderate';
  return 'risk-low';
}

/**
 * Mock API response for demo purposes (used when backend is not connected)
 * @param {Object} data
 * @returns {Object}
 */
function getMockResponse(data) {
  return {
    riskLevel: "Analysis Unavailable",
    confidenceScore: 0,
    primaryAssessment: "The NephroAI analysis engine is currently offline or unreachable. Please ensure the Flask backend is running and try again.",
    recommendedActions: ["Check server connection", "Restart app.py", "Contact support if issue persists"]
  };
}

/**
 * Display analysis results
 * @param {Object} result
 */
function displayResults(result) {
  const placeholder = document.getElementById('resultsPlaceholder');
  const content     = document.getElementById('resultsContent');
  if (placeholder) placeholder.style.display = 'none';
  if (content)     content.removeAttribute('hidden');
  if (content)     content.style.display  = 'flex';

  // Scroll results into view
  const panel = document.getElementById('resultsPanel');
  if (panel) {
    // Add a slight delay to ensure the display change has propagated
    setTimeout(() => {
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  // Risk badge
  const riskBadge = document.getElementById('riskBadge');
  if (riskBadge) {
    riskBadge.textContent  = result.riskLevel || 'Risk Undetermined';
    riskBadge.className    = `result-risk-badge ${getRiskClass(result.riskLevel)}`;
  }

  // Confidence score bar
  const confBar   = document.getElementById('confBarResult');
  const confScore = document.getElementById('confScore');
  const pct       = parseFloat(result.confidenceScore) || 0;

  if (confScore) confScore.textContent = `${pct.toFixed(1)}%`;
  if (confBar) {
    // Must wait for the parent (hidden → flex) to be painted by the browser.
    // A double requestAnimationFrame guarantees we're past that paint before
    // touching the bar — otherwise the CSS transition is silently skipped.
    confBar.style.transition = 'none';
    confBar.style.width = '0%';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        confBar.style.transition = 'width 1s ease';
        confBar.style.width = `${pct}%`;
      });
    });
  }

  // Primary assessment
  const pa = document.getElementById('primaryAssessment');
  if (pa) pa.textContent = sanitize(result.primaryAssessment || 'No assessment available.');

  // Recommended actions
  const ra = document.getElementById('recommendedActions');
  if (ra) {
    ra.innerHTML = '';
    const actions = Array.isArray(result.recommendedActions) ? result.recommendedActions : [];
    actions.forEach(action => {
      const li = document.createElement('li');
      li.textContent = sanitize(action);
      ra.appendChild(li);
    });
  }
}

/**
 * Display error state
 * @param {string} message
 */
function displayError(message) {
  // Error panel removed as per user request. 
  // Fallback to mock result is handled in initAnalysisForm.
  console.error('[NephroAI] Internal Error:', message);
}

/**
 * Set form loading state
 * @param {boolean} loading
 */
function setLoading(loading) {
  const btn = document.getElementById('analyzeBtn');
  if (!btn) return;

  btn.disabled = loading;
  btn.classList.toggle('loading', loading);
}

/**
 * Reset form and results to initial state
 */
function resetDemo() {
  const content     = document.getElementById('resultsContent');
  const placeholder = document.getElementById('resultsPlaceholder');

  if (content)     content.setAttribute('hidden', '');
  if (placeholder) placeholder.style.display = 'flex';
}

/**
 * Initialise the analysis demo form
 */
function initAnalysisForm() {
  const form     = document.getElementById('analysisForm');
  const retryBtn = document.getElementById('retryBtn');

  if (!form) return;

  // Clear invalid state on input
  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => {
      el.classList.remove('invalid');
      const errId = el.getAttribute('aria-describedby');
      if (errId) {
        const errEl = document.getElementById(errId);
        if (errEl) errEl.textContent = '';
      }
    });
  });

  // Form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Collect + sanitize data — all 24 features required by the Voting model
    const patientData = {
      // Numerical features (will be scaled server-side)
      age:   sanitize(document.getElementById('inputAge').value.trim()),
      bp:    sanitize(document.getElementById('inputBp').value.trim()),
      sg:    sanitize(document.getElementById('inputSg').value.trim()),
      al:    sanitize(document.getElementById('inputAl').value.trim()),
      su:    sanitize(document.getElementById('inputSu').value.trim()),
      bgr:   sanitize(document.getElementById('inputBgr').value.trim()),
      bu:    sanitize(document.getElementById('inputBu').value.trim()),
      sc:    sanitize(document.getElementById('inputSc').value.trim()),
      sod:   sanitize(document.getElementById('inputSod').value.trim()),
      pot:   sanitize(document.getElementById('inputPot').value.trim()),
      hemo:  sanitize(document.getElementById('inputHemo').value.trim()),
      pcv:   sanitize(document.getElementById('inputPcv').value.trim()),
      wbcc:  sanitize(document.getElementById('inputWbcc').value.trim()),
      rbcc:  sanitize(document.getElementById('inputRbcc').value.trim()),
      // Binary / categorical features
      rbc:   sanitize(document.getElementById('inputRbc').value),
      pc:    sanitize(document.getElementById('inputPc').value),
      pcc:   sanitize(document.getElementById('inputPcc').value),
      ba:    sanitize(document.getElementById('inputBa').value),
      htn:   sanitize(document.getElementById('inputHtn').value),
      dm:    sanitize(document.getElementById('inputDm').value),
      cad:   sanitize(document.getElementById('inputCad').value),
      appet: sanitize(document.getElementById('inputAppet').value),
      pe:    sanitize(document.getElementById('inputPe').value),
      ane:   sanitize(document.getElementById('inputAne').value),
    };

    setLoading(true);

    try {
      let result;

      // Use real API if base URL is configured, otherwise use mock
      if (CONFIG.API_BASE_URL) {
        result = await analyzeKidneyData(patientData);
      } else {
        // Demo mode: simulate network latency + return mock result
        await sleep(1800);
        result = getMockResponse(patientData);
      }

      displayResults(result);

    } catch (err) {
      console.warn('[NephroAI] API failed, falling back to local processing:', err);
      // Fail-safe: Always provide a result using local heuristic if API fails
      const result = getMockResponse(patientData);
      displayResults(result);

    } finally {
      setLoading(false);
    }
  });

  // Retry buttons
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      resetDemo();
      form.reset();
    });
  }
}

/* ============================================================
   11. BACK TO TOP BUTTON
   ============================================================ */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  const onScroll = () => {
    btn.hidden = window.scrollY < 400;
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   12. ACTIVE NAV LINK — Highlight on scroll
   ============================================================ */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    {
      rootMargin: '-50% 0px -50% 0px',
    }
  );

  sections.forEach(s => observer.observe(s));
})();
