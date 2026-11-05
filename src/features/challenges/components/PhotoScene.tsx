import { useId } from "react";
export function PhotoScene({
  face = false,
  background = false,
}: {
  face?: boolean;
  background?: boolean;
}) {
  const id = useId();
  return (
    <svg
      className="photo-scene"
      viewBox="0 0 600 400"
      role="img"
      aria-label={`架空の友人2人が学校の前で撮影したイラスト。${face ? "顔はぼかし済み。" : "2人の顔が見える。"}${background ? "学校の看板と私物の名札はぼかし済み。" : "背景には星凪学園の看板、バッグにはAOIの名札。"}`}
    >
      <defs>
        <filter id={id}>
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <pattern
          id={`${id}-wall`}
          width="80"
          height="45"
          patternUnits="userSpaceOnUse"
        >
          <path d="M0 44h80M40 0v44" stroke="#e5dbce" strokeWidth="2" />
        </pattern>
      </defs>
      <path fill="#dce9e6" d="M0 0h600v400H0z" />
      <circle cx="488" cy="61" r="34" fill="#f8efca" />
      <path fill="#efebe0" d="M65 63h470v266H65z" />
      <path fill={`url(#${id}-wall)`} d="M65 63h470v266H65z" />
      <path fill="#a9bbb2" d="M100 112h80v114h-80zm310 0h80v114h-80z" />
      <path
        stroke="#eee9de"
        strokeWidth="8"
        d="M140 112v114m-40-57h80m270-57v114m-40-57h80"
      />
      <path
        fill="#7b9a74"
        d="M0 258q25-80 75 0 35-55 70 10l-5 70H0zm450 4q35-75 65-10 60-85 85 0v86H450z"
      />
      <path fill="#b7b39b" d="M0 325h600v75H0z" />
      <path fill="#d1c9b4" d="m180 325-30 75h300l-30-75" />
      <g filter={background ? `url(#${id})` : undefined}>
        <rect x="218" y="79" width="165" height="45" rx="3" fill="#314d44" />
        <text
          x="300"
          y="109"
          textAnchor="middle"
          fill="#fff9e9"
          fontSize="23"
          letterSpacing="4"
        >
          星凪学園
        </text>
      </g>
      <path d="m170 400 12-137q26-40 80-7l34 144" fill="#e8be91" />
      <path d="m294 400 18-138q34-32 77 0l43 138" fill="#526e69" />
      <path d="M214 249v24m138-26v25" stroke="#dba77e" strokeWidth="30" />
      <g filter={face ? `url(#${id})` : undefined}>
        <ellipse cx="217" cy="210" rx="41" ry="49" fill="#e3b18c" />
        <path
          d="M175 212q-8-74 44-64 44 2 39 66l-18-36q-20 23-62 14z"
          fill="#3c3932"
        />
        <path
          d="M199 211h4m25 0h4"
          stroke="#3c3932"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M208 232q11 9 20-1"
          fill="none"
          stroke="#9a6254"
          strokeWidth="3"
        />
        <ellipse cx="353" cy="211" rx="39" ry="48" fill="#e3b18c" />
        <path
          d="M313 232q-14-90 40-85 57 3 39 99l-10-58q-35 9-57-5l-2 55z"
          fill="#424035"
        />
        <path
          d="M335 211h4m22 0h4"
          stroke="#3c3932"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M343 232q10 7 19-2"
          fill="none"
          stroke="#9a6254"
          strokeWidth="3"
        />
      </g>
      <path d="m331 273 62 84" stroke="#bfb8a2" strokeWidth="12" />
      <rect x="356" y="328" width="65" height="70" rx="13" fill="#d5c9ad" />
      <g filter={background ? `url(#${id})` : undefined}>
        <rect x="369" y="344" width="38" height="24" rx="2" fill="#faf8e9" />
        <text x="388" y="361" fontSize="14" fill="#38483e" textAnchor="middle">
          AOI
        </text>
      </g>
      <path
        d="m280 295 23-17m-10 6-4-18m10 13 6-17"
        fill="none"
        stroke="#e3b18c"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <text x="21" y="380" fill="#39493e" fontSize="12" letterSpacing="2">
        FICTIONAL PHOTO / LAB
      </text>
    </svg>
  );
}
