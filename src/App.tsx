import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MembrosPage from './pages/MembrosPage';
import VisitantesPage from './pages/VisitantesPage';
import CelulasPage from './pages/CelulasPage';
import RelatoriosCelulaPage from './pages/RelatoriosCelulaPage';
import SolicitacoesFinanceirasPage from './pages/SolicitacoesFinanceirasPage';
import FinanceiroPage from './pages/FinanceiroPage';
import EventosPage from './pages/EventosPage';
import RelatoriosPage from './pages/RelatoriosPage';
import AvisosPage from './pages/AvisosPage';
import QuadroAvisosPage from './pages/QuadroAvisosPage';
import RadioPage from './pages/RadioPage';
import ConfiguracoesPage from './pages/ConfiguracoesPage';
import NotFoundPage from './pages/NotFoundPage';
import { accessByPath } from './config/access';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/quadro-avisos" replace />} />
          <Route element={<RoleRoute allowed={accessByPath['/dashboard']} />}><Route path="/dashboard" element={<DashboardPage />} /></Route>
          <Route element={<RoleRoute allowed={accessByPath['/membros']} />}><Route path="/membros" element={<MembrosPage />} /></Route>
          <Route element={<RoleRoute allowed={accessByPath['/visitantes']} />}><Route path="/visitantes" element={<VisitantesPage />} /></Route>
          <Route element={<RoleRoute allowed={accessByPath['/celulas']} />}><Route path="/celulas" element={<CelulasPage />} /></Route>
          <Route element={<RoleRoute allowed={accessByPath['/relatorios-celula']} />}><Route path="/relatorios-celula" element={<RelatoriosCelulaPage />} /></Route>
          <Route element={<RoleRoute allowed={accessByPath['/solicitacoes']} />}><Route path="/solicitacoes" element={<SolicitacoesFinanceirasPage />} /></Route>
          <Route element={<RoleRoute allowed={accessByPath['/financeiro']} />}><Route path="/financeiro" element={<FinanceiroPage />} /></Route>
          <Route element={<RoleRoute allowed={accessByPath['/eventos']} />}><Route path="/eventos" element={<EventosPage />} /></Route>
          <Route element={<RoleRoute allowed={accessByPath['/relatorios']} />}><Route path="/relatorios" element={<RelatoriosPage />} /></Route>
          <Route element={<RoleRoute allowed={accessByPath['/avisos']} />}><Route path="/avisos" element={<AvisosPage />} /></Route>
          <Route element={<RoleRoute allowed={accessByPath['/quadro-avisos']} />}><Route path="/quadro-avisos" element={<QuadroAvisosPage />} /></Route>
          <Route element={<RoleRoute allowed={accessByPath['/radio']} />}><Route path="/radio" element={<RadioPage />} /></Route>
          <Route element={<RoleRoute allowed={accessByPath['/configuracoes']} />}><Route path="/configuracoes" element={<ConfiguracoesPage />} /></Route>
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
