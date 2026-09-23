import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="login-overlay">
      <div className="login-card">
        <div className="login-card-header"><h2>Página não encontrada</h2><p>O endereço acessado não existe no Igreja 360.</p></div>
        <div className="login-form"><Link className="btn btn-primary" to="/dashboard">Voltar ao painel</Link></div>
      </div>
    </div>
  );
}
