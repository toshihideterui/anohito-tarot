/**
 * config.js
 * -----------------------------------
 * Gemini API キーと各種設定を管理します。
 * ▼ デプロイ後、GEMINI_API_KEY に実際のキーを入力してください。
 * -----------------------------------
 */

const CONFIG = {
  // Cloudflare Worker プロキシURL（APIキーはWorker側の環境変数で管理）
  PROXY_URL: 'https://anohito-proxy.toshihide3.workers.dev',

  // STORESの予約ページURL
  STORES_URL: 'https://mfji1wtifttuhkyxhpye.stores.jp',

  // 占い結果の最大保存件数
  MAX_HISTORY: 20,
};
