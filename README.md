# 🧠 Plataforma Inteligente de Gestão de Planos de Aula

Bem-vindo(a) ao repositório do **Plano Aula App**! Esta não é apenas mais uma ferramenta de cadastro, mas sim um verdadeiro **Assistente Pedagógico** focado em produtividade e inovação no ensino. 

A equipe de desenvolvimento percebeu uma dor comum entre professores, conteudistas e coordenadores: *planejar aulas do zero gasta muito tempo e, muitas vezes, ideias criativas de recursos complementares acabam passando despercebidas*. Para resolver isso, construímos uma plataforma que une a organização estrutural de planos de aula ao poder da **Inteligência Artificial (LLMs)**.

---

## 🎯 O que este projeto resolve? (Cenário)

O objetivo principal desta aplicação é **agilizar o fluxo de trabalho educacional**. 

Em vez de o docente gastar horas pesquisando tópicos relacionados, formatando tags de categorias ou caçando referências de livros e links interessantes, ele só precisa fornecer o básico (Título e Disciplina). Com um único clique, o nosso backend se comunica com a API do **Google Gemini (GenAI)**, atuando como um especialista educacional que lê a ementa sugerida e devolve, em segundos:

- 📚 **Resumos e Ementas** perfeitamente estruturadas.
- 💡 **Conteúdos Complementares** para enriquecer a didática.
- 🔗 **Recursos de Apoio Curtos e Diretos** (livros essenciais e links úteis).
- 🏷️ **Tags de Classificação** geradas automaticamente.

---

## ✨ Principais Funcionalidades

### 1. 🤖 Assistente de IA Integrado (A Grande Estrela!)
- **Autopreenchimento Inteligente:** Digite o "Título" e a "Disciplina", e deixe a IA preencher a "Ementa", "Conteúdos Detalhados" e os "Recursos de Apoio".
- **Prompt Engenheirado:** O backend envia instruções estritas (system prompts) para a LLM atuar exclusivamente como um pedagogo, forçando a devolução de dados estruturados em JSON para não quebrar a tela.

### 2. 📝 Gestão Completa (CRUD) de Planos
- Criação, edição e exclusão de planos de aula.
- Suporte a Planos "Avulsos" ou "Atribuídos" a um aluno específico (ótimo para mentorias ou aulas particulares).

### 3. 🔍 Organização e Filtros Avançados
- **Pesquisa em Tempo Real** pelo título da aula.
- **Filtros Combinados:** Busque por tags geradas pela IA, disciplina ou data prevista.
- **Ordenação Inteligente:** Organize da aula mais antiga para a mais nova, ou alfabeticamente.
- Paginação dinâmica para não sobrecarregar a interface.

### 4. 🎨 UI/UX Focada na Experiência do Usuário
- **Feedback Visual Constante:** Loading states, botões bloqueados enquanto a IA "pensa", e transições suaves.
- **Design Clean e Responsivo:** Cores neutras com destaques semânticos (verde para sucesso, vermelho para ações destrutivas) e total responsividade para mobile.

---

## 🛠️ Stack Tecnológica Utilizada

Para garantir um sistema rápido, escalável e com código limpo, utilizamos as tecnologias mais modernas do ecossistema JavaScript/TypeScript:

### No Frontend (Interface que o usuário vê)
* **React + Vite:** Para uma construção super rápida e um desenvolvimento fluído.
* **TailwindCSS:** Estilização utilitária elegante e direto no JSX.
* **React Hook Form + Zod:** Validação de formulários imbatível e fácil manutenção.
* **Lucide React:** Ícones modernos e consistentes.
* **React Router Dom:** Para gerenciar o roteamento das páginas (Listas, Cadastros, Perfis de alunos).

### No Backend (Onde a mágica acontece)
* **Node.js + Fastify:** Escolhemos o Fastify pela sua performance absurda (muito mais rápido que o Express).
* **Prisma ORM:** Para lidar com o banco de dados de forma tipada, segura e muito intuitiva.
* **PostgreSQL:** Banco de dados relacional robusto.
* **`@google/genai` (Gemini 2.5 Flash):** O cérebro por trás das nossas recomendações de conteúdo.

---

---

## 🌟 Diferenciais Implementados (Bônus)
Para entregar um projeto de excelência, fomos além dos requisitos básicos. Aqui estão as escolhas técnicas e funcionais que tornam este projeto especial:

1. **Internacionalização (i18n):** O Frontend possui suporte a múltiplos idiomas nativo, com um `LanguageContext` configurado para trocar entre Português e Inglês em tempo real.
2. **Performance Extrema com Fastify:** No lugar do tradicional Express, utilizamos o Fastify no backend, que é capaz de lidar com requisições HTTP de forma significativamente mais rápida.
3. **Validação de Dados com Zod:** Segurança em primeiro lugar. Em vez de validações manuais, usamos o `Zod` aliado ao `react-hook-form` para garantir que nenhum dado inválido seja enviado ao banco de dados.
4. **Engenharia de Prompt Robusta:** A IA não apenas "gera texto". O prompt enviado ao Gemini foi desenhado para forçar um output exclusivamente em formato JSON, mapeando chaves exatas (como *resumo_gerado* e *sugestoes_conteudo*). Isso previne a quebra do código no lado do cliente.
5. **Debounce na Busca:** Na tela de listagem, ao buscar pelo título, implementamos um *debounce* para não inundar o backend com requisições a cada tecla pressionada.

---

## 🚀 Como rodar o projeto na sua máquina?

Se você quer testar a aplicação localmente, o processo é bem simples. Siga o passo a passo:

### 1. Pré-requisitos
- Ter o **Node.js** instalado (versão 18+ recomendada).
- Ter um banco de dados **PostgreSQL** rodando (você pode usar Docker para isso).
- Obter uma **Chave de API do Google Gemini** (no Google AI Studio).

### 2. Configurando o Backend
Abra o seu terminal e rode:
```bash
# Entre na pasta do backend
cd backend

# Instale as dependências
npm install

# Crie um arquivo .env na raiz da pasta backend e adicione as variáveis:
# DATABASE_URL="postgresql://usuario:senha@localhost:5432/nomedobanco?schema=public"
# GEMINI_API_KEY="Sua_Chave_Aki_1234"
```

Depois, sincronize o banco de dados e rode o servidor:
```bash
npx prisma db push
npm run dev
```
*O backend estará rodando na porta 3333.*

### 3. Configurando o Frontend
Abra outra aba do terminal e rode:
```bash
# Entre na pasta do frontend
cd frontend

# Instale as dependências
npm install

# (Opcional) Crie um .env.local caso precise mudar a URL da API
# VITE_API_URL=http://localhost:3333

# Rode o servidor de desenvolvimento
npm run dev
```
*O frontend estará acessível no seu navegador, geralmente em `http://localhost:5173/`.*

---

## 🤝 Colaboração
Seja bem-vindo a abrir *Issues* ou enviar *Pull Requests*! Toda contribuição para melhorar a engenharia de prompt da IA ou criar novas páginas de relatórios é muito apreciada.

Feito com 💚 para revolucionar a forma como planejamos a educação!
