export type IconName =
  | "arrow"
  | "mail"
  | "shield"
  | "globe"
  | "photo"
  | "comment"
  | "book"
  | "check"
  | "refresh"
  | "eye"
  | "spark"
  | "clock"
  | "chevron"
  | "external"
  | "close";
const paths: Record<IconName, string> = {
  arrow: "M4 12h16m-6-6 6 6-6 6",
  mail: "M3 5h18v14H3zM3 5l9 7 9-7",
  shield: "M12 3 4 6v6c0 4 8 9 8 9s8-5 8-9V6zM8 12l3 3 5-6",
  globe:
    "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c-5 5-5 13 0 18M12 3c5 5 5 13 0 18",
  photo: "M3 4h18v16H3zM3 16l5-6 5 5 3-3 5 5M16 8h.01",
  comment: "M4 4h16v12H9l-5 4zM8 8h8M8 12h5",
  book: "M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1v15",
  check: "m5 12 4 4L19 6",
  refresh: "M20 7a9 9 0 1 0 1 8M20 3v5h-5",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  spark: "m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3z",
  clock: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v5l3 2",
  chevron: "m9 5 7 7-7 7",
  external: "M14 3h7v7M10 14 21 3M10 3H3v18h18v-7",
  close: "m6 6 12 12M6 18 18 6",
};
export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
