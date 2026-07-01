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
const againBtn           = document.getElementById('againBtn');
const appContainer       = document.getElementById('appContainer');
const initAction         = document.getElementById('initAction');
const cardScene          = document.getElementById('cardScene');
const cardFlipper        = document.getElementById('cardFlipper');
const cardBackImg        = document.getElementById('cardBackImg');
const cardGuideTitle     = document.getElementById('cardGuideTitle'); // null可
const cardMainMessage    = document.getElementById('cardMainMessage');
const cardNameEn         = document.getElementById('cardNameEn');
const cardNameJa         = document.getElementById('cardNameJa');
const resultCardPanel    = document.getElementById('resultCardPanel');
const resultCardMessage  = document.getElementById('resultCardMessage');
const resultCardNameEn   = document.getElementById('resultCardNameEn');
const resultCardNameJa   = document.getElementById('resultCardNameJa');
const loadingInline      = document.getElementById('loadingInline');
const loadingText        = document.getElementById('loadingText');
const loveFortune        = document.getElementById('loveFortune');
const starsRow           = document.getElementById('starsRow');
const storesLink         = document.getElementById('storesLink');
const debugToast         = document.getElementById('debugToast');

// ========== 状態変数 ==========
let isFlipped   = false;
let isAnimating = false;

// ========== 初期化 ==========
function init() {
  cardScene.addEventListener('click', handleInvoke);
  invokeBtn.addEventListener('click', handleInvoke);
  againBtn.addEventListener('click', handleReset);
  if (storesLink && CONFIG.STORES_URL) {
    storesLink.href = CONFIG.STORES_URL;
  }
}

// ========== カードを引く ==========
async function handleInvoke() {
  if (isAnimating || isFlipped) return;
  isAnimating = true;
  setBusy(true);

  const { card, isReversed } = drawCard();

  loadingInline.classList.add('show');
  if (loadingText) loadingText.textContent = '星に問いかけています…';

  // 画面上のカード画像は共通画像を使う。card.image は内部情報として保持する。
  if (cardBackImg) await loadCardImage(cardBackImg, card.image);

  // ガイドタイトルとメッセージの初期セット（フリップ時にすぐ読めるようにする）
  if (cardGuideTitle) cardGuideTitle.textContent = `― ${card.ja}の導き ―`;
  cardMainMessage.textContent = '運命の糸を解いています…';
  cardNameEn.textContent = '';
  cardNameJa.textContent = '';
  resultCardMessage.textContent = '運命の糸を解いています…';
  resultCardNameEn.textContent = '';
  resultCardNameJa.textContent = '';

  await sleep(400);
  flipCard();

  // AIメッセージを取得
  const message = await fetchMessage(card, isReversed);

  // メッセージと結果追加要素を表示
  showResult(card, isReversed, message);

  loadingInline.classList.remove('show');
  setBusy(false);
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
      imgEl.src = 'images/cards/card_moon.png';
      resolve();
    };
    img.src = src;
  });
}

// ========== カードフリップ ==========
function flipCard() {
  cardFlipper.classList.add('flipped');
  cardScene.classList.add('glow-anim');
  cardScene.classList.add('result-shown');
  if (resultCardPanel) resultCardPanel.setAttribute('aria-hidden', 'false');
  isFlipped = true;
}

// ========== 結果表示 ==========
function showResult(card, isReversed, message) {
  // メッセージ切り替え
  cardMainMessage.innerHTML = message.replace(/\n/g, '<br>');
  resultCardMessage.innerHTML = message.replace(/\n/g, '<br>');
  if (cardGuideTitle) {
    cardGuideTitle.textContent = `― 月の導き ―`;
  }

  // カード名を設定（逆位置は下に小さく表示）
  cardNameEn.textContent = card.en;
  cardNameJa.innerHTML = isReversed
    ? `${card.ja}<br><span style="font-size:8px;color:#e08080;letter-spacing:1px;">逆 位 置</span>`
    : card.ja;
  resultCardNameEn.textContent = card.en;
  resultCardNameJa.innerHTML = isReversed
    ? `${card.ja}<br><span style="font-size:8px;color:#e08080;letter-spacing:1px;">逆 位 置</span>`
    : card.ja;

  // 星評価を設定してフェードイン
  starsRow.textContent = getStars(card, isReversed);
  if (loveFortune) {
    loveFortune.classList.add('show');
  }

  // アクションボタンを切り替え
  invokeBtn.style.display = 'none';
  againBtn.style.display = 'flex';
  if (appContainer) {
    appContainer.classList.remove('init-bg');
    appContainer.classList.add('result-bg');
  }
}

// ========== Gemini API 呼び出し（プロキシ経由） ==========
async function fetchMessage(card, isReversed) {
  const prompt = `
あなたはプロの恋愛タロット占い師です。
次の条件でタロット占いの結果メッセージを日本語で生成してください。

- 引いたカード: ${card.ja}（${card.en}）${isReversed ? '【逆位置】' : '【正位置】'}
- テーマ: 気になるあの人の気持ち

要件:
- 30〜50文字程度で、短く一言で心に響くメッセージにしてください
- 占いカードの中央に配置されるため、長い文章は避けてください
- 神秘的で温かみのある文体にしてください
- 「。」で文を区切ってください
${isReversed
  ? '- 逆位置なので「まだ迷いがある」「距離を感じている」「気持ちを整理中」など、少し慎重・内向きなニュアンスにしてください。ただし希望が感じられる表現にしてください。'
  : '- 正位置なので「気になっている」「会いたい」「想いを温めている」など、ポジティブで前向きな表現にしてください。'}

メッセージのみを出力してください（前置きや説明は不要）。
`.trim();

  const MAX_RETRIES = 1;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        if (loadingText) loadingText.textContent = `星に再び問いかけています… (少し時間をおいています)`;
        await sleep(4000);
      }

      const response = await fetch(CONFIG.PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-2.0-flash',
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 100 },
        }),
      });

      if (response.status === 429) {
        if (attempt < MAX_RETRIES) continue;
        return getCardMessage(card, isReversed);
      }

      if (!response.ok) {
        throw new Error(`Proxy Error: ${response.status}`);
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
  if (isAnimating) return;
  cardFlipper.classList.remove('flipped');
  cardScene.classList.remove('glow-anim');
  cardScene.classList.remove('result-shown');
  if (resultCardPanel) resultCardPanel.setAttribute('aria-hidden', 'true');
  isFlipped = false;

  // 星評価を非表示
  if (loveFortune) {
    loveFortune.classList.remove('show');
  }

  // ボタン表示を元に戻す
  againBtn.style.display = 'none';
  invokeBtn.style.display = 'flex';
  setBusy(false);
  cardMainMessage.textContent = 'あなたのことをもっと知りたいと思っています';
  cardNameEn.textContent = 'THE MOON';
  cardNameJa.textContent = '月';
  resultCardMessage.textContent = '';
  resultCardNameEn.textContent = '';
  resultCardNameJa.textContent = '';
  if (appContainer) {
    appContainer.classList.remove('result-bg');
    appContainer.classList.add('init-bg');
  }
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
          <div class="history-date">${escapeHtml(h.date)}</div>
          <div class="history-card">${escapeHtml(h.cardJa)}（${escapeHtml(h.cardEn)}）${h.reversed ? '【逆位置】' : '【正位置】'}</div>
          <div class="history-msg">${escapeHtml(h.message)}</div>
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

function setBusy(busy) {
  invokeBtn.disabled = busy;
  againBtn.disabled = busy;
  cardScene.classList.toggle('is-disabled', busy);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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
