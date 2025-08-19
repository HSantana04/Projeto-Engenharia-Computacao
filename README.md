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
