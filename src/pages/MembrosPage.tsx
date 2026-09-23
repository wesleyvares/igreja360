import { FormEvent, useMemo, useState } from 'react';
import Badge from '../components/Badge';
import DataTable from '../components/DataTable';
import FormField from '../components/FormField';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { useChurchData } from '../contexts/ChurchDataContext';
import { exportarXlsx } from '../services/exportXlsx';
import { Membro } from '../types';
import { normalizarBusca } from '../utils/format';

const initialForm: Omit<Membro, 'id'> = {
  igrejaId: '', nome: '', telefone: '', email: '', tipo: 'Membro', status: 'Ativo', ministerio: '', celulaId: '', dataNascimento: '', endereco: '', observacoes: '', ativo: true
};

export default function MembrosPage() {
  const { user } = useAuth();
  const { membros, celulas, createItem, updateItem, removeItem } = useChurchData();
  const [busca, setBusca] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Membro | null>(null);
  const [form, setForm] = useState<Omit<Membro, 'id'>>(initialForm);

  const rows = useMemo(() => {
    const q = normalizarBusca(busca);
    if (!q) return membros;
    return membros.filter((m) => [m.nome, m.telefone, m.email, m.ministerio, m.status].some((v) => normalizarBusca(v).includes(q)));
  }, [busca, membros]);

  function novo() {
    setEditing(null);
    setForm({ ...initialForm, igrejaId: user?.igrejaId || '' });
    setOpen(true);
  }

  function editar(row: Membro) {
    setEditing(row);
    const { id: _id, ...rest } = row;
    setForm(rest);
    setOpen(true);
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!form.nome) return alert('Informe o nome do membro.');
    if (editing) await updateItem('membros', editing.id, form);
    else await createItem('membros', form);
    setOpen(false);
  }

  return (
    <>
      <PageHeader
        title="Membros"
        subtitle="Cadastro completo dos membros, ministérios, células e status de acompanhamento."
        actions={<><button className="btn btn-soft" onClick={() => exportarXlsx(rows, 'membros_igreja360.csv', 'Membros')}>Exportar XLSX</button><button className="btn btn-primary" onClick={novo}>+ Novo membro</button></>}
      />

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title"><h3>Lista de membros</h3><span>{rows.length} registro(s) exibido(s)</span></div>
          <input className="search-input" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, telefone, ministério ou status" />
        </div>
        <DataTable<Membro>
          rows={rows}
          minWidth={1050}
          columns={[
            { header: 'Nome', render: (r) => <strong>{r.nome}</strong> },
            { header: 'Telefone', render: (r) => r.telefone || '-' },
            { header: 'E-mail', render: (r) => r.email || '-' },
            { header: 'Tipo', render: (r) => <Badge color="blue">{r.tipo}</Badge> },
            { header: 'Status', render: (r) => <Badge color={r.status === 'Ativo' ? 'green' : r.status === 'Acompanhar' ? 'orange' : 'gray'}>{r.status}</Badge> },
            { header: 'Ministério', render: (r) => r.ministerio || '-' },
            { header: 'Célula', render: (r) => celulas.find((c) => c.id === r.celulaId)?.nome || '-' },
            { header: 'Ações', render: (r) => <div className="actions"><button className="icon-btn" onClick={() => editar(r)}>✏️</button><button className="icon-btn" onClick={() => removeItem('membros', r.id)}>🗑️</button></div> }
          ]}
        />
      </div>

      <Modal title={editing ? 'Editar membro' : 'Novo membro'} open={open} onClose={() => setOpen(false)}>
        <form onSubmit={salvar}>
          <div className="form-grid">
            <FormField label="Nome"><input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></FormField>
            <FormField label="Telefone"><input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} /></FormField>
            <FormField label="E-mail"><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></FormField>
            <FormField label="Tipo"><select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as Membro['tipo'] })}><option>Membro</option><option>Visitante integrado</option><option>Liderança</option></select></FormField>
            <FormField label="Status"><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Membro['status'] })}><option>Ativo</option><option>Acompanhar</option><option>Inativo</option></select></FormField>
            <FormField label="Ministério"><input value={form.ministerio} onChange={(e) => setForm({ ...form, ministerio: e.target.value })} /></FormField>
            <FormField label="Célula"><select value={form.celulaId} onChange={(e) => setForm({ ...form, celulaId: e.target.value })}><option value="">Sem célula</option>{celulas.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></FormField>
            <FormField label="Nascimento"><input type="date" value={form.dataNascimento} onChange={(e) => setForm({ ...form, dataNascimento: e.target.value })} /></FormField>
            <FormField label="Endereço"><input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} /></FormField>
            <FormField label="Observações" full><textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} /></FormField>
          </div>
          <div className="modal-actions-right"><button className="btn btn-soft" type="button" onClick={() => setOpen(false)}>Cancelar</button><button className="btn btn-success" type="submit">Salvar</button></div>
        </form>
      </Modal>
    </>
  );
}
