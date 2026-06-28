/**
 * app.js
 * -----------------------------------
 * メインアプリケーションロジック
 * - カード引き
 * - Gemini API 呼び出し
 * - 履歴管理（localStorage）
 * -----------------------------------
 */

// ========== DOM要素 ==========
const invokeBtn       = document.getElementById('invokeBtn');
const cardScene       = document.getElementById('cardScene');
const cardFlipper     = document.getElementById('cardFlipper');
const cardFrontFace   = document.getElementById('cardFrontFace');
const cbMsg           = document.getElementById('cbMsg');
const cbArcanaEmoji   = document.getElementById('cbArcanaEmoji');
const cbArcanaEn      = document.getElementById('cbArcanaEn');
const cbArcanaJa      = document.getElementById('cbArcanaJa');
const loadingInline   = document.getElementById('loadingInline');
const resultArea      = document.getElementById('resultArea');
const resultMessage   = document.getElementById('resultMessage');
const resultArcanaVisual = document.getElementById('resultArcanaVisual');
const reversedBadge   = document.getElementById('reversedBadge');
const resultArcanaEn  = document.getElementById('resultArcanaEn');
const resultArcanaJa  = document.getElementById('resultArcanaJa');
const starsRow        = document.getElementById('starsRow');
const againBtn        = document.getElementById('againBtn');
const historyLink     = document.getElementById('historyLink');
const modalOverlay    = document.getElementById('modalOverlay');
const modalClose      = document.getElementById('modalClose');
const historyList     = document.getElementById('historyList');
const storesBtn       = document.getElementById('storesBtn');

// ========== 状態変数 ==========
let drawnCard = null;
let drawnReversed = false;
let isFlipped = false;
let isAnimating = false;

// ========== 初期化 ==========
function init() {
  // カード裏面パターンを描画
  drawCardFrontPattern(cardFrontFace);

  // STORESリンクを設定
  if (storesBtn && CONFIG.STORES_URL) {
    storesBtn.href = CONFIG.STORES_URL;
    storesBtn.target = '_blank';
    storesBtn.rel = 'noopener noreferrer';
  }

  // カードをクリックしても引ける
  cardScene.addEventListener('click', handleCardClick);
  invokeBtn.addEventListener('click', handleInvoke);
  againBtn.addEventListener('click', handleReset);
  historyLink.addEventListener('click', openHistory);
  modalClose.addEventListener('click', closeHistory);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeHistory();
  });
}

// ========== カードクリック ==========
function handleCardClick() {
  if (!isFlipped && !isAnimating) {
    handleInvoke();
  }
}

// ========== カードを引く ==========
async function handleInvoke() {
  const userName   = document.getElementById('userName').value.trim();
  const targetName = document.getElementById('targetName').value.trim();

  if (!userName || !targetName) {
    showInputError();
    return;
  }

  if (isAnimating) return;
  isAnimating = true;

  // カードを引く
  const { card, isReversed } = drawCard();
  drawnCard = card;
  drawnReversed = isReversed;

  // UIをロック
  invokeBtn.disabled = true;
  loadingInline.classList.add('show');

  // カードをフリップ
  setTimeout(() => {
    flipCard(card, isReversed);
  }, 300);

  // AIメッセージを取得
  const message = await fetchMessage(userName, targetName, card, isReversed);

  // 結果を表示
  showResult(card, isReversed, message, userName, targetName);

  // 履歴に保存
  saveHistory({
    date: new Date().toLocaleString('ja-JP'),
    userName,
    targetName,
    cardEn: card.en,
    cardJa: card.ja,
    reversed: isReversed,
    message,
  });

  loadingInline.classList.remove('show');
  isAnimating = false;
}

// ========== カードフリップ ==========
function flipCard(card, isReversed) {
  // カード背面にデータをセット
  cbMsg.innerHTML = getCardMessage(card, isReversed).replace(/。/g, '。<br>');
  cbArcanaEmoji.textContent = card.emoji;
  cbArcanaEn.textContent = card.en;
  cbArcanaJa.textContent = isReversed ? card.ja + '（逆）' : card.ja;

  cardFlipper.classList.add('flipped');
  cardScene.classList.add('glow-anim');
  isFlipped = true;
}

// ========== 結果表示 ==========
function showResult(card, isReversed, message, userName, targetName) {
  resultMessage.innerHTML = message.replace(/\n/g, '<br>');

  resultArcanaVisual.textContent = card.emoji;
  resultArcanaVisual.classList.toggle('reversed', isReversed);

  reversedBadge.style.display = isReversed ? 'inline-block' : 'none';
  resultArcanaEn.textContent = card.en;
  resultArcanaJa.textContent = card.ja;

  starsRow.textContent = getStars(card, isReversed);

  resultArea.classList.add('show', 'fade-in-up');

  // スムーズスクロール
  setTimeout(() => {
    resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 300);
}

// ========== Gemini API 呼び出し ==========
async function fetchMessage(userName, targetName, card, isReversed) {
  // APIキーが設定されていない場合はカードのデフォルトメッセージを使用
  if (!CONFIG.GEMINI_API_KEY || CONFIG.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    return getCardMessage(card, isReversed);
  }

  const prompt = `
あなたはプロの恋愛タロット占い師です。
次の条件でタロット占いの結果メッセージを日本語で生成してください。

- 相談者の名前: ${userName}
- 気になる相手の名前: ${targetName}
- 引いたカード: ${card.ja}（${card.en}）${isReversed ? '【逆位置】' : '【正位置】'}
- テーマ: ${targetName}さんの${userName}さんへの気持ち

要件:
- 70〜100文字程度でまとめてください
- 神秘的で温かみのある文体にしてください
- ${userName}さんと${targetName}さんの名前を自然に使ってください
- 具体的でポジティブ（逆位置でも希望を感じさせる）内容にしてください
- 「。」で文を区切り、改行はしないでください

メッセージのみを出力してください（前置きや説明は不要）。
`.trim();

  try {
    const response = await fetch(`${CONFIG.GEMINI_API_URL}?key=${CONFIG.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 200,
        },
      }),
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? text.trim() : getCardMessage(card, isReversed);
  } catch (err) {
    console.warn('Gemini API エラー。デフォルトメッセージを使用します。', err);
    return getCardMessage(card, isReversed);
  }
}

// ========== 入力エラー表示 ==========
function showInputError() {
  const fields = document.querySelectorAll('.field input');
  fields.forEach(input => {
    if (!input.value.trim()) {
      input.style.borderColor = 'rgba(224,128,128,0.6)';
      input.addEventListener('input', () => {
        input.style.borderColor = '';
      }, { once: true });
    }
  });
}

// ========== リセット ==========
function handleReset() {
  // カードを戻す
  cardFlipper.classList.remove('flipped');
  cardScene.classList.remove('glow-anim');
  isFlipped = false;

  // 結果を非表示
  resultArea.classList.remove('show', 'fade-in-up');

  // ボタンを解除
  invokeBtn.disabled = false;

  // カードパターンを再描画（新鮮な感じ）
  setTimeout(() => {
    drawCardFrontPattern(cardFrontFace);
  }, 500);

  // 上にスクロール
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
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function openHistory() {
  const history = getHistory();
  if (history.length === 0) {
    historyList.innerHTML = '<div class="history-empty">まだ鑑定記録がありません</div>';
  } else {
    historyList.innerHTML = history.map(h => `
      <div class="history-item">
        <div class="history-date">${h.date}</div>
        <div class="history-card">${h.cardJa}（${h.cardEn}）${h.reversed ? '【逆位置】' : ''}</div>
        <div class="history-msg">${h.message}</div>
      </div>
    `).join('');
  }
  modalOverlay.classList.add('show');
}

function closeHistory() {
  modalOverlay.classList.remove('show');
}

// ========== 起動 ==========
document.addEventListener('DOMContentLoaded', init);
