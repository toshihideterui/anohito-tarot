# あの人の気持ち鑑定 | タロット占い

神秘的なタロットカードで「あの人の気持ち」を占うWebアプリです。  
GitHub Pages / Cloudflare Pages でそのまま公開できる静的サイトです。

---

## 🌟 機能

- タロットカード（大アルカナ22枚）をランダムに引く
- 正位置・逆位置のランダム判定
- Gemini AI による個別メッセージ生成（APIキー設定時）
- 占い結果の履歴保存（localStorage）
- 美しい星空アニメーション背景

---

## 🚀 デプロイ手順

### Cloudflare Pages（推奨）

1. このリポジトリを GitHub にプッシュ
2. [Cloudflare Pages](https://pages.cloudflare.com/) にログイン
3. 「新しいプロジェクトを作成」→ GitHubリポジトリを接続
4. ビルド設定：
   - **フレームワーク**: なし（静的HTML）
   - **ビルドコマンド**: 空欄
   - **出力ディレクトリ**: `/`（ルート）
5. デプロイ！

### GitHub Pages

1. リポジトリの Settings → Pages
2. Source: `main` ブランチ、`/ (root)` を選択
3. Save → 数分でURLが発行されます

---

## 🔑 Gemini API キーの設定

`js/config.js` を開き、`YOUR_GEMINI_API_KEY_HERE` を実際のAPIキーに置き換えてください。

```javascript
const CONFIG = {
  GEMINI_API_KEY: 'AIzaSy...your_actual_key...',
  // ...
};
```

> ⚠️ **注意**: APIキーはフロントエンド（公開リポジトリ）に直接記述されます。  
> 本番環境では Cloudflare Workers や Edge Functions でプロキシすることを推奨します。

APIキーがない場合でも、カード固有のメッセージで動作します。

---

## 📁 ファイル構成

```
anohito-tarot/
├── index.html          # メインHTML
├── css/
│   └── style.css       # スタイルシート
├── js/
│   ├── config.js       # API設定（★キーをここに入力）
│   ├── tarot.js        # タロットカードデータ
│   ├── canvas.js       # 背景アニメーション
│   └── app.js          # メインロジック
├── .gitignore
└── README.md
```

---

## 🛒 STORESリンクの設定

`js/config.js` の `STORES_URL` を実際のSTORESページURLに変更してください。

```javascript
STORES_URL: 'https://your-shop.stores.jp',
```

---

## 📄 ライセンス

個人利用・商用利用可。帰属表示は任意。
