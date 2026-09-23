import { FormEvent, useMemo, useState } from 'react';
import Badge from '../components/Badge';
import DataTable from '../components/DataTable';
import FormField from '../components/FormField';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { useChurchData } from '../contexts/ChurchDataContext';
import { Aviso } from '../types';
import { dataBR, normalizarBusca } from '../utils/format';

const initialForm: Omit<Aviso, 'id'> = { igrejaId: '', titulo: '', publico: 'Todos', dataPublicacao: '', status: 'Rascunho', mensagem: '', ativo: true };

export default function AvisosPage() {
  const { user } = useAuth();
  const { avisos, createItem, updateItem, removeItem } = useChurchData();
  const [busca, setBusca] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Aviso | null>(null);
  const [form, setForm] = useState<Omit<Aviso, 'id'>>(initialForm);
  const rows = useMemo(() => { const q = normalizarBusca(busca); return q ? avisos.filter((a) => [a.titulo, a.publico, a.status, a.mensagem].some((x) => normalizarBusca(x).includes(q))) : avisos; }, [busca, avisos]);
  function novo() { setEditing(null); setForm({ ...initialForm, igrejaId: user?.igrejaId || '' }); setOpen(true); }
  function editar(row: Aviso) { setEditing(row); const { id: _id, ...rest } = row; setForm(rest); setOpen(true); }
  async function salvar(e: FormEvent) { e.preventDefault(); if (!form.titulo || !form.mensagem) return alert('Informe título e mensagem.'); if (editing) await updateItem('avisos', editing.id, form); else await createItem('avisos', form); setOpen(false); }
  return <>
    <PageHeader title="Avisos" subtitle="Comunicados para membros, equipes, líderes e visitantes." actions={<button className="btn btn-primary" onClick={novo}>+ Novo aviso</button>} />
    <div className="panel"><div className="panel-header"><div className="panel-title"><h3>Comunicados</h3><span>{rows.length} aviso(s)</span></div><input className="search-input" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar aviso" /></div>
      <DataTable<Aviso> rows={rows} columns={[
        { header: 'Título', render: (r) => <strong>{r.titulo}</strong> },
        { header: 'Público', render: (r) => r.publico },
        { header: 'Publicação', render: (r) => dataBR(r.dataPublicacao) },
        { header: 'Status', render: (r) => <Badge color={r.status === 'Publicado' ? 'green' : 'gray'}>{r.status}</Badge> },
        { header: 'Mensagem', render: (r) => <span className="line-clamp">{r.mensagem}</span> },
        { header: 'Ações', render: (r) => <div className="actions"><button className="icon-btn" onClick={() => editar(r)}>✏️</button><button className="icon-btn" onClick={() => removeItem('avisos', r.id)}>🗑️</button></div> }
      ]} /></div>
    <Modal title={editing ? 'Editar aviso' : 'Novo aviso'} open={open} onClose={() => setOpen(false)}><form onSubmit={salvar}><div className="form-grid">
      <FormField label="Título"><input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} /></FormField>
      <FormField label="Público"><input value={form.publico} onChange={(e) => setForm({ ...form, publico: e.target.value })} /></FormField>
      <FormField label="Data"><input type="date" value={form.dataPublicacao} onChange={(e) => setForm({ ...form, dataPublicacao: e.target.value })} /></FormField>
      <FormField label="Status"><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Aviso['status'] })}><option>Rascunho</option><option>Publicado</option></select></FormField>
      <FormField label="Mensagem" full><textarea value={form.mensagem} onChange={(e) => setForm({ ...form, mensagem: e.target.value })} /></FormField>
    </div><div className="modal-actions-right"><button className="btn btn-soft" type="button" onClick={() => setOpen(false)}>Cancelar</button><button className="btn btn-success" type="submit">Salvar</button></div></form></Modal>
  </>;
}
