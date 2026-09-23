import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PerfilUsuario } from '../types';

export default function RoleRoute({ allowed }: { allowed: PerfilUsuario[] }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (!allowed.includes(user.perfil)) return <Navigate to="/quadro-avisos" replace />;

  return <Outlet />;
}
