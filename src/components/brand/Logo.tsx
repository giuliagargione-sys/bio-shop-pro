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
          <stop offset="1" stopColor="#3E1019" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#lnbqv-bg)" />
      {/* Elo esquerdo da corrente */}
      <rect
        x="9"
        y="14"
        width="13"
        height="11"
        rx="5.5"
        transform="rotate(-45 15.5 19.5)"
        stroke="white"
        strokeWidth="2.6"
        fill="none"
      />
      {/* Elo direito da corrente */}
      <rect
        x="18"
        y="14"
        width="13"
        height="11"
        rx="5.5"
        transform="rotate(-45 24.5 19.5)"
        stroke="white"
        strokeWidth="2.6"
        fill="none"
      />
      {/* Seta de crescimento dourada */}
      <path
        d="M24 11 L31 8 L28.5 15"
        stroke="#C9A84C"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M31 8 L21 18"
        stroke="#C9A84C"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ size = 36, withWordmark = true, className }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <LogoMark size={size} />
      {withWordmark && (
        <span className="leading-[1.05] flex flex-col">
          <span
            className="font-product font-semibold text-[15px] tracking-[-0.01em]"
            style={{ color: "var(--product-ink)" }}
          >
            link na bio
          </span>
          <span
            className="font-body text-[10px] font-bold uppercase tracking-[0.22em] -mt-0.5"
            style={{ color: "var(--product-coral)" }}
          >
            que vende!
          </span>
        </span>
      )}
    </div>
  );
}
