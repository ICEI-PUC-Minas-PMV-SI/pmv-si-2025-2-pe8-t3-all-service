import { computed, Injectable, signal } from '@angular/core';
import { DataInsightConfig, DataScope } from './metrics-config';

@Injectable({ providedIn: 'root' })
export class DynamicInsightService {
  private _sourceRows = signal<any[]>([]);
  private _filteredRows = signal<any[] | null>(null);
  private _config = signal<DataInsightConfig | null>(null);

  setConfig(config: DataInsightConfig) { this._config.set(config); }
  setRows(rows: any[]) { this.setFilteredRows(rows); }
  setSourceRows(rows: any[]) { this._sourceRows.set(rows ?? []); }
  setFilteredRows(rows: any[] | null) { this._filteredRows.set(rows ?? null); }
  clearFilteredRows() { this._filteredRows.set(null); }

  private resolveRows(scope: DataScope | undefined): any[] {
    const source = this._sourceRows();
    const filtered = this._filteredRows();
    if ((scope ?? 'filtered') === 'filtered') {
      return filtered ?? source;
    }
    return source;
  }

  metrics = computed(()=> {
    const cfg = this._config();
    if (!cfg) return [];
    return cfg.metrics.map(m => {
      const rows = this.resolveRows(m.scope ?? 'filtered');
      const r = m.compute(rows);
      return { id:m.id, label:m.label, ...r };
    });
  });

  charts = computed(()=> {
    const cfg = this._config();
    if (!cfg) return [];
    return cfg.charts.map(c => {
      const rows = this.resolveRows(c.scope ?? 'source');
      return { id:c.id, label:c.label, type:c.type, ...c.build(rows) };
    });
  });
}
