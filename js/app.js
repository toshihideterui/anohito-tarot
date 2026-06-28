/**
 * app.js
 * -----------------------------------
 * メインアプリケーションロジック
 * - カード引き（入力不要）
 * - Gemini API 呼び出し
 * - 履歴管理（localStorage）
 * -----------------------------------
 */

// ========== DOM要素 ==========
const invokeBtn          = document.getElementById('invokeBtn');
const cardScene          = document.getElementById('cardScene');
const cardFlipper        = document.getElementById('cardFlipper');
const cardBackImg        = document.getElementById('cardBackImg');
const loadingInline      = document.getElementById('loadingInline');
const resultArea         = document.getElementById('resultArea');
const resultMessage      = document.getElementById('resultMessage');
const resultArcanaVisual = document.getElementById('resultArcanaVisual');
const resultCardImg      = document.getElementById('resultCardImg');
const reversedBadge      = document.getElementById('reversedBadge');
const resultArcanaEn     = document.getElementById('resultArcanaEn');
const resultArcanaJa     = document.getElementById('resultArcanaJa');
const starsRow           = document.getElementById('starsRow');
const againBtn           = document.getElementById('againBtn');
const historyLink        = document.getElementById('historyLink');
const modalOverlay       = document.getElementById('modalOverlay');
const modalClose         = document.getElementById('modalClose');
const historyList        = document.getElementById('historyList');
const storesBtn          = document.getElementById('storesBtn');

// ========== 状態変数 ==========
let isFlipped   = false;
let isAnimating = false;

// ========== 初期化 ==========
function init() {
  // STORESリンクを設定
  if (storesBtn && CONFIG.STORES_URL) {
    storesBtn.href   = CONFIG.STORES_URL;
    storesBtn.target = '_blank';
    storesBtn.rel    = 'noopener noreferrer';
  }

  cardScene.addEventListener('click', handleInvoke);
  invokeBtn.addEventListener('click', handleInvoke);
  againBtn.addEventListener('click', handleReset);
  historyLink.addEventListener('click', openHistory);
  modalClose.addEventListener('click', closeHistory);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeHistory();
  });
}

// ========== カードを引く ==========
async function handleInvoke() {
  if (isAnimating || isFlipped) return;
  isAnimating = true;

  const { card, isReversed } = drawCard();

  invokeBtn.disabled = true;
  loadingInline.classList.add('show');

  // カード表面画像を事前ロード（フリップ後に見える面）
  await loadCardImage(cardBackImg, card.image);

  await sleep(400);
  flipCard();

  const message = await fetchMessage(card, isReversed);

  showResult(card, isReversed, message);

  saveHistory({
    date:     new Date().toLocaleString('ja-JP'),
    cardEn:   card.en,
    cardJa:   card.ja,
    reversed: isReversed,
    message,
  });

  loadingInline.classList.remove('show');
  isAnimating = false;
}

// ========== 画像ロード（フォールバック付き） ==========
function loadCardImage(imgEl, src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      imgEl.src = src;
      imgEl.style.display = 'block';
      resolve();
    };
    img.onerror = () => {
      // 画像が存在しない場合はフォールバック表示
      imgEl.src = '';
      imgEl.style.display = 'none';
      imgEl.parentElement.dataset.fallback = 'true';
      resolve();
    };
    img.src = src;
  });
}

// ========== カードフリップ ==========
function flipCard() {
  cardFlipper.classList.add('flipped');
  cardScene.classList.add('glow-anim');
  isFlipped = true;
}

// ========== 結果表示 ==========
function showResult(card, isReversed, message) {
  resultMessage.innerHTML = message.replace(/\n/g, '<br>');

  // 結果エリアのカード画像（フォールバック付き）
  loadCardImage(resultCardImg, card.image).then(() => {
    if (!resultCardImg.src || resultCardImg.style.display === 'none') {
      // 画像なしのフォールバック：絵文字で代替
      resultArcanaVisual.innerHTML = `<span style="font-size:40px;display:flex;align-items:center;justify-content:center;height:100%">${card.emoji}</span>`;
    }
  });

  resultArcanaVisual.classList.toggle('reversed', isReversed);
  reversedBadge.style.display = isReversed ? 'inline-block' : 'none';
  resultArcanaEn.textContent  = card.en;
  resultArcanaJa.textContent  = card.ja;
  starsRow.textContent        = getStars(card, isReversed);

  resultArea.classList.add('show', 'fade-in-up');

  setTimeout(() => {
    resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 400);
}

// ========== Gemini API 呼び出し ==========
async function fetchMessage(card, isReversed) {
  if (!CONFIG.GEMINI_API_KEY || CONFIG.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    await sleep(800);
    return getCardMessage(card, isReversed);
  }

  const prompt = `
あなたはプロの恋愛タロット占い師です。
次の条件でタロット占いの結果メッセージを日本語で生成してください。

- 引いたカード: ${card.ja}（${card.en}）${isReversed ? '【逆位置】' : '【正位置】'}
- テーマ: 気になるあの人の気持ち

要件:
- 70〜100文字程度でまとめてください
- 神秘的で温かみのある文体にしてください
- 具体的でポジティブ（逆位置でも希望を感じさせる）内容にしてください
- 「。」で文を区切ってください

メッセージのみを出力してください（前置きや説明は不要）。
`.trim();

  try {
    const response = await fetch(
      `${CONFIG.GEMINI_API_URL}?key=${CONFIG.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 200 },
        }),
      }
    );
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? text.trim() : getCardMessage(card, isReversed);
  } catch (err) {
    console.warn('Gemini API エラー。デフォルトメッセージを使用します。', err);
    return getCardMessage(card, isReversed);
  }
}

// ========== リセット ==========
function handleReset() {
  cardFlipper.classList.remove('flipped');
  cardScene.classList.remove('glow-anim');
  isFlipped = false;

  resultArea.classList.remove('show', 'fade-in-up');
  invokeBtn.disabled = false;

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== 履歴管理 ==========
const HISTORY_KEY = 'anohito_tarot_history';

function saveHistory(entry) {
  const history = getHistory();
  history.unshift(entry);
  if (history.length > CONFIG.MAX_HISTORY) history.pop();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
  catch { return []; }
}

function openHistory() {
  const history = getHistory();
  historyList.innerHTML = history.length === 0
    ? '<div class="history-empty">まだ鑑定記録がありません</div>'
    : history.map(h => `
        <div class="history-item">
          <div class="history-date">${h.date}</div>
          <div class="history-card">${h.cardJa}（${h.cardEn}）${h.reversed ? '【逆位置】' : ''}</div>
          <div class="history-msg">${h.message}</div>
        </div>`).join('');
  modalOverlay.classList.add('show');
}

function closeHistory() {
  modalOverlay.classList.remove('show');
}

// ========== ユーティリティ ==========
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ========== 起動 ==========
document.addEventListener('DOMContentLoaded', init);
