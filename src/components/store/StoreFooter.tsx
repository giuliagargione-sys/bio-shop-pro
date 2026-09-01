import type { StoreConfig } from "@/types/config";

export function StoreFooter({ config }: { config: StoreConfig }) {
  return (
    <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
      {config.footer.copyText}
    </footer>
  );
}
