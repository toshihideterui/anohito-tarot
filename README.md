# あの人の気持ち鑑定 | タロット占い

「あの人の気持ち」をテーマにした、スマホ向けのタロット占いWebアプリです。  
LINE公式アカウントのリッチメニューから開かれる想定で、入力項目なしでカードを1枚引き、AI鑑定文を表示します。

## 機能

- 入力なしで占えるタロット鑑定
- 大アルカナ22枚からランダムに1枚を選択
- 正位置・逆位置をランダム判定
- 画面上のカード画像は共通画像を使用
- タップでカードがめくれる演出
- Cloudflare Workers 経由でAI鑑定文を生成
- AI生成に失敗した場合も自然な代替メッセージを表示
- 鑑定履歴をブラウザ内に保存（localStorage）
- STORES有料鑑定ページへの導線

## AI鑑定文の構成

フロントエンドからは `js/config.js` の `PROXY_URL` に設定した Cloudflare Worker へリクエストします。  
AI APIキーはフロントエンド、GitHub、公開HTMLには記載しません。APIキーは Cloudflare Workers 側の環境変数で管理してください。

```javascript
const CONFIG = {
  PROXY_URL: 'https://your-worker.example.workers.dev',
  STORES_URL: 'https://mfji1wtifttuhkyxhpye.stores.jp',
  MAX_HISTORY: 20,
};
```

Worker やAI APIでエラーが起きた場合は、ユーザーにエラー文を見せず、カードごとの代替鑑定文を表示します。

## STORESリンク

有料鑑定ページのURLは `js/config.js` の `STORES_URL` で管理します。  
現在の設定:

```javascript
STORES_URL: 'https://mfji1wtifttuhkyxhpye.stores.jp'
```

画面内の「もっと詳しく鑑定する」リンクに自動反映されます。

## デプロイ

静的HTML/CSS/JavaScriptのため、GitHub Pages または Cloudflare Pages で公開できます。

Cloudflare Pages の例:

1. このリポジトリを GitHub にプッシュ
2. Cloudflare Pages で GitHub リポジトリを接続
3. ビルド設定は「フレームワークなし」
4. ビルドコマンドは空欄
5. 出力ディレクトリは `/`
6. デプロイ後、`js/config.js` の `PROXY_URL` が本番Workerを向いていることを確認

## ファイル構成

```text
anohito-tarot/
├── index.html          # 画面本体
├── css/
│   └── style.css       # スマホ優先の表示スタイル
├── images/             # 背景、カード、ボタン画像
├── js/
│   ├── config.js       # Worker URL / STORES URL
│   ├── tarot.js        # 大アルカナ22枚のカードデータ
│   ├── canvas.js       # 星空背景アニメーション
│   └── app.js          # 占い実行、AI通信、履歴保存
└── README.md
```

## 納品前確認項目

- ローカルで `index.html` を開いて画面が表示される
- カードを1回引ける
- カード名、正位置/逆位置、鑑定文が表示される
- AI通信に失敗しても代替文が表示される
- 「もう一度占う」で再実行できる
- 実行中の連打で複数回処理が走らない
- STORESリンクが `https://mfji1wtifttuhkyxhpye.stores.jp` を開く
- スマホ幅でタイトル、カード、結果、ボタン、STORESリンクが見切れない
