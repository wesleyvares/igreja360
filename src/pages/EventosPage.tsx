import { FormEvent, useMemo, useState } from 'react';
import Badge from '../components/Badge';
import DataTable from '../components/DataTable';
import FormField from '../components/FormField';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { useChurchData } from '../contexts/ChurchDataContext';
import { Evento } from '../types';
import { dataBR, normalizarBusca } from '../utils/format';

const initialForm: Omit<Evento, 'id'> = { igrejaId: '', titulo: '', data: '', horario: '', local: '', publico: '', status: 'Planejado', descricao: '', ativo: true };

export default function EventosPage() {
  const { user } = useAuth();
  const { eventos, createItem, updateItem, removeItem } = useChurchData();
  const [busca, setBusca] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Evento | null>(null);
  const [form, setForm] = useState<Omit<Evento, 'id'>>(initialForm);
  const rows = useMemo(() => { const q = normalizarBusca(busca); return q ? eventos.filter((e) => [e.titulo, e.local, e.publico, e.status].some((x) => normalizarBusca(x).includes(q))) : eventos; }, [busca, eventos]);
  function novo() { setEditing(null); setForm({ ...initialForm, igrejaId: user?.igrejaId || '' }); setOpen(true); }
  function editar(row: Evento) { setEditing(row); const { id: _id, ...rest } = row; setForm(rest); setOpen(true); }
  async function salvar(e: FormEvent) { e.preventDefault(); if (!form.titulo || !form.data) return alert('Informe título e data.'); if (editing) await updateItem('eventos', editing.id, form); else await createItem('eventos', form); setOpen(false); }
  return <>
    <PageHeader title="Eventos" subtitle="Cultos, conferências, encontros, inscrições e agenda da igreja." actions={<button className="btn btn-primary" onClick={novo}>+ Novo evento</button>} />
    <div className="panel"><div className="panel-header"><div className="panel-title"><h3>Agenda</h3><span>{rows.length} evento(s)</span></div><input className="search-input" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar evento" /></div>
      <DataTable<Evento> rows={rows} columns={[
        { header: 'Título', render: (r) => <strong>{r.titulo}</strong> },
        { header: 'Data', render: (r) => dataBR(r.data) },
        { header: 'Horário', render: (r) => r.horario || '-' },
        { header: 'Local', render: (r) => r.local || '-' },
        { header: 'Público', render: (r) => r.publico || '-' },
        { header: 'Status', render: (r) => <Badge color={r.status === 'Aberto' ? 'green' : r.status === 'Cancelado' ? 'red' : 'blue'}>{r.status}</Badge> },
        { header: 'Ações', render: (r) => <div className="actions"><button className="icon-btn" onClick={() => editar(r)}>✏️</button><button className="icon-btn" onClick={() => removeItem('eventos', r.id)}>🗑️</button></div> }
      ]} /></div>
    <Modal title={editing ? 'Editar evento' : 'Novo evento'} open={open} onClose={() => setOpen(false)}><form onSubmit={salvar}><div className="form-grid">
      <FormField label="Título"><input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} /></FormField>
      <FormField label="Data"><input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} /></FormField>
      <FormField label="Horário"><input value={form.horario} onChange={(e) => setForm({ ...form, horario: e.target.value })} /></FormField>
      <FormField label="Local"><input value={form.local} onChange={(e) => setForm({ ...form, local: e.target.value })} /></FormField>
      <FormField label="Público"><input value={form.publico} onChange={(e) => setForm({ ...form, publico: e.target.value })} /></FormField>
      <FormField label="Status"><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Evento['status'] })}><option>Planejado</option><option>Aberto</option><option>Realizado</option><option>Cancelado</option></select></FormField>
      <FormField label="Descrição" full><textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></FormField>
    </div><div className="modal-actions-right"><button className="btn btn-soft" type="button" onClick={() => setOpen(false)}>Cancelar</button><button className="btn btn-success" type="submit">Salvar</button></div></form></Modal>
  </>;
}
