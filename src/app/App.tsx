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
import { BudouX } from "../components/BudouX";
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
          Internet Literacy Lab
        </Link>
        <Navigation />
      </div>
    </header>
  );
}
function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <Link className="footer-brand" to="/">
          Internet Literacy Lab
        </Link>
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
        <p>
          <BudouX>お荷物のお届け先について</BudouX>
        </p>
        <p>
          <BudouX>配送を続けるには、住所の確認が必要です。</BudouX>
        </p>
      </blockquote>
      <div className="hero-url">
        <span>お届け先を確認する</span>
        <code>https://komorebi-verify.example</code>
      </div>
      <p className="hero-question">
        <BudouX>このリンク、</BudouX>
        <br />
        <BudouX>本当に公式？</BudouX>
      </p>
      <p className="scene-bottom">
        <BudouX>体験「そのメール、本当に大丈夫？」から</BudouX>
      </p>
    </figure>
  );
}
function HomePage() {
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <h1>
            <BudouX>失敗できる、</BudouX>
            <br />
            <BudouX>架空のインターネット。</BudouX>
          </h1>
          <p className="hero-description">
            <BudouX>
              メールのリンク、SNSの公開範囲。操作の結果を確かめながら練習できます。
            </BudouX>
          </p>
          <div className="hero-actions">
            <Link className="button primary large" to="/challenges">
              体験をはじめる
            </Link>
            <Link className="text-button" to="/knowledge">
              解説を読む
            </Link>
          </div>
          <p className="hero-benefits">
            <BudouX>アカウント登録不要</BudouX>
          </p>
        </div>
        <HeroScene />
      </section>
      <div className="principles-strip">
        <div className="container">
          <span>
            <BudouX>本物の個人情報は、使いません。</BudouX>
          </span>
          <span>
            <BudouX>投稿や送信は、この画面の中だけ。</BudouX>
          </span>
          <span>
            <BudouX>結果を見てから、何度でもやり直せます。</BudouX>
          </span>
        </div>
      </div>
      <section className="container challenge-section">
        <div className="section-heading">
          <div>
            <h2>
              <BudouX>体験を選ぶ</BudouX>
            </h2>
            <p>
              <BudouX>1つ約5〜7分。どの体験からでも始められます。</BudouX>
            </p>
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
      <section className="container knowledge-banner">
        <div>
          <h2>
            <BudouX>体験のしくみを読む</BudouX>
          </h2>
          <p>
            <BudouX>
              フィッシングやSNSの公開範囲などを、テーマごとに解説しています。
            </BudouX>
          </p>
        </div>
        <Link className="button secondary" to="/knowledge">
          解説を読む
        </Link>
      </section>
    </>
  );
}
function PageHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="page-heading">
      <h1>
        <BudouX>{title}</BudouX>
      </h1>
      {description && (
        <p>
          <BudouX>{description}</BudouX>
        </p>
      )}
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
      <PageHeading title="体験する" />
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
          <h2>
            <BudouX>この条件に合う体験はありません。</BudouX>
          </h2>
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
    </div>
  );
}
function KnowledgeListPage() {
  return (
    <div className="container page-content">
      <PageHeading title="知る" />
      <div className="knowledge-list">
        {articles.map((a, i) => (
          <Link
            key={a.id}
            className="knowledge-list-item"
            to={`/knowledge/${a.id}`}
          >
            <span className="knowledge-number">0{i + 1}</span>
            <div>
              <h2>
                <BudouX>{a.title}</BudouX>
              </h2>
              <span className="card-category">{a.category}</span>
              <p>
                <BudouX>{a.intro}</BudouX>
              </p>
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
  const contents = (
    <nav aria-label="この記事の目次" className="article-contents">
      <ol>
        {article.sections.map((section, i) => (
          <li key={section.title}>
            <button
              className="text-button"
              onClick={() => {
                const target = document.getElementById(`section-${i}`);
                target?.querySelector("h2")?.focus({ preventScroll: true });
                target?.scrollIntoView({ block: "start" });
              }}
            >
              <BudouX>{section.title}</BudouX>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
  return (
    <div className="container article-page">
      <Link to="/knowledge" className="back-link">
        解説一覧へ
      </Link>
      <div className="article-layout">
        <article>
          <h1>
            <BudouX>{article.title}</BudouX>
          </h1>
          <div className="article-meta">
            <span>約{article.readMinutes}分</span>
            <span>最終更新：{article.updatedAt}</span>
          </div>
          <p className="article-intro">
            <BudouX>{article.intro}</BudouX>
          </p>
          <details className="article-mobile-contents" key={article.id}>
            <summary>この記事の内容</summary>
            {contents}
          </details>
          {article.sections.map((section, i) => (
            <section key={section.title} id={`section-${i}`}>
              <h2 tabIndex={-1}>
                <BudouX>{section.title}</BudouX>
              </h2>
              {section.paragraphs.map((p) => (
                <p key={p}>
                  <BudouX>{p}</BudouX>
                </p>
              ))}
            </section>
          ))}
          <section className="article-references">
            <h2>
              <BudouX>参考資料</BudouX>
            </h2>
            {article.references.map((r) => (
              <a
                key={r.url}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <BudouX>{r.title}</BudouX>
                <Icon name="external" size={15} />
                <span className="sr-only">（外部サイト・新しいタブ）</span>
              </a>
            ))}
          </section>
        </article>
        <aside className="article-sidebar">
          <div className="article-desktop-contents">
            <h2>
              <BudouX>この記事の内容</BudouX>
            </h2>
            {contents}
          </div>
          <div>
            <h2>
              <BudouX>関連する体験</BudouX>
            </h2>
            {scenarios
              .filter((s) => article.challengeIds.includes(s.id))
              .map((s) => (
                <Link
                  className="related-challenge"
                  to={`/challenges/${s.slug}`}
                  key={s.id}
                >
                  <ChallengeVisual app={s.app} />
                  <strong>
                    <BudouX>{s.title}</BudouX>
                  </strong>
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
      <PageHeading title="学習の記録" />
      {!available && (
        <p className="storage-warning">
          <BudouX>
            端末への保存が使えないため、このページを開いている間だけの記録です。
          </BudouX>
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
                  <h2>
                    <BudouX>{s.title}</BudouX>
                  </h2>
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
                          <BudouX>{d.title}</BudouX>
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
          <h2>
            <BudouX>このブラウザの学習記録</BudouX>
          </h2>
          <p>
            <BudouX>
              保存するのは体験状況・発見したポイント・日時だけです。
            </BudouX>
            <br />
            <BudouX>ブラウザのデータを消すと、この記録も消えます。</BudouX>
          </p>
        </div>
        <button className="text-button" onClick={() => setConfirm(true)}>
          すべての進捗を削除
        </button>
      </div>
      {confirm && (
        <div className="reset-confirm" role="alert">
          <p>
            <BudouX>
              この端末の学習記録をすべて削除します。この操作は元に戻せません。
            </BudouX>
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
      {notice && (
        <p role="status">
          <BudouX>{notice}</BudouX>
        </p>
      )}
    </div>
  );
}
function AboutPage() {
  return (
    <div className="container about-page">
      <PageHeading
        title="このサイトについて"
        description="Internet Literacy Lab は、架空のメールやSNSを操作し、その結果を確かめられる学習サイトです。"
      />
      <div className="about-copy">
        <section>
          <h2>
            <BudouX>模擬環境</BudouX>
          </h2>
          <p>
            <BudouX>
              人物、学校、会社、サービス、メールアドレスはすべて架空です。模擬URLには教材用の
              .example
              ドメインを使用しています。ボタンを押しても、実際のSNSへの投稿やメール送信は起こりません。
            </BudouX>
          </p>
          <p>
            <BudouX>
              本当のパスワードや住所を入力する欄、画像をアップロードする機能はありません。教材に用意された情報で操作してください。
            </BudouX>
          </p>
        </section>
        <section>
          <h2>
            <BudouX>学習記録とプライバシー</BudouX>
          </h2>
          <p>
            <BudouX>
              アカウント登録は不要です。体験状況、発見したポイント、最終体験日時を端末のブラウザに保存します。投稿の文章や操作履歴は保存しません。
            </BudouX>
          </p>
          <p>
            <BudouX>
              広告・アクセス解析・外部フォントは使っていません。解説の参考資料リンクを自分で選んだ場合は、外部サイトに移動します。
            </BudouX>
          </p>
          <p>
            <BudouX>
              保存機能が使えないブラウザでも体験できます。進捗は「学習の記録」から削除できます。
            </BudouX>
          </p>
        </section>
        <section>
          <h2>
            <BudouX>教材と現実の違い</BudouX>
          </h2>
          <p>
            <BudouX>
              教材の結果は起こり得る一例です。必ずその結果になるという予測ではなく、法律上の違法性を判定するものでもありません。実際のトラブルは、背景や状況によって必要な対応が変わります。
            </BudouX>
          </p>
          <p>
            <BudouX>
              困ったときは一人で抱えず、信頼できる人やサービスの相談窓口を頼ってください。各解説記事には公的機関などの参考資料を載せています。
            </BudouX>
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
      <h1>
        <BudouX>このページは見つかりませんでした。</BudouX>
      </h1>
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
