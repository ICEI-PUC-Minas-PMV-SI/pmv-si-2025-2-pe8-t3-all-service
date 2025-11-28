import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RelatoriosServicosComponent } from './relatorios-servicos.component';

describe('RelatoriosServicosComponent', () => {
  let component: RelatoriosServicosComponent;
  let fixture: ComponentFixture<RelatoriosServicosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelatoriosServicosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RelatoriosServicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset chart-driven filters when limparInteracoesGraficas is invoked', () => {
    component.filtrarPorMes({ category: '2024-02' });
    const primeiroImposto = component.labelsDistribuicaoImposto()[0];
    if (primeiroImposto) {
      component.filtrarPorImposto({ label: primeiroImposto });
    }

    component.limparInteracoesGraficas();

    expect(component.mesSelecionado()).toBeNull();
    expect(component.impostoSelecionado()).toBeNull();
  });
});
