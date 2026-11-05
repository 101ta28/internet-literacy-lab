import type { MockProps } from "./MockApps";
import { MockBrowser, MockSocialFeed } from "./MockApps";
import { Icon } from "../../../components/Icon";

function EventNotice({ full = false }: { full?: boolean }) {
  return (
    <div
      className="event-notice"
      aria-label={
        full
          ? "2025年のイベント中止案内の全体"
          : "日付が見切れたイベント案内の画像"
      }
    >
      <span>星波公園フェス</span>
      <strong>開催中止のお知らせ</strong>
      <p>悪天候のため、明日の開催を中止します。</p>
      {full ? (
        <small>2025年9月12日 / 星波公園フェス実行委員会</small>
      ) : (
        <span className="notice-cut" aria-hidden="true" />
      )}
    </div>
  );
}

export function MockNewsFeed({ state, dispatch }: MockProps) {
  const act = (id: string) => dispatch({ type: "action", id });
  const s = state.settings;
  return (
    <MockBrowser name="ひとこと / シェア" address="hitokoto.example/feed">
      <MockSocialFeed>
        <div className="social-content everyday-app">
          <p className="quiet">教材内の日時：2026年9月12日 16:30</p>
          <div className="profile-line">
            <span className="avatar blue">S</span>
            <div>
              <strong>そら</strong>
              <small>@sora_walk · 10分前</small>
            </div>
          </div>
          <p>
            明日の星波公園フェス、今年も中止らしい！行く予定の人に知らせてあげて。
          </p>
          <EventNotice />
          <small className="quiet">
            まちの話題メモの投稿をシェア / 128回シェア
          </small>
          <div
            className="investigation-actions"
            role="group"
            aria-label="届いた情報を調べる"
          >
            <button
              className="small-button"
              aria-expanded={!!s.source}
              onClick={() => act("source")}
            >
              元の投稿を開く
            </button>
            <button
              className="small-button"
              aria-expanded={!!s.image}
              onClick={() => act("image")}
            >
              画像全体を確認
            </button>
            <button
              className="small-button"
              aria-expanded={!!s.official}
              onClick={() => act("official")}
            >
              主催者の発表を確認
            </button>
          </div>
          {s.source && (
            <section className="detail-box">
              <h3>まちの話題メモ</h3>
              <small>@machi_memo · 2026年9月12日 15:50</small>
              <p>
                「中止のお知らせ」という画像を見かけました。今年も中止なのでしょうか？
              </p>
              <p className="quiet">
                プロフィール：地域の話題を集めています。イベントの主催者ではありません。
              </p>
            </section>
          )}
          {s.image && (
            <section className="evidence-panel">
              <h3>添付画像の全体</h3>
              <EventNotice full />
            </section>
          )}
          {s.official && (
            <section className="detail-box">
              <h3>星波公園フェス実行委員会</h3>
              <code>hoshinami-fes.example/news</code>
              <p>
                <strong>2026年9月12日 16:00 更新</strong>
              </p>
              <p>
                9月13日のフェスは開催予定です。変更がある場合は、このページでお知らせします。
              </p>
            </section>
          )}
          {state.screen === "feed" && (
            <div className="decision-actions">
              <button className="button primary" onClick={() => act("share")}>
                そのままシェア
              </button>
              <button className="button secondary" onClick={() => act("hold")}>
                今はシェアしない
              </button>
              {s.official && (
                <button className="text-button" onClick={() => act("verified")}>
                  確認した情報で投稿
                </button>
              )}
            </div>
          )}
          {state.screen === "shared" && (
            <section className="info-box" aria-label="自分の投稿">
              <h3>
                {s.publication === "corrected"
                  ? "訂正を追記した投稿"
                  : "自分の投稿"}
              </h3>
              {s.publication === "rumor" ? (
                <p>
                  明日の星波公園フェスは中止らしいです。行く予定の人に知らせてください！
                </p>
              ) : (
                <p>
                  {s.publication === "corrected" &&
                    "先ほどの中止案内は昨年のものでした。"}
                  主催者の発表では、明日のフェスは開催予定です。9月12日16:30に確認しました。最新情報：hoshinami-fes.example/news
                </p>
              )}
              <div className="decision-actions">
                {s.publication === "rumor" &&
                  (s.official ? (
                    <button
                      className="button secondary"
                      onClick={() => act("correct")}
                    >
                      確認した情報で訂正する
                    </button>
                  ) : (
                    <p className="quiet">
                      主催者の発表を確認すると、訂正する内容も選べます。
                    </p>
                  ))}
                <button className="text-button" onClick={() => act("remove")}>
                  自分のシェアを削除
                </button>
              </div>
            </section>
          )}
          {(state.screen === "held" || state.screen === "deleted") && (
            <div className="info-box">
              <p>
                {state.screen === "held"
                  ? "シェアを保留しています。"
                  : "自分のシェアを削除しました。"}
              </p>
              <button className="button secondary" onClick={() => act("back")}>
                伝える内容を考え直す
              </button>
            </div>
          )}
        </div>
      </MockSocialFeed>
    </MockBrowser>
  );
}

function Headphones() {
  return (
    <svg
      className="headphone-product"
      viewBox="0 0 240 180"
      role="img"
      aria-label="教材用のワイヤレスヘッドホンの商品イラスト"
    >
      <path
        d="M52 108V83a68 68 0 0 1 136 0v25"
        fill="none"
        stroke="#405b50"
        strokeWidth="18"
      />
      <path
        d="M52 85a68 68 0 0 1 136 0"
        fill="none"
        stroke="#8ba395"
        strokeWidth="8"
      />
      <rect x="35" y="86" width="43" height="65" rx="17" fill="#405b50" />
      <rect x="162" y="86" width="43" height="65" rx="17" fill="#405b50" />
      <rect x="61" y="91" width="20" height="55" rx="8" fill="#d9e1d5" />
      <rect x="159" y="91" width="20" height="55" rx="8" fill="#d9e1d5" />
    </svg>
  );
}

export function MockShop({ state, dispatch }: MockProps) {
  const act = (id: string) => dispatch({ type: "action", id });
  const s = state.settings;
  const afterPayment = state.screen === "paid" || state.screen === "trouble";
  return (
    <MockBrowser name="ソラミチストア" address="soramichi-sale.example">
      <div className="mock-appbar">
        <strong>ソラミチストア</strong>
        <small>ONLINE STORE</small>
      </div>
      <div className="social-content everyday-app">
        {state.screen === "product" && (
          <>
            <div className="shop-promotion">本日限定セール / 残り2台</div>
            <div className="shop-product">
              <Headphones />
              <div>
                <small>MORI SOUND / MS-20</small>
                <h2>ワイヤレスヘッドホン</h2>
                <p className="shop-price">
                  <del>12,800円</del>
                  <strong>1,980円</strong>
                  <span>税込・送料無料</span>
                </p>
                <p>カード決済・銀行振込に対応</p>
              </div>
            </div>
            <div className="decision-actions">
              <button
                className="button primary"
                onClick={() => act("checkout")}
              >
                注文手続きへ
              </button>
              <button className="text-button" onClick={() => act("cancel")}>
                購入を見送る
              </button>
            </div>
          </>
        )}
        {state.screen === "checkout" && (
          <section className="shop-checkout">
            <h2>ご注文内容の確認</h2>
            <p>MS-20 ワイヤレスヘッドホン / 1点</p>
            <dl className="transaction-details">
              <div>
                <dt>お支払い総額</dt>
                <dd>1,980円</dd>
              </div>
              <div>
                <dt>お支払い方法</dt>
                <dd>銀行振込のみ</dd>
              </div>
              <div>
                <dt>振込先名義</dt>
                <dd>個人名義（教材用）</dd>
              </div>
              <div>
                <dt>発送</dt>
                <dd>入金確認後、翌営業日</dd>
              </div>
            </dl>
            <p>
              カード決済は現在ご利用いただけません。商品確保のため、本日中にお振り込みください。
            </p>
            <p className="quiet">
              住所や口座情報の入力は不要です。支払いはこの画面内だけの模擬操作です。
            </p>
            <div className="decision-actions">
              <button className="button primary" onClick={() => act("pay")}>
                架空の代金を振り込む
              </button>
              <button
                className="button secondary"
                onClick={() => act("cancel")}
              >
                支払わずにやめる
              </button>
              <button className="text-button" onClick={() => act("back")}>
                商品ページに戻る
              </button>
            </div>
          </section>
        )}
        {afterPayment && (
          <section className="info-box">
            <h2>
              {state.screen === "paid"
                ? "振込を受け付けました（模擬）"
                : "発送予定日を過ぎた注文"}
            </h2>
            <p>注文番号：LAB-SHOP-01 / 1,980円</p>
            {state.screen === "paid" ? (
              <>
                <p>教材内で支払った状態です。</p>
                <button
                  className="button secondary"
                  onClick={() => act("wait")}
                >
                  数日後の状況を見る
                </button>
              </>
            ) : (
              <p>
                発送通知は届いていません。問い合わせフォームにも返信がありません。
              </p>
            )}
            <div className="decision-actions">
              <button className="small-button" onClick={() => act("record")}>
                相談に使う記録をまとめる
              </button>
              <button className="small-button" onClick={() => act("help")}>
                支払後の相談先を確認
              </button>
            </div>
            {s.recorded && (
              <div className="evidence-panel" role="status">
                <strong>教材内の記録メモ</strong>
                <ul>
                  <li>ショップURLと商品・注文画面</li>
                  <li>振込日時・金額・振込先の控え</li>
                  <li>問い合わせた内容と日時</li>
                </ul>
                <small>実際のファイル保存や相談の送信は行いません。</small>
              </div>
            )}
          </section>
        )}
        {state.screen === "cancelled" && (
          <div className="info-box">
            <h2>購入を見送りました</h2>
            <p>このショップへの支払いはありません。</p>
            <button className="button secondary" onClick={() => act("back")}>
              商品ページに戻る
            </button>
          </div>
        )}
        <div
          className="investigation-actions"
          role="group"
          aria-label="ショップを調べる"
        >
          <button
            className="small-button"
            aria-expanded={!!s.seller}
            onClick={() => act("seller")}
          >
            販売者・連絡先
          </button>
          <button
            className="small-button"
            aria-expanded={!!s.compare}
            onClick={() => act("compare")}
          >
            別の店と比較
          </button>
        </div>
        {s.seller && (
          <section className="detail-box">
            <h3>販売者情報</h3>
            <dl className="transaction-details">
              <div>
                <dt>販売会社</dt>
                <dd>朝凪雑貨（架空）</dd>
              </div>
              <div>
                <dt>電話番号</dt>
                <dd>記載なし</dd>
              </div>
              <div>
                <dt>お問い合わせ</dt>
                <dd>専用フォームのみ</dd>
              </div>
              <div>
                <dt>返品先</dt>
                <dd>記載なし</dd>
              </div>
            </dl>
          </section>
        )}
        {s.compare && (
          <section className="detail-box">
            <h3>別の販売店で同じ型番を確認</h3>
            <code>mori-sound.example/products/ms20</code>
            <p>MS-20 / 12,800円（税込）</p>
            <p>問い合わせ窓口・返品条件の案内あり。</p>
            <p className="quiet">
              表示が揃っているだけで安全と決まるわけではありません。価格や条件を比べる材料です。
            </p>
          </section>
        )}
      </div>
    </MockBrowser>
  );
}

export function MockSupportWarning({ state, dispatch }: MockProps) {
  const act = (id: string) => dispatch({ type: "action", id });
  const s = state.settings;
  return (
    <MockBrowser
      name="調べもの / ブラウザ"
      address={
        state.screen === "closed" ? "新しいタブ" : "device-help.example/alert"
      }
    >
      <div className="mock-tabbar">
        <span>
          {state.screen === "closed"
            ? "新しいタブ"
            : "セキュリティに関するお知らせ"}
        </span>
        {state.screen === "warning" && (
          <button className="small-button" onClick={() => act("close")}>
            <Icon name="close" size={14} /> タブを閉じる
          </button>
        )}
      </div>
      <div className="social-content everyday-app">
        {state.screen === "warning" && (
          <>
            <section
              className="simulated-warning"
              aria-label="教材内の警告画面"
            >
              <div className="row spread wrap">
                <strong>端末保護センター</strong>
                <button
                  className="small-button"
                  onClick={() => act("insideClose")}
                  aria-label="警告内の閉じるボタン"
                >
                  <Icon name="close" size={15} /> 閉じる
                </button>
              </div>
              <Icon name="shield" size={40} />
              <h2>ウイルスを検出しました</h2>
              <p>
                この画面を閉じないでください。すぐにサポートへ連絡してください。
              </p>
              <p className="support-number">0XX-XXXX-XXXX</p>
              <small>教材用の表示です。実際には発信できません。</small>
              <button
                className="button primary full"
                onClick={() => act("call")}
              >
                サポートに電話する（模擬）
              </button>
            </section>
            {s.insideClose && (
              <p className="info-box" role="status">
                警告内のボタンを押しても、画面は閉じませんでした。
              </p>
            )}
            <button
              className="text-button"
              aria-expanded={!!s.origin}
              onClick={() => act("origin")}
            >
              表示元を確認
            </button>
            {s.origin && (
              <div className="detail-box">
                <p>ブラウザのタブ内に表示されたウェブページです。</p>
                <code>device-help.example/alert</code>
                <p>このページは、端末を検査した結果を示していません。</p>
              </div>
            )}
          </>
        )}
        {state.screen === "call" && (
          <section className="support-call">
            <span className="eyebrow">模擬通話</span>
            <h2>サポート担当との会話</h2>
            <blockquote>
              「修復のため、こちらから端末を操作します。遠隔サポートを許可してください。」
            </blockquote>
            <p className="quiet">
              音声通話やソフトのインストールは行いません。
            </p>
            <div className="decision-actions">
              <button className="button primary" onClick={() => act("remote")}>
                遠隔操作を許可する（模擬）
              </button>
              <button
                className="button secondary"
                onClick={() => act("hangup")}
              >
                許可せず通話を切る
              </button>
            </div>
          </section>
        )}
        {(state.screen === "remote" || state.screen === "paid") && (
          <section className="support-call">
            <span className="connection-status">遠隔接続中（模擬）</span>
            <h2>サポート代の案内</h2>
            <blockquote>
              「修復の費用はギフトカードで支払ってください。コードをこちらに伝えてください。」
            </blockquote>
            {s.paid ? (
              <p className="info-box">架空のギフトコードを渡しました。</p>
            ) : (
              <button className="button primary" onClick={() => act("pay")}>
                架空のギフトコードを渡す
              </button>
            )}
            <p className="quiet">
              教材に用意したコードを使います。実際のコードは入力しません。
            </p>
            <button
              className="button secondary full"
              onClick={() => act("disconnect")}
            >
              遠隔接続を切る（模擬）
            </button>
          </section>
        )}
        {state.screen === "closed" && (
          <section className="mock-empty">
            <Icon name="globe" size={36} />
            <h2>警告画面を閉じました</h2>
            <dl className="transaction-details">
              <div>
                <dt>通話</dt>
                <dd>{s.called ? "終了しました" : "していません"}</dd>
              </div>
              <div>
                <dt>遠隔操作</dt>
                <dd>
                  {s.remoteGranted
                    ? "許可した後、接続を切りました"
                    : "許可していません"}
                </dd>
              </div>
              <div>
                <dt>コードの送信</dt>
                <dd>{s.paid ? "架空のコードを渡しました" : "していません"}</dd>
              </div>
            </dl>
            <button className="button secondary" onClick={() => act("help")}>
              対処と相談先を確認
            </button>
          </section>
        )}
        <p className="quiet simulation-note">
          警告・通話・接続はすべて教材内の再現です。
        </p>
      </div>
    </MockBrowser>
  );
}
