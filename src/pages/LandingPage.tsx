import { Link } from 'react-router-dom';
import { BarChart3, Upload, Users, ArrowRight, Shield, Zap, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

const features = [
  {
    icon: BarChart3,
    title: 'Dashboard Consolidado',
    description: 'Visualize todos os portfólios dos seus clientes em um único painel, com gráficos interativos e métricas em tempo real.',
  },
  {
    icon: Upload,
    title: 'Extração Automática',
    description: 'Faça upload de extratos bancários em PDF e nossa IA extrai automaticamente as posições de investimento.',
  },
  {
    icon: Users,
    title: 'Gestão de Clientes',
    description: 'Gerencie toda a carteira dos seus clientes de forma organizada, com histórico completo de posições e documentos.',
  },
];

const stats = [
  { value: '99.9%', label: 'Uptime garantido' },
  { value: '10x', label: 'Mais produtividade' },
  { value: '256-bit', label: 'Criptografia' },
  { value: '24/7', label: 'Suporte dedicado' },
];

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-canvas-light overflow-hidden">
      {/* Navbar */}
      <nav className="relative z-10 border-b border-hairline-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-heading-md font-display font-bold text-ink">FinansmartAI</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-body-md font-semibold text-ink hover:text-primary transition-colors">
                Funcionalidades
              </a>
              <a href="#security" className="text-body-md font-semibold text-ink hover:text-primary transition-colors">
                Segurança
              </a>
              <a href="#stats" className="text-body-md font-semibold text-ink hover:text-primary transition-colors">
                Números
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/login" className="inline-block">
                <Button variant="primary" className="flex items-center gap-2">
                  Login
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 py-section sm:py-band">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-body-sm font-semibold text-primary mb-lg">
            FinansmartAI
          </div>

          <h1 className="text-display-lg sm:text-display-xl font-display text-ink leading-tight tracking-tight">
            Gerencie portfólios{' '}
            <span className="bg-gradient-to-r from-primary to-primary-bright bg-clip-text text-transparent">
              com inteligência
            </span>
          </h1>

          <p className="mt-xl text-body-lg text-stone max-w-2xl mx-auto leading-relaxed">
            A plataforma completa para consultores de investimentos. Consolide carteiras, extraia dados automaticamente e ofereça o melhor atendimento aos seus clientes.
          </p>

          <div className="mt-xl flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login">
              <Button variant="primary" className="flex items-center gap-2">
                Começar Agora
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline-light" className="px-7">
                Explorar funcionalidades
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-section bg-surface-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-section">
            <h2 className="text-display-md sm:text-display-lg font-display text-ink tracking-tight">
              Tudo que você precisa
            </h2>
            <p className="mt-lg text-body-lg text-stone max-w-2xl mx-auto">
              Ferramentas poderosas para transformar a forma como você gerencia os investimentos dos seus clientes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} variant="light">
                  <CardContent className="p-xxl space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-heading-md font-display text-ink mb-2">{feature.title}</h3>
                      <p className="text-body-md text-stone">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="relative z-10 py-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hero-band-dark rounded-lg p-section sm:p-band text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full border border-on-dark/20"
                  style={{
                    width: `${(i + 1) * 200}px`,
                    height: `${(i + 1) * 200}px`,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              ))}
            </div>
            <div className="relative z-10 space-y-lg">
              <div className="w-16 h-16 rounded-lg bg-on-dark/10 backdrop-blur flex items-center justify-center mx-auto">
                <Shield className="h-8 w-8 text-on-dark" />
              </div>
              <div>
                <h2 className="text-display-md sm:text-display-lg font-display text-on-dark tracking-tight">
                  Segurança de nível bancário
                </h2>
                <p className="mt-md text-body-lg text-on-dark-mute max-w-2xl mx-auto leading-relaxed">
                  Seus dados e os de seus clientes protegidos com criptografia AES-256, infraestrutura Supabase e conformidade com as melhores práticas do mercado.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-lg pt-4">
                <div className="flex items-center gap-2 text-body-md text-on-dark-mute">
                  <Zap className="h-5 w-5 text-accent-light-green" />
                  Autenticação segura
                </div>
                <div className="flex items-center gap-2 text-body-md text-on-dark-mute">
                  <Zap className="h-5 w-5 text-accent-light-green" />
                  Dados criptografados
                </div>
                <div className="flex items-center gap-2 text-body-md text-on-dark-mute">
                  <Zap className="h-5 w-5 text-accent-light-green" />
                  Backups automáticos
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="relative z-10 py-section bg-surface-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-lg">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-heading-lg sm:text-display-md font-display text-ink tracking-tight">{stat.value}</p>
                <p className="mt-md text-body-sm font-semibold text-stone">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-section">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-lg">
          <h2 className="text-display-md sm:text-display-lg font-display text-ink tracking-tight">
            Pronto para transformar sua consultoria?
          </h2>
          <p className="text-body-lg text-stone max-w-xl mx-auto">
            Comece gratuitamente e descubra como o FinansmartAI pode elevar sua gestão de investimentos.
          </p>
          <Link to="/login">
            <Button variant="primary" className="inline-flex items-center gap-2">
              Começar Agora — é gratuito
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-hairline-light py-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-body-md font-semibold text-ink">FinansmartAI</span>
            <p className="text-body-sm text-stone">
              © {new Date().getFullYear()} FinansmartAI. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
