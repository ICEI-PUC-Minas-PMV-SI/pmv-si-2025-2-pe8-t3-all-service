import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtalhoContaComponent } from './atalho-conta.component';

describe('AtalhoContaComponent', () => {
  let component: AtalhoContaComponent;
  let fixture: ComponentFixture<AtalhoContaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtalhoContaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AtalhoContaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
