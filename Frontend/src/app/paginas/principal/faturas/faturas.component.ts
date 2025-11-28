import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BarraSelecaoComponent } from '../../../componentes/ui/barra-ferramentas/barra-selecao.component';
import { BotaoComponent } from '../../../componentes/ui/botao/botao.component';
import { CartaoGraficoComponent } from '../../../componentes/ui/cartao-grafico/cartao-grafico.component';
import { DiretivaCopiar } from '../../../componentes/ui/copiar/copiar.directive';
import { DialogoConfirmacaoComponent } from '../../../componentes/ui/dialogo/dialogo-confirmacao.component';
import { DialogoService } from '../../../componentes/ui/dialogo/dialogo.service';
import { EsqueletoTabelaComponent } from '../../../componentes/ui/esqueleto/esqueleto-tabela.component';
import { EstadoVazioComponent } from '../../../componentes/ui/estado-vazio/estado-vazio.component';
import { EtiquetaStatusComponent } from '../../../componentes/ui/etiqueta-status/etiqueta-status.component';
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
import { ServicoRelatorio, StatusServico } from '../../../shared/data/servicos.model';
import { ExportService } from '../../../shared/export/export.service';
import { DynamicInsightService } from '../../../shared/metrics/dynamic-insight.service';
import { FaturasAnalyticsService } from './faturas-analytics.service';
import { faturasInsightConfig } from './faturas-insight.config';

/**
 * Representação simplificada usada para renderizar linhas da tabela de faturas.
 * Altere aqui caso adicione novas colunas; mantenha em sincronia com `montarFaturas()`.
 */
type Fatura = {
  numero: string;
  cliente: string;
  servico: string;
  data: string;
  valor: string;
  status: 'Paga' | 'Pendente' | 'Vencida';
  servicoId: string | null;
};

/**
 * Estados para os quais uma OS pode ser movida ao gerar faturamento.
 * Adicione novos quando o backend suportar outros destinos e lembre de traduzir nos handlers do modal.
 */
type StatusDestinoFaturamento = 'FATURAMENTO' | 'FINALIZADO';

/**
 * Estrutura intermediária usada no modal de "Novo faturamento" para exibir as OS elegíveis.
 * Contém o `ServicoRelatorio` original para atualizar status após confirmação.
 */
type ServicoParaFaturamento = {
  id: string;
  ordemServico: string;
  cliente: string;
  descricao: string;
  valorTotal: number;
  status: StatusServico;
  data: string;
  referencia: ServicoRelatorio;
};

/**
 * Página de faturamento.
 *
 * Responsabilidades principais:
 * - Exibir KPIs, gráficos e tabela de faturas filtradas.
 * - Gerenciar seleção múltipla e modais para gerar novos faturamentos.
 * - Integrar com `ServicosDataService`, `ExportService`, `FaturasAnalyticsService` e insights dinâmicos.
 *
 * Boas práticas de manutenção:
 * - Agrupe o estado por domínio (filtros, seleção, modal) usando `signal`/`computed`.
 * - Quando adicionar novas métricas/gráficos, alimente `analytics` ou `DynamicInsightService` antes de mexer no template.
 * - Toda nova ação da tabela deve passar por `MenuAcoesLinhaComponent` para garantir consistência da UX.
 */
@Component({
  selector: 'app-faturas',
  standalone: true,
  imports: [
    PaginacaoComponent,
    BotaoComponent,
    DatePipe,
    EtiquetaStatusComponent,
    MenuAcoesLinhaComponent,
    BarraSelecaoComponent,
    MenuExportacaoComponent,
    SeletorColunasComponent,
    EstadoVazioComponent,
    EsqueletoTabelaComponent,
    DiretivaCopiar,
    CentralNotificacoesComponent,
    DialogoConfirmacaoComponent,
    CabecalhoOrdenavelDirective,
    CartaoIndicadorComponent,
    CartaoGraficoComponent
  ],
  template: `
    <section class="space-y-4">

  <!-- Containers globais de UI -->
  <as-central-notificacoes />
  <as-dialogo-confirmacao />

      @if (modalNovoFaturamento()) {
        <div class="faturas-modal">
          <div class="faturas-modal__backdrop" (click)="fecharModalNovoFaturamento()" aria-hidden="true"></div>
          <div class="faturas-modal__content faturas-modal-card as-outline-surface as-outline-surface--dialog flex flex-col overflow-hidden">
            <header class="grid items-start gap-6 px-6 py-5 border-b border-green-100 md:grid-cols-[minmax(0,1.5fr)_minmax(220px,0.8fr)]">
              <div class="flex flex-col gap-4 w-full">
                <div class="space-y-2">
                  <h2 class="text-lg font-semibold text-green-900">Selecionar ordens de serviço</h2>
                  <p class="text-xs text-green-600 leading-relaxed">Ordens em Aberto ou Em andamento estarão disponíveis para faturamento.</p>
                </div>
                <div class="w-full flex flex-col gap-2">
                  <div class="flex flex-col space-y-2">
                    <span class="text-xs font-medium uppercase tracking-wide text-green-700">Buscar ordens</span>
                  </div>
                  <label class="relative block">
                    <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-green-400"></i>
                    <input type="search"
                           class="w-full h-11 pl-9 pr-4 rounded-lg border border-green-200 bg-white/90 text-sm text-green-900 placeholder:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-500"
                           placeholder="Buscar ordem, cliente ou descrição"
                           [value]="buscaServicosModal()"
                           (input)="atualizarBuscaServicosModal($any($event.target).value)"
                           (keyup.enter)="submeterBuscaServicosModal()"
                    />
                  </label>
                </div>
              </div>
              <div class="flex flex-col gap-3 w-full md:items-end">
                <div class="flex flex-col gap-1 w-full md:w-[240px]">
                  <span class="text-xs font-medium uppercase tracking-wide text-green-700">Aplicar status destino</span>
                  <span class="text-[11px] text-green-500">Esse status será atribuído às ordens selecionadas após confirmar o faturamento.</span>
                  <select class="w-full h-11 rounded-lg border border-green-200 bg-white/90 px-3 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-500"
                          [value]="statusDestinoModal()"
                          (change)="definirStatusDestinoModal($any($event.target).value)"
                          aria-label="Selecionar status de destino">
                    <option value="FATURAMENTO">Faturamento / Pendente</option>
                    <option value="FINALIZADO">Finalizado / Pago</option>
                  </select>
                </div>
                <div class="flex items-center gap-2 justify-start md:justify-end">
                  <as-botao variante="fantasma" (click)="fecharModalNovoFaturamento()">Cancelar</as-botao>
                  <as-botao variante="primario"
                            iconeEsquerda="fas fa-check"
                            [desabilitado]="servicosSelecionadosModal().size === 0"
                            (click)="confirmarNovoFaturamento()">
                    Confirmar
                  </as-botao>
                </div>
              </div>
            </header>
            <div class="flex-1 overflow-auto">
              <table class="min-w-full text-sm">
                <thead class="bg-green-50 text-green-700 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th class="w-12 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                      <input type="checkbox"
                             class="h-4 w-4"
                             [checked]="todosServicosSelecionadosVisiveis()"
                             [indeterminate]="indeterminadoServicosVisiveis()"
                             (change)="alternarTodosServicosVisiveis($event)"
                             aria-label="Selecionar ordens visíveis" />
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap">Ordem de serviço</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Cliente</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Descrição</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap">Data</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap">Valor</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Status atual</th>
                  </tr>
                </thead>
                <tbody>
                  @for (servico of servicosModalFiltrados(); track servico.id; let idx = $index) {
                    @let selecionado = servicoSelecionado(servico.id);
                    @let estilo = statusBadgeStyle(servico.status);
                    <tr class="group transition-colors cursor-pointer hover:bg-green-50/80 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2 focus:ring-offset-white"
                        tabindex="0"
                        role="checkbox"
                        [attr.aria-checked]="selecionado"
                        [class.bg-green-50]="selecionado"
                        [class.bg-surface]="!selecionado && idx % 2 === 0"
                        [class.bg-surface-alt]="!selecionado && idx % 2 === 1"
                        (click)="alternarSelecaoServico(servico.id)"
                        (keydown.enter)="alternarSelecaoServicoPorTecla($event, servico.id)"
                        (keydown.space)="alternarSelecaoServicoPorTecla($event, servico.id)">
                      <td class="px-4 py-3 align-middle">
                        <input type="checkbox"
                               class="h-4 w-4"
                               [checked]="selecionado"
                               (click)="$event.stopPropagation()"
                               (change)="alternarSelecaoServico(servico.id)"
                               [attr.aria-label]="'Selecionar ' + servico.ordemServico" />
                      </td>
                      <td class="px-4 py-3 font-mono text-xs md:text-sm whitespace-nowrap align-middle">{{ servico.ordemServico }}</td>
                      <td class="px-4 py-3 align-middle text-green-900">{{ servico.cliente }}</td>
                      <td class="px-4 py-3 text-xs md:text-sm text-green-700 align-middle">{{ servico.descricao }}</td>
                      <td class="px-4 py-3 whitespace-nowrap align-middle">{{ servico.data | date:'dd/MM/yyyy' }}</td>
                      <td class="px-4 py-3 font-semibold text-green-800 whitespace-nowrap align-middle">{{ servico.valorFormatado }}</td>
                      <td class="px-4 py-3 align-middle">
                        <span class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium shadow-sm"
                              [style.background-color]="estilo.background"
                              [style.color]="estilo.text">
                          <span class="h-2 w-2 rounded-full" [style.background-color]="estilo.dot"></span>
                          {{ statusServicoLabel(servico.status) }}
                        </span>
                      </td>
                    </tr>
                  }
                  @if (servicosModalFiltrados().length === 0) {
                    <tr class="bg-surface">
                      <td colspan="7" class="px-4 py-6 text-center text-sm text-green-600">
                        Nenhuma ordem elegível encontrada.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <footer class="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-t border-green-100 text-xs text-green-700 bg-surface">
              <span>{{ servicosSelecionadosModal().size }} ordem(ns) selecionada(s)</span>
              <button type="button" class="underline hover:text-green-900 disabled:text-green-300" (click)="limparSelecaoServicosModal()" [disabled]="servicosSelecionadosModal().size === 0">
                Limpar seleção
              </button>
            </footer>
          </div>
        </div>
      }

      <!-- Seção de Filtros Inteligentes -->
      @if (mostrarFiltros()) {
        <div class="bg-white rounded-lg shadow ring-1 ring-green-100 divide-y divide-green-100">
          <form class="p-4 grid gap-4 md:grid-cols-4 text-sm" (submit)="$event.preventDefault()">
            <!-- Termo livre -->
            <label class="flex flex-col gap-1">
              <span class="font-medium text-green-800">Busca</span>
              <input type="text" class="border border-green-200 rounded px-3 py-2 focus:ring-2 focus:ring-green-300 outline-none" placeholder="Número ou Cliente" (input)="atualizarTermo($event)" [value]="filtro().termo" />
            </label>

            <!-- Status -->
            <fieldset class="flex flex-col gap-1">
              <legend class="font-medium text-green-800">Status</legend>
              <div class="flex flex-wrap gap-1">
                @for (s of statusDisponiveis; track s) {
                  <button type="button" (click)="toggleStatus(s)" class="px-2 py-1 rounded border text-xs whitespace-nowrap"
                          [class.bg-green-600]="filtro().status.has(s)" [class.text-white]="filtro().status.has(s)"
                          [class.border-green-600]="filtro().status.has(s)"
                          [class.bg-white]="!filtro().status.has(s)" [class.text-green-700]="!filtro().status.has(s)" [class.border-green-300]="!filtro().status.has(s)">
                    {{s}}
                  </button>
                }
              </div>
            </fieldset>

            <!-- Data Início -->
            <label class="flex flex-col gap-1">
              <span class="font-medium text-green-800">Data inicial</span>
              <input type="date" class="border border-green-200 rounded px-3 py-2" (change)="atualizarData('dataInicio', $event)" [value]="filtro().dataInicio" />
            </label>

            <!-- Data Fim -->
            <label class="flex flex-col gap-1">
              <span class="font-medium text-green-800">Data final</span>
              <input type="date" class="border border-green-200 rounded px-3 py-2" (change)="atualizarData('dataFim', $event)" [value]="filtro().dataFim" />
            </label>
          </form>
          <div class="p-3 flex items-center justify-between text-xs bg-green-50">
            <div class="flex gap-3 flex-wrap">
              @if (filtro().termo) {
                <span class="inline-flex items-center gap-1 bg-white border border-green-200 px-2 py-1 rounded">
                  <i class="fas fa-search"></i> {{ filtro().termo }}
                  <button type="button" (click)="limparCampo('termo')" aria-label="Remover termo" class="text-red-500 hover:text-red-700"><i class="fas fa-times"></i></button>
                </span>
              }
              @for (s of filtro().status; track s) {
                <span class="inline-flex items-center gap-1 bg-white border border-green-200 px-2 py-1 rounded">
                  <i class="fas fa-tag"></i> {{ s }}
                  <button type="button" (click)="toggleStatus(s)" aria-label="Remover status" class="text-red-500 hover:text-red-700"><i class="fas fa-times"></i></button>
                </span>
              }
              @if (filtro().dataInicio) {
                <span class="inline-flex items-center gap-1 bg-white border border-green-200 px-2 py-1 rounded">
                  <i class="fas fa-calendar-day"></i> Início: {{ filtro().dataInicio | date:'dd/MM/yyyy' }}
                  <button type="button" (click)="limparCampo('dataInicio')" aria-label="Remover data início" class="text-red-500 hover:text-red-700"><i class="fas fa-times"></i></button>
                </span>
              }
              @if (filtro().dataFim) {
                <span class="inline-flex items-center gap-1 bg-white border border-green-200 px-2 py-1 rounded">
                  <i class="fas fa-calendar-day"></i> Fim: {{ filtro().dataFim | date:'dd/MM/yyyy' }}
                  <button type="button" (click)="limparCampo('dataFim')" aria-label="Remover data fim" class="text-red-500 hover:text-red-700"><i class="fas fa-times"></i></button>
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
              <as-botao variante="fantasma" iconeEsquerda="fas fa-chevron-up" (click)="toggleMostrarFiltros()" title="Recolher filtros" />
            </div>
          </div>
        </div>
      }

      <!-- KPI Cards -->
      <div class="as-kpi-grid">
        <as-cartao-indicador
          titulo="Faturas"
          [valor]="filtradas().length"
          icone="fas fa-file-invoice"
          [descricao]="descricaoTotal()"
          tendencia="flat"
          [accent]="'#2563eb'"
        />
        <as-cartao-indicador
          titulo="Pagas"
          [valor]="analytics.pagas()"
          icone="fas fa-check-circle"
          [descricao]="percent(analytics.pagas())"
          tendencia="up"
          [accent]="'#16a34a'"
          [tipo]="'sucesso'"
        />
        <as-cartao-indicador
          titulo="Pendentes"
          [valor]="analytics.pendentes()"
          icone="fas fa-hourglass-half"
          [descricao]="percent(analytics.pendentes())"
          tendencia="flat"
          [accent]="'#f59e0b'"
          [tipo]="'alerta'"
        />
        <as-cartao-indicador
          titulo="Vencidas"
          [valor]="analytics.vencidas()"
          icone="fas fa-exclamation-triangle"
          [descricao]="percent(analytics.vencidas())"
          tendencia="down"
          [accent]="'#dc2626'"
          [tipo]="'erro'"
        />
        <as-cartao-indicador
          titulo="Ticket médio"
          [valor]="ticketMedioFormatado()"
          icone="fas fa-coins"
          descricao="Média por fatura"
          tendencia="flat"
          [accent]="'#7c3aed'"
          [tipo]="'sucesso'"
        />
        <as-cartao-indicador
          titulo="Receita total"
          [valor]="receitaTotalFormatada()"
          icone="fas fa-wallet"
          [descricao]="analytics.total() + ' faturas contabilizadas'"
          tendencia="up"
          [accent]="'#0f766e'"
          [tipo]="'sucesso'"
        />
      </div>

      <!-- Gráficos -->
      <section class="faturas-charts">
        <div class="faturas-charts__grid">
        <!-- Evolução Mensal -->
        <as-cartao-grafico
          titulo="Evolução Mensal"
          icone="fas fa-chart-line"
          [series]="serieMensal()"
          [eixoX]="xaxisMensal()"
          tipo="line"
          [dica]="tooltipMensal"
          descricao="Soma mensal de valores"
          (pontoSelecionado)="filtrarPorMes($event)"
        ></as-cartao-grafico>
        <!-- Distribuição Status -->
        <as-cartao-grafico
          titulo="Distribuição de Status"
          icone="fas fa-chart-pie"
          tipo="donut"
          [series]="serieStatusValores()"
          [rotulos]="labelsStatus()"
          [cores]="colorsStatus()"
          [dica]="tooltipStatus"
          [legenda]="legendaStatus()"
          descricao="Percentual de faturas"
          (fatiaSelecionada)="filtrarPorStatus($event)"
        >
          <button
            chart-extra
            type="button"
            class="faturas-charts__reset"
            (click)="limparFiltrosGraficos()"
            [disabled]="!selectedStatusChart() && !selectedMonthChart()">
            <i class="fas fa-filter-circle-xmark"></i>
            Limpar
          </button>
        </as-cartao-grafico>
        <!-- Aging -->
        <as-cartao-grafico
          titulo="Aging Pendências"
          icone="fas fa-business-time"
          tipo="bar"
          [series]="serieAging()"
          [eixoX]="xaxisAging()"
          [dica]="tooltipAging"
          descricao="Quantidade por faixa de dias"
          (pontoSelecionado)="infoAging($event)"
        />
        </div>
      </section>

      <!-- Toolbar de seleção múltipla -->
      @if (selecionados().size > 0) {
        <div>
          <as-barra-selecao
            [quantidade]="selecionados().size"
            [mostrarMarcarPaga]="true"
            (marcar)="marcarComoPagaSelecionadas()"
            (exportar)="exportarSelecionadas()"
            (excluir)="excluirSelecionadasConfirm()"
            (cancelar)="limparSelecao()" />
        </div>
      }

      <!-- Tabela -->
      <div class="faturas-table-card">
        <div class="faturas-table-card__body">
          <div class="faturas-table-card__toolbar">
            <div class="faturas-table-card__legend">
              <h3>Faturas emitidas</h3>
              <p>Selecione uma linha para aplicar ações rápidas ou abra o menu de opções.</p>
            </div>
            <div class="faturas-table-card__actions">
              <as-seletor-colunas [colunas]="colunas()" (alterou)="alternarColuna($event)" />
              <as-menu-exportacao (selecionou)="exportarTodasFormato($event)" />
            </div>
          </div>

          @if (carregando()) {
            <div class="faturas-table-wrapper faturas-table-wrapper--loading">
              <as-esqueleto-tabela />
            </div>
          } @else {
            <div class="faturas-table-wrapper">
              <table class="faturas-table">
                <thead>
                  <tr>
                    <th class="w-12">
                      <input type="checkbox" [checked]="todosSelecionadosPagina()" [indeterminate]="indeterminadoPagina()" (change)="toggleSelecionarTodosPagina($event)" aria-label="Selecionar página" />
                    </th>
                    @for (c of colunasVisiveis(); track c.id) {
                      <th
                        [asOrdenavel]="c.id"
                        (click)="clicarOrdenacao(c.id, $event)"
                        [class.whitespace-nowrap]="['numero','data','valor','status'].includes(c.id)"
                        [class.col-cliente]="c.id==='cliente'"
                      >
                        <span class="inline-flex items-center gap-1">
                          {{ c.label }}
                          @if (ordenacao().coluna===c.id && ordenacao().direcao!=='none') {
                            <i class="fas" [class.fa-sort-up]="ordenacao().direcao==='asc'" [class.fa-sort-down]="ordenacao().direcao==='desc'"></i>
                          } @else {
                            <i class="fas fa-sort text-green-300"></i>
                          }
                        </span>
                      </th>
                    }
                    <th class="col-acoes">AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  @for (f of paginaOrdenada(); track f.numero; let idx = $index) {
                    <tr
                      class="faturas-row"
                      [class.is-selected]="isSelecionado(f.numero)"
                      [class.is-even]="idx % 2 === 0"
                      [class.is-odd]="idx % 2 === 1"
                      role="checkbox"
                      tabindex="0"
                      [attr.aria-checked]="isSelecionado(f.numero)"
                      (click)="toggleSelecionado(f.numero)"
                      (keydown.enter)="toggleSelecionadoPorTecla($event, f.numero)"
                      (keydown.space)="toggleSelecionadoPorTecla($event, f.numero)">
                      <td>
                        <input type="checkbox" [checked]="isSelecionado(f.numero)" (click)="$event.stopPropagation()" (change)="toggleSelecionado(f.numero)" [attr.aria-label]="'Selecionar fatura ' + f.numero" />
                      </td>
                      @for (c of colunasVisiveis(); track c.id) {
                        <td
                          [class.font-mono]="c.id==='numero'"
                          [class.whitespace-nowrap]="['numero','data','valor','status'].includes(c.id)"
                          [class.col-cliente]="c.id==='cliente'"
                          [asCopiar]="c.id==='numero' ? f.numero : ''"
                        >
                          @switch (c.id) {
                            @case ('numero') { {{ f.numero }} }
                            @case ('cliente') { {{ f.cliente }} }
                            @case ('servico') { {{ f.servico }} }
                            @case ('data') { {{ f.data }} }
                            @case ('valor') { <span class="valor-destaque">{{ f.valor }}</span> }
                            @case ('status') { <as-etiqueta-status [valor]="f.status" /> }
                          }
                        </td>
                      }
                      <td class="col-acoes">
                        <as-menu-acoes-linha [acoes]="acoesLinha" (acionar)="executarAcaoLinha($event, f)" />
                      </td>
                    </tr>
                  }
                  @if (paginaOrdenada().length === 0) {
                    <tr>
                      <td [attr.colspan]="colunasVisiveis().length + 2">
                        <as-estado-vazio titulo="Sem resultados" descricao="Ajuste os filtros para encontrar faturas." />
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
        <div class="faturas-table-card__footer">
          <div>
            {{ intervaloExibicaoInicio()+1 }}–{{ intervaloExibicaoFim() }} de {{ filtradas().length }} faturas
            @if (selecionados().size>0) { • {{ selecionados().size }} selecionada(s) }
          </div>
          <as-paginacao [pagina]="pagina()" [tamanhoPagina]="tamanhoPagina()" [total]="filtradas().length" (mudouPagina)="mudarPagina($event)" />
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host {
      --faturas-cliente-col-base: 14rem;
    }
    .faturas-modal {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      z-index: 60;
    }
    .faturas-modal__backdrop {
      position: absolute;
      inset: 0;
      background: rgba(10, 38, 26, 0.55);
      backdrop-filter: blur(2px);
      transition: opacity 160ms ease;
    }
    [data-theme='dark'] .faturas-modal__backdrop {
      background: rgba(0, 0, 0, 0.85);
    }
    .faturas-modal__content {
      position: relative;
      z-index: 10;
      width: min(100%, 1200px);
      max-height: min(90vh, 820px);
      border-radius: 1.75rem;
      border: 1px solid rgba(16, 185, 129, 0.22);
      box-shadow: 0 24px 48px -24px rgba(6, 95, 70, 0.45);
    }
    [data-theme='dark'] .faturas-modal__content {
      border-color: rgba(52, 211, 153, 0.3);
      box-shadow: 0 24px 48px -24px rgba(0, 0, 0, 0.8);
    }
    @media (max-width: 768px) {
      .faturas-modal {
        padding: 1rem;
      }
      .faturas-modal__content {
        border-radius: 1.25rem;
        max-height: 85vh;
      }
    }
    .faturas-charts {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-top: 0.5rem;
    }
    .faturas-charts__reset {
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
    [data-theme='dark'] .faturas-charts__reset {
      border-color: rgba(52, 211, 153, 0.3);
      background: rgba(22, 27, 34, 0.95);
      color: #6ee7b7;
    }
    .faturas-charts__reset:hover:not(:disabled) {
      background: rgba(14, 116, 144, 0.08);
      border-color: rgba(14, 116, 144, 0.5);
    }
    [data-theme='dark'] .faturas-charts__reset:hover:not(:disabled) {
      background: rgba(52, 211, 153, 0.15);
      border-color: rgba(52, 211, 153, 0.45);
    }
    .faturas-charts__reset:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
    .faturas-charts__grid {
      display: grid;
      gap: 1.5rem;
      grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
    }
    :host ::ng-deep .faturas-modal-card header {
      border-bottom: var(--as-outline-border);
    }
    :host ::ng-deep .faturas-table-card {
      border-radius: 1.25rem;
      border: 1px solid rgba(16, 185, 129, 0.12);
      background: linear-gradient(150deg, #ffffff 0%, rgba(240, 253, 244, 0.55) 100%);
      box-shadow: 0 18px 40px -32px rgba(4, 120, 87, 0.4);
      overflow: hidden;
      transition: all 0.3s ease;
    }
    [data-theme='dark'] :host ::ng-deep .faturas-table-card {
      border-color: rgba(52, 211, 153, 0.2);
      background: linear-gradient(150deg, rgba(22, 27, 34, 0.98) 0%, rgba(13, 17, 23, 0.95) 100%);
      box-shadow: 0 18px 40px -32px rgba(0, 0, 0, 0.7);
    }
    :host ::ng-deep .faturas-table-card__body {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      padding: 1.75rem;
    }
    :host ::ng-deep .faturas-table-card__toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem 1.5rem;
    }
    :host ::ng-deep .faturas-table-card__legend h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #065f46;
    }
    [data-theme='dark'] :host ::ng-deep .faturas-table-card__legend h3 {
      color: #6ee7b7;
    }
    :host ::ng-deep .faturas-table-card__legend p {
      margin: 0.25rem 0 0;
      font-size: 0.75rem;
      color: #0f766e;
    }
    [data-theme='dark'] :host ::ng-deep .faturas-table-card__legend p {
      color: #a8b4c8;
    }
    :host ::ng-deep .faturas-table-card__actions {
      display: inline-flex;
      gap: 0.75rem;
      align-items: center;
    }
    :host ::ng-deep .faturas-table-wrapper {
      border-radius: 1.1rem;
      border: 1px solid rgba(16, 185, 129, 0.18);
      background: rgba(255, 255, 255, 0.94);
      box-shadow: inset 0 1px 0 rgba(209, 250, 229, 0.6);
      overflow-x: auto;
      overflow-y: hidden;
    }
    [data-theme='dark'] :host ::ng-deep .faturas-table-wrapper {
      border-color: rgba(52, 211, 153, 0.25);
      background: rgba(13, 17, 23, 0.95);
      box-shadow: inset 0 1px 0 rgba(52, 211, 153, 0.1);
    }
    :host ::ng-deep .faturas-table-wrapper--loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    :host ::ng-deep .faturas-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      font-size: 0.85rem;
      color: #064e3b;
    }
    [data-theme='dark'] :host ::ng-deep .faturas-table {
      color: #d1fae5;
    }
    :host ::ng-deep .faturas-table thead th {
      text-align: left;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-size: 0.82rem;
      padding: 0.6rem 1rem;
      background: rgba(236, 253, 245, 0.75);
      color: #065f46;
      border-bottom: 1px solid rgba(16, 185, 129, 0.22);
    }
    [data-theme='dark'] :host ::ng-deep .faturas-table thead th {
      background: rgba(22, 27, 34, 0.9);
      color: #6ee7b7;
      border-bottom-color: rgba(52, 211, 153, 0.3);
    }
    :host ::ng-deep .faturas-table tbody td {
      padding: 0.6rem 1rem;
      border-bottom: 1px solid rgba(16, 185, 129, 0.1);
      vertical-align: middle;
    }
    [data-theme='dark'] :host ::ng-deep .faturas-table tbody td {
      border-bottom-color: rgba(52, 211, 153, 0.15);
    }
    :host ::ng-deep .faturas-row {
      cursor: pointer;
      transition: background-color 180ms ease, box-shadow 180ms ease, transform 140ms ease;
    }
    :host ::ng-deep .faturas-row.is-even:not(.is-selected) {
      background: rgba(255, 255, 255, 0.98);
    }
    [data-theme='dark'] :host ::ng-deep .faturas-row.is-even:not(.is-selected) {
      background: rgba(22, 27, 34, 0.8);
    }
    :host ::ng-deep .faturas-row.is-odd:not(.is-selected) {
      background: rgba(236, 253, 245, 0.45);
    }
    [data-theme='dark'] :host ::ng-deep .faturas-row.is-odd:not(.is-selected) {
      background: rgba(13, 17, 23, 0.9);
    }
    :host ::ng-deep .faturas-row:hover:not(.is-selected) {
      background: rgba(236, 253, 245, 0.75);
      box-shadow: inset 0 0 0 1px rgba(16, 185, 129, 0.22);
    }
    [data-theme='dark'] :host ::ng-deep .faturas-row:hover:not(.is-selected) {
      background: rgba(52, 211, 153, 0.1);
      box-shadow: inset 0 0 0 1px rgba(52, 211, 153, 0.3);
    }
    :host ::ng-deep .faturas-row.is-selected {
      background: rgba(209, 250, 229, 0.9);
      box-shadow: inset 0 0 0 2px rgba(5, 150, 105, 0.35);
    }
    [data-theme='dark'] :host ::ng-deep .faturas-row.is-selected {
      background: rgba(52, 211, 153, 0.2);
      box-shadow: inset 0 0 0 2px rgba(52, 211, 153, 0.4);
    }
    :host ::ng-deep .faturas-row:active {
      transform: scale(0.998);
    }
    :host ::ng-deep .valor-destaque {
      font-weight: 600;
      color: #047857;
    }
    [data-theme='dark'] :host ::ng-deep .valor-destaque {
      color: #6ee7b7;
    }
    :host ::ng-deep .faturas-table .col-cliente {
      min-width: calc(var(--faturas-cliente-col-base) * 1.3);
    }
    :host ::ng-deep .faturas-table .col-acoes {
      text-align: center;
      white-space: nowrap;
      min-width: 11rem;
    }
    :host ::ng-deep .faturas-table .col-acoes > span,
    :host ::ng-deep .faturas-table .col-acoes > div {
      margin-left: auto;
      margin-right: auto;
    }
    :host ::ng-deep .faturas-table-card__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem 1.25rem;
      padding: 0 1.75rem 1.5rem;
      font-size: 0.75rem;
      color: #047857;
    }
    [data-theme='dark'] :host ::ng-deep .faturas-table-card__footer {
      color: #a8b4c8;
    }
    :host ::ng-deep .faturas-table-card__footer a,
    :host ::ng-deep .faturas-table-card__footer span {
      font-weight: 500;
    }
    @media (max-width: 768px) {
      :host ::ng-deep .faturas-table-card__body {
        padding: 1.25rem;
      }
      :host ::ng-deep .faturas-table thead {
        font-size: 0.65rem;
      }
      :host ::ng-deep .faturas-table tbody td,
      :host ::ng-deep .faturas-table thead th {
        padding: 0.65rem 0.75rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaturasComponent implements OnInit, OnDestroy {
  /**
   * Inicializa fontes persistidas e conecta sinais às camadas auxiliares (analytics + insights).
   * Sempre que adicionar novo serviço compartilhado, faça a ligação aqui para evitar efeitos colaterais no `ngOnInit`.
   */
  constructor(){
    this.carregarPersistido();
    effect(()=> this.analytics.setFonte(this.filtradas()));
    this.insight.setConfig(faturasInsightConfig);
  }
  /**
   * Injeções e estados raiz:
   * - `servicosOrigem`: cache completo vindo do backend (`ServicosDataService`).
   * - `todas`: lista de faturas renderizadas; mantenha-a como source of truth para filtros/exportação.
   */
  private readonly servicosData = inject(ServicosDataService);
  private readonly servicosOrigem = signal<ServicoRelatorio[]>([]);
  private readonly todas = signal<Fatura[]>([]);

  /**
   * Estado específico do modal "Novo faturamento". Ao evoluir o fluxo,
   * mantenha todo o estado controlado aqui para evitar efeitos na tabela principal.
   */
  private readonly servicosParaFaturamento = signal<ServicoParaFaturamento[]>([]);
  modalNovoFaturamento = signal(false);
  buscaServicosModal = signal('');
  statusDestinoModal = signal<StatusDestinoFaturamento>('FATURAMENTO');
  servicosSelecionadosModal = signal<Set<string>>(new Set());

  private readonly statusBadgePaleta: Record<string, { background: string; text: string; dot: string }> = {
    ABERTO: {
      background: 'var(--as-color-primary-100)',
      text: 'var(--as-color-primary-700)',
      dot: 'var(--as-color-primary-500)'
    },
    EM_ANDAMENTO: {
      background: 'rgba(242, 176, 86, 0.18)',
      text: '#b97116',
      dot: '#f2b056'
    },
    AGUARDANDO_PAGAMENTO: {
      background: 'rgba(61, 125, 220, 0.16)',
      text: '#2e67b7',
      dot: '#3d7ddc'
    },
    FATURADO: {
      background: 'rgba(58, 160, 122, 0.18)',
      text: '#1f5c47',
      dot: '#3aa07a'
    },
    CONCLUIDO: {
      background: 'rgba(58, 160, 122, 0.18)',
      text: '#1f5c47',
      dot: '#3aa07a'
    },
    CANCELADO: {
      background: 'rgba(228, 100, 93, 0.18)',
      text: '#a53c36',
      dot: '#e4645d'
    },
    DEFAULT: {
      background: 'var(--as-color-surface-alt)',
      text: 'var(--as-color-text)',
      dot: 'var(--as-color-text)'
    }
  };

  /**
   * Subconjunto usado apenas no modal; mantenha os status elegíveis alinhados
   * com o backend antes de liberar novos fluxos de faturamento.
   */
  servicosModalElegiveis = computed(() =>
    this.servicosParaFaturamento().filter((servico) => servico.status === 'ABERTO' || servico.status === 'EM_ANDAMENTO')
  );

  /** Busca local do modal com ordenação mais-recente e valores já formatados. */
  servicosModalFiltrados = computed(() => {
    const termo = this.buscaServicosModal().trim().toLowerCase();
    const base = this.servicosModalElegiveis()
      .map((servico) => ({
        ...servico,
        valorFormatado: this.formatarMoeda(servico.valorTotal),
      }))
      .sort((a, b) => b.data.localeCompare(a.data));
    if (!termo) return base;
    return base.filter((servico) =>
      servico.ordemServico.toLowerCase().includes(termo) ||
      servico.cliente.toLowerCase().includes(termo) ||
      servico.descricao.toLowerCase().includes(termo)
    );
  });

  todosServicosSelecionadosVisiveis = computed(() => {
    const visiveis = this.servicosModalFiltrados();
    return visiveis.length > 0 && visiveis.every((servico) => this.servicosSelecionadosModal().has(servico.id));
  });

  indeterminadoServicosVisiveis = computed(() => {
    const visiveis = this.servicosModalFiltrados();
    if (visiveis.length === 0) return false;
    const selecionados = this.servicosSelecionadosModal();
    const totalSelecionados = visiveis.filter((servico) => selecionados.has(servico.id)).length;
    return totalSelecionados > 0 && totalSelecionados < visiveis.length;
  });

  /**
   * Estado dos filtros avançados.
   * Sempre que adicionar um novo campo, inclua-o aqui, em `patchFiltro` e na persistência/localStorage.
   */
  filtro = signal<{ termo: string; status: Set<Fatura['status']>; dataInicio: string; dataFim: string }>({
    termo: '',
    status: new Set(),
    dataInicio: '',
    dataFim: '',
  });
  mostrarFiltros = signal(false); // inicia fechado

  pagina = signal(1);
  tamanhoPagina = signal(10);

  /**
   * Seleção múltipla da tabela principal. Utilize `Set` para O(1) ao verificar linhas marcadas.
   * Métodos auxiliares (toggle/limpar) devem sempre clonar o set para manter imutabilidade.
   */
  selecionados = signal<Set<string>>(new Set());

  statusDisponiveis: Fatura['status'][] = ['Paga', 'Pendente', 'Vencida'];

  /** Aplica filtros avançados antes da paginação; mantenha comparações string/ISO para datas. */
  filtradas = computed(() => {
    const { termo, status, dataInicio, dataFim } = this.filtro();
    return this.todas().filter(f => {
      if (termo) {
        const t = termo.toLowerCase();
        if (!(f.numero.toLowerCase().includes(t) || f.cliente.toLowerCase().includes(t))) return false;
      }
      if (status.size > 0 && !status.has(f.status)) return false;
      if (dataInicio && f.data < dataInicio) return false;
      if (dataFim && f.data > dataFim) return false;
      return true;
    });
  });

  paginaAtual = computed(() => {
    const start = (this.pagina() - 1) * this.tamanhoPagina();
    return this.filtradas().slice(start, start + this.tamanhoPagina());
  });

  // Ordenação
  /** Controla a ordenação client-side; novas colunas devem ter valores comparáveis aqui. */
  ordenacao = signal<{coluna: string; direcao: 'asc'|'desc'|'none'}>({ coluna: 'data', direcao: 'desc' });
  paginaOrdenada = computed(() => {
    const { coluna, direcao } = this.ordenacao();
    if (direcao==='none') return this.paginaAtual();
    const sorted = [...this.paginaAtual()].sort((a,b)=>{
      const va = (a as any)[coluna];
      const vb = (b as any)[coluna];
      if (va===vb) return 0;
      return va>vb ? 1 : -1;
    });
    return direcao==='asc'? sorted : sorted.reverse();
  });

  /**
   * Configuração dinâmica das colunas da tabela. Ao adicionar novas colunas
   * lembre de atualizar `montarFaturas`, `colunasVisiveis` e o template `@switch`.
   */
  colunas = signal<{id:string; label:string; oculta:boolean}[]>([
    { id:'numero', label:'Número', oculta:false },
    { id:'cliente', label:'Cliente', oculta:false },
    { id:'servico', label:'Serviço', oculta:false },
    { id:'data', label:'Data', oculta:false },
    { id:'valor', label:'Valor', oculta:false },
    { id:'status', label:'Status', oculta:false },
  ]);
  colunasVisiveis = computed(()=> this.colunas().filter(c=>!c.oculta));
  alternarColuna(id: string) {
    this.colunas.update(cols => cols.map(c => c.id===id ? { ...c, oculta: !c.oculta } : c));
  }

  // Loading simulado
  carregando = signal(false);
  private efeitoCarregamento?: any;

  intervaloExibicaoInicio = computed(()=> (this.pagina()-1)*this.tamanhoPagina());
  intervaloExibicaoFim = computed(()=> Math.min(this.intervaloExibicaoInicio()+this.paginaAtual().length, this.filtradas().length));

  acoesLinha: AcaoLinha[] = [
    { id: 'ver', icone: 'fas fa-eye', titulo: 'Ver' },
    { id: 'editar', icone: 'fas fa-pen', titulo: 'Editar' },
    { id: 'duplicar', icone: 'fas fa-clone', titulo: 'Duplicar' },
    { id: 'pdf', icone: 'fas fa-download', titulo: 'Baixar PDF' },
    { id: 'certificado', icone: 'fas fa-certificate', titulo: 'Gerar certificado' },
    { id: 'excluir', icone: 'fas fa-trash', titulo: 'Excluir', variante: 'perigo' },
  ];

  private notificacao = inject(NotificacaoService);
  analytics = inject(FaturasAnalyticsService);
  private insight = inject(DynamicInsightService);
  private exportSvc = inject(ExportService);
  selectedStatusChart = signal<string | null>(null);
  selectedMonthChart = signal<string | null>(null);
  private syncSourceRows = effect(()=> this.insight.setSourceRows(this.todas()));
  private syncFilteredRows = effect(()=> this.insight.setFilteredRows(this.filtradas()));

  private storageKey = 'faturas:v1';
  /**
   * Reaplica preferências do usuário (filtros, ordenação, colunas, filtros de gráficos).
   * Atualize o payload quando novas preferências forem adicionadas.
   */
  private carregarPersistido() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.filtro) {
        this.filtro.set({
          termo: data.filtro.termo||'',
          status: new Set(data.filtro.status||[]),
          dataInicio: data.filtro.dataInicio||'',
          dataFim: data.filtro.dataFim||''
        });
      }
      if (data.colunas) {
        this.colunas.update(cols => cols.map(c => ({ ...c, oculta: data.colunas.includes(c.id) })));
      }
      if (data.ordenacao) {
        this.ordenacao.set(data.ordenacao);
      }
      if (data.filtrosGraficos) {
        this.selectedStatusChart.set(data.filtrosGraficos.status ?? null);
        this.selectedMonthChart.set(data.filtrosGraficos.mes ?? null);
      }
    } catch { /* ignore */ }
  }
  /**
   * Mantém localStorage sincronizado com os sinais críticos.
   * Evite guardar grandes datasets aqui para não estourar o limite do navegador.
   */
  private persistir = effect(()=> {
    const payload = {
      filtro: {
        termo: this.filtro().termo,
        status: Array.from(this.filtro().status),
        dataInicio: this.filtro().dataInicio,
        dataFim: this.filtro().dataFim
      },
      colunas: this.colunas().filter(c=>c.oculta).map(c=>c.id),
      ordenacao: this.ordenacao(),
      filtrosGraficos: {
        status: this.selectedStatusChart(),
        mes: this.selectedMonthChart()
      }
    };
    try { localStorage.setItem(this.storageKey, JSON.stringify(payload)); } catch { /* ignore */ }
  });

  /** Centraliza actions disparadas pelo menu contextual; plugue aqui novas opções. */
  executarAcaoLinha(acao: string, f: Fatura) {
    switch(acao){
      case 'ver': this.verFatura(f); break;
      case 'editar': this.editarFatura(f); break;
  case 'duplicar': this.duplicarFatura(f); this.notificacao.sucesso('Fatura duplicada'); break;
  case 'excluir': this.excluirFaturaConfirm(f); break;
  case 'pdf': this.baixarPdf(f); this.notificacao.sucesso('PDF gerado'); break;
  case 'certificado': this.gerarCertificado(f); break;
    }
  }

  todosSelecionadosPagina = computed(() => this.paginaAtual().length > 0 && this.paginaAtual().every(f => this.selecionados().has(f.numero)));
  indeterminadoPagina = computed(() => !this.todosSelecionadosPagina() && this.paginaAtual().some(f => this.selecionados().has(f.numero)));

  mudarPagina(p: number) { this.pagina.set(p); }

  /** ===== Filtros & Ordenação ===== */
  atualizarTermo(event: Event) {
    const termo = (event.target as HTMLInputElement).value;
    this.patchFiltro({ termo });
  }
  atualizarData(campo: 'dataInicio' | 'dataFim', event: Event) {
    const v = (event.target as HTMLInputElement).value;
    this.patchFiltro({ [campo]: v } as any);
  }
  toggleStatus(s: Fatura['status']) {
    const novo = new Set(this.filtro().status);
    if (novo.has(s)) novo.delete(s); else novo.add(s);
    this.patchFiltro({ status: novo });
  }
  limparCampo(campo: keyof ReturnType<typeof this.filtro>) {
    if (campo === 'status') this.patchFiltro({ status: new Set() });
    else this.patchFiltro({ [campo]: '' } as any);
  }
  limparFiltros() {
    this.filtro.set({ termo: '', status: new Set(), dataInicio: '', dataFim: '' });
    this.pagina.set(1);
  }
  haAlgumFiltro(): boolean {
    const f = this.filtro();
    return !!(f.termo || f.status.size || f.dataInicio || f.dataFim);
  }
  toggleMostrarFiltros() { this.mostrarFiltros.update(v => !v); }
  private patchFiltro(partial: Partial<{ termo: string; status: Set<Fatura['status']>; dataInicio: string; dataFim: string }>) {
    this.filtro.update(f => ({ ...f, ...partial }));
    this.pagina.set(1);
    this.limparSelecao();
  }

  /** ===== Seleção de linhas ===== */
  isSelecionado(numero: string) { return this.selecionados().has(numero); }
  toggleSelecionado(numero: string) {
    this.selecionados.update(sel => {
      const n = new Set(sel);
      n.has(numero) ? n.delete(numero) : n.add(numero);
      return n;
    });
  }
  toggleSelecionadoPorTecla(event: Event, numero: string) {
    event.preventDefault();
    this.toggleSelecionado(numero);
  }
  toggleSelecionarTodosPagina(event: Event) {
    const marcado = (event.target as HTMLInputElement).checked;
    this.selecionados.update(sel => {
      const n = new Set(sel);
      this.paginaAtual().forEach(f => { if (marcado) n.add(f.numero); else n.delete(f.numero); });
      return n;
    });
  }
  limparSelecao() { this.selecionados.set(new Set()); }

  /** ===== Ações em lote (barra de seleção) ===== */
  /**
   * Atualiza o status localmente após confirmação na barra em lote.
   * Substitua por chamada REST quando o backend expuser endpoint de bulk-update.
   */
  marcarComoPagaSelecionadas() {
    this.todas.update(lista => lista.map(f => this.selecionados().has(f.numero) ? { ...f, status: 'Paga' } : f));
    this.limparSelecao();
  }
  exportarSelecionadas() {
    // Placeholder: apenas loga; mantenha alinhado com `ExportService` ao implementar.
    console.log('Exportar', Array.from(this.selecionados()));
  }
  excluirSelecionadas() {
    const set = this.selecionados();
    this.todas.update(lista => lista.filter(f => !set.has(f.numero)));
  this.notificacao.sucesso('Faturas excluídas');
    this.limparSelecao();
    this.pagina.set(1);
  }
  async excluirSelecionadasConfirm() {
  const ok = await this.dialogo.solicitarConfirmacao({ titulo:'Excluir Faturas', mensagem:`Confirmar exclusão de ${this.selecionados().size} fatura(s)?`, confirmar:'Excluir', cancelar:'Cancelar' });
    if (ok) this.excluirSelecionadas();
  }

  /** ===== Ações individuais por linha ===== */
  verFatura(f: Fatura) {
    this.navegarParaServicoRelacionado(f, 'visualizar');
  }
  editarFatura(f: Fatura) {
    this.navegarParaServicoRelacionado(f, 'editar');
  }
  duplicarFatura(f: Fatura) {
    const copia = { ...f, numero: f.numero + '-DUP' };
    this.todas.update(lista => [copia, ...lista]);
  }
  excluirFatura(f: Fatura) {
    this.todas.update(lista => lista.filter(x => x.numero !== f.numero));
    this.selecionados.update(sel => { const n = new Set(sel); n.delete(f.numero); return n; });
  this.notificacao.sucesso('Fatura excluída');
  }
  async excluirFaturaConfirm(f: Fatura) {
  const ok = await this.dialogo.solicitarConfirmacao({ titulo:'Excluir Fatura', mensagem:`Deseja excluir ${f.numero}?`, confirmar:'Excluir', cancelar:'Cancelar' });
    if (ok) this.excluirFatura(f);
  }
  baixarPdf(f: Fatura) { console.log('Baixar PDF', f.numero); }
  gerarCertificado(f: Fatura) {
    console.log('Gerar certificado', f.numero);
    this.notificacao.sucesso(`Certificado gerado para ${f.numero}`);
  }
  criarFatura() {
    this.abrirModalNovoFaturamento();
  }

  /** ===== Modal "Novo faturamento" ===== */
  abrirModalNovoFaturamento() {
    if (this.servicosModalElegiveis().length === 0) {
      this.notificacao.mostrar('Não existem ordens de serviço aptas para faturamento no momento.', 'info');
      return;
    }
    this.buscaServicosModal.set('');
    this.servicosSelecionadosModal.set(new Set());
    this.statusDestinoModal.set('AGUARDANDO_PAGAMENTO');
    this.modalNovoFaturamento.set(true);
  }

  fecharModalNovoFaturamento() {
    this.modalNovoFaturamento.set(false);
  }

  atualizarBuscaServicosModal(valor: string) {
    this.buscaServicosModal.set(valor);
  }

  submeterBuscaServicosModal() {
    this.buscaServicosModal.set(this.buscaServicosModal().trim());
  }

  definirStatusDestinoModal(destino: string) {
    const normalizado: StatusDestinoFaturamento = destino === 'FATURADO' ? 'FATURADO' : 'AGUARDANDO_PAGAMENTO';
    this.statusDestinoModal.set(normalizado);
  }

  servicoSelecionado(id: string) {
    return this.servicosSelecionadosModal().has(id);
  }

  alternarSelecaoServico(id: string) {
    this.servicosSelecionadosModal.update((selecionados) => {
      const proximo = new Set(selecionados);
      proximo.has(id) ? proximo.delete(id) : proximo.add(id);
      return proximo;
    });
  }

  alternarSelecaoServicoPorTecla(event: Event, id: string) {
    event.preventDefault();
    this.alternarSelecaoServico(id);
  }

  alternarTodosServicosVisiveis(event: Event) {
    const marcado = (event.target as HTMLInputElement).checked;
    const idsVisiveis = this.servicosModalFiltrados().map((servico) => servico.id);
    this.servicosSelecionadosModal.update((selecionados) => {
      const proximo = new Set(selecionados);
      idsVisiveis.forEach((id) => {
        if (marcado) proximo.add(id);
        else proximo.delete(id);
      });
      return proximo;
    });
  }

  limparSelecaoServicosModal() {
    this.servicosSelecionadosModal.set(new Set());
  }

  /**
   * Consolida a seleção do modal, aplica o status escolhido e gera faturas derivadas.
   * Se passar a depender de API, reutilize a mesma lista `ids` e reaplique os sinais após o POST.
   */
  confirmarNovoFaturamento() {
    const ids = Array.from(this.servicosSelecionadosModal());
    if (ids.length === 0) {
      this.notificacao.mostrar('Selecione ao menos uma ordem de serviço para faturar.', 'info');
      return;
    }
    const destino = this.statusDestinoModal();
    const servicosSelecionados = this.servicosParaFaturamento().filter((servico) => ids.includes(servico.id));
    if (!servicosSelecionados.length) {
      this.notificacao.mostrar('As ordens selecionadas não estão mais disponíveis.', 'info');
      this.limparSelecaoServicosModal();
      this.modalNovoFaturamento.set(false);
      return;
    }

    this.servicosParaFaturamento.update((lista) =>
      lista.map((servico) => (ids.includes(servico.id) ? { ...servico, status: destino } : servico))
    );
    this.servicosOrigem.update((lista) =>
      lista.map((servico) => (ids.includes(servico.id) ? { ...servico, status: destino } : servico))
    );

    const statusFatura = this.destinoParaStatusFatura(destino);
    const novasFaturas = servicosSelecionados.map((servico) => this.criarFaturaParaServico(servico, statusFatura));

    this.todas.update((lista) => {
      const atualizadas = lista.map((fatura) =>
        fatura.servicoId && ids.includes(fatura.servicoId)
          ? { ...fatura, status: statusFatura }
          : fatura
      );
      if (!novasFaturas.length) {
        return atualizadas;
      }
      return [...novasFaturas, ...atualizadas];
    });

    if (novasFaturas.length) {
      this.notificacao.sucesso(`${novasFaturas.length} faturamento(s) gerado(s) e ordens atualizadas para ${this.statusServicoLabel(destino)}.`);
      this.pagina.set(1);
    } else {
      this.notificacao.mostrar('Nenhum faturamento foi gerado.', 'info');
    }

    this.limparSelecaoServicosModal();
    this.modalNovoFaturamento.set(false);
  }

  statusServicoLabel(status: StatusServico | StatusDestinoFaturamento) {
    const mapa: Record<string, string> = {
      ABERTO: 'Aberto',
      EM_ANDAMENTO: 'Em andamento',
      AGUARDANDO_PAGAMENTO: 'Aguardando pagamento',
      FATURADO: 'Faturado',
      CONCLUIDO: 'Concluído',
      CANCELADO: 'Cancelado',
    };
    return mapa[status] || status;
  }

  statusBadgeStyle(status: StatusServico | StatusDestinoFaturamento) {
    return this.statusBadgePaleta[status] ?? this.statusBadgePaleta['DEFAULT'];
  }

  private destinoParaStatusFatura(destino: StatusDestinoFaturamento): Fatura['status'] {
    return destino === 'FATURADO' ? 'Paga' : 'Pendente';
  }

  private criarFaturaParaServico(servico: ServicoParaFaturamento, statusFatura: Fatura['status']): Fatura {
    return {
      numero: this.gerarNumeroFatura(),
      cliente: servico.cliente,
      servico: servico.descricao || 'Serviço',
      data: servico.data ?? new Date().toISOString().substring(0, 10),
      valor: this.formatarMoeda(servico.valorTotal),
      status: statusFatura,
      servicoId: servico.id,
    };
  }

  private gerarNumeroFatura(): string {
    const regex = /#INV-AS-(\d{4})-(\d+)/;
    let anoRef = new Date().getFullYear();
    let maior = 99;
    for (const f of this.todas()) {
      const match = f.numero.match(regex);
      if (match) {
        anoRef = Number(match[1]) || anoRef;
        maior = Math.max(maior, Number(match[2]));
      }
    }
    const proximo = maior + 1;
    return `#INV-AS-${anoRef}-${String(proximo).padStart(3, '0')}`;
  }

  private localizarServicoRelacionado(f: Fatura): ServicoRelatorio | null {
    const servicos = this.servicosOrigem();
    if (f.servicoId) {
      const encontrado = servicos.find((servico) => servico.id === f.servicoId);
      if (encontrado) {
        return encontrado;
      }
    }
    if (f.numero) {
      const porNota = servicos.find((servico) => servico.notaFiscal === f.numero);
      if (porNota) {
        return porNota;
      }
      const porOrdem = servicos.find((servico) => servico.ordemServico === f.numero);
      if (porOrdem) {
        return porOrdem;
      }
    }
    return null;
  }

  private navegarParaServicoRelacionado(f: Fatura, modo: 'visualizar' | 'editar'): void {
    const servico = this.localizarServicoRelacionado(f);
    if (servico) {
      const mensagem = modo === 'editar'
        ? `Editando serviço ${servico.id}`
        : `Visualizando serviço ${servico.id}`;
  this.notificacao.mostrar(mensagem, 'info');
      const destino = modo === 'editar'
        ? ['/servicos', servico.id, 'editar']
        : ['/servicos', servico.id];
      this.router.navigate(destino);
      return;
    }

  this.notificacao.mostrar('Não encontramos um serviço vinculado. Abra um novo cadastro.', 'info');
    this.router.navigate(['/servicos/novo']);
  }

  classeStatus(s: Fatura['status']): string {
    return s === 'Paga'
      ? 'bg-green-100 text-green-800'
      : s === 'Pendente'
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-red-100 text-red-800';
  }

  // --- Dynamic Header integration ---
  private header = inject(HeaderService);
  private dialogo = inject(DialogoService);
  private router = inject(Router);
  private headerActionsEffect = effect(() => {
    const _toggle = this.mostrarFiltros();
    const _total = this.filtradas().length;
    this.header.actions.set(this.obterAcoesHeader());
  });
  private headerSearchEffect = effect(() => {
    const termo = this.filtro().termo;
    const config = this.header.search();
    if (!config) return;
    if (config.value === termo) return;
    this.header.patchSearch({ value: termo });
  });
  ngOnInit(): void {
    this.configurarHeader();
    void this.carregarServicos();
  }
  ngOnDestroy() { this.header.reset(); }
  private configurarHeader() {
    this.header.setHeader('Faturamento', this.obterAcoesHeader());
    this.header.setSearch({
      placeholder: 'Buscar faturamento (número ou cliente)',
      ariaLabel: 'Buscar faturamento',
      value: this.filtro().termo,
      onChange: (valor) => this.definirTermoBuscaRapida(valor),
      onSubmit: (valor) => this.definirTermoBuscaRapida(valor.trim()),
    });
  }

  /**
   * Carrega as OS do backend e alimenta tanto a tabela quanto o modal.
   * Substitua `ServicosDataService` caso passe a consumir endpoint dedicado.
   */
  private async carregarServicos(): Promise<void> {
    if (this.carregando()) {
      return;
    }
    this.carregando.set(true);
    try {
      const servicos = await this.servicosData.obterServicos();
      this.servicosOrigem.set(servicos);
      this.todas.set(this.transformarServicosEmFaturas(servicos));
      this.servicosParaFaturamento.set(this.montarServicosParaFaturamento(servicos));
    } catch (erro) {
      console.error('[FaturasComponent] Falha ao carregar serviços', erro);
      this.notificacao.erro('Não foi possível carregar os faturamentos.');
      this.todas.set([]);
      this.servicosParaFaturamento.set([]);
    } finally {
      this.carregando.set(false);
    }
  }

  /** Mantém a tabela sincronizada com `ServicoRelatorio`; ajuste campos ao criar novas colunas. */
  private transformarServicosEmFaturas(servicos: ServicoRelatorio[]): Fatura[] {
    return servicos.map((servico, indice) => ({
      numero: this.gerarIdentificadorParaServico(servico, indice),
      cliente: servico.empresa?.nome ?? 'Cliente não identificado',
      servico: (servico.descricaoPeca ?? servico.clienteCertificado ?? '').trim() || 'Serviço técnico',
      data: servico.data ?? new Date().toISOString().substring(0, 10),
      valor: this.formatarMoeda(Number(servico.valorTotal ?? 0)),
      status: this.mapearStatusParaFatura(servico),
      servicoId: servico.id,
    }));
  }

  /** Lista base do modal; atualize `elegiveis` quando regras de negócio aceitarem novos status. */
  private montarServicosParaFaturamento(servicos: ServicoRelatorio[]): ServicoParaFaturamento[] {
    const elegiveis: ReadonlySet<StatusServico> = new Set([
      'ORDEM_SERVICO',
      'FATURAMENTO',
    ]);
    return servicos
      .filter((servico) => elegiveis.has(servico.status))
      .map((servico) => ({
        id: servico.id,
        ordemServico: servico.ordemServico ?? servico.id,
        cliente: servico.empresa?.nome ?? 'Cliente não identificado',
        descricao: (servico.descricaoPeca ?? servico.clienteCertificado ?? '').trim() || 'Serviço técnico especializado',
        valorTotal: Number(servico.valorTotal ?? 0),
        status: servico.status,
        data: servico.data ?? new Date().toISOString().substring(0, 10),
        referencia: servico,
      }));
  }

  /** Normaliza status de serviço para rótulos do frontend; mantenha paridade com chips da tabela. */
  private mapearStatusParaFatura(servico: ServicoRelatorio): Fatura['status'] {
    const status = servico.status;
    if (status === 'FINALIZADO') {
      return 'Paga';
    }
    if (status === 'FATURAMENTO') {
      return 'Pendente';
    }
    const hoje = new Date();
    if (servico.dataVencimento) {
      const vencimento = new Date(servico.dataVencimento);
      if (!Number.isNaN(vencimento.getTime()) && vencimento < hoje) {
        return 'Vencida';
      }
    }
    return 'Pendente';
  }

  /**
   * Fallback para quando a OS não fornece número de NF/OS.
   * Alterar o padrão implica migrar `gerarNumeroFatura` e possíveis integrações externas.
   */
  private gerarIdentificadorParaServico(servico: ServicoRelatorio, indice: number): string {
    if (servico.notaFiscal) {
      return servico.notaFiscal;
    }
    if (servico.ordemServico) {
      return servico.ordemServico;
    }
    const dataBase = servico.data ?? new Date().toISOString().substring(0, 10);
    const ano = dataBase.slice(0, 4);
    const sufixo = servico.id.slice(-4).toUpperCase();
    return `#INV-${ano}-${String(indice + 1).padStart(3, '0')}-${sufixo}`;
  }

  /** Define o menu da barra superior; mantenha IDs estáveis para `HeaderService`. */
  private obterAcoesHeader() {
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
        disabled: () => this.filtradas().length === 0,
        execute: () => this.exportarTodas(),
      },
      {
        id: 'novo-faturamento',
        label: 'Novo faturamento',
        icon: 'fas fa-plus',
        variant: 'primario' as const,
        execute: () => this.abrirModalNovoFaturamento(),
      },
    ];
  }

  private definirTermoBuscaRapida(valor: string) {
    this.patchFiltro({ termo: valor });
  }

  /** Exporta com o formato padrão (csv); atualize `campos` ao alterar colunas visíveis. */
  private exportarTodas() {
    this.exportSvc.export('csv', this.filtradas(), this.colunasVisiveis().map(c=> ({ key:c.id, header:c.label })), 'faturas');
  this.notificacao.sucesso('Export solicitado');
  }
  exportarTodasFormato(formato: string) {
  this.notificacao.sucesso(`Export (${formato.toUpperCase()}) iniciado`);
    this.exportSvc.export(formato as any, this.filtradas(), this.colunasVisiveis().map(c=> ({ key:c.id, header:c.label })), 'faturas');
  }
  clicarOrdenacao(coluna: string, ev: Event) {
    ev.preventDefault();
    this.ordenacao.update(o => {
      if (o.coluna !== coluna) return { coluna, direcao: 'asc' };
      const prox = o.direcao==='asc' ? 'desc' : o.direcao==='desc' ? 'none' : 'asc';
      return { coluna, direcao: prox };
    });
  }
  // export moved to ExportService
  percent(valor: number) {
    const total = this.filtradas().length || 1;
    return ((valor/total)*100).toFixed(0)+'%';
  }
  descricaoTotal() {
    const totalValor = this.analytics.totalValor();
    return 'Valor: ' + this.formatarMoeda(totalValor);
  }
  ticketMedioFormatado() {
    return this.formatarMoeda(this.analytics.valorMedio());
  }
  receitaTotalFormatada() {
    return this.formatarMoeda(this.analytics.totalValor());
  }

  private formatarMoeda(valor: number): string {
    return 'R$ ' + Number(valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  private valorNumerico(valor: string): number {
    if (!valor) return 0;
    const limpo = valor.replace(/R\$\s?/, '').replace(/\./g, '').replace(',', '.');
    const numero = Number.parseFloat(limpo);
    return Number.isFinite(numero) ? numero : 0;
  }
  private percentual(parte: number, total: number): string {
    if (!total || total <= 0) {
      return '0%';
    }
    return (parte / total * 100).toFixed(0) + '%';
  }

  // --- Gráficos ---
  // Prefer configs via DynamicInsightService but keep compatibility with legacy analytics for colors and helpers
  serieMensal = computed(()=> {
    const chart = this.insight.charts().find(c=> c.id==='mensal');
    return chart? chart.series : [];
  });
  xaxisMensal = computed(()=> {
    const chart = this.insight.charts().find(c=> c.id==='mensal');
    return chart?.xaxis || { categories: [] };
  });
  serieStatusValores = computed(()=> {
    const chart = this.insight.charts().find(c=> c.id==='status');
    if (!chart) return [] as number[];
    return Array.isArray(chart.series)? (chart.series as any[]) : [];
  });
  labelsStatus = computed(()=> {
    const chart = this.insight.charts().find(c=> c.id==='status');
    return (chart?.labels as any[]) || [];
  });
  colorsStatus = computed(()=> {
    const base: Record<string,string> = { Paga:'#059669', Pendente:'#d97706', Vencida:'#dc2626' };
    const sel = this.selectedStatusChart();
    return this.labelsStatus().map((l:any) => sel ? (l===sel? base[l] : '#d1d5db') : base[l]);
  });
  private statusResumo = computed(() => {
    const acumulado: Record<Fatura['status'], number> = { Paga: 0, Pendente: 0, Vencida: 0 };
    for (const f of this.filtradas()) {
      acumulado[f.status] = (acumulado[f.status] || 0) + this.valorNumerico(f.valor);
    }
    const total = Object.values(acumulado).reduce((acc, valor) => acc + valor, 0);
    const porStatus: Record<Fatura['status'], { valor: number; percentual: string }> = {
      Paga: { valor: acumulado.Paga, percentual: this.percentual(acumulado.Paga, total) },
      Pendente: { valor: acumulado.Pendente, percentual: this.percentual(acumulado.Pendente, total) },
      Vencida: { valor: acumulado.Vencida, percentual: this.percentual(acumulado.Vencida, total) },
    };
    return { porStatus, total };
  });
  legendaStatus = computed(() => {
    const resumo = this.statusResumo();
    return {
      show: true,
      position: 'bottom',
      horizontalAlign: 'left',
      fontSize: '13px',
      itemMargin: { horizontal: 14, vertical: 6 },
      labels: { colors: '#064e3b' },
      markers: { width: 10, height: 10, offsetX: -4 },
      formatter: (seriesName: string) => {
        const chave = seriesName as Fatura['status'];
        const item = resumo.porStatus[chave];
        if (!item) {
          return seriesName;
        }
        return `${seriesName}: ${this.formatarMoeda(item.valor)} | ${item.percentual}`;
      },
    };
  });
  serieAging = computed(()=> {
    const chart = this.insight.charts().find(c=> c.id==='aging');
    return chart? chart.series : [];
  });
  xaxisAging = computed(()=> {
    const chart = this.insight.charts().find(c=> c.id==='aging');
    return chart?.xaxis || { categories: [] };
  });

  // Interações dos gráficos
  filtrarPorStatus(evt: { indice: number; rotulo: string }) {
    const rotulo = evt.rotulo as Fatura['status'];
    if (!['Paga', 'Pendente', 'Vencida'].includes(rotulo)) return;
    if (this.selectedStatusChart() === rotulo) {
      this.selectedStatusChart.set(null);
      this.patchFiltro({ status: new Set() });
      this.notificacao.sucesso('Filtro de status: Todos');
    } else {
      this.selectedStatusChart.set(rotulo);
      this.patchFiltro({ status: new Set([rotulo]) });
      this.notificacao.sucesso('Filtro de status: ' + rotulo);
    }
  }

  filtrarPorMes(evt: { indice: number; categoria: string }) {
    const categoria = evt.categoria;
    if (!/^\d{4}-\d{2}$/.test(categoria)) return;
    if (this.selectedMonthChart() === categoria) {
      this.selectedMonthChart.set(null);
      this.patchFiltro({ dataInicio: '', dataFim: '' });
      this.notificacao.sucesso('Filtro mensal: Todos');
    } else {
      const [ano, mes] = categoria.split('-').map(valor => +valor);
      const inicio = new Date(ano, mes - 1, 1).toISOString().substring(0, 10);
      const fim = new Date(ano, mes, 0).toISOString().substring(0, 10);
      this.selectedMonthChart.set(categoria);
      this.patchFiltro({ dataInicio: inicio, dataFim: fim });
      this.notificacao.sucesso('Filtro mensal: ' + categoria);
    }
  }

  infoAging(evt: { indice: number; categoria: string }) {
    this.notificacao.sucesso('Faixa: ' + evt.categoria);
  }

  limparFiltrosGraficos() {
    this.selectedStatusChart.set(null);
    this.selectedMonthChart.set(null);
    this.patchFiltro({ status: new Set(), dataInicio: '', dataFim: '' });
    this.notificacao.sucesso('Filtros de gráficos limpos');
  }
  tooltipMensal = { y: { formatter: (val:number) => 'R$ '+ val.toLocaleString('pt-BR',{ minimumFractionDigits:2, maximumFractionDigits:2 }) } };
  tooltipStatus = { y: { formatter: (val:number) => {
    const total = this.serieStatusValores().reduce((a,b)=>a+b,0) || 1;
    const pct = (val/total*100).toFixed(1)+'%';
    return val + ' ('+pct+')';
  } } };
  tooltipAging = { y: { formatter: (val:number) => val + ' fatura(s)' } };
}

