import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaturasComponent } from './faturas.component';

describe('FaturasComponent', () => {
  let component: FaturasComponent;
  let fixture: ComponentFixture<FaturasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaturasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaturasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
