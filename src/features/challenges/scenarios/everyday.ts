import type { Outcome, Scenario, Session, Transition } from "../engine/types";

const on =
  (...screens: string[]) =>
  (state: Session) =>
    screens.includes(state.screen);
const result = (
  id: string,
  title: string,
  description: string,
  next: string,
  tone: Outcome["tone"] = "notice",
): Outcome => ({ id, title, description, next, tone });
const inspect =
  (key: string, discovery: string): Transition["apply"] =>
  () => ({ settings: { [key]: true }, discoveries: [discovery] });

const newsOutcomes = {
  shared: result(
    "shared",
    "今年の情報としてシェアしました。",
    "昨年の中止案内を、今年の案内として広めました。見た人が予定を変えたり、主催者への問い合わせが増えたりする可能性があります。実際のSNSには投稿されません。",
    "元の案内と今年の発表を比べて、投稿後の訂正も試してみましょう。",
    "care",
  ),
  held: result(
    "held",
    "今はシェアしないと決めました。",
    "確かめられていない情報を広めずに保留しました。保留しただけで、情報が本当かどうか分かったわけではありません。",
    "気になるときは、元の情報の日付や主催者の発表を確認できます。",
  ),
  verified: result(
    "verified",
    "確認した内容と確認時刻を伝えました。",
    "今年の主催者発表が「開催予定」であることと、確認した時刻を添えて投稿しました。予定は今後変わる可能性があり、開催を保証する情報ではありません。",
    "最新の案内を確かめられるよう、発信元も一緒に示しましょう。",
  ),
  corrected: result(
    "corrected",
    "先ほどのシェアを訂正しました。",
    "昨年の画像だったことと、今年は開催予定であることを追記しました。訂正が、先ほどの投稿を見た全員に届くとは限りません。",
    "直接知らせた相手にも訂正を伝える方法があります。",
  ),
  removed: result(
    "removed",
    "自分のシェアを削除しました。",
    "新たに読まれる機会を減らしましたが、すでに読んだ人や保存した人に訂正が伝わるわけではありません。",
    "必要なら、誤って伝えた内容と確認できた情報を相手に知らせましょう。",
  ),
};

export const news: Scenario = {
  id: "L05",
  slug: "before-sharing",
  app: "news",
  title: "そのシェア、いつの情報？",
  shortTitle: "そのシェア、\nいつの情報？",
  category: "偽・誤情報",
  difficulty: "じっくり",
  estimatedMinutes: 5,
  description:
    "友人から届いたイベント中止の話。知らせる前に、元の情報をたどってみよう。",
  objective:
    "明日のイベントについて届いた投稿を調べ、友人に何を伝えるか決めよう。",
  initialState: {
    screen: "feed",
    settings: {
      source: false,
      image: false,
      official: false,
      publication: "none",
    },
  },
  states: ["feed", "shared", "held", "deleted"],
  actions: {
    source: { kind: "inspect", label: "転載元の投稿を確認した" },
    image: { kind: "inspect", label: "画像全体と案内の日付を確認した" },
    official: { kind: "inspect", label: "今年の主催者発表を確認した" },
    share: {
      kind: "simulate",
      label: "届いた情報をそのままシェアした",
      allowed: on("feed"),
    },
    hold: { kind: "simulate", label: "シェアを保留した", allowed: on("feed") },
    verified: {
      kind: "simulate",
      label: "確認した情報を投稿した",
      allowed: (s) => s.screen === "feed" && !!s.settings.official,
    },
    correct: {
      kind: "simulate",
      label: "先ほどのシェアに訂正を追記した",
      allowed: (s) =>
        s.screen === "shared" &&
        s.settings.publication === "rumor" &&
        !!s.settings.official,
    },
    remove: {
      kind: "simulate",
      label: "自分のシェアを削除した",
      allowed: on("shared"),
    },
    back: {
      kind: "navigate",
      label: "投稿する内容を考え直した",
      allowed: on("held", "deleted"),
    },
  },
  transitions: [
    { action: "source", apply: inspect("source", "source") },
    { action: "image", apply: inspect("image", "date") },
    { action: "official", apply: inspect("official", "context") },
    {
      action: "share",
      apply: () => ({
        screen: "shared",
        settings: { publication: "rumor" },
        outcome: newsOutcomes.shared,
      }),
    },
    {
      action: "hold",
      apply: () => ({ screen: "held", outcome: newsOutcomes.held }),
    },
    {
      action: "verified",
      apply: () => ({
        screen: "shared",
        settings: { publication: "verified" },
        outcome: newsOutcomes.verified,
      }),
    },
    {
      action: "correct",
      apply: () => ({
        settings: { publication: "corrected" },
        discoveries: ["correction"],
        outcome: newsOutcomes.corrected,
      }),
    },
    {
      action: "remove",
      apply: () => ({
        screen: "deleted",
        settings: { publication: "none" },
        discoveries: ["correction"],
        outcome: newsOutcomes.removed,
      }),
    },
    { action: "back", apply: () => ({ screen: "feed" }) },
  ],
  discoveries: [
    {
      id: "source",
      title: "転載と主催者の発表を区別する",
      detail:
        "「まちの話題メモ」は主催者のアカウントではありません。親しい人から届いても、誰の発表を伝えているのかたどれます。",
    },
    {
      id: "date",
      title: "画像が本物でも日付が違う",
      detail:
        "画像全体には2025年9月12日とあります。昨年の中止案内を、2026年の予定の根拠にはできません。",
    },
    {
      id: "context",
      title: "現在の発表と確認時刻を見る",
      detail:
        "2026年9月12日16時の主催者発表では、翌日のイベントは開催予定です。今後変更される可能性も残しています。",
    },
    {
      id: "correction",
      title: "削除と訂正では伝わることが違う",
      detail:
        "削除だけでは、すでに読んだ人が誤りに気づけない場合があります。何が違ったのかを伝える対応も考えられます。",
    },
  ],
  outcomes: newsOutcomes,
  hints: [
    "届いた文章と、添付画像の元を調べてみましょう。",
    "画像全体の日付は、今年の案内と一致しているでしょうか。",
    "主催者の最新情報を確認してから伝える、保留する、投稿済みなら訂正する方法があります。",
  ],
  knowledgeIds: ["checking-information"],
  reality:
    "情報が見つからないことだけで、うそだと決めつけることもできません。発信元・日付・文脈を比べ、確かめられない内容は断定して広めないようにしましょう。",
};

const shopOutcomes = {
  paid: result(
    "paid",
    "架空の代金を振り込みました。",
    "教材内で1,980円を支払ったことにしました。実際のお金や口座情報は使っていません。振込後の状況も確かめられます。",
    "商品が届かず連絡も取れない場合、どんな記録や相談先が必要でしょう。",
    "care",
  ),
  trouble: result(
    "trouble",
    "発送予定日を過ぎても届きません。",
    "数日後という設定です。発送の案内がなく、問い合わせにも返信がありません。遅延だけで詐欺と断定はできませんが、支払時の違和感と合わせて対応を考えられます。",
    "注文内容や振込の記録を残し、相談する手順を試してみましょう。",
    "care",
  ),
  cancelled: result(
    "cancelled",
    "支払う前に購入を見送りました。",
    "このショップへの支払いは行っていません。安い価格だけでは、販売者や取引の確かさは分かりません。",
    "別の店と比較し、連絡先や支払条件も確認する方法があります。",
  ),
  recorded: result(
    "recorded",
    "相談に使う記録をまとめました。",
    "ショップのURL、商品・注文画面、振込の控え、問い合わせ履歴を教材内のメモにまとめました。現実でも、画面が消える前に手元へ記録を残すと相談に使えます。",
    "支払った金融機関や警察など、公式の相談先を確認しましょう。",
  ),
  help: result(
    "help",
    "支払後の相談先を確認しました。",
    "銀行振込の場合は、振込先や利用した金融機関、警察に早めに相談する方法があります。相談しても返金されるとは限りません。",
    "注文や支払いの記録を用意し、相手から追加の支払いを求められても一度立ち止まりましょう。",
  ),
};

export const shop: Scenario = {
  id: "L06",
  slug: "too-good-to-buy",
  app: "shop",
  title: "その激安ショップ、買って大丈夫？",
  shortTitle: "その激安ショップ、\n買って大丈夫？",
  category: "ネット通販",
  difficulty: "じっくり",
  estimatedMinutes: 7,
  description:
    "欲しかったヘッドホンが大幅値引き。残りわずかの表示に、急ぎたくなるけれど。",
  objective: "広告から見つけたショップを調べ、購入するかどうか決めよう。",
  initialState: {
    screen: "product",
    settings: { seller: false, compare: false, recorded: false },
  },
  states: ["product", "checkout", "paid", "trouble", "cancelled"],
  actions: {
    seller: { kind: "inspect", label: "販売者と連絡先を確認した" },
    compare: { kind: "inspect", label: "別の販売店の情報と比較した" },
    checkout: {
      kind: "navigate",
      label: "注文手続きで支払条件を確認した",
      allowed: on("product"),
    },
    pay: {
      kind: "simulate",
      label: "架空の代金を銀行振込で支払った",
      allowed: on("checkout"),
    },
    wait: {
      kind: "reveal",
      label: "発送予定日を過ぎた状況を確認した",
      allowed: on("paid"),
    },
    cancel: {
      kind: "simulate",
      label: "購入を見送った",
      allowed: on("product", "checkout"),
    },
    back: {
      kind: "navigate",
      label: "商品ページに戻った",
      allowed: on("checkout", "cancelled"),
    },
    record: {
      kind: "inspect",
      label: "注文・振込・やり取りの記録をまとめた",
      allowed: on("paid", "trouble"),
    },
    help: {
      kind: "inspect",
      label: "金融機関や警察への相談方法を確認した",
      allowed: on("paid", "trouble"),
    },
  },
  transitions: [
    { action: "seller", apply: inspect("seller", "seller") },
    { action: "compare", apply: inspect("compare", "price") },
    {
      action: "checkout",
      apply: () => ({ screen: "checkout", discoveries: ["payment"] }),
    },
    {
      action: "pay",
      apply: () => ({ screen: "paid", outcome: shopOutcomes.paid }),
    },
    {
      action: "wait",
      apply: () => ({ screen: "trouble", outcome: shopOutcomes.trouble }),
    },
    {
      action: "cancel",
      apply: () => ({ screen: "cancelled", outcome: shopOutcomes.cancelled }),
    },
    { action: "back", apply: () => ({ screen: "product" }) },
    {
      action: "record",
      apply: () => ({
        settings: { recorded: true },
        discoveries: ["recovery"],
        outcome: shopOutcomes.recorded,
      }),
    },
    {
      action: "help",
      apply: () => ({ discoveries: ["recovery"], outcome: shopOutcomes.help }),
    },
  ],
  discoveries: [
    {
      id: "price",
      title: "値引きや残り数だけで決めない",
      detail:
        "別の販売店では同じ型番が12,800円でした。安さや「本日限定」は判断を急がせることがありますが、それだけで詐欺とは断定できません。",
    },
    {
      id: "seller",
      title: "販売者と連絡先を照らし合わせる",
      detail:
        "店名と販売会社名が違い、電話番号と返品先の記載がありません。名称の違いだけで決めず、問い合わせ先を確かめる手掛かりにします。",
    },
    {
      id: "payment",
      title: "商品ページと支払条件が違う",
      detail:
        "商品ページにはカード決済の案内があるのに、手続きでは個人名義への銀行振込だけです。手続き中に条件が変わったら、支払前に立ち止まれます。",
    },
    {
      id: "recovery",
      title: "支払後にも記録と相談ができる",
      detail:
        "サイトや取引の記録は相談に使えます。支払方法によって連絡先が違うため、金融機関などの公式窓口から確認します。",
    },
  ],
  outcomes: shopOutcomes,
  hints: [
    "価格だけでなく、どんな相手から買うのか調べてみましょう。",
    "商品ページに書かれた支払方法と、注文手続きの条件は同じでしょうか。",
    "違和感があれば購入を見送れます。支払った後も、記録を残して相談する手順を試せます。",
  ],
  knowledgeIds: ["shopping-checks"],
  reality:
    "広告や検索結果の上位にあることだけでは、取引の安全性は分かりません。個々の表示だけで決めつけず、販売者・支払方法・価格などを合わせて確認しましょう。",
};

const supportOutcomes = {
  blocked: result(
    "blocked",
    "警告の中のボタンでは閉じませんでした。",
    "このボタンは警告ページの一部です。閉じにくく見せて、連絡を急がせる演出になっています。",
    "ページ内の表示と、ブラウザのタブ操作を区別してみましょう。",
  ),
  called: result(
    "called",
    "サポートへの通話を試しました。",
    "教材内の会話が始まり、遠隔操作を許可するよう求められました。実際には電話をかけていません。",
    "通話を始めた後でも、許可せずに切る選択ができます。",
    "care",
  ),
  remote: result(
    "remote",
    "遠隔操作を許可した状態です。",
    "模擬的に許可しました。現実には、画面や情報を見られたり操作されたりする可能性があります。教材から端末の操作は行いません。",
    "相手との接続を切り、信頼できる窓口へ相談する手順を試せます。",
    "care",
  ),
  paid: result(
    "paid",
    "架空のギフトコードを渡しました。",
    "サポート代としてコードを伝えたことにしました。現実ではコードを使われてしまう可能性があります。実際の購入や支払いはありません。",
    "追加の支払いを止め、接続を切ってから相談する方法があります。",
    "care",
  ),
  closed: result(
    "closed",
    "模擬ブラウザのタブを閉じました。",
    "この警告ページを閉じました。電話、遠隔操作の許可、支払いは行っていません。",
    "現実で判断に迷ったら、警告内の連絡先ではなく、メーカーなどの公式窓口で確認しましょう。",
  ),
  hungup: result(
    "hungup",
    "遠隔操作を許可せず通話を終えました。",
    "模擬通話を切り、警告も閉じました。この体験では遠隔操作も支払いも行っていません。",
    "電話をしたことと、操作の許可や支払いをしたことを分けて振り返れます。",
  ),
  disconnected: result(
    "disconnected",
    "模擬の遠隔接続を切りました。",
    "これ以上の遠隔操作を止めました。すでに行われた操作や渡した情報まで取り消せるわけではありません。",
    "使ったソフトや支払いの有無を整理し、公式の窓口や端末の管理者に相談しましょう。",
  ),
  help: result(
    "help",
    "状況に合った相談先を確認しました。",
    "警告の表示だけか、通話・遠隔操作・支払いまで進んだかを伝えます。遠隔操作を許可した場合は端末の確認も必要です。コードを渡した場合は発行元や警察にも相談する方法があります。",
    "学校や職場の端末なら管理者に連絡します。接続を切っただけで安全に戻ったとは決めつけないようにしましょう。",
  ),
};

export const support: Scenario = {
  id: "L07",
  slug: "sudden-warning",
  app: "support",
  title: "突然の警告、電話して大丈夫？",
  shortTitle: "突然の警告、\n電話して大丈夫？",
  category: "端末・セキュリティ",
  difficulty: "はじめて",
  estimatedMinutes: 5,
  description:
    "調べもの中に出た感染警告。閉じるボタンが効かず、サポートへ電話するよう求められた。",
  objective: "突然表示された警告を調べて、次にどう操作するか決めよう。",
  initialState: {
    screen: "warning",
    settings: {
      origin: false,
      insideClose: false,
      called: false,
      remoteGranted: false,
      connected: false,
      paid: false,
    },
  },
  states: ["warning", "call", "remote", "paid", "closed"],
  actions: {
    origin: {
      kind: "inspect",
      label: "警告が表示されている場所を確認した",
      allowed: on("warning"),
    },
    insideClose: {
      kind: "simulate",
      label: "警告内の閉じるボタンを押した",
      allowed: on("warning"),
    },
    call: {
      kind: "simulate",
      label: "警告の連絡先への通話を模擬した",
      allowed: on("warning"),
    },
    close: {
      kind: "navigate",
      label: "模擬ブラウザのタブを閉じた",
      allowed: on("warning"),
    },
    hangup: {
      kind: "simulate",
      label: "遠隔操作を許可せず通話を切った",
      allowed: on("call"),
    },
    remote: {
      kind: "simulate",
      label: "遠隔操作の許可を模擬した",
      allowed: on("call"),
    },
    pay: {
      kind: "simulate",
      label: "架空のギフトコードを渡した",
      allowed: on("remote"),
    },
    disconnect: {
      kind: "simulate",
      label: "模擬の遠隔接続を切った",
      allowed: on("remote", "paid"),
    },
    help: {
      kind: "inspect",
      label: "状況別の対処と相談先を確認した",
      allowed: on("closed"),
    },
  },
  transitions: [
    { action: "origin", apply: inspect("origin", "origin") },
    {
      action: "insideClose",
      apply: () => ({
        settings: { insideClose: true },
        discoveries: ["pressure"],
        outcome: supportOutcomes.blocked,
      }),
    },
    {
      action: "call",
      apply: () => ({
        screen: "call",
        settings: { called: true },
        discoveries: ["pressure"],
        outcome: supportOutcomes.called,
      }),
    },
    {
      action: "close",
      apply: () => ({
        screen: "closed",
        discoveries: ["origin"],
        outcome: supportOutcomes.closed,
      }),
    },
    {
      action: "hangup",
      apply: () => ({
        screen: "closed",
        discoveries: ["remote"],
        outcome: supportOutcomes.hungup,
      }),
    },
    {
      action: "remote",
      apply: () => ({
        screen: "remote",
        settings: { remoteGranted: true, connected: true },
        discoveries: ["remote"],
        outcome: supportOutcomes.remote,
      }),
    },
    {
      action: "pay",
      apply: () => ({
        screen: "paid",
        settings: { paid: true },
        outcome: supportOutcomes.paid,
      }),
    },
    {
      action: "disconnect",
      apply: () => ({
        screen: "closed",
        settings: { connected: false },
        discoveries: ["recovery"],
        outcome: supportOutcomes.disconnected,
      }),
    },
    {
      action: "help",
      apply: () => ({
        discoveries: ["recovery"],
        outcome: supportOutcomes.help,
      }),
    },
  ],
  discoveries: [
    {
      id: "origin",
      title: "ページの表示と端末の警告を区別する",
      detail:
        "この警告はウェブページ内の表示です。感染を示す言葉だけで、端末が検査された証拠にはなりません。",
    },
    {
      id: "pressure",
      title: "閉じにくさや急かす言葉に立ち止まる",
      detail:
        "この教材では警告内の閉じるボタンが効かず、電話するよう求められます。焦らせて連絡へ誘う手口の一例です。",
    },
    {
      id: "remote",
      title: "電話と遠隔操作の許可は別の段階",
      detail:
        "電話した後でも、遠隔操作を許可しない選択ができます。許可すると画面や情報を相手に見られる可能性があります。",
    },
    {
      id: "recovery",
      title: "接続を切った後も確認が必要",
      detail:
        "遠隔操作を止めても、された操作や支払いは元に戻りません。端末の管理者や正規の窓口へ、行ったことを伝えて相談します。",
    },
  ],
  outcomes: supportOutcomes,
  hints: [
    "警告の本文と、ブラウザの操作部分を見比べてみましょう。",
    "警告の中の閉じるボタンとは別に、上にタブを閉じる操作があります。",
    "通話を切る、遠隔接続を切るなど、進んだ段階から対処できます。相談先も確認できます。",
  ],
  knowledgeIds: ["support-scam"],
  reality:
    "実際のOSやセキュリティソフトの警告をすべて無視するという意味ではありません。表示元や操作した内容を確認し、判断に迷ったら正規の窓口や端末の管理者に相談してください。",
};
