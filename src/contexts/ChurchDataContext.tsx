import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { firebaseEnabled } from '../firebase/config';
import { syncChurchConfig } from '../services/reportConfig';
import { useAuth } from './AuthContext';
import {
  avisosMock,
  celulasMock,
  eventosMock,
  financeiroMock,
  membrosMock,
  relatoriosCelulaMock,
  solicitacoesFinanceirasMock,
  visitantesMock
} from '../data/mockData';
import {
  Aviso,
  Celula,
  CollectionName,
  EntityMap,
  Evento,
  LancamentoFinanceiro,
  Membro,
  RelatorioCelula,
  SolicitacaoFinanceira,
  Visitante
} from '../types';
import {
  atualizarDocumento,
  buscarCelulaPorId,
  criarDocumento,
  excluirLogicamente,
  listarColecao,
  listarFinanceiro,
  listarMembrosPorCelula,
  listarRelatoriosCelula,
  listarSolicitacoesFinanceiras
} from '../services/firestoreRepository';

type ChurchDataContextValue = {
  loading: boolean;
  membros: Membro[];
  visitantes: Visitante[];
  celulas: Celula[];
  relatoriosCelula: RelatorioCelula[];
  solicitacoesFinanceiras: SolicitacaoFinanceira[];
  financeiro: LancamentoFinanceiro[];
  eventos: Evento[];
  avisos: Aviso[];
  refresh: () => Promise<void>;
  createItem: <K extends CollectionName>(collection: K, item: Omit<EntityMap[K], 'id'>) => Promise<string | void>;
  updateItem: <K extends CollectionName>(collection: K, id: string, item: Partial<EntityMap[K]>) => Promise<void>;
  removeItem: <K extends CollectionName>(collection: K, id: string) => Promise<void>;
};

const ChurchDataContext = createContext<ChurchDataContextValue | undefined>(undefined);

function localKey(collection: string) { return `igreja360_${collection}`; }

function loadLocal<T>(collection: string, fallback: T[]): T[] {
  const raw = localStorage.getItem(localKey(collection));
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T[]; } catch { return fallback; }
}

function saveLocal<T>(collection: string, rows: T[]) {
  localStorage.setItem(localKey(collection), JSON.stringify(rows));
}

async function safeLoad<T>(fn: () => Promise<T[]>) {
  try { return await fn(); } catch { return [] as T[]; }
}

export function ChurchDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [visitantes, setVisitantes] = useState<Visitante[]>([]);
  const [celulas, setCelulas] = useState<Celula[]>([]);
  const [relatoriosCelula, setRelatoriosCelula] = useState<RelatorioCelula[]>([]);
  const [solicitacoesFinanceiras, setSolicitacoesFinanceiras] = useState<SolicitacaoFinanceira[]>([]);
  const [financeiro, setFinanceiro] = useState<LancamentoFinanceiro[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [avisos, setAvisos] = useState<Aviso[]>([]);

  async function refresh() {
    if (!user) { setLoading(false); return; }

    setLoading(true);
    try {
      await syncChurchConfig(user.igrejaId);
      if (!firebaseEnabled) {
        setMembros(loadLocal('membros', membrosMock).filter((x) => x.ativo !== false));
        setVisitantes(loadLocal('visitantes', visitantesMock).filter((x) => x.ativo !== false));
        setCelulas(loadLocal('celulas', celulasMock).filter((x) => x.ativo !== false));
        setRelatoriosCelula(loadLocal('relatoriosCelula', relatoriosCelulaMock).filter((x) => x.ativo !== false));
        setSolicitacoesFinanceiras(loadLocal('solicitacoesFinanceiras', solicitacoesFinanceirasMock).filter((x) => x.ativo !== false));
        setFinanceiro(loadLocal('financeiro', financeiroMock).filter((x) => x.ativo !== false));
        setEventos(loadLocal('eventos', eventosMock).filter((x) => x.ativo !== false));
        setAvisos(loadLocal('avisos', avisosMock).filter((x) => x.ativo !== false));
        return;
      }

      const membrosPromise = user.perfil === 'lider' && user.celulaId
        ? safeLoad(() => listarMembrosPorCelula(user.igrejaId, user.celulaId!))
        : safeLoad(() => listarColecao('membros', user.igrejaId));

      const celulasPromise = user.perfil === 'lider' && user.celulaId
        ? safeLoad(() => buscarCelulaPorId(user.celulaId!))
        : safeLoad(() => listarColecao('celulas', user.igrejaId));

      const relatoriosPromise = user.perfil === 'lider'
        ? (user.celulaId ? safeLoad(() => listarRelatoriosCelula(user.igrejaId, user.celulaId)) : Promise.resolve([]))
        : safeLoad(() => listarRelatoriosCelula(user.igrejaId));

      const [m, v, c, rc, sf, f, e, a] = await Promise.all([
        membrosPromise,
        safeLoad(() => listarColecao('visitantes', user.igrejaId)),
        celulasPromise,
        relatoriosPromise,
        safeLoad(() => listarSolicitacoesFinanceiras(user)),
        safeLoad(() => listarFinanceiro(user.igrejaId)),
        safeLoad(() => listarColecao('eventos', user.igrejaId)),
        safeLoad(() => listarColecao('avisos', user.igrejaId))
      ]);

      setMembros(m.filter((x) => x.ativo !== false));
      setVisitantes(v.filter((x) => x.ativo !== false));
      setCelulas(c.filter((x) => x.ativo !== false));
      setRelatoriosCelula(rc.filter((x) => x.ativo !== false));
      setSolicitacoesFinanceiras(sf.filter((x) => x.ativo !== false));
      setFinanceiro(f.filter((x) => x.ativo !== false));
      setEventos(e.filter((x) => x.ativo !== false));
      setAvisos(a.filter((x) => x.ativo !== false));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [user?.uid, user?.celulaId]);

  function getStateSetter(collection: CollectionName) {
    return {
      membros: [membros, setMembros],
      visitantes: [visitantes, setVisitantes],
      celulas: [celulas, setCelulas],
      relatoriosCelula: [relatoriosCelula, setRelatoriosCelula],
      solicitacoesFinanceiras: [solicitacoesFinanceiras, setSolicitacoesFinanceiras],
      financeiro: [financeiro, setFinanceiro],
      eventos: [eventos, setEventos],
      avisos: [avisos, setAvisos]
    }[collection] as [EntityMap[typeof collection][], Dispatch<SetStateAction<EntityMap[typeof collection][]>>];
  }

  async function createItem<K extends CollectionName>(collection: K, item: Omit<EntityMap[K], 'id'>): Promise<string | void> {
    if (!user) throw new Error('Usuário não autenticado.');
    if (firebaseEnabled) {
      const id = await criarDocumento(collection, item, user);
      await refresh();
      return id;
    }
    const [rows, setter] = getStateSetter(collection) as unknown as [EntityMap[K][], Dispatch<SetStateAction<EntityMap[K][]>>];
    const id = crypto.randomUUID();
    const newItem = { ...item, id, igrejaId: user.igrejaId, ativo: true } as EntityMap[K];
    const next = [newItem, ...rows];
    setter(next);
    saveLocal(collection, next);
    return id;
  }

  async function updateItem<K extends CollectionName>(collection: K, id: string, item: Partial<EntityMap[K]>) {
    if (!user) throw new Error('Usuário não autenticado.');
    if (firebaseEnabled) {
      await atualizarDocumento(collection, id, item, user);
      await refresh();
      return;
    }
    const [rows, setter] = getStateSetter(collection) as unknown as [EntityMap[K][], Dispatch<SetStateAction<EntityMap[K][]>>];
    const next = rows.map((row) => (row.id === id ? { ...row, ...item } : row));
    setter(next);
    saveLocal(collection, next);
  }

  async function removeItem<K extends CollectionName>(collection: K, id: string) {
    if (!user) throw new Error('Usuário não autenticado.');
    if (firebaseEnabled) {
      await excluirLogicamente(collection, id, user);
      await refresh();
      return;
    }
    const [rows, setter] = getStateSetter(collection) as unknown as [EntityMap[K][], Dispatch<SetStateAction<EntityMap[K][]>>];
    const next = rows.filter((row) => row.id !== id);
    setter(next);
    saveLocal(collection, next);
  }

  const value = useMemo(() => ({
    loading,
    membros,
    visitantes,
    celulas,
    relatoriosCelula,
    solicitacoesFinanceiras,
    financeiro,
    eventos,
    avisos,
    refresh,
    createItem,
    updateItem,
    removeItem
  }), [loading, membros, visitantes, celulas, relatoriosCelula, solicitacoesFinanceiras, financeiro, eventos, avisos]);

  return <ChurchDataContext.Provider value={value}>{children}</ChurchDataContext.Provider>;
}

export function useChurchData() {
  const ctx = useContext(ChurchDataContext);
  if (!ctx) throw new Error('useChurchData precisa estar dentro de ChurchDataProvider.');
  return ctx;
}
