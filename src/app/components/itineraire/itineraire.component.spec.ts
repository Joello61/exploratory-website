import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItineraireComponent } from './itineraire.component';

describe('ItineraireComponent', () => {
  let component: ItineraireComponent;
  let fixture: ComponentFixture<ItineraireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItineraireComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItineraireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
