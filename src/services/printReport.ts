import { RelatorioCelula } from '../types';
import { ReportBrandConfig } from './reportConfig';
import { dataBR } from '../utils/format';

function esc(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function linhas(texto: string) {
  return esc(texto || '-').replace(/\n/g, '<br>');
}

function baseHtml(config: ReportBrandConfig, titulo: string, corpo: string) {
  const logo = config.logoDataUrl ? `<img src="${config.logoDataUrl}" alt="Logo" />` : '';
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(titulo)}</title>
<style>
body{font-family:Arial,sans-serif;color:#111827;margin:0;padding:32px;background:#fff}
.header{display:flex;align-items:center;gap:18px;border-bottom:4px solid ${esc(config.corPrimaria)};padding-bottom:16px;margin-bottom:22px}
.header img{width:88px;height:88px;object-fit:contain}
.header h1{margin:0;font-size:24px;color:${esc(config.corPrimaria)}}
.header p{margin:5px 0 0;color:#4b5563;white-space:pre-wrap}
h2{font-size:16px;margin:22px 0 8px;color:${esc(config.corPrimaria)}}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px 20px}
.item{padding:7px 0;border-bottom:1px solid #e5e7eb;font-size:12px}.item b{display:block;font-size:10px;text-transform:uppercase;color:#6b7280;margin-bottom:3px}
table{width:100%;border-collapse:collapse;font-size:11px}th,td{border:1px solid #d1d5db;padding:7px;text-align:left}th{background:#f3f4f6}
.footer{margin-top:28px;font-size:10px;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:10px}
@media print{body{padding:0}.no-print{display:none}}
</style></head><body>
<div class="header">${logo}<div><h1>${esc(config.nomeIgreja)}</h1><p>${linhas(config.cabecalhoRelatorios)}</p></div></div>
<h1 style="font-size:20px;margin:0 0 16px">${esc(titulo)}</h1>
${corpo}
<div class="footer">Emitido pelo Igreja 360 em ${new Date().toLocaleString('pt-BR')}.</div>
<script>window.onload=()=>{window.print()}</script></body></html>`;
}

export function emitirRelatorioCelula(relatorio: RelatorioCelula, config: ReportBrandConfig) {
  const presentes = relatorio.presencas.filter(p => p.presente);
  const ausentes = relatorio.presencas.filter(p => !p.presente);
  const corpo = `
<div class="grid">
  <div class="item"><b>Célula</b>${esc(relatorio.celulaNome)}</div>
  <div class="item"><b>Data</b>${esc(dataBR(relatorio.dataReuniao))}</div>
  <div class="item"><b>Líder</b>${esc(relatorio.liderNome)}</div>
  <div class="item"><b>Preenchido por</b>${esc(relatorio.preenchidoPorNome)}</div>
  <div class="item"><b>Participação</b>${relatorio.nivelParticipacao}/5</div>
  <div class="item"><b>Visitantes</b>${relatorio.visitantes.length}</div>
</div>
<h2>Louvor e ministrações</h2>
<div class="grid">
  <div class="item"><b>Quem tocou no louvor</b>${esc(relatorio.quemTocouLouvor)}</div>
  <div class="item"><b>Quem conduziu os louvores</b>${esc(relatorio.quemConduziuLouvores)}</div>
  <div class="item"><b>Quebra-gelo</b>${esc(relatorio.quemMinistrouQuebraGelo)}</div>
  <div class="item"><b>Palavra</b>${esc(relatorio.quemMinistrouPalavra)}</div>
  <div class="item"><b>Cadeira Vazia</b>${esc(relatorio.quemMinistrouCadeiraVazia)}</div>
</div>
<div class="item"><b>Louvores ministrados</b>${linhas(relatorio.louvoresMinistrados)}</div>
<h2>Presença</h2>
<table><thead><tr><th>Membro</th><th>Situação</th></tr></thead><tbody>
${relatorio.presencas.map(p => `<tr><td>${esc(p.nome)}</td><td>${p.presente ? 'Presente' : 'Ausente'}</td></tr>`).join('')}
</tbody></table>
<h2>Visitantes</h2>
<table><thead><tr><th>Nome</th><th>Telefone</th></tr></thead><tbody>
${relatorio.visitantes.length ? relatorio.visitantes.map(v => `<tr><td>${esc(v.nome)}</td><td>${esc(v.telefone)}</td></tr>`).join('') : '<tr><td colspan="2">Nenhum visitante</td></tr>'}
</tbody></table>
<h2>Acompanhamento</h2>
<div class="item"><b>Pedido de oração</b>${relatorio.houvePedidoOracao ? linhas(relatorio.pedidoOracaoDescricao) : 'Não houve'}</div>
<div class="item"><b>Testemunho</b>${relatorio.houveTestemunho ? linhas(relatorio.testemunhoDescricao) : 'Não houve'}</div>
<div class="item"><b>Resumo de presença</b>${presentes.length} presente(s) • ${ausentes.length} ausente(s)</div>`;
  const janela = window.open('', '_blank');
  if (!janela) return alert('Permita pop-ups para emitir o relatório.');
  janela.document.open();
  janela.document.write(baseHtml(config, 'Relatório da Célula', corpo));
  janela.document.close();
}

export function emitirRelatorioTabela(config: ReportBrandConfig, titulo: string, headers: string[], rows: Array<Array<string | number>>) {
  const corpo = `<table><thead><tr>${headers.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead>
<tbody>${rows.map(row => `<tr>${row.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  const janela = window.open('', '_blank');
  if (!janela) return alert('Permita pop-ups para emitir o relatório.');
  janela.document.open();
  janela.document.write(baseHtml(config, titulo, corpo));
  janela.document.close();
}
