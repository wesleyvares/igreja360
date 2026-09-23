import { FormEvent, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Church } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { user, signIn, demoMode } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || '/dashboard';

  if (user) return <Navigate to={from} replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro('');
    try {
      await signIn(email, senha);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível entrar.');
    }
  }

  return (
    <div className="login-overlay">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-card-header">
          <div className="login-brand-line"><Church size={28} /> <h2>Igreja 360</h2></div>
          <p>Acesso seguro ao painel administrativo da igreja.</p>
        </div>
        <div className="login-form">
          {demoMode && (
            <div className="info-box">
              Firebase ainda não configurado. Para testar, informe qualquer e-mail e senha. Em produção, use Firebase Authentication.
            </div>
          )}
          {erro && <div className="login-error show">{erro}</div>}
          <label>E-mail
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="seuemail@igreja.com" autoComplete="username" />
          </label>
          <label>Senha
            <input value={senha} onChange={(e) => setSenha(e.target.value)} type="password" placeholder="Digite sua senha" autoComplete="current-password" />
          </label>
          <button className="btn btn-primary" type="submit">Entrar</button>
          <p className="login-note">Nenhuma senha fica gravada no código. A proteção real deve ser feita com Firebase Auth + Firestore Rules.</p>
        </div>
      </form>
    </div>
  );
}
