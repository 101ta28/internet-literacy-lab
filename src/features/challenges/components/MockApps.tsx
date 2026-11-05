import type { ReactNode } from "react";
import type { EngineEvent, Session } from "../engine/types";
import { comments, commentText, inferPost, postText } from "../scenarios";
import { Icon } from "../../../components/Icon";
import { PhotoScene } from "./PhotoScene";
export interface MockProps {
  state: Session;
  dispatch: (event: EngineEvent) => void;
}
function useAction(dispatch: MockProps["dispatch"]) {
  return (id: string, value?: string | boolean) =>
    dispatch({ type: "action", id, value });
}
export function MockBrowser({
  name,
  address,
  children,
}: {
  name: string;
  address: string;
  children: ReactNode;
}) {
  return (
    <div className="mock-browser">
      <div className="browser-chrome">
        <span className="window-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="browser-name">{name}</span>
        <span className="mock-tag">模擬アプリ</span>
      </div>
      <div className="address-bar">
        <Icon name="globe" size={14} />
        <span>{address}</span>
      </div>
      {children}
    </div>
  );
}
function Audience({
  value,
  onChange,
}: {
  value: string | boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="field-label">
      公開範囲
      <select
        aria-label="公開範囲"
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="public">全体公開 · 誰でも</option>
        <option value="friends">友人限定</option>
        <option value="private">自分のみ</option>
      </select>
    </label>
  );
}
function Toggle({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
}) {
  return (
    <label className="toggle-row">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>{children}</span>
    </label>
  );
}
export function MockEmail({ state, dispatch }: MockProps) {
  const act = useAction(dispatch);
  const s = state.settings;
  const address =
    state.screen === "website"
      ? "https://komorebi-verify.example/address"
      : state.screen === "official"
        ? "app.komorebi.example"
        : "mail.pocket.example";
  return (
    <MockBrowser
      name={
        state.screen === "official"
          ? "こもれび配送"
          : state.screen === "website"
            ? "配送先の確認"
            : "pocket mail"
      }
      address={address}
    >
      <div className="mock-appbar">
        <strong>
          <Icon name="mail" />{" "}
          {state.screen === "official" ? "こもれび配送" : "pocket mail"}
        </strong>
        <button className="text-button" onClick={() => act("official")}>
          公式アプリを開く <Icon name="external" size={15} />
        </button>
      </div>
      {state.screen === "inbox" && (
        <div className="inbox">
          <div className="mock-section-title">
            受信トレイ <span>{s.removed ? 0 : 1}</span>
          </div>
          {!s.removed && (
            <button className="email-row" onClick={() => act("open")}>
              <span className="avatar delivery">K</span>
              <span>
                <strong>こもれび配送</strong>
                <span>【ご確認ください】お荷物のお届け先について</span>
                <small>配送を続けるには、住所の確認が必要です。</small>
              </span>
              <time>10:24</time>
              <Icon name="chevron" size={18} />
            </button>
          )}
          {s.removed && (
            <p className="quiet inbox-note">この受信箱にメールはありません。</p>
          )}
        </div>
      )}
      {state.screen === "email" && (
        <div className="email-content">
          <div className="row spread">
            <button className="text-button" onClick={() => act("back")}>
              ← 受信トレイ
            </button>
            <div className="row">
              <button className="text-button" onClick={() => act("report")}>
                報告
              </button>
              <button className="text-button" onClick={() => act("remove")}>
                削除
              </button>
            </div>
          </div>
          <h2>
            【ご確認ください】
            <br />
            お荷物のお届け先について
          </h2>
          <div className="sender">
            <span className="avatar delivery">K</span>
            <div>
              <strong>こもれび配送</strong>
              <small>宛先：はる　·　今日 10:24</small>
              <button
                className="text-button"
                aria-expanded={!!s.sender}
                onClick={() => act("sender")}
              >
                差出人の詳細 ▾
              </button>
            </div>
          </div>
          {s.sender && (
            <div className="detail-box">
              <span>From</span>
              <code>notice@komorebi-support.example</code>
              <span>To</span>
              <code>haru@pocket.example</code>
            </div>
          )}
          <div className="email-body">
            <p>いつもこもれび配送をご利用いただき、ありがとうございます。</p>
            <p>
              お預かりしているお荷物について、配送先住所の確認が必要になりました。
            </p>
            <p>
              下記のページから、<strong>24時間以内</strong>
              にお手続きをお願いいたします。期限を過ぎると、お荷物が返送される場合があります。
            </p>
            <button className="button mail-cta" onClick={() => act("link")}>
              お届け先を確認する <Icon name="arrow" size={16} />
            </button>
            <button
              className="text-button url-inspect"
              aria-expanded={!!s.url}
              onClick={() => act("url")}
            >
              <Icon name="eye" size={16} /> リンク先を確認
            </button>
            {s.url && (
              <div className="detail-box">
                <code>https://komorebi-verify.example/address</code>
              </div>
            )}
            <p className="quiet">
              こもれび配送 お客様サポート
              <br />
              ※このメールは送信専用です。
            </p>
          </div>
        </div>
      )}
      {state.screen === "website" && (
        <div className="mock-form">
          <div className="package-icon">□</div>
          <h2>お届け先の確認</h2>
          <p>配送を再開するために、以下の情報を送信してください。</p>
          <div className="fake-field">
            メールアドレス <strong>haru@pocket.example</strong>
          </div>
          <div className="fake-field">
            パスワード <strong>●●●●●●●●（架空）</strong>
          </div>
          <div className="fake-field">
            住所 <strong>サンプル市 みどり町 0-0（架空）</strong>
          </div>
          <button
            className="button primary"
            disabled={!!s.submitted}
            onClick={() => act("send")}
          >
            {s.submitted ? "架空の情報を送信しました" : "架空の情報で送信する"}
          </button>
          <button className="text-button" onClick={() => act("close")}>
            {s.submitted ? "この画面を閉じる" : "情報を送信せずに閉じる"}
          </button>
        </div>
      )}
      {state.screen === "official" && (
        <div className="mock-form">
          <span className="eyebrow">KOMOREBI DELIVERY</span>
          <h2>お荷物は、配送中です。</h2>
          <div className="delivery-track">
            <i />
            <span /> <i />
            <span />
            <i className="inactive" />
          </div>
          <div className="row spread">
            <small>受付済み</small>
            <small>配送中</small>
            <small>お届け</small>
          </div>
          <div className="info-box">
            <strong>お客様による住所確認は不要です。</strong>
            <p>
              お届け予定：本日 14:00–16:00
              <br />
              配送番号：LAB-0001
            </p>
          </div>
          {s.submitted && (
            <button className="button primary" onClick={() => act("recover")}>
              入力してしまった場合の対応を確認
            </button>
          )}
          <button className="text-button" onClick={() => act("back")}>
            受信トレイに戻る
          </button>
        </div>
      )}
      {state.screen === "deleted" && (
        <div className="mock-empty">
          <Icon name="check" size={40} />
          <h2>メールを取り除きました</h2>
          <p>この模擬受信箱に、配送通知はありません。</p>
          <button className="button secondary" onClick={() => act("official")}>
            公式アプリを確認する
          </button>
        </div>
      )}
    </MockBrowser>
  );
}
export function MockSocialFeed({
  children,
  name = "ひとこと",
}: {
  children: ReactNode;
  name?: string;
}) {
  return (
    <>
      <div className="mock-appbar">
        <strong className="social-wordmark">
          {name}
          <span>●</span>
        </strong>
        <span className="avatar small">H</span>
      </div>
      {children}
    </>
  );
}
export function MockPostEditor({ state, dispatch }: MockProps) {
  const act = useAction(dispatch);
  const s = state.settings;
  return (
    <MockBrowser name="ひとこと / 投稿" address="hitokoto.example">
      <MockSocialFeed>
        <div className="social-content">
          <div className="profile-line">
            <span className="avatar">H</span>
            <div>
              <strong>はる</strong>
              <small>@haru_days · 日々の記録</small>
            </div>
          </div>
          {state.screen === "deleted" ? (
            <div className="info-box">
              この投稿は削除されています。
              <button className="text-button" onClick={() => act("edit")}>
                内容を見直してもう一度試す
              </button>
            </div>
          ) : (
            <>
              <div
                className="segmented"
                role="group"
                aria-label="投稿を見る視点"
              >
                <button
                  aria-pressed={s.view === "self"}
                  onClick={() => act("view", "self")}
                >
                  自分の視点
                </button>
                <button
                  aria-pressed={s.view === "other"}
                  onClick={() => act("view", "other")}
                >
                  <Icon name="eye" size={16} />
                  第三者の視点
                </button>
              </div>
              <div className="post-preview">
                <p>{postText(state)}</p>
                {s.image && (
                  <div
                    className="cafe-photo"
                    role="img"
                    aria-label="カフェ・モリの店名が入ったカップのイラスト"
                  >
                    <div className="coffee-cup">
                      <span>
                        café
                        <br />
                        <b>MORI</b>
                      </span>
                    </div>
                    <span className="coffee-caption">a little break.</span>
                  </div>
                )}
                <small>
                  <Icon name="globe" size={13} />{" "}
                  {s.audience === "public"
                    ? "全体公開"
                    : s.audience === "friends"
                      ? "友人限定"
                      : "自分のみ"}
                  　
                  {state.screen === "posted"
                    ? "· 投稿済み"
                    : "· 投稿前のプレビュー"}
                </small>
              </div>
              {s.view === "other" && (
                <div className="info-box">
                  <strong>第三者に見える情報</strong>
                  {s.audience === "private" ? (
                    <p>
                      今回の投稿は他の人には見えません。以前の公開投稿は残っています。
                    </p>
                  ) : (
                    <>
                      <p>
                        {s.audience === "friends"
                          ? "友人が閲覧できます。再共有される可能性もあります。"
                          : "知らない人も閲覧できます。"}
                      </p>
                      <ul>
                        {inferPost(state).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
              {state.screen === "editor" ? (
                <>
                  <fieldset className="editor-options">
                    <legend>投稿に含める情報</legend>
                    {(
                      [
                        ["school", "学校名"],
                        ["place", "場所・勤務先"],
                        ["schedule", "曜日・時間"],
                        ["image", "店名が写った画像"],
                      ] as const
                    ).map(([key, label]) => (
                      <Toggle
                        key={key}
                        checked={!!s[key]}
                        onChange={() => act(key)}
                      >
                        {label}
                      </Toggle>
                    ))}
                  </fieldset>
                  <label className="field-label">
                    文章の結び
                    <select
                      aria-label="文章の結び"
                      value={String(s.tone)}
                      onChange={(e) => act("tone", e.target.value)}
                    >
                      <option value="normal">帰りのラテが楽しみ。</option>
                      <option value="short">今日もがんばった。</option>
                    </select>
                  </label>
                  <Audience
                    value={s.audience}
                    onChange={(value) => act("audience", value)}
                  />
                  <button
                    className="button primary full"
                    onClick={() => act("publish")}
                  >
                    この内容で投稿する <Icon name="arrow" size={16} />
                  </button>
                </>
              ) : (
                <div className="row wrap">
                  <button
                    className="button secondary"
                    onClick={() => act("edit")}
                  >
                    投稿を編集する
                  </button>
                  <button className="text-button" onClick={() => act("remove")}>
                    投稿を削除する
                  </button>
                </div>
              )}
            </>
          )}
          <div className="past-posts">
            <button
              className="text-button"
              aria-expanded={!!s.past}
              onClick={() => act("past")}
            >
              過去の投稿と比較する ▾
            </button>
            {s.past && (
              <>
                <div>
                  <small>3日前 · 全体公開</small>
                  <p>月見駅の近くに、お気に入りのパン屋さんを発見。</p>
                </div>
                <div>
                  <small>1週間前 · 全体公開</small>
                  <p>星凪祭、おつかれさま！クラスの展示、いい感じだった。</p>
                </div>
              </>
            )}
          </div>
        </div>
      </MockSocialFeed>
    </MockBrowser>
  );
}
export function MockPhotoEditor({ state, dispatch }: MockProps) {
  const act = useAction(dispatch);
  const s = state.settings;
  return (
    <MockBrowser name="ひとこと / 写真" address="hitokoto.example/photo">
      <MockSocialFeed>
        <div className="social-content">
          <div className="row spread">
            <h2 className="small-heading">今日の一枚</h2>
            <button
              className="text-button"
              aria-expanded={!!s.zoom}
              onClick={() => act("zoom")}
            >
              <Icon name="eye" size={16} />
              {s.zoom ? "元の大きさに戻す" : "写真を拡大"}
            </button>
          </div>
          {state.screen !== "deleted" && (
            <>
              <div className={`photo-frame ${s.zoom ? "zoomed" : ""}`}>
                <PhotoScene face={!!s.face} background={!!s.background} />
              </div>
              <div
                className="row wrap photo-inspect"
                aria-label="写真の情報を調べる"
              >
                <button
                  className="small-button"
                  onClick={() => act("inspect", "faces")}
                >
                  人物を確認
                </button>
                <button
                  className="small-button"
                  onClick={() => act("inspect", "sign")}
                >
                  背景を確認
                </button>
                <button
                  className="small-button"
                  onClick={() => act("inspect", "bag")}
                >
                  私物を確認
                </button>
              </div>
              {s.inspected && (
                <p className="info-box" role="status">
                  {s.inspected === "faces"
                    ? "はると友人のあおいが写っています。顔以外にも服装が識別の手掛かりになる場合があります。"
                    : s.inspected === "sign"
                      ? "背景の看板には「星凪学園」と書かれています。"
                      : "バッグの名札には「AOI」と書かれています。"}
                </p>
              )}
            </>
          )}
          <div className="consent-box">
            <button
              className="text-button"
              onClick={() => act("consent")}
              aria-expanded={!!s.consent}
            >
              <Icon name="comment" size={18} /> あおいに公開してよいか確認する
            </button>
            {s.consent && (
              <div className="chat-bubble">
                <strong>あおい</strong>
                <p>
                  友人限定ならOK！
                  学校名とバッグの名札は隠してほしいな。誰でも見られる公開は、やめておきたい。
                </p>
              </div>
            )}
          </div>
          {state.screen === "editor" ? (
            <>
              <fieldset className="editor-options">
                <legend>写真の設定</legend>
                <Toggle checked={!!s.face} onChange={() => act("face")}>
                  人物の顔をぼかす
                </Toggle>
                <Toggle
                  checked={!!s.background}
                  onChange={() => act("background")}
                >
                  背景・私物の文字をぼかす
                </Toggle>
              </fieldset>
              <Audience
                value={s.audience}
                onChange={(value) => act("audience", value)}
              />
              <button
                className="button primary full"
                onClick={() => act("publish")}
              >
                この設定で投稿する <Icon name="arrow" size={16} />
              </button>
            </>
          ) : (
            <div className="info-box">
              <strong>
                {state.screen === "posted"
                  ? `投稿しました · ${s.audience === "public" ? "全体公開" : s.audience === "friends" ? "友人限定" : "自分のみ"}`
                  : "写真の公開を取り下げました"}
              </strong>
              <div className="row wrap">
                <button className="text-button" onClick={() => act("edit")}>
                  設定を見直す
                </button>
                {state.screen === "posted" && (
                  <button className="text-button" onClick={() => act("remove")}>
                    公開を取り下げる
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </MockSocialFeed>
    </MockBrowser>
  );
}
export function MockCommentThread({ state, dispatch }: MockProps) {
  const act = useAction(dispatch);
  const s = state.settings;
  const isAttack = s.choice === "attack" && !s.rephrase;
  return (
    <MockBrowser name="ひとこと / コメント" address="hitokoto.example/thread">
      <MockSocialFeed>
        <div className="social-content">
          {state.screen === "blocked" ? (
            <div className="info-box">
              この投稿者をブロックし、投稿を非表示にしました。
            </div>
          ) : (
            <div className="original-post">
              <div className="profile-line">
                <span className="avatar blue">S</span>
                <div>
                  <strong>そら</strong>
                  <small>@sora_walk · 20分前</small>
                </div>
              </div>
              <p>
                イベントの入場列、知り合いがいたから途中に合流！早く入れてラッキー。
              </p>
              <div
                className="queue-illustration"
                role="img"
                aria-label="架空のイベント入場列のイラスト。前後の事情は写真から分からない。"
              >
                <span>
                  EVENT
                  <br />
                  ENTRANCE →
                </span>
                <i />
                <i />
                <i />
                <i />
              </div>
              <small className="quiet">
                この投稿の前後の事情は分かっていません。
              </small>
            </div>
          )}
          <div
            className="segmented perspectives"
            role="group"
            aria-label="コメントを見る視点"
          >
            {[
              ["self", "自分"],
              ["recipient", "相手"],
              ["bystander", "周囲の人"],
            ].map(([key, label]) => (
              <button
                key={key}
                aria-pressed={s.perspective === key}
                onClick={() => act("perspective", key)}
              >
                {label}の視点
              </button>
            ))}
          </div>
          {s.perspective !== "self" && (
            <div className="info-box">
              <strong>受け止め方の一例</strong>
              <p>
                {s.perspective === "recipient"
                  ? isAttack
                    ? "「行動の話ではなく、自分を否定された」と感じるかもしれません。"
                    : "「どの行動について言われているか」は分かりやすくなります。ただし、反応は人によって違います。"
                  : isAttack
                    ? "「この人なら責めていい」と受け取った人が加わり、対立が広がるかもしれません。"
                    : "落ち着いて事情を考えるきっかけになるかもしれません。"}
              </p>
            </div>
          )}
          {state.screen === "thread" ? (
            <>
              <fieldset className="comment-options">
                <legend>コメント候補を選ぶ</legend>
                {Object.entries(comments).map(([key, text]) => (
                  <label key={key}>
                    <input
                      type="radio"
                      name="comment"
                      value={key}
                      checked={s.choice === key}
                      onChange={() => act("choice", key)}
                    />
                    <span>{text}</span>
                  </label>
                ))}
              </fieldset>
              {s.choice === "attack" && (
                <Toggle checked={!!s.rephrase} onChange={() => act("rephrase")}>
                  具体的な行動への意見に言い換える
                </Toggle>
              )}
              <div className="comment-preview">
                <small>送信前のプレビュー</small>
                <p>{commentText(state)}</p>
              </div>
              <div className="row wrap">
                <button
                  className="button primary"
                  onClick={() => act("publish")}
                >
                  コメントを投稿
                </button>
                <button className="text-button" onClick={() => act("cancel")}>
                  投稿を取りやめる
                </button>
              </div>
            </>
          ) : (
            <div className="comment-preview">
              <strong>
                {state.screen === "posted"
                  ? "投稿したコメント"
                  : state.screen === "cancelled"
                    ? "投稿を取りやめました"
                    : state.screen === "reported"
                      ? "運営への報告を受け付けました（模擬）"
                      : state.screen === "deleted"
                        ? "コメントを削除しました"
                        : "ブロックしました"}
              </strong>
              {state.screen === "posted" && <p>{commentText(state)}</p>}
              <div className="row wrap">
                <button className="text-button" onClick={() => act("edit")}>
                  別の対応を考える
                </button>
                {state.screen === "posted" && (
                  <button className="text-button" onClick={() => act("remove")}>
                    自分のコメントを削除
                  </button>
                )}
              </div>
            </div>
          )}
          <div className="thread-actions">
            <span className="quiet">投稿以外の対応</span>
            <button className="text-button" onClick={() => act("report")}>
              元の投稿を通報
            </button>
            <button className="text-button" onClick={() => act("block")}>
              ブロック
            </button>
          </div>
        </div>
      </MockSocialFeed>
    </MockBrowser>
  );
}
