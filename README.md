# @FIAP/transaction-drawer

## Descrição

Microfrontend responsável pelo formulário de criação e edição de transações. Este módulo gerencia o estado do formulário, validação de dados e upload de comprovantes, integrando-se com o restante da aplicação via eventos globais.

## Tecnologias

- **Framework**: React.
- **Linguagem**: TypeScript.
- **Arquitetura**: Single-SPA.
- **Gerenciamento de Estado**: **Redux Toolkit** (utilizado para controlar o estado do formulário, validações e visibilidade do drawer).
- **Design System**: [`@valoro/ui`](https://www.npmjs.com/package/@valoro/ui) (Componentes de UI padronizados).
- **Validação**: Zod.
- **Build Tool**: Webpack.

## Pré-requisitos

- **Node.js**: Versão LTS (v20+ recomendada).
- **Gerenciador de Pacotes**: pnpm.

## Como Rodar

1. Instale as dependências:

   ```bash
   pnpm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   pnpm start
   ```
   A aplicação estará disponível em `http://localhost:8089` (ou porta configurada).

## Funcionalidades

- **Criação de Transação**: Formulário completo com nome, valor, data, categoria e anexo.
- **Edição de Transação**: Carregamento de dados existentes para edição.
- **Categorias Customizadas**: Suporte a criação de novas categorias com cores automáticas baseadas em hash.
- **Upload de Anexos**: Conversão e persistência de arquivos (imagens/PDF) em Base64.
- **Validação em Tempo Real**: Feedback visual de erros nos campos.
