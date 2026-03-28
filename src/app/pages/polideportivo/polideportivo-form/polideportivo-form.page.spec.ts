import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolideportivoFormPage } from './polideportivo-form.page';

describe('PolideportivoFormPage', () => {
  let component: PolideportivoFormPage;
  let fixture: ComponentFixture<PolideportivoFormPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PolideportivoFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
