/**
 * app.js
 * -----------------------------------
 * メインアプリケーションロジック
 * - カード引き（入力不要）
 * - モックアップ完全移植対応
 * -----------------------------------
 */

// ========== DOM要素 ==========
const invokeBtn          = document.getElementById('invokeBtn');
const initAction         = document.getElementById('initAction');
const cardScene          = document.getElementById('cardScene');
const cardFlipper        = document.getElementById('cardFlipper');
const cardBackImg        = document.getElementById('cardBackImg');
const cardGuideTitle     = document.getElementById('cardGuideTitle');
const cardMainMessage    = document.getElementById('cardMainMessage');
const loadingInline      = document.getElementById('loadingInline');
const loadingText        = document.getElementById('loadingText');
const resultExtras       = document.getElementById('resultExtras');
const starsRow           = document.getElementById('starsRow');
const againBtn           = document.getElementById('againBtn');
const historyLink        = document.getElementById('historyLink');
const modalOverlay       = document.getElementById('modalOverlay');
const modalClose         = document.getElementById('modalClose');
const historyList        = document.getElementById('historyList');
const debugToast         = document.getElementById('debugToast');

// ========== 状態変数 ==========
let isFlipped   = false;
let isAnimating = false;

// ========== 初期化 ==========
function init() {
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

  // カード表面画像を事前ロード
  await loadCardImage(cardBackImg, card.image);

  // ガイドタイトルとメッセージの初期セット（フリップ時にすぐ読めるようにする）
  cardGuideTitle.textContent = `― ${card.ja}の導き ―`;
  cardMainMessage.textContent = '運命の糸を解いています…';

  await sleep(400);
  flipCard();

  // AIメッセージを取得
  const message = await fetchMessage(card, isReversed);

  // メッセージと結果追加要素を表示
  showResult(card, isReversed, message);

  // 履歴に保存
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

// ========== 画像ロード ==========
function loadCardImage(imgEl, src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      imgEl.src = src;
      resolve();
    };
    img.onerror = () => {
      imgEl.src = 'images/cards/card_moon.png'; // 最悪の場合MOON画像にフォールバック
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
  // メッセージ切り替え
  cardMainMessage.innerHTML = message.replace(/\n/g, '<br>');
  cardGuideTitle.textContent = `― ${card.ja}の導き ―`;
  if (isReversed) {
    cardGuideTitle.textContent += ' (逆位置)';
  }

  // 星評価を設定
  starsRow.textContent = getStars(card, isReversed);

  // アクションボタンを切り替え
  initAction.style.display = 'none';
  resultExtras.classList.add('show');
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
- 30〜50文字程度で、短く一言で心に響くメッセージにしてください
- 占いカードの中央に配置されるため、長い文章は避けてください
- 神秘的で温かみのある文体にしてください
- 具体的でポジティブ（逆位置でも希望を感じさせる）内容にしてください
- 「。」で文を区切ってください

メッセージのみを出力してください（前置きや説明は不要）。
`.trim();

  // リトライ設定（429対策：無料枠のRPM制限を考慮して間隔を長めにする）
  const MAX_RETRIES = 1; // リトライは1回のみにしてAPI負荷を下げる
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        if (loadingText) loadingText.textContent = `星に再び問いかけています… (少し時間をおいています)`;
        await sleep(4000); // 4秒待ってから再試行
      }

      const response = await fetch(
        `${CONFIG.GEMINI_API_URL}?key=${CONFIG.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.9, maxOutputTokens: 100 },
          }),
        }
      );

      if (response.status === 429) {
        if (attempt < MAX_RETRIES) continue;
        // 2回とも429なら即座にデフォルトメッセージで対応
        console.warn('Gemini API: レート制限のためデフォルトメッセージに切り替えます');
        return getCardMessage(card, isReversed);
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return text ? text.trim() : getCardMessage(card, isReversed);

    } catch (err) {
      if (attempt < MAX_RETRIES) continue;
      return getCardMessage(card, isReversed);
    }
  }
  return getCardMessage(card, isReversed);
}

// ========== リセット ==========
function handleReset() {
  cardFlipper.classList.remove('flipped');
  cardScene.classList.remove('glow-anim');
  isFlipped = false;

  resultExtras.classList.remove('show');
  initAction.style.display = 'block';
  invokeBtn.disabled = false;
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

function showToast(msg, durationMs = 5000) {
  if (!debugToast) return;
  debugToast.textContent = msg;
  debugToast.style.display = 'block';
  clearTimeout(debugToast._timer);
  debugToast._timer = setTimeout(() => {
    debugToast.style.display = 'none';
  }, durationMs);
}

// ========== 起動 ==========
document.addEventListener('DOMContentLoaded', init);
