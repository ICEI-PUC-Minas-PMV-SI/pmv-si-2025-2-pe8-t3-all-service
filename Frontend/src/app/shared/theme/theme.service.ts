import { effect, Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly STORAGE_KEY = 'app-theme';
  
  // Signal para o tema atual
  readonly currentTheme = signal<Theme>(this.getInitialTheme());
  
  constructor() {
    // Effect para aplicar o tema no documento
    effect(() => {
      const theme = this.currentTheme();
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(this.STORAGE_KEY, theme);
    });
  }
  
  /**
   * Obtém o tema inicial do localStorage ou preferência do sistema
   */
  private getInitialTheme(): Theme {
    // 1. Tenta obter do localStorage
    const stored = localStorage.getItem(this.STORAGE_KEY) as Theme;
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    
    // 2. Detecta preferência do sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    // 3. Default para light
    return 'light';
  }
  
  /**
   * Alterna entre light e dark
   */
  toggleTheme(): void {
    this.currentTheme.update(current => current === 'light' ? 'dark' : 'light');
  }
  
  /**
   * Define um tema específico
   */
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
  }
  
  /**
   * Retorna se o tema atual é dark
   */
  isDark(): boolean {
    return this.currentTheme() === 'dark';
  }
}
