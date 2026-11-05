import type { Outcome, Scenario, Session, Transition } from "../engine/types";
import { news, shop, support } from "./everyday";
const outcome = (
  id: string,
  title: string,
  description: string,
  next: string,
  tone: Outcome["tone"] = "notice",
): Outcome => ({ id, title, description, next, tone });
const on =
  (...screens: string[]) =>
  (s: Session) =>
    screens.includes(s.screen);
const setting =
  (
    key: string,
    values?: string[],
    discoveries: string[] = [],
  ): Transition["apply"] =>
  (s, value) => {
    if (typeof value === "string" && values?.includes(value))
      return { settings: { [key]: value }, discoveries };
    if (!values && typeof s.settings[key] === "boolean")
      return { settings: { [key]: !s.settings[key] }, discoveries };
    return {};
  };
const mailOutcomes = {
  sent: outcome(
    "sent",
    "情報を渡した後にも、できることがある。",
    "架空のログイン情報と住所を送信しました。現実には、不正ログインや情報の悪用につながる可能性があります。この体験では何も外部に送信されません。",
    "公式アプリからパスワード変更・相談の対応を確認してみましょう。",
    "care",
  ),
  closed: outcome(
    "closed",
    "入力する前に、立ち止まれました。",
    "リンクを開くことと、情報を渡すことは別の段階です。今回は情報を送信せずに画面を閉じました。",
    "公式アプリなど、メールと別の経路から配送状況を確認しましょう。",
  ),
  removed: outcome(
    "removed",
    "メールを受信箱から取り除きました。",
    "このメールからの操作をやめることで、情報を渡すきっかけを減らせます。ただし、削除だけでは真偽を確かめたことにはなりません。",
    "差出人やリンク先、公式アプリの情報も振り返ってみましょう。",
  ),
  recovered: outcome(
    "recovered",
    "公式の経路で、次の対応を確認しました。",
    "入力したパスワードを使うサービスのパスワード変更、不審なログインの確認、サービス窓口への相談が必要です。送信した住所などを取り戻せる保証はありません。",
    "被害を一人で抱えず、信頼できる人や相談窓口に相談しましょう。",
  ),
  official: outcome(
    "official",
    "メールとは違う情報が見つかりました。",
    "公式アプリでは「配送中・住所確認は不要」と表示されています。メールの要求と一致していません。",
    "メールのリンクから入力せず、必要なら公式窓口に確認しましょう。",
  ),
};
const mail: Scenario = {
  id: "L01",
  slug: "suspicious-email",
  app: "mail",
  title: "そのメール、本当に大丈夫？",
  shortTitle: "そのメール、\n本当に大丈夫？",
  category: "詐欺・フィッシング",
  difficulty: "はじめて",
  estimatedMinutes: 5,
  description: "届いたのは、いつもの配送通知。リンクを開く前に、何を確かめる？",
  objective: "届いた配送通知を調べて、荷物を受け取るための行動を決めよう。",
  initialState: {
    screen: "inbox",
    settings: { sender: false, url: false, submitted: false, removed: false },
  },
  states: ["inbox", "email", "website", "official", "deleted"],
  actions: {
    open: {
      kind: "navigate",
      label: "配送通知を開いた",
      allowed: (s) => s.screen === "inbox" && !s.settings.removed,
    },
    sender: {
      kind: "inspect",
      label: "差出人の詳細を確認した",
      allowed: on("email"),
    },
    url: {
      kind: "inspect",
      label: "リンク先URLを確認した",
      allowed: on("email"),
    },
    link: {
      kind: "navigate",
      label: "メールのリンクを開いた",
      allowed: on("email"),
    },
    send: {
      kind: "simulate",
      label: "架空の情報を送信した",
      allowed: (s) => s.screen === "website" && !s.settings.submitted,
    },
    close: {
      kind: "navigate",
      label: "リンク先を閉じた",
      allowed: on("website"),
    },
    official: { kind: "navigate", label: "独立した公式アプリを確認した" },
    back: { kind: "navigate", label: "受信箱に戻った" },
    remove: {
      kind: "simulate",
      label: "メールを削除した",
      allowed: on("email"),
    },
    report: {
      kind: "simulate",
      label: "迷惑メールとして報告した",
      allowed: on("email"),
    },
    recover: {
      kind: "simulate",
      label: "送信後の対応を公式アプリで確認した",
      allowed: (s) => s.screen === "official" && !!s.settings.submitted,
    },
  },
  transitions: [
    { action: "open", apply: () => ({ screen: "email" }) },
    {
      action: "sender",
      apply: () => ({ settings: { sender: true }, discoveries: ["sender"] }),
    },
    {
      action: "url",
      apply: () => ({ settings: { url: true }, discoveries: ["url"] }),
    },
    { action: "link", apply: () => ({ screen: "website" }) },
    {
      action: "send",
      apply: () => ({
        settings: { submitted: true },
        discoveries: ["input"],
        outcome: mailOutcomes.sent,
      }),
    },
    {
      action: "close",
      apply: (s) => ({
        screen: "email",
        discoveries: ["input"],
        outcome: s.settings.submitted ? mailOutcomes.sent : mailOutcomes.closed,
      }),
    },
    {
      action: "official",
      apply: () => ({
        screen: "official",
        discoveries: ["official"],
        outcome: mailOutcomes.official,
      }),
    },
    { action: "back", apply: () => ({ screen: "inbox" }) },
    ...["remove", "report"].map((action) => ({
      action,
      apply: () => ({
        screen: "deleted",
        settings: { removed: true },
        outcome: mailOutcomes.removed,
      }),
    })),
    {
      action: "recover",
      apply: () => ({
        discoveries: ["input"],
        outcome: mailOutcomes.recovered,
      }),
    },
  ],
  discoveries: [
    {
      id: "sender",
      title: "表示名と差出人は別の情報",
      detail:
        "「こもれび配送」という表示名でも、差出人は notice@komorebi-support.example。表示名やアドレスだけでは本物と断定できません。",
    },
    {
      id: "url",
      title: "リンク先と公式のドメインが違う",
      detail:
        "komorebi-verify.example は公式の komorebi.example とは別のドメイン。「24時間以内」と急がせる文面にも立ち止まる余地があります。",
    },
    {
      id: "official",
      title: "別の経路で確かめられる",
      detail:
        "公式アプリでは住所確認を求められていません。メールの要求との食い違いが手掛かりです。",
    },
    {
      id: "input",
      title: "開く・入力するではリスクが違う",
      detail:
        "入力前なら送信をやめられます。入力後もパスワード変更などで被害を減らす対応ができます。",
    },
  ],
  outcomes: mailOutcomes,
  hints: [
    "差出人の名前以外にも、確認できる情報がありそうです。",
    "「差出人の詳細」「リンク先を確認」を開き、公式アプリの情報と比べてみましょう。",
    "メールからの入力をやめ、公式アプリから確認する方法があります。送信後の対応も試せます。",
  ],
  knowledgeIds: ["phishing"],
  reality:
    "現実には、リンクを開くだけでも追跡や脆弱性の悪用などのリスクがあります。「入力しなければ必ず安全」という意味ではありません。OSやブラウザも更新しましょう。",
};
export const postText = (s: Session) =>
  `今日もおつかれさま！${s.settings.school ? "星凪学園の授業のあと、" : ""}${s.settings.place ? "月見駅前のカフェ・モリで" : "カフェで"}${s.settings.schedule ? "毎週火・木の17時から" : ""}アルバイト。${s.settings.tone === "short" ? "今日もがんばった。" : "帰りのラテが楽しみ。"}`;
export const inferPost = (s: Session): string[] => [
  ...(s.settings.school ? ["学校名：投稿文に星凪学園と書かれています。"] : []),
  ...(s.settings.place
    ? ["生活圏・勤務先：月見駅前のカフェが分かります。"]
    : []),
  ...(s.settings.schedule
    ? ["行動パターン：火曜・木曜の17時に勤務すると分かります。"]
    : []),
  ...(s.settings.image
    ? ["投稿画像：店名入りのカップから勤務先の候補が残ります。"]
    : []),
  "過去の投稿：駅と学校行事の情報は、今回の文章を減らしても残っています。",
];
const postOutcomes = {
  published: outcome(
    "published",
    "投稿を見た人の視点を、確かめよう。",
    "",
    "第三者の視点に切り替え、過去の投稿と組み合わせて見える情報を確認しましょう。",
  ),
  removed: outcome(
    "removed",
    "この投稿を削除しました。",
    "これから見られる機会を減らせます。ただし、すでに保存・再共有された内容まで消えるとは限りません。過去の投稿も別に残っています。",
    "公開前に情報量と公開範囲を見直すことが役立ちます。",
  ),
};
const post: Scenario = {
  id: "L02",
  slug: "social-footprint",
  app: "post",
  title: "その投稿から何が分かる？",
  shortTitle: "その投稿から\n何が分かる？",
  category: "個人情報・SNS",
  difficulty: "じっくり",
  estimatedMinutes: 7,
  description: "何気ない日常の投稿。つなぎ合わせると、見えてくるものがある。",
  objective: "架空の「はる」の投稿を編集し、どこまで公開するか決めよう。",
  initialState: {
    screen: "editor",
    settings: {
      school: true,
      place: true,
      schedule: true,
      image: true,
      audience: "public",
      tone: "normal",
      past: false,
      view: "self",
    },
  },
  states: ["editor", "posted", "deleted"],
  actions: {
    ...Object.fromEntries(
      ["school", "place", "schedule", "image"].map((key) => [
        key,
        {
          kind: "toggle" as const,
          label: `${{ school: "学校名", place: "場所", schedule: "曜日・時間", image: "投稿画像" }[key]}の掲載を変更した`,
          allowed: on("editor"),
        },
      ]),
    ),
    tone: {
      kind: "select",
      label: "投稿の表現を編集した",
      allowed: on("editor"),
    },
    audience: {
      kind: "select",
      label: "投稿の公開範囲を変更した",
      allowed: on("editor"),
    },
    past: { kind: "inspect", label: "過去の投稿を比較した" },
    view: { kind: "inspect", label: "第三者から見える情報を確認した" },
    publish: {
      kind: "simulate",
      label: "架空のSNSに投稿した",
      allowed: on("editor"),
    },
    edit: {
      kind: "navigate",
      label: "投稿内容を見直した",
      allowed: on("posted", "deleted"),
    },
    remove: {
      kind: "simulate",
      label: "投稿を削除した",
      allowed: on("posted"),
    },
  },
  transitions: [
    ...["school", "place", "schedule", "image"].map((key) => ({
      action: key,
      apply: setting(key, undefined, ["pieces"]),
    })),
    { action: "tone", apply: setting("tone", ["normal", "short"]) },
    {
      action: "audience",
      apply: setting(
        "audience",
        ["public", "friends", "private"],
        ["audience"],
      ),
    },
    {
      action: "past",
      apply: () => ({ settings: { past: true }, discoveries: ["combination"] }),
    },
    { action: "view", apply: setting("view", ["self", "other"], ["pieces"]) },
    {
      action: "publish",
      apply: (s) => ({
        screen: "posted",
        outcome: {
          ...postOutcomes.published,
          description: `${s.settings.audience === "public" ? "誰でも閲覧できる全体公開です。" : s.settings.audience === "friends" ? "閲覧できるのは友人です。ただし、スクリーンショットなどの再共有は起こり得ます。" : "この投稿は自分だけが閲覧できます。過去の公開投稿の範囲は変わりません。"} ${inferPost(s).length - 1}種類の手掛かりが今回の投稿に残っています。`,
        },
        discoveries: ["audience"],
      }),
    },
    {
      action: "edit",
      apply: () => ({ screen: "editor", settings: { view: "self" } }),
    },
    {
      action: "remove",
      apply: () => ({
        screen: "deleted",
        outcome: postOutcomes.removed,
        discoveries: ["reshare"],
      }),
    },
  ],
  discoveries: [
    {
      id: "pieces",
      title: "文章以外にも手掛かりがある",
      detail:
        "学校名、場所、曜日・時間、画像は、それぞれ異なる情報を伝えます。文章を消しても画像が残る場合があります。",
    },
    {
      id: "combination",
      title: "過去の投稿とつながる",
      detail:
        "駅と学校行事についての過去の投稿が、今回の情報を補う場合があります。単独の投稿だけでは判断できません。",
    },
    {
      id: "audience",
      title: "公開範囲で届く相手が変わる",
      detail:
        "全体公開・友人限定・自分のみでは閲覧者が変わります。友人限定でも再共有の可能性は残ります。",
    },
    {
      id: "reshare",
      title: "削除しても回収しきれないことがある",
      detail:
        "削除は広がりを減らす一歩です。保存された画像などまで完全に取り戻せるとは限りません。",
    },
  ],
  outcomes: postOutcomes,
  hints: [
    "投稿の文章・画像と、過去の投稿を眺めてみましょう。",
    "曜日、時間、場所が組み合わさると、生活のパターンはどう見えるでしょう。",
    "情報を減らし、公開範囲を調整して、第三者の視点でもう一度確かめてみましょう。",
  ],
  knowledgeIds: ["personal-information"],
  reality:
    "この教材で表示する推測は、架空の投稿から分かる例です。実在する人を調べたり、居場所を追跡したりするために使わないでください。",
};
const photoOutcomes = {
  published: outcome(
    "published",
    "写真の届く範囲と、写る情報。",
    "",
    "公開範囲・顔・背景・本人の希望を、それぞれ別に確認しましょう。",
  ),
  removed: outcome(
    "removed",
    "公開を取り下げました。",
    "新たに見られる機会を減らしました。すでに保存された画像は残る可能性があります。",
    "写っている友人にも状況を伝え、必要なら再共有した人に削除を依頼しましょう。",
  ),
};
const photo: Scenario = {
  id: "L03",
  slug: "photo-privacy",
  app: "photo",
  title: "この写真、公開していい？",
  shortTitle: "この写真、\n公開していい？",
  category: "写真・プライバシー",
  difficulty: "はじめて",
  estimatedMinutes: 5,
  description: "友人と撮った、いい一枚。写真には、思い出以外も写っている。",
  objective: "友人との写真を確認し、相手の希望を踏まえて投稿方法を考えよう。",
  initialState: {
    screen: "editor",
    settings: {
      face: false,
      background: false,
      consent: false,
      zoom: false,
      audience: "public",
      inspected: "",
    },
  },
  states: ["editor", "posted", "deleted"],
  actions: {
    inspect: { kind: "inspect", label: "写真の写り込みを確認した" },
    zoom: { kind: "toggle", label: "写真を拡大・縮小した" },
    face: {
      kind: "toggle",
      label: "顔のぼかしを変更した",
      allowed: on("editor"),
    },
    background: {
      kind: "toggle",
      label: "背景・私物のぼかしを変更した",
      allowed: on("editor"),
    },
    consent: { kind: "inspect", label: "友人の公開への同意を確認した" },
    audience: {
      kind: "select",
      label: "写真の公開範囲を変更した",
      allowed: on("editor"),
    },
    publish: {
      kind: "simulate",
      label: "写真を投稿した",
      allowed: on("editor"),
    },
    remove: {
      kind: "simulate",
      label: "写真の公開を取り下げた",
      allowed: on("posted"),
    },
    edit: {
      kind: "navigate",
      label: "写真の設定を見直した",
      allowed: on("posted", "deleted"),
    },
  },
  transitions: [
    {
      action: "inspect",
      apply: (_, value) =>
        typeof value === "string" && ["faces", "sign", "bag"].includes(value)
          ? {
              settings: { inspected: value },
              discoveries: [value === "faces" ? "faces" : "background"],
            }
          : {},
    },
    { action: "zoom", apply: setting("zoom") },
    { action: "face", apply: setting("face", undefined, ["faces"]) },
    {
      action: "background",
      apply: setting("background", undefined, ["background"]),
    },
    {
      action: "consent",
      apply: () => ({ settings: { consent: true }, discoveries: ["consent"] }),
    },
    {
      action: "audience",
      apply: setting(
        "audience",
        ["public", "friends", "private"],
        ["audience"],
      ),
    },
    {
      action: "publish",
      apply: (s) => {
        const permitted =
          s.settings.consent &&
          s.settings.audience === "friends" &&
          s.settings.background;
        return {
          screen: "posted",
          discoveries: ["audience"],
          outcome: {
            ...photoOutcomes.published,
            tone:
              permitted || s.settings.audience === "private"
                ? "notice"
                : "care",
            description:
              s.settings.audience === "private"
                ? "自分のみで保存しました。ほかの人には公開されません。共有するときには、改めて本人の希望を確認しましょう。"
                : `${s.settings.audience === "public" ? "誰でも見られる状態です。友人は全体公開には同意していません。" : "友人限定で公開しました。友人からの再共有は完全には防げません。"} ${!s.settings.consent ? "本人の希望はまだ確認していません。" : permitted ? "「友人限定で、学校名と私物は隠して」という希望を反映しています。" : "本人の希望と、いまの設定をもう一度比べましょう。"} ${s.settings.face ? "顔を隠しても服装などが手掛かりになる場合があります。" : "顔から人物が分かる可能性があります。"} ${s.settings.background ? "背景・私物の文字情報を隠しました。" : "学校名や私物の名札が見えています。"}`,
          },
        };
      },
    },
    {
      action: "remove",
      apply: () => ({ screen: "deleted", outcome: photoOutcomes.removed }),
    },
    { action: "edit", apply: () => ({ screen: "editor" }) },
  ],
  discoveries: [
    {
      id: "faces",
      title: "顔だけが識別の手掛かりではない",
      detail:
        "顔を隠すと識別される可能性を減らせますが、服装・持ち物・一緒に写る人から分かる場合もあります。",
    },
    {
      id: "background",
      title: "背景と私物にも情報がある",
      detail:
        "「星凪学園」の看板と「AOI」の名札が見えます。写り込んだ情報にも目を向けましょう。",
    },
    {
      id: "consent",
      title: "撮影と公開の同意は別",
      detail:
        "あおいは「友人限定ならOK。学校名と私物の名札は隠して」と希望しています。撮影に応じたことだけで公開の同意とはいえません。",
    },
    {
      id: "audience",
      title: "公開する相手を選ぶ",
      detail:
        "友人限定でも再共有は起こり得ます。ぼかしと公開範囲、同意を組み合わせて考えましょう。",
    },
  ],
  outcomes: photoOutcomes,
  hints: [
    "人物だけでなく、背景や持ち物にも目を向けてみましょう。",
    "写真を拡大し、看板や名札を確認できます。友人は公開についてどう考えているでしょう。",
    "友人の希望を確認し、背景・私物をぼかして友人限定にする方法や、公開を見送る方法があります。",
  ],
  knowledgeIds: ["photo-privacy"],
  reality:
    "顔が写る写真を公開することが、いつも問題になるわけではありません。本人の意思、公開する目的・相手、写り込んだ情報を状況ごとに考えましょう。",
};
export const comments = {
  attack: "こんなことするなんて、最低な人だね。",
  criticism: "順番を待っている人がいるので、列への割り込みはやめてほしい。",
  question:
    "写真だけでは分からないのですが、並んでいた人に確認したのでしょうか？",
};
export const commentText = (s: Session) =>
  s.settings.rephrase && s.settings.choice === "attack"
    ? comments.criticism
    : (comments[s.settings.choice as keyof typeof comments] ??
      comments.question);
const commentOutcomes = {
  attack: outcome(
    "attack",
    "行動への不満が、人格への攻撃に。",
    "「最低な人」という言葉は、人そのものへの攻撃として伝わる可能性があります。相手が傷つき、周囲も加わって対立が広がるかもしれません。",
    "伝えたかった具体的な行動に絞って、表現を見直せます。",
    "care",
  ),
  criticism: outcome(
    "criticism",
    "何を変えてほしいかが伝わる表現です。",
    "列への割り込みという行動を挙げ、その改善を求めています。ただし、元の投稿だけで事情や事実を断定できるとは限りません。",
    "見えていない事情も考え、必要なら確認する表現を選びましょう。",
  ),
  question: outcome(
    "question",
    "分からないことを、確認する言葉に。",
    "写真だけでは事情を判断できないことを示し、相手に確認しました。相手が答えないこともあります。返答を強要する必要はありません。",
    "意見が違っても、対話を続けるか、距離を置くかを選べます。",
  ),
  cancelled: outcome(
    "cancelled",
    "今は投稿しない、という選択。",
    "コメントは公開されませんでした。少し時間を置いたり、画面から離れたりしてから考え直せます。",
    "必要ならサービスの通報・ブロック機能も検討できます。",
  ),
  reported: outcome(
    "reported",
    "運営への報告を選びました。",
    "架空の運営に確認を依頼しました。通報しても必ず削除されるわけではありません。この体験から実際の通報は行われません。",
    "理由や状況を整理し、公開の場で攻撃を重ねずに相談する方法があります。",
  ),
  blocked: outcome(
    "blocked",
    "この相手との距離を置きました。",
    "模擬タイムラインで相手の投稿を非表示にしました。現実のブロック機能の範囲はサービスによって違い、投稿自体が消えるとは限りません。",
    "困ることが続くなら、記録を残し、信頼できる人や窓口に相談しましょう。",
  ),
  removed: outcome(
    "removed",
    "コメントを削除しました。",
    "新たに読まれる機会を減らせます。すでに相手が読んだり、保存したりした可能性は残ります。",
    "必要なら相手に説明し、傷つける表現を繰り返さないように見直しましょう。",
  ),
};
const comment: Scenario = {
  id: "L04",
  slug: "thoughtful-comment",
  app: "comment",
  title: "そのコメント、どう伝わる？",
  shortTitle: "そのコメント、\nどう伝わる？",
  category: "コミュニケーション",
  difficulty: "じっくり",
  estimatedMinutes: 7,
  description: "モヤっとした、その気持ち。投稿する前に、少しだけ視点を変えて。",
  objective: "気になる投稿に、どのように対応するか考えてみよう。",
  initialState: {
    screen: "thread",
    settings: { choice: "attack", rephrase: false, perspective: "self" },
  },
  states: ["thread", "posted", "cancelled", "reported", "blocked", "deleted"],
  actions: {
    choice: {
      kind: "select",
      label: "コメント候補を選んだ",
      allowed: on("thread"),
    },
    rephrase: {
      kind: "toggle",
      label: "表現を具体的な行動への意見に修正した",
      allowed: (s) => s.screen === "thread" && s.settings.choice === "attack",
    },
    perspective: { kind: "inspect", label: "相手・周囲の視点を確認した" },
    publish: {
      kind: "simulate",
      label: "コメントを投稿した",
      allowed: on("thread"),
    },
    cancel: {
      kind: "simulate",
      label: "コメントを取りやめた",
      allowed: on("thread"),
    },
    report: { kind: "simulate", label: "元の投稿を運営に報告した" },
    block: { kind: "simulate", label: "投稿者をブロックした" },
    edit: { kind: "navigate", label: "コメントを考え直した" },
    remove: {
      kind: "simulate",
      label: "自分のコメントを削除した",
      allowed: on("posted"),
    },
  },
  transitions: [
    {
      action: "choice",
      apply: setting(
        "choice",
        ["attack", "criticism", "question"],
        ["expression"],
      ),
    },
    {
      action: "rephrase",
      apply: setting("rephrase", undefined, ["expression"]),
    },
    {
      action: "perspective",
      apply: setting(
        "perspective",
        ["self", "recipient", "bystander"],
        ["perspective"],
      ),
    },
    {
      action: "publish",
      apply: (s) => ({
        screen: "posted",
        discoveries: [
          "expression",
          ...(s.settings.choice === "question" ? ["facts"] : []),
        ],
        outcome:
          commentOutcomes[
            s.settings.choice === "attack" && s.settings.rephrase
              ? "criticism"
              : (s.settings.choice as keyof typeof commentOutcomes)
          ],
      }),
    },
    ...(["cancel", "report", "block", "remove"] as const).map((action) => ({
      action,
      apply: () => ({
        screen: {
          cancel: "cancelled",
          report: "reported",
          block: "blocked",
          remove: "deleted",
        }[action],
        discoveries: ["alternatives"],
        outcome:
          commentOutcomes[
            {
              cancel: "cancelled",
              report: "reported",
              block: "blocked",
              remove: "removed",
            }[action] as keyof typeof commentOutcomes
          ],
      }),
    })),
    { action: "edit", apply: () => ({ screen: "thread" }) },
  ],
  discoveries: [
    {
      id: "expression",
      title: "人への攻撃と、行動への意見",
      detail:
        "「最低な人」ではなく、どの行動をどう変えてほしいかを伝えると、意見の焦点が具体的になります。",
    },
    {
      id: "perspective",
      title: "相手や周囲からの見え方",
      detail:
        "短い文章は意図と違う形で受け取られる場合があります。反応は人や状況によって異なります。",
    },
    {
      id: "facts",
      title: "写真だけで事情は決められない",
      detail:
        "見えた事実と推測を分けることは、誤った非難やデマを広げないためにも役立ちます。",
    },
    {
      id: "alternatives",
      title: "投稿以外にも対応がある",
      detail:
        "投稿をやめる、通報する、ブロックする。無理に対話を続けず距離を置く方法もあります。",
    },
  ],
  outcomes: commentOutcomes,
  hints: [
    "その文章は、行動について述べていますか。それとも人そのものについてでしょうか。",
    "相手や第三者の視点に切り替えてみましょう。写真の外の事情は分かるでしょうか。",
    "具体的な行動を伝える、事情を尋ねる、投稿を見送るなど、別の方法も試せます。",
  ],
  knowledgeIds: ["communication"],
  reality:
    "この教材の反応は起こり得る一例です。文章だけから法的な違法性を判定するものではありません。実際の問題は内容や背景を含めた個別の判断が必要です。",
};
export const scenarios: Scenario[] = [
  mail,
  post,
  photo,
  comment,
  news,
  shop,
  support,
];
