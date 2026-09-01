# Bio Shop Pro

Crie um app chamado "Link Na Bio Que Vende!" em React + Tailwind (use

react-router-dom pras rotas). É uma landing page de um produto SaaS pra

lojistas de moda venderem pelo link da bio do Instagram.

IDENTIDADE VISUAL:

- Cores: coral #FF4D6D, coral escuro #E23A57, ameixa #3D1F4D, tinta

  #221226 (quase preto), dourado #FFC857, creme #FFF7F2 (fundo)

- Tipografia: "Fredoka" pros títulos (arredondada, amigável), "Inter" pro

  texto (importe do Google Fonts)

- Logo: um ícone simples de elo de corrente (link) com uma seta dourada,

  ao lado do texto "Link Na Bio Que Vende"

ROTAS (crie a estrutura, mesmo que as outras fiquem só com um texto

"em construção" por enquanto):

- "/" → a landing page (descrita abaixo)

- "/loja/:slug" → placeholder

- "/login" → placeholder

- "/personalizar" → placeholder

- "/admin" → placeholder

A LANDING PAGE ("/"), nessa ordem:

1. Menu fixo no topo: logo à esquerda; à direita botão "Entrar" (vai pra

   /login) e botão "Ver planos" (âncora pra seção de planos)

2. Hero: badge pequeno "Pra quem vende pelo Instagram", título grande "O

   link da bio que também vende por você", subtítulo "Uma loja, um quiz

   que gera leads e uma dashboard fácil de mexer — tudo no único link que

   cabe na sua bio do Instagram.", dois botões: "Ver planos" e "Já sou

   aluna — entrar"

3. Seção "Como funciona": 4 cards em grid 2x2, cada um com ícone, título

   e texto curto:

   - "Um link, uma loja" — Cole um único link na bio do Instagram e

     transforme ele numa loja de verdade

   - "Quiz que vira venda" — Um quiz de estilo guia a cliente até o look

     ideal e captura o contato dela no processo

   - "Leads organizados" — Cada resposta do quiz vira um lead na sua

     dashboard, com WhatsApp pronto pra chamar

   - "Sua cara, sem precisar programar" — Cores, fonte, produtos, tudo

     editável numa dashboard simples

4. Seção de planos (id "planos"): 2 cards lado a lado — "Essencial" (R$

   47/mês) e "Que Vende" (R$ 97/mês, destacado visualmente como "Mais

   escolhido"), cada um com uma lista de 3-4 benefícios e um botão

   "Escolher [nome do plano]" (por enquanto sem link real, deixe como

   "#")

5. CTA final com fundo escuro (gradiente ameixa → tinta), título "Sua

   loja no link da bio pode começar a vender hoje" e botão "Ver planos"

6. Rodapé simples com copyright e um link "Falar com a gente"

Deixe tudo responsivo (funcionando bem no celular) e com boa hierarquia

visual — nada de bloco genérico, quero que pareça uma landing page de

produto de verdade, bonita e profissional.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2ebd9515-9246-4297-970b-a0710b7ff0a9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
