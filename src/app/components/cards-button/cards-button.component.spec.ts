import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardsButtonComponent } from './cards-button.component';

describe('CardsButtonComponent', () => {
  let component: CardsButtonComponent;
  let fixture: ComponentFixture<CardsButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardsButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CardsButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
