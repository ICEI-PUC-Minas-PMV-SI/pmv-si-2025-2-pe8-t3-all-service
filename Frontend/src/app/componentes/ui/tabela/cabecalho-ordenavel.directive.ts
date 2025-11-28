import { Directive, HostBinding, HostListener, Input, signal } from '@angular/core';

@Directive({
  selector: '[asOrdenavel]',
  standalone: true,
})
export class CabecalhoOrdenavelDirective {
  @Input('asOrdenavel') coluna = '';
  readonly ordem = signal<'asc'|'desc'|'none'>('none');
  @HostBinding('class.cursor-pointer') cursor = true;
  @HostBinding('class.select-none') selecionar = true;
  @HostBinding('class.relative') relativo = true;

  @HostListener('click') alternar() {
    this.ordem.set(this.ordem()==='none' ? 'asc' : this.ordem()==='asc' ? 'desc' : 'none');
  }
}
