import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CartaoGraficoComponent } from '../../../componentes/ui/cartao-grafico/cartao-grafico.component';
import { EstadoVazioComponent } from '../../../componentes/ui/estado-vazio/estado-vazio.component';
import { MenuExportacaoComponent } from '../../../componentes/ui/exportacao/opcoes-exportacao.component';
import { CartaoIndicadorComponent } from '../../../componentes/ui/indicador/cartao-indicador.component';
import { CentralNotificacoesComponent } from '../../../componentes/ui/notificacao/central-notificacoes.component';
import { NotificacaoService } from '../../../componentes/ui/notificacao/notificacao.service';
import { PaginacaoComponent } from '../../../componentes/ui/paginacao/paginacao.component';
import { SeletorColunasComponent } from '../../../componentes/ui/seletor-colunas/seletor-colunas.component';
import { CabecalhoOrdenavelDirective } from '../../../componentes/ui/tabela/cabecalho-ordenavel.directive';
import { AcaoLinha, MenuAcoesLinhaComponent } from '../../../componentes/ui/tabela/menu-acoes-linha.component';
import { HeaderService } from '../../../layout/header.service';
import { ServicosDataService } from '../../../shared/data/servicos-data.service';
import {
    STATUS_CLASSES,
    STATUS_SERVICO_OPCOES,
    ServicoRelatorio,
    StatusServico,
    TIPOS_PAGAMENTO_OPCOES,
    TipoPagamento,
    formatarEnum,
} from '../../../shared/data/servicos.model';
import { ExportService } from '../../../shared/export/export.service';
import { DynamicInsightService } from '../../../shared/metrics/dynamic-insight.service';
import { ORDENS_STATUS_ORDER, ordensInsightConfig } from './ordens-insight.config';

type ColunaId = 'ordem' | 'empresa' | 'descricao' | 'status' | 'data' | 'valor' | 'tipoPagamento' | 'notaFiscal';

interface OrdemRow {
  id: string;
  ordem: string;
  empresa: string;
  descricao: string;
  status: StatusServico;
  data: string;
  valor: number;
  tipoPagamento: TipoPagamento;
  notaFiscal: string | null;
  servico: ServicoRelatorio;
}

interface FiltroAvancado {
  termo: string;
  status: Set<StatusServico>;
  tipoPagamento: Set<TipoPagamento>;
  dataInicio: string;
  dataFim: string;
  empresa: string;
}

function clonarServico(servico: ServicoRelatorio): ServicoRelatorio {
  return {
    ...servico,
    empresa: { ...servico.empresa },
    usuario: { ...servico.usuario },
  };
}

@Component({
  selector: 'app-ordens',
  standalone: true,
  imports: [
    DatePipe,
    CartaoIndicadorComponent,
    CartaoGraficoComponent,
    SeletorColunasComponent,
    MenuExportacaoComponent,
    EstadoVazioComponent,
    MenuAcoesLinhaComponent,
    PaginacaoComponent,
    CentralNotificacoesComponent,
    CabecalhoOrdenavelDirective,
  ],
  template: `
    <section class="space-y-4">
      <as-central-notificacoes />

      @if (mostrarFiltros()) {
        <div class="bg-white rounded-lg shadow ring-1 ring-green-100 divide-y divide-green-100">
          <form class="p-4 grid gap-4 md:grid-cols-4 text-sm" (submit)="$event.preventDefault()">
            <label class="flex flex-col gap-1 md:col-span-2">
              <span class="font-medium text-green-800">Empresa</span>
              <select class="border border-green-200 rounded px-3 py-2 focus:ring-2 focus:ring-green-300 outline-none" (change)="atualizarEmpresa($event)" [value]="filtro().empresa">
                <option value="">Todas</option>
                @for (empresa of empresasDisponiveis(); track empresa) {
                  <option [value]="empresa">{{ empresa }}</option>
                }
              </select>
            </label>
            <label class="flex flex-col gap-1">
              <span class="font-medium text-green-800">Data inicial</span>
              <input type="date" class="border border-green-200 rounded px-3 py-2 focus:ring-2 focus:ring-green-300 outline-none" (change)="atualizarData('dataInicio', $event)" [value]="filtro().dataInicio" />
            </label>
            <label class="flex flex-col gap-1">
              <span class="font-medium text-green-800">Data final</span>
              <input type="date" class="border border-green-200 rounded px-3 py-2 focus:ring-2 focus:ring-green-300 outline-none" (change)="atualizarData('dataFim', $event)" [value]="filtro().dataFim" />
            </label>
          </form>
          <div class="p-4 grid gap-4 md:grid-cols-2 text-sm">
            <fieldset class="flex flex-col gap-2">
              <legend class="font-medium text-green-800">Status</legend>
              <div class="flex flex-wrap gap-2">
                @for (status of statusDisponiveis; track status) {
                  <button type="button" class="px-2 py-1 rounded border text-xs transition" (click)="toggleStatus(status)"
                          [class.bg-emerald-600]="filtro().status.has(status)" [class.text-white]="filtro().status.has(status)" [class.border-emerald-600]="filtro().status.has(status)"
                          [class.bg-white]="!filtro().status.has(status)" [class.text-emerald-700]="!filtro().status.has(status)" [class.border-emerald-300]="!filtro().status.has(status)">
                    {{ formatarEnum(status) }}
                  </button>
                }
              </div>
            </fieldset>
            <fieldset class="flex flex-col gap-2">
              <legend class="font-medium text-green-800">Pagamento</legend>
              <div class="flex flex-wrap gap-2">
                @for (pagamento of pagamentosDisponiveis; track pagamento) {
                  <button type="button" class="px-2 py-1 rounded border text-xs transition" (click)="togglePagamento(pagamento)"
                          [class.bg-teal-600]="filtro().tipoPagamento.has(pagamento)" [class.text-white]="filtro().tipoPagamento.has(pagamento)" [class.border-teal-600]="filtro().tipoPagamento.has(pagamento)"
                          [class.bg-white]="!filtro().tipoPagamento.has(pagamento)" [class.text-teal-700]="!filtro().tipoPagamento.has(pagamento)" [class.border-teal-300]="!filtro().tipoPagamento.has(pagamento)">
                    {{ formatarEnum(pagamento) }}
                  </button>
                }
              </div>
            </fieldset>
          </div>
          <div class="p-3 flex items-center justify-between text-xs bg-green-50 flex-wrap gap-3">
            <div class="flex gap-2 flex-wrap">
              @if (filtro().empresa) {
                <span class="inline-flex items-center gap-1 bg-white border border-green-200 px-2 py-1 rounded">
                  <i class="fas fa-industry"></i> {{ filtro().empresa }}
                  <button type="button" (click)="limparCampo('empresa')" class="text-red-500 hover:text-red-700"><i class="fas fa-times"></i></button>
                </span>
              }
              @if (filtro().dataInicio) {
                <span class="inline-flex items-center gap-1 bg-white border border-green-200 px-2 py-1 rounded">
                  <i class="fas fa-calendar-day"></i> Início: {{ filtro().dataInicio | date:'dd/MM/yyyy' }}
                  <button type="button" (click)="limparCampo('dataInicio')" class="text-red-500 hover:text-red-700"><i class="fas fa-times"></i></button>
                </span>
              }
              @if (filtro().dataFim) {
                <span class="inline-flex items-center gap-1 bg-white border border-green-200 px-2 py-1 rounded">
                  <i class="fas fa-calendar-day"></i> Fim: {{ filtro().dataFim | date:'dd/MM/yyyy' }}
                  <button type="button" (click)="limparCampo('dataFim')" class="text-red-500 hover:text-red-700"><i class="fas fa-times"></i></button>
                </span>
              }
              @for (status of filtro().status; track status) {
                <span class="inline-flex items-center gap-1 bg-white border border-green-200 px-2 py-1 rounded">
                  <i class="fas fa-clipboard-list"></i> {{ formatarEnum(status) }}
                  <button type="button" (click)="toggleStatus(status)" class="text-red-500 hover:text-red-700"><i class="fas fa-times"></i></button>
                </span>
              }
              @for (pagamento of filtro().tipoPagamento; track pagamento) {
                <span class="inline-flex items-center gap-1 bg-white border border-emerald-200 px-2 py-1 rounded">
                  <i class="fas fa-credit-card"></i> {{ formatarEnum(pagamento) }}
                  <button type="button" (click)="togglePagamento(pagamento)" class="text-red-500 hover:text-red-700"><i class="fas fa-times"></i></button>
                </span>
              }
              @if (filtro().termo) {
                <span class="inline-flex items-center gap-1 bg-white border border-green-200 px-2 py-1 rounded">
                  <i class="fas fa-search"></i> {{ filtro().termo }}
                  <button type="button" (click)="limparCampo('termo')" class="text-red-500 hover:text-red-700"><i class="fas fa-times"></i></button>
                </span>
              }
            </div>
            <div class="flex gap-2">
              <button
                type="button"
                class="as-filter-reset"
                (click)="limparFiltros()"
                [disabled]="!haAlgumFiltro()">
                <i class="fas fa-eraser"></i>
                Limpar filtros
              </button>
            </div>
          </div>
        </div>
      }

      @let cards = topMetrics();
      <div class="as-kpi-grid">
        @for (card of cards; track card.id) {
          <as-cartao-indicador
            [titulo]="card.label"
            [valor]="card.value"
            [descricao]="card.description || ''"
            [icone]="card.icon"
            [tendencia]="card.trend"
            [accent]="card.accent"
            [tipo]="card.tone"
          />
        }
      </div>

      <section class="ordens-charts">
        <div class="as-charts-grid">
        <as-cartao-grafico
          titulo="Distribuição por status"
          icone="fas fa-chart-pie"
          tipo="donut"
          [series]="statusSeries()"
          [rotulos]="statusLabels()"
          [cores]="statusColors()"
          [dica]="statusTooltip()"
          [legenda]="statusLegend()"
          descricao="Mostra o volume de ordens por status operacional"
          (fatiaSelecionada)="filtrarPorStatus($event)"
        >
          <button
            chart-extra
            type="button"
            class="ordens-charts__reset"
            (click)="limparFiltrosGraficos()"
            [disabled]="!temFiltroGrafico()">
            <i class="fas fa-filter-circle-xmark"></i>
            Limpar
          </button>
        </as-cartao-grafico>
        <as-cartao-grafico
          titulo="Evolução mensal"
          icone="fas fa-chart-line"
          tipo="line"
          [series]="timelineSeries()"
          [eixoX]="timelineXAxis()"
          [dica]="timelineTooltip()"
          descricao="Quantidade de ordens abertas por mês"
          (pontoSelecionado)="filtrarPorMes($event)"
        ></as-cartao-grafico>
        <as-cartao-grafico
          titulo="Meios de pagamento"
          icone="fas fa-credit-card"
          tipo="donut"
          [series]="pagamentoSeries()"
          [rotulos]="pagamentoLabels()"
          [cores]="pagamentoColors()"
          [dica]="pagamentoTooltip()"
          descricao="Preferência de cobrança dos clientes"
          (fatiaSelecionada)="filtrarPorPagamento($event)"
        />
        </div>
      </section>

      @if (selecionados().size > 0) {
        <div class="ordens-selection-bar">
          <span><strong>{{ selecionados().size }}</strong> selecionada(s)</span>
          <div class="ordens-selection-bar__actions">
            <button type="button" (click)="finalizarSelecionadas()"><i class="fas fa-flag-checkered"></i> Finalizar</button>
            <button type="button" (click)="exportarSelecionadas()"><i class="fas fa-file-export"></i> Exportar</button>
            <button type="button" class="danger" (click)="excluirSelecionadas()"><i class="fas fa-trash"></i> Excluir</button>
            <button type="button" class="ghost" (click)="limparSelecao()"><i class="fas fa-times"></i> Cancelar</button>
          </div>
        </div>
      }

      <div class="ordens-table-card">
        <div class="ordens-table-card__body">
          <div class="ordens-table-card__toolbar">
            <div class="ordens-table-card__legend">
              <h3>Ordens de serviço</h3>
              <p>Gerencie faturamento e andamento das ordens criadas.</p>
            </div>
            <div class="ordens-table-card__actions">
              <as-seletor-colunas [colunas]="colunas()" (alterou)="alternarColuna($event)" />
              <as-menu-exportacao (selecionou)="exportarFormato($event)" />
            </div>
          </div>

          <div class="ordens-table-wrapper">
            <table class="ordens-table">
              <thead>
                <tr>
                  <th class="w-12">
                    <input type="checkbox" [checked]="todosSelecionadosPagina()" [indeterminate]="indeterminadoPagina()" (change)="toggleSelecionarTodosPagina($event)" aria-label="Selecionar página" />
                  </th>
                  @for (coluna of colunasVisiveis(); track coluna.id) {
                    <th
                      [asOrdenavel]="coluna.id"
                      (click)="clicarOrdenacao(coluna.id, $event)"
                      [class.whitespace-nowrap]="['ordem','data','valor','tipoPagamento','status'].includes(coluna.id)"
                      [class.col-cliente]="coluna.id==='empresa'">
                      <span class="inline-flex items-center gap-1">
                        {{ coluna.label }}
                        @if (ordenacao().coluna === coluna.id && ordenacao().direcao !== 'none') {
                          <i class="fas" [class.fa-sort-up]="ordenacao().direcao === 'asc'" [class.fa-sort-down]="ordenacao().direcao === 'desc'"></i>
                        } @else {
                          <i class="fas fa-sort text-green-300"></i>
                        }
                      </span>
                    </th>
                  }
                  <th class="col-acoes">Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (linha of paginaOrdenada(); track linha.id; let idx = $index) {
                  <tr
                    class="ordens-row"
                    [class.is-selected]="selecionados().has(linha.id)"
                    [class.is-even]="idx % 2 === 0"
                    [class.is-odd]="idx % 2 === 1"
                    role="checkbox"
                    tabindex="0"
                    [attr.aria-checked]="selecionados().has(linha.id)"
                    (click)="toggleSelecionado(linha.id)"
                    (keydown.enter)="toggleSelecionadoPorTecla($event, linha.id)"
                    (keydown.space)="toggleSelecionadoPorTecla($event, linha.id)">
                    <td>
                      <input type="checkbox" [checked]="selecionados().has(linha.id)" (click)="$event.stopPropagation()" (change)="toggleSelecionado(linha.id)" [attr.aria-label]="'Selecionar ordem ' + linha.ordem" />
                    </td>
                    @for (coluna of colunasVisiveis(); track coluna.id) {
                      <td
                        [class.font-mono]="coluna.id==='ordem'"
                        [class.whitespace-nowrap]="['ordem','data','valor','tipoPagamento','status'].includes(coluna.id)"
                        [class.col-cliente]="coluna.id==='empresa'">
                        @switch (coluna.id) {
                          @case ('ordem') { {{ linha.ordem }} }
                          @case ('empresa') { {{ linha.empresa }} }
                          @case ('descricao') { {{ linha.descricao }} }
                          @case ('status') {
                            <span class="status-badge" [class]="statusClasse(linha.status)">
                              {{ formatarEnum(linha.status) }}
                            </span>
                          }
                          @case ('data') { {{ linha.data }} }
                          @case ('valor') { <span class="valor-destaque">{{ formatarMoeda(linha.valor) }}</span> }
                          @case ('tipoPagamento') { {{ formatarEnum(linha.tipoPagamento) }} }
                          @case ('notaFiscal') { {{ linha.notaFiscal ?? '—' }} }
                        }
                      </td>
                    }
                    <td class="col-acoes">
                      <as-menu-acoes-linha [acoes]="acoesLinha" (acionar)="acaoLinha($event, linha)" />
                    </td>
                  </tr>
                }
                @if (paginaOrdenada().length === 0) {
                  <tr>
                    <td [attr.colspan]="colunasVisiveis().length + 2">
                      <as-estado-vazio titulo="Sem ordens" descricao="Ajuste os filtros ou cadastre uma nova ordem." />
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
        <div class="ordens-table-card__footer">
          <div>
            {{ intervaloInicio()+1 }}–{{ intervaloFim() }} de {{ linhasFiltradas().length }} ordens
            @if (selecionados().size > 0) { • {{ selecionados().size }} selecionada(s) }
          </div>
          <as-paginacao [pagina]="pagina()" [tamanhoPagina]="tamanhoPagina()" [total]="linhasFiltradas().length" (mudouPagina)="mudarPagina($event)" />
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host {
      --ordens-highlight: rgba(16, 185, 129, 0.12);
    }
    .ordens-charts {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-top: 0.5rem;
    }
    .ordens-charts__reset {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.85rem;
      border-radius: 999px;
      border: 1px solid rgba(14, 116, 144, 0.35);
      background: rgba(255, 255, 255, 0.95);
      color: #0f766e;
      font-size: 0.75rem;
      font-weight: 600;
      transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease;
    }
    .ordens-charts__reset:hover:not(:disabled) {
      background: rgba(14, 116, 144, 0.08);
      border-color: rgba(14, 116, 144, 0.5);
    }
    .ordens-charts__reset:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
    .ordens-selection-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem 1.25rem;
      padding: 0.85rem 1.25rem;
      border-radius: 1rem;
      border: 1px solid rgba(16, 185, 129, 0.18);
      background: linear-gradient(140deg, rgba(16, 185, 129, 0.12) 0%, rgba(240, 253, 244, 0.75) 100%);
      color: #064e3b;
      font-size: 0.85rem;
    }
    .ordens-selection-bar__actions {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 0.6rem;
    }
    .ordens-selection-bar__actions button {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.4rem 0.8rem;
      border-radius: 999px;
      border: 1px solid rgba(16, 185, 129, 0.22);
      background: rgba(255, 255, 255, 0.9);
      color: #047857;
      font-weight: 500;
      font-size: 0.75rem;
      transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease;
    }
    .ordens-selection-bar__actions button:hover {
      background: rgba(16, 185, 129, 0.1);
    }
    .ordens-selection-bar__actions button.danger {
      border-color: rgba(220, 38, 38, 0.35);
      color: #b91c1c;
    }
    .ordens-selection-bar__actions button.danger:hover {
      background: rgba(254, 226, 226, 0.8);
    }
    .ordens-selection-bar__actions button.ghost {
      border-color: rgba(148, 163, 184, 0.3);
      color: #475569;
    }
    .ordens-selection-bar__actions button.ghost:hover {
      background: rgba(226, 232, 240, 0.7);
    }
    :host ::ng-deep .ordens-table-card {
      border-radius: 1.25rem;
      border: 1px solid rgba(16, 185, 129, 0.12);
      background: linear-gradient(150deg, #ffffff 0%, rgba(240, 253, 244, 0.55) 100%);
      box-shadow: 0 18px 40px -32px rgba(4, 120, 87, 0.4);
      overflow: hidden;
    }
    :host ::ng-deep .ordens-table-card__body {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      padding: 1.75rem;
    }
    :host ::ng-deep .ordens-table-card__toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem 1.5rem;
    }
    :host ::ng-deep .ordens-table-card__legend h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #065f46;
    }
    :host ::ng-deep .ordens-table-card__legend p {
      margin: 0.25rem 0 0;
      font-size: 0.75rem;
      color: #0f766e;
    }
    :host ::ng-deep .ordens-table-card__actions {
      display: inline-flex;
      gap: 0.75rem;
      align-items: center;
    }
    :host ::ng-deep .ordens-table-wrapper {
      border-radius: 1.1rem;
      border: 1px solid rgba(16, 185, 129, 0.18);
      background: rgba(255, 255, 255, 0.94);
      box-shadow: inset 0 1px 0 rgba(209, 250, 229, 0.6);
      overflow-x: auto;
      overflow-y: hidden;
    }
    :host ::ng-deep .ordens-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      font-size: 0.85rem;
      color: #064e3b;
    }
    :host ::ng-deep .ordens-table thead th {
      text-align: left;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-size: 0.8rem;
      padding: 0.6rem 1rem;
      background: rgba(236, 253, 245, 0.75);
      color: #065f46;
      border-bottom: 1px solid rgba(16, 185, 129, 0.22);
    }
    :host ::ng-deep .ordens-table tbody td {
      padding: 0.6rem 1rem;
      border-bottom: 1px solid rgba(16, 185, 129, 0.1);
      vertical-align: middle;
    }
    :host ::ng-deep .ordens-row {
      cursor: pointer;
      transition: background-color 180ms ease, box-shadow 180ms ease, transform 140ms ease;
    }
    :host ::ng-deep .ordens-row.is-even:not(.is-selected) {
      background: rgba(255, 255, 255, 0.98);
    }
    :host ::ng-deep .ordens-row.is-odd:not(.is-selected) {
      background: rgba(236, 253, 245, 0.45);
    }
    :host ::ng-deep .ordens-row:hover:not(.is-selected) {
      background: rgba(236, 253, 245, 0.75);
      box-shadow: inset 0 0 0 1px rgba(16, 185, 129, 0.22);
    }
    :host ::ng-deep .ordens-row.is-selected {
      background: rgba(209, 250, 229, 0.9);
      box-shadow: inset 0 0 0 2px rgba(5, 150, 105, 0.35);
    }
    :host ::ng-deep .ordens-row:active {
      transform: scale(0.998);
    }
    :host ::ng-deep .valor-destaque {
      font-weight: 600;
      color: #047857;
    }
    :host ::ng-deep .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.6rem;
      border-radius: 999px;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.01em;
    }
    :host ::ng-deep .ordens-table .col-cliente {
      min-width: 14rem;
    }
    :host ::ng-deep .ordens-table .col-acoes {
      text-align: center;
      white-space: nowrap;
      min-width: 12rem;
    }
    :host ::ng-deep .ordens-table-card__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem 1.25rem;
      padding: 0 1.75rem 1.5rem;
      font-size: 0.75rem;
      color: #047857;
    }
    @media (max-width: 768px) {
      :host ::ng-deep .ordens-table-card__body {
        padding: 1.25rem;
      }
      :host ::ng-deep .ordens-table tbody td,
      :host ::ng-deep .ordens-table thead th {
        padding: 0.65rem 0.75rem;
      }
    }

    /* Dark theme */
    :host-context([data-theme='dark']) .bg-white {
      background: linear-gradient(150deg, rgba(22, 27, 34, 0.98) 0%, rgba(13, 17, 23, 0.95) 100%);
    }
    :host-context([data-theme='dark']) .ring-green-100 {
      border-color: rgba(52, 211, 153, 0.32);
    }
    :host-context([data-theme='dark']) .divide-green-100 > * {
      border-color: rgba(52, 211, 153, 0.22);
    }
    :host-context([data-theme='dark']) .text-green-800,
    :host-context([data-theme='dark']) .text-green-700 {
      color: #6ee7b7;
    }
    :host-context([data-theme='dark']) .border-green-200,
    :host-context([data-theme='dark']) .border-green-300 {
      border-color: rgba(52, 211, 153, 0.32);
    }
    :host-context([data-theme='dark']) select,
    :host-context([data-theme='dark']) input[type="date"] {
      background: rgba(13, 17, 23, 0.9);
      color: #d1fae5;
    }
    :host-context([data-theme='dark']) .bg-green-50 {
      background: rgba(13, 17, 23, 0.85);
    }
    :host-context([data-theme='dark']) .bg-emerald-600 {
      background: rgba(52, 211, 153, 0.9);
      color: #0a0f14;
    }
    :host-context([data-theme='dark']) .border-emerald-600 {
      border-color: rgba(52, 211, 153, 0.9);
    }
    :host-context([data-theme='dark']) .text-emerald-700 {
      color: #a8b4c8;
    }
    :host-context([data-theme='dark']) .border-emerald-300 {
      border-color: rgba(52, 211, 153, 0.32);
    }
    :host-context([data-theme='dark']) .bg-teal-600 {
      background: rgba(45, 212, 191, 0.9);
      color: #0a0f14;
    }
    :host-context([data-theme='dark']) .border-teal-600 {
      border-color: rgba(45, 212, 191, 0.9);
    }
    :host-context([data-theme='dark']) .text-teal-700 {
      color: #a8b4c8;
    }
    :host-context([data-theme='dark']) .border-teal-300 {
      border-color: rgba(45, 212, 191, 0.32);
    }
    :host-context([data-theme='dark']) .ordens-charts__reset {
      background: rgba(13, 17, 23, 0.95);
      border-color: rgba(45, 212, 191, 0.35);
      color: #5eead4;
    }
    :host-context([data-theme='dark']) .ordens-charts__reset:hover:not(:disabled) {
      background: rgba(45, 212, 191, 0.1);
      border-color: rgba(45, 212, 191, 0.5);
    }
    :host-context([data-theme='dark']) .as-filter-reset {
      background: rgba(13, 17, 23, 0.95);
      border-color: rgba(52, 211, 153, 0.35);
      color: #6ee7b7;
    }
    :host-context([data-theme='dark']) .as-filter-reset:hover:not(:disabled) {
      background: rgba(52, 211, 153, 0.1);
      border-color: rgba(52, 211, 153, 0.5);
    }
    :host-context([data-theme='dark']) .ordens-selection-bar {
      background: linear-gradient(140deg, rgba(52, 211, 153, 0.15) 0%, rgba(13, 17, 23, 0.85) 100%);
      border-color: rgba(52, 211, 153, 0.32);
      color: #d1fae5;
    }
    :host-context([data-theme='dark']) .ordens-selection-bar__actions button {
      background: rgba(13, 17, 23, 0.9);
      border-color: rgba(52, 211, 153, 0.32);
      color: #6ee7b7;
    }
    :host-context([data-theme='dark']) .ordens-selection-bar__actions button:hover {
      background: rgba(52, 211, 153, 0.15);
    }
    :host-context([data-theme='dark']) .ordens-selection-bar__actions button.danger {
      border-color: rgba(239, 68, 68, 0.45);
      color: #f87171;
    }
    :host-context([data-theme='dark']) .ordens-selection-bar__actions button.danger:hover {
      background: rgba(239, 68, 68, 0.15);
    }
    :host-context([data-theme='dark']) .ordens-selection-bar__actions button.ghost {
      border-color: rgba(148, 163, 184, 0.4);
      color: #a8b4c8;
    }
    :host-context([data-theme='dark']) .ordens-selection-bar__actions button.ghost:hover {
      background: rgba(148, 163, 184, 0.1);
    }
    :host-context([data-theme='dark']) ::ng-deep .ordens-table-card {
      background: linear-gradient(150deg, rgba(22, 27, 34, 0.98) 0%, rgba(13, 17, 23, 0.95) 100%);
      border-color: rgba(52, 211, 153, 0.32);
      box-shadow: 0 18px 40px -32px rgba(52, 211, 153, 0.3);
    }
    :host-context([data-theme='dark']) ::ng-deep .ordens-table-card__legend h3 {
      color: #6ee7b7;
    }
    :host-context([data-theme='dark']) ::ng-deep .ordens-table-card__legend p {
      color: #a8b4c8;
    }
    :host-context([data-theme='dark']) ::ng-deep .ordens-table-wrapper {
      background: rgba(13, 17, 23, 0.95);
      border-color: rgba(52, 211, 153, 0.28);
      box-shadow: inset 0 1px 0 rgba(52, 211, 153, 0.15);
    }
    :host-context([data-theme='dark']) ::ng-deep .ordens-table {
      color: #d1fae5;
    }
    :host-context([data-theme='dark']) ::ng-deep .ordens-table thead th {
      background: rgba(22, 27, 34, 0.9);
      color: #6ee7b7;
      border-color: rgba(52, 211, 153, 0.32);
    }
    :host-context([data-theme='dark']) ::ng-deep .ordens-table tbody td {
      border-color: rgba(52, 211, 153, 0.15);
    }
    :host-context([data-theme='dark']) ::ng-deep .ordens-row.is-even:not(.is-selected) {
      background: rgba(22, 27, 34, 0.8);
    }
    :host-context([data-theme='dark']) ::ng-deep .ordens-row.is-odd:not(.is-selected) {
      background: rgba(13, 17, 23, 0.9);
    }
    :host-context([data-theme='dark']) ::ng-deep .ordens-row:hover:not(.is-selected) {
      background: rgba(52, 211, 153, 0.1);
      box-shadow: inset 0 0 0 1px rgba(52, 211, 153, 0.32);
    }
    :host-context([data-theme='dark']) ::ng-deep .ordens-row.is-selected {
      background: rgba(52, 211, 153, 0.2);
      box-shadow: inset 0 0 0 2px rgba(52, 211, 153, 0.4);
    }
    :host-context([data-theme='dark']) ::ng-deep .valor-destaque {
      color: #6ee7b7;
    }
    :host-context([data-theme='dark']) ::ng-deep .ordens-table-card__footer {
      color: #a8b4c8;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdensComponent implements OnInit, OnDestroy {
  private readonly header = inject(HeaderService);
  private readonly notificacao = inject(NotificacaoService);
  private readonly insight = inject(DynamicInsightService);
  private readonly exportSvc = inject(ExportService);
  private readonly router = inject(Router);
  private readonly servicosData = inject(ServicosDataService);

  readonly formatarEnum = formatarEnum;
  readonly statusDisponiveis = STATUS_SERVICO_OPCOES;
  readonly pagamentosDisponiveis = TIPOS_PAGAMENTO_OPCOES;
  readonly empresasDisponiveis = computed(() =>
    Array.from(
      new Set(
        this.todas()
          .map((servico) => servico.empresa?.nome ?? '')
          .filter((nome): nome is string => !!nome)
      )
    ).sort((a, b) => a.localeCompare(b, 'pt-BR'))
  );

  private readonly storageKey = 'ordens:v2';

  private readonly todas = signal<ServicoRelatorio[]>([]);
  readonly carregando = signal(false);

  readonly filtro = signal<FiltroAvancado>({
    termo: '',
    status: new Set<StatusServico>(),
    tipoPagamento: new Set<TipoPagamento>(),
    dataInicio: '',
    dataFim: '',
    empresa: '',
  });

  readonly mostrarFiltros = signal(false);
  readonly pagina = signal(1);
  readonly tamanhoPagina = signal(10);
  readonly ordenacao = signal<{ coluna: ColunaId; direcao: 'asc' | 'desc' | 'none' }>({ coluna: 'data', direcao: 'desc' });
  readonly selecionados = signal<Set<string>>(new Set());

  readonly selectedStatusChart = signal<StatusServico | null>(null);
  readonly selectedMonthChart = signal<string | null>(null);
  readonly selectedPagamentoChart = signal<TipoPagamento | null>(null);
  readonly temFiltroGrafico = computed(() =>
    Boolean(this.selectedStatusChart() || this.selectedMonthChart() || this.selectedPagamentoChart())
  );

  readonly filtradasServicos = computed(() => {
    const { termo, status, tipoPagamento, dataInicio, dataFim, empresa } = this.filtro();
    const busca = termo.trim().toLowerCase();
    const statusChart = this.selectedStatusChart();
    const mesChart = this.selectedMonthChart();
    const pagamentoChart = this.selectedPagamentoChart();

    return this.todas().filter((servico) => {
      if (busca) {
        const campos = [
          servico.id,
          servico.ordemServico ?? '',
          servico.notaFiscal ?? '',
          servico.empresa?.nome ?? '',
          servico.descricaoPeca ?? '',
          servico.clienteCertificado ?? '',
          servico.vendedor ?? '',
        ].map((campo) => campo.toString().toLowerCase());
        if (!campos.some((campo) => campo.includes(busca))) {
          return false;
        }
      }

      if (status.size > 0 && !status.has(servico.status)) {
        return false;
      }

      if (tipoPagamento.size > 0 && !tipoPagamento.has(servico.tipoPagamento)) {
        return false;
      }

      if (empresa && servico.empresa?.nome !== empresa) {
        return false;
      }

      if (dataInicio && servico.data < dataInicio) {
        return false;
      }

      if (dataFim && servico.data > dataFim) {
        return false;
      }

      if (statusChart && servico.status !== statusChart) {
        return false;
      }

      if (pagamentoChart && servico.tipoPagamento !== pagamentoChart) {
        return false;
      }

      if (mesChart) {
        const mes = (servico.data ?? '').substring(0, 7);
        if (mes !== mesChart) {
          return false;
        }
      }

      return true;
    });
  });

  readonly linhasFiltradas = computed<OrdemRow[]>(() =>
    this.filtradasServicos().map((servico) => ({
      id: servico.id,
      ordem: servico.ordemServico ?? servico.id,
      empresa: servico.empresa?.nome ?? '—',
      descricao: servico.descricaoPeca ?? '—',
      status: servico.status,
      data: servico.data,
      valor: servico.valorTotal ?? 0,
      tipoPagamento: servico.tipoPagamento,
      notaFiscal: servico.notaFiscal,
      servico,
    }))
  );

  readonly colunas = signal<{ id: ColunaId; label: string; oculta: boolean }[]>([
    { id: 'ordem', label: 'Ordem', oculta: false },
    { id: 'empresa', label: 'Empresa', oculta: false },
    { id: 'descricao', label: 'Descrição', oculta: false },
    { id: 'status', label: 'Status', oculta: false },
    { id: 'data', label: 'Data', oculta: false },
    { id: 'valor', label: 'Valor', oculta: false },
    { id: 'tipoPagamento', label: 'Pagamento', oculta: false },
    { id: 'notaFiscal', label: 'Nota Fiscal', oculta: true },
  ]);

  readonly colunasVisiveis = computed(() => this.colunas().filter((coluna) => !coluna.oculta));

  readonly paginaAtual = computed(() => {
    const inicio = (this.pagina() - 1) * this.tamanhoPagina();
    return this.linhasFiltradas().slice(inicio, inicio + this.tamanhoPagina());
  });

  readonly paginaOrdenada = computed(() => {
    const { coluna, direcao } = this.ordenacao();
    if (direcao === 'none') {
      return this.paginaAtual();
    }
    const ordenada = [...this.paginaAtual()].sort((a, b) => this.comparar(a[coluna], b[coluna]));
    return direcao === 'asc' ? ordenada : ordenada.reverse();
  });

  readonly todosSelecionadosPagina = computed(() =>
    this.paginaOrdenada().length > 0 && this.paginaOrdenada().every((linha) => this.selecionados().has(linha.id))
  );

  readonly indeterminadoPagina = computed(() =>
    !this.todosSelecionadosPagina() && this.paginaOrdenada().some((linha) => this.selecionados().has(linha.id))
  );

  readonly intervaloInicio = computed(() => (this.pagina() - 1) * this.tamanhoPagina());
  readonly intervaloFim = computed(() => Math.min(this.intervaloInicio() + this.paginaOrdenada().length, this.linhasFiltradas().length));

  readonly metrics = this.insight.metrics;
  readonly charts = this.insight.charts;
  readonly topMetrics = computed(() => this.metrics().slice(0, 6));

  private readonly chartStatus = computed(() => this.insight.charts().find((c: any) => c.id === 'status'));
  readonly statusSeries = computed(() => {
    const chart = this.chartStatus();
    return Array.isArray(chart?.series) ? (chart!.series as any[]) : [];
  });
  readonly statusLabels = computed(() => (this.chartStatus()?.labels as string[]) || []);
  readonly statusColors = computed(() => this.colorsForChart(this.chartStatus()));
  readonly statusTooltip = computed(() => this.chartStatus()?.tooltip ?? {});
  private readonly statusResumo = computed(() => {
    const counts = ORDENS_STATUS_ORDER.reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {} as Record<StatusServico, number>);
    for (const linha of this.linhasFiltradas()) {
      counts[linha.status] = (counts[linha.status] ?? 0) + 1;
    }
    const total = Object.values(counts).reduce((acc, valor) => acc + valor, 0);
    return { counts, total };
  });
  private readonly statusLabelToStatus = computed(() => {
    const mapa = new Map<string, StatusServico>();
    ORDENS_STATUS_ORDER.forEach((status) => mapa.set(formatarEnum(status), status));
    return mapa;
  });
  readonly statusLegend = computed(() => {
    const resumo = this.statusResumo();
    const mapa = this.statusLabelToStatus();
    return {
      show: true,
      position: 'bottom',
      horizontalAlign: 'left',
      fontSize: '13px',
      itemMargin: { horizontal: 12, vertical: 6 },
      labels: { colors: '#0f172a' },
      markers: { width: 10, height: 10, offsetX: -4 },
      formatter: (label: string) => {
        const status = mapa.get(label);
        if (!status) {
          return label;
        }
        const quantidade = resumo.counts[status] ?? 0;
        return `${label}: ${quantidade} ordens | ${this.percentual(quantidade, resumo.total)}`;
      },
    };
  });

  private readonly chartTimeline = computed(() => this.insight.charts().find((c: any) => c.id === 'timeline'));
  readonly timelineSeries = computed(() => (this.chartTimeline()?.series as any[]) || []);
  readonly timelineXAxis = computed(() => this.chartTimeline()?.xaxis || { categories: [] });
  readonly timelineTooltip = computed(() => this.chartTimeline()?.tooltip ?? {});

  private readonly chartPagamento = computed(() => this.insight.charts().find((c: any) => c.id === 'pagamento'));
  readonly pagamentoSeries = computed(() => (this.chartPagamento()?.series as any[]) || []);
  readonly pagamentoLabels = computed(() => (this.chartPagamento()?.labels as string[]) || []);
  readonly pagamentoColors = computed(() => this.colorsForChart(this.chartPagamento()));
  readonly pagamentoTooltip = computed(() => this.chartPagamento()?.tooltip ?? {});
  private readonly headerActionsEffect = effect(() => {
    const _toggle = this.mostrarFiltros();
    const temDados = this.linhasFiltradas().length > 0;
    this.header.actions.set(this.obterAcoesHeader(temDados));
  });
  private readonly headerSearchEffect = effect(() => {
    const termo = this.filtro().termo;
    const searchConfig = this.header.search();
    if (!searchConfig) {
      return;
    }
    if (searchConfig.value === termo) {
      return;
    }
    this.header.patchSearch({ value: termo });
  });

  constructor() {
    this.insight.setConfig(ordensInsightConfig);
    this.carregarPersistido();

    effect(() => this.insight.setSourceRows(this.todas()));
    effect(() => this.insight.setFilteredRows(this.filtradasServicos()));
    effect(() => {
      const filtroAtual = this.filtro();
      const payload = {
        filtro: {
          termo: filtroAtual.termo,
          status: Array.from(filtroAtual.status),
          tipoPagamento: Array.from(filtroAtual.tipoPagamento),
          dataInicio: filtroAtual.dataInicio,
          dataFim: filtroAtual.dataFim,
          empresa: filtroAtual.empresa,
        },
        colunasOcultas: this.colunas()
          .filter((coluna) => coluna.oculta)
          .map((coluna) => coluna.id),
        ordenacao: this.ordenacao(),
        filtrosGraficos: {
          status: this.selectedStatusChart(),
          mes: this.selectedMonthChart(),
          pagamento: this.selectedPagamentoChart(),
        },
      };
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(payload));
      } catch {
        /* ignore */
      }
    });
  }

  ngOnInit(): void {
    this.configurarHeader();
    void this.carregarServicos();
  }

  ngOnDestroy(): void {
    this.header.reset();
  }

  private async carregarServicos(): Promise<void> {
    if (this.carregando()) {
      return;
    }
    this.carregando.set(true);
    try {
      const servicos = await this.servicosData.obterServicos();
      this.todas.set(servicos.map(clonarServico));
    } catch (erro) {
      console.error('[OrdensComponent] Falha ao carregar serviços', erro);
      this.notificacao.erro('Não foi possível carregar as ordens de serviço.');
      this.todas.set([]);
    } finally {
      this.carregando.set(false);
    }
  }

  private configurarHeader(): void {
    this.header.setHeader('Ordens de Serviço', this.obterAcoesHeader(this.linhasFiltradas().length > 0));
    this.header.setSearch({
      placeholder: 'Buscar ordem, cliente ou nota fiscal',
      ariaLabel: 'Buscar ordens de serviço',
      value: this.filtro().termo,
      onChange: (valor) => this.definirTermoBuscaRapida(valor),
      onSubmit: (valor) => this.definirTermoBuscaRapida(valor.trim()),
    });
  }

  private obterAcoesHeader(temDados: boolean) {
    return [
      {
        id: 'toggle-filtros',
        label: this.mostrarFiltros() ? 'Fechar filtros' : 'Filtros',
        icon: 'fas fa-filter',
        variant: 'secundario' as const,
        execute: () => this.toggleMostrarFiltros(),
      },
      {
        id: 'exportar',
        label: 'Exportar',
        icon: 'fas fa-file-export',
        variant: 'fantasma' as const,
        className: 'as-outline-button',
        disabled: () => !temDados,
        execute: () => this.exportarFormato('xlsx'),
      },
      {
        id: 'nova-ordem',
        label: 'Nova ordem',
        icon: 'fas fa-plus',
        variant: 'primario' as const,
        execute: () => this.criarOrdem(),
      },
    ];
  }

  private definirTermoBuscaRapida(valor: string): void {
    this.patchFiltro({ termo: valor });
  }

  toggleMostrarFiltros(): void {
    this.mostrarFiltros.update((valor) => !valor);
  }

  haAlgumFiltro(): boolean {
    const atual = this.filtro();
    return !!(
      atual.termo ||
      atual.status.size ||
      atual.tipoPagamento.size ||
      atual.dataInicio ||
      atual.dataFim ||
      atual.empresa
    );
  }

  limparFiltros(): void {
    this.filtro.set({
      termo: '',
      status: new Set(),
      tipoPagamento: new Set(),
      dataInicio: '',
      dataFim: '',
      empresa: '',
    });
    this.pagina.set(1);
    this.limparSelecao();
  }

  limparFiltrosGraficos(): void {
    if (!this.temFiltroGrafico()) {
      return;
    }
    this.selectedStatusChart.set(null);
    this.selectedMonthChart.set(null);
    this.selectedPagamentoChart.set(null);
    this.pagina.set(1);
    this.notificacao.mostrar('Filtros de gráficos limpos.', 'info');
  }

  atualizarTermo(evento: Event): void {
    const valor = (evento.target as HTMLInputElement | null)?.value ?? '';
    this.patchFiltro({ termo: valor });
  }

  atualizarData(campo: 'dataInicio' | 'dataFim', evento: Event): void {
    const valor = (evento.target as HTMLInputElement | null)?.value ?? '';
    this.patchFiltro({ [campo]: valor } as Partial<FiltroAvancado>);
  }

  atualizarEmpresa(evento: Event): void {
    const valor = (evento.target as HTMLSelectElement | null)?.value ?? '';
    this.patchFiltro({ empresa: valor });
  }

  toggleStatus(status: StatusServico): void {
    const proximo = new Set(this.filtro().status);
    proximo.has(status) ? proximo.delete(status) : proximo.add(status);
    this.patchFiltro({ status: proximo });
  }

  togglePagamento(pagamento: TipoPagamento): void {
    const proximo = new Set(this.filtro().tipoPagamento);
    proximo.has(pagamento) ? proximo.delete(pagamento) : proximo.add(pagamento);
    this.patchFiltro({ tipoPagamento: proximo });
  }

  limparCampo(campo: 'termo' | 'dataInicio' | 'dataFim' | 'empresa'): void {
    this.patchFiltro({ [campo]: '' } as Partial<FiltroAvancado>);
  }

  alternarColuna(id: string): void {
    this.colunas.update((colunas) => colunas.map((coluna) => (coluna.id === id ? { ...coluna, oculta: !coluna.oculta } : coluna)));
  }

  mudarPagina(pagina: number): void {
    this.pagina.set(pagina);
    this.limparSelecao();
  }

  clicarOrdenacao(coluna: ColunaId, evento: Event): void {
    evento.preventDefault();
    this.ordenacao.update((atual) => {
      if (atual.coluna !== coluna) {
        return { coluna, direcao: 'asc' };
      }
      const proxima = atual.direcao === 'asc' ? 'desc' : atual.direcao === 'desc' ? 'none' : 'asc';
      return { coluna, direcao: proxima };
    });
  }

  toggleSelecionado(id: string): void {
    this.selecionados.update((selecionados) => {
      const proximo = new Set(selecionados);
      proximo.has(id) ? proximo.delete(id) : proximo.add(id);
      return proximo;
    });
  }

  toggleSelecionadoPorTecla(evento: Event, id: string): void {
    evento.preventDefault();
    this.toggleSelecionado(id);
  }

  toggleSelecionarTodosPagina(evento: Event): void {
    const marcado = (evento.target as HTMLInputElement).checked;
    this.selecionados.update((selecionados) => {
      const proximo = new Set(selecionados);
      this.paginaOrdenada().forEach((linha) => {
        if (marcado) {
          proximo.add(linha.id);
        } else {
          proximo.delete(linha.id);
        }
      });
      return proximo;
    });
  }

  limparSelecao(): void {
    this.selecionados.set(new Set());
  }

  readonly acoesLinha: AcaoLinha[] = [
    { id: 'ver', icone: 'fas fa-eye', titulo: 'Visualizar' },
    { id: 'editar', icone: 'fas fa-pen', titulo: 'Editar' },
    { id: 'duplicar', icone: 'fas fa-clone', titulo: 'Duplicar' },
    { id: 'download', icone: 'fas fa-download', titulo: 'Baixar relatório' },
    { id: 'faturar', icone: 'fas fa-money-check-dollar', titulo: 'Faturar' },
    { id: 'excluir', icone: 'fas fa-trash', titulo: 'Excluir', variante: 'perigo' },
  ];

  acaoLinha(acao: string, linha: OrdemRow): void {
    switch (acao) {
      case 'ver':
        this.navegarParaOrdem(linha, 'visualizar');
        break;
      case 'editar':
        this.navegarParaOrdem(linha, 'editar');
        break;
      case 'duplicar':
        this.duplicarServico(linha.servico);
        break;
      case 'download':
        this.baixarDocumentos(linha.servico);
        break;
      case 'faturar':
        this.faturarOrdem(linha.servico);
        break;
      case 'excluir':
        this.excluirOrdem(linha.servico.id);
        break;
      default:
        break;
    }
  }

  private baixarDocumentos(servico: ServicoRelatorio): void {
    this.notificacao.sucesso('Relatório em PDF gerado.');
  }

  private faturarOrdem(servico: ServicoRelatorio): void {
    const proximoStatus: StatusServico = servico.status === 'AGUARDANDO_PAGAMENTO' ? 'FATURADO' : 'AGUARDANDO_PAGAMENTO';
    const mensagem = proximoStatus === 'FATURADO'
      ? 'Pagamento registrado para a ordem.'
      : 'Ordem enviada para faturamento.';
    const agora = new Date().toISOString();
    this.todas.update((lista) =>
      lista.map((item) => (item.id === servico.id ? { ...item, status: proximoStatus, dataAtualizacao: agora } : item))
    );
    this.notificacao.sucesso(mensagem);
  }

  finalizarSelecionadas(): void {
    const ids = Array.from(this.selecionados());
    if (!ids.length) {
      return;
    }
    const agora = new Date().toISOString();
    this.todas.update((lista) =>
      lista.map((servico) => (ids.includes(servico.id) ? { ...servico, status: 'CONCLUIDO', dataAtualizacao: agora } : servico))
    );
    this.notificacao.sucesso(`${ids.length} ordem(ns) finalizadas.`);
    this.limparSelecao();
  }

  excluirSelecionadas(): void {
    const ids = this.selecionados();
    if (!ids.size) {
      return;
    }
    this.todas.update((lista) => lista.filter((servico) => !ids.has(servico.id)));
    this.notificacao.sucesso(`${ids.size} ordem(ns) removidas.`);
    this.limparSelecao();
    this.pagina.set(1);
  }

  exportarSelecionadas(): void {
    const selecionados = this.selecionados();
    if (!selecionados.size) {
      this.notificacao.mostrar('Nenhuma ordem selecionada para exportar.', 'info');
      return;
    }
    const dados = this.prepararExport(this.linhasFiltradas().filter((linha) => selecionados.has(linha.id)));
    if (!dados.length) {
      this.notificacao.mostrar('Nenhuma ordem selecionada para exportar.', 'info');
      return;
    }
    this.exportSvc.export('xlsx', dados, this.colunasVisiveis().map((coluna) => ({ key: coluna.id, header: coluna.label })), 'ordens');
    this.notificacao.sucesso('Exportação das selecionadas iniciada.');
  }

  exportarFormato(formato: string): void {
    const dados = this.prepararExport(this.linhasFiltradas());
    this.exportSvc.export(formato as any, dados, this.colunasVisiveis().map((coluna) => ({ key: coluna.id, header: coluna.label })), 'ordens');
    this.notificacao.sucesso(`Exportação (${formato.toUpperCase()}) iniciada.`);
  }

  colorsForChart(chart: any): string[] {
    if (chart?.id === 'status') {
      const selecionado = this.selectedStatusChart();
      const cores: string[] = chart.colors || [];
      return cores.map((cor: string, indice: number) => (!selecionado || ORDENS_STATUS_ORDER[indice] === selecionado ? cor : '#d1d5db'));
    }
    if (chart?.id === 'pagamento') {
      const selecionado = this.selectedPagamentoChart();
      const cores: string[] = chart.colors || [];
      return cores.map((cor: string, indice: number) => (!selecionado || TIPOS_PAGAMENTO_OPCOES[indice] === selecionado ? cor : '#d1d5db'));
    }
    return chart?.colors || [];
  }

  statusClasse(status: StatusServico): string {
    return STATUS_CLASSES[status] ?? 'bg-slate-200 text-slate-700';
  }

  formatarMoeda(valor: number): string {
    return 'R$ ' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  private percentual(parte: number, total: number): string {
    if (!total) {
      return '0%';
    }
    return (parte / total * 100).toFixed(0) + '%';
  }

  private comparar(a: unknown, b: unknown): number {
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }
    const textoA = (a ?? '').toString();
    const textoB = (b ?? '').toString();
    if (textoA === textoB) {
      return 0;
    }
    return textoA > textoB ? 1 : -1;
  }

  private patchFiltro(parcial: Partial<FiltroAvancado>): void {
    this.filtro.update((atual) => ({ ...atual, ...parcial }));
    this.pagina.set(1);
    this.limparSelecao();
  }

  private navegarParaOrdem(linha: OrdemRow, modo: 'visualizar' | 'editar'): void {
    const destino = modo === 'editar' ? ['/servicos', linha.id, 'editar'] : ['/servicos', linha.id];
    const mensagem = modo === 'editar' ? `Editando serviço ${linha.id}` : `Visualizando serviço ${linha.id}`;
    this.notificacao.mostrar(mensagem, 'info');
    this.router.navigate(destino);
  }

  private duplicarServico(servico: ServicoRelatorio): void {
    const agora = new Date();
    const dataBase = agora.toISOString().substring(0, 10);
    const copia: ServicoRelatorio = {
      ...clonarServico(servico),
      id: `${servico.id}-C`,
      data: dataBase,
      dataVencimento: dataBase,
      notaFiscal: null,
      valorImposto: 0,
      valorLiquido: servico.valorTotal ?? 0,
      tipoPagamento: servico.tipoPagamento,
      status: 'ABERTO',
      numeroCertificado: servico.numeroCertificado ? `${servico.numeroCertificado}-C` : null,
      ordemServico: servico.ordemServico ? `${servico.ordemServico}-C` : `OS-${agora.getFullYear()}-${(Math.floor(Math.random() * 900) + 100).toString()}`,
      observacao: null,
      observacaoInterna: null,
      quantidadePecas: servico.quantidadePecas,
      descricaoPeca: servico.descricaoPeca,
      diametroPeca: servico.diametroPeca,
      larguraPeca: servico.larguraPeca,
      larguraTotalPeca: servico.larguraTotalPeca,
      pesoPeca: servico.pesoPeca,
      rpmPeca: servico.rpmPeca,
      planoUmPermitido: servico.planoUmPermitido,
      planoDoisPermitido: servico.planoDoisPermitido,
      planoUmEncontrado: servico.planoUmEncontrado,
      planoDoisEncontrado: servico.planoDoisEncontrado,
      raioPlanoUm: servico.raioPlanoUm,
      raioPlanoDois: servico.raioPlanoDois,
      remanescentePlanoUm: servico.remanescentePlanoUm,
      remanescentePlanoDois: servico.remanescentePlanoDois,
      vendedor: servico.vendedor,
      comissaoPercentual: servico.comissaoPercentual,
      orcamentoReferencia: servico.orcamentoReferencia,
      assinaturaResponsavel: servico.assinaturaResponsavel,
      clienteCertificado: servico.clienteCertificado,
      giroQuadratico: servico.giroQuadratico,
      valorTotal: servico.valorTotal ?? 0,
      imposto: servico.imposto,
      dataCriacao: agora.toISOString(),
      dataAtualizacao: agora.toISOString(),
    };
    this.todas.update((lista) => [copia, ...lista]);
    this.notificacao.sucesso('Ordem duplicada. Atualize os dados antes de salvar.');
  }

  private finalizarOrdem(id: string): void {
    const agora = new Date().toISOString();
    this.todas.update((lista) => lista.map((servico) => (servico.id === id ? { ...servico, status: 'CONCLUIDO', dataAtualizacao: agora } : servico)));
    this.notificacao.sucesso('Ordem concluída.');
    this.limparSelecao();
  }

  private excluirOrdem(id: string): void {
    this.todas.update((lista) => lista.filter((servico) => servico.id !== id));
    this.selecionados.update((selecionados) => {
      const proximo = new Set(selecionados);
      proximo.delete(id);
      return proximo;
    });
    this.notificacao.sucesso('Ordem removida.');
  }

  private prepararExport(linhas: OrdemRow[]) {
    return linhas.map((linha) => ({
      ordem: linha.ordem,
      empresa: linha.empresa,
      descricao: linha.descricao,
      status: formatarEnum(linha.status),
      data: linha.data,
      valor: this.formatarMoeda(linha.valor),
      tipoPagamento: formatarEnum(linha.tipoPagamento),
      notaFiscal: linha.notaFiscal ?? '—',
    }));
  }

  filtrarPorStatus(evento: { indice: number }): void {
    const status = ORDENS_STATUS_ORDER[evento.indice];
    if (!status) {
      return;
    }
    if (this.selectedStatusChart() === status) {
      this.selectedStatusChart.set(null);
      this.notificacao.mostrar('Filtro de status: todos', 'info');
    } else {
      this.selectedStatusChart.set(status);
      this.notificacao.mostrar(`Filtro de status: ${formatarEnum(status)}`, 'info');
    }
    this.pagina.set(1);
  }

  filtrarPorPagamento(evento: { indice: number }): void {
    const pagamento = TIPOS_PAGAMENTO_OPCOES[evento.indice];
    if (!pagamento) {
      return;
    }
    if (this.selectedPagamentoChart() === pagamento) {
      this.selectedPagamentoChart.set(null);
      this.notificacao.mostrar('Filtro de pagamento: todos', 'info');
    } else {
      this.selectedPagamentoChart.set(pagamento);
      this.notificacao.mostrar(`Filtro de pagamento: ${formatarEnum(pagamento)}`, 'info');
    }
    this.pagina.set(1);
  }

  filtrarPorMes(evento: { categoria: string }): void {
    const categoria = evento.categoria;
    if (!/^\d{4}-\d{2}$/.test(categoria)) {
      return;
    }
    if (this.selectedMonthChart() === categoria) {
      this.selectedMonthChart.set(null);
      this.notificacao.mostrar('Filtro mensal: todos', 'info');
    } else {
      this.selectedMonthChart.set(categoria);
      this.notificacao.mostrar(`Filtro mensal: ${categoria}`, 'info');
    }
    this.pagina.set(1);
  }

  criarOrdem(): void {
    this.router.navigate(['/servicos/novo']);
  }

  private carregarPersistido(): void {
    try {
      const bruto = localStorage.getItem(this.storageKey);
      if (!bruto) {
        return;
      }
      const dados = JSON.parse(bruto);
      if (dados.filtro) {
        this.filtro.set({
          termo: dados.filtro.termo ?? '',
          status: new Set<StatusServico>(dados.filtro.status ?? []),
          tipoPagamento: new Set<TipoPagamento>(dados.filtro.tipoPagamento ?? []),
          dataInicio: dados.filtro.dataInicio ?? '',
          dataFim: dados.filtro.dataFim ?? '',
          empresa: dados.filtro.empresa ?? '',
        });
      }
      if (dados.colunasOcultas) {
        this.colunas.update((colunas) =>
          colunas.map((coluna) => ({ ...coluna, oculta: (dados.colunasOcultas as ColunaId[]).includes(coluna.id) }))
        );
      }
      if (dados.ordenacao) {
        this.ordenacao.set(dados.ordenacao);
      }
      if (dados.filtrosGraficos) {
        this.selectedStatusChart.set(dados.filtrosGraficos.status ?? null);
        this.selectedMonthChart.set(dados.filtrosGraficos.mes ?? null);
        this.selectedPagamentoChart.set(dados.filtrosGraficos.pagamento ?? null);
      }
    } catch {
      /* ignore persistência inválida */
    }
  }
}
