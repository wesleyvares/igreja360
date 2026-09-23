import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { AppUser, CollectionName, EntityMap } from '../types';

export async function listarColecao<K extends CollectionName>(colecao: K, igrejaId: string): Promise<EntityMap[K][]> {
  if (!db) return [];
  const ref = collection(db, colecao);
  const q = query(ref, where('igrejaId', '==', igrejaId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as EntityMap[K]);
}

export async function listarMembrosPorCelula(igrejaId: string, celulaId: string): Promise<EntityMap['membros'][]> {
  if (!db || !celulaId) return [];
  const ref = collection(db, 'membros');
  const q = query(ref, where('igrejaId', '==', igrejaId), where('celulaId', '==', celulaId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as EntityMap['membros']);
}

export async function buscarCelulaPorId(celulaId: string): Promise<EntityMap['celulas'][]> {
  if (!db || !celulaId) return [];
  const snap = await getDoc(doc(db, 'celulas', celulaId));
  if (!snap.exists()) return [];
  return [{ id: snap.id, ...snap.data() } as EntityMap['celulas']];
}

export async function listarRelatoriosCelula(igrejaId: string, celulaId?: string): Promise<EntityMap['relatoriosCelula'][]> {
  if (!db) return [];
  const ref = collection(db, 'relatoriosCelula');
  const q = celulaId
    ? query(ref, where('igrejaId', '==', igrejaId), where('celulaId', '==', celulaId), orderBy('dataReuniao', 'desc'))
    : query(ref, where('igrejaId', '==', igrejaId), orderBy('dataReuniao', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as EntityMap['relatoriosCelula']);
}

export async function listarFinanceiro(igrejaId: string): Promise<EntityMap['financeiro'][]> {
  if (!db) return [];
  const ref = collection(db, 'financeiro');
  const q = query(ref, where('igrejaId', '==', igrejaId), orderBy('data', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as EntityMap['financeiro']);
}

export async function criarDocumento<K extends CollectionName>(colecao: K, payload: Omit<EntityMap[K], 'id'>, user: AppUser) {
  if (!db) throw new Error('Firebase não configurado.');
  const ref = collection(db, colecao);
  const docRef = await addDoc(ref, {
    ...payload,
    igrejaId: user.igrejaId,
    ativo: true,
    criadoPor: user.uid,
    criadoEm: serverTimestamp(),
    atualizadoPor: user.uid,
    atualizadoEm: serverTimestamp()
  });
  await registrarAuditoria(user, `criou_${colecao}`, colecao, docRef.id);
  return docRef.id;
}

export async function atualizarDocumento<K extends CollectionName>(colecao: K, id: string, payload: Partial<EntityMap[K]>, user: AppUser) {
  if (!db) throw new Error('Firebase não configurado.');
  await updateDoc(doc(db, colecao, id), {
    ...payload,
    atualizadoPor: user.uid,
    atualizadoEm: serverTimestamp()
  });
  await registrarAuditoria(user, `atualizou_${colecao}`, colecao, id);
}

export async function excluirLogicamente<K extends CollectionName>(colecao: K, id: string, user: AppUser) {
  if (!db) throw new Error('Firebase não configurado.');
  await updateDoc(doc(db, colecao, id), {
    ativo: false,
    excluidoPor: user.uid,
    excluidoEm: serverTimestamp()
  });
  await registrarAuditoria(user, `excluiu_${colecao}`, colecao, id);
}

export async function apagarDefinitivo<K extends CollectionName>(colecao: K, id: string, user: AppUser) {
  if (!db) throw new Error('Firebase não configurado.');
  await deleteDoc(doc(db, colecao, id));
  await registrarAuditoria(user, `apagou_${colecao}`, colecao, id);
}

async function registrarAuditoria(user: AppUser, acao: string, colecao: string, registroId: string) {
  if (!db) return;
  await addDoc(collection(db, 'auditoria'), {
    igrejaId: user.igrejaId,
    usuarioId: user.uid,
    usuarioEmail: user.email,
    perfil: user.perfil,
    acao,
    colecao,
    registroId,
    criadoEm: serverTimestamp()
  });
}
