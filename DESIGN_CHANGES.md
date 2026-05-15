# Alterações de Design - Design System Revolut

## Resumo das Mudanças Visuais Aplicadas

Seu aplicativo foi atualizado com o design system do Revolut, implementando cores modernas, tipografia premium e componentes refinados.

---

## 📋 Alterações Implementadas

### 1. **Configuração Tailwind (tailwind.config.js)**
- ✅ Adicionadas todas as cores do Revolut
- ✅ Importação de tipografia Aeonik Pro + Inter
- ✅ Escala de espaçamento customizada (xxs, xs, sm, md, lg, xl, xxl, xxxl, block, section, band)
- ✅ Border radius system (sm: 8px, md: 12px, lg: 20px, xl: 28px, full: 9999px)

### 2. **Estilos Globais (src/index.css)**
- ✅ Nova tipografia base com Inter e Aeonik Pro
- ✅ Componentes CSS layer para botões, cards, inputs
- ✅ Classes utilitárias para elementos Revolut
- ✅ Scrollbar customizado com cores do sistema

### 3. **Componentes UI Atualizados**

#### Button (src/components/ui/Button.tsx)
Variantes do Revolut implementadas:
- `primary` - Botão branco com texto escuro (pill-shaped)
- `dark` - Botão escuro para canvas claro
- `soft` - Botão suave em surface-soft
- `outline-light` - Contorno em canvas claro
- `outline-dark` - Contorno em canvas escuro
- `pill-sm` - Pequeno botão pill
- `danger` - Botão de destruição em vermelho

#### Card (src/components/ui/Card.tsx)
Variantes implementadas:
- `light` - Card branco com borda fina
- `dark` - Card elevado em dark mode
- `elevated` - Surface elevada
- `featured` - Card destaque em cobalt violet

#### Input (src/components/ui/Input.tsx)
- Altura 56px (WCAG AAA touch target)
- Suporte para light/dark variant
- Focus ring em primary color
- Erro em accent-danger

#### Select (src/components/ui/Select.tsx)
- Mesmo padrão do Input
- Appearance none com cursor pointer
- Placeholder customizado

#### StatCard (src/components/ui/StatCard.tsx)
- Ícone com background primary/10
- Tendência com cores accent-light-green (positiva) ou accent-danger (negativa)
- Variantes light/dark

#### Table (src/components/ui/Table.tsx)
- Header com background surface-soft/elevated
- Body com divisores hairline-light/dark
- Hover states animados
- Rounded corners no container

### 4. **Layout Redesenhado (src/components/layouts/Layout.tsx)**
- ✅ Sidebar escura (canvas-dark) com texto on-dark
- ✅ Navegação ativa em primary color
- ✅ Avatar com background primary
- ✅ Header com surface-card e border hairline-light
- ✅ Search input com surface-soft background
- ✅ Notificações com design Revolut
- ✅ Mobile menu responsivo

---

## 🎨 Cores Principais Utilizadas

| Token | Cor | Uso |
|-------|-----|-----|
| primary | `#494fdf` | Botões ativos, highlights, badges |
| canvas-light | `#ffffff` | Background principal |
| canvas-dark | `#000000` | Sidebar, dark sections |
| surface-elevated | `#16181a` | Cards em dark mode |
| surface-soft | `#f4f4f4` | Backgrounds suaves |
| ink | `#191c1f` | Texto principal |
| on-dark | `#ffffff` | Texto em fundo escuro |

---

## 🔤 Tipografia

- **Display**: Aeonik Pro 500 (headlines)
- **Body**: Inter 400/600 (body text, buttons)
- **Tamanhos padronizados**:
  - `display-xxl`: 136px (hero)
  - `display-xl`: 80px (titles)
  - `heading-lg`: 32px (section titles)
  - `body-md`: 16px (default)
  - `body-sm`: 14px (captions)

---

## 📏 Espaçamento

- Base: 4px múltiplos
- `lg`: 16px (padrão)
- `xl`: 24px (cards)
- `xxl`: 32px (internal padding)
- `section`: 88px (vertical between bands)

---

## ✨ Características do Design

✅ **Two-Mode Canvas**: Dark (storytelling) vs Light (browse)
✅ **Pill-Shaped Buttons**: `rounded-full` em todos os botões
✅ **Color Hierarchy**: Primary para ações principais, accents para features
✅ **Touch-Friendly**: Mínimo 48px em alturas (WCAG AAA)
✅ **No Shadows**: Elevação via color shifts
✅ **Responsive**: Collapses inteligentes em mobile

---

## 🚀 Próximos Passos Recomendados

1. Atualizar as páginas (Pages) para usar os novos componentes
2. Adicionar animações e transições (já temos foundation)
3. Testar responsividade em mobile
4. Validar contrastes de cor (já estão em WCAG AA+)
5. Implementar dark mode completo (se necessário)

---

## 📝 Notas

- Todos os componentes suportam variant `light`/`dark`
- Cores semânticas para erros, sucesso, avisos implementadas
- Sistema de design completo e documentado
- Pronto para expansão com novos componentes
