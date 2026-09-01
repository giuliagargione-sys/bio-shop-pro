export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg
        width="34"
        height="34"
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="40" height="40" rx="12" fill="var(--coral)" />
        {/* chain link */}
        <path
          d="M15.5 18.5l3.5-3.5a3.9 3.9 0 015.5 0 3.9 3.9 0 010 5.5l-1.8 1.8"
          stroke="var(--creme)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M24.5 21.5l-3.5 3.5a3.9 3.9 0 01-5.5 0 3.9 3.9 0 010-5.5l1.8-1.8"
          stroke="var(--creme)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        {/* golden arrow */}
        <path
          d="M26 10l6-2-2 6"
          fill="var(--dourado)"
        />
        <path
          d="M31.5 8.5L27 13"
          stroke="var(--dourado)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
      <span
        className={`font-display text-lg font-semibold leading-tight tracking-tight ${
          light ? "text-creme" : "text-tinta"
        }`}
      >
        Link Na Bio{" "}
        <span className="text-coral">Que Vende</span>
      </span>
    </span>
  );
}
