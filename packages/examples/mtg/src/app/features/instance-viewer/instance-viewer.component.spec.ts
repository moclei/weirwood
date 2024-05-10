import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstanceViewerComponent } from './instance-viewer.component';

describe('InstanceViewerComponent', () => {
  let component: InstanceViewerComponent;
  let fixture: ComponentFixture<InstanceViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstanceViewerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InstanceViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
