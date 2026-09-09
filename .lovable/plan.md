# Assinaturas, planos e acesso — auditoria + melhoria

## O que existe hoje (auditoria)

**Recebimento do pagamento**
- A função `hubla-webhook` recebe os avisos da Hubla, confere o segredo (query `?secret=` ou header) e procura o e-mail dentro do JSON.
- Ela classifica o evento por palavras-chave no nome do evento ("cancel", "paid", "sale"...) e grava:
  - `subscribers` (histórico do pagamento, com o JSON completo);
  - `compradores_ativos` (ativo/inativo — usado por `/bem-vindo` para liberar o cadastro);
  - liga/desliga o link da loja (`store_config.active`).

**Criação da loja**
- A loja NÃO é criada pelo webhook. Ela é criada na primeira vez que a cliente entra no painel (`createMyStore`), uma linha por cliente em `store_config`. Isso continua igual.

**Como o plano é decidido hoje (problema 1)**
- A função `my-plan` decide assim: admin → tudo; senão liberação manual em `plan_overrides`; senão o texto do campo `plan` de `subscribers`, procurando a palavra "pro". Esse campo hoje vem vazio, então quase todo mundo cai em Essencial. O identificador da oferta da Hubla existe no JSON recebido, mas nunca é lido.

**Bloqueio de acesso (problema 2)**
- Só existe ligar/desligar o link público da loja. Não há data de vencimento, não há período pago, não há suspensão com preservação por 30 dias, não há tela de assinatura expirada e o painel não é bloqueado no servidor.
- Não há registro de eventos recebidos (idempotência) nem proteção contra eventos fora de ordem.

**Identificadores reais da Hubla (achados no JSON já recebido, não inventados)**
- Essencial mensal: `iAOkp8rxyHpqSFRI3uMi`
- Essencial anual: `0hREHGC9ZXVNfzBtwwFi`
- PRO mensal: `S4COKdt38PWGnWEHCnWi`
- PRO anual: `t4lUs4AIHqiJ3k05S8FZ`
Atenção: o "id do produto" da Hubla é igual ao id da oferta do Essencial mensal, então o plano será decidido pela OFERTA (`event.products[].offers[].id`), nunca pelo produto nem pelo valor pago. Faltam apenas os links/ofertas VIP (hoje com valor de exemplo no código) — você me passa quando criar.

## O que vou implementar

**Banco (novas tabelas, nada apagado)**
- `plan_mapping`: oferta/produto da Hubla → plano (`essential` / `pro`). Já preenchida com os 4 ids reais acima.
- `subscriptions`: uma linha por cliente com plano, status (`active`/`cancelled`/`expired`/`suspended`), início, fim do período pago, renovação automática, cancelamento, ids da Hubla e `event_version` (para ignorar aviso antigo que chega depois).
- `plan_features`: plano → recurso liberado, refletindo exatamente o que já é PRO hoje (insights com IA, vídeos, botões extras além dos dois padrão) — sem inventar recurso novo.
- `webhook_events`: registro de cada aviso recebido, com o id do evento da Hubla, para nunca processar duas vezes.
- `store_config` ganha `status` (`active`/`suspended`/`archived`) e `backup_until`. Nenhum dado é apagado em nenhum momento.
- Cliente não consegue alterar nada disso: as tabelas novas são somente leitura para ela (e só da própria linha), e a escrita fica com o servidor.

**Webhook (`hubla-webhook`, adaptado, não recriado)**
- Continua aceitando o mesmo segredo e o mesmo formato. Passa a: registrar o evento, ignorar repetido, ler a oferta, mapear o plano, calcular o fim do período pago (data da fatura + ciclo), criar/atualizar a assinatura, reaproveitar a loja existente (nunca criar uma segunda) e manter `compradores_ativos`/`subscribers` como hoje.
- Cancelar a renovação NÃO tira o acesso: marca renovação automática desligada e mantém ativo até o fim do período pago.
- Aviso mais antigo que o estado atual é registrado e descartado.

**Fim do período e 30 dias**
- Uma rotina diária marca assinatura vencida como expirada, coloca a loja em suspensa e define a data limite de recuperação (vencimento + 30 dias). Passados os 30 dias, a loja passa a arquivada — sempre preservando todos os dados.
- Se a cliente pagar dentro dos 30 dias, a mesma loja volta exatamente como estava, com o plano da nova compra (pode trocar de Essencial para PRO e vice-versa).

**Acesso**
- Uma única fonte de verdade (`my-access`, evolução da atual `my-plan`) diz: pode usar, plano, recursos liberados, vencimento e data limite de recuperação. O painel e as funções protegidas do servidor passam a consultar isso — esconder o menu deixa de ser a única barreira.
- Tela nova de acesso suspenso: mostra plano anterior, data de vencimento, data limite de recuperação e botão para reativar. Login continua funcionando; o painel fica bloqueado.

**Painel central (/admin)**
- Cada cliente passa a mostrar plano, status da assinatura, status da loja, início, vencimento, renovação automática, cancelamento, backup até, e os ids da Hubla; com filtros por status e por plano. A liberação manual de PRO continua funcionando.

## Precisarei de você depois
- Os links/ofertas VIP reais (hoje são exemplos no código).
- Confirmar na Hubla que os avisos de cancelamento, falha de pagamento e renovação estão ligados no mesmo endereço já configurado.

## Detalhes técnicos
- Migrations: novas tabelas com GRANT + RLS restritiva; colunas em `store_config`; índices em `hubla_subscription_id`, `hubla_offer_id`, `user_id`, `status`, `backup_until`; unicidade por cliente/assinatura e por `hubla_event_id`.
- Edge Functions: `hubla-webhook` (adaptada), `my-plan` (mantida por compatibilidade, passando a ler `subscriptions`), `my-access` (nova), `admin-list-alunas` (campos de assinatura), `expire-subscriptions` (rotina diária via cron autenticado). Funções protegidas (`ai-insights`, `ai-help`, `admin-support`) passam a checar o acesso.
- Frontend: `usePlan`/novo `useAccess` centralizando permissões, `ProLock` alimentado por `plan_features`, guarda de rota para suspensa, nova página de acesso suspenso, `AdminPage` com filtros.
