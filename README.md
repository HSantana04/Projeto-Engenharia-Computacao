<<<<<<< HEAD
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
=======
# Projeto-Engenharia-Computacao
# 💰 FinanSmart – Gestão Financeira Inteligente

O **FinanSmart** é uma plataforma web para **gestão financeira pessoal**, desenvolvida como projeto acadêmico com foco em **boas práticas de engenharia de software**.  
O sistema simula funcionalidades encontradas em bancos digitais, oferecendo **segurança, relatórios inteligentes e uma arquitetura limpa**.

---

## 🚀 Diferenciais do Projeto
- 🔒 **Autenticação JWT** → simulação de login seguro como em fintechs.  
- 📊 **Dashboard interativo** → gráficos de receitas, despesas e saldo em tempo real.  
- 🧠 **Insights automáticos** → relatórios que destacam categorias mais usadas e evolução de gastos.  
- 🏗 **Arquitetura limpa** → separação em camadas (Controller → Service → Repository → Database).  
- 🐳 **Docker** → containers para backend + banco de dados.  
- 📑 **Documentação Swagger** da API.  
- ✅ **Testes unitários** no backend.  

---

## 🏗 Arquitetura

```mermaid
flowchart LR
    A[React Frontend] -->|REST API| B[.NET 8 Backend]
    B --> C[(PostgreSQL)]
>>>>>>> ce59fd8933dfc97b6234f27c6b97d3f8e72349c5
