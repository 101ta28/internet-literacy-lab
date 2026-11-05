import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  HashRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import { ChallengeCard, ChallengeVisual } from "../components/ChallengeCard";
import { Icon } from "../components/Icon";
import { ChallengeWorkspace } from "../features/challenges/components/ChallengeWorkspace";
import { scenarios } from "../features/challenges/scenarios";
import { articles } from "../features/knowledge/articles";
import {
  ProgressProvider,
  useProgress,
} from "../features/progress/ProgressProvider";
function Navigation() {
  return (
    <nav aria-label="メインナビゲーション">
      <NavLink to="/challenges">体験する</NavLink>
      <NavLink to="/knowledge">知る</NavLink>
      <NavLink to="/progress">学習の記録</NavLink>
      <NavLink to="/about">このサイトについて</NavLink>
    </nav>
  );
}
function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link
          className="brand"
          to="/"
          aria-label="Internet Literacy Lab トップ"
        >
          <span className="brand-symbol" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>
            Internet Literacy
            <span>
              Lab<span className="brand-dot">.</span>
            </span>
          </span>
        </Link>
        <Navigation />
        <span className="header-note">登録なしで、すぐに体験</span>
      </div>
    </header>
  );
}
function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <Link className="footer-brand" to="/">
          Internet Literacy Lab<span>.</span>
        </Link>
        <p>ここでの失敗を、明日の判断力に。</p>
        <span className="footer-meta">
          架空のサービスを使った、体験型ラボ。
        </span>
        <Link to="/about">このサイトについて</Link>
      </div>
    </footer>
  );
}
function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const main = useRef<HTMLElement>(null);
  const initial = useRef(true);
  useEffect(() => {
    window.scrollTo({ top: 0 });
    if (initial.current) initial.current = false;
    else main.current?.focus();
    const challenge = scenarios.find(
      (s) => location.pathname === `/challenges/${s.slug}`,
    );
    const article = articles.find(
      (a) => location.pathname === `/knowledge/${a.id}`,
    );
    const page = {
      "/": "失敗できる、架空のインターネット。",
      "/challenges": "体験する",
      "/knowledge": "知る",
      "/progress": "学習の記録",
      "/about": "このサイトについて",
    }[location.pathname];
    document.title = `${challenge?.title ?? article?.title ?? page ?? "ページが見つかりません"} | Internet Literacy Lab`;
  }, [location.pathname]);
  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
        }}
      >
        本文へスキップ
      </a>
      <Header />
      <main id="main-content" ref={main} tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </>
  );
}
function HeroScene() {
  return (
    <figure className="hero-scene">
      <figcaption>こもれび配送からのメール / 今日 10:24</figcaption>
      <blockquote>
        <p>お荷物のお届け先について</p>
        <p>配送を続けるには、住所の確認が必要です。</p>
      </blockquote>
      <div className="hero-url">
        <span>お届け先を確認する</span>
        <code>https://komorebi-verify.example</code>
      </div>
      <p className="hero-question">
        このリンク、
        <br />
        本当に公式？
      </p>
      <p className="scene-bottom">すべて架空。だから、試せる。</p>
    </figure>
  );
}
function HomePage() {
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <h1>
            失敗できる、
            <br />
            架空のインターネット。
          </h1>
          <p className="hero-description">
            安全な模擬環境で、ネットの判断力を育てよう。
          </p>
          <div className="hero-actions">
            <Link className="button primary large" to="/challenges">
              体験をはじめる
            </Link>
            <Link className="text-button" to="/knowledge">
              まずは、知る
            </Link>
          </div>
          <div className="hero-benefits">
            <span>
              <Icon name="check" size={14} /> アカウント登録不要
            </span>
            <span>
              <Icon name="check" size={14} /> 何度でもやり直せる
            </span>
          </div>
        </div>
        <HeroScene />
      </section>
      <div className="principles-strip">
        <div className="container">
          <span>
            <Icon name="shield" />
            本物の個人情報は、使いません。
          </span>
          <span>
            <Icon name="globe" />
            投稿や送信は、この画面の中だけ。
          </span>
          <span>
            <Icon name="refresh" />
            正解を急がず、いろいろ試そう。
          </span>
        </div>
      </div>
      <section className="container challenge-section">
        <div className="section-heading">
          <div>
            <h2>
              気になる場面から、
              <br />
              試してみよう。
            </h2>
            <p>順番も、予習もいりません。ひとつ約5〜7分の小さな体験。</p>
          </div>
          <Link className="text-button" to="/challenges">
            すべての体験を見る
          </Link>
        </div>
        <div className="challenge-grid">
          {scenarios.map((s) => (
            <ChallengeCard key={s.id} scenario={s} />
          ))}
        </div>
      </section>
      <section className="container approach">
        <div>
          <h2>
            「やってみた」が、
            <br />
            自分の判断に変わる。
          </h2>
        </div>
        <ol className="approach-steps">
          {[
            [
              "01",
              "触ってみる",
              "メールやSNSに似た画面を、いつもどおりに操作。",
            ],
            ["02", "気づいてみる", "見えなかった情報や、相手の視点に気づく。"],
            [
              "03",
              "もう一度、選んでみる",
              "立ち止まってやり直す。その過程も、大切な発見。",
            ],
          ].map(([n, title, description]) => (
            <li key={n}>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="container knowledge-banner">
        <div className="knowledge-banner-icon">
          <Icon name="book" size={55} />
        </div>
        <div>
          <h2>「なぜ？」を、そのままにしない。</h2>
          <p>体験で気になったことを、やさしい解説でもう少し深く。</p>
        </div>
        <Link className="button secondary" to="/knowledge">
          解説を読む
        </Link>
      </section>
    </>
  );
}
function PageHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="page-heading">
      <h1>{eyebrow.split(" / ").at(-1)}</h1>
      <p className="page-lead">{title}</p>
      <p>{children}</p>
    </div>
  );
}
function ChallengeListPage() {
  const { progress } = useProgress();
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [status, setStatus] = useState("all");
  const filtered = scenarios.filter(
    (s) =>
      (category === "all" || s.category === category) &&
      (difficulty === "all" || s.difficulty === difficulty) &&
      (status === "all" ||
        !!progress[s.id]?.experienced === (status === "experienced")),
  );
  return (
    <div className="container page-content">
      <PageHeading
        eyebrow="CHALLENGES / 体験する"
        title="いつものネットを、違う視点から。"
      >
        好きな場面から、自由に。失敗しても、何度でもやり直せます。
      </PageHeading>
      <div className="filters">
        <label>
          カテゴリ
          <select
            aria-label="カテゴリ"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">すべてのカテゴリ</option>
            {scenarios.map((s) => (
              <option key={s.id}>{s.category}</option>
            ))}
          </select>
        </label>
        <label>
          難易度
          <select
            aria-label="難易度"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="all">すべての難易度</option>
            <option>はじめて</option>
            <option>じっくり</option>
          </select>
        </label>
        <label>
          挑戦状況
          <select
            aria-label="挑戦状況"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">すべての体験</option>
            <option value="new">未体験</option>
            <option value="experienced">体験済み</option>
          </select>
        </label>
        <span className="filter-count" role="status">
          {filtered.length} 件の体験
        </span>
      </div>
      {filtered.length ? (
        <div className="challenge-grid">
          {filtered.map((s) => (
            <ChallengeCard key={s.id} scenario={s} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>この条件に合う体験はありません。</h2>
          <p>絞り込みを変えて探してみましょう。</p>
          <button
            className="button secondary"
            onClick={() => {
              setCategory("all");
              setDifficulty("all");
              setStatus("all");
            }}
          >
            絞り込みをクリア
          </button>
        </div>
      )}
      <div className="list-note">
        <Icon name="shield" />
        <p>
          ここに出てくる人・サービス・出来事は、すべて架空です。
          <br />
          実際の個人情報を使わずに体験できます。
        </p>
      </div>
    </div>
  );
}
function KnowledgeListPage() {
  return (
    <div className="container page-content">
      <PageHeading eyebrow="KNOWLEDGE / 知る" title="気づきに、理由を添えて。">
        体験の前でも、あとでも。気になったテーマから読んでみよう。
      </PageHeading>
      <div className="knowledge-list">
        {articles.map((a, i) => (
          <Link
            key={a.id}
            className="knowledge-list-item"
            to={`/knowledge/${a.id}`}
          >
            <span className="knowledge-number">0{i + 1}</span>
            <div>
              <h2>{a.title}</h2>
              <span className="card-category">{a.category}</span>
              <p>{a.intro}</p>
              <small>約{a.readMinutes}分で読めます</small>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
export function KnowledgeArticle() {
  const { slug } = useParams();
  const article = articles.find((a) => a.id === slug);
  if (!article) return <NotFound />;
  return (
    <div className="container article-page">
      <Link to="/knowledge" className="back-link">
        解説一覧へ
      </Link>
      <div className="article-layout">
        <article>
          <h1>{article.title}</h1>
          <div className="article-meta">
            <span>約{article.readMinutes}分</span>
            <span>最終更新：{article.updatedAt}</span>
          </div>
          <p className="article-intro">{article.intro}</p>
          {article.sections.map((section, i) => (
            <section key={section.title} id={`section-${i}`}>
              <h2>{section.title}</h2>
              {section.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </section>
          ))}
          <section className="article-references">
            <h2>参考資料</h2>
            <p className="quiet">
              以下は外部サイトです。リンクを選ぶと新しいタブで開きます。
            </p>
            {article.references.map((r) => (
              <a
                key={r.url}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {r.title}
                <Icon name="external" size={15} />
                <span className="sr-only">（外部サイト・新しいタブ）</span>
              </a>
            ))}
          </section>
        </article>
        <aside className="article-sidebar">
          <div>
            <h2>この記事の内容</h2>
            <ol>
              {article.sections.map((section, i) => (
                <li key={section.title}>
                  <button
                    className="text-button"
                    onClick={() =>
                      document
                        .getElementById(`section-${i}`)
                        ?.scrollIntoView({ block: "start" })
                    }
                  >
                    {section.title}
                  </button>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2>体験で確かめよう。</h2>
            {scenarios
              .filter((s) => article.challengeIds.includes(s.id))
              .map((s) => (
                <Link
                  className="related-challenge"
                  to={`/challenges/${s.slug}`}
                  key={s.id}
                >
                  <ChallengeVisual app={s.app} />
                  <strong>{s.title}</strong>
                  <span className="text-button">体験する</span>
                </Link>
              ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
export function ProgressIndicator({
  value,
  max,
}: {
  value: number;
  max: number;
}) {
  return (
    <progress
      value={value}
      max={max}
      aria-label={`${max}個のうち${value}個を発見`}
    />
  );
}
function ProgressPage() {
  const { progress, available, reset } = useProgress();
  const [confirm, setConfirm] = useState(false);
  const [notice, setNotice] = useState("");
  const experienced = scenarios.filter(
    (s) => progress[s.id]?.experienced,
  ).length;
  const reflected = scenarios.filter((s) => progress[s.id]?.reflected).length;
  const discoveries = scenarios.reduce(
    (n, s) => n + (progress[s.id]?.discoveries.length ?? 0),
    0,
  );
  return (
    <div className="container page-content">
      <PageHeading
        eyebrow="YOUR PROGRESS / 学習の記録"
        title="あなたが見つけた、小さな気づき。"
      >
        速さや点数は競いません。試したこと、発見したことを振り返ろう。
      </PageHeading>
      {!available && (
        <p className="storage-warning">
          端末への保存が使えないため、このページを開いている間だけの記録です。
        </p>
      )}
      <div className="progress-stats">
        <div>
          <span>体験した課題</span>
          <strong>
            {experienced}
            <small> / {scenarios.length}</small>
          </strong>
        </div>
        <div>
          <span>振り返った課題</span>
          <strong>
            {reflected}
            <small> / {scenarios.length}</small>
          </strong>
        </div>
        <div>
          <span>発見したポイント</span>
          <strong>
            {discoveries}
            <small> 個</small>
          </strong>
        </div>
      </div>
      <div className="progress-list">
        {scenarios.map((s) => {
          const entry = progress[s.id];
          return (
            <section className="progress-item" key={s.id}>
              <div className="row spread wrap">
                <div>
                  <h2>{s.title}</h2>
                  <span className="progress-status">
                    {s.id} /{" "}
                    {entry?.reflected
                      ? "振り返り済み"
                      : entry?.experienced
                        ? "体験中"
                        : "未体験"}
                  </span>
                </div>
                <Link className="button secondary" to={`/challenges/${s.slug}`}>
                  {entry?.experienced ? "もう一度試す" : "体験する"}
                </Link>
              </div>
              <div className="progress-bar-row">
                <ProgressIndicator
                  value={entry?.discoveries.length ?? 0}
                  max={s.discoveries.length}
                />
                <small>
                  {entry?.discoveries.length ?? 0} / {s.discoveries.length}{" "}
                  個を発見
                </small>
              </div>
              {entry && (
                <>
                  <ul className="discovery-list">
                    {s.discoveries
                      .filter((d) => entry.discoveries.includes(d.id))
                      .map((d) => (
                        <li key={d.id}>
                          <Icon name="check" size={15} />
                          {d.title}
                        </li>
                      ))}
                  </ul>
                  <small className="quiet">
                    最終体験：
                    {new Intl.DateTimeFormat("ja-JP", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(entry.lastExperiencedAt))}
                  </small>
                </>
              )}
            </section>
          );
        })}
      </div>
      <div className="progress-reset">
        <div>
          <h2>この端末だけの、あなたの記録。</h2>
          <p>
            保存するのは体験状況・発見したポイント・日時だけです。
            <br />
            ブラウザのデータを消すと、この記録も消えます。
          </p>
        </div>
        <button className="text-button" onClick={() => setConfirm(true)}>
          すべての進捗を削除
        </button>
      </div>
      {confirm && (
        <div className="reset-confirm" role="alert">
          <p>
            この端末の学習記録をすべて削除します。この操作は元に戻せません。
          </p>
          <div className="row">
            <button
              autoFocus
              className="button danger"
              onClick={() => {
                const saved = reset();
                setConfirm(false);
                setNotice(
                  saved
                    ? "学習記録を削除しました。"
                    : "現在の記録をリセットしました。端末の保存領域にアクセスできず、保存済みの記録の削除は確認できません。ブラウザのサイトデータ設定から削除してください。",
                );
              }}
            >
              進捗を削除する
            </button>
            <button
              className="button secondary"
              onClick={() => setConfirm(false)}
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
      {notice && <p role="status">{notice}</p>}
    </div>
  );
}
function AboutPage() {
  return (
    <div className="container about-page">
      <PageHeading
        eyebrow="ABOUT THIS LAB / このサイトについて"
        title="ここでの失敗を、明日の判断力に。"
      >
        Internet Literacy Lab
        は、架空のインターネットを操作しながら、日々の判断を考えるための場所です。
      </PageHeading>
      <div className="about-copy">
        <section>
          <h2>禁止事項を覚える、その先へ。</h2>
          <p>
            メールを開く。写真を載せる。コメントを書く。インターネットでは、毎日たくさんの小さな判断をしています。
          </p>
          <p>
            このラボでは、操作の結果やほかの人の視点を確かめながら、別の選択を試せます。「失敗したら終わり」ではなく、途中で気づいて対応を変えることも大切にしています。
          </p>
        </section>
        <section>
          <h2>安全な、架空の世界です。</h2>
          <p>
            人物、学校、会社、サービス、メールアドレスはすべて架空です。模擬URLには教材用の
            .example
            ドメインを使用しています。ボタンを押しても、実際のSNSへの投稿やメール送信は起こりません。
          </p>
          <p>
            本当のパスワードや住所を入力する欄、画像をアップロードする機能はありません。教材に用意された情報で操作してください。
          </p>
        </section>
        <section>
          <h2>記録は、このブラウザの中だけ。</h2>
          <p>
            アカウント登録は不要です。体験状況、発見したポイント、最終体験日時を端末のブラウザに保存します。投稿の文章や操作履歴は保存しません。
          </p>
          <p>
            広告・アクセス解析・外部フォントは使っていません。解説の参考資料リンクを自分で選んだ場合は、外部サイトに移動します。
          </p>
          <p>
            保存機能が使えないブラウザでも体験できます。進捗は「学習の記録」から削除できます。
          </p>
        </section>
        <section>
          <h2>現実は、一つの答えではありません。</h2>
          <p>
            教材の結果は起こり得る一例です。必ずその結果になるという予測ではなく、法律上の違法性を判定するものでもありません。実際のトラブルは、背景や状況によって必要な対応が変わります。
          </p>
          <p>
            困ったときは一人で抱えず、信頼できる人やサービスの相談窓口を頼ってください。各解説記事には公的機関などの参考資料を載せています。
          </p>
        </section>
        <Link className="button primary" to="/challenges">
          体験を選ぶ
        </Link>
      </div>
    </div>
  );
}
function NotFound() {
  return (
    <div className="container empty-state">
      <h1>このページは見つかりませんでした。</h1>
      <p>URLを確認するか、トップページから体験を選んでください。</p>
      <Link className="button primary" to="/">
        トップページへ
      </Link>
    </div>
  );
}
export default function App() {
  return (
    <HashRouter>
      <ProgressProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/challenges" element={<ChallengeListPage />} />
            <Route path="/challenges/:slug" element={<ChallengeWorkspace />} />
            <Route path="/knowledge" element={<KnowledgeListPage />} />
            <Route path="/knowledge/:slug" element={<KnowledgeArticle />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </ProgressProvider>
    </HashRouter>
  );
}
