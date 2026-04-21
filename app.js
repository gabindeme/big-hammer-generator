/* =========================================
   BIG HAMER GENERATOR — App Logic
   ========================================= */

'use strict';

// ── Data ────────────────────────────────────────────────────────────────────

const INGREDIENTS = {
  viandes: [
    { name: 'Boeuf', emoji: '🥩' },
    { name: 'Poulet', emoji: '🍗' },
    { name: 'Steak haché', emoji: '🍔' },
    { name: 'Merguez', emoji: '🌭' },
    { name: 'Double bacon', emoji: '🥓' },
    { name: 'Oeuf', emoji: '🍳' },
  ],
  fromages: [
    { name: 'Emmental', emoji: '🧀' },
    { name: 'Cheddar', emoji: '🧀' },
    { name: 'Chèvre', emoji: '🐐' },
  ],
  crudites: [
    { name: 'Tomate', emoji: '🍅' },
    { name: 'Maïs', emoji: '🌽' },
    { name: 'Lentilles', emoji: '🫘' },
    { name: 'Tomates séchées', emoji: '🍅' },
    { name: 'Oignons', emoji: '🧅' },
    { name: 'Poivron', emoji: '🫑' },
    { name: 'Champignon', emoji: '🍄' },
    { name: 'Jalapeño', emoji: '🌶️' },
    { name: 'Salade', emoji: '🥬' },
    { name: 'Quinoa', emoji: '🌾' },
    { name: 'Carottes râpées', emoji: '🥕' },
    { name: 'Olives', emoji: '🫒' },
    { name: 'Pois chiches', emoji: '🫘' },
    { name: 'Pickles', emoji: '🥒' },
    { name: 'Oignons frits', emoji: '🧅' },
    { name: 'Cacahuètes', emoji: '🥜' },
    { name: 'Concombre', emoji: '🥒' },
    { name: 'Gouda', emoji: '🧀' },
  ],
  sauces: [
    { name: 'Barbecue', emoji: '🫙' },
    { name: 'Poivre', emoji: '🌶️' },
    { name: 'Samouraï', emoji: '⚔️' },
    { name: 'Curry', emoji: '🟡' },
    { name: 'Ketchup', emoji: '🍅' },
    { name: 'Mayo', emoji: '🫙' },
    { name: 'Harissa', emoji: '🔥' },
    { name: 'Fromage blanc', emoji: '🍶' },
  ],
};

// ── State ────────────────────────────────────────────────────────────────────

let currentType = 'hammer';   // 'hammer' | 'big-hammer'
let isSpinning = false;
let history = JSON.parse(localStorage.getItem('bh_history') || '[]');
let currentSandwich = null;
let excludedIngredients = JSON.parse(localStorage.getItem('bh_excluded') || '[]');

// ── Helpers ──────────────────────────────────────────────────────────────────

function getAvailableIngredients(categoryList) {
  const available = categoryList.filter(item => !excludedIngredients.includes(item.name));
  return available.length > 0 ? available : categoryList; // always return at least something
}

function toggleExclusion(name, isExcluded) {
  if (isExcluded) {
    if (!excludedIngredients.includes(name)) excludedIngredients.push(name);
  } else {
    excludedIngredients = excludedIngredients.filter(n => n !== name);
  }
  localStorage.setItem('bh_excluded', JSON.stringify(excludedIngredients));
}

/** Pick a random item from an array */
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Pick N unique items from an array */
function pickUniqueN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

/** Pick N items (duplicates allowed) */
function pickN(arr, n) {
  return Array.from({ length: n }, () => pickRandom(arr));
}

function now() {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// ── DOM refs ─────────────────────────────────────────────────────────────────

const $ = id => document.getElementById(id);

const el = {
  btnSettingsToggle: $('btnSettingsToggle'),
  btnCloseSettings: $('btnCloseSettings'),
  settingsModal: $('settingsModal'),
  settingsOverlay: $('settingsOverlay'),
  settingsBody: $('settingsBody'),
  cardHammer: $('cardHammer'),
  cardBigHammer: $('cardBigHammer'),
  btnGenerate: $('btnGenerate'),
  btnRerollCrudites: $('btnRerollCrudites'),
  btnShare: $('btnShare'),
  btnHistoryToggle: $('btnHistoryToggle'),
  btnCloseHistory: $('btnCloseHistory'),
  btnClearHistory: $('btnClearHistory'),
  historyPanel: $('historyPanel'),
  historyOverlay: $('historyOverlay'),
  historyList: $('historyList'),
  historyCount: $('historyCount'),
  shareToast: $('shareToast'),
  emptyState: $('emptyState'),
  resultTypeBadge: $('resultTypeBadge'),
  viande1: $('viande1'),
  viande2: $('viande2'),
  fromage1: $('fromage1'),
  sauce1: $('sauce1'),
  reel1: $('reel1'),
  reel2: $('reel2'),
  reel3: $('reel3'),
  resultCard: $('resultCard'),
};

// ── Background particles ──────────────────────────────────────────────────────

function initParticles() {
  const container = $('bgParticles');
  const sizes = [4, 6, 8, 10, 14, 18];
  const colors = ['var(--c-primary)', 'var(--c-accent)', 'var(--c-gold)', 'rgba(255,255,255,0.4)'];
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const sz = sizes[Math.floor(Math.random() * sizes.length)];
    p.style.cssText = `
      width:${sz}px; height:${sz}px;
      left:${Math.random() * 100}%;
      top:${Math.random() * 100}%;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      --dur:${10 + Math.random() * 16}s;
      --delay:${-Math.random() * 10}s;
    `;
    container.appendChild(p);
  }
}

// ── Type selection ────────────────────────────────────────────────────────────

function selectType(type) {
  currentType = type;
  el.cardHammer.classList.toggle('active', type === 'hammer');
  el.cardBigHammer.classList.toggle('active', type === 'big-hammer');
  // Show/hide second viande chip
  el.viande2.classList.toggle('hidden', type === 'hammer');
  el.resultTypeBadge.textContent = type === 'hammer' ? '🍔 Hammer' : '🔥 Big Hammer';
  // Reset result if already showing
  if (currentSandwich) generateSandwich();
}

el.cardHammer.addEventListener('click', () => selectType('hammer'));
el.cardBigHammer.addEventListener('click', () => selectType('big-hammer'));

// ── Chip animation ────────────────────────────────────────────────────────────

function animateChip(chip, ingredient, delay = 0) {
  return new Promise(resolve => {
    setTimeout(() => {
      chip.classList.remove('animating-in', 'revealed');
      void chip.offsetWidth; // reflow
      const emojiEl = chip.querySelector('.chip-emoji');
      const nameEl = chip.querySelector('.chip-name');
      emojiEl.textContent = ingredient.emoji;
      nameEl.textContent = ingredient.name;
      chip.classList.add('animating-in', 'revealed');
      chip.addEventListener('animationend', () => resolve(), { once: true });
    }, delay);
  });
}

// ── Slot Machine ──────────────────────────────────────────────────────────────

/**
 * Spin a single reel to a target ingredient.
 * @param {HTMLElement} reel    - the .slot-reel element
 * @param {object[]}    items   - full list of possible ingredients
 * @param {object}      target  - the winning ingredient
 * @param {number}      delay   - ms before stopping
 */
function spinReel(reel, items, target, stopDelay) {
  return new Promise(resolve => {
    const ITEM_H = 90; // must match CSS .slot-item height
    const EXTRA_SPINS = 20 + Math.floor(Math.random() * 12);

    // Build reel content: random items + target at end
    const reelItems = [];
    for (let i = 0; i < EXTRA_SPINS; i++) reelItems.push(pickRandom(items));
    reelItems.push(target); // last = winner

    // Clear & populate reel
    reel.innerHTML = '';
    reelItems.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = 'slot-item' + (idx === reelItems.length - 1 ? ' winner' : '');
      div.innerHTML = `<span class="slot-emoji">${item.emoji}</span><span class="slot-name">${item.name}</span>`;
      reel.appendChild(div);
    });

    // Start position (top)
    reel.style.transform = 'translateY(0)';
    reel.style.transition = 'none';

    // Target translateY: scroll so winner aligns in the center of the container
    const finalY = -(reelItems.length - 1) * ITEM_H;

    // After delay, ease to final position
    setTimeout(() => {
      const totalDuration = 1200 + stopDelay * 0.4; // ms
      reel.style.transition = `transform ${totalDuration}ms cubic-bezier(0.13, 0.72, 0.22, 1.0)`;
      reel.style.transform = `translateY(${finalY}px)`;

      setTimeout(() => {
        // Bounce effect
        reel.style.transition = 'transform 0.12s ease-out';
        reel.style.transform = `translateY(${finalY + 6}px)`;
        setTimeout(() => {
          reel.style.transition = 'transform 0.18s ease-in-out';
          reel.style.transform = `translateY(${finalY}px)`;
          setTimeout(resolve, 200);
        }, 130);
      }, totalDuration);
    }, stopDelay);
  });
}

// ── Main generation logic ─────────────────────────────────────────────────────

async function generateCrudites(crudites) {
  const [c1, c2, c3] = crudites;
  const baseDelay = 120;
  
  const available = getAvailableIngredients(INGREDIENTS.crudites);

  return Promise.all([
    spinReel(el.reel1, available, c1, 0),
    spinReel(el.reel2, available, c2, baseDelay * 2),
    spinReel(el.reel3, available, c3, baseDelay * 4),
  ]);
}

async function generateSandwich() {
  if (isSpinning) return;
  isSpinning = true;

  // Disable buttons
  el.btnGenerate.disabled = true;
  el.btnGenerate.classList.add('spinning');
  el.btnRerollCrudites.disabled = true;

  // Hide empty state
  el.emptyState.classList.add('hidden');

  // Fetch available ingredients based on settings
  const availViandes = getAvailableIngredients(INGREDIENTS.viandes);
  const availFromages = getAvailableIngredients(INGREDIENTS.fromages);
  const availCrudites = getAvailableIngredients(INGREDIENTS.crudites);
  const availSauces = getAvailableIngredients(INGREDIENTS.sauces);

  // Build sandwich
  const isBig = currentType === 'big-hammer';
  const viandes = isBig ? pickN(availViandes, 2) : [pickRandom(availViandes)];
  const fromage = pickRandom(availFromages);
  
  let cruditesItems = pickUniqueN(availCrudites, Math.min(3, availCrudites.length));
  while (cruditesItems.length < 3) cruditesItems.push(pickRandom(availCrudites));
  const crudites = cruditesItems;

  const sauce = pickRandom(availSauces);

  currentSandwich = { type: currentType, viandes, fromage, crudites, sauce, time: now() };

  // Show type badge
  el.resultTypeBadge.style.display = 'inline-flex';
  el.resultTypeBadge.textContent = isBig ? '🔥 Big Hammer' : '🍔 Hammer';

  // Animate viandes
  el.viande1.classList.remove('hidden');
  el.viande2.classList.toggle('hidden', !isBig);

  const viandeProm = animateChip(el.viande1, viandes[0], 0).then(() => {
    if (isBig) return animateChip(el.viande2, viandes[1], 80);
  });

  // Animate fromage (slight delay)
  const fromageProm = animateChip(el.fromage1, fromage, 220);

  // Slot machine for crudités
  const crudProm = generateCrudites(crudites);

  // Animate sauce (after crudités start)
  const sauceProm = new Promise(r => setTimeout(r, 600)).then(() =>
    animateChip(el.sauce1, sauce, 0)
  );

  await Promise.all([viandeProm, fromageProm, crudProm, sauceProm]);

  // Add to history
  addToHistory(currentSandwich);

  // Re-enable
  isSpinning = false;
  el.btnGenerate.disabled = false;
  el.btnGenerate.classList.remove('spinning');
  el.btnRerollCrudites.disabled = false;
}

async function rerollCrudites() {
  if (isSpinning || !currentSandwich) return;
  isSpinning = true;
  el.btnRerollCrudites.disabled = true;
  el.btnGenerate.disabled = true;

  const availCrudites = getAvailableIngredients(INGREDIENTS.crudites);
  let cruditesItems = pickUniqueN(availCrudites, Math.min(3, availCrudites.length));
  while (cruditesItems.length < 3) cruditesItems.push(pickRandom(availCrudites));
  
  const crudites = cruditesItems;
  currentSandwich.crudites = crudites;

  await generateCrudites(crudites);

  isSpinning = false;
  el.btnRerollCrudites.disabled = false;
  el.btnGenerate.disabled = false;
}

el.btnGenerate.addEventListener('click', generateSandwich);
el.btnRerollCrudites.addEventListener('click', rerollCrudites);

// ── History ───────────────────────────────────────────────────────────────────

function saveHistory() {
  localStorage.setItem('bh_history', JSON.stringify(history.slice(0, 20)));
}

function addToHistory(sandwich) {
  history.unshift(sandwich);
  if (history.length > 20) history = history.slice(0, 20);
  saveHistory();
  renderHistory();
  updateHistoryCount();
}

function updateHistoryCount() {
  el.historyCount.textContent = history.length;
}

function renderHistory() {
  if (history.length === 0) {
    el.historyList.innerHTML = '<div class="history-empty">Aucun sandwich généré</div>';
    return;
  }
  el.historyList.innerHTML = history.map((s, i) => {
    const typeLabel = s.type === 'big-hammer' ? '🔥 Big Hammer' : '🍔 Hammer';
    const viandesStr = s.viandes.map(v => `${v.emoji} ${v.name}`).join(', ');
    const cruditesStr = s.crudites.map(c => `${c.emoji} ${c.name}`).join(', ');
    const titleVal = s.title ? escapeHtml(s.title) : '';
    const titlePlaceholder = 'Ajouter un titre…';
    return `
      <div class="history-item" style="animation-delay:${i * 0.04}s" data-index="${i}">
        <div class="history-item-header">
          <span class="history-item-type">${typeLabel}</span>
          <span class="history-item-time">${s.time || ''}</span>
        </div>
        <div class="history-title-wrap">
          <input
            type="text"
            class="history-title-input"
            data-index="${i}"
            value="${titleVal}"
            placeholder="${titlePlaceholder}"
            maxlength="40"
            aria-label="Titre du sandwich"
          />
        </div>
        <div class="history-item-content">
          <div class="history-row">
            <span class="history-row-icon">🥩</span>
            <span class="history-row-value">${viandesStr}</span>
          </div>
          <div class="history-row">
            <span class="history-row-icon">🧀</span>
            <span class="history-row-value">${s.fromage.emoji} ${s.fromage.name}</span>
          </div>
          <div class="history-row">
            <span class="history-row-icon">🥗</span>
            <span class="history-row-value">${cruditesStr}</span>
          </div>
          <div class="history-row">
            <span class="history-row-icon">🫙</span>
            <span class="history-row-value">${s.sauce.emoji} ${s.sauce.name}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Bind title input events after DOM is built
  el.historyList.querySelectorAll('.history-title-input').forEach(input => {
    input.addEventListener('change', onTitleChange);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') input.blur(); });
  });
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function onTitleChange(e) {
  const idx = parseInt(e.target.dataset.index, 10);
  if (isNaN(idx) || idx < 0 || idx >= history.length) return;
  history[idx].title = e.target.value.trim();
  saveHistory();
  // Flash save confirmation on the input
  e.target.classList.add('title-saved');
  setTimeout(() => e.target.classList.remove('title-saved'), 900);
}

// History panel
function openHistory() {
  el.historyPanel.classList.add('open');
  el.historyOverlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
}
function closeHistory() {
  el.historyPanel.classList.remove('open');
  el.historyOverlay.classList.remove('visible');
  document.body.style.overflow = '';
}

el.btnHistoryToggle.addEventListener('click', openHistory);
el.btnCloseHistory.addEventListener('click', closeHistory);
el.historyOverlay.addEventListener('click', closeHistory);

el.btnClearHistory.addEventListener('click', () => {
  history = [];
  saveHistory();
  renderHistory();
  updateHistoryCount();
});

// ── Share ─────────────────────────────────────────────────────────────────────

const SITE_URL = 'https://big-hammer-generator.vercel.app/';

function formatSandwichText(s) {
  const typeLabel = s.type === 'big-hammer' ? '🔥 Big Hammer' : '🍔 Hammer';
  const viandesStr = s.viandes.map(v => `${v.emoji} ${v.name}`).join(' + ');
  const cruditesStr = s.crudites.map(c => `${c.emoji} ${c.name}`).join(', ');
  const titleLine = s.title ? `✏️ "${s.title}"\n` : '';
  return [
    `${titleLine}${typeLabel}`,
    `🥩 ${viandesStr}`,
    `🧀 ${s.fromage.emoji} ${s.fromage.name}`,
    `🥗 ${cruditesStr}`,
    `🫙 ${s.sauce.emoji} ${s.sauce.name}`,
    `\n➡️ Génère le tien sur Big Hammer Generator !`,
    SITE_URL,
  ].join('\n');
}

function showToast(message, duration = 2500) {
  el.shareToast.textContent = message;
  el.shareToast.classList.add('visible');
  setTimeout(() => el.shareToast.classList.remove('visible'), duration);
}

el.btnShare.addEventListener('click', async () => {
  if (!currentSandwich) {
    showToast('⚠️ Génère d\'abord un sandwich !');
    return;
  }
  const text = formatSandwichText(currentSandwich);

  if (navigator.share) {
    try {
      await navigator.share({ title: 'Mon sandwich Big Hammer 🍔', text });
      return;
    } catch (_) { /* fall through to clipboard */ }
  }

  try {
    await navigator.clipboard.writeText(text);
    showToast('✅ Sandwich copié dans le presse-papier !');
  } catch (_) {
    showToast('❌ Impossible de copier');
  }
});

// ── Settings ──────────────────────────────────────────────────────────────────

function renderSettings() {
  el.settingsBody.innerHTML = '<p class="settings-desc">Décoche les ingrédients que tu ne souhaites pas voir apparaître au tirage.</p>';

  const categories = [
    { key: 'viandes', icon: '🥩', label: 'Viandes' },
    { key: 'fromages', icon: '🧀', label: 'Fromages' },
    { key: 'crudites', icon: '🥗', label: 'Crudités' },
    { key: 'sauces', icon: '🫙', label: 'Sauces' }
  ];

  categories.forEach(cat => {
    const group = document.createElement('div');
    group.className = 'settings-group';
    group.innerHTML = `<div class="settings-group-title"><span class="group-icon">${cat.icon}</span> ${cat.label}</div>`;
    
    INGREDIENTS[cat.key].forEach(item => {
      const isChecked = !excludedIngredients.includes(item.name);
      
      const itemEl = document.createElement('div');
      itemEl.className = 'settings-item';
      itemEl.innerHTML = `
        <div class="settings-item-label">
          <span class="settings-item-emoji">${item.emoji}</span>
          <span>${item.name}</span>
        </div>
        <label class="switch">
          <input type="checkbox" value="${item.name}" ${isChecked ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      `;
      group.appendChild(itemEl);
      
      const input = itemEl.querySelector('input');
      input.addEventListener('change', (e) => {
        toggleExclusion(e.target.value, !e.target.checked);
      });
    });
    
    el.settingsBody.appendChild(group);
  });
}

function openSettings() {
  renderSettings();
  el.settingsModal.classList.add('open');
  el.settingsOverlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function closeSettings() {
  el.settingsModal.classList.remove('open');
  el.settingsOverlay.classList.remove('visible');
  document.body.style.overflow = '';
}

el.btnSettingsToggle.addEventListener('click', openSettings);
el.btnCloseSettings.addEventListener('click', closeSettings);
el.settingsOverlay.addEventListener('click', closeSettings);

// ── Init ──────────────────────────────────────────────────────────────────────

function init() {
  initParticles();
  renderHistory();
  updateHistoryCount();
  // Make sure 2nd viande is hidden initially (hammer mode)
  el.viande2.classList.add('hidden');
}

init();
