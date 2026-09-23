function valorCsv(valor: unknown) {
  const texto = String(valor ?? '').replace(/"/g, '""');
  return `"${texto}"`;
}

export function exportarXlsx<T extends object>(rows: T[], filename: string, _sheetName = 'Dados') {
  const extensao = filename.toLowerCase().endsWith('.csv') ? filename : filename.replace(/\.xlsx$/i, '') + '.csv';
  if (!rows.length) {
    const blobVazio = new Blob([''], { type: 'text/csv;charset=utf-8;' });
    baixar(blobVazio, extensao);
    return;
  }

  const headers = Object.keys(rows[0] as Record<string, unknown>);
  const linhas = rows.map((row) => headers.map((header) => valorCsv((row as Record<string, unknown>)[header])).join(';'));
  const csv = '\ufeff' + [headers.map(valorCsv).join(';'), ...linhas].join('\n');
  baixar(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), extensao);
}

function baixar(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
