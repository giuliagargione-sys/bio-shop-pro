import type { StoreConfig } from "@/types/config";

export function StoreFooter({ config }: { config: StoreConfig }) {
  return (
    <footer className="border-t border-border py-7 text-center text-xs sm:text-sm text-muted-foreground">
      <div className="container text-balance">{config.footer.copyText}</div>
    </footer>
  );
}
