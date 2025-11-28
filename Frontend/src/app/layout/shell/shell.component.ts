import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BarraLateralComponent } from '../barra-lateral/barra-lateral.component';
import { BarraSuperiorComponent } from '../barra-superior/barra-superior.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [BarraLateralComponent, BarraSuperiorComponent, RouterOutlet],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  recolhida = signal(false);

  alternarSidebar() {
    this.recolhida.update(valor => !valor);
  }
}
