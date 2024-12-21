import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonnaliteComponent } from './personnalite.component';

describe('PersonnaliteComponent', () => {
  let component: PersonnaliteComponent;
  let fixture: ComponentFixture<PersonnaliteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonnaliteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonnaliteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
