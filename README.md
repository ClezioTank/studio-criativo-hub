# Studio Criativo Hub

Crie o StudioOS, um MVP SaaS em português para designers, editores de vídeo, video makers e pequenas agências criativas.

OBJETIVO DO MVP
O StudioOS é um workspace simples para organizar clientes, projetos, propostas e tarefas em um único lugar. Não construir um CRM/ERP gigante. Priorizar simplicidade, boa UX mobile-first e funcionalidade real.

STACK E ARQUITETURA
- Use o stack padrão full-stack do Lovable.
- Use autenticação real.
- Use PostgreSQL/Supabase para persistência.
- Estruture autorização no backend/RLS; nunca confie apenas no frontend para permissões.
- Prepare a arquitetura para internacionalização futura, mas a interface inicial deve ser somente Português.
- Prepare billing para Paddle, mas NÃO implemente checkout Paddle ainda.
- Deve existir alternativa de pagamento manual que o administrador possa ativar.
- Moedas suportadas nos dados: Kz, BRL, USD, EUR.

PÚBLICO
Designers, editores de vídeo, video makers, freelancers criativos, pequenas agências de design e vídeo/marketing.

ÁREA DO USUÁRIO
Rotas/páginas:
- /login
- /signup
- /onboarding
- /dashboard
- /clients
- /projects
- /proposals
- /tasks
- /feedback
- /billing
- /settings

Dashboard:
- projetos ativos
- clientes
- propostas pendentes
- tarefas abertas
- valor a receber
- projetos recentes
- próximas tarefas
- CTA para novo projeto

CLIENTES
CRUD completo:
- nome
- empresa
- email
- WhatsApp
- observações
- created_at
Página individual com dados, projetos, propostas e histórico.

PROJETOS
CRUD completo:
- nome
- cliente
- descrição
- valor
- moeda
- data de início
- prazo
- status
Status: Planejamento, Aguardando cliente, Em andamento, Em revisão, Entregue, Concluído, Cancelado.
Página individual com abas Visão geral, Tarefas, Proposta, Atividade.

TAREFAS
CRUD:
- título
- descrição
- prazo
- status: A fazer, Em andamento, Concluída
- prioridade: Baixa, Normal, Alta
Relacionadas a projetos.

PROPOSTAS
CRUD:
- cliente
- título
- descrição
- itens/serviços
- valor
- moeda
- prazo de entrega
- validade
- observações
Status: Rascunho, Enviada, Aceita, Recusada, Alteração solicitada.
Criar página pública compartilhável sem login para visualizar a proposta e permitir registrar Aceitar, Recusar ou Solicitar alteração. Não implementar assinatura eletrônica.

FEEDBACK
Formulário dentro do app:
- tipo: Bug, Sugestão, Dificuldade, Outro
- mensagem
Enviar para área administrativa.

BILLING
Mostrar plano atual e status.
Preparar estrutura de dados para payment_source: paddle/manual e subscription_status.
Botões/CTAs:
- Assinar agora
- Falar conosco pelo WhatsApp
Não implementar integração Paddle ainda; apenas deixar arquitetura limpa para adicionar depois.

ADMIN
Criar /admin e subrotas:
- /admin
- /admin/users
- /admin/payments
- /admin/feedback
- /admin/activity
- /admin/settings

Somente usuários com role=admin podem acessar.

Admin Dashboard:
- total de usuários
- usuários ativos
- usuários pagos
- testers/beta
- feedbacks
- MRR calculado a partir de pagamentos ativos reais, sem números hardcoded

Admin Users:
- listar usuários
- buscar/filtrar
- ver detalhes
- ativar/desativar
- alterar plano
- marcar pagamento manual
- alterar status de assinatura
- adicionar observação administrativa
- ver atividade

Admin Payments:
- usuário
- valor
- moeda
- método: Paddle ou Manual
- status: Pago, Pendente, Cancelado
- data
- referência opcional

Admin Feedback:
- listar feedbacks
- filtros
- status: Novo, Em análise, Resolvido
- nota interna opcional

Admin Activity:
Registrar eventos relevantes como cadastro, criação de cliente/projeto/proposta, feedback e alteração de pagamento/plano.

MODELO DE DADOS
Criar tabelas adequadas para:
- profiles/users
- studios
- clients
- projects
- tasks
- proposals
- proposal_items
- feedback
- payments
- activity_logs

Cada dado de usuário deve ser isolado por studio_id/owner conforme apropriado.
Usuário comum só pode acessar os próprios dados.
Admin tem acesso administrativo conforme políticas seguras.
Criar RLS/policies apropriadas.

ONBOARDING
Após cadastro:
1. Boas-vindas
2. selecionar tipo: Designer, Editor de vídeo, Video Maker, Agência, Marketing, Outro
3. nome do studio
4. ir para Dashboard

PLANO INICIAL
Criar suporte para planos free, beta e pro.
No MVP, não impor limites rígidos aos testers; apenas manter o campo de plano para futura monetização.

DESIGN
- Premium, minimalista, moderno e profissional.
- Mobile-first porque o fundador/testador inicial pode trabalhar pelo celular.
- Desktop também responsivo.
- Evitar aparência de template genérico.
- Tipografia forte, bastante espaço, cards discretos, navegação clara.
- Interface toda em português.
- Use componentes consistentes e acessíveis.
- Não usar gradientes excessivos nem elementos decorativos desnecessários.

IMPORTANTE
Não adicionar IA, WhatsApp API, CRM avançado, contabilidade, anúncios, assinatura digital, app nativo, chat interno ou integrações extras nesta versão.
Não inventar funcionalidades além desta especificação.
Priorize um MVP funcional de ponta a ponta, com dados persistentes e autenticação real.

Crie primeiro uma base funcional e visualmente polida, conectada ao banco, com as rotas principais e permissões corretas.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0dc46a62-1f51-4b63-8fe4-2d98447db761).

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
