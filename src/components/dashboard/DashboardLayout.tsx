import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Palette,
  Type,
  ShoppingBag,
  HelpCircle,
  Phone,
  PanelBottom,
  ExternalLink,
  Store,
  Users,
  LifeBuoy,
  LogOut,
  Cloud,
  CloudOff,
  Loader2,
  ShieldCheck,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/context/AuthContext";
import { useStoreConfig } from "@/context/ConfigContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { HelpChat } from "@/components/dashboard/HelpChat";

export type DashboardSectionKey =
  | "marca"
  | "tema"
  | "hero"
  | "banners"
  | "produtos"
  | "quiz"
  | "leads"
  | "insights"
  | "contato"
  | "ajuda"
  | "rodape";

const NAV_ITEMS: { key: DashboardSectionKey; label: string; icon: ReactNode }[] = [
  { key: "marca", label: "Marca", icon: <Store size={18} /> },
  { key: "tema", label: "Estrutura e visual", icon: <Palette size={18} /> },
  { key: "hero", label: "Capa (topo)", icon: <Type size={18} /> },
  { key: "banners", label: "Banners", icon: <ImageIcon size={18} /> },
  { key: "produtos", label: "Produtos", icon: <ShoppingBag size={18} /> },
  { key: "quiz", label: "Quiz", icon: <HelpCircle size={18} /> },
  { key: "leads", label: "Leads", icon: <Users size={18} /> },
  { key: "insights", label: "Insights com IA", icon: <Sparkles size={18} /> },
  { key: "contato", label: "Contato", icon: <Phone size={18} /> },
  { key: "ajuda", label: "Botões extras", icon: <LifeBuoy size={18} /> },
  { key: "rodape", label: "Rodapé", icon: <PanelBottom size={18} /> },
];

interface DashboardLayoutProps {
  active: DashboardSectionKey;
  onChange: (key: DashboardSectionKey) => void;
  children: ReactNode;
}

function SyncBadge() {
  const { syncStatus } = useStoreConfig();

  const map: Record<string, { icon: ReactNode; label: string; color: string }> = {
    loading: { icon: <Loader2 size={12} className="animate-spin" />, label: "Carregando...", color: "#737373" },
    saving: { icon: <Loader2 size={12} className="animate-spin" />, label: "Salvando...", color: "#737373" },
    synced: { icon: <Cloud size={12} />, label: "Salvo na nuvem", color: "#1a9c5b" },
    error: { icon: <CloudOff size={12} />, label: "Não foi possível salvar", color: "#c0392b" },
  };
  const state = map[syncStatus];

  return (
    <span className="flex items-center gap-1 text-[11px]" style={{ color: state.color }}>
      {state.icon}
      {state.label}
    </span>
  );
}

export function DashboardLayout({ active, onChange, children }: DashboardLayoutProps) {
  const { signOut } = useAuth();
  const { slug } = useStoreConfig();
  const { isAdmin } = useIsAdmin();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-muted">
      <aside className="md:w-60 shrink-0 bg-white border-b md:border-b-0 md:border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <Logo size={30} />
          <div className="mt-2">
            <SyncBadge />
          </div>
        </div>
        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible p-2 gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm text-left transition-colors",
                active === item.key
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-foreground/80"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border mt-2 space-y-2">
          <Link
            to={slug ? `/${slug}` : "#"}
            target="_blank"
            aria-disabled={!slug}
            className={cn(
              "flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm",
              slug ? "hover:bg-muted" : "opacity-50 pointer-events-none"
            )}
          >
            <ExternalLink size={16} />
            Ver minha loja
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
              style={{ color: "var(--product-coral-dark)" }}
            >
              <ShieldCheck size={16} />
              Acesso central
            </Link>
          )}
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-8 max-w-2xl">{children}</main>
      <HelpChat />
    </div>
  );
}
