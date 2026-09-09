import { cn } from "@/lib/utils";
export function Maki({
  className,
  pose = "happy",
  motion = "idle",
}: {
  className?: string;
  pose?: "happy" | "wave" | "thinking" | "sleep";
  motion?: "static" | "idle" | "roll" | "cook";
}) {
  return (
    <svg
      className={cn("maki", className)}
      data-motion={motion}
      viewBox="0 0 160 180"
      role="img"
      aria-label={`Maki, the ${pose === "sleep" ? "resting" : "friendly"} sushi guide`}
    >
      {motion === "cook" && (
        <g className="maki-steam" fill="none" stroke="#DCE9C2" strokeWidth="3" strokeLinecap="round">
          <path d="M62 37c-7-8 7-12 0-21" />
          <path d="M81 31c-7-8 7-12 0-21" />
          <path d="M100 37c-7-8 7-12 0-21" />
        </g>
      )}
      <ellipse cx="82" cy="165" rx="48" ry="8" fill="#23372F" opacity=".08" />
      <path
        d="M49 143l-7 15m70-15 8 15"
        fill="none"
        stroke="#263D31"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d={pose === "wave" ? "M127 112q26-2 20-32" : "M127 112q15 4 16 17"}
        fill="none"
        stroke="#263D31"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M33 111q-16 5-18 17"
        fill="none"
        stroke="#263D31"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M28 65c0-20 106-20 106 0v67c0 34-106 34-106 0Z"
        fill="#2A4437"
        stroke="#21362C"
        strokeWidth="3"
      />
      <path
        d="M36 82v44"
        stroke="#486150"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <ellipse
        cx="81"
        cy="64"
        rx="53"
        ry="30"
        fill="#FFFDF4"
        stroke="#21362C"
        strokeWidth="3"
      />
      <ellipse cx="81" cy="62" rx="32" ry="18" fill="#F58F73" />
      <path
        d="m58 56 25 18m-11-27 24 20"
        stroke="#FFC4AC"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="m47 50 5-3m-10 14 5 2m12 17 5 1m41-5 5-2m5-15 5-1m-14-17 4 2"
        stroke="#E5DFC9"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {pose === "sleep" ? (
        <path
          d="m59 111 10 2m25 0 10-2"
          stroke="#FFFDF4"
          strokeWidth="3"
          strokeLinecap="round"
        />
      ) : (
        <>
          <ellipse cx="65" cy="111" rx="3.5" ry="5" fill="#FFFDF4" />
          <ellipse cx="99" cy="111" rx="3.5" ry="5" fill="#FFFDF4" />
        </>
      )}
      <ellipse cx="52" cy="120" rx="7" ry="3.5" fill="#EF947E" />
      <ellipse cx="112" cy="120" rx="7" ry="3.5" fill="#EF947E" />
      <path
        d={pose === "thinking" ? "M78 125h8" : "M75 123q7 10 14 0"}
        fill="none"
        stroke="#FFFDF4"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {pose === "wave" && (
        <path
          d="m137 48 4-9m8 17 8-4"
          stroke="#DB684E"
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="logo">
      <span className="logo-mark">
        <Maki motion="static" />
      </span>
      {!compact && (
        <span>
          rank<span className="logo-light">sushi</span>
          <span className="logo-dot">.</span>
        </span>
      )}
    </span>
  );
}
