import { InjectionToken } from '@angular/core';

export type DataScope = 'source' | 'filtered';

export interface MetricComputeResult {
  value: number | string;
  description?: string;
  trend?: 'up' | 'down' | 'flat';
  icon?: string;
  tone?: 'sucesso' | 'alerta' | 'erro';
  accent?: string;
  iconColor?: string;
}

export type MetricDefinition = {
  id: string;
  label: string;
  compute: (rows: any[]) => MetricComputeResult;
  scope?: DataScope;
};

export type ChartDefinition = {
  id: string;
  label: string;
  type: 'line'|'bar'|'donut'|'pie';
  build: (rows: any[]) => { series: any[]; xaxis?: any; labels?: any[]; colors?: string[]; tooltip?: any };
  scope?: DataScope;
};

export interface DataInsightConfig {
  entity: string; // 'faturas','ordens','clientes', etc
  metrics: MetricDefinition[];
  charts: ChartDefinition[];
}

export const DEFAULT_METRICS_CONFIG = new InjectionToken<DataInsightConfig>('DEFAULT_METRICS_CONFIG');
