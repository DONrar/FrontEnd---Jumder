import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TorneoFormPage } from './torneo-form.page';

describe('TorneoFormPage', () => {
  let component: TorneoFormPage;
  let fixture: ComponentFixture<TorneoFormPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TorneoFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
