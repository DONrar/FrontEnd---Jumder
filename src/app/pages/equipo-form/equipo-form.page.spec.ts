import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EquipoFormPage } from './equipo-form.page';

describe('EquipoFormPage', () => {
  let component: EquipoFormPage;
  let fixture: ComponentFixture<EquipoFormPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EquipoFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
