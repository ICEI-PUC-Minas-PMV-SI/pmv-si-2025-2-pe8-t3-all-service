import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartaoEstatisticaComponent } from './cartao-estatistica.component';

describe('CartaoEstatisticaComponent', () => {
  let component: CartaoEstatisticaComponent;
  let fixture: ComponentFixture<CartaoEstatisticaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartaoEstatisticaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartaoEstatisticaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
