# Tarefas em andamento

1. **Puxar repositório GitHub** — `giuliagargione-sys/bio-shop-pro`  
   Status: concluído. O conteúdo do repo é idêntico ao projeto atual; não há nada para mesclar.

2. **Corrigir erros de build/preview**  
   Status: concluído. Adicionado `build:dev` no `package.json`. Build e typecheck passaram (`bun run build` e `bun run build:dev` OK).

3. Arquitetura de assinaturas e acesso (Hubla) — concluído: planos pela oferta real, histórico de assinaturas, vencimento pelo dado da Hubla, cancelamento sem bloqueio imediato, expiração automática diária, loja guardada 30 dias e depois arquivada, my-access como fonte única, tela de reativação e dados no acesso central.
   - Mapear plano pela oferta da Hubla (essential/pro).
   - Assinaturas com histórico, vencimento real, cancelamento sem bloqueio imediato.
   - Expiração → loja suspensa 30 dias → arquivada (sem apagar dados).
   - Fonte única de acesso (`my-access`), idempotência e eventos fora de ordem.
   - Painel central com dados e filtros de assinatura.
   Status: concluído (falta apenas confirmar os nomes dos eventos de cancelamento/renovação com um webhook real da Hubla).
