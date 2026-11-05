import { test, expect, type Page } from "@playwright/test";
const failures = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const messages: string[] = [];
  failures.set(page, messages);
  page.on("pageerror", (error) => messages.push(error.message));
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== "http://127.0.0.1:4173")
      messages.push(`External request: ${request.url()}`);
  });
});
test.afterEach(async ({ page }) => {
  expect(failures.get(page)).toEqual([]);
});
const paths = [
  "suspicious-email",
  "social-footprint",
  "photo-privacy",
  "thoughtful-comment",
  "before-sharing",
  "too-good-to-buy",
  "sudden-warning",
];
async function go(page: Page, path: string) {
  await page.goto(`/#${path}`);
  await expect(page.locator("h1")).toBeVisible();
}
async function finish(page: Page) {
  await page.getByRole("button", { name: "終了して振り返る" }).click();
  await expect(
    page.getByRole("heading", { name: "振り返り", exact: true }),
  ).toBeFocused();
}
async function reset(page: Page) {
  await page.getByRole("button", { name: "リセット", exact: true }).click();
  await page.getByRole("button", { name: "最初からやり直す" }).click();
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
}
test("top page, responsive layout, real navigation, no console errors or external requests", async ({
  page,
}, info) => {
  const errors: string[] = [];
  const external: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== "http://127.0.0.1:4173")
      external.push(request.url());
  });
  await go(page, "/");
  await expect(
    page.getByRole("heading", {
      name: /失敗できる、\s*架空のインターネット。/,
    }),
  ).toBeVisible();
  await expect(page.locator(".challenge-card")).toHaveCount(paths.length);
  await noOverflow(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `test-results/home-${info.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("link", { name: "体験をはじめる" }).click();
  await expect(page).toHaveURL(/#\/challenges$/);
  for (const path of paths) {
    await go(page, `/challenges/${path}`);
    await noOverflow(page);
  }
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});
test("L01: investigation, safe exit, official comparison, reflection, reset and knowledge", async ({
  page,
}, info) => {
  await go(page, "/challenges/suspicious-email");
  await expect(page.locator(".hint-panel li")).toHaveCount(0);
  await page.locator(".hint-panel > summary").click();
  await expect(page.locator(".hint-panel li")).toHaveCount(1);
  await page.getByRole("button", { name: /こもれび配送.*お荷物/ }).click();
  await page.getByRole("button", { name: "差出人の詳細" }).click();
  await expect(
    page.getByText("notice@komorebi-support.example", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "リンク先を確認", exact: true })
    .click();
  await expect(
    page.getByText("https://komorebi-verify.example/address", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "お届け先を確認する", exact: true })
    .click();
  await expect(page.locator("input")).toHaveCount(0);
  await page.getByRole("button", { name: "情報を送信せずに閉じる" }).click();
  await expect(page.locator(".result-panel")).toContainText("情報を送信せず");
  await page.getByRole("button", { name: "公式アプリを開く" }).click();
  await expect(page.locator(".mock-form")).toContainText("住所確認は不要");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `test-results/email-${info.project.name}.png`,
    fullPage: true,
  });
  await finish(page);
  await expect(page.locator(".action-history")).toContainText("差出人の詳細");
  await page.getByRole("button", { name: "もう一度試す", exact: true }).click();
  await expect(page.locator(".email-row")).toBeVisible();
  await expect(page.locator(".discovery-track .found")).toHaveCount(0);
  await finish(page);
  await page.locator(".article-link").click();
  await expect(page.locator("h1")).toHaveText("フィッシングメールの仕組み");
  await page.locator(".related-challenge").click();
  await expect(page.locator(".email-row")).toBeVisible();
});
test("hints reveal progressively by keyboard, persist when collapsed and reset with discoveries", async ({
  page,
}, info) => {
  await go(page, "/challenges/suspicious-email");
  const hints = page.locator(".hint-panel");
  const summary = hints.locator("summary");
  const discoveries = page.getByRole("progressbar", { name: "発見したこと" });
  await expect(hints).not.toHaveAttribute("open");
  await expect(discoveries).toHaveAttribute("aria-valuenow", "0");
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(hints.locator("li")).toHaveCount(1);
  await expect(summary).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(hints).not.toHaveAttribute("open");
  await page.keyboard.press("Enter");
  await expect(hints.locator("li")).toHaveCount(1);
  await page.getByRole("button", { name: "次のヒントを見る" }).click();
  await expect(hints.locator("li")).toHaveCount(2);
  await page.getByRole("button", { name: "次のヒントを見る" }).click();
  await expect(hints.locator("li")).toHaveCount(3);
  await expect(page.getByRole("button", { name: "すべて表示済み" })).toBeDisabled();
  await page.locator(".email-row").click();
  await page.getByRole("button", { name: "差出人の詳細" }).click();
  await expect(discoveries).toHaveAttribute("aria-valuenow", "1");
  await expect(page.locator(".discovery-track .found")).toHaveCount(1);
  await expect(page.locator(".discovery-panel li")).toHaveCount(1);
  await noOverflow(page);
  await reset(page);
  await expect(hints).not.toHaveAttribute("open");
  await expect(hints.locator("li")).toHaveCount(0);
  await expect(discoveries).toHaveAttribute("aria-valuenow", "0");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `test-results/workspace-${info.project.name}.png`, fullPage: true });

  await page.setViewportSize({ width: 320, height: 740 });
  await summary.click();
  await expect(hints.locator("li")).toHaveCount(1);
  await noOverflow(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(summary).toBeVisible();
  await expect(hints.locator("li")).toBeVisible();
  await noOverflow(page);
});

test("L01: sent information can be addressed, deletion stays deleted", async ({
  page,
}) => {
  await go(page, "/challenges/suspicious-email");
  await page.locator(".email-row").click();
  await page
    .getByRole("button", { name: "お届け先を確認する", exact: true })
    .click();
  await page.getByRole("button", { name: "架空の情報で送信する" }).click();
  await expect(
    page.getByRole("button", { name: "架空の情報を送信しました" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "公式アプリを開く" }).click();
  await page
    .getByRole("button", { name: "入力してしまった場合の対応を確認" })
    .click();
  await expect(page.locator(".result-panel")).toContainText("パスワード変更");
  await reset(page);
  await page.locator(".email-row").click();
  await page.getByRole("button", { name: "削除", exact: true }).click();
  await page.getByRole("button", { name: "公式アプリを開く" }).click();
  await page.getByRole("button", { name: "受信トレイに戻る" }).click();
  await expect(page.locator(".email-row")).toHaveCount(0);
  await expect(page.locator(".inbox")).toContainText("メールはありません");
});
test("L02: edit information, compare past posts, change audience, publish and delete", async ({
  page,
}, info) => {
  await go(page, "/challenges/social-footprint");
  await page.getByRole("button", { name: "この内容で投稿する" }).click();
  await expect(page.locator(".result-panel")).toContainText("4種類");
  await page.getByRole("button", { name: "投稿を編集する" }).click();
  for (const label of [
    "学校名",
    "場所・勤務先",
    "曜日・時間",
    "店名が写った画像",
  ])
    await page.getByRole("checkbox", { name: label, exact: true }).uncheck();
  await page.getByLabel("公開範囲", { exact: true }).selectOption("friends");
  await page.getByRole("button", { name: "第三者の視点", exact: true }).click();
  await page.getByRole("button", { name: "過去の投稿と比較する" }).click();
  await expect(page.locator(".post-preview")).not.toContainText("星凪学園");
  await expect(page.locator(".past-posts")).toContainText("星凪祭");
  await page.getByRole("button", { name: "この内容で投稿する" }).click();
  await expect(page.locator(".result-panel")).toContainText("0種類");
  await expect(page.locator(".result-panel")).toContainText("再共有");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `test-results/post-${info.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "投稿を削除する" }).click();
  await expect(page.locator(".result-panel")).toContainText(
    "消えるとは限りません",
  );
  await finish(page);
  await expect(page.locator(".action-history")).toContainText("投稿を削除した");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `test-results/reflection-${info.project.name}.png`,
    fullPage: true,
  });
});
test("L03: inspect, enlarge, consent, blur preview, change audience and recover", async ({
  page,
}, info) => {
  await go(page, "/challenges/photo-privacy");
  await page.getByRole("button", { name: "写真を拡大", exact: true }).click();
  await expect(page.locator(".photo-frame")).toHaveClass(/zoomed/);
  await noOverflow(page);
  await page.getByRole("button", { name: "元の大きさに戻す" }).click();
  await page.getByRole("button", { name: "背景を確認", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("星凪学園");
  await page.getByRole("button", { name: "この設定で投稿する" }).click();
  await expect(page.locator(".result-panel")).toContainText("同意していません");
  await page.getByRole("button", { name: "設定を見直す" }).click();
  await page
    .getByRole("button", { name: "あおいに公開してよいか確認する" })
    .click();
  await expect(page.locator(".chat-bubble")).toContainText("友人限定ならOK");
  await page.getByRole("checkbox", { name: "人物の顔をぼかす" }).check();
  await page
    .getByRole("checkbox", { name: "背景・私物の文字をぼかす" })
    .check();
  await expect(page.locator(".photo-frame svg")).toHaveAttribute(
    "aria-label",
    /顔はぼかし済み/,
  );
  await page.getByLabel("公開範囲", { exact: true }).selectOption("friends");
  await page.getByRole("button", { name: "この設定で投稿する" }).click();
  await expect(page.locator(".result-panel")).toContainText("希望を反映");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `test-results/photo-${info.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "公開を取り下げる" }).click();
  await expect(page.locator(".result-panel")).toContainText("保存された画像");
  await finish(page);
});
test("L04: attack, perspectives, deletion, rephrase, cancel, report and block", async ({
  page,
}, info) => {
  await go(page, "/challenges/thoughtful-comment");
  await page
    .getByRole("button", { name: "コメントを投稿", exact: true })
    .click();
  await expect(page.locator(".result-panel")).toContainText("人格への攻撃");
  await page.getByRole("button", { name: "相手の視点", exact: true }).click();
  await expect(page.locator(".social-content .info-box")).toContainText(
    "否定された",
  );
  await page.getByRole("button", { name: "自分のコメントを削除" }).click();
  await page.getByRole("button", { name: "別の対応を考える" }).click();
  await page
    .getByRole("checkbox", { name: "具体的な行動への意見に言い換える" })
    .check();
  await expect(page.locator(".comment-preview")).toContainText("割り込み");
  await page
    .getByRole("button", { name: "コメントを投稿", exact: true })
    .click();
  await expect(page.locator(".result-panel")).toContainText(
    "改善を求めています",
  );
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `test-results/comment-${info.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "別の対応を考える" }).click();
  await page.getByRole("button", { name: "投稿を取りやめる" }).click();
  await expect(page.locator(".result-panel")).toContainText(
    "公開されませんでした",
  );
  await page.getByRole("button", { name: "元の投稿を通報" }).click();
  await expect(page.locator(".result-panel")).toContainText(
    "必ず削除されるわけではありません",
  );
  await page.getByRole("button", { name: "ブロック", exact: true }).click();
  await expect(page.locator(".social-content")).toContainText("投稿を非表示");
  await finish(page);
});
test("L05: inspect original date, correct a share, delete, hold and publish verified information", async ({
  page,
}, info) => {
  await go(page, "/challenges/before-sharing");
  await expect(
    page.getByRole("button", { name: "確認した情報で投稿", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "そのままシェア", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "自分の投稿", exact: true }),
  ).toContainText("中止らしい");
  await page
    .getByRole("button", { name: "元の投稿を開く", exact: true })
    .click();
  await page
    .getByRole("button", { name: "画像全体を確認", exact: true })
    .click();
  await expect(page.locator(".evidence-panel")).toContainText("2025年9月12日");
  await page
    .getByRole("button", { name: "主催者の発表を確認", exact: true })
    .click();
  await page
    .getByRole("button", { name: "確認した情報で訂正する", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "自分の投稿", exact: true }),
  ).toContainText("昨年のもの");
  await expect(page.locator(".result-panel")).toContainText(
    "全員に届くとは限りません",
  );
  await noOverflow(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `test-results/news-${info.project.name}.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "自分のシェアを削除", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "自分の投稿", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "伝える内容を考え直す", exact: true })
    .click();
  await page
    .getByRole("button", { name: "今はシェアしない", exact: true })
    .click();
  await page
    .getByRole("button", { name: "伝える内容を考え直す", exact: true })
    .click();
  await page
    .getByRole("button", { name: "確認した情報で投稿", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "自分の投稿", exact: true }),
  ).toContainText("開催予定");
  await finish(page);
  await expect(page.locator(".action-history")).toContainText("訂正を追記した");
  await page.locator(".article-link").click();
  await expect(page).toHaveURL(/#\/knowledge\/checking-information$/);
  await page.locator(".related-challenge").click();
  await expect(
    page.getByRole("button", { name: "そのままシェア", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "学習の記録", exact: true }).click();
  await page.reload();
  await expect(
    page
      .locator(".progress-item")
      .filter({ hasText: "そのシェア、いつの情報？" }),
  ).toContainText("振り返り済み");
});

test("L06: compare seller and terms, leave before payment, preserve records after a transfer", async ({
  page,
}, info) => {
  await go(page, "/challenges/too-good-to-buy");
  await page
    .getByRole("button", { name: "販売者・連絡先", exact: true })
    .click();
  await page.getByRole("button", { name: "別の店と比較", exact: true }).click();
  await expect(page.locator(".detail-box").first()).toContainText(
    "専用フォームのみ",
  );
  await page.getByRole("button", { name: "注文手続きへ", exact: true }).click();
  await expect(page.locator(".shop-checkout")).toContainText("銀行振込のみ");
  await expect(page.locator("input")).toHaveCount(0);
  await page
    .getByRole("button", { name: "支払わずにやめる", exact: true })
    .click();
  await expect(page.locator(".result-panel")).toContainText(
    "支払いは行っていません",
  );
  await page
    .getByRole("button", { name: "商品ページに戻る", exact: true })
    .click();
  await page.getByRole("button", { name: "注文手続きへ", exact: true }).click();
  await page
    .getByRole("button", { name: "架空の代金を振り込む", exact: true })
    .click();
  await page
    .getByRole("button", { name: "数日後の状況を見る", exact: true })
    .click();
  await page
    .getByRole("button", { name: "相談に使う記録をまとめる", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("振込日時");
  await page
    .getByRole("button", { name: "支払後の相談先を確認", exact: true })
    .click();
  await expect(page.locator(".result-panel")).toContainText(
    "返金されるとは限りません",
  );
  await expect(
    page.getByRole("button", { name: "支払わずにやめる", exact: true }),
  ).toHaveCount(0);
  await noOverflow(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `test-results/shop-${info.project.name}.png`,
    fullPage: true,
  });
  await finish(page);
  await page.locator(".article-link").click();
  await expect(page).toHaveURL(/#\/knowledge\/shopping-checks$/);
});

test("L07: separate page and tab close, hang up, disconnect after payment and inspect recovery", async ({
  page,
}, info) => {
  await go(page, "/challenges/sudden-warning");
  await page
    .getByRole("button", { name: "警告内の閉じるボタン", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText("閉じませんでした");
  await expect(page.locator(".simulated-warning")).toBeVisible();
  await page.getByRole("button", { name: "表示元を確認", exact: true }).click();
  await expect(page.locator(".detail-box")).toContainText("ウェブページ");
  await noOverflow(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `test-results/support-${info.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "タブを閉じる", exact: true }).click();
  await expect(page.locator(".simulated-warning")).toHaveCount(0);
  await expect(page.locator(".transaction-details")).toContainText(
    "許可していません",
  );
  await reset(page);
  await page
    .getByRole("button", { name: "サポートに電話する（模擬）", exact: true })
    .click();
  await page
    .getByRole("button", { name: "許可せず通話を切る", exact: true })
    .click();
  await expect(page.locator(".transaction-details")).toContainText(
    "終了しました",
  );
  await expect(page.locator(".transaction-details")).toContainText(
    "許可していません",
  );
  await reset(page);
  await page
    .getByRole("button", { name: "サポートに電話する（模擬）", exact: true })
    .click();
  await page
    .getByRole("button", { name: "遠隔操作を許可する（模擬）", exact: true })
    .click();
  await expect(page.locator("input")).toHaveCount(0);
  await page
    .getByRole("button", { name: "架空のギフトコードを渡す", exact: true })
    .click();
  await page
    .getByRole("button", { name: "遠隔接続を切る（模擬）", exact: true })
    .click();
  await expect(page.locator(".transaction-details")).toContainText(
    "許可した後、接続を切りました",
  );
  await expect(page.locator(".transaction-details")).toContainText(
    "架空のコードを渡しました",
  );
  await page
    .getByRole("button", { name: "対処と相談先を確認", exact: true })
    .click();
  await expect(page.locator(".result-panel")).toContainText("管理者に連絡");
  await noOverflow(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `test-results/support-recovery-${info.project.name}.png`,
    fullPage: true,
  });
  await finish(page);
  await page.locator(".article-link").click();
  await expect(page).toHaveURL(/#\/knowledge\/support-scam$/);
});

test("progress survives reload, retry keeps discoveries, reset requires confirmation", async ({
  page,
}, info) => {
  await go(page, "/challenges/suspicious-email");
  await page.locator(".email-row").click();
  await page.getByRole("button", { name: "差出人の詳細" }).click();
  await finish(page);
  await page.getByRole("link", { name: "学習の記録", exact: true }).click();
  await page.reload();
  await expect(page.locator(".progress-item").first()).toContainText(
    "振り返り済み",
  );
  await expect(page.locator(".discovery-list")).toContainText("表示名と差出人");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `test-results/progress-${info.project.name}.png`,
    fullPage: true,
  });
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("internet-literacy-lab:progress:v1")!),
  );
  expect(stored.L01).not.toHaveProperty("history");
  expect(stored.L01).not.toHaveProperty("settings");
  await page.getByRole("button", { name: "すべての進捗を削除" }).click();
  await page.getByRole("button", { name: "キャンセル", exact: true }).click();
  await expect(page.locator(".discovery-list")).toContainText("表示名と差出人");
  await page.getByRole("button", { name: "すべての進捗を削除" }).click();
  await page
    .getByRole("button", { name: "進捗を削除する", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("学習記録を削除しました。");
  await page.reload();
  await expect(page.locator(".progress-item").first()).toContainText("未体験");
});
test("blocked localStorage still allows complete experiences", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("disabled");
      },
    });
  });
  await go(page, "/challenges/suspicious-email");
  await expect(page.locator(".storage-warning")).toBeVisible();
  await page.locator(".email-row").click();
  await page.getByRole("button", { name: "公式アプリを開く" }).click();
  await finish(page);
  await expect(page.locator(".reflection")).toContainText("別の経路");
});
test("filters, empty state, keyboard navigation and direct article URLs", async ({
  page,
}, info) => {
  await go(page, "/challenges");
  await page
    .getByLabel("カテゴリ", { exact: true })
    .selectOption("写真・プライバシー");
  await expect(page.locator(".challenge-card")).toHaveCount(1);
  await page.getByLabel("難易度", { exact: true }).selectOption("じっくり");
  await expect(
    page.getByRole("heading", { name: "この条件に合う体験はありません。" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "絞り込みをクリア" }).click();
  await expect(page.locator(".challenge-card")).toHaveCount(paths.length);
  for (const id of [
    "phishing",
    "personal-information",
    "photo-privacy",
    "communication",
    "checking-information",
    "shopping-checks",
    "support-scam",
  ]) {
    await go(page, `/knowledge/${id}`);
    await expect(page.locator(".article-references a").first()).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
    await noOverflow(page);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `test-results/article-${info.project.name}.png`,
    fullPage: true,
  });
  await go(page, "/challenges/suspicious-email");
  await page.locator(".email-row").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".email-body")).toBeVisible();
  await page.getByRole("button", { name: "差出人の詳細" }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByText("notice@komorebi-support.example", { exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "お届け先を確認する", exact: true }),
  ).toBeFocused();
});
test("article contents support touch and keyboard navigation at narrow widths", async ({
  page,
}) => {
  await go(page, "/knowledge/phishing");
  const compact = (page.viewportSize()?.width ?? 0) <= 900;
  const disclosure = page.locator(".article-mobile-contents");
  if (compact) {
    await expect(disclosure).not.toHaveAttribute("open");
    await disclosure.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(disclosure).toHaveAttribute("open");
  } else {
    await expect(disclosure).toBeHidden();
  }
  const contents = page.getByRole("navigation", { name: "この記事の目次" });
  await expect(contents).toHaveCount(1);
  const target = page.locator("#section-3 h2");
  await contents.getByRole("button", { name: "予防のためにできること" }).focus();
  await page.keyboard.press("Enter");
  await expect(target).toBeFocused();
  await expect(target).toBeInViewport();
  await expect(page).toHaveURL(/#\/knowledge\/phishing$/);

  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await go(page, "/knowledge/checking-information");
    await disclosure.locator("summary").click();
    const lastEntry = contents.getByRole("button").last();
    await expect(lastEntry).toBeVisible();
    await noOverflow(page);
    await lastEntry.click();
    const lastHeading = page.locator("article > section[id] h2").last();
    await expect(lastHeading).toBeFocused();
    await expect(lastHeading).toBeInViewport();
    await page.getByRole("link", { name: "解説一覧へ", exact: true }).click();
    await expect(page).toHaveURL(/#\/knowledge$/);
  }
});
test("all main pages fit at 320px and unknown route has a recovery link", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  for (const path of [
    "/",
    "/challenges",
    "/knowledge",
    "/progress",
    "/about",
    ...paths.map((p) => `/challenges/${p}`),
  ]) {
    await go(page, path);
    await noOverflow(page);
  }
  await go(page, "/not-found");
  await page.getByRole("link", { name: "トップページへ", exact: true }).click();
  await expect(page).toHaveURL(/#\/$/);
});
