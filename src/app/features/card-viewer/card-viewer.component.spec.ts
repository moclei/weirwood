import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardViewerComponent } from './card-viewer.component';

describe('CardViewerComponent', () => {
  let component: CardViewerComponent;
  let fixture: ComponentFixture<CardViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardViewerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CardViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
