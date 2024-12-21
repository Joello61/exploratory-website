import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CentresInteretComponent } from './centres-interet.component';

describe('CentresInteretComponent', () => {
  let component: CentresInteretComponent;
  let fixture: ComponentFixture<CentresInteretComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CentresInteretComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CentresInteretComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
