import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstanceBoxComponent } from './instance-box.component';

describe('InstanceBoxComponent', () => {
  let component: InstanceBoxComponent;
  let fixture: ComponentFixture<InstanceBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstanceBoxComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InstanceBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
