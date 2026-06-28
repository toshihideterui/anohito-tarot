/**
 * tarot.js
 * -----------------------------------
 * タロットカードデータとカード選択ロジック
 * -----------------------------------
 */

const TAROT_CARDS = [
  { emoji:'🌟', en:'THE FOOL',        ja:'愚者',    love:5, image:'images/cards/card_fool.png',
    msg_up:  ['新しい恋の始まり…あの人はあなたに純粋な好奇心を感じています。','あの人の心に、あなたへの期待がふくらんでいます。'],
    msg_rev: ['あの人はまだ踏み出す勇気を持てずにいます。もう少し待ってみて。'] },
  { emoji:'🪄', en:'THE MAGICIAN',    ja:'魔術師',  love:5, image:'images/cards/card_magician.png',
    msg_up:  ['あの人はあなたに強い引力を感じています。','行動すれば、すべてがうまくいく暗示です。'],
    msg_rev: ['あの人の気持ちはあなたに向いているものの、まだ言葉にできていません。'] },
  { emoji:'🌙', en:'HIGH PRIESTESS',  ja:'女教皇',  love:4, image:'images/cards/card_high_priestess.png',
    msg_up:  ['あの人はあなたを深く理解したいと思っています。','静かな縁が、着実に育まれています。'],
    msg_rev: ['あの人は心の奥で迷っています。焦らず見守りましょう。'] },
  { emoji:'🌹', en:'THE EMPRESS',     ja:'女帝',    love:5, image:'images/cards/card_empress.png',
    msg_up:  ['あの人はあなたへの愛情が溢れています。','豊かな縁が広がる暗示です。'],
    msg_rev: ['あの人はあなたへの感情を持て余しています。正直に話せる場を作りましょう。'] },
  { emoji:'👑', en:'THE EMPEROR',     ja:'皇帝',    love:4, image:'images/cards/card_emperor.png',
    msg_up:  ['あの人はあなたを守りたいと思っています。','信頼と安定した絆が生まれます。'],
    msg_rev: ['あの人はプライドが邪魔をして素直になれないようです。'] },
  { emoji:'🕊️', en:'THE HIEROPHANT', ja:'法王',    love:3, image:'images/cards/card_hierophant.png',
    msg_up:  ['あの人はあなたと誠実な関係を望んでいます。','伝統的な縁が結ばれるでしょう。'],
    msg_rev: ['あの人は関係に縛りを感じ、自由を求めているかもしれません。'] },
  { emoji:'💞', en:'THE LOVERS',      ja:'恋人',    love:5, image:'images/cards/card_lovers.png',
    msg_up:  ['あの人はあなたを選びたいと思っています！','深い縁と運命的な引力を感じています。'],
    msg_rev: ['あの人の心は揺れています。でも、あなたへの気持ちは消えていません。'] },
  { emoji:'🏆', en:'THE CHARIOT',     ja:'戦車',    love:4, image:'images/cards/card_chariot.png',
    msg_up:  ['あの人はあなたへの気持ちに向かって突き進んでいます。','情熱的な縁が動き出す暗示。'],
    msg_rev: ['あの人は感情をコントロールしようとしすぎています。'] },
  { emoji:'🦁', en:'STRENGTH',        ja:'力',      love:4, image:'images/cards/card_strength.png',
    msg_up:  ['あの人はあなたに安らぎと強さを感じています。','お互いを高め合える関係です。'],
    msg_rev: ['あの人は不安を感じています。優しく接することで心が開かれます。'] },
  { emoji:'🏮', en:'THE HERMIT',      ja:'隠者',    love:2, image:'images/cards/card_hermit.png',
    msg_up:  ['あの人は今、内省の時にあります。焦らず静かに待ちましょう。','深い縁は時間をかけて育まれます。'],
    msg_rev: ['あの人は孤独を感じていますが、あなたのことが心に浮かんでいます。'] },
  { emoji:'🎡', en:'WHEEL OF FORTUNE',ja:'運命の輪',love:4, image:'images/cards/card_wheel.png',
    msg_up:  ['運命の歯車が動き始めています！チャンスが訪れます。','あの人との縁は好転します。'],
    msg_rev: ['今は少し変化の波にいます。流れに乗って待ちましょう。'] },
  { emoji:'⚖️', en:'JUSTICE',         ja:'正義',    love:3, image:'images/cards/card_justice.png',
    msg_up:  ['あの人はあなたとのバランスのとれた関係を求めています。','誠実な気持ちが通じ合います。'],
    msg_rev: ['あの人は何かに迷いを感じています。正直なコミュニケーションが鍵です。'] },
  { emoji:'🙃', en:'THE HANGED MAN',  ja:'吊るされた男',love:2, image:'images/cards/card_hanged_man.png',
    msg_up:  ['あの人は今、立ち止まって考えています。新しい視点が生まれる兆しです。'],
    msg_rev: ['あの人は迷いの中にいます。もう少し時間が必要かもしれません。'] },
  { emoji:'🦋', en:'DEATH',           ja:'死神',    love:3, image:'images/cards/card_death.png',
    msg_up:  ['終わりと始まりの時。あの人との関係が新しいステージへ移行します。'],
    msg_rev: ['変化を恐れているようです。しかし変化は必ず新しい縁をもたらします。'] },
  { emoji:'🌊', en:'TEMPERANCE',      ja:'節制',    love:4, image:'images/cards/card_temperance.png',
    msg_up:  ['あの人はあなたとの調和を望んでいます。穏やかで美しい縁です。'],
    msg_rev: ['あの人はバランスを崩しています。ゆっくりと関係を整えましょう。'] },
  { emoji:'😈', en:'THE DEVIL',       ja:'悪魔',    love:3, image:'images/cards/card_devil.png',
    msg_up:  ['あの人はあなたへの強い執着を感じています。情熱的な縁です。'],
    msg_rev: ['依存や束縛から解放される必要があります。自分らしくいることが大切です。'] },
  { emoji:'⚡', en:'THE TOWER',       ja:'塔',      love:1, image:'images/cards/card_tower.png',
    msg_up:  ['突然の変化が訪れるかもしれません。しかしそれは新しい始まりでもあります。'],
    msg_rev: ['変化への恐れを手放すと、新しい可能性が開けます。'] },
  { emoji:'⭐', en:'THE STAR',        ja:'星',      love:5, image:'images/cards/card_star.png',
    msg_up:  ['希望の光があなたたちを照らしています！素晴らしい縁が育まれます。','あの人はあなたに希望を感じています。'],
    msg_rev: ['一時的に希望が見えにくいかもしれませんが、星は必ず輝きます。'] },
  { emoji:'🌛', en:'THE MOON',        ja:'月',      love:3, image:'images/cards/card_moon.png',
    msg_up:  ['あの人の心には深い想いが隠れています。真実はもう少し先に見えてきます。'],
    msg_rev: ['幻想が現実を覆っているかもしれません。感情に流されず冷静に。'] },
  { emoji:'☀️', en:'THE SUN',         ja:'太陽',    love:5, image:'images/cards/card_sun.png',
    msg_up:  ['明るく輝く縁！あの人はあなたといると幸せを感じています。','最高の展開が待っています。'],
    msg_rev: ['少し曇りがちですが、太陽は必ず出ます。前向きに！'] },
  { emoji:'🎺', en:'JUDGEMENT',       ja:'審判',    love:4, image:'images/cards/card_judgement.png',
    msg_up:  ['あの人は覚醒 of 時を迎えています。あなたへの本当の気持ちに気づきます。'],
    msg_rev: ['まだ準備ができていないだけ。時が満ちれば必ず動きます。'] },
  { emoji:'🌍', en:'THE WORLD',       ja:'世界',    love:5, image:'images/cards/card_world.png',
    msg_up:  ['完成と成就の時！あの人との縁は最高の実を結びます。','すべてがうまくいく吉兆です。'],
    msg_rev: ['もう少しで完成します。最後の一歩を踏み出しましょう。'] },
];

/**
 * ランダムにカードを1枚引く
 * @returns {{ card: object, isReversed: boolean }}
 */
function drawCard() {
  const card = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
  const isReversed = Math.random() < 0.35; // 35%の確率で逆位置
  return { card, isReversed };
}

/**
 * カードのメッセージをランダムに取得
 */
function getCardMessage(card, isReversed) {
  const msgs = isReversed ? card.msg_rev : card.msg_up;
  return msgs[Math.floor(Math.random() * msgs.length)];
}

/**
 * 星の数を文字列で返す
 */
function getStars(card, isReversed) {
  const stars = isReversed ? Math.max(1, card.love - 2) : card.love;
  return '★'.repeat(stars) + '☆'.repeat(5 - stars);
}
