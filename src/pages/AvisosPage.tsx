import { FormEvent, useMemo, useState } from 'react';
import Badge from '../components/Badge';
import DataTable from '../components/DataTable';
import FormField from '../components/FormField';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { useChurchData } from '../contexts/ChurchDataContext';
import { avisoEstaVigente } from '../services/communication';
import { Aviso } from '../types';
import { dataBR, normalizarBusca } from '../utils/format';

const initialForm: Omit<Aviso, 'id'> = {
  igrejaId: '', titulo: '', publico: 'Todos', dataPublicacao: '', validadeAte: '', status: 'Rascunho', mensagem: '', ativo: true
};

export default function AvisosPage() {
  const { user } = useAuth();
  const { avisos, membros, celulas, createItem, updateItem, removeItem } = useChurchData();
  const [busca, setBusca] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Aviso | null>(null);
  const [form, setForm] = useState<Omit<Aviso, 'id'>>(initialForm);

  const rows = useMemo(() => {
    const q = normalizarBusca(busca);
    return q ? avisos.filter((a) => [a.titulo, a.publico, a.status, a.mensagem].some((x) => normalizarBusca(x).includes(q))) : avisos;
  }, [busca, avisos]);

  const publicos = useMemo(() => {
    const ministerios = [...new Set(membros.map((m) => m.ministerio).filter(Boolean))].map((m) => `Ministério: ${m}`);
    const gruposCelula = celulas.map((c) => `Célula: ${c.nome}`);
    return ['Todos', 'Membros', 'Visitantes', 'Liderança', 'Equipe de mídia', ...ministerios, ...gruposCelula];
  }, [membros, celulas]);

  function novo() {
    setEditing(null);
    const hoje = new Date().toISOString().slice(0, 10);
    setForm({ ...initialForm, igrejaId: user?.igrejaId || '', dataPublicacao: hoje });
    setOpen(true);
  }

  function editar(row: Aviso) {
    setEditing(row);
    const { id: _id, ...rest } = row;
    setForm({ ...initialForm, ...rest });
    setOpen(true);
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!form.titulo || !form.mensagem) return alert('Informe título e mensagem.');
    if (!form.dataPublicacao || !form.validadeAte) return alert('Informe a data de publicação e a validade do aviso.');
    if (form.validadeAte < form.dataPublicacao) return alert('A validade não pode ser anterior à publicação.');

    if (editing) await updateItem('avisos', editing.id, form);
    else await createItem('avisos', form);
    setOpen(false);
  }

  return <>
    <PageHeader title="Gerenciar avisos" subtitle="Crie mensagens com público, período de validade e publicação no quadro de avisos." actions={<button className="btn btn-primary" onClick={novo}>+ Novo aviso</button>} />
    <div className="panel">
      <div className="panel-header"><div className="panel-title"><h3>Comunicados</h3><span>{rows.length} aviso(s) • os publicados e dentro da validade aparecem no quadro</span></div><input className="search-input" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar aviso" /></div>
      <DataTable<Aviso> rows={rows} minWidth={1000} columns={[
        { header: 'Título', render: (r) => <strong>{r.titulo}</strong> },
        { header: 'Público', render: (r) => r.publico },
        { header: 'Publicação', render: (r) => dataBR(r.dataPublicacao) },
        { header: 'Validade', render: (r) => dataBR(r.validadeAte) },
        { header: 'Situação', render: (r) => r.status === 'Publicado' ? <Badge color={avisoEstaVigente(r) ? 'green' : 'gray'}>{avisoEstaVigente(r) ? 'Vigente' : 'Fora do prazo'}</Badge> : <Badge color="gray">Rascunho</Badge> },
        { header: 'Mensagem', render: (r) => <span className="line-clamp">{r.mensagem}</span> },
        { header: 'Ações', render: (r) => <div className="actions"><button className="icon-btn" onClick={() => editar(r)}>✏️</button><button className="icon-btn" onClick={() => removeItem('avisos', r.id)}>🗑️</button></div> }
      ]} />
    </div>

    <Modal title={editing ? 'Editar aviso' : 'Novo aviso'} open={open} onClose={() => setOpen(false)}>
      <form onSubmit={salvar}><div className="form-grid">
        <FormField label="Título"><input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} /></FormField>
        <FormField label="Público"><select value={form.publico} onChange={(e) => setForm({ ...form, publico: e.target.value })}>{publicos.map((p) => <option key={p}>{p}</option>)}</select></FormField>
        <FormField label="Status"><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Aviso['status'] })}><option>Rascunho</option><option>Publicado</option></select></FormField>
        <FormField label="Publicar a partir de"><input type="date" value={form.dataPublicacao} onChange={(e) => setForm({ ...form, dataPublicacao: e.target.value })} /></FormField>
        <FormField label="Válido até"><input type="date" value={form.validadeAte} onChange={(e) => setForm({ ...form, validadeAte: e.target.value })} /></FormField>
        <FormField label="Mensagem" full><textarea value={form.mensagem} onChange={(e) => setForm({ ...form, mensagem: e.target.value })} /></FormField>
      </div><div className="modal-actions-right"><button className="btn btn-soft" type="button" onClick={() => setOpen(false)}>Cancelar</button><button className="btn btn-success" type="submit">Salvar aviso</button></div></form>
    </Modal>
  </>;
}
