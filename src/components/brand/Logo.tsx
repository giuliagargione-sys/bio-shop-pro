// Identidade visual do produto "Link Na Bio Que Vende": um marca-link
// (duas argolas de corrente) com uma seta de crescimento em dourado,
// simbolizando "o link que vira venda". Tudo em SVG inline — sem
// dependência de arquivo de imagem externo.

interface LogoProps {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}

export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="lnbqv-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6B1B2B" />
          <stop offset="1" stopColor="#0B0B0B" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="9" fill="url(#lnbqv-bg)" />
      <g transform="translate(20 20) rotate(-45) translate(-20 -20)">
        <rect x="9" y="14" width="14" height="12" rx="6" stroke="white" strokeWidth="3" />
        <rect x="17" y="14" width="14" height="12" rx="6" stroke="white" strokeWidth="3" />
      </g>
      <path
        d="M25 12 L30.5 9.5 L28 15"
        stroke="#E3DED6"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M30.5 9.5 L21 19"
        stroke="#E3DED6"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ size = 36, withWordmark = true, className }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 font-product ${className ?? ""}`}>
      <LogoMark size={size} />
      {withWordmark && (
        <span className="leading-tight">
          <span className="block font-semibold text-[15px] tracking-tight" style={{ color: "var(--product-ink)" }}>
            link na bio
          </span>
          <span
            className="block text-[10px] font-semibold uppercase tracking-wider -mt-0.5"
            style={{ color: "var(--product-coral)" }}
          >
            que vende!
          </span>
        </span>
      )}
    </div>
  );
}
