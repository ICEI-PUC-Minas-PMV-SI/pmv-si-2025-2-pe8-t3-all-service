import { Injectable, signal } from '@angular/core';

/**
 * Tipo de ação do cabeçalho
 * Define os botões e ações disponíveis no header da aplicação
 */
export type HeaderAction = {
  id?: string;
  label: string;
  icon?: string;
  variant?: 'primario' | 'secundario' | 'fantasma' | 'link';
  disabled?: boolean | (() => boolean);
  execute: () => void;
  className?: string;
};

export type HeaderSearchConfig = {
  placeholder?: string;
  ariaLabel?: string;
  hint?: string;
  icon?: string;
  value?: string;
  onChange?: (valor: string) => void;
  onSubmit?: (valor: string) => void;
};

/**
 * Serviço de gerenciamento do cabeçalho da aplicação
 * Controla o título e ações exibidas no header de forma reativa usando signals
 */
@Injectable({ providedIn: 'root' })
export class HeaderService {
  /** Título atual exibido no cabeçalho */
  readonly title = signal<string>('AllService • Painel');
  
  /** Ações (botões) disponíveis no cabeçalho */
  readonly actions = signal<HeaderAction[]>([]);

  /** Configuração opcional da barra de busca no cabeçalho */
  readonly search = signal<HeaderSearchConfig | null>(null);

  /**
   * Define o título e ações do cabeçalho
   * @param title - Título a ser exibido
   * @param actions - Lista de ações/botões disponíveis
   */
  setHeader(title: string, actions: HeaderAction[] = []): void {
    this.title.set(title);
    this.actions.set(actions);
  }

  /**
   * Define a configuração da barra de busca central do cabeçalho.
   */
  setSearch(config: HeaderSearchConfig | null): void {
    this.search.set(config);
  }

  /** Atualiza parcialmente a configuração da busca preservando callbacks. */
  patchSearch(partial: Partial<HeaderSearchConfig>): void {
    const atual = this.search();
    if (!atual) return;
    const atualizado = { ...atual, ...partial };
    const mudou = Object.keys(partial).some((chave) => (atual as any)[chave] !== (atualizado as any)[chave]);
    if (!mudou) return;
    this.search.set(atualizado);
  }

  /**
   * Reseta o cabeçalho para o estado padrão
   */
  reset(): void {
    this.setHeader('AllService • Painel', []);
    this.search.set(null);
  }

  /**
   * Define o título baseado no caminho da rota atual
   * @param path - Caminho da rota (ex: '/clientes', '/ordens')
   */
  setTitleForPath(path: string): void {
    const mapa: Record<string, string> = {
      'dashboard': 'Resumo',
      'faturas': 'Faturamento',
      'servicos': 'Serviços',
      'clientes': 'Clientes',
      'ordens': 'Ordens de Serviço',
      'relatorios': 'Relatórios',
      'conta': 'Minha Conta',
      'usuarios': 'Usuários',
    };
    
    // Remove barra inicial e query params/hash
    const clean = path.replace(/^\//, '').split(/[?#]/)[0];
    const base = clean.split('/')[0];
    
    if (mapa[base]) {
      this.title.set(mapa[base]);
    }
  }
}
