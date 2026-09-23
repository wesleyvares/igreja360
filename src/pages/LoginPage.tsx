import { FormEvent, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Church } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { user, signIn, signInWithGoogle, demoMode } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || '/visitantes';
  if (user) return <Navigate to={from} replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setErro('');
    try { await signIn(email, senha); } catch (err) { setErro(err instanceof Error ? err.message : 'Não foi possível entrar.'); }
  }
  async function handleGoogle() {
    setErro('');
    try { await signInWithGoogle(); } catch (err) { setErro(err instanceof Error ? err.message : 'Não foi possível entrar com Google.'); }
  }

  return <div className="login-overlay"><form className="login-card" onSubmit={handleSubmit}>
    <div className="login-card-header"><div className="login-brand-line"><Church size={28}/><h2>Igreja 360</h2></div><p>Acesso seguro ao piloto da Igreja Casa do Céu.</p></div>
    <div className="login-form">
      {demoMode && <div className="info-box">Ambiente de demonstração. O piloto com dados reais exige Firebase configurado.</div>}
      {erro && <div className="login-error show">{erro}</div>}
      {!demoMode && <button className="btn btn-soft" type="button" onClick={handleGoogle}>Continuar com Google</button>}
      {!demoMode && <div className="login-note">ou entre com e-mail e senha</div>}
      <label>E-mail<input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" autoComplete="username"/></label>
      <label>Senha<input value={senha} onChange={(e)=>setSenha(e.target.value)} type="password" autoComplete="current-password"/></label>
      <button className="btn btn-primary" type="submit">Entrar</button>
      <p className="login-note">O piloto mantém Google e e-mail/senha pelo Firebase Authentication.</p>
    </div>
  </form></div>;
}
