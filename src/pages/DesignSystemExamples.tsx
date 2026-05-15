import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { StatCard } from '../components/ui/StatCard';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { TrendingUp, Users, DollarSign, Target } from 'lucide-react';

/**
 * EXEMPLOS DE USO - NOVO DESIGN SYSTEM REVOLUT
 * 
 * Este arquivo demonstra como usar os novos componentes e estilos
 * Copie e adapte estes exemplos para suas páginas
 */

export const DesignSystemExamples = () => {
  const [formData, setFormData] = useState({ name: '', role: '' });

  return (
    <div className="space-y-section">
      {/* ============================================
          SEÇÃO 1: BUTTONS
          ============================================ */}
      <section>
        <h2 className="text-heading-lg font-display mb-xl text-ink">Botões - Exemplos</h2>
        
        <Card>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="primary">Primário</Button>
              <Button variant="dark">Escuro</Button>
              <Button variant="soft">Suave</Button>
              <Button variant="danger">Perigo</Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              <Button variant="outline-light">Outline Light</Button>
              <Button variant="outline-dark">Outline Dark</Button>
              <Button variant="pill-sm" size="sm">Pill</Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ============================================
          SEÇÃO 2: CARDS
          ============================================ */}
      <section>
        <h2 className="text-heading-lg font-display mb-xl text-ink">Cards - Exemplos</h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* Card Claro */}
          <Card variant="light">
            <CardHeader>
              <CardTitle variant="light">Card Claro</CardTitle>
            </CardHeader>
            <CardContent variant="light">
              <p className="text-body-md text-ink">
                Este é um card com fundo claro, border fina e comportamento de hover.
              </p>
            </CardContent>
          </Card>

          {/* Card Elevado */}
          <Card variant="dark">
            <CardHeader variant="dark">
              <CardTitle variant="dark">Card Elevado</CardTitle>
            </CardHeader>
            <CardContent variant="dark">
              <p className="text-body-md text-on-dark">
                Este é um card com background surface-elevated, ideal para dark themes.
              </p>
            </CardContent>
          </Card>

          {/* Card Destaque */}
          <Card variant="featured" className="md:col-span-2">
            <CardHeader variant="featured">
              <CardTitle variant="featured">Card Destaque</CardTitle>
            </CardHeader>
            <CardContent variant="featured">
              <p className="text-body-md text-on-primary">
                Card em cobalt violet para destacar elementos importantes.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ============================================
          SEÇÃO 3: INPUTS & FORMS
          ============================================ */}
      <section>
        <h2 className="text-heading-lg font-display mb-xl text-ink">Inputs & Formulários</h2>
        
        <Card>
          <CardContent className="space-y-4">
            <Input
              label="Nome Completo"
              placeholder="Digite seu nome"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            
            <Select
              label="Selecione seu Papel"
              options={[
                { value: 'consultor', label: 'Consultor' },
                { value: 'cliente', label: 'Cliente' },
                { value: 'admin', label: 'Admin' },
              ]}
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />

            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              error="Email inválido"
              variant="light"
            />

            <div className="flex gap-3 pt-4">
              <Button variant="primary">Salvar</Button>
              <Button variant="outline-light">Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ============================================
          SEÇÃO 4: STAT CARDS
          ============================================ */}
      <section>
        <h2 className="text-heading-lg font-display mb-xl text-ink">Stat Cards - Métricas</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Clientes Ativos"
            value={1234}
            icon={<Users className="h-6 w-6" />}
            trend={{ value: 12, isPositive: true }}
            variant="light"
          />
          
          <StatCard
            title="Receita Total"
            value="R$ 45.2k"
            icon={<DollarSign className="h-6 w-6" />}
            trend={{ value: 8, isPositive: true }}
            variant="light"
          />
          
          <StatCard
            title="Metas Atingidas"
            value="89%"
            icon={<Target className="h-6 w-6" />}
            trend={{ value: 5, isPositive: false }}
            variant="light"
          />
          
          <StatCard
            title="Crescimento"
            value="23%"
            icon={<TrendingUp className="h-6 w-6" />}
            trend={{ value: 15, isPositive: true }}
            variant="light"
          />
        </div>
      </section>

      {/* ============================================
          SEÇÃO 5: TABLES
          ============================================ */}
      <section>
        <h2 className="text-heading-lg font-display mb-xl text-ink">Tabelas</h2>
        
        <Table variant="light">
          <TableHeader variant="light">
            <TableRow variant="light">
              <TableHead variant="light">Nome</TableHead>
              <TableHead variant="light">Papel</TableHead>
              <TableHead variant="light">Status</TableHead>
              <TableHead variant="light">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody variant="light">
            <TableRow variant="light">
              <TableCell variant="light">João Silva</TableCell>
              <TableCell variant="light">Consultor</TableCell>
              <TableCell variant="light">
                <span className="badge-feature">Ativo</span>
              </TableCell>
              <TableCell variant="light">
                <Button variant="pill-sm" size="sm">Editar</Button>
              </TableCell>
            </TableRow>
            <TableRow variant="light">
              <TableCell variant="light">Maria Santos</TableCell>
              <TableCell variant="light">Cliente</TableCell>
              <TableCell variant="light">
                <span className="badge-tag">Inativo</span>
              </TableCell>
              <TableCell variant="light">
                <Button variant="pill-sm" size="sm">Editar</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      {/* ============================================
          SEÇÃO 6: HERO SECTION
          ============================================ */}
      <section>
        <div className="hero-band-dark rounded-lg p-section space-y-4">
          <h1 className="text-display-lg font-display text-on-dark">
            Bem-vindo ao Dashboard
          </h1>
          <p className="text-body-lg text-on-dark-mute max-w-2xl">
            Gerencie seus clientes, portfolios e metas com o novo design system Revolut.
          </p>
          <div className="flex gap-3 pt-4">
            <Button variant="primary">Começar Agora</Button>
            <Button variant="outline-dark">Saiba Mais</Button>
          </div>
        </div>
      </section>

      {/* ============================================
          SEÇÃO 7: CORES E TIPOGRAFIA
          ============================================ */}
      <section>
        <h2 className="text-heading-lg font-display mb-xl text-ink">Paleta de Cores</h2>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="h-20 bg-primary rounded-lg" />
            <p className="text-body-md font-semibold text-ink">Primary</p>
            <p className="text-caption text-stone">#494fdf</p>
          </div>
          
          <div className="space-y-2">
            <div className="h-20 bg-surface-soft rounded-lg" />
            <p className="text-body-md font-semibold text-ink">Surface Soft</p>
            <p className="text-caption text-stone">#f4f4f4</p>
          </div>
          
          <div className="space-y-2">
            <div className="h-20 bg-accent-danger rounded-lg" />
            <p className="text-body-md font-semibold text-ink">Danger</p>
            <p className="text-caption text-stone">#e23b4a</p>
          </div>
        </div>
      </section>

      {/* ============================================
          SEÇÃO 8: TIPOGRAFIA
          ============================================ */}
      <section>
        <h2 className="text-heading-lg font-display mb-xl text-ink">Tipografia</h2>
        
        <Card>
          <CardContent className="space-y-6">
            <div>
              <p className="text-caption text-stone mb-2">Display XXL (136px)</p>
              <h1 className="text-display-xxl font-display text-ink">Banking & Beyond</h1>
            </div>
            
            <div>
              <p className="text-caption text-stone mb-2">Display XL (80px)</p>
              <h2 className="text-display-xl font-display text-ink">Join 70+ Million Users</h2>
            </div>
            
            <div>
              <p className="text-caption text-stone mb-2">Heading LG (32px)</p>
              <h3 className="text-heading-lg font-display text-ink">Plan Card Title</h3>
            </div>
            
            <div>
              <p className="text-caption text-stone mb-2">Body MD (16px)</p>
              <p className="text-body-md text-ink">
                Este é um exemplo de body text em Inter 400, usado para conteúdo principal.
              </p>
            </div>
            
            <div>
              <p className="text-caption text-stone mb-2">Caption (13px)</p>
              <p className="text-caption text-stone">Texto pequeno para metadados e rodapés.</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ============================================
          FOOTER
          ============================================ */}
      <div className="mt-section">
        <p className="text-body-sm text-stone text-center">
          Design System v1.0 | Baseado em Revolut Design
        </p>
      </div>
    </div>
  );
};
