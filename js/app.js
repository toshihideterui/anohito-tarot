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
const readingPanel       = document.getElementById('readingPanel');
const readingCardMeta    = document.getElementById('readingCardMeta');
const readingMessage     = document.getElementById('readingMessage');
const readingDetail      = document.getElementById('readingDetail');
const readingMore        = document.getElementById('readingMore');
const loadingInline      = document.getElementById('loadingInline');
const loadingText        = document.getElementById('loadingText');
const loveFortune        = document.getElementById('loveFortune');
const starsRow           = document.getElementById('starsRow');
const storesLink         = document.getElementById('storesLink');
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
  preloadImages([
    'images/result_dragon_bg.png?v=1',
    'images/result_reading_panel.png?v=1',
    'images/again_button.png?v=1',
    'images/stores_button.png?v=1',
  ]);
  if (readingMore && readingPanel) {
    readingMore.addEventListener('click', () => {
      const expanded = readingPanel.classList.toggle('expanded');
      readingMore.textContent = expanded ? '閉じる…⌃' : '続きを読む…⌄';
    });
  }
  if (historyLink) historyLink.addEventListener('click', openHistory);
  if (modalClose) modalClose.addEventListener('click', closeHistory);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeHistory();
    });
  }
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

  if (loadingInline) loadingInline.classList.remove('show');
  if (readingPanel) readingPanel.setAttribute('aria-hidden', 'true');
  if (readingCardMeta) readingCardMeta.textContent = '';
  if (readingMessage) readingMessage.textContent = '';
  if (readingDetail) readingDetail.textContent = '';
  if (readingMore) readingMore.classList.add('is-hidden');

  // AIメッセージを取得
  const message = await fetchMessage(card, isReversed);

  // メッセージと結果追加要素を表示
  const reading = showResult(card, isReversed, message);
  saveHistory({
    date: new Date().toLocaleString('ja-JP'),
    cardEn: card.en,
    cardJa: card.ja,
    reversed: isReversed,
    message: `${reading.summary}\n${reading.detail}`,
  });

  if (loadingInline) loadingInline.classList.remove('show');
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
  const reading = formatReadingMessage(message, card, isReversed);

  if (appContainer) {
    appContainer.classList.remove('init-bg');
    appContainer.classList.add('result-bg');
  }

  // メッセージ切り替え
  cardMainMessage.innerHTML = reading.summary.replace(/\n/g, '<br>');
  resultCardMessage.innerHTML = reading.summary.replace(/\n/g, '<br>');
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
  if (readingCardMeta) {
    readingCardMeta.textContent = '';
  }
  if (readingMessage) {
    readingMessage.textContent = reading.summary;
  }
  if (readingDetail) {
    readingDetail.textContent = reading.detail;
  }
  if (readingPanel) {
    readingPanel.classList.remove('expanded');
  }
  if (readingPanel) {
    readingPanel.setAttribute('aria-hidden', 'false');
  }
  if (readingMore) {
    readingMore.textContent = '続きを読む…⌄';
    readingMore.classList.toggle('is-hidden', reading.detail.length < 70);
  }
  if (cardScene) {
    cardScene.setAttribute('aria-hidden', 'true');
  }
  isFlipped = true;

  // 星評価を設定してフェードイン
  starsRow.textContent = getStars(card, isReversed);
  if (loveFortune) {
    loveFortune.classList.add('show');
  }

  // アクションボタンを切り替え
  invokeBtn.style.display = 'none';
  againBtn.style.display = 'flex';

  return reading;
}

// ========== Gemini API 呼び出し（プロキシ経由） ==========
async function fetchMessage(card, isReversed) {
  const prompt = `
あなたはプロの恋愛タロット占い師です。
次の条件でタロット占いの結果メッセージを日本語で生成してください。

- 引いたカード: ${card.ja}（${card.en}）${isReversed ? '【逆位置】' : '【正位置】'}
- テーマ: 気になるあの人の気持ち

要件:
- 1行目は「一言: 」に続けて、30〜45文字程度の短い結論を書いてください
- 2行目は「詳細: 」に続けて、80〜120文字程度で、相手の気持ちや今後の向き合い方をやさしく説明してください
- 神秘的で温かみのある文体にしてください
- 「。」で文を区切ってください
${isReversed
  ? '- 逆位置なので「まだ迷いがある」「距離を感じている」「気持ちを整理中」など、少し慎重・内向きなニュアンスにしてください。ただし希望が感じられる表現にしてください。'
  : '- 正位置なので「気になっている」「会いたい」「想いを温めている」など、ポジティブで前向きな表現にしてください。'}

上記2行のみを出力してください（前置きや説明は不要）。
`.trim();

  const MAX_RETRIES = 1;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
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
        return buildFallbackReading(card, isReversed);
      }

      if (!response.ok) {
        throw new Error(`Proxy Error: ${response.status}`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return text ? text.trim() : buildFallbackReading(card, isReversed);

    } catch (err) {
      if (attempt < MAX_RETRIES) continue;
      return buildFallbackReading(card, isReversed);
    }
  }
  return buildFallbackReading(card, isReversed);
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
  if (readingPanel) readingPanel.setAttribute('aria-hidden', 'true');
  if (readingCardMeta) readingCardMeta.textContent = '';
  if (readingMessage) readingMessage.textContent = '';
  if (readingDetail) readingDetail.textContent = '';
  if (readingPanel) readingPanel.classList.remove('expanded');
  if (readingMore) {
    readingMore.textContent = '続きを読む…⌄';
    readingMore.classList.add('is-hidden');
  }
  if (cardScene) cardScene.setAttribute('aria-hidden', 'false');
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
  if (!modalOverlay || !historyList) return;
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
  if (!modalOverlay) return;
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

function preloadImages(srcs) {
  for (const src of srcs) {
    const img = new Image();
    img.src = src;
  }
}

function formatReadingMessage(rawMessage, card, isReversed) {
  const raw = String(rawMessage || '').trim();
  const summaryMatch = raw.match(/(?:^|\n)\s*(?:一言|結論)\s*[:：]\s*(.+)/);
  const detailMatch = raw.match(/(?:^|\n)\s*詳細\s*[:：]\s*([\s\S]+)/);
  const firstLine = raw.split(/\n+/)[0]?.replace(/^[-・\s]+/, '').trim() || '';
  const summary = summaryMatch ? summaryMatch[1].trim() : firstLine.replace(/^(?:一言|結論)\s*[:：]\s*/, '');
  const detail = detailMatch
    ? detailMatch[1].trim()
    : buildDetailMessage(card, isReversed);

  return {
    summary: summary || getCardMessage(card, isReversed),
    detail: detail || buildDetailMessage(card, isReversed),
  };
}

function buildFallbackReading(card, isReversed) {
  const summary = getCardMessage(card, isReversed);
  return `一言: ${summary}\n詳細: ${buildDetailMessage(card, isReversed)}`;
}

function buildDetailMessage(card, isReversed) {
  if (isReversed) {
    return '今のあの人は、あなたへの気持ちを抱えながらも、素直に表すことに少し慎重になっているようです。焦って答えを求めるより、相手の小さな反応や距離感を見守ることで、関係はゆっくり整っていきます。';
  }

  return 'このカードは、あの人の中にあなたを意識する気持ちが静かに育っていることを示しています。今は無理に動かすより、やさしい言葉や自然な関わりを重ねることで、ふたりの空気が少しずつ近づいていくでしょう。';
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
