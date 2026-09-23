import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, defaultIgrejaId, firebaseEnabled } from '../firebase/config';
import { AppUser } from '../types';

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  demoMode: boolean;
  signIn: (email: string, senha: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const demoUser: AppUser = {
  uid: 'demo-user', nome: 'Administrador Demonstração', email: 'demo@igreja360.local',
  perfil: 'pastor', igrejaId: defaultIgrejaId, ativo: true
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const demoMode = !firebaseEnabled;

  useEffect(() => {
    if (!firebaseEnabled || !auth || !db) {
      setUser(sessionStorage.getItem('igreja360_demo_session') ? demoUser : null);
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) { setUser(null); setLoading(false); return; }
      try {
        const snap = await getDoc(doc(db, 'usuarios', firebaseUser.uid));
        if (!snap.exists()) {
          setUser({ uid: firebaseUser.uid, nome: firebaseUser.displayName || firebaseUser.email || 'Usuário',
            email: firebaseUser.email || '', perfil: 'membro', igrejaId: defaultIgrejaId, ativo: false });
        } else {
          setUser({ uid: firebaseUser.uid, ...(snap.data() as Omit<AppUser, 'uid'>) });
        }
      } finally { setLoading(false); }
    });
    return () => unsubscribe();
  }, []);

  async function signIn(email: string, senha: string) {
    if (!email || !senha) throw new Error('Informe e-mail e senha.');
    if (!firebaseEnabled || !auth) {
      sessionStorage.setItem('igreja360_demo_session', 'true'); setUser(demoUser); return;
    }
    await signInWithEmailAndPassword(auth, email, senha);
  }

  async function signInWithGoogle() {
    if (!firebaseEnabled || !auth) throw new Error('Login Google disponível somente no ambiente Firebase.');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await signInWithPopup(auth, provider);
  }

  async function signOut() {
    if (firebaseEnabled && auth) { await firebaseSignOut(auth); return; }
    sessionStorage.removeItem('igreja360_demo_session'); setUser(null);
  }

  const value = useMemo(() => ({ user, loading, demoMode, signIn, signInWithGoogle, signOut }), [user, loading, demoMode]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de AuthProvider.');
  return ctx;
}
