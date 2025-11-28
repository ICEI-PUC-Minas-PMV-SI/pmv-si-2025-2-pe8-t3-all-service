import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { formatarEnum, ServicoRelatorio, TipoImposto, TIPOS_IMPOSTO_OPCOES } from '../../../../shared/data/servicos.model';

export interface CalculoImpostoConfig {
  porcentagem: number;
  tipoImposto: TipoImposto;
  periodo: 'LAST_15' | 'LAST_30' | 'LAST_60' | 'LAST_90' | 'CUSTOM';
  dataInicio?: string;
  dataFim?: string;
}

export interface ResumoCalculo {
  servicosAfetados: number;
  valorBrutoTotal: number;
  impostoAnterior: number;
  impostoNovo: number;
  diferencaImposto: number;
  liquidoAnterior: number;
  liquidoNovo: number;
}

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
});

@Component({
  selector: 'app-calculo-imposto-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calculo-imposto-modal.component.html',
  styleUrls: ['./calculo-imposto-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculoImpostoModalComponent {
  readonly fechar = output<void>();
  readonly aplicar = output<CalculoImpostoConfig>();
  
  // Input: current services data for preview calculations
  readonly servicos = input<ServicoRelatorio[]>([]);

  // Form state
  readonly porcentagem = signal<number | null>(null);
  readonly tipoImpostoSelecionado = signal<TipoImposto>('ISS');
  readonly periodoSelecionado = signal<'LAST_15' | 'LAST_30' | 'LAST_60' | 'LAST_90' | 'CUSTOM'>('LAST_30');
  readonly dataInicio = signal<string>('');
  readonly dataFim = signal<string>('');

  readonly tiposImposto = TIPOS_IMPOSTO_OPCOES;

  readonly periodos = [
    { valor: 'LAST_15', label: 'Últimos 15 dias' },
    { valor: 'LAST_30', label: 'Últimos 30 dias' },
    { valor: 'LAST_60', label: 'Últimos 60 dias' },
    { valor: 'LAST_90', label: 'Últimos 90 dias' },
    { valor: 'CUSTOM', label: 'Personalizado' },
  ];

  readonly mostrarCampoData = computed(() => this.periodoSelecionado() === 'CUSTOM');

  readonly formularioValido = computed(() => {
    const porc = this.porcentagem();
    if (porc === null || porc < 0 || porc > 100) return false;
    if (this.periodoSelecionado() === 'CUSTOM') {
      return !!this.dataInicio() && !!this.dataFim();
    }
    return true;
  });

  // Computed: Calculate date range based on selected period
  private readonly rangeData = computed(() => {
    const periodo = this.periodoSelecionado();
    const hoje = new Date();
    
    if (periodo === 'CUSTOM') {
      return {
        inicio: this.dataInicio(),
        fim: this.dataFim(),
      };
    }
    
    const dias = periodo === 'LAST_15' ? 15 : periodo === 'LAST_30' ? 30 : periodo === 'LAST_60' ? 60 : 90;
    const dataInicial = new Date(hoje);
    dataInicial.setDate(dataInicial.getDate() - dias);
    
    return {
      inicio: dataInicial.toISOString().split('T')[0],
      fim: hoje.toISOString().split('T')[0],
    };
  });

  // Computed: Filter services that will be affected
  private readonly servicosAfetados = computed(() => {
    const tipoImposto = this.tipoImpostoSelecionado();
    const { inicio, fim } = this.rangeData();
    
    if (!inicio || !fim) return [];
    
    return this.servicos().filter(servico => 
      servico.imposto === tipoImposto &&
      servico.data >= inicio &&
      servico.data <= fim
    );
  });

  // Computed: Preview calculation with live updates
  readonly previewCalculo = computed<ResumoCalculo>(() => {
    const servicosAfet = this.servicosAfetados();
    const porcentagem = this.porcentagem();
    
    if (servicosAfet.length === 0 || porcentagem === null) {
      return {
        servicosAfetados: 0,
        valorBrutoTotal: 0,
        impostoAnterior: 0,
        impostoNovo: 0,
        diferencaImposto: 0,
        liquidoAnterior: 0,
        liquidoNovo: 0,
      };
    }
    
    const valorBrutoTotal = servicosAfet.reduce((acc, s) => acc + s.valorTotal, 0);
    const impostoAnterior = servicosAfet.reduce((acc, s) => acc + s.valorImposto, 0);
    const impostoNovo = valorBrutoTotal * (porcentagem / 100);
    const diferencaImposto = impostoNovo - impostoAnterior;
    const liquidoAnterior = valorBrutoTotal - impostoAnterior;
    const liquidoNovo = valorBrutoTotal - impostoNovo;
    
    return {
      servicosAfetados: servicosAfet.length,
      valorBrutoTotal,
      impostoAnterior,
      impostoNovo,
      diferencaImposto,
      liquidoAnterior,
      liquidoNovo,
    };
  });

  fecharModal(): void {
    this.fechar.emit();
  }

  aplicarCalculo(): void {
    if (!this.formularioValido()) return;

    const config: CalculoImpostoConfig = {
      porcentagem: this.porcentagem()!,
      tipoImposto: this.tipoImpostoSelecionado(),
      periodo: this.periodoSelecionado(),
      dataInicio: this.dataInicio(),
      dataFim: this.dataFim(),
    };

    this.aplicar.emit(config);
  }

  formatarEnum(valor: string): string {
    return formatarEnum(valor);
  }

  formatarMoeda(valor: number): string {
    return formatadorMoeda.format(valor);
  }

  abs(valor: number): number {
    return Math.abs(valor);
  }
}
