import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";

export function Placeholder({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-creme px-6 text-center">
      <Link to="/">
        <Logo />
      </Link>
      <div>
        <h1 className="font-display text-3xl font-semibold text-tinta sm:text-4xl">{title}</h1>
        <p className="mt-3 text-muted-foreground">{subtitle ?? "Em construção"}</p>
      </div>
      <Link to="/" className="btn-ghost">
        Voltar pra home
      </Link>
    </div>
  );
}
