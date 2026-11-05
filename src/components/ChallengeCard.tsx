import { Link } from "react-router-dom";
import type { Scenario } from "../features/challenges/engine/types";
import { useProgress } from "../features/progress/ProgressProvider";
import { Icon, type IconName } from "./Icon";
import { PhotoScene } from "../features/challenges/components/PhotoScene";
import { BudouX } from "./BudouX";
export const appIcons: Record<Scenario["app"], IconName> = {
  mail: "mail",
  post: "globe",
  photo: "photo",
  comment: "comment",
  news: "globe",
  shop: "book",
  support: "shield",
};
export function ChallengeVisual({ app }: { app: Scenario["app"] }) {
  const excerpts = {
    mail: ["こもれび配送", "お荷物のお届け先について", "お届け先を確認する"],
    post: [
      "はる @haru_days",
      "今日も、いつもの場所で。",
      "#放課後 #アルバイト",
    ],
    photo: ["今日の一枚", "友人限定", ""],
    comment: ["それって、どうなの？", "伝え方を変えてみる。", ""],
    news: [
      "そらがシェア",
      "明日のフェス、中止らしい！",
      "元の情報は、いつのもの？",
    ],
    shop: [
      "ソラミチストア",
      "本日限定 1,980円",
      "残り2台 / ワイヤレスヘッドホン",
    ],
    support: [
      "端末保護センター",
      "ウイルスを検出しました",
      "すぐにサポートへ連絡してください",
    ],
  }[app];
  return (
    <div className={`challenge-visual visual-${app}`} aria-hidden="true">
      {app === "photo" ? (
        <PhotoScene />
      ) : (
        <>
          <Icon name={appIcons[app]} size={24} />
          <div>
            <strong>
              <BudouX>{excerpts[1]}</BudouX>
            </strong>
            <span>
              <BudouX>{excerpts[0]}</BudouX>
            </span>
            <small>
              <BudouX>{excerpts[2]}</BudouX>
            </small>
          </div>
        </>
      )}
    </div>
  );
}
export function ChallengeCard({ scenario }: { scenario: Scenario }) {
  const { progress } = useProgress();
  const entry = progress[scenario.id];
  return (
    <Link className="challenge-card" to={`/challenges/${scenario.slug}`}>
      <div className="card-content">
        <h3>
          {scenario.shortTitle.split("\n").map((line, i) => (
            <span key={i}>
              <BudouX>{line}</BudouX>
            </span>
          ))}
        </h3>
        <p>
          <BudouX>{scenario.description}</BudouX>
        </p>
        <span className="card-category">{scenario.category}</span>
        <div className="card-state">
          <span className="scenario-id">{scenario.id}</span>
          <span className={`status ${entry?.experienced ? "experienced" : ""}`}>
            {entry?.reflected
              ? "振り返り済み"
              : entry?.experienced
                ? "体験中"
                : "未体験"}
          </span>
        </div>
        <div className="card-bottom">
          <span>
            {scenario.difficulty}
            <span className="separator">/</span>
            <Icon name="clock" size={13} /> 約{scenario.estimatedMinutes}分
          </span>
          <span className="card-action">体験する</span>
        </div>
      </div>
      <ChallengeVisual app={scenario.app} />
    </Link>
  );
}
