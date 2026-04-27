### **📋 INSTRUÇÃO DE PROJETO PARA A IA (Copie a partir daqui)**

**Objetivo: Transformar o front-end React fornecido em uma aplicação e-commerce Full-Stack no modelo dropshipping, focada no mercado de luxo. A aplicação deve usar Next.js (App Router), Tailwind CSS, Supabase (Auth, Database e Storage) e Stripe para pagamentos.**

**1\. Stack Tecnológico:**

* **Framework: Next.js (App Router) com React.**  
* **Estilização: Tailwind CSS \+ Lucide React (Ícones).**  
* **Banco de Dados & Autenticação: Supabase (PostgreSQL).**  
* **Upload de Imagens: Supabase Storage.**  
* **Pagamentos: Stripe (Checkout Sessions & Webhooks).**

**2\. Arquitetura do Banco de Dados (Supabase PostgreSQL): Crie as seguintes tabelas com RLS (Row Level Security) configurado:**

* **Tabela `products`:**  
  * **`id` (uuid, PK)**  
  * **`name` (text) \- Ex: Prada Re-Edition.**  
  * **`description` (text) \- Descrição focada em status e material.**  
  * **`price` (integer) \- Armazenar em centavos para facilitar a integração com o Stripe.**  
  * **`images` (array de text) \- URLs das fotos *black porn product* hospedadas no Storage.**  
  * **`colors` (array de text) \- Variações disponíveis.**  
  * **`brand` (text) \- Marca original da peça.**  
  * **`is_active` (boolean) \- Para ocultar produtos sem deletar.**  
* **Tabela `coupons`:**  
  * **`id` (uuid, PK)**  
  * **`code` (text) \- O código que o cliente digita.**  
  * **`discount_percent` (integer)**  
  * **`is_active` (boolean)**  
* **Tabela `orders` (Essencial para o fluxo Dropshipping):**  
  * **`id` (uuid, PK)**  
  * **`user_id` (uuid, FK \- referenciando Supabase Auth)**  
  * **`stripe_session_id` (text)**  
  * **`total_amount` (integer)**  
  * **`status` (text) \- ENUM: 'pagamento\_pendente', 'pago', 'processando\_fornecedor', 'enviado', 'entregue'.**  
  * **`shipping_address` (jsonb) \- Endereço completo do cliente.**

**3\. Painel Administrativo (Rota `/admin`): O painel de admin deve ser uma área protegida (apenas usuários com a role `admin` no Supabase podem acessar). Deve conter:**

* **Dashboard: Visão geral de vendas, receita total e status dos pedidos.**  
* **Gerenciamento de Produtos: Um formulário de CRUD para cadastrar novos produtos. Deve ter upload direto de múltiplas imagens para o *Supabase Storage Bucket*. Inclua campos para Nome, Preço (BRL), Cores e Descrição rica.**  
* **Gerenciamento de Pedidos: A central nervosa do dropshipping. Uma tela onde o admin vê quem pagou, pega o endereço de envio, realiza o pedido externamente (Ghost Channels) e atualiza o status para "enviado" com o código de rastreio.**

**4\. Fluxo do Cliente (Loja Virtual):**

* **Autenticação: Login/Registro via Supabase Auth (Magic Link ou Email/Senha). Rota `/acesso`.**  
* **Carrinho (A Sacola): Gerenciamento de estado global (Zustand ou React Context) para a sacola de compras.**  
* **Checkout (Stripe): Quando o cliente clica em "Finalizar Curadoria", o sistema deve:**  
  1. **Criar um pedido no Supabase com status 'pagamento\_pendente'.**  
  2. **Chamar a API Route do Next.js para criar uma `Stripe Checkout Session`.**  
  3. **Redirecionar o usuário para a tela segura do Stripe.**  
* **Webhooks: Configurar um endpoint de Webhook do Stripe (`/api/webhooks/stripe`) para ouvir o evento `checkout.session.completed`. Assim que o pagamento cai, o webhook atualiza o status do pedido no Supabase para 'pago'.**

**5\. Integração do Código Front-end:**

* **Utilize o código do arquivo `App.js` fornecido como o template da rota principal (`app/page.tsx`).**  
* **Mova os dados *hardcoded* (produtos como Prada, YSL, etc.) para chamadas dinâmicas ao Supabase usando Server Components do Next.js para SEO e performance.**

