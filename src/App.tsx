import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MembrosPage from './pages/MembrosPage';
import VisitantesPage from './pages/VisitantesPage';
import CelulasPage from './pages/CelulasPage';
import FinanceiroPage from './pages/FinanceiroPage';
import EventosPage from './pages/EventosPage';
import RelatoriosPage from './pages/RelatoriosPage';
import AvisosPage from './pages/AvisosPage';
import RadioPage from './pages/RadioPage';
import ConfiguracoesPage from './pages/ConfiguracoesPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/membros" element={<MembrosPage />} />
          <Route path="/visitantes" element={<VisitantesPage />} />
          <Route path="/celulas" element={<CelulasPage />} />
          <Route path="/financeiro" element={<FinanceiroPage />} />
          <Route path="/eventos" element={<EventosPage />} />
          <Route path="/relatorios" element={<RelatoriosPage />} />
          <Route path="/avisos" element={<AvisosPage />} />
          <Route path="/radio" element={<RadioPage />} />
          <Route path="/configuracoes" element={<ConfiguracoesPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
