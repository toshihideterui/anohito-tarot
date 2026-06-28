/**
 * config.js
 * -----------------------------------
 * Gemini API キーと各種設定を管理します。
 * ▼ デプロイ後、GEMINI_API_KEY に実際のキーを入力してください。
 * -----------------------------------
 */

const CONFIG = {
  // ✅ ここに Gemini API キーを入力してください
  GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY_HERE',

  // Gemini API エンドポイント
  GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',

  // STORESの予約ページURL
  STORES_URL: 'https://mfji1wtifttuhkyxhpye.stores.jp',

  // 占い結果の最大保存件数
  MAX_HISTORY: 20,
};
