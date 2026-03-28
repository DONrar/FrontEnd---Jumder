import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JugadorFormPage } from './jugador-form.page';

describe('JugadorFormPage', () => {
  let component: JugadorFormPage;
  let fixture: ComponentFixture<JugadorFormPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(JugadorFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
