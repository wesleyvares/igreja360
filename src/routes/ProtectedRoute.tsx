import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="loading-screen">Carregando Igreja 360...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!user.ativo) {
    return (
      <div className="login-overlay">
        <div className="login-card">
          <div className="login-card-header">
            <h2>Acesso pendente</h2>
            <p>Seu usuário existe, mas ainda não foi liberado por um administrador da igreja.</p>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
