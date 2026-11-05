import { useEffect, useReducer, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { EngineEvent, Outcome, Scenario, Session } from "../engine/types";
import { initialSession, transition } from "../engine/engine";
import { scenarios } from "../scenarios";
import { articles } from "../../knowledge/articles";
import { useProgress } from "../../progress/ProgressProvider";
import { Icon } from "../../../components/Icon";
import { BudouX } from "../../../components/BudouX";
import { MockNewsFeed, MockShop, MockSupportWarning } from "./EverydayApps";
import {
  MockCommentThread,
  MockEmail,
  MockPhotoEditor,
  MockPostEditor,
} from "./MockApps";
export function HintPanel({
  scenario,
  state,
  dispatch,
}: {
  scenario: Scenario;
  state: Session;
  dispatch: (event: EngineEvent) => void;
}) {
  const panel = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (state.hintLevel === 0 && panel.current) panel.current.open = false;
  }, [state.hintLevel]);
  return (
    <details
      className="hint-panel"
      ref={panel}
      onToggle={(event) => {
        if (event.currentTarget.open && state.hintLevel === 0)
          dispatch({ type: "hint" });
      }}
    >
      <summary>
        <span>ヒント</span>
        <small>
          {state.hintLevel} / {scenario.hints.length}
        </small>
        <Icon name="chevron" size={16} />
      </summary>
      <div className="hint-content">
        <ol aria-live="polite">
          {scenario.hints.slice(0, state.hintLevel).map((hint) => (
            <li key={hint}>
              <BudouX>{hint}</BudouX>
            </li>
          ))}
        </ol>
        <button
          className="button secondary full"
          disabled={state.hintLevel === scenario.hints.length}
          onClick={() => dispatch({ type: "hint" })}
        >
          {state.hintLevel === scenario.hints.length
            ? "すべて表示済み"
            : state.hintLevel
              ? "次のヒントを見る"
              : "ヒントを見る"}
        </button>
      </div>
    </details>
  );
}
export function DiscoveryPanel({
  scenario,
  state,
}: {
  scenario: Scenario;
  state: Session;
}) {
  return (
    <section className="discovery-panel">
      <div className="row spread">
        <h3>発見したこと</h3>
        <span className="mono">
          {state.discoveries.length}
          <span className="quiet"> / {scenario.discoveries.length}</span>
        </span>
      </div>
      <div
        className="discovery-track"
        role="progressbar"
        aria-label="発見したこと"
        aria-valuemin={0}
        aria-valuemax={scenario.discoveries.length}
        aria-valuenow={state.discoveries.length}
      >
        {scenario.discoveries.map((d) => (
          <span
            key={d.id}
            className={state.discoveries.includes(d.id) ? "found" : ""}
          />
        ))}
      </div>
      <div aria-live="polite">
        {state.discoveries.length > 0 && (
          <ul>
            {scenario.discoveries
              .filter((d) => state.discoveries.includes(d.id))
              .map((d) => (
                <li key={d.id}>
                  <Icon name="check" size={16} />
                  <BudouX>{d.title}</BudouX>
                </li>
              ))}
          </ul>
        )}
      </div>
    </section>
  );
}
export function ResultPanel({ outcome }: { outcome: Outcome }) {
  return (
    <section className={`result-panel ${outcome.tone}`} aria-live="polite">
      <h2>
        <BudouX>{outcome.title}</BudouX>
      </h2>
      <p>
        <BudouX>{outcome.description}</BudouX>
      </p>
      <div className="result-next">
        <Icon name="arrow" size={18} />
        <p>
          <BudouX>{outcome.next}</BudouX>
        </p>
      </div>
    </section>
  );
}
export function ChallengeToolbar({
  scenario,
  onReset,
  onFinish,
}: {
  scenario: Scenario;
  onReset: () => void;
  onFinish: () => void;
}) {
  return (
    <div className="workspace-toolbar">
      <div>
        <Link className="back-link" to="/challenges">
          ← 体験を選ぶ
        </Link>
        <div className="row">
          <span className="eyebrow">{scenario.id}</span>
          <span className="quiet">
            {scenario.category} · 約{scenario.estimatedMinutes}分
          </span>
        </div>
        <h1>
          <BudouX>{scenario.title}</BudouX>
        </h1>
      </div>
      <div className="row wrap">
        <button className="button secondary" onClick={onReset}>
          <Icon name="refresh" size={16} /> リセット
        </button>
        <button className="button primary" onClick={onFinish}>
          終了して振り返る <Icon name="arrow" size={16} />
        </button>
      </div>
    </div>
  );
}
export function ReflectionView({
  scenario,
  state,
  dispatch,
}: {
  scenario: Scenario;
  state: Session;
  dispatch: (event: EngineEvent) => void;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  const found = scenario.discoveries.filter((d) =>
    state.discoveries.includes(d.id),
  );
  const missed = scenario.discoveries.filter(
    (d) => !state.discoveries.includes(d.id),
  );
  return (
    <div className="reflection">
      <h2 ref={ref} tabIndex={-1}>
        振り返り
      </h2>
      <section>
        <h3>あなたが試したこと</h3>
        {state.history.length ? (
          <ol className="action-history">
            {state.history.map((action, i) => (
              <li key={i}>
                <BudouX>{action.label}</BudouX>
              </li>
            ))}
          </ol>
        ) : (
          <p>まだ操作していません。</p>
        )}
      </section>
      {state.outcomes.length > 0 && (
        <section>
          <h3>行動によって起こり得ること</h3>
          {state.outcomes.map((result, i) => (
            <ResultPanel key={i} outcome={result} />
          ))}
        </section>
      )}
      <section>
        <h3>
          発見したこと <span className="quiet">{found.length}個</span>
        </h3>
        {found.length ? (
          found.map((d) => (
            <div className="reflection-point" key={d.id}>
              <Icon name="check" />
              <div>
                <h4>
                  <BudouX>{d.title}</BudouX>
                </h4>
                <p>
                  <BudouX>{d.detail}</BudouX>
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>まだ発見は記録されていません。</p>
        )}
      </section>
      {missed.length > 0 && (
        <section>
          <h3>未確認のポイント</h3>
          {missed.map((d) => (
            <details className="missed-point" key={d.id}>
              <summary>
                <BudouX>{d.title}</BudouX>
              </summary>
              <p>
                <BudouX>{d.detail}</BudouX>
              </p>
            </details>
          ))}
        </section>
      )}
      <section className="reality-note">
        <h3>現実の場面では</h3>
        <p>
          <BudouX>{scenario.reality}</BudouX>
        </p>
      </section>
      <section>
        <h3>関連する解説</h3>
        {articles
          .filter((a) => scenario.knowledgeIds.includes(a.id))
          .map((a) => (
            <Link className="article-link" key={a.id} to={`/knowledge/${a.id}`}>
              <Icon name="book" />
              <BudouX>{a.title}</BudouX>
              <Icon name="arrow" />
            </Link>
          ))}
      </section>
      <div className="row wrap">
        <button
          className="button primary"
          onClick={() => dispatch({ type: "reset" })}
        >
          <Icon name="refresh" size={17} /> もう一度試す
        </button>
        <button
          className="button secondary"
          onClick={() => dispatch({ type: "resume" })}
        >
          体験に戻る
        </button>
        <Link className="text-button" to="/challenges">
          別の体験を選ぶ <Icon name="arrow" size={17} />
        </Link>
      </div>
    </div>
  );
}
function Workspace({ scenario }: { scenario: Scenario }) {
  const [state, dispatch] = useReducer(
    (state: Session, event: EngineEvent) => transition(scenario, state, event),
    scenario,
    initialSession,
  );
  const { record, available } = useProgress();
  const [resetConfirm, setResetConfirm] = useState(false);
  const lastRecorded = useRef<Session | null>(null);
  const appRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (
      (state.history.length || state.reflection) &&
      lastRecorded.current !== state
    ) {
      record(scenario, state);
      lastRecorded.current = state;
    }
  }, [state, scenario, record]);
  const act = (event: EngineEvent) => {
    dispatch(event);
    if (event.type === "reset" || event.type === "resume")
      requestAnimationFrame(() => {
        appRef.current?.focus();
        window.scrollTo({ top: 0 });
      });
  };
  const Mock = {
    mail: MockEmail,
    post: MockPostEditor,
    photo: MockPhotoEditor,
    comment: MockCommentThread,
    news: MockNewsFeed,
    shop: MockShop,
    support: MockSupportWarning,
  }[scenario.app];
  return (
    <div className="workspace-page">
      <div className="simulation-banner">
        <Icon name="shield" size={15} />
        <span>安全な模擬環境です。投稿・送信は外部に届きません。</span>
      </div>
      <div className="container">
        <ChallengeToolbar
          scenario={scenario}
          onReset={() => setResetConfirm(true)}
          onFinish={() => act({ type: "finish" })}
        />
        {resetConfirm && (
          <div className="reset-confirm" role="alert">
            <p>
              この体験を最初からやり直しますか？
              保存済みの発見と進捗は残ります。
            </p>
            <div className="row">
              <button
                className="button primary"
                autoFocus
                onClick={() => {
                  act({ type: "reset" });
                  setResetConfirm(false);
                }}
              >
                最初からやり直す
              </button>
              <button
                className="button secondary"
                onClick={() => setResetConfirm(false)}
              >
                キャンセル
              </button>
            </div>
          </div>
        )}
        {!available && (
          <p className="storage-warning" role="status">
            このブラウザでは進捗を保存できません。体験は続けられますが、ページを閉じると今回の記録は失われます。
          </p>
        )}
        {state.reflection ? (
          <ReflectionView scenario={scenario} state={state} dispatch={act} />
        ) : (
          <>
            <p className="workspace-objective">
              <BudouX>{scenario.objective}</BudouX>
            </p>
            <div className="workspace-grid">
              <div className="simulation-column" ref={appRef} tabIndex={-1}>
                <Mock state={state} dispatch={act} />
                {state.outcomes.length > 0 && (
                  <ResultPanel
                    outcome={state.outcomes[state.outcomes.length - 1]}
                  />
                )}
              </div>
              <aside className="workspace-sidebar" aria-label="体験の補助">
                <div className="workspace-help-content">
                  <HintPanel scenario={scenario} state={state} dispatch={act} />
                  <DiscoveryPanel scenario={scenario} state={state} />
                  <Link
                    className="sidebar-knowledge"
                    to={`/knowledge/${scenario.knowledgeIds[0]}`}
                  >
                    <Icon name="book" size={17} /> 関連する解説
                    <Icon name="arrow" size={16} />
                  </Link>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
export function ChallengeWorkspace() {
  const { slug } = useParams();
  const scenario = scenarios.find((s) => s.slug === slug);
  return scenario ? (
    <Workspace key={scenario.id} scenario={scenario} />
  ) : (
    <div className="container page-heading">
      <h1>この体験は見つかりませんでした</h1>
      <Link className="button primary" to="/challenges">
        体験一覧へ
      </Link>
    </div>
  );
}
