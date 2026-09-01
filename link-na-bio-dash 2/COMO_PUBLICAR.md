# Como colocar o "Link Na Bio Que Vende!" no ar (Lovable + Supabase)

Um ponto importante antes de começar: **o Lovable não tem um botão de
"importar projeto pronto"** — ele só permite o caminho contrário (exportar
um projeto criado nele para o GitHub). Então, pra usar este código que eu
já construí, o caminho é usar o GitHub como ponte. Não é complicado, é só
diferente do que eu tinha dado a entender antes — me desculpe por isso.
Abaixo está o passo a passo completo, do jeito mais simples que existe
(sem precisar instalar nada no computador).

## 1. Colocar o código no GitHub (a "ponte" pro Lovable)

Isso só precisa ser feito **uma vez**. Depois disso, você edita tudo
direto pelo chat do Lovable normalmente. Vai levar uns 10-15 minutos na
primeira vez.

### 1.1. Preparar os arquivos no seu computador

1. Ache o arquivo `link-na-bio-dash.zip` que eu te mandei (provavelmente
   na pasta de Downloads).
2. Descompacte ele: no Windows, clique com o botão direito nele →
   **"Extrair tudo"**. No Mac, dê **dois cliques** nele. Isso cria uma
   pasta chamada `link-na-bio-dash`.
3. Abra essa pasta e confirme que tem várias coisas dentro (pastas
   `src`, `supabase`, arquivos `README.md`, `package.json`, etc.) —
   deixe essa janela aberta, você vai usar ela daqui a pouco.
4. **Atenção**: dentro tem um arquivo chamado `.gitignore` (começa com
   ponto) que às vezes fica escondido. Pra garantir que ele apareça:
   - **Mac**: com a pasta aberta no Finder, aperte `Cmd + Shift + .`
     (ponto).
   - **Windows**: no Explorador de Arquivos, vá na aba **Exibir** →
     marque **"Itens ocultos"**.

### 1.2. Criar sua conta no GitHub (se ainda não tiver)

Vá em [github.com/signup](https://github.com/signup) e crie uma conta
grátis (só pede e-mail, nome de usuário e senha). Confirme o e-mail que
eles mandarem.

### 1.3. Criar um projeto "molde" no Lovable e conectar ao GitHub

1. No [lovable.dev](https://lovable.dev), crie **um projeto novo
   qualquer** — pode digitar um prompt bem simples tipo "crie uma página
   em branco escrito Olá". Não importa o resultado, é só pra existir um
   projeto pra gente conectar.
2. Dentro desse projeto, abra **Project Settings** (ou o menu **`+`** no
   canto do chat) → aba **Git** → **GitHub**.
3. Na seção de contas/workspace, clique em **Connect** e autorize o
   Lovable a acessar sua conta do GitHub (vai abrir uma tela do próprio
   GitHub pedindo confirmação — pode aceitar).
4. Pronto: o Lovable cria sozinho um **repositório novo e privado** no
   seu GitHub (ninguém mais vê o código) com um nome parecido com o do
   seu projeto, e já deixa os dois lados "conversando" — qualquer coisa
   que mudar no GitHub, o Lovable puxa sozinho a partir de agora.

### 1.4. Abrir esse repositório no editor do navegador (github.dev)

1. No Lovable, dentro da mesma tela de Git/GitHub, clique no link do
   repositório (ou vá em [github.com](https://github.com), clique no seu
   avatar no canto superior direito → **Your repositories**, e ache o
   que acabou de ser criado).
2. Com a página do repositório aberta no navegador, **aperte a tecla
   `.`** (ponto) no teclado — não precisa clicar em nada antes, só a
   página do repo estar em foco. Isso troca a página pra um editor
   completo (parecido com o VS Code), rodando dentro do próprio
   navegador, sem instalar nada. (Se preferir, também funciona trocar
   `github.com` por `github.dev` direto na barra de endereço.)

### 1.5. Apagar os arquivos de exemplo

1. Do lado esquerdo desse editor tem uma lista de arquivos (o
   "Explorer"). Clique no primeiro item da lista.
2. Segure **Shift** e clique no último item — isso seleciona tudo de
   uma vez.
3. Clique com o **botão direito** em cima da seleção → **Delete** (ou
   aperte a tecla Delete) → confirme. A lista fica vazia.

### 1.6. Colocar os arquivos do projeto

1. Volte pra janela do seu computador onde você descompactou o zip
   (passo 1.1) — deixe as duas janelas visíveis ao mesmo tempo, se der
   (arrasta uma pro lado da tela).
2. Dentro da pasta `link-na-bio-dash`, **selecione tudo que está
   dentro dela** (todos os arquivos e pastas — `src`, `supabase`,
   `package.json`, `README.md`, `.gitignore`, tudo): clique no primeiro
   item e aperte `Ctrl+A` (Windows) ou `Cmd+A` (Mac).
3. **Arraste** essa seleção inteira e solte em cima do painel Explorer
   (vazio) do editor no navegador. Espera uns segundos — ele sobe todos
   os arquivos e recria as pastas certinho.
4. Confira se apareceram as pastas `src`, `supabase`, `public` e os
   arquivos soltos como `package.json`, `README.md`, `COMO_PUBLICAR.md`.

### 1.7. Enviar (commit + push) pro GitHub

1. Na barra lateral esquerda desse editor, clique no ícone de
   **Source Control** (parece um "Y" ramificado — é o terceiro ou quarto
   ícone de cima pra baixo).
2. Vai aparecer uma lista enorme de mudanças (é normal, é o projeto
   inteiro entrando de uma vez). Numa caixinha de texto no topo, escreva
   uma mensagem qualquer, tipo `primeira versão`.
3. Clique no botão **✓ Commit** (às vezes aparece como "Commit & Push"
   direto).
4. Se não tiver feito o push automático, vai aparecer um botão **Sync
   Changes** ou **Push** — clique nele.

### 1.8. Conferir no Lovable

Volte pra aba do Lovable. Em alguns segundos (às vezes até 1-2 minutos)
ele detecta a mudança no GitHub e reconstrói o preview sozinho — a partir
daqui, o projeto no Lovable **é** exatamente este código. Se demorar
muito ou aparecer erro, me manda print que eu te ajudo a resolver.

> **Alternativa pra quem já usa terminal/git no computador**: o processo
> é o mesmo, só que local — `git clone` do repositório que o Lovable
> criou, apagar os arquivos antigos (mantendo a pasta `.git`), copiar os
> arquivos do zip pra dentro, e `git add . && git commit -m "primeira
> versão" && git push`.

## 2. Conectar o Supabase (banco de dados + login)

Sem isso, o app abre no visual, mas cadastro, login, leads, IA de ajuda e
o painel `/admin` ficam desligados.

1. No Lovable, dentro do projeto: **Configurações/Settings → Supabase**
   (ou o ícone do Supabase no topo do chat) → **Connect Supabase** →
   escolha "criar novo projeto" (ou conecte um que você já tenha). O
   Lovable configura as variáveis de ambiente sozinho, não precisa copiar
   chave nenhuma manualmente.
2. Isso abre (ou te dá um link pra) o painel do Supabase. Lá, no menu
   lateral, ache **SQL Editor** → **New query**. Cole o conteúdo de cada
   arquivo abaixo, um de cada vez, **nessa ordem exata**, e clique em
   **Run** depois de colar cada um (os arquivos estão dentro da pasta
   `supabase/migrations` do projeto):
   1. `0001_init.sql`
   2. `0002_multi_tenant.sql`
   3. `0003_admin_and_billing.sql`
3. Publique as 5 Edge Functions (arquivos dentro de
   `supabase/functions/<nome>/index.ts`). Pelo painel do Supabase: menu
   lateral **Edge Functions** → **Deploy a new function** → dá o mesmo
   nome da pasta → cole o conteúdo do `index.ts` correspondente:
   - `fetch-product-preview`
   - `admin-list-alunas`
   - `admin-create-aluna`
   - `ai-help`
   - `hubla-webhook` (nas opções dessa função, marque **"No JWT
     verification"** — porque quem chama ela é a Hubla, não uma aluna
     logada)

   (Se preferir usar terminal com a [Supabase CLI](https://supabase.com/docs/guides/cli):
   `supabase functions deploy <nome-da-pasta>`, e pra hubla-webhook
   adicione `--no-verify-jwt` no final do comando.)

## 3. Criar sua conta de acesso central

1. Recarregue o app publicado, abra `/login` e crie **a sua própria
   conta** (é ela que vai virar o acesso central).
2. No SQL Editor do Supabase, rode (trocando pelo seu e-mail):
   ```sql
   update profiles set is_admin = true where email = 'seu-email-aqui@gmail.com';
   ```
3. Recarregue o app logada — o link **"Acesso central"** aparece na sua
   dashboard, levando pra `/admin`.

## 4. Ligar a IA de ajuda (opcional, recomendado)

1. Crie uma chave em [console.anthropic.com](https://console.anthropic.com)
   (Settings → API Keys).
2. No Supabase: **Edge Functions → Secrets** → adicione
   `ANTHROPIC_API_KEY` com essa chave.

Sem isso, o botão de Ajuda continua abrindo normalmente, só avisa que a IA
ainda não foi ligada.

## 5. Ligar o checkout da Hubla

1. Crie as ofertas/planos na Hubla e pegue os links de checkout direto.
2. No código, troque em `src/pages/LandingPage.tsx`:
   - `HUBLA_CHECKOUT_LINKS` pelos links reais de cada plano;
   - o array `PLANS` pelos nomes/preços reais.
3. Se a Hubla tiver opção de redirecionamento pós-compra, aponte pra
   `/login?mode=signup&plan=essencial` (troque `essencial` pelo slug do
   plano) — assim a pessoa já cai criando a conta.

## 6. (Quando quiser) Ligar o espelho de pagamento adimplente/inadimplente

Detalhado no `README.md`, seção "Espelhar adimplente/inadimplente da
Hubla" — resumindo: gera um segredo, salva como `HUBLA_WEBHOOK_SECRET`
nas secrets do Supabase, configura o webhook na Hubla apontando pra
`.../hubla-webhook?secret=SEU_SEGREDO`, dispara um evento de teste e me
manda o que aparecer nos Logs da função pra eu confirmar os nomes de
campo certos.

## 7. Testar a segurança antes de divulgar

1. Crie duas contas de teste (`teste-a@...`, `teste-b@...`).
2. Logada como `teste-a`, personalize a loja dela, entre num lead de
   teste.
3. Logada como `teste-b`, confirme que **não aparece nada** da loja/leads
   da `teste-a` em lugar nenhum da dashboard dela.
4. Ainda como `teste-b` (conta comum), tente abrir `/admin` direto pela
   URL — tem que te jogar de volta pra `/personalizar`.
5. Abra `/loja/slug-da-teste-a` numa aba anônima (sem estar logada) —
   tem que abrir normalmente (a loja pública não precisa de login).

## 8. Publicar de vez

No Lovable: **Publish** → conectar seu domínio próprio (ex:
`linknabioquevende.com.br`) ou usar o domínio `*.lovable.app` gerado. É
esse link final que vai em `/login` (pra você e pras alunas) e no link da
bio de cada uma (`seudominio.com/loja/nome-dela`).
