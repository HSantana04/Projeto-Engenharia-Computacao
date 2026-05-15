import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileCheck,
  Database,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
  Upload,
  Target,
} from 'lucide-react';
import logoUrl from '../../assets/Logoportfelofc.png';
import { supabase } from '../../lib/supabase';
import { useAuthRole } from '../../hooks/useAuthRole';

interface LayoutProps {
  children: ReactNode;
}

function displayInitials(name: string | undefined, email: string | undefined) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return '—';
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading, role, consultantProfile, clientProfile } = useAuthRole();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, user, navigate]);

  const navItems = useMemo(() => {
    if (role === 'cliente' && user) {
      return [
        { path: '/client-dashboard', label: 'Meu painel', icon: LayoutDashboard },
        { path: `/client/${user.id}/goals`, label: 'Metas', icon: Target },
        { path: '/upload', label: 'Inserir dados', icon: Upload },
        { path: '/review', label: 'Revisões', icon: FileCheck },
        { path: '/b3-assets', label: 'Ativos B3', icon: Database },
      ];
    }

    if (role === 'consultor') {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/clients', label: 'Clientes', icon: Users },
        { path: '/upload', label: 'Inserir dados', icon: Upload },
        { path: '/review', label: 'Revisões', icon: FileCheck },
        { path: '/b3-assets', label: 'Ativos B3', icon: Database },
      ];
    }

    return [{ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }];
  }, [role, user]);

  const displayName =
    role === 'consultor'
      ? consultantProfile?.name ?? user?.email ?? 'Consultor'
      : role === 'cliente'
        ? clientProfile?.name ?? user?.email ?? 'Cliente'
        : user?.email ?? 'Usuário';

  const roleLabel = role === 'consultor' ? 'Consultor' : role === 'cliente' ? 'Cliente' : '';

  const avatar = displayInitials(
    role === 'consultor' ? consultantProfile?.name : clientProfile?.name,
    user?.email ?? undefined
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  const searchPlaceholder =
    role === 'consultor' ? 'Buscar clientes, ações...' : 'Buscar no painel...';

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas-light">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas-light flex flex-col md:flex-row font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-canvas-dark text-on-dark border-r border-hairline-dark m-4 p-4 sticky top-4 h-[calc(100vh-2rem)] z-20 rounded-lg">
        <div className="flex items-center gap-3 px-2 mb-10 mt-2">
          <img src={logoUrl} alt="Consultoria FinansmartAI" className="h-8 w-auto" />
          <span className="text-heading-sm font-display font-bold text-on-dark">FinansmartAI</span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={`${item.path}-${item.label}`}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary text-on-primary'
                    : 'text-on-dark-mute hover:bg-surface-elevated hover:text-on-dark'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-button-md text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-hairline-dark">
          <div className="flex items-center justify-between px-2 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-xs shrink-0">
                {avatar}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-body-sm font-semibold text-on-dark truncate">{displayName}</span>
                <span className="text-caption text-on-dark-mute">{roleLabel}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-dark-mute hover:bg-accent-danger/20 hover:text-accent-danger transition-colors group"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-button-md text-sm">Sair da conta</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-canvas-light border-b border-hairline-light z-30 sticky top-0">
        <div className="flex items-center gap-2">
          <img src={logoUrl} alt="Consultoria FinansmartAI" className="h-7 w-auto" />
          <span className="text-heading-sm font-display font-bold text-ink">FinansmartAI</span>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-ink rounded-lg hover:bg-surface-soft"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-canvas-light pt-20 px-4">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={`m-${item.path}-${item.label}`}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive ? 'bg-primary text-on-primary' : 'text-ink hover:bg-surface-soft'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-button-md">{item.label}</span>
                </Link>
              );
            })}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-accent-danger hover:bg-accent-danger/10 mt-4"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-button-md">Sair da conta</span>
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-canvas-light relative overflow-hidden">
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between h-20 px-8 sticky top-0 z-10 bg-surface-card border-b border-hairline-light">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 rounded-md bg-surface-soft border border-hairline-light focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-body-md placeholder:text-stone"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2.5 rounded-lg hover:bg-surface-soft text-ink transition-colors"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent-warning" />
              </button>

              {isNotifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} aria-hidden />
                  <div className="absolute right-0 top-12 w-80 bg-surface-card rounded-lg shadow-lg border border-hairline-light z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-hairline-light flex items-center justify-between">
                      <h3 className="font-button-md text-body-sm text-ink">Notificações</h3>
                    </div>
                    <div className="px-4 py-6 text-body-sm text-stone text-center">Sem notificações novas</div>
                  </div>
                </>
              )}
            </div>
            <div className="h-8 w-px bg-hairline-light mx-2" />
            <div className="flex flex-col items-end mr-2">
              <span className="text-body-sm font-semibold text-ink">
                {new Date().toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
              </span>
              <span className="text-caption text-stone">{roleLabel || 'Conectado'}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8 pt-2">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </div>
      </main>
    </div>
  );
};
