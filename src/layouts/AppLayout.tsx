import { NavLink, Outlet } from 'react-router-dom';
import { Bell, CalendarDays, Church, ClipboardCheck, ClipboardList, DollarSign, FileClock, Home, LogOut, Megaphone, Radio, Settings, Users, UserRoundPlus, Workflow } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { accessByPath, podeAcessar } from '../config/access';

const links = [
  { to: '/quadro-avisos', label: 'Quadro de avisos', icon: ClipboardList },
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/membros', label: 'Membros', icon: Users },
  { to: '/visitantes', label: 'Visitantes', icon: UserRoundPlus },
  { to: '/celulas', label: 'Células', icon: Workflow },
  { to: '/relatorios-celula', label: 'Relatório da célula', icon: ClipboardCheck },
  { to: '/solicitacoes', label: 'Solicitações', icon: FileClock },
  { to: '/financeiro', label: 'Financeiro', icon: DollarSign },
  { to: '/eventos', label: 'Eventos', icon: CalendarDays },
  { to: '/relatorios', label: 'Relatórios', icon: Bell },
  { to: '/avisos', label: 'Gerenciar avisos', icon: Megaphone },
  { to: '/radio', label: 'Rádio', icon: Radio },
  { to: '/configuracoes', label: 'Configurações', icon: Settings }
];

export default function AppLayout() {
  const { user, signOut, demoMode } = useAuth();
  const linksPermitidos = links.filter((item) => accessByPath[item.to] && podeAcessar(user?.perfil, item.to));

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark"><Church size={24} /></div>
          <div><strong>Igreja 360</strong><span>Gestão completa</span></div>
        </div>
        <nav className="sidebar-nav">
          {linksPermitidos.map((item) => {
            const Icon = item.icon;
            return <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><Icon size={18} /><span>{item.label}</span></NavLink>;
          })}
        </nav>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div><h1>Igreja 360</h1><p>Administração, membros, células, eventos e comunicação.</p></div>
          <div className="topbar-actions">
            {demoMode && <span className="demo-pill">Modo demonstração</span>}
            <div className="user-chip"><strong>{user?.nome}</strong><span>{user?.perfil}</span></div>
            <button className="btn btn-soft" onClick={signOut}><LogOut size={16} /> Sair</button>
          </div>
        </header>
        <main className="container"><Outlet /></main>
      </div>
    </div>
  );
}
