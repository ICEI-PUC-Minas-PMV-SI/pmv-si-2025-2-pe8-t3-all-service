import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ServicoDetalheComponent } from './servico-detalhe.component';

describe('ServicoDetalheComponent', () => {
  let component: ServicoDetalheComponent;
  let fixture: ComponentFixture<ServicoDetalheComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicoDetalheComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ServicoDetalheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });
});
