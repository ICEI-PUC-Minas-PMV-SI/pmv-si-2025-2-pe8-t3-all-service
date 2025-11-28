import { Injectable } from '@angular/core';

export type ExportField = { key: string; header?: string };

@Injectable({ providedIn: 'root' })
export class ExportService {
  export(tipo: 'csv' | 'json' | 'xlsx', dados: any[], campos?: ExportField[], nomeBase: string = 'export') {
    if (!dados || dados.length === 0) return;
    if (tipo === 'json') return this.exportJson(dados, nomeBase + '.json');
    if (tipo === 'csv') return this.exportCsv(dados, campos, nomeBase + '.csv');
    // if (tipo==='xlsx') return this.exportXlsx(dados, campos, nomeBase+'.xlsx');
  }

  private exportJson(dados: any[], nome: string) {
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    this.baixarBlob(blob, nome);
  }

  private exportCsv(dados: any[], campos: ExportField[] | undefined, nome: string) {
    const keys = campos?.map(c => c.key) || Object.keys(dados[0]);
    const headers = campos?.map(c => c.header || c.key) || keys;
    const linhas = dados.map(row => keys.map(k => this.csvEscape(row[k])).join(';'));
    const conteudo = [headers.join(';'), ...linhas].join('\n');
    const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8;' });
    this.baixarBlob(blob, nome);
  }

  private csvEscape(v: any) {
    if (v === null || v === undefined) return '';
    const s = String(v);
    const precisaAspas = /[";\n]/.test(s);
    const esc = s.replace(/"/g, '""');
    return precisaAspas ? '"' + esc + '"' : esc;
  }

  // Requer pacote 'xlsx'
  private async exportXlsx(dados: any[], campos: ExportField[] | undefined, nome: string) {
    // try {
    //   const XLSX = await import('xlsx');
    //   const keys = campos?.map(c=> c.key) || Object.keys(dados[0]);
    //   const headers = campos?.map(c=> c.header || c.key) || keys;
    //   const sheetData = [headers, ...dados.map(row=> keys.map(k=> row[k]))];
    //   const ws = XLSX.utils.aoa_to_sheet(sheetData);
    //   const wb = XLSX.utils.book_new();
    //   XLSX.utils.book_append_sheet(wb, ws, 'Dados');
    //   XLSX.writeFile(wb, nome);
    // } catch (err) {
    //   console.error('Falha ao gerar XLSX', err);
    //   // fallback para CSV
    //   this.exportCsv(dados, campos, nome.replace(/\.xlsx$/, '.csv'));
    // }
  }

  private baixarBlob(blob: Blob, nome: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = nome; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
}
