import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotivationSocioProComponent } from './motivation-socio-pro.component';

describe('MotivationSocioProComponent', () => {
  let component: MotivationSocioProComponent;
  let fixture: ComponentFixture<MotivationSocioProComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MotivationSocioProComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MotivationSocioProComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
