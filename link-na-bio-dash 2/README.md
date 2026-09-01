# Link Na Bio Que Vende

Um único app onde várias alunas se cadastram, cada uma com a própria loja
(link na bio), quiz de estilo, captura de leads e dashboard de
personalização — protegida por login. Pronto pra rodar no
[Lovable](https://lovable.dev).

Feito em **React + Vite + TypeScript + Tailwind CSS** (stack nativo do
Lovable) com **Supabase** como backend (banco de dados + login) e
checkout pela **Hubla**.

👉 Pra publicar isso de verdade (Lovable + Supabase, passo a passo do
zero), veja **[`COMO_PUBLICAR.md`](./COMO_PUBLICAR.md)**.

## O que tem aqui

- **`/`** — a landing page do produto: o que é, como funciona, planos (com
  botão "Ver planos" que leva pro checkout da Hubla) e "Entrar" pra quem
  já é aluna.
- **`/loja/:slug`** — a loja pública de uma aluna (esse é o link que vai
  na bio do Instagram dela): capa, carrossel de produtos, quiz de estilo
  (termina capturando nome + WhatsApp da cliente como lead), botões de
  **Dúvidas? Fale com a gente** e **Trocas e devoluções**, rodapé. Cada
  aluna tem o próprio endereço (`/loja/nome-dela`), editável na dashboard.
- **`/personalizar`** — a dashboard da aluna logada, **protegida por
  login**. De lá dá pra editar: o endereço da loja, marca (nome/logo),
  cores e fonte, capa, produtos em destaque, o quiz, os **leads** que
  chegaram (com botão de "Entrar em contato" pra cada um), WhatsApp/redes
  sociais, os dois links de dúvidas/trocas, rodapé, exportar/importar um
  backup em `.json`. Tem um botão flutuante de **Ajuda** (chat com IA) pra
  ela tirar dúvidas de como personalizar sem precisar te chamar.
- **`/login`** — criar conta ou entrar (e-mail + senha).
- **`/admin`** — seu **acesso central**, só pra você: lista todas as
  alunas/lojas criadas, endereço de cada uma, status de pagamento
  (adimplente/inadimplente, quando a Hubla estiver espelhando) e um lugar
  pra você mesma criar o login de uma aluna manualmente. Só entra quem
  estiver marcado como admin (veja abaixo como se marcar).

## Como funciona o multi-conta

Cada aluna que cria conta ganha automaticamente **a própria loja** — na
primeira vez que ela entra em `/personalizar`, o app cria uma linha só
dela na tabela `store_config`, com um endereço (`slug`) gerado a partir do
e-mail (ela pode trocar depois, na aba Marca). Os leads que a loja dela
captura (`leads`) também ficam presos a essa conta — cada aluna só vê os
próprios, mesmo estando todas no mesmo aplicativo/banco de dados. Isso é
garantido pelas regras de segurança (RLS) do Supabase, não só pela
interface — então mesmo alguém tentando acessar direto pela API não
consegue ver o que não é dela.

## Segurança: o que impede uma aluna de ver ou alterar dados de outra

Isso não depende só da interface (o que apareceria ou não na tela) — é
garantido em duas camadas que continuam valendo mesmo que alguém tente
burlar a tela e chamar a API do Supabase diretamente:

1. **Login (Supabase Auth)** — senha nunca fica em texto puro (hash
   bcrypt), sessão por token (JWT) com expiração. `/personalizar` e
   `/admin` redirecionam pra `/login` sem sessão válida. Isso é a "porta
   da frente", mas sozinha não seria suficiente — por isso a camada 2.
2. **Row Level Security (RLS) no banco de dados** — a regra que realmente
   não tem como burlar, porque roda dentro do Postgres, não no código do
   app:
   - `store_config` (a loja de cada aluna): qualquer pessoa pode **ler**
     (a loja pública precisa abrir sem login), mas **escrever** só é
     permitido quando `auth.uid()` (quem está logada) é dona daquela
     linha. Uma aluna literalmente não consegue mandar uma alteração pra
     loja de outra — o banco recusa antes de gravar qualquer coisa,
     mesmo que a pessoa tente pela API direto (fora da tela).
   - `leads`: inserção é aberta (a cliente final que responde o quiz não
     loga), mas leitura e atualização só pra dona da loja
     (`auth.uid() = store_user_id`). Uma aluna não vê leads de outra.
   - `profiles` (quem é admin): cada uma só lê a própria linha. Não
     existe nenhuma forma de uma conta se autopromover a admin pelo
     app — só muda via SQL Editor (você) ou service role.
   - `subscribers` (status de pagamento da Hubla): RLS ligado **sem
     nenhuma política de acesso** — ou seja, acesso zero por qualquer
     conta comum, nem a própria dona lê isso direto. Só as Edge Functions
     enxergam essa tabela.
3. **As rotas que veem "todo mundo" (o `/admin`) nunca rodam no
   navegador** — ficam em Edge Functions no servidor
   (`admin-list-alunas`, `admin-create-aluna`), que conferem se quem
   chamou tem `is_admin = true` antes de responder qualquer coisa. Se uma
   aluna comum tentar chamar essas funções direto (inspecionando o
   código), recebe erro 403. A chave "mestra" do Supabase (que ignora
   RLS) só existe dentro dessas funções — nunca no código que roda no
   navegador de ninguém.

Sobre **"layout alterado sozinho"**: o autosave da dashboard sempre grava
filtrado pela conta logada (reforçado pelo RLS, não só pelo código), então
não tem caminho pra a edição de uma aluna vazar pra loja de outra. O único
cenário realista de sobrescrita é a **mesma** aluna editando em duas abas
ou dois aparelhos ao mesmo tempo — aí vale "quem salvou por último" (isso
é comportamento normal de autosave, não uma falha de segurança).

**O que eu não consegui testar nesta sessão**: este sandbox não tem um
projeto Supabase real conectado, então não rodei uma chamada de API de
verdade simulando um ataque — as regras seguem exatamente o modelo de RLS
documentado pelo próprio Supabase (é o mecanismo padrão que produtos
sérios usam pra isolar dados por usuário), mas o ideal é você confirmar na
prática depois de publicar. Tem um roteiro de teste rápido no passo 7 do
`COMO_PUBLICAR.md`.

## Antes de publicar: conectar o Supabase

Sem isso, o app abre no visual, mas cadastro, login, leads e a busca
automática de produto por link ficam desligados.

1. No Lovable, vá em **Configurações → Supabase** e conecte (ou crie) um
   projeto Supabase pra este app. O Lovable cuida de configurar as
   variáveis de ambiente sozinho.
2. Abra o **SQL Editor** do Supabase e rode, **nessa ordem**:
   1. `supabase/migrations/0001_init.sql`
   2. `supabase/migrations/0002_multi_tenant.sql`
   3. `supabase/migrations/0003_admin_and_billing.sql`
3. Publique as Edge Functions:
   ```bash
   supabase functions deploy fetch-product-preview
   supabase functions deploy admin-list-alunas
   supabase functions deploy admin-create-aluna
   supabase functions deploy ai-help
   supabase functions deploy hubla-webhook --no-verify-jwt
   ```
   (precisa da [Supabase CLI](https://supabase.com/docs/guides/cli), ou
   use a interface do Lovable/Supabase em Edge Functions. Repare que
   `hubla-webhook` leva a flag `--no-verify-jwt` — é a Hubla chamando, não
   uma usuária logada.)
4. Recarregue o app, abra `/login` e crie a primeira conta de teste — essa
   vai ser a **sua** conta de acesso central. Depois, no SQL Editor, rode:
   ```sql
   update profiles set is_admin = true where email = 'seu-email-aqui@gmail.com';
   ```
   Recarregue o app e o link "Acesso central" aparece na sua dashboard,
   levando pra `/admin`.

Se os nomes das variáveis de ambiente vierem diferentes depois de conectar
(o Lovable às vezes muda isso entre versões), ajuste em
`src/lib/supabaseClient.ts` — só duas linhas.

## Checkout com a Hubla

Os botões "Escolher [plano]" na landing page (`src/pages/LandingPage.tsx`,
constante `HUBLA_CHECKOUT_LINKS`) apontam direto pro link de checkout da
Hubla — **troque pelos links reais** das suas ofertas assim que criar cada
uma lá.

Pontos pra você confirmar direto na Hubla (a documentação pública deles
não deixou isso 100% claro pra eu confirmar daqui):

- **Redirecionamento após a compra**: procure, na configuração da oferta/
  checkout, uma opção de URL de redirecionamento ou página de
  agradecimento — aponte pra `/login?mode=signup&plan=essencial` (troque
  `essencial` pelo slug do plano) pra pessoa já cair criando a conta logo
  depois de pagar. Se não achar essa opção, dá pra usar a página de
  obrigado padrão da Hubla mesmo, com um link/botão manual pra
  `seusite.com/login?mode=signup`.
- **Liberar o acesso automaticamente só pra quem pagou**: hoje, qualquer
  pessoa que crie uma conta em `/login` ganha acesso à dashboard (mesmo
  sem ter passado pelo checkout). Como alternativa a deixar aberto, use o
  **acesso central (`/admin`)** pra criar você mesma o login de cada aluna
  depois de confirmar o pagamento — assim ninguém entra sem você liberar.

## Espelhar adimplente/inadimplente da Hubla no painel `/admin`

Já preparei a tabela e a função que recebem isso (`subscribers` +
`supabase/functions/hubla-webhook`), mas **ainda não testei com um evento
real da Hubla** — a documentação pública deles não deixa claro o formato
exato do payload, então a função tenta adivinhar de forma defensiva (não
quebra se algum campo não existir do jeito esperado).

Pra ligar de verdade:

1. Na Hubla: **Integrações → Webhooks → Ativar**, gere o token de
   autenticação deles e configure a URL:
   ```
   https://SEU-PROJETO.supabase.co/functions/v1/hubla-webhook?secret=SEU_SEGREDO
   ```
   (o `SEU_SEGREDO` é inventado por você — cole o mesmo valor na secret
   `HUBLA_WEBHOOK_SECRET` das Edge Functions do Supabase. Isso impede
   qualquer pessoa de chamar essa URL e inventar status de pagamento.)
2. Ative os eventos de **Subscription** (assinatura) e **Invoice**
   (fatura) — são esses que carregam pagamento aprovado, atrasado e
   cancelado.
3. Dispare um evento de teste (a Hubla deixa simular com dados fake) e
   confira em **Supabase → Edge Functions → hubla-webhook → Logs** o que
   chegou. Me manda esse conteúdo que eu ajusto os nomes de campo exatos
   em `classify()` e `dig()` dentro da função — hoje ela tenta reconhecer
   os formatos mais comuns, mas o certo é confirmar com um evento real.
4. Depois de confirmado, o `/admin` passa a mostrar "Adimplente" /
   "Inadimplente" / "Cancelado" automaticamente pra cada aluna, casando
   pelo e-mail.

## IA de ajuda na dashboard

O botão flutuante "Ajuda" dentro de `/personalizar` abre um chat que usa a
API da Anthropic (Claude) pra responder dúvidas sobre como personalizar a
loja (a assistente só sabe sobre o app — não é um chat genérico).

1. Pegue uma chave em [console.anthropic.com](https://console.anthropic.com)
   (Settings → API Keys).
2. Adicione como secret `ANTHROPIC_API_KEY` nas Edge Functions do
   Supabase.
3. Publique a função (já está no passo 3 lá em cima): `ai-help`.

Sem a chave configurada, o chat continua abrindo normalmente, só que avisa
que a IA ainda não foi ligada, em vez de quebrar.

## Acesso central (`/admin`) — só pra você

Depois de se marcar como admin (passo 4 da instalação), você vê um link
"Acesso central" na sua própria dashboard, levando pra `/admin`, com:

- **Todas as lojas criadas**: nome da loja, e-mail da aluna, endereço
  (`/loja/...`), data de criação e status de pagamento.
- **Criar login de aluna manualmente**: já que a criação de conta não é
  automática pelo pagamento ainda, você digita o e-mail dela ali, o app
  gera uma senha provisória e mostra pra você copiar e mandar por
  WhatsApp — sem precisar que ela mesma se cadastre em `/login`. (O
  cadastro público em `/login` continua funcionando em paralelo, se você
  preferir deixar autoatendimento pra algum plano.)
- **Status de pagamento**: aparece "sem info de pagamento" até você ligar
  o webhook da Hubla (seção acima).

Essa página só é visível pra contas marcadas `is_admin = true` na tabela
`profiles` — nenhuma aluna comum consegue acessar `/admin` nem ver dados
de outras lojas, mesmo tentando pela URL direto (a função que lista todo
mundo confere isso do lado do servidor antes de responder).

## Como isso funciona por trás

- **Loja de cada aluna**: schema único (`src/types/config.ts`) descreve
  tudo que é personalizável. `ConfigContext`
  (`src/context/ConfigContext.tsx`, só carregado dentro de
  `/personalizar`) busca/salva a loja da aluna logada na tabela
  `store_config` (uma linha por `user_id`), com debounce, e aplica
  cores/fonte como variáveis CSS em tempo real. A loja pública
  (`/loja/:slug`) usa `src/hooks/usePublicStore.ts`, que busca só leitura
  pelo endereço (`slug`), sem precisar de login.
- **Leads**: ao terminar o quiz em `/loja/:slug`, a cliente deixa nome e
  WhatsApp; isso vai pra tabela `leads`, marcado com a dona da loja
  (`store_user_id`). Cada aluna só vê os próprios na aba Leads.
- **Login**: Supabase Auth (e-mail/senha) — mais seguro do que uma senha
  fixa escrita no código.
- **Busca automática de produto**: Edge Function `fetch-product-preview`
  busca o link do lado do servidor e lê título/imagem (tags Open Graph).

## Identidade visual

- **Cores do produto** (landing page, login, barra lateral da dashboard):
  coral `#FF4D6D`, ameixa `#3D1F4D`, tinta `#221226`, dourado `#FFC857`,
  creme `#FFF7F2` — definidas em `src/index.css` como `--product-*`.
  Diferente das cores `--brand-*` que cada aluna escolhe pra loja dela.
- **Fonte do produto**: Fredoka (títulos) + Inter (textos).
- Logo em `src/components/brand/Logo.tsx` (SVG, sem depender de arquivo de
  imagem).

## Rodando localmente

```bash
npm install
npm run dev
```

## Limitações desta sessão

- Não foi possível rodar `npm install` / `npm run build` neste ambiente (a
  rede daqui bloqueia o registro do npm), nem testar as chamadas reais ao
  Supabase/Hubla/Anthropic (não há projetos provisionados aqui). Código
  revisado manualmente, arquivo por arquivo.
- O espelhamento adimplente/inadimplente da Hubla (tabela `subscribers` +
  função `hubla-webhook`) está pronto na estrutura, mas **não validado**
  com um evento real da Hubla — veja a seção "Espelhar adimplente/
  inadimplente da Hubla" pra ativar e me mandar o payload real assim que
  puder, pra eu confirmar os nomes de campo certos.
- A criação manual de aluna (`/admin`) gera senha provisória e mostra na
  tela pra você copiar — não manda e-mail automático (evita depender de
  configurar SMTP no Supabase). Se preferir enviar convite por e-mail no
  lugar disso no futuro, dá pra trocar pela função `inviteUserByEmail` do
  Supabase.
- Os preços e nomes dos planos em `/` são só exemplo — troque no array
  `PLANS` de `src/pages/LandingPage.tsx`.
