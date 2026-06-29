/**
 * config.js
 * -----------------------------------
 * Cloudflare Worker と各種設定を管理します。
 * APIキーはフロントエンドに置かず、Worker 側の環境変数で管理します。
 * -----------------------------------
 */

const CONFIG = {
  // Cloudflare Worker プロキシURL（AI鑑定文生成用）
  PROXY_URL: 'https://anohito-proxy.toshihide3.workers.dev',

  // STORESの有料鑑定ページURL
  STORES_URL: 'https://mfji1wtifttuhkyxhpye.stores.jp',

  // 占い結果の最大保存件数
  MAX_HISTORY: 20,
};
