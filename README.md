# あの人の気持ち鑑定｜タロット占いWebアプリ

「あの人の気持ち」をテーマにした、スマートフォン向けのタロット占いWebアプリです。
LINE公式アカウントのリッチメニューなどから開くことを想定し、入力項目なしでカードを1枚引き、AI鑑定文を表示します。

公開URL:

```text
https://anohito-tarot.toshihide3.workers.dev
```

## 主な機能

- 入力項目なしで占えるタロット鑑定
- 大アルカナ22枚からランダムに1枚を選択
- 正位置 / 逆位置をランダム判定
- 画面上のカード画像は共通画像を使用
- カードをタップするとめくれる演出
- Cloudflare Workers経由でAI鑑定文を生成
- APIキーをフロントエンドやGitHubに直接記載しない構成
- AI生成に失敗した場合も、自然な代替メッセージを表示
- STORESの有料鑑定ページへの導線
- スマートフォン表示を優先したレイアウト

## 現在の構成

このアプリは、以下の構成で動作します。

```text
ユーザーのブラウザ
  ↓
フロントエンド HTML / CSS / JavaScript
  ↓
Cloudflare Workers
  ↓
AI API
```

AI鑑定文の生成に必要なAPIキーは、GitHub上のソースコードには記載していません。
Cloudflare Workers側の環境変数またはSecretとして管理します。

そのため、利用者がブラウザでページを開いても、APIキーは表示されません。

## 設定ファイル

主な設定は `js/config.js` で管理しています。

```javascript
const CONFIG = {
  PROXY_URL: 'https://anohito-proxy.toshihide3.workers.dev',
  STORES_URL: 'https://mfji1wtifttuhkyxhpye.stores.jp',
};
```

### PROXY_URL

AI鑑定文を生成するCloudflare WorkerのURLです。

フロントエンドからAI APIへ直接アクセスせず、必ずWorkerを経由します。

### STORES_URL

「もっと詳しく鑑定する」リンクの遷移先です。

現在の設定:

```text
https://mfji1wtifttuhkyxhpye.stores.jp
```

## Cloudflare Workers側の設定

Cloudflare Workersでは、AI APIキーを環境変数またはSecretとして設定してください。

例:

```text
GOOGLE_API_KEY=xxxxxxxxxxxxxxxx
```

注意:

- APIキーは `index.html`、`js/config.js`、GitHubリポジトリ内に直接書かないでください。
- APIキーを変更したい場合は、Cloudflare側の環境変数 / Secretを差し替えてください。
- Worker側でエラーが起きた場合も、フロントエンドでは自然な代替鑑定文を表示します。

## デプロイ方法

### GitHubとCloudflareを連携する場合

1. GitHubリポジトリにソースコードをpushします。
2. CloudflareでGitHubリポジトリを連携します。
3. 静的サイトとして `index.html` を公開します。
4. `js/config.js` の `PROXY_URL` が本番用Worker URLになっていることを確認します。
5. Cloudflare Workers側にAI APIキーを環境変数 / Secretとして設定します。
6. 公開URLにアクセスして動作確認します。

### ZIPで納品する場合

ZIPには以下のファイル一式を含めます。

```text
index.html
README.md
.gitignore
css/
images/
js/
```

`.git` フォルダやAPIキーは納品ZIPに含めません。

## LINE公式アカウントで使う場合

LINE公式アカウントのリッチメニューから、このWebアプリを開くことができます。

### 導入手順

1. LINE Official Account Managerにログインします。
2. 対象のLINE公式アカウントを開きます。
3. メニューから「トークルーム管理」または「リッチメニュー」を開きます。
4. 新しいリッチメニューを作成します。
5. アクションタイプで「リンク」を選択します。
6. URLに以下を設定します。

```text
https://anohito-tarot.toshihide3.workers.dev
```

7. 保存後、リッチメニューを公開します。
8. スマートフォンのLINEアプリからリッチメニューをタップし、画面表示を確認します。

### LINEで確認するポイント

- スマートフォンでタイトル、カード、ボタンが見切れないこと
- カードをタップして鑑定結果が表示されること
- 「もう一度占う」で再度占えること
- 「もっと詳しく鑑定する」からSTORESページへ遷移できること
- AI生成に失敗した場合でもエラー文がそのまま表示されないこと

## ファイル構成

```text
anohito-tarot/
├── index.html
├── README.md
├── css/
│   └── style.css
├── images/
│   ├── app_bg_clean.png
│   ├── card_back_single.png
│   ├── card_face_bg.png
│   └── cards/
└── js/
    ├── app.js
    ├── canvas.js
    ├── config.js
    └── tarot.js
```

## 納品前チェック項目

- 公開URLで画面が表示される
- スマートフォン幅で表示崩れがない
- カードを1回引ける
- カード名、正位置 / 逆位置、鑑定文が表示される
- AI生成に失敗しても自然な代替メッセージが表示される
- 「もう一度占う」で再実行できる
- 「もっと詳しく鑑定する」からSTORESページが開く
- GitHubやZIP内にAPIキーが含まれていない

## 納品時に共有するもの

購入者へは、以下を共有してください。

- 公開URL
- GitHubリポジトリURL
- 納品用ZIPファイル
- Cloudflare Workers側の環境変数設定についての説明

APIキーそのものは、必要な場合のみ安全な方法で共有してください。
通常は、購入者自身のAPIキーをCloudflare側に設定して運用する形が安全です。
